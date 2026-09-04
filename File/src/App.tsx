import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FolderView } from './components/FolderView';
import { UploadManagerWidget } from './components/UploadManagerWidget';
import { DropZoneOverlay } from './components/DropZoneOverlay';
import { FilePreviewModal } from './components/FilePreviewModal';
import { NewFolderModal } from './components/NewFolderModal';
import { UploadModal } from './components/UploadModal';
import { TestSuiteModal } from './components/TestSuiteModal';

import {
  ActiveTab,
  CloudSyncState,
  DriveFile,
  DriveFolder,
  FilterType,
  StorageQuota,
  UploadItem,
  ViewMode
} from './types';
import { INITIAL_FILES, INITIAL_FOLDERS } from './data/initialData';
import { uploadEngine, EngineConfig } from './services/uploadEngine';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-drive');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [syncState, setSyncState] = useState<CloudSyncState>('synced');

  // Folders & Files Data
  const [folders, setFolders] = useState<DriveFolder[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<DriveFile[]>(INITIAL_FILES);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Upload Engine state
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [engineConfig, setEngineConfig] = useState<EngineConfig>(uploadEngine.getConfig());

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);

  // Full-window drag & drop state
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  // Storage Quota (15 GB free tier)
  const totalStorageBytes = 15 * 1024 * 1024 * 1024;
  const usedStorageBytes = files.reduce((acc, f) => acc + f.size, 0);
  const storageQuota: StorageQuota = {
    totalBytes: totalStorageBytes,
    usedBytes: usedStorageBytes,
  };

  // Subscribe to RxJS Upload Engine Queue stream
  useEffect(() => {
    const subscription = uploadEngine.queue$.subscribe((items) => {
      setUploadItems(items);

      const hasActive = items.some((i) => i.status === 'uploading');
      if (hasActive) {
        setSyncState('syncing');
      } else if (syncState === 'syncing') {
        setSyncState('synced');
      }
    });

    // Callback when upload engine finishes a file
    uploadEngine.setOnCompleted((item) => {
      // Add the file to the drive collection
      const newFile: DriveFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        size: item.size,
        type: item.type,
        folderId: item.targetFolderId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        previewUrl: item.previewUrl,
        isStarred: false,
      };

      setFiles((prev) => [newFile, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncState]);

  // Window-level Drag and Drop Listeners
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const filesToAdd = (Array.from(e.dataTransfer.files) as File[]).map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          fileObj: f,
        }));

        uploadEngine.addFiles(filesToAdd, currentFolderId);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [currentFolderId]);

  // Derived folder path for breadcrumbs
  const currentFolder = folders.find((f) => f.id === currentFolderId) || null;

  const getFolderPath = useCallback((): DriveFolder[] => {
    const path: DriveFolder[] = [];
    let curr = currentFolder;
    while (curr) {
      path.unshift(curr);
      curr = folders.find((f) => f.id === curr?.parentId) || null;
    }
    return path;
  }, [currentFolder, folders]);

  // Child folders in current location
  const childFolders = folders.filter((f) => {
    if (activeTab !== 'my-drive') return false;
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return f.parentId === currentFolderId;
  });

  // Files in current view / tab / search
  const displayedFiles = files.filter((f) => {
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (activeTab === 'recent') {
      // Sort by recent updatedAt, limit to last 2 weeks
      return Date.now() - f.updatedAt < 1000 * 60 * 60 * 24 * 14;
    }
    if (activeTab === 'starred') {
      return !!f.isStarred;
    }
    if (activeTab === 'trash') {
      return false; // trash items
    }
    // Default 'my-drive': match current folder
    return f.folderId === currentFolderId;
  });

  // Action Handlers
  const handleUploadFiles = (
    newFiles: Array<{ name: string; size: number; type: string; fileObj?: File; simulateFailureChunk?: number }>,
    targetFolderId: string | null
  ) => {
    uploadEngine.addFiles(newFiles, targetFolderId);
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: DriveFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      parentId: currentFolderId,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId && f.parentId !== folderId));
    setFiles((prev) => prev.filter((f) => f.folderId !== folderId));
    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleToggleStarFile = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f))
    );
  };

  const handleMoveFileToFolder = (fileId: string, targetFolderId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, folderId: targetFolderId, updatedAt: Date.now() } : f))
    );
  };

  const handleUpdateEngineConfig = (newCfg: Partial<EngineConfig>) => {
    uploadEngine.setConfig(newCfg);
    setEngineConfig(uploadEngine.getConfig());
  };

  const handleAddSimulatedBatch = () => {
    const batch = [
      { name: 'Apple_Keynote_Cinematic_Presentation.key', size: 18.5 * 1024 * 1024, type: 'application/octet-stream' },
      { name: 'Architecture_System_Diagram_HighRes.png', size: 4.2 * 1024 * 1024, type: 'image/png' },
      { name: 'Global_Quarterly_Sync_Audio.mp3', size: 8.9 * 1024 * 1024, type: 'audio/mp3' },
      { name: 'Cloud_Storage_Performance_Benchmark.pdf', size: 2.1 * 1024 * 1024, type: 'application/pdf' },
      { name: 'RxJS_Event_Stream_Snapshot.json', size: 750 * 1024, type: 'application/json' },
    ];
    uploadEngine.addFiles(batch, currentFolderId);
  };

  const activeUploadsCount = uploadItems.filter((i) => i.status === 'uploading').length;
  const pendingUploadsCount = uploadItems.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* Top Apple-inspired Frosted Navbar */}
      <Navbar
        currentFolder={currentFolder}
        folderPath={getFolderPath()}
        onNavigateFolder={(folder) => setCurrentFolderId(folder ? folder.id : null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        filterType={filterType}
        onFilterChange={setFilterType}
        syncState={syncState}
        onToggleSyncState={() =>
          setSyncState((prev) => (prev === 'offline' ? 'synced' : 'offline'))
        }
        onOpenUploadDialog={() => setIsUploadModalOpen(true)}
        onOpenFolderDialog={() => setIsNewFolderModalOpen(true)}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onAddSimulatedBatch={handleAddSimulatedBatch}
        activeUploadCount={activeUploadsCount}
      />

      {/* Main Content Area: Sidebar + Folder Explorer */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'my-drive') {
              setCurrentFolderId(null);
            }
          }}
          folders={folders}
          currentFolderId={currentFolderId}
          onSelectFolder={(fId) => {
            setActiveTab('my-drive');
            setCurrentFolderId(fId);
          }}
          storageQuota={storageQuota}
          activeUploadsCount={activeUploadsCount}
          totalPendingCount={pendingUploadsCount}
        />

        <main className="flex-1 overflow-x-hidden">
          <FolderView
            currentFolder={currentFolder}
            childFolders={childFolders}
            files={displayedFiles}
            viewMode={viewMode}
            onNavigateFolder={(folder) => setCurrentFolderId(folder ? folder.id : null)}
            onSelectFilePreview={(file) => setPreviewFile(file)}
            onToggleStarFile={handleToggleStarFile}
            onDeleteFile={handleDeleteFile}
            onDeleteFolder={handleDeleteFolder}
            onMoveFileToFolder={handleMoveFileToFolder}
            onOpenUploadDialog={() => setIsUploadModalOpen(true)}
            onOpenFolderDialog={() => setIsNewFolderModalOpen(true)}
            onAddSimulatedBatch={handleAddSimulatedBatch}
            filterType={filterType}
          />
        </main>
      </div>

      {/* Google Drive Signature Bottom-Right Floating Upload Manager */}
      <UploadManagerWidget
        items={uploadItems}
        onCancel={(id) => uploadEngine.cancelUpload(id)}
        onPause={(id) => uploadEngine.pauseUpload(id)}
        onResume={(id) => uploadEngine.resumeUpload(id)}
        onRetry={(id, restartFromBeginning) => uploadEngine.retryUpload(id, restartFromBeginning)}
        onRemove={(id) => uploadEngine.removeItem(id)}
        onClearCompleted={() => uploadEngine.clearCompleted()}
        onRetryAllFailed={() => uploadEngine.retryAllFailed()}
        onCancelAll={() => uploadEngine.cancelAll()}
        onSimulateError={(id) => {
          const item = uploadEngine.getItem(id);
          if (item) item.simulateFailureChunk = item.chunksUploaded + 1;
        }}
      />

      {/* Full-screen Drag & Drop Overlay */}
      <DropZoneOverlay
        isDragging={isWindowDragging}
        currentFolder={currentFolder}
      />

      {/* Modals */}
      <FilePreviewModal
        file={previewFile}
        folders={folders}
        onClose={() => setPreviewFile(null)}
        onToggleStar={handleToggleStarFile}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        currentFolder={currentFolder}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentFolder={currentFolder}
        folders={folders}
        onUploadFiles={handleUploadFiles}
        engineConfig={engineConfig}
        onUpdateConfig={handleUpdateEngineConfig}
      />

      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />

    </div>
  );
}
