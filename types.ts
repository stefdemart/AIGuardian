
export enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  IMPORT = 'IMPORT',
  DLS = 'DLS',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  PRIVACY = 'PRIVACY',
  LEGAL = 'LEGAL',
  TERMS = 'TERMS',
  OSINT = 'OSINT'
}

export interface VaultItem {
  id: string;
  source: string; // e.g., "ChatGPT", "Claude", "Gemini"
  type: 'conversation' | 'image' | 'code';
  date: string;
  summary: string;
  encryptedContent: string; // Simulated encrypted content
  tags: string[];
  riskLevel?: RiskLevel;
  risks?: Risk[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Risk {
  id: string;
  type: 'PII' | 'SECRET' | 'HEALTH' | 'POLITICAL';
  description: string;
  snippet: string; // The sensitive text
}

export interface UserProfile {
  name: string;
  email: string;
  totalItems: number;
  lastBackup: string;
  dlsKey?: string;
}

export interface ChartData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  score: number;
  summary: string;
}