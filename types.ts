
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
}

export interface DistributorData {
  id: string;
  shopUrl: string;
  joinDate: number;
}

export interface AppState {
  isOwner: boolean;
  currentDistributor: DistributorData | null;
}
