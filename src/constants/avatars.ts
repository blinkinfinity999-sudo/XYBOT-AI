export interface PresetAvatar {
  id: string;
  name: string;
  category: 'Cyberpunk' | 'Modern 3D' | 'Minimalist' | 'Anime' | 'Abstract';
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'cyber-nav',
    name: 'Quantum Pilot',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'neon-tech',
    name: 'Neon Architect',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-samurai',
    name: 'Cyber Sentinel',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'holo-girl',
    name: 'Aetheria',
    category: 'Modern 3D',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'neo-scholar',
    name: 'Neuro Scholar',
    category: 'Modern 3D',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'code-wizard',
    name: 'Code Alchemist',
    category: 'Modern 3D',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'minimal-zen',
    name: 'Zen Core',
    category: 'Minimalist',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'abstract-matrix',
    name: 'Neural Flux',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cosmic-astral',
    name: 'Astral Voyager',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ai-creative',
    name: 'Studio Director',
    category: 'Minimalist',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
];

export const PROFILE_COLOR_PRESETS: { id: string; name: string; hex: string; bg: string; border: string; text: string }[] = [
  { id: 'cyan', name: 'Cyan Neon', hex: '#00f2ff', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  { id: 'purple', name: 'Quantum Purple', hex: '#a855f7', bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  { id: 'emerald', name: 'Matrix Emerald', hex: '#10b981', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  { id: 'rose', name: 'Cyber Rose', hex: '#f43f5e', bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400' },
  { id: 'amber', name: 'Solar Amber', hex: '#f59e0b', bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  { id: 'sky', name: 'Hyper Sky', hex: '#0ea5e9', bg: 'bg-sky-500/20', border: 'border-sky-500/50', text: 'text-sky-400' },
];
