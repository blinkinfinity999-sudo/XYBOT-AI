export type Role = 'user' | 'assistant' | 'system';

export type PlanType = 'free' | 'starter' | 'pro' | 'ultimate';

export interface PlanDetails {
  id: PlanType;
  name: string;
  duration: string;
  durationMonths: number;
  price: string;
  priceInr: number;
  imageLimit: number | 'unlimited';
  features: string[];
  popular?: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  mimeType: string;
  name: string;
  size?: number;
  base64?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isStreaming?: boolean;
  suggestedFollowUps?: string[];
  tokensUsed?: number;
  isPinned?: boolean;
}

export type XYBotModeId = 'xy-base' | 'xy-light' | 'xy-creative' | 'xy-student' | 'xy-neo';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  model: string;
  mode?: XYBotModeId;
  systemInstruction?: string;
  wallpaper?: string;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: PlanType;
  tagline?: string;
  color?: string;
  customInstruction?: string;
  isDefault?: boolean;
  planExpiresAt?: number;
  isGuest?: boolean;
  isLoggedIn?: boolean;
  imagesGeneratedCount: number;
  totalPromptsCount: number;
  totalWordsGenerated: number;
  joinedDate: number;
  customApiKey?: string;
}

export type ThemeAccent = 'cyan' | 'purple' | 'emerald' | 'rose' | 'amber';
export type ThemeMode = 'dark' | 'light' | 'oled';

export interface AppSettings {
  themeMode: ThemeMode;
  themeAccent: ThemeAccent;
  language: string;
  notificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  autoSpeechEnabled: boolean;
  conversationMemory: boolean;
  temperature: number;
  defaultModel: string;
  defaultMode: XYBotModeId;
  wallpaper: string;
  passcodeEnabled: boolean;
  passcodeHash?: string;
}

export type ActiveView = 
  | 'home'
  | 'chat'
  | 'image-gen'
  | 'vision'
  | 'voice-chat'
  | 'ai-tools'
  | 'settings'
  | 'profile'
  | 'premium'
  | 'help'
  | 'about';

export type AIToolType = 
  | 'writing'
  | 'summarizer'
  | 'translator'
  | 'grammar'
  | 'code'
  | 'math'
  | 'pdf-reader'
  | 'ocr';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style?: string;
  aspectRatio: string;
  timestamp: number;
  model?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
