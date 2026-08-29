import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Copy, 
  Crown, 
  Check, 
  Flame, 
  Layers, 
  Maximize2, 
  Wand2, 
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { GeneratedImage } from '../../types';
import { sounds } from '../../lib/soundEffects';

export const ImageGenView: React.FC = () => {
  const { 
    user, 
    openPremiumModal, 
    remainingImageGenerations, 
    incrementImageGenerationCount, 
    showToast 
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk Neon');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [copied, setCopied] = useState(false);

  const stylePresets = [
    { name: 'Cyberpunk Neon', promptSuffix: ', cyberpunk aesthetic, neon lights, highly detailed 8k, futuristic cityscape' },
    { name: '3D Sci-Fi Render', promptSuffix: ', unreal engine 5 render, octane render, volumetric lighting, photorealistic sci-fi' },
    { name: 'Holographic Matrix', promptSuffix: ', luminous cyan and magenta holographic wireframe, glowing translucent particles' },
    { name: 'Photorealistic', promptSuffix: ', cinematic photograph, 85mm lens, depth of field, 8k resolution, natural lighting' },
    { name: 'Anime Mecha', promptSuffix: ', makoto shinkai style, vibrant anime mecha illustration, dramatic lighting' },
    { name: 'Synthwave Retro', promptSuffix: ', 80s synthwave, retrowave grid, purple sunset, retro-futurism' },
  ];

  const aspectRatios: { id: '1:1' | '16:9' | '9:16' | '4:3'; label: string; desc: string }[] = [
    { id: '1:1', label: 'Square (1:1)', desc: 'Instagram / Avatar' },
    { id: '16:9', label: 'Landscape (16:9)', desc: 'Wallpaper / Desktop' },
    { id: '9:16', label: 'Portrait (9:16)', desc: 'Story / Mobile' },
    { id: '4:3', label: 'Standard (4:3)', desc: 'Classic Display' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check user quota
    if (user.plan === 'free' && user.imagesGeneratedCount >= 4) {
      sounds.playError();
      showToast({
        type: 'warning',
        title: 'Image Quota Exceeded',
        message: 'You have reached your 4 free image generations limit. Upgrade to VIP to generate more!',
      });
      openPremiumModal();
      return;
    }

    setIsGenerating(true);
    sounds.playClick();

    const selectedPreset = stylePresets.find((s) => s.name === selectedStyle);
    const fullPrompt = prompt.trim() + (selectedPreset ? selectedPreset.promptSuffix : '');

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: aspectRatio,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || 'Invalid response from image synthesis server' };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to synthesize image');
      }

      const newImage: GeneratedImage = {
        id: 'img_' + Date.now(),
        url: data.imageUrl,
        prompt: prompt.trim(),
        aspectRatio: aspectRatio,
        timestamp: Date.now(),
      };

      setCurrentImage(newImage);
      setGallery((prev) => [newImage, ...prev]);
      incrementImageGenerationCount();
      sounds.playReceive();
      showToast({ type: 'success', title: 'Image Generated' });
    } catch (err: any) {
      console.error(err);
      sounds.playError();
      showToast({ type: 'error', title: 'Generation Failed', message: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string, promptText: string) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `aether_ai_${promptText.slice(0, 15).replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast({ type: 'success', title: 'Image Downloaded' });
  };

  const handleCopyPrompt = () => {
    if (currentImage) {
      navigator.clipboard.writeText(currentImage.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ type: 'success', title: 'Prompt Copied' });
    }
  };

  const quickInspirePrompts = [
    'A futuristic cybernetic tiger prowling neon-lit alleyways of Neo Tokyo',
    'A sleek crystalline spacecraft orbiting a purple ringed gas giant in deep space',
    'A glowing holographic neural brain floating inside an obsidian quantum laboratory',
    'An ancient mystical cyber-temple nestled within a dense bioluminescent jungle',
  ];

  return (
    <div
      id="image_generator_viewport"
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              XYBOT AI Image Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize high-fidelity sci-fi renders and artwork with XY Creative intelligence.
          </p>
        </div>

        {/* Quota display */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex items-center gap-2 shadow-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-slate-400">Generations Left: </span>
              <span className="font-bold text-amber-300">
                {user.plan === 'free' ? `${remainingImageGenerations} / 4 Free` : 'VIP Active'}
              </span>
            </div>
          </div>

          {user.plan === 'free' && (
            <button
              onClick={openPremiumModal}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-extrabold shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Get Unlimited</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Generator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Box */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-purple-500/25 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Image Prompt
              </label>
              <button
                onClick={() => {
                  const randomPrompt = quickInspirePrompts[Math.floor(Math.random() * quickInspirePrompts.length)];
                  setPrompt(randomPrompt);
                }}
                className="text-[11px] text-purple-300 hover:text-purple-200 font-semibold"
              >
                Surprise Me 🎲
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create in vivid visual detail..."
              rows={4}
              className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-purple-400 outline-none resize-none leading-relaxed"
            />

            {/* Style Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Aesthetic Style Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stylePresets.map((st) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setSelectedStyle(st.name)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      selectedStyle === st.name
                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Picker */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Aspect Ratio Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      aspectRatio === ar.id
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>{ar.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{ar.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                !prompt.trim() || isGenerating
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 hover:brightness-110 text-white shadow-purple-500/25 active:scale-98'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Neural Render...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Art</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Showcase Column (Right) */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[420px] rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Output Preview
              </span>

              {currentImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy Prompt"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(currentImage.url, currentImage.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="flex-1 flex items-center justify-center my-4 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-center p-8">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" />
                  <span className="text-sm font-bold text-white">Rendering Neural Pixels...</span>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Applying volumetric diffusion shaders and {selectedStyle} prompt weights.
                  </p>
                </div>
              ) : currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.prompt}
                  className="max-h-[480px] w-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center text-slate-500 p-8">
                  <Layers className="w-12 h-12 text-slate-700" />
                  <span className="text-sm font-medium text-slate-400">Ready to synthesize</span>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Enter a prompt or pick a preset style to begin your AI generation.
                  </p>
                </div>
              )}
            </div>

            {/* Prompt caption if image generated */}
            {currentImage && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold flex-shrink-0">Prompt:</span>
                <span className="italic">{currentImage.prompt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generation History Gallery */}
      {gallery.length > 0 && (
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Session Art Vault ({gallery.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                onClick={() => setCurrentImage(img)}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-purple-400/60 bg-slate-950 cursor-pointer transition-all aspect-square"
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[11px] text-white font-medium line-clamp-2">{img.prompt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
