import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FilePlus,
  Settings2,
  Folder,
  AlertTriangle,
  Sparkles,
  Zap
} from 'lucide-react';
import { DriveFolder } from '../types';
import { EngineConfig } from '../services/uploadEngine';
import { formatBytes } from '../utils/formatters';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder: DriveFolder | null;
  folders: DriveFolder[];
  onUploadFiles: (
    files: Array<{ name: string; size: number; type: string; fileObj?: File; simulateFailureChunk?: number }>,
    targetFolderId: string | null
  ) => void;
  engineConfig: EngineConfig;
  onUpdateConfig: (config: Partial<EngineConfig>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentFolder,
  folders,
  onUploadFiles,
  engineConfig,
  onUpdateConfig,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolder ? currentFolder.id : null
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = (Array.from(e.target.files) as File[]).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        fileObj: f,
        simulateFailureChunk: simulateFailure ? 2 : undefined,
      }));

      onUploadFiles(filesList, selectedFolderId);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = (Array.from(e.dataTransfer.files) as File[]).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        fileObj: f,
        simulateFailureChunk: simulateFailure ? 2 : undefined,
      }));

      onUploadFiles(filesList, selectedFolderId);
      onClose();
    }
  };

  // Demo Presets for quick evaluation
  const handleAddPresetBatch = () => {
    const mockFiles = [
      {
        name: 'Design_System_Spec_2026.pdf',
        size: 3.4 * 1024 * 1024,
        type: 'application/pdf',
      },
      {
        name: '4K_Hero_Background_Render.png',
        size: 7.8 * 1024 * 1024,
        type: 'image/png',
      },
      {
        name: 'Product_Keynote_Audio_Master.wav',
        size: 15.2 * 1024 * 1024,
        type: 'audio/wav',
      },
      {
        name: 'Quarterly_Financial_Analytics.xlsx',
        size: 1.8 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      {
        name: 'SF_Symbolic_Components.zip',
        size: 22.4 * 1024 * 1024,
        type: 'application/zip',
      },
    ];

    onUploadFiles(mockFiles, selectedFolderId);
    onClose();
  };

  const handleAddResumeDemoFile = () => {
    onUploadFiles(
      [
        {
          name: 'Large_Archive_With_Resume_Test.zip',
          size: 12 * 1024 * 1024,
          type: 'application/zip',
          simulateFailureChunk: 3, // automatically drops at chunk 3 to demonstrate resume!
        },
      ],
      selectedFolderId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Files</h3>
              <p className="text-xs text-slate-500">
                Multi-part chunking &bull; Concurrency limit: 3 files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropActive(true);
          }}
          onDragLeave={() => setIsDropActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            isDropActive
              ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
              : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/50'
          }`}
          id="modal-drop-zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            id="modal-file-input"
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Click to browse or drop files here
          </p>
          <p className="text-xs text-slate-400">
            Supports multiple documents, images, videos, and archives
          </p>
        </div>

        {/* Destination folder selector */}
        <div className="flex items-center justify-between text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-blue-500" />
            Destination Folder:
          </span>
          <select
            value={selectedFolderId || ''}
            onChange={(e) => setSelectedFolderId(e.target.value || null)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="">My Drive (Root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Demo Generation Presets */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Quick Simulation Presets
            </span>
            <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-bold">
              Instant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleAddPresetBatch}
              className="flex items-center gap-2 rounded-xl bg-white border border-indigo-200/80 px-3 py-2 text-left text-slate-800 hover:bg-indigo-50/60 font-medium shadow-2xs transition-colors"
            >
              <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-xs text-slate-900">Queue 5 Files</div>
                <div className="text-[10px] text-slate-400">Verifies max 3 concurrency</div>
              </div>
            </button>

            <button
              onClick={handleAddResumeDemoFile}
              className="flex items-center gap-2 rounded-xl bg-white border border-indigo-200/80 px-3 py-2 text-left text-slate-800 hover:bg-indigo-50/60 font-medium shadow-2xs transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <div>
                <div className="font-semibold text-xs text-slate-900">Chunk Failure & Resume</div>
                <div className="text-[10px] text-slate-400">Drops at chunk 3 & tests resume</div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Upload Engine Tuning Toggle */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{showAdvanced ? 'Hide engine settings' : 'Tune chunk size & speed simulation'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700">Chunk Size:</label>
                <select
                  value={engineConfig.defaultChunkSize}
                  onChange={(e) => onUpdateConfig({ defaultChunkSize: Number(e.target.value) })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1"
                >
                  <option value={256 * 1024}>256 KB</option>
                  <option value={512 * 1024}>512 KB (Standard)</option>
                  <option value={1024 * 1024}>1 MB</option>
                  <option value={2 * 1024 * 1024}>2 MB</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700">Transfer Speed Simulation:</label>
                <select
                  value={engineConfig.simulatedSpeedBps}
                  onChange={(e) => onUpdateConfig({ simulatedSpeedBps: Number(e.target.value) })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1"
                >
                  <option value={1024 * 1024}>1 MB/s</option>
                  <option value={2 * 1024 * 1024}>2 MB/s (Standard)</option>
                  <option value={5 * 1024 * 1024}>5 MB/s (Fast)</option>
                  <option value={15 * 1024 * 1024}>15 MB/s (High Speed)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <label className="font-medium text-slate-700">Inject Simulated Failure on Chunk 2:</label>
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            Select Files
          </button>
        </div>
      </div>
    </div>
  );
};
