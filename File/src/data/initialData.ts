import { DriveFile, DriveFolder } from '../types';

export const INITIAL_FOLDERS: DriveFolder[] = [
  {
    id: 'folder_design',
    name: 'Design System & Assets',
    parentId: null,
    color: '#3b82f6', // blue
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'folder_financials',
    name: 'Quarterly Reports & Docs',
    parentId: null,
    color: '#10b981', // emerald
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'folder_media',
    name: 'Marketing Media',
    parentId: null,
    color: '#8b5cf6', // purple
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'folder_icons',
    name: 'Vector Icons & Glyphs',
    parentId: 'folder_design',
    color: '#f59e0b', // amber
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];

export const INITIAL_FILES: DriveFile[] = [
  {
    id: 'file_brand_guide',
    name: 'Apple_Design_Guidelines_v3.pdf',
    size: 4.8 * 1024 * 1024,
    type: 'application/pdf',
    folderId: 'folder_design',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 18,
    isStarred: true,
    contentSnippet: 'Human Interface Guidelines covering typography, vibrancy, layout grids, and motion physics.',
  },
  {
    id: 'file_hero_mockup',
    name: 'MacBook_Pro_M3_Hero.png',
    size: 8.2 * 1024 * 1024,
    type: 'image/png',
    folderId: 'folder_design',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    isStarred: true,
    previewUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'file_pitch_deck',
    name: 'Q3_Investor_Deck_Final.pptx',
    size: 14.5 * 1024 * 1024,
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    folderId: 'folder_financials',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    isStarred: false,
    contentSnippet: 'Executive overview, SaaS recurring revenue, cloud file sync metrics, retention curves.',
  },
  {
    id: 'file_spreadsheet',
    name: 'Financial_Projections_2026.xlsx',
    size: 2.1 * 1024 * 1024,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    folderId: 'folder_financials',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    isStarred: true,
    contentSnippet: 'Cost analysis of storage chunking vs multi-part concurrent uploads across AWS S3 and GCP Cloud Storage.',
  },
  {
    id: 'file_teaser_video',
    name: 'Product_Launch_Teaser_4K.mp4',
    size: 64.2 * 1024 * 1024,
    type: 'video/mp4',
    folderId: 'folder_media',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isStarred: false,
  },
  {
    id: 'file_source_code',
    name: 'reactive_concurrency_engine.ts',
    size: 18.4 * 1024,
    type: 'text/typescript',
    folderId: null, // Root
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 30,
    isStarred: true,
    contentSnippet: `import { Subject, BehaviorSubject } from 'rxjs';\n// Upload concurrency scheduler maintaining max 3 workers with chunk resume capability.`,
  },
  {
    id: 'file_app_icon_pack',
    name: 'SF_Symbolic_Icons_Pack.zip',
    size: 18.9 * 1024 * 1024,
    type: 'application/zip',
    folderId: null, // Root
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 1,
    isStarred: false,
  },
];
