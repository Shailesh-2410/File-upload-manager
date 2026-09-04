import { BehaviorSubject, Subject } from 'rxjs';
import { UploadItem, UploadStatus } from '../types';

export interface EngineConfig {
  maxConcurrency: number;
  defaultChunkSize: number; // bytes
  simulatedSpeedBps: number; // bytes per second simulation (e.g. 1.5MB/s)
  networkErrorRate: number; // 0 to 1 (e.g. 0.05)
}

const DEFAULT_CONFIG: EngineConfig = {
  maxConcurrency: 3,
  defaultChunkSize: 512 * 1024, // 512 KB chunks
  simulatedSpeedBps: 2 * 1024 * 1024, // 2 MB/s
  networkErrorRate: 0,
};

class UploadEngine {
  private config: EngineConfig = { ...DEFAULT_CONFIG };
  private items: Map<string, UploadItem> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  
  // RxJS Streams
  public queue$: BehaviorSubject<UploadItem[]> = new BehaviorSubject<UploadItem[]>([]);
  public itemEvents$: Subject<{ id: string; event: 'progress' | 'completed' | 'failed' | 'cancelled' | 'resumed' | 'started'; item: UploadItem }> = new Subject();
  
  private isProcessing = false;
  private onFileCompletedCallback?: (item: UploadItem) => void;

  constructor(config?: Partial<EngineConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public setOnCompleted(cb: (item: UploadItem) => void) {
    this.onFileCompletedCallback = cb;
  }

  public setConfig(newConfig: Partial<EngineConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processQueue();
  }

  public getConfig(): EngineConfig {
    return { ...this.config };
  }

  public getItems(): UploadItem[] {
    return Array.from(this.items.values());
  }

  public getItem(id: string): UploadItem | undefined {
    return this.items.get(id);
  }

  private emitState() {
    this.queue$.next(Array.from(this.items.values()));
  }

  /**
   * Add multiple files to the upload queue.
   */
  public addFiles(
    files: Array<{ name: string; size: number; type: string; fileObj?: File; simulateFailureChunk?: number }>,
    targetFolderId: string | null = null
  ): string[] {
    const ids: string[] = [];

    files.forEach((f) => {
      const id = `upl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const safeSize = Math.max(f.size, 1024); // at least 1KB
      
      // Calculate chunks based on size
      let chunkSize = this.config.defaultChunkSize;
      let chunksTotal = Math.ceil(safeSize / chunkSize);
      
      // Ensure at least 3-6 chunks for smooth progress animation if size > 1MB
      if (safeSize > 1024 * 1024 && chunksTotal < 4) {
        chunkSize = Math.floor(safeSize / 4);
        chunksTotal = Math.ceil(safeSize / chunkSize);
      }

      let previewUrl: string | undefined;
      if (f.fileObj && f.fileObj.type.startsWith('image/')) {
        try {
          previewUrl = URL.createObjectURL(f.fileObj);
        } catch {
          // fallback
        }
      }

      const item: UploadItem = {
        id,
        name: f.name,
        size: safeSize,
        type: f.type || 'application/octet-stream',
        status: 'pending',
        progress: 0,
        uploadedBytes: 0,
        chunksTotal: Math.max(chunksTotal, 1),
        chunksUploaded: 0,
        chunkSize,
        speed: 0,
        timeRemaining: 0,
        targetFolderId,
        createdAt: Date.now(),
        fileObj: f.fileObj,
        previewUrl,
        simulateFailureChunk: f.simulateFailureChunk,
      };

      this.items.set(id, item);
      ids.push(id);
    });

    this.emitState();
    this.processQueue();
    return ids;
  }

  /**
   * Concurrency controller: processes up to maxConcurrency (3) files concurrently.
   */
  public processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const activeCount = Array.from(this.items.values()).filter(
        (it) => it.status === 'uploading'
      ).length;

      const availableSlots = this.config.maxConcurrency - activeCount;

      if (availableSlots > 0) {
        // Find next pending items
        const pendingItems = Array.from(this.items.values())
          .filter((it) => it.status === 'pending')
          .slice(0, availableSlots);

        for (const item of pendingItems) {
          this.startUpload(item.id);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start or resume uploading a specific item.
   */
  public async startUpload(id: string) {
    const item = this.items.get(id);
    if (!item) return;

    if (item.status === 'uploading' || item.status === 'completed') {
      return;
    }

    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);

    // Update state to uploading
    item.status = 'uploading';
    item.startedAt = item.startedAt || Date.now();
    item.error = undefined;
    this.emitState();
    this.itemEvents$.next({ id, event: 'started', item });

    // Begin chunked upload loop
    this.executeChunkedUpload(id, abortController.signal);
  }

  private async executeChunkedUpload(id: string, signal: AbortSignal) {
    const item = this.items.get(id);
    if (!item) return;

    const startTime = Date.now();
    let lastBytes = item.uploadedBytes;
    let lastTime = startTime;

    try {
      while (item.chunksUploaded < item.chunksTotal) {
        if (signal.aborted) {
          throw new DOMException('Upload aborted by user', 'AbortError');
        }

        const currentChunkIndex = item.chunksUploaded + 1;

        // Check for simulated failure injection for testing resume
        if (
          item.simulateFailureChunk &&
          currentChunkIndex === item.simulateFailureChunk
        ) {
          item.simulateFailureChunk = undefined; // clear so resume works next time
          throw new Error(`Simulated network drop at chunk ${currentChunkIndex}/${item.chunksTotal}`);
        }

        // Check random network error rate if configured
        if (this.config.networkErrorRate > 0 && Math.random() < this.config.networkErrorRate) {
          throw new Error('Network connection timeout (Simulated error)');
        }

        // Calculate chunk size for this specific chunk
        const remainingBytes = item.size - item.uploadedBytes;
        const currentChunkBytes = Math.min(item.chunkSize, remainingBytes);

        // Simulate transmission latency proportional to chunk size & speed
        // e.g. 512KB at 2MB/s = 250ms
        const baseLatencyMs = Math.max(120, Math.floor((currentChunkBytes / this.config.simulatedSpeedBps) * 1000));
        // Add minor jitter (+/- 15%)
        const jitter = (Math.random() * 0.3 - 0.15) * baseLatencyMs;
        const sleepMs = Math.max(60, Math.floor(baseLatencyMs + jitter));

        await this.delay(sleepMs, signal);

        // Upload chunk successful
        item.chunksUploaded += 1;
        item.uploadedBytes = Math.min(item.size, item.uploadedBytes + currentChunkBytes);
        item.progress = Math.min(100, Math.round((item.uploadedBytes / item.size) * 100));

        // Calculate dynamic upload speed and ETA
        const now = Date.now();
        const timeDiffSec = (now - lastTime) / 1000;
        if (timeDiffSec > 0.1) {
          const bytesDiff = item.uploadedBytes - lastBytes;
          item.speed = Math.round(bytesDiff / timeDiffSec);
          const bytesLeft = item.size - item.uploadedBytes;
          item.timeRemaining = item.speed > 0 ? Math.ceil(bytesLeft / item.speed) : 0;
          lastBytes = item.uploadedBytes;
          lastTime = now;
        }

        this.emitState();
        this.itemEvents$.next({ id, event: 'progress', item });
      }

      // Upload successfully finished
      item.status = 'completed';
      item.progress = 100;
      item.uploadedBytes = item.size;
      item.speed = 0;
      item.timeRemaining = 0;
      item.completedAt = Date.now();

      this.abortControllers.delete(id);
      this.emitState();
      this.itemEvents$.next({ id, event: 'completed', item });

      if (this.onFileCompletedCallback) {
        this.onFileCompletedCallback(item);
      }
    } catch (err: unknown) {
      this.abortControllers.delete(id);

      if (signal.aborted) {
        // Was cancelled or paused
        if (item.status !== 'paused') {
          item.status = 'cancelled';
        }
        item.speed = 0;
        item.timeRemaining = 0;
        this.emitState();
        this.itemEvents$.next({ id, event: 'cancelled', item });
      } else {
        // Failed
        item.status = 'failed';
        item.error = err instanceof Error ? err.message : 'Unknown upload error';
        item.speed = 0;
        item.timeRemaining = 0;
        this.emitState();
        this.itemEvents$.next({ id, event: 'failed', item });
      }
    } finally {
      // Slot freed! Process next pending in queue
      this.processQueue();
    }
  }

  /**
   * Cancel an upload (pending or uploading).
   */
  public cancelUpload(id: string) {
    const item = this.items.get(id);
    if (!item) return;

    if (item.status === 'uploading') {
      const controller = this.abortControllers.get(id);
      if (controller) {
        controller.abort();
      }
    } else if (item.status === 'pending') {
      item.status = 'cancelled';
      item.speed = 0;
      item.timeRemaining = 0;
      this.emitState();
      this.itemEvents$.next({ id, event: 'cancelled', item });
      this.processQueue();
    }
  }

  /**
   * Pause an upload without losing chunk progress.
   */
  public pauseUpload(id: string) {
    const item = this.items.get(id);
    if (!item || item.status !== 'uploading') return;

    item.status = 'paused';
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
    }
    this.emitState();
    this.processQueue();
  }

  /**
   * Resume a paused or failed upload from the LAST uploaded chunk (Bonus Requirement).
   */
  public resumeUpload(id: string) {
    const item = this.items.get(id);
    if (!item) return;

    if (item.status === 'failed' || item.status === 'paused' || item.status === 'cancelled') {
      // Keep item.chunksUploaded and item.uploadedBytes as they are!
      item.status = 'pending';
      item.error = undefined;
      this.emitState();
      this.itemEvents$.next({ id, event: 'resumed', item });
      this.processQueue();
    }
  }

  /**
   * Retry a failed upload from scratch or resume.
   */
  public retryUpload(id: string, restartFromBeginning = false) {
    const item = this.items.get(id);
    if (!item) return;

    if (restartFromBeginning) {
      item.chunksUploaded = 0;
      item.uploadedBytes = 0;
      item.progress = 0;
    }

    item.status = 'pending';
    item.error = undefined;
    this.emitState();
    this.processQueue();
  }

  /**
   * Retry all failed uploads in the queue.
   */
  public retryAllFailed() {
    let count = 0;
    this.items.forEach((item) => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.error = undefined;
        count++;
      }
    });

    if (count > 0) {
      this.emitState();
      this.processQueue();
    }
  }

  /**
   * Cancel all active and pending uploads.
   */
  public cancelAll() {
    this.items.forEach((item) => {
      if (item.status === 'uploading' || item.status === 'pending') {
        this.cancelUpload(item.id);
      }
    });
  }

  /**
   * Remove an item from the queue list.
   */
  public removeItem(id: string) {
    this.cancelUpload(id);
    this.items.delete(id);
    this.emitState();
  }

  /**
   * Clear completed and cancelled uploads from the manager widget.
   */
  public clearCompleted() {
    this.items.forEach((item, id) => {
      if (item.status === 'completed' || item.status === 'cancelled') {
        this.items.delete(id);
      }
    });
    this.emitState();
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      const timer = setTimeout(() => {
        resolve();
      }, ms);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      }
    });
  }
}

// Singleton global engine
export const uploadEngine = new UploadEngine();
