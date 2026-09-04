import React, { useState } from 'react';
import {
  X,
  Download,
  Star,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  Calendar,
  HardDrive,
  Folder,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { DriveFile, DriveFolder } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/formatters';

interface FilePreviewModalProps {
  file: DriveFile | null;
  folders: DriveFolder[];
  onClose: () => void;
  onToggleStar: (fileId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  folders,
  onClose,
  onToggleStar,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!file) return null;

  const category = getFileCategory(file.name);
  const parentFolder = folders.find((f) => f.id === file.folderId);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/20 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Quick Look Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200/60">
              {category === 'image' && <FileImage className="h-4 w-4 text-emerald-500" />}
              {category === 'media' && <FileVideo className="h-4 w-4 text-purple-500" />}
              {category === 'code' && <FileCode className="h-4 w-4 text-cyan-600" />}
              {category === 'archive' && <FileArchive className="h-4 w-4 text-amber-500" />}
              {category === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate" title={file.name}>
              {file.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onToggleStar(file.id)}
              className={`rounded-xl p-2 transition-colors ${
                file.isStarred
                  ? 'text-amber-500 bg-amber-50'
                  : 'text-slate-400 hover:bg-slate-200/70'
              }`}
              title={file.isStarred ? 'Starred' : 'Add Star'}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
              title="Close Quick Look"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Look Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Stage */}
          <div className="flex min-h-[240px] max-h-[360px] items-center justify-center rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/60 border border-slate-200/80 overflow-hidden shadow-inner relative">
            {file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt={file.name}
                className="max-h-full max-w-full object-contain rounded-2xl p-2"
              />
            ) : category === 'code' ? (
              <div className="w-full h-full p-5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto leading-relaxed">
                <div className="text-slate-500 mb-2">// {file.name} - TypeScript Engine</div>
                <pre>{file.contentSnippet || `import { Subject, BehaviorSubject } from 'rxjs';\n\nexport const queue$ = new BehaviorSubject([]);`}</pre>
              </div>
            ) : category === 'media' ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 fill-current translate-x-0.5" />}
                </button>
                <div className="text-xs text-slate-600 font-medium">
                  {isPlaying ? 'Simulating streaming playback...' : 'Click to play media preview'}
                </div>
              </div>
            ) : category === 'document' ? (
              <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-slate-200 text-left space-y-3">
                <div className="h-3 w-1/3 bg-blue-100 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                  <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
                  <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
                </div>
                <p className="text-xs text-slate-600 italic pt-1">
                  "{file.contentSnippet || 'Executive summary of cloud drive chunking protocols and real-time state synchronization.'}"
                </p>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Page 1 of 1</span>
                  <span>Verified Safe</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FileArchive className="h-16 w-16 text-amber-500/70 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-700">{file.name}</p>
                <p className="text-[10px] text-slate-400">Archive contains multi-part compressed assets</p>
              </div>
            )}
          </div>

          {/* File Meta Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-blue-500" /> Size
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">{formatBytes(file.size)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Modified
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">{formatDate(file.updatedAt)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-amber-500" /> Destination
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                {parentFolder ? parentFolder.name : 'My Drive (Root)'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 bg-slate-50/80">
          <div className="text-xs text-slate-500 font-medium">
            Cloud synced &bull; E2E encrypted
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Close
            </button>
            <a
              href={file.previewUrl || '#'}
              download={file.name}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
