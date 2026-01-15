
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  LIVE = 'live',
  VISUALS = 'visuals',
  CELLULAR_CHECK = 'cellular_check'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audio?: string; // Stockage de la version base64 PCM pour l'archivage
}

export interface DistributorData {
  id: string;
  shopUrl: string;
  joinDate: number;
}

export interface UserAccount {
  email: string;
  password?: string;
  distData: DistributorData;
}

export interface AppState {
  isOwner: boolean;
  currentDistributor: DistributorData | null;
}

export interface SavedSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}
