import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  UserProfile, 
  ChatSession, 
  Message, 
  AppSettings, 
  ActiveView, 
  ToastMessage, 
  PlanType, 
  PlanDetails, 
  GeneratedImage,
  ThemeAccent,
  XYBotModeId
} from '../types';
import { sounds } from '../lib/soundEffects';
import { XY_MODES, DEFAULT_MODE_ID } from '../constants/modes';

export const PLANS: Record<PlanType, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free Explorer',
    duration: 'Lifetime',
    durationMonths: 0,
    price: '₹0',
    priceInr: 0,
    imageLimit: 4,
    features: [
      'Access to standard chat models',
      '4 AI Image generations',
      'Basic camera & vision OCR',
      'Standard response speeds',
      'Chat history memory',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter Cyber',
    duration: '3 Months',
    durationMonths: 3,
    price: '₹199',
    priceInr: 199,
    imageLimit: 7,
    features: [
      'Everything in Free',
      '7 AI Image generations',
      'Faster response streaming',
      'Priority AI tools & translators',
      'Extended conversation context',
      'PDF & Document export',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Vanguard',
    duration: '6 Months',
    durationMonths: 6,
    price: '₹499',
    priceInr: 499,
    imageLimit: 10,
    popular: true,
    features: [
      'Everything in Starter',
      '10 AI Image generations',
      'High-resolution image render',
      'Voice chat real-time loop',
      'AI Code architect & Math solver',
      'Exclusive holographic theme',
      'Gold VIP badge & priority support',
    ],
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate Quantum',
    duration: '1 Year',
    durationMonths: 12,
    price: '₹999',
    priceInr: 999,
    imageLimit: 'unlimited',
    features: [
      'Everything in Pro',
      'Unlimited AI Image generations',
      'Maximum intelligence reasoning model',
      'Ultra-fast neural streaming',
      'Full OCR document parsing',
      'Custom futuristic avatars & wallpapers',
      'Dedicated quantum badge & VIP ribbon',
    ],
  },
};

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'usr_default_01',
    name: 'Quantum Navigator',
    email: 'cyber.explorer@xybot.ai',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    plan: 'free',
    tagline: 'Personal & General',
    color: 'cyan',
    imagesGeneratedCount: 0,
    totalPromptsCount: 0,
    totalWordsGenerated: 0,
    joinedDate: Date.now() - 1000 * 60 * 60 * 24 * 7,
    isDefault: true,
  },
  {
    id: 'usr_dev_arch',
    name: 'Dev Architect',
    email: 'dev.architect@xybot.ai',
    avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
    plan: 'free',
    tagline: 'Code & Engineering',
    color: 'purple',
    customInstruction: 'Focus on clean modular code, architectural precision, TypeScript and algorithm performance.',
    imagesGeneratedCount: 0,
    totalPromptsCount: 0,
    totalWordsGenerated: 0,
    joinedDate: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

const DEFAULT_USER = DEFAULT_PROFILES[0];

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  themeAccent: 'cyan',
  language: 'English',
  notificationsEnabled: true,
  soundEffectsEnabled: true,
  hapticFeedbackEnabled: true,
  autoSpeechEnabled: false,
  conversationMemory: true,
  temperature: 0.7,
  defaultModel: 'gemini-3.7-flash',
  defaultMode: 'xy-base',
  wallpaper: 'cyber-grid',
  passcodeEnabled: false,
  passcodeHash: '',
};

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  profiles: UserProfile[];
  activeProfileId: string;
  switchProfile: (profileId: string) => void;
  createProfile: (profileData: {
    name: string;
    email?: string;
    avatar?: string;
    tagline?: string;
    color?: string;
    plan?: PlanType;
    customInstruction?: string;
  }) => string;
  updateProfile: (profileId: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (profileId: string) => boolean;
  duplicateProfile: (profileId: string) => string;

  isLoggedIn: boolean;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  deleteAccount: () => void;
  clearCache: () => void;

  chats: ChatSession[];
  activeChatId: string | null;
  currentChat: ChatSession | null;
  createNewChat: (initialMessage?: string, initialMode?: XYBotModeId) => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  deleteAllChats: () => void;
  renameChat: (id: string, newTitle: string) => void;
  togglePinChat: (id: string) => void;
  setChatMode: (chatId: string, mode: XYBotModeId) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  updateMessageInChat: (chatId: string, messageId: string, newContent: string) => void;

  activeMode: XYBotModeId;
  setActiveMode: (mode: XYBotModeId) => void;

  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  isPremiumModalOpen: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  upgradePlan: (plan: PlanType) => void;
  cancelPlan: (pin: string) => boolean;
  canGenerateImage: boolean;
  remainingImageGenerations: number | string;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  isShortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;

  isPasscodeModalOpen: boolean;
  setPasscodeModalOpen: (open: boolean) => void;
  isAppLocked: boolean;
  setIsAppLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  unlockApp: (pin: string) => boolean;

  generatedImages: GeneratedImage[];
  addGeneratedImage: (img: GeneratedImage) => void;
  incrementImageGenerationCount: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'aether_user_v2',
  PROFILES: 'aether_profiles_v3',
  ACTIVE_PROFILE_ID: 'aether_active_profile_id_v3',
  CHATS: 'aether_chats_v2',
  SETTINGS: 'aether_settings_v2',
  IMAGES: 'aether_images_v2',
  ACTIVE_CHAT: 'aether_active_chat_v2',
  AUTH: 'aether_auth_state_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Profiles & Active Profile
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate from legacy single user if present
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          return [{ ...parsedUser, isDefault: true, tagline: parsedUser.tagline || 'Primary ID', color: parsedUser.color || 'cyan' }, DEFAULT_PROFILES[1]];
        }
      }
      return DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
      if (savedId) return savedId;
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) return parsed.id;
      }
      return DEFAULT_PROFILES[0].id;
    } catch {
      return DEFAULT_PROFILES[0].id;
    }
  });

  // Active User object synced with active profile
  const [user, setUserState] = useState<UserProfile>(() => {
    try {
      const found = profiles.find((p) => p.id === activeProfileId);
      return found || profiles[0] || DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Keep user state in sync when activeProfileId or profiles change
  useEffect(() => {
    const active = profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_USER;
    setUserState(active);
  }, [activeProfileId, profiles]);

  const setUser: React.Dispatch<React.SetStateAction<UserProfile>> = (value) => {
    setUserState((prev) => {
      const updated = typeof value === 'function' ? (value as (prev: UserProfile) => UserProfile)(prev) : value;
      // Sync into profiles array
      setProfiles((currentProfiles) =>
        currentProfiles.map((p) => (p.id === updated.id ? updated : p))
      );
      return updated;
    });
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) !== 'false';
    } catch {
      return true;
    }
  });

  // 2. Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 3. Chats
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fall through to initial demo chat
    }
    const initialDemo: ChatSession = {
      id: 'chat_welcome',
      title: 'Welcome to XYBOT AI',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: true,
      model: 'gemini-3.7-flash',
      mode: 'xy-base',
      messages: [
        {
          id: 'msg_welcome_1',
          role: 'assistant',
          content: `# 🚀 Greetings from **XYBOT AI**\n\nWelcome to your next-generation neural intelligence platform. I come equipped with 5 specialized intelligence modes:\n\n* ⚡ **XY Light**: Ultra-low latency engine for super speed and instantaneous answers\n* 🎨 **XY Creative**: Imaginative storytelling, poetry, and rich AI image prompt design\n* 🎓 **XY Student**: Student-friendly mentor for step-by-step homework, derivations & projects\n* 🧠 **XY Neo**: End power and deep chain-of-thought reasoning for complex problem solving\n* 💠 **XY Base**: Balanced speed + smart thinking (default daily driver)\n\nSwitch modes at any time in the header or ask me anything to get started!`,
          timestamp: Date.now(),
          suggestedFollowUps: [
            'Try XY Light for a quick summary',
            'Help me solve homework in XY Student mode',
            'Deep dive into a problem in XY Neo mode',
            'Generate a creative image prompt',
          ],
        },
      ],
    };
    return [initialDemo];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT) || 'chat_welcome';
    } catch {
      return 'chat_welcome';
    }
  });

  // Active Mode State
  const [activeMode, setActiveModeState] = useState<XYBotModeId>(() => {
    return settings.defaultMode || 'xy-base';
  });

  const setActiveMode = (newMode: XYBotModeId) => {
    sounds.playClick();
    setActiveModeState(newMode);
    // If active chat exists, update its mode too
    if (activeChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, mode: newMode } : c))
      );
    }
    const modeConfig = XY_MODES[newMode];
    showToast({
      type: 'info',
      title: `Switched to ${modeConfig.name}`,
      message: `${modeConfig.tagline} is now active.`,
    });
  };

  // Sync mode when activeChat changes
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find((c) => c.id === activeChatId);
      if (activeChat && activeChat.mode && activeChat.mode !== activeMode) {
        setActiveModeState(activeChat.mode);
      }
    }
  }, [activeChatId]);

  // 4. Generated images gallery
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IMAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Navigation & UI state
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setPremiumModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 6. Security Lock
  const [isPasscodeModalOpen, setPasscodeModalOpen] = useState<boolean>(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return settings.passcodeEnabled && Boolean(settings.passcodeHash);
  });

  // 7. Online status
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({ type: 'success', title: 'Network Restored', message: 'Connected back to Aether Core' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast({ type: 'warning', title: 'Offline Mode', message: 'You are disconnected from the internet' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync sounds state with settings
  useEffect(() => {
    sounds.enabled = settings.soundEffectsEnabled;
    sounds.haptics = settings.hapticFeedbackEnabled;
  }, [settings.soundEffectsEnabled, settings.hapticFeedbackEnabled]);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, activeProfileId);
    } catch {}
  }, [activeProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch {}
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(generatedImages));
    } catch {}
  }, [generatedImages]);

  useEffect(() => {
    try {
      if (activeChatId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, activeChatId);
      }
    } catch {}
  }, [activeChatId]);

  // Toasts helper
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 3500 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Premium Image Limit Logic
  const planInfo = PLANS[user.plan];
  const isUnlimited = planInfo.imageLimit === 'unlimited';
  const remainingImageGenerations = isUnlimited 
    ? 'Unlimited' 
    : Math.max(0, (planInfo.imageLimit as number) - user.imagesGeneratedCount);
  const canGenerateImage = isUnlimited || (remainingImageGenerations as number) > 0;

  const openPremiumModal = () => {
    sounds.playClick();
    setPremiumModalOpen(true);
  };

  const closePremiumModal = () => {
    sounds.playClick();
    setPremiumModalOpen(false);
  };

  const upgradePlan = (newPlan: PlanType) => {
    sounds.playSuccess();
    const details = PLANS[newPlan];
    const expires = details.durationMonths > 0 ? Date.now() + (details.durationMonths * 30 * 24 * 60 * 60 * 1000) : undefined;
    
    setUser((prev) => ({
      ...prev,
      plan: newPlan,
      planExpiresAt: expires,
      imagesGeneratedCount: 0, // Reset counter on upgrade
    }));

    showToast({
      type: 'success',
      title: `Plan Upgraded to ${details.name}!`,
      message: `You now have ${details.imageLimit === 'unlimited' ? 'unlimited' : details.imageLimit} image generations.`,
    });
    setPremiumModalOpen(false);
  };

  const cancelPlan = (pin: string): boolean => {
    // Validate 4-digit PIN against saved passcode if set, or require valid 4-digit string
    const requiredPin = settings.passcodeHash;
    if (requiredPin && requiredPin.length > 0) {
      if (pin !== requiredPin) {
        sounds.triggerHaptic('heavy');
        showToast({
          type: 'error',
          title: 'Incorrect Passcode',
          message: 'The 4-digit security PIN entered does not match.',
        });
        return false;
      }
    } else {
      // If user hasn't configured a passcode yet, validate that it's a 4-digit PIN
      if (!/^\d{4}$/.test(pin)) {
        showToast({
          type: 'error',
          title: 'Invalid PIN',
          message: 'Please enter a valid 4-digit security PIN code.',
        });
        return false;
      }
      // Save this verified PIN into settings
      setSettings((prev) => ({ ...prev, passcodeHash: pin }));
    }

    sounds.playSuccess();
    setUser((prev) => ({
      ...prev,
      plan: 'free',
      planExpiresAt: undefined,
      imagesGeneratedCount: Math.min(prev.imagesGeneratedCount, 4),
    }));

    showToast({
      type: 'info',
      title: 'Plan Cancelled',
      message: 'Your subscription has been cancelled and downgraded to Free tier.',
    });
    return true;
  };

  // Auth Operations
  const loginAsGuest = () => {
    sounds.playSuccess();
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_guest_' + Date.now(),
      name: 'Guest Explorer',
      email: 'guest@aether.ai',
      isGuest: true,
    };
    setUser(guestUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    showToast({ type: 'info', title: 'Welcome, Guest!', message: 'Explore all AI capabilities.' });
  };

  const loginWithEmail = (email: string, name?: string) => {
    sounds.playSuccess();
    const username = name || email.split('@')[0] || 'Navigator';
    const authedUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: email,
      isGuest: false,
    };
    setUser(authedUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    showToast({ type: 'success', title: 'Logged In Successfully', message: `Welcome back, ${authedUser.name}` });
  };

  const loginWithGoogle = () => {
    sounds.playSuccess();
    const googleUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_g_' + Date.now(),
      name: 'Rage Explorer',
      email: 'rage99582@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isGuest: false,
    };
    setUser(googleUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    showToast({ type: 'success', title: 'Google Sign-In Connected', message: 'Logged in with Google Account' });
  };

  const logout = () => {
    sounds.playClick();
    setIsLoggedIn(false);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    showToast({ type: 'info', title: 'Signed Out', message: 'You have been signed out safely.' });
  };

  const deleteAccount = () => {
    sounds.playClick();
    localStorage.clear();
    setProfiles(DEFAULT_PROFILES);
    setActiveProfileId(DEFAULT_PROFILES[0].id);
    setUserState(DEFAULT_PROFILES[0]);
    setChats([]);
    setGeneratedImages([]);
    setSettings(DEFAULT_SETTINGS);
    setIsLoggedIn(false);
    showToast({ type: 'warning', title: 'Account Reset', message: 'All local data, credentials, and chats have been erased.' });
  };

  const clearCache = () => {
    sounds.playSuccess();
    setGeneratedImages([]);
    showToast({ type: 'success', title: 'Cache Cleared', message: 'Image and temporary caches purged successfully.' });
  };

  // Multi-Profile / Multi-ID Operations
  const switchProfile = (profileId: string) => {
    sounds.playSuccess();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    setActiveProfileId(profileId);
    setUserState(target);
    showToast({
      type: 'info',
      title: `Switched ID: ${target.name}`,
      message: target.tagline ? `Profile mode: ${target.tagline}` : `Switched to ${target.name}`,
    });
  };

  const createProfile = (profileData: {
    name: string;
    email?: string;
    avatar?: string;
    tagline?: string;
    color?: string;
    plan?: PlanType;
    customInstruction?: string;
  }): string => {
    sounds.playSuccess();
    const newId = 'prof_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newProfile: UserProfile = {
      id: newId,
      name: profileData.name.trim() || 'New Persona',
      email: profileData.email?.trim() || `${profileData.name.toLowerCase().replace(/\s+/g, '.') || 'user'}@xybot.ai`,
      avatar: profileData.avatar || 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
      plan: profileData.plan || user.plan || 'free',
      tagline: profileData.tagline?.trim() || 'Custom Persona',
      color: profileData.color || 'cyan',
      customInstruction: profileData.customInstruction?.trim(),
      imagesGeneratedCount: 0,
      totalPromptsCount: 0,
      totalWordsGenerated: 0,
      joinedDate: Date.now(),
      isDefault: false,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newId);
    setUserState(newProfile);

    showToast({
      type: 'success',
      title: 'New Profile ID Created',
      message: `Switched to "${newProfile.name}" (${newProfile.tagline})`,
    });

    return newId;
  };

  const updateProfile = (profileId: string, updates: Partial<UserProfile>) => {
    sounds.playSuccess();
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
    if (activeProfileId === profileId) {
      setUserState((prev) => ({ ...prev, ...updates }));
    }
    showToast({ type: 'success', title: 'Profile Updated' });
  };

  const deleteProfile = (profileId: string): boolean => {
    if (profiles.length <= 1) {
      sounds.triggerHaptic('heavy');
      showToast({
        type: 'warning',
        title: 'Cannot Delete ID',
        message: 'You must maintain at least one active profile ID.',
      });
      return false;
    }

    sounds.playClick();
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);

    if (activeProfileId === profileId) {
      const nextProfile = remaining[0];
      setActiveProfileId(nextProfile.id);
      setUserState(nextProfile);
      showToast({
        type: 'info',
        title: 'Profile ID Removed',
        message: `Switched back to "${nextProfile.name}".`,
      });
    } else {
      showToast({ type: 'info', title: 'Profile ID Deleted' });
    }

    return true;
  };

  const duplicateProfile = (profileId: string): string => {
    sounds.playSuccess();
    const source = profiles.find((p) => p.id === profileId) || user;
    const newId = 'prof_' + Date.now().toString(36);
    const duplicated: UserProfile = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      tagline: source.tagline ? `${source.tagline} (Copy)` : 'Secondary ID',
      isDefault: false,
      joinedDate: Date.now(),
    };

    setProfiles((prev) => [...prev, duplicated]);
    showToast({ type: 'success', title: 'Profile ID Cloned', message: `Created "${duplicated.name}"` });
    return newId;
  };

  // Chat Actions
  const currentChat = chats.find((c) => c.id === activeChatId) || null;

  const setChatMode = (chatId: string, mode: XYBotModeId) => {
    sounds.playClick();
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, mode } : c))
    );
    if (activeChatId === chatId) {
      setActiveModeState(mode);
    }
  };

  const createNewChat = (initialMessage?: string, initialMode?: XYBotModeId): string => {
    sounds.playClick();
    const newId = 'chat_' + Date.now();
    const modeToUse = initialMode || activeMode || settings.defaultMode || 'xy-base';
    const newChat: ChatSession = {
      id: newId,
      title: initialMessage ? initialMessage.slice(0, 32) : 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.defaultModel,
      mode: modeToUse,
      messages: initialMessage ? [
        {
          id: 'msg_' + Date.now(),
          role: 'user',
          content: initialMessage,
          timestamp: Date.now(),
        }
      ] : [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
    setActiveModeState(modeToUse);
    setActiveView('chat');
    return newId;
  };

  const selectChat = (id: string) => {
    sounds.playClick();
    setActiveChatId(id);
    setActiveView('chat');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = (id: string) => {
    sounds.playClick();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      const remaining = chats.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId(null);
        setActiveView('home');
      }
    }
    showToast({ type: 'info', title: 'Chat Deleted', message: 'Conversation removed from history.' });
  };

  const deleteAllChats = () => {
    sounds.playClick();
    setChats([]);
    setActiveChatId(null);
    setActiveView('home');
    showToast({ type: 'info', title: 'History Cleared', message: 'All conversations have been removed.' });
  };

  const renameChat = (id: string, newTitle: string) => {
    sounds.playClick();
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
    showToast({ type: 'success', title: 'Chat Renamed', message: `Title updated to "${newTitle}"` });
  };

  const togglePinChat = (id: string) => {
    sounds.playClick();
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          // If first user message, generate smart title
          let title = chat.title;
          if (chat.messages.length === 0 && message.role === 'user') {
            title = message.content.trim().slice(0, 36) || 'New Conversation';
          }
          return {
            ...chat,
            title,
            updatedAt: Date.now(),
            messages: [...chat.messages, message],
          };
        }
        return chat;
      })
    );

    // Update user stats
    if (message.role === 'user') {
      setUser((prev) => ({
        ...prev,
        totalPromptsCount: prev.totalPromptsCount + 1,
      }));
    } else {
      const wordCount = message.content.split(/\s+/).length;
      setUser((prev) => ({
        ...prev,
        totalWordsGenerated: prev.totalWordsGenerated + wordCount,
      }));
    }
  };

  const updateMessageInChat = (chatId: string, messageId: string, newContent: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            updatedAt: Date.now(),
            messages: chat.messages.map((m) =>
              m.id === messageId ? { ...m, content: newContent } : m
            ),
          };
        }
        return chat;
      })
    );
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    sounds.playClick();
    setSettings((prev) => ({ ...prev, ...partial }));
    showToast({ type: 'success', title: 'Settings Saved' });
  };

  const toggleSidebar = () => {
    sounds.playClick();
    setSidebarOpen((prev) => !prev);
  };

  const addGeneratedImage = (img: GeneratedImage) => {
    setGeneratedImages((prev) => [img, ...prev]);
    setUser((prev) => ({
      ...prev,
      imagesGeneratedCount: prev.imagesGeneratedCount + 1,
    }));
  };

  const incrementImageGenerationCount = () => {
    setUser((prev) => ({
      ...prev,
      imagesGeneratedCount: prev.imagesGeneratedCount + 1,
    }));
  };

  const unlockApp = (pin: string): boolean => {
    if (!settings.passcodeHash || settings.passcodeHash === pin) {
      sounds.playSuccess();
      setIsAppLocked(false);
      showToast({ type: 'success', title: 'App Unlocked' });
      return true;
    } else {
      sounds.triggerHaptic('heavy');
      showToast({ type: 'error', title: 'Incorrect Passcode', message: 'Please try again.' });
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        profiles,
        activeProfileId,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        duplicateProfile,

        isLoggedIn,
        loginAsGuest,
        loginWithEmail,
        loginWithGoogle,
        logout,
        deleteAccount,
        clearCache,

        chats,
        activeChatId,
        currentChat,
        createNewChat,
        selectChat,
        deleteChat,
        deleteAllChats,
        renameChat,
        togglePinChat,
        setChatMode,
        addMessageToChat,
        updateMessageInChat,

        activeMode,
        setActiveMode,

        activeView,
        setActiveView,

        settings,
        updateSettings,

        toasts,
        showToast,
        removeToast,

        isPremiumModalOpen,
        openPremiumModal,
        closePremiumModal,
        upgradePlan,
        cancelPlan,
        canGenerateImage,
        remainingImageGenerations,

        isSidebarOpen,
        toggleSidebar,
        setSidebarOpen,

        isShortcutsOpen,
        setShortcutsOpen,

        isPasscodeModalOpen,
        setPasscodeModalOpen,
        isAppLocked,
        setIsAppLocked,
        isLocked: isAppLocked,
        setIsLocked: setIsAppLocked,
        unlockApp,

        generatedImages,
        addGeneratedImage,
        incrementImageGenerationCount,

        searchQuery,
        setSearchQuery,

        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
