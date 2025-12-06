export enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  IMPORT = 'IMPORT',
  RIO = 'RIO',
  PROFILE = 'PROFILE'
}

export interface VaultItem {
  id: string;
  source: string; // e.g., "ChatGPT", "Claude", "Gemini"
  type: 'conversation' | 'image' | 'code';
  date: string;
  summary: string;
  encryptedContent: string; // Simulated encrypted content
  tags: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  totalItems: number;
  lastBackup: string;
  rioKey?: string;
}

export interface ChartData {
  subject: string;
  A: number;
  fullMark: number;
}
