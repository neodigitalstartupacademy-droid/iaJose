
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  LIVE = 'live',
  CELLULAR_CHECK = 'cellular_check',
  ACADEMY = 'academy',
  CONTROL_TOWER = 'control_tower',
  SOCIAL_SYNC = 'social_sync',
  IA_WORLD = 'ia_world',
  VISUAL_STUDIO = 'visual_studio'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audio?: string;
  isLive?: boolean;
  sources?: { title?: string; uri?: string }[];
}

export interface NeoLifeSale {
  id: string;
  productName: string;
  customerName: string;
  customerContact: string;
  pv: number;
  bv: number;
  commission: number;
  date: number;
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
