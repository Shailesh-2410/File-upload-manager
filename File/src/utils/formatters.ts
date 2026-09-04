export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || bytesPerSecond <= 0) return '0 KB/s';
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function formatTimeRemaining(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return 'calculating...';
  if (seconds < 60) return `${Math.ceil(seconds)}s left`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s left`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getFileCategory(mimeOrName: string): 'document' | 'image' | 'media' | 'archive' | 'code' | 'other' {
  const lower = mimeOrName.toLowerCase();
  if (
    lower.endsWith('.pdf') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.pptx') ||
    lower.includes('pdf') ||
    lower.includes('document') ||
    lower.includes('text/')
  ) {
    return 'document';
  }
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.webp') ||
    lower.includes('image/')
  ) {
    return 'image';
  }
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.mp3') ||
    lower.endsWith('.wav') ||
    lower.includes('video/') ||
    lower.includes('audio/')
  ) {
    return 'media';
  }
  if (
    lower.endsWith('.zip') ||
    lower.endsWith('.tar') ||
    lower.endsWith('.gz') ||
    lower.endsWith('.rar') ||
    lower.endsWith('.7z')
  ) {
    return 'archive';
  }
  if (
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.js') ||
    lower.endsWith('.jsx') ||
    lower.endsWith('.json') ||
    lower.endsWith('.py') ||
    lower.endsWith('.html') ||
    lower.endsWith('.css')
  ) {
    return 'code';
  }
  return 'other';
}
