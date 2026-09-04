export type UploadStatus = 
  | 'pending' 
  | 'uploading' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'paused';

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number; // 0 - 100
  uploadedBytes: number;
  chunksTotal: number;
  chunksUploaded: number;
  chunkSize: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
  targetFolderId: string | null;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  fileObj?: File;
  previewUrl?: string;
  simulateFailureChunk?: number; // for testing failure & resume
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: string;
  folderId: string | null;
  updatedAt: number;
  createdAt: number;
  isStarred?: boolean;
  previewUrl?: string;
  contentSnippet?: string;
}

export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'documents' | 'images' | 'media' | 'archives';
export type ActiveTab = 'my-drive' | 'recent' | 'starred' | 'trash';

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number; // e.g. 15 GB
}

export type CloudSyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface TestResult {
  id: string;
  title: string;
  category: 'async' | 'concurrency' | 'chunking' | 'rxjs' | 'performance';
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  details?: string;
  metrics?: Record<string, string | number>;
}
