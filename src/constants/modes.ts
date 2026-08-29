import { 
  Zap, 
  Sparkles, 
  GraduationCap, 
  Brain, 
  Cpu, 
  LucideIcon 
} from 'lucide-react';

export type XYBotModeId = 'xy-base' | 'xy-light' | 'xy-creative' | 'xy-student' | 'xy-neo';

export interface XYBotModeConfig {
  id: XYBotModeId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  bgGlow: string;
  gradient: string;
  accentColor: string;
  speedRating: number; // 1-5
  reasoningRating: number; // 1-5
  creativityRating: number; // 1-5
  systemInstruction: string;
  temperature: number;
  samplePrompts: { title: string; prompt: string }[];
  idealFor: string[];
}

export const XY_MODES: Record<XYBotModeId, XYBotModeConfig> = {
  'xy-base': {
    id: 'xy-base',
    name: 'XY Base',
    shortName: 'Base',
    tagline: 'Speed + Thinking (Default)',
    description: 'The balanced standard engine for XYBOT AI. Combines high-speed execution with smart reasoning for everyday chat, problem-solving, and coding.',
    badge: 'Speed + Thinking',
    icon: Cpu,
    color: 'text-[#00f2ff]',
    borderColor: 'border-[#00f2ff]/30 hover:border-[#00f2ff]',
    bgGlow: 'bg-[#00f2ff]/10',
    gradient: 'from-[#00f2ff]/20 to-[#7000ff]/20',
    accentColor: '#00f2ff',
    speedRating: 4,
    reasoningRating: 4,
    creativityRating: 4,
    temperature: 0.7,
    systemInstruction: `You are XYBOT AI in XY Base Mode — the versatile, all-around intelligent assistant balancing ultra-fast response speed with sharp logical thinking.
- Deliver precise, well-structured, and helpful answers.
- Use clear markdown formatting, headers, lists, and code blocks with syntax highlighting.
- Be friendly, efficient, and ready to assist across coding, general queries, drafting, and analysis.`,
    idealFor: ['Everyday general queries', 'Full-stack programming & debugging', 'Daily tasks & productivity', 'Conversational chat'],
    samplePrompts: [
      { title: 'Code Assistant', prompt: 'Write a responsive React component in TypeScript with modern Tailwind styling.' },
      { title: 'Action Plan', prompt: 'Create a 7-day productivity roadmap to launch a software prototype.' },
      { title: 'Concept Explanation', prompt: 'Explain how neural networks learn with practical analogies.' },
      { title: 'Quick Strategy', prompt: 'Draft a checklist for optimizing web application performance.' }
    ]
  },
  'xy-light': {
    id: 'xy-light',
    name: 'XY Light',
    shortName: 'Light',
    tagline: 'Super Speed Engine',
    description: 'Ultra-low latency inference tuned for instantaneous, crisp answers. Perfect for rapid lookups, instant summaries, and fast brainstorming.',
    badge: 'Super Speed',
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'border-amber-400/30 hover:border-amber-400',
    bgGlow: 'bg-amber-400/10',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    accentColor: '#fbbf24',
    speedRating: 5,
    reasoningRating: 3,
    creativityRating: 3,
    temperature: 0.3,
    systemInstruction: `You are XYBOT AI in XY Light Mode — engineered for SUPER SPEED and maximum brevity.
- Respond with extreme speed, directness, and precision.
- Skip fluff, filler introductions, and excessive pleasantries.
- Deliver bullet points, succinct summaries, direct definitions, and quick code fixes immediately.`,
    idealFor: ['Instant answers & definitions', 'Quick summaries & TL;DRs', 'Rapid code snippet lookups', 'Low-latency tasks'],
    samplePrompts: [
      { title: 'Quick TL;DR', prompt: 'Summarize quantum computing in exactly 3 bullet points.' },
      { title: 'Instant Syntax', prompt: 'Show the syntax for JavaScript Array.reduce with an example.' },
      { title: 'Fast Definition', prompt: 'Define entropy in physics in 2 sentences.' },
      { title: 'Speed Translate', prompt: 'Translate "Welcome to our futuristic AI platform" into Spanish, French, and Japanese.' }
    ]
  },
  'xy-creative': {
    id: 'xy-creative',
    name: 'XY Creative',
    shortName: 'Creative',
    tagline: 'Image Gen & Creative Writing',
    description: 'Designed for imaginative storytelling, poetic writing, world-building, and generating rich, photorealistic AI image prompts.',
    badge: 'Creative & Art',
    icon: Sparkles,
    color: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-400/30 hover:border-fuchsia-400',
    bgGlow: 'bg-fuchsia-400/10',
    gradient: 'from-fuchsia-500/20 to-pink-500/20',
    accentColor: '#e879f9',
    speedRating: 3,
    reasoningRating: 3,
    creativityRating: 5,
    temperature: 0.95,
    systemInstruction: `You are XYBOT AI in XY Creative Mode — a master creative writer, world-builder, poet, and AI visual prompt designer.
- Craft vivid, atmospheric stories, screenplays, lyrics, and conceptual world-building.
- When the user asks for image ideas or visual concepts, provide rich, highly detailed image generation prompts specifying lighting, style, composition, camera angles, and art mediums.
- Emphasize evocative metaphors, immersive prose, and creative originality.`,
    idealFor: ['Creative writing & screenplays', 'Image generation prompt crafting', 'Songwriting & poetry', 'Brainstorming unique concepts'],
    samplePrompts: [
      { title: 'Cyberpunk Story', prompt: 'Write an immersive opening scene of a cyber-noir detective entering an underground AI black market.' },
      { title: 'Image Prompt Studio', prompt: 'Craft a prompt for an 8k photorealistic image of a futuristic solarpunk floating city at golden hour.' },
      { title: 'World Building', prompt: 'Design a fantasy civilization that harnesses sound frequencies for architectural construction.' },
      { title: 'Poetic Verse', prompt: 'Write a poem about time dilation experienced by an interstellar traveler near a black hole.' }
    ]
  },
  'xy-student': {
    id: 'xy-student',
    name: 'XY Student',
    shortName: 'Student',
    tagline: 'Student Friendly Homework & Projects',
    description: 'Dedicated academic companion for students. Provides step-by-step homework breakdowns, STEM derivations, essay structuring, and revision flashcards.',
    badge: 'Homework & Projects',
    icon: GraduationCap,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/30 hover:border-emerald-400',
    bgGlow: 'bg-emerald-400/10',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accentColor: '#34d399',
    speedRating: 4,
    reasoningRating: 4,
    creativityRating: 3,
    temperature: 0.5,
    systemInstruction: `You are XYBOT AI in XY Student Mode — an empowering, patient, and pedagogical academic tutor designed specifically for students doing homework, research, and school/college projects.
- Break down math, physics, chemistry, biology, history, and coding problems STEP-BY-STEP.
- Explain "why" behind each step so the student genuinely learns the concepts.
- Provide formula definitions, diagrams formatted in clean ASCII/markdown, practice review questions, and structured project outlines.
- Keep tone supportive, encouraging, clear, and easy to understand.`,
    idealFor: ['Step-by-step homework solutions', 'Math & science derivations', 'Essay & project structuring', 'Exam preparation & flashcards'],
    samplePrompts: [
      { title: 'Math Homework', prompt: 'Solve step-by-step: Find the roots of 2x² - 7x + 3 = 0 using both factoring and the quadratic formula.' },
      { title: 'Science Concept', prompt: 'Explain the mechanism of CRISPR gene editing with an intuitive step-by-step guide for a biology class.' },
      { title: 'Project Roadmap', prompt: 'Create an outline and research plan for a high school science fair project on renewable solar energy.' },
      { title: 'Study Flashcards', prompt: 'Generate 5 high-yield study flashcards with question and answer for Newton\'s Laws of Motion.' }
    ]
  },
  'xy-neo': {
    id: 'xy-neo',
    name: 'XY Neo',
    shortName: 'Neo',
    tagline: 'End Power & Deep Reasoning',
    description: 'Maximum intellectual firepower. Engages deep chain-of-thought analysis, rigorous mathematical proofs, complex systems architecture, and first-principles reasoning.',
    badge: 'Deep Reasoning',
    icon: Brain,
    color: 'text-violet-400',
    borderColor: 'border-violet-400/30 hover:border-violet-400',
    bgGlow: 'bg-violet-400/10',
    gradient: 'from-violet-500/20 to-purple-500/20',
    accentColor: '#a78bfa',
    speedRating: 3,
    reasoningRating: 5,
    creativityRating: 4,
    temperature: 0.6,
    systemInstruction: `You are XYBOT AI in XY Neo Mode — the pinnacle deep-reasoning matrix of the system.
- Utilize exhaustive, first-principles logic and thorough chain-of-thought problem decomposition.
- For difficult mathematical, architectural, scientific, and philosophical questions: explore edge cases, evaluate competing hypotheses, verify mathematical integrity, and provide rigorous proofs.
- Offer deep architectural insights, security reviews, and optimal algorithmic strategies.`,
    idealFor: ['Deep logical reasoning & proofs', 'Complex software architecture', 'Advanced scientific & financial modeling', 'Multi-step strategic analysis'],
    samplePrompts: [
      { title: 'Deep Logic Proof', prompt: 'Derive and prove the time complexity of the Ford-Fulkerson algorithm for maximum network flow.' },
      { title: 'System Architecture', prompt: 'Architect a globally distributed, event-driven payment processing system handling 100k TPS with zero data loss.' },
      { title: 'Strategic Analysis', prompt: 'Perform a game-theory analysis of competitive pricing strategies in a duopoly market.' },
      { title: 'Code Optimization', prompt: 'Deeply analyze memory layout, cache locality, and SIMD vectorization for matrix multiplication in C++.' }
    ]
  }
};

export const DEFAULT_MODE_ID: XYBotModeId = 'xy-base';
