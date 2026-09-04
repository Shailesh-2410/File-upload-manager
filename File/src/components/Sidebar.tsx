import React from 'react';
import {
  HardDrive,
  Clock,
  Star,
  Trash2,
  Folder,
  ChevronDown,
  CloudLightning,
  ShieldCheck,
  Zap,
  Cpu,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActiveTab, DriveFolder, StorageQuota } from '../types';
import { formatBytes } from '../utils/formatters';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  folders: DriveFolder[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  storageQuota: StorageQuota;
  activeUploadsCount: number;
  totalPendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  folders,
  currentFolderId,
  onSelectFolder,
  storageQuota,
  activeUploadsCount,
  totalPendingCount,
}) => {
  const rootFolders = folders.filter((f) => f.parentId === null);
  const percentUsed = Math.min(
    100,
    Math.round((storageQuota.usedBytes / storageQuota.totalBytes) * 100)
  );

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-slate-50/50 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Navigation Categories */}
        <nav className="space-y-1">
          <button
            onClick={() => {
              onSelectTab('my-drive');
              onSelectFolder(null);
            }}
            id="sidebar-tab-my-drive"
            className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'my-drive' && currentFolderId === null
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <HardDrive className={`h-4 w-4 ${activeTab === 'my-drive' && currentFolderId === null ? 'text-white' : 'text-blue-600'}`} />
              <span>My Drive</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'my-drive' && currentFolderId === null ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'}`}>
              All
            </span>
          </button>

          <button
            onClick={() => onSelectTab('recent')}
            id="sidebar-tab-recent"
            className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className={`h-4 w-4 ${activeTab === 'recent' ? 'text-white' : 'text-slate-500'}`} />
              <span>Recent</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('starred')}
            id="sidebar-tab-starred"
            className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'starred'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Star className={`h-4 w-4 ${activeTab === 'starred' ? 'text-white' : 'text-amber-500'}`} />
              <span>Starred</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('trash')}
            id="sidebar-tab-trash"
            className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'trash'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash2 className={`h-4 w-4 ${activeTab === 'trash' ? 'text-white' : 'text-slate-500'}`} />
              <span>Trash</span>
            </div>
          </button>
        </nav>

        {/* Folders List in Sidebar */}
        <div className="space-y-1.5">
          <div className="px-3.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Folders</span>
            <ChevronDown className="h-3 w-3" />
          </div>

          <div className="space-y-1">
            {rootFolders.map((folder) => {
              const isSelected = currentFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectTab('my-drive');
                    onSelectFolder(folder.id);
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-200/90 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <Folder
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: folder.color || '#3b82f6' }}
                  />
                  <span className="truncate text-left flex-1">{folder.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concurrency Engine Visualizer */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              Upload Concurrency
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
              Max 3 Limit
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Active Workers:</span>
              <span className="font-bold text-slate-900">
                {activeUploadsCount} / 3 slots
              </span>
            </div>

            {/* 3 Physical Slot Gauges */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((slotIdx) => {
                const isActive = slotIdx < activeUploadsCount;
                return (
                  <div
                    key={slotIdx}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'border-blue-300 bg-blue-50/80 shadow-2xs'
                        : 'border-slate-100 bg-slate-50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-600 animate-ping' : 'bg-slate-300'}`} />
                      <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                        W{slotIdx + 1}
                      </span>
                    </div>
                    <span className={`text-[9px] mt-0.5 font-medium ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isActive ? 'Busy' : 'Idle'}
                    </span>
                  </div>
                );
              })}
            </div>

            {totalPendingCount > 0 && (
              <div className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-xl px-2.5 py-1 font-medium flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{totalPendingCount} queued in FIFO buffer</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Storage Gauge */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Storage</span>
          <span className="text-slate-500 font-normal">{percentUsed}% used</span>
        </div>

        {/* Multi-color segmented bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex p-0.5 border border-slate-200/50">
          <div style={{ width: `${Math.max(5, percentUsed * 0.45)}%` }} className="bg-blue-500 rounded-l-full" title="Documents" />
          <div style={{ width: `${Math.max(5, percentUsed * 0.35)}%` }} className="bg-indigo-500" title="Media" />
          <div style={{ width: `${Math.max(5, percentUsed * 0.20)}%` }} className="bg-amber-500 rounded-r-full" title="Archives & Others" />
        </div>

        <div className="text-[11px] text-slate-600 flex justify-between items-center">
          <span className="font-medium">{formatBytes(storageQuota.usedBytes)} of {formatBytes(storageQuota.totalBytes)}</span>
          <span className="font-bold text-blue-600 cursor-pointer hover:underline">
            Upgrade
          </span>
        </div>
      </div>
    </aside>
  );
};
