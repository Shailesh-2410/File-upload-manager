import React from 'react';
import { UploadCloud, FolderUp } from 'lucide-react';
import { DriveFolder } from '../types';

interface DropZoneOverlayProps {
  isDragging: boolean;
  currentFolder: DriveFolder | null;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({
  isDragging,
  currentFolder,
}) => {
  if (!isDragging) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-blue-950/20 backdrop-blur-md transition-all duration-300"
      id="fullscreen-drag-overlay"
    >
      <div className="relative mx-4 flex max-w-lg flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-500 bg-white/90 p-10 text-center shadow-2xl shadow-blue-950/20">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner animate-bounce">
          <UploadCloud className="h-10 w-10 stroke-[2.2]" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
          Drop files to upload
        </h3>
        
        <p className="text-sm text-slate-600 mb-3 flex items-center gap-1.5">
          <FolderUp className="h-4 w-4 text-blue-500" />
          Uploading to <strong className="text-slate-900 font-semibold">{currentFolder ? currentFolder.name : 'My Drive'}</strong>
        </p>

        <div className="flex items-center gap-2 rounded-full bg-blue-50/80 px-3.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
          <span>Multi-part chunking</span>
          <span>•</span>
          <span>Max 3 concurrent uploads</span>
          <span>•</span>
          <span>Auto-resume</span>
        </div>
      </div>
    </div>
  );
};
