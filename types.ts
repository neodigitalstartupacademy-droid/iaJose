
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  LIVE = 'live',
  VISUALS = 'visuals',
  CELLULAR_CHECK = 'cellular_check',
  ACADEMY = 'academy'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audio?: string; // Stockage de la version base64 PCM pour l'archivage
  sources?: { title?: string; uri?: string }[]; // Références web pour la crédibilité
}

export interface DistributorData {
  id: string;
  shopUrl: string;
  joinDate: number;
  alias?: string; // Alias personnalisé pour le Smart Link
}

export interface UserAccount {
  email: string;
  password?: string;
  distData: DistributorData;
  avatarUrl?: string; // URL ou Base64 de l'avatar personnalisé
  preferredVoice?: string; // ID de la voix TTS préférée
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

export interface AcademyModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Expert';
  lessons: AcademyLesson[];
  icon: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  completed: boolean;
}
