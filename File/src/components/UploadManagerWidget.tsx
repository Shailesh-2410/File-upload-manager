import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpCircle,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  Layers,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { UploadItem } from '../types';
import { formatBytes, formatSpeed, formatTimeRemaining, getFileCategory } from '../utils/formatters';

interface UploadManagerWidgetProps {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string, restartFromBeginning?: boolean) => void;
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
  onRetryAllFailed: () => void;
  onCancelAll: () => void;
  onSimulateError: (id: string) => void;
}

export const UploadManagerWidget: React.FC<UploadManagerWidgetProps> = ({
  items,
  onCancel,
  onPause,
  onResume,
  onRetry,
  onRemove,
  onClearCompleted,
  onRetryAllFailed,
  onCancelAll,
  onSimulateError,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'failed' | 'completed'>('all');

  if (items.length === 0) return null;

  const uploadingItems = items.filter((i) => i.status === 'uploading');
  const pendingItems = items.filter((i) => i.status === 'pending');
  const failedItems = items.filter((i) => i.status === 'failed');
  const completedItems = items.filter((i) => i.status === 'completed');

  const totalBytes = items.reduce((acc, i) => acc + i.size, 0);
  const totalUploadedBytes = items.reduce((acc, i) => acc + i.uploadedBytes, 0);
  const aggregateProgress = totalBytes > 0 ? Math.round((totalUploadedBytes / totalBytes) * 100) : 0;
  
  const totalSpeed = uploadingItems.reduce((acc, i) => acc + i.speed, 0);
  const activeCount = uploadingItems.length;

  const renderItemIcon = (name: string) => {
    const cat = getFileCategory(name);
    switch (cat) {
      case 'image':
        return <FileImage className="h-4 w-4 text-emerald-500" />;
      case 'media':
        return <FileVideo className="h-4 w-4 text-purple-500" />;
      case 'archive':
        return <FileArchive className="h-4 w-4 text-amber-500" />;
      case 'code':
        return <FileCode className="h-4 w-4 text-cyan-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (item: UploadItem) => {
    switch (item.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-500/20 shadow-2xs">
            <Clock className="h-2.5 w-2.5" />
            Pending Queue
          </span>
        );
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-500/25 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Chunk {item.chunksUploaded + 1}/{item.chunksTotal}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-500/20 shadow-2xs">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-500/20 shadow-2xs">
            <AlertCircle className="h-2.5 w-2.5 text-rose-600" />
            Failed at Chunk {item.chunksUploaded}/{item.chunksTotal}
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-300 shadow-2xs">
            <Pause className="h-2.5 w-2.5" />
            Paused ({item.progress}%)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Cancelled
          </span>
        );
    }
  };

  const filteredItems = items.filter((i) => {
    if (filterTab === 'active') return i.status === 'uploading' || i.status === 'pending';
    if (filterTab === 'failed') return i.status === 'failed';
    if (filterTab === 'completed') return i.status === 'completed';
    return true;
  });

  return (
    <div 
      className="fixed bottom-4 right-4 z-40 w-full max-w-[430px] rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/20 overflow-hidden transition-all duration-300 font-sans"
      id="upload-manager-widget"
    >
      {/* Apple-style translucent floating header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white cursor-pointer select-none border-b border-white/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular mini progress gauge */}
          <div className="relative flex h-7 w-7 items-center justify-center flex-shrink-0">
            {activeCount > 0 ? (
              <svg className="h-7 w-7 -rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-700"
                  fill="none"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="10"
                  stroke="url(#progressGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  fill="none"
                  strokeDasharray={62.8}
                  strokeDashoffset={62.8 - (62.8 * aggregateProgress) / 100}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            ) : failedItems.length > 0 ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-2">
              {activeCount > 0 ? (
                <>Uploading {uploadingItems.length} of {items.length} {items.length === 1 ? 'item' : 'items'}</>
              ) : failedItems.length > 0 ? (
                <>{failedItems.length} upload {failedItems.length === 1 ? 'failed' : 'failed'} &bull; Resume available</>
              ) : (
                <>{completedItems.length} uploads completed</>
              )}
            </h4>
            <div className="text-[10px] text-slate-300 flex items-center gap-2">
              {activeCount > 0 ? (
                <>
                  <span className="font-semibold text-blue-400">{aggregateProgress}%</span>
                  <span>&bull;</span>
                  <span>{formatSpeed(totalSpeed)}</span>
                  <span>&bull;</span>
                  <span className="text-slate-400">Max 3 workers</span>
                </>
              ) : (
                <span>All transfers finished</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            title={isMinimized ? 'Expand panel' : 'Minimize panel'}
            id="widget-toggle-minimize"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={onClearCompleted}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Clear finished items"
            id="widget-close-button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Widget Body */}
      {!isMinimized && (
        <div className="flex flex-col max-h-[420px]">
          
          {/* Aggregate Overview Card */}
          <div className="p-3.5 bg-gradient-to-b from-slate-50/90 to-slate-100/50 border-b border-slate-200/70 text-xs">
            <div className="flex items-center justify-between text-slate-600 mb-2 font-medium">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                  <Activity className="h-3 w-3 animate-pulse" />
                </div>
                <span>
                  Concurrency: <strong className="text-slate-900 font-semibold">{activeCount}/3 slots active</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {formatBytes(totalUploadedBytes)} / {formatBytes(totalBytes)} ({aggregateProgress}%)
              </span>
            </div>

            {/* Glowing aggregate bar */}
            <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-full transition-all duration-300 relative"
                style={{ width: `${aggregateProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>

            {/* Bulk quick actions */}
            <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-200/60 text-[11px]">
              <div className="flex gap-1.5">
                {failedItems.length > 0 && (
                  <button
                    onClick={onRetryAllFailed}
                    id="retry-all-failed-btn"
                    className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/70 shadow-2xs hover:bg-rose-100 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" /> Resume / Retry Failed ({failedItems.length})
                  </button>
                )}
                {activeCount > 0 && (
                  <button
                    onClick={onCancelAll}
                    id="cancel-all-active-btn"
                    className="font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    Cancel all
                  </button>
                )}
              </div>

              {completedItems.length > 0 && (
                <button
                  onClick={onClearCompleted}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1"
                >
                  Clear finished
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-200/70 bg-white px-3 text-[11px] font-medium text-slate-500">
            <button
              onClick={() => setFilterTab('all')}
              className={`py-2 px-2.5 border-b-2 transition-colors ${
                filterTab === 'all'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`py-2 px-2.5 border-b-2 transition-colors ${
                filterTab === 'active'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Active ({uploadingItems.length + pendingItems.length})
            </button>
            {failedItems.length > 0 && (
              <button
                onClick={() => setFilterTab('failed')}
                className={`py-2 px-2.5 border-b-2 transition-colors ${
                  filterTab === 'failed'
                    ? 'border-rose-600 text-rose-600 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Failed ({failedItems.length})
              </button>
            )}
            <button
              onClick={() => setFilterTab('completed')}
              className={`py-2 px-2.5 border-b-2 transition-colors ${
                filterTab === 'completed'
                  ? 'border-emerald-600 text-emerald-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Completed ({completedItems.length})
            </button>
          </div>

          {/* Files List */}
          <div className="overflow-y-auto divide-y divide-slate-100 p-2 flex-1 space-y-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50/90 rounded-2xl transition-all text-xs space-y-2 border border-transparent hover:border-slate-200/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 flex-shrink-0 shadow-2xs border border-slate-200/50">
                      {renderItemIcon(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{formatBytes(item.size)}</span>
                        {item.status === 'uploading' && item.speed > 0 && (
                          <>
                            <span>&bull;</span>
                            <span className="text-blue-600 font-semibold font-mono">
                              {formatSpeed(item.speed)}
                            </span>
                            <span>&bull;</span>
                            <span>{formatTimeRemaining(item.timeRemaining)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(item)}
                  </div>

                  {/* Per-item controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.status === 'uploading' && (
                      <>
                        {/* Instant error injection test button */}
                        <button
                          onClick={() => onSimulateError(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Simulate network failure to test resume"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onPause(item.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                          title="Pause Upload"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onCancel(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Cancel Upload"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {item.status === 'paused' && (
                      <>
                        <button
                          onClick={() => onResume(item.id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
                          title="Resume from saved chunk"
                        >
                          <Play className="h-3 w-3 fill-current" /> Resume
                        </button>
                        <button
                          onClick={() => onCancel(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {item.status === 'failed' && (
                      <>
                        {/* RESUME from saved chunk (Bonus Feature) */}
                        <button
                          onClick={() => onResume(item.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs transition-colors"
                          title={`Resume upload directly from chunk ${item.chunksUploaded + 1}`}
                        >
                          <Play className="h-3 w-3 fill-current" /> Resume
                        </button>
                        {/* Restart from beginning */}
                        <button
                          onClick={() => onRetry(item.id, true)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                          title="Restart from 0%"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {item.status === 'pending' && (
                      <button
                        onClick={() => onCancel(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {(item.status === 'completed' || item.status === 'cancelled') && (
                      <button
                        onClick={() => onRemove(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        title="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar + Segmented Chunk Visualizer */}
                {(item.status === 'uploading' || item.status === 'paused' || item.status === 'failed') && (
                  <div className="space-y-1.5">
                    {/* Continuous smooth bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'failed'
                            ? 'bg-rose-500'
                            : item.status === 'paused'
                            ? 'bg-amber-400'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    {/* Segmented Chunk Blocks Visualizer (Bonus Feature Visualization) */}
                    <div className="flex items-center gap-1 pt-0.5" title={`Chunk upload simulation: ${item.chunksUploaded} of ${item.chunksTotal} chunks uploaded`}>
                      {Array.from({ length: Math.min(item.chunksTotal, 16) }).map((_, idx) => {
                        const isUploaded = idx < item.chunksUploaded;
                        const isCurrent = idx === item.chunksUploaded && item.status === 'uploading';
                        const isFailed = idx === item.chunksUploaded && item.status === 'failed';
                        return (
                          <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-sm transition-all duration-200 ${
                              isUploaded
                                ? 'bg-emerald-500'
                                : isCurrent
                                ? 'bg-blue-500 animate-pulse'
                                : isFailed
                                ? 'bg-rose-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-medium text-slate-600">
                        {item.chunksUploaded}/{item.chunksTotal} chunks &bull; {item.progress}%
                      </span>
                      {item.error ? (
                        <span className="text-rose-600 font-semibold truncate max-w-[200px]" title={item.error}>
                          {item.error}
                        </span>
                      ) : (
                        <span>{formatBytes(item.uploadedBytes)} of {formatBytes(item.size)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
