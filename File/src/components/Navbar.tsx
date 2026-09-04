import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  Search,
  Upload,
  FolderPlus,
  Grid,
  List,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff,
  SlidersHorizontal,
  FileCheck,
  ChevronRight,
  Home,
  Plus,
  Sparkles,
  Play,
  Command
} from 'lucide-react';
import { ActiveTab, CloudSyncState, DriveFolder, FilterType, ViewMode } from '../types';

interface NavbarProps {
  currentFolder: DriveFolder | null;
  folderPath: DriveFolder[];
  onNavigateFolder: (folder: DriveFolder | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  syncState: CloudSyncState;
  onToggleSyncState: () => void;
  onOpenUploadDialog: () => void;
  onOpenFolderDialog: () => void;
  onOpenTestSuite: () => void;
  onAddSimulatedBatch: () => void;
  activeUploadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFolder,
  folderPath,
  onNavigateFolder,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  filterType,
  onFilterChange,
  syncState,
  onToggleSyncState,
  onOpenUploadDialog,
  onOpenFolderDialog,
  onOpenTestSuite,
  onAddSimulatedBatch,
  activeUploadCount,
}) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const syncMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (syncMenuRef.current && !syncMenuRef.current.contains(e.target as Node)) {
        setShowSyncInfo(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl transition-all shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Branding & Breadcrumbs */}
        <div className="flex items-center gap-4 min-w-0">
          <div 
            onClick={() => onNavigateFolder(null)}
            className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
            id="brand-logo-button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="h-5 w-5 text-white stroke-[2.4]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                CloudDrive
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                  DriveSync
                </span>
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Breadcrumb path */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 min-w-0 overflow-hidden">
            <button
              onClick={() => onNavigateFolder(null)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 transition-colors hover:bg-slate-100 hover:text-slate-900 ${
                !currentFolder ? 'text-slate-900 font-bold bg-slate-100/70' : 'text-slate-500'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>My Drive</span>
            </button>

            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => onNavigateFolder(folder)}
                  className={`rounded-xl px-2.5 py-1 truncate max-w-[150px] transition-colors hover:bg-slate-100 hover:text-slate-900 ${
                    index === folderPath.length - 1
                      ? 'text-slate-900 font-bold bg-slate-100/70'
                      : 'text-slate-500'
                  }`}
                  title={folder.name}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files, folders, documents..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-100/80 py-2 pl-10 pr-16 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded-md border border-slate-200/70 bg-white/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
                <span>⌘K</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          
          {/* Cloud Sync Status Indicator */}
          <div className="relative" ref={syncMenuRef}>
            <button
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              id="cloud-sync-status-indicator"
              className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
              title="Cloud Sync Status"
            >
              {syncState === 'synced' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden lg:inline text-slate-700">Cloud Synced</span>
                </>
              )}
              {syncState === 'syncing' && (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                  <span className="hidden lg:inline text-blue-600 font-bold">
                    Syncing {activeUploadCount > 0 ? `(${activeUploadCount})` : ''}
                  </span>
                </>
              )}
              {syncState === 'offline' && (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                  <span className="hidden lg:inline text-amber-600 font-bold">Offline</span>
                </>
              )}
            </button>

            {/* Sync Dropdown Info Popover */}
            {showSyncInfo && (
              <div className="absolute right-0 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Cloud Sync Status</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 font-bold border border-emerald-100">
                    Real-time
                  </span>
                </div>
                <div className="py-3 space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>WebSocket Sync:</span>
                    <span className="font-semibold text-slate-900">Connected (12ms)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active uploads:</span>
                    <span className="font-semibold text-slate-900">{activeUploadCount} files</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upload Engine:</span>
                    <span className="font-semibold text-slate-900">3-Worker Chunked</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onToggleSyncState();
                    setShowSyncInfo(false);
                  }}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {syncState === 'offline' ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-blue-500" /> Go Online & Sync
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-amber-500" /> Simulate Offline Mode
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center rounded-2xl bg-slate-100/90 p-1 border border-slate-200/70 shadow-2xs">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`rounded-xl p-1.5 text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              id="view-mode-grid"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`rounded-xl p-1.5 text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
              id="view-mode-list"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                filterType !== 'all'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Filter by Category"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline capitalize">{filterType}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                {(['all', 'documents', 'images', 'media', 'archives'] as FilterType[]).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => {
                      onFilterChange(ft);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2 capitalize transition-colors flex items-center justify-between ${
                      filterType === ft
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{ft}</span>
                    {filterType === ft && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Test Suite & Benchmarks Trigger */}
          <button
            onClick={onOpenTestSuite}
            id="open-test-suite-btn"
            className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
            title="Run Concurrency, Chunking, RxJS & Async Test Suite"
          >
            <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Tests & Benchmarks</span>
          </button>

          {/* Primary "New" Action Button */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              id="new-upload-action-btn"
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-slate-900/20 hover:from-slate-800 hover:to-slate-700 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New</span>
            </button>

            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenUploadDialog();
                  }}
                  id="action-upload-files"
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Upload Files</div>
                    <div className="text-[10px] text-slate-400">Multi-chunk concurrency</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenFolderDialog();
                  }}
                  id="action-new-folder"
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs">
                    <FolderPlus className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">New Folder</div>
                    <div className="text-[10px] text-slate-400">Color-coded organization</div>
                  </div>
                </button>

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowNewMenu(false);
                    onAddSimulatedBatch();
                  }}
                  id="action-simulated-batch"
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-indigo-700 hover:bg-indigo-50 font-medium transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-indigo-900">Simulate Batch (5 files)</div>
                    <div className="text-[10px] text-indigo-500">Test max 3 concurrency</div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
