
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  LIVE = 'live',
  CELLULAR_CHECK = 'cellular_check',
  ACADEMY = 'academy',
  CONTROL_TOWER = 'control_tower',
  SOCIAL_SYNC = 'social_sync',
  IA_WORLD = 'ia_world'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audio?: string;
  sources?: { title?: string; uri?: string }[];
}

export interface DistributorData {
  id: string;
  shopUrl: string;
  joinDate: number;
  alias?: string;
  branding?: {
    name: string;
    primaryColor: string;
    logoUrl?: string;
    customPrompt?: string;
  };
}

export interface UserAccount {
  email: string;
  password?: string;
  distData: DistributorData;
}
