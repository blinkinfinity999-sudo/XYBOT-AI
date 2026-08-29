import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CameraModal } from '../chat/CameraModal';
import { 
  Eye, 
  Camera, 
  Upload, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Calculator, 
  Code, 
  RefreshCw,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sounds } from '../../lib/soundEffects';

export const VisionView: React.FC = () => {
  const { createNewChat, showToast } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [prompt, setPrompt] = useState('Extract and transcribe all text, formulas, or diagrams accurately from this image.');
  const [visionMode, setVisionMode] = useState<'ocr' | 'general' | 'math' | 'code'>('ocr');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const visionModes = [
    { id: 'ocr' as const, label: 'Document & Handwriting OCR', prompt: 'Perform complete, accurate OCR transcription on all text and handwriting in this image. Format with Markdown.' },
    { id: 'general' as const, label: 'Visual Scene Analysis', prompt: 'Analyze this image in high detail. Describe all prominent objects, spatial relationships, and contextual cues.' },
    { id: 'math' as const, label: 'Math & Formula Solver', prompt: 'Solve the math problem, equation, or STEM chart shown in this image step-by-step with complete formulas and explanations.' },
    { id: 'code' as const, label: 'Code & Diagram Explainer', prompt: 'Identify any code, architectural diagram, or UI flowchart in this image. Transcribe the code or explain the system architecture.' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast({ type: 'error', title: 'File Too Large', message: 'Please select an image under 15MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeChange = (modeId: 'ocr' | 'general' | 'math' | 'code') => {
    setVisionMode(modeId);
    const target = visionModes.find((m) => m.id === modeId);
    if (target) setPrompt(target.prompt);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage || isAnalyzing) return;

    setIsAnalyzing(true);
    sounds.playSend();

    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          prompt: prompt,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || 'Invalid response from vision engine' };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze visual data');
      }

      setAnalysisResult(data.text);
      sounds.playReceive();
      showToast({ type: 'success', title: 'Analysis Complete' });
    } catch (err: any) {
      console.error(err);
      sounds.playError();
      showToast({ type: 'error', title: 'Vision Scan Failed', message: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueInChat = () => {
    if (!analysisResult) return;
    createNewChat(`Regarding this visual analysis:\n\n${analysisResult.slice(0, 300)}...`);
  };

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ type: 'success', title: 'Transcribed Text Copied' });
    }
  };

  const handleSpeak = () => {
    if (!analysisResult || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(analysisResult.replace(/[*#_`]/g, ''));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      id="vision_ocr_viewport"
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-6"
    >
      {/* Header Banner */}
      <div className="pb-4 border-b border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Eye className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              XYBOT Vision & OCR Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time visual comprehension, OCR text extraction, homework scanning, and STEM chart decoding.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source & Config */}
        <div className="lg:col-span-5 space-y-4">
          {/* Image Input Container */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-emerald-500/25 backdrop-blur-xl shadow-xl space-y-4">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              1. Image Source
            </label>

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 aspect-video flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Source"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-900 text-slate-400 hover:text-white transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="p-6 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 flex flex-col items-center gap-2 transition-all"
                >
                  <Camera className="w-7 h-7 text-cyan-400" />
                  <span className="text-xs font-bold">Open Camera</span>
                  <span className="text-[10px] text-slate-400">Live Device Capture</span>
                </button>

                <label className="p-6 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 flex flex-col items-center gap-2 transition-all cursor-pointer">
                  <Upload className="w-7 h-7 text-purple-400" />
                  <span className="text-xs font-bold">Upload File</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}

            {/* Analysis Mode selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                2. Intelligence Objective
              </label>
              <div className="grid grid-cols-2 gap-2">
                {visionModes.map((vm) => (
                  <button
                    key={vm.id}
                    type="button"
                    onClick={() => handleModeChange(vm.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      visionMode === vm.id
                        ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {vm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                3. Custom Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none resize-none"
              />
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleRunAnalysis}
              disabled={!selectedImage || isAnalyzing}
              className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                !selectedImage || isAnalyzing
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white shadow-emerald-500/25 active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Decoding Visual Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Vision Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Output Showcase */}
        <div className="lg:col-span-7">
          <div className="min-h-[420px] rounded-3xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Extracted Insights
              </span>

              {analysisResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeak}
                    className={`p-2 rounded-xl border border-slate-700 ${
                      isSpeaking ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop narration' : 'Listen with TTS'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy Transcribed Content"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleContinueInChat}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat With It</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="flex-1 my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 overflow-y-auto max-h-[500px] leading-relaxed">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-semibold">Performing Optical Neural Recognition...</span>
                </div>
              ) : analysisResult ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysisResult}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-500">
                  <Eye className="w-10 h-10 text-slate-700" />
                  <span className="text-xs">Take a photo or upload an image to see extracted intelligence.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(base64, customPrompt) => {
          setSelectedImage(base64);
          if (customPrompt) setPrompt(customPrompt);
        }}
      />
    </div>
  );
};
