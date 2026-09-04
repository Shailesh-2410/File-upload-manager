import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode,
  Star,
  Download,
  Trash2,
  Eye,
  Upload,
  FolderPlus,
  Sparkles,
  ArrowUpDown,
  UploadCloud,
  Layers,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { DriveFile, DriveFolder, FilterType, ViewMode } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/formatters';

interface FolderViewProps {
  currentFolder: DriveFolder | null;
  childFolders: DriveFolder[];
  files: DriveFile[];
  viewMode: ViewMode;
  onNavigateFolder: (folder: DriveFolder | null) => void;
  onSelectFilePreview: (file: DriveFile) => void;
  onToggleStarFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveFileToFolder: (fileId: string, targetFolderId: string) => void;
  onOpenUploadDialog: () => void;
  onOpenFolderDialog: () => void;
  onAddSimulatedBatch: () => void;
  filterType: FilterType;
}

type SortField = 'name' | 'date' | 'size';

export const FolderView: React.FC<FolderViewProps> = ({
  currentFolder,
  childFolders,
  files,
  viewMode,
  onNavigateFolder,
  onSelectFilePreview,
  onToggleStarFile,
  onDeleteFile,
  onDeleteFolder,
  onMoveFileToFolder,
  onOpenUploadDialog,
  onOpenFolderDialog,
  onAddSimulatedBatch,
  filterType,
}) => {
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter files
  const filteredFiles = files.filter((file) => {
    if (filterType === 'all') return true;
    const cat = getFileCategory(file.name);
    if (filterType === 'documents') return cat === 'document' || cat === 'code';
    if (filterType === 'images') return cat === 'image';
    if (filterType === 'media') return cat === 'media';
    if (filterType === 'archives') return cat === 'archive';
    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'size') {
      comparison = a.size - b.size;
    } else {
      comparison = a.updatedAt - b.updatedAt;
    }
    return sortAsc ? comparison : -comparison;
  });

  const renderFileTypeTag = (fileName: string) => {
    const cat = getFileCategory(fileName);
    switch (cat) {
      case 'image':
        return (
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-500/20">
            IMAGE
          </span>
        );
      case 'media':
        return (
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-500/20">
            MEDIA
          </span>
        );
      case 'archive':
        return (
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-500/20">
            ZIP
          </span>
        );
      case 'code':
        return (
          <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-700 border border-cyan-500/20">
            CODE
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-500/20">
            DOC
          </span>
        );
    }
  };

  const renderFileIcon = (fileName: string, className = 'h-6 w-6') => {
    const cat = getFileCategory(fileName);
    switch (cat) {
      case 'image':
        return <FileImage className={`${className} text-emerald-500`} />;
      case 'media':
        return <FileVideo className={`${className} text-purple-500`} />;
      case 'archive':
        return <FileArchive className={`${className} text-amber-500`} />;
      case 'code':
        return <FileCode className={`${className} text-cyan-600`} />;
      default:
        return <FileText className={`${className} text-blue-500`} />;
    }
  };

  const handleFileDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('text/plain', fileId);
    setDraggedFileId(fileId);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (draggedFileId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('text/plain') || draggedFileId;
    if (fileId) {
      onMoveFileToFolder(fileId, targetFolderId);
    }
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  const isEmpty = childFolders.length === 0 && filteredFiles.length === 0;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Top Banner / In-page Quick Drop Zone */}
      <div 
        onClick={onOpenUploadDialog}
        className="group relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/80 p-5 sm:p-6 shadow-xs cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Upload to {currentFolder ? currentFolder.name : 'My Drive'}
                <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  Chunked &bull; Max 3 Concurrency
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag & drop files anywhere, or click here to browse. Automatic resume on network drop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddSimulatedBatch();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Simulate 5 Uploads</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {currentFolder ? (
              <>
                <Folder className="h-5 w-5" style={{ color: currentFolder.color || '#3b82f6' }} />
                <span>{currentFolder.name}</span>
              </>
            ) : (
              <span>My Drive</span>
            )}
          </h2>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{childFolders.length} folders</span>
            <span>&bull;</span>
            <span>{filteredFiles.length} files ({formatBytes(filteredFiles.reduce((acc, f) => acc + f.size, 0))})</span>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2">
          {/* Sort By menu */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60 text-xs">
            <span className="text-[11px] font-medium text-slate-400 px-1.5 hidden sm:inline">Sort:</span>
            {(['date', 'name', 'size'] as SortField[]).map((sf) => (
              <button
                key={sf}
                onClick={() => {
                  if (sortField === sf) {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortField(sf);
                    setSortAsc(false);
                  }
                }}
                className={`rounded-lg px-2 py-1 capitalize transition-all ${
                  sortField === sf
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sf} {sortField === sf ? (sortAsc ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenFolderDialog}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5 text-emerald-600" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Folders Section */}
      {childFolders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Folders ({childFolders.length})</span>
            {draggedFileId && (
              <span className="text-blue-600 animate-pulse normal-case font-semibold">
                Drop file onto any folder to move it
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {childFolders.map((folder) => {
              const isOver = dragOverFolderId === folder.id;
              // Calculate folder items
              const folderItemsCount = files.filter((f) => f.folderId === folder.id).length;

              return (
                <div
                  key={folder.id}
                  onClick={() => onNavigateFolder(folder)}
                  onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  className={`group relative flex items-center justify-between rounded-2xl border p-4 cursor-pointer select-none transition-all duration-200 ${
                    isOver
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10 scale-[1.02]'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                  id={`folder-card-${folder.id}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-2xs group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${folder.color || '#3b82f6'}18`,
                        color: folder.color || '#3b82f6',
                      }}
                    >
                      <Folder className="h-6 w-6 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate" title={folder.name}>
                        {folder.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isOver ? (
                          <strong className="text-blue-600">Release to drop</strong>
                        ) : (
                          `${folderItemsCount} ${folderItemsCount === 1 ? 'item' : 'items'}`
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    title="Delete Folder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Files Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Files ({sortedFiles.length})</span>
        </div>

        {/* Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-14 text-center shadow-2xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mb-4 shadow-inner">
              <UploadCloud className="h-10 w-10 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No files in this location yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              Drag and drop any files into this window to trigger chunked multi-part upload with live resume and concurrency control.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenUploadDialog}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Files</span>
              </button>
              <button
                onClick={onAddSimulatedBatch}
                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simulate 5 Uploads</span>
              </button>
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {!isEmpty && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleFileDragStart(e, file.id)}
                onClick={() => onSelectFilePreview(file)}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-3.5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer select-none"
                id={`file-card-${file.id}`}
              >
                {/* Visual Thumbnail / Icon Box */}
                <div className="relative mb-3 flex h-40 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 overflow-hidden border border-slate-100">
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs">
                        {renderFileIcon(file.name, 'h-8 w-8')}
                      </div>
                      {file.contentSnippet && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 italic px-2">
                          "{file.contentSnippet}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Top tags and star */}
                  <div className="absolute top-2.5 left-2.5">
                    {renderFileTypeTag(file.name)}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarFile(file.id);
                    }}
                    className={`absolute top-2.5 right-2.5 rounded-xl p-1.5 backdrop-blur-md transition-all ${
                      file.isStarred
                        ? 'bg-amber-400 text-white shadow-sm'
                        : 'bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                    }`}
                    title={file.isStarred ? 'Starred' : 'Add star'}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>

                {/* File Details */}
                <div className="space-y-1.5 px-0.5">
                  <div className="flex items-center gap-2">
                    {renderFileIcon(file.name, 'h-4 w-4 flex-shrink-0')}
                    <h4 className="text-xs font-bold text-slate-900 truncate flex-1" title={file.name}>
                      {file.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">{formatBytes(file.size)}</span>
                    <span>{formatDate(file.updatedAt)}</span>
                  </div>
                </div>

                {/* Hover Quick Actions */}
                <div 
                  className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-slate-400 font-medium">
                    Drag to folder to move
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectFilePreview(file)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title="Quick Look Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete File"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!isEmpty && viewMode === 'list' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Type</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Last Modified</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, file.id)}
                    onClick={() => onSelectFilePreview(file)}
                    className="group hover:bg-slate-50/90 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3 max-w-md">
                        {renderFileIcon(file.name, 'h-4 w-4 flex-shrink-0')}
                        <span className="truncate" title={file.name}>{file.name}</span>
                        {file.isStarred && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {renderFileTypeTag(file.name)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell font-medium">
                      {formatDate(file.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold font-mono">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onToggleStarFile(file.id)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            file.isStarred
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title="Star"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onSelectFilePreview(file)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
