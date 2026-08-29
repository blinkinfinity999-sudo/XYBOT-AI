import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  PenTool, 
  FileText, 
  Globe, 
  CheckCheck, 
  Code, 
  Calculator, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  MessageSquare, 
  RefreshCw,
  FileDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sounds } from '../../lib/soundEffects';

type ToolId = 'writing' | 'summarizer' | 'translator' | 'grammar' | 'code' | 'math' | 'pdf';

export const AIToolsView: React.FC = () => {
  const { createNewChat, showToast } = useApp();
  const [activeTool, setActiveTool] = useState<ToolId>('writing');
  const [inputText, setInputText] = useState('');
  const [secondaryInput, setSecondaryInput] = useState(''); // e.g. target language or code language
  const [outputResult, setOutputResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools: { id: ToolId; name: string; icon: React.FC<any>; desc: string; placeholder: string; options?: string[] }[] = [
    {
      id: 'writing',
      name: 'Writing Studio',
      icon: PenTool,
      desc: 'Craft articles, professional emails, essays, and stories',
      placeholder: 'Enter your topic, bullet points, or instructions for the draft...',
      options: ['Professional Email', 'Engaging Blog Post', 'Executive Pitch', 'Creative Sci-Fi Story', 'Academic Essay'],
    },
    {
      id: 'summarizer',
      name: 'Text Summarizer',
      icon: FileText,
      desc: 'Condense long articles and documents into concise takeaways',
      placeholder: 'Paste the article or long document text here to summarize...',
      options: ['Executive 3-Bullet Summary', 'Comprehensive Outline', 'Quick TL;DR', 'Key Insights & Action Items'],
    },
    {
      id: 'translator',
      name: 'Neural Translator',
      icon: Globe,
      desc: 'Translate accurately with natural tone across 20+ languages',
      placeholder: 'Enter the text you want translated...',
      options: ['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Arabic', 'Portuguese', 'Italian', 'Russian'],
    },
    {
      id: 'grammar',
      name: 'Grammar & Tone Refiner',
      icon: CheckCheck,
      desc: 'Detect typos, polish vocabulary, and improve sentence flow',
      placeholder: 'Paste your draft here to refine grammar and flow...',
      options: ['Professional & Formal', 'Persuasive & Confident', 'Clear & Concise', 'Casual & Friendly'],
    },
    {
      id: 'code',
      name: 'Code Architect & Debugger',
      icon: Code,
      desc: 'Generate functions, debug errors, and optimize algorithms',
      placeholder: 'Paste code or describe the programming task...',
      options: ['TypeScript / React', 'Python / AI', 'SQL / Database', 'Go / Backend', 'Rust / Systems'],
    },
    {
      id: 'math',
      name: 'STEM & Math Solver',
      icon: Calculator,
      desc: 'Solve algebraic equations, calculus, physics, and statistics step-by-step',
      placeholder: 'Enter your math problem, formula, or word problem...',
      options: ['Step-by-Step Proof', 'Direct Answer & Formula', 'Intuitive Real-World Explanation'],
    },
    {
      id: 'pdf',
      name: 'Document & OCR Extractor',
      icon: FileDown,
      desc: 'Extract tables, key stats, and action items from document text',
      placeholder: 'Paste document content or transcription to parse...',
      options: ['Extract Data Tables', 'Identify Action Items', 'Extract Key Metrics', 'Document Q&A'],
    },
  ];

  const currentToolConfig = tools.find((t) => t.id === activeTool)!;

  const handleRunTool = async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    sounds.playSend();

    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: activeTool,
          input: inputText.trim(),
          option: secondaryInput || (currentToolConfig.options ? currentToolConfig.options[0] : ''),
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || 'Invalid response from tool executor' };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Execution failed');
      }

      setOutputResult(data.result);
      sounds.playReceive();
      showToast({ type: 'success', title: 'Task Completed' });
    } catch (err: any) {
      console.error(err);
      sounds.playError();
      showToast({ type: 'error', title: 'Tool Failed', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (outputResult) {
      navigator.clipboard.writeText(outputResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ type: 'success', title: 'Copied to Clipboard' });
    }
  };

  const handleOpenInChat = () => {
    if (!outputResult) return;
    createNewChat(`Continue working on this ${currentToolConfig.name} output:\n\n${outputResult.slice(0, 300)}...`);
  };

  return (
    <div
      id="ai_tools_viewport"
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-6"
    >
      {/* Header */}
      <div className="pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <Wrench className="w-5 h-5" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            XYBOT Intelligence Tool Suite
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Specialized intelligent tools optimized for writing, code, math, homework, and translation.
        </p>
      </div>

      {/* Tool Selector Horizontal Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setSecondaryInput('');
                setOutputResult('');
              }}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-amber-500/25 backdrop-blur-xl shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">{currentToolConfig.name}</h3>
              <p className="text-xs text-slate-400">{currentToolConfig.desc}</p>
            </div>

            {/* Sub-option pills / select */}
            {currentToolConfig.options && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Preset Mode / Tone
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {currentToolConfig.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSecondaryInput(opt)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        (secondaryInput || currentToolConfig.options![0]) === opt
                          ? 'bg-amber-500/30 border-amber-400 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input textarea */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Input Content
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentToolConfig.placeholder}
                rows={7}
                className="w-full p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleRunTool}
              disabled={!inputText.trim() || isLoading}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-amber-500/25 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Result</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Results Panel */}
        <div className="lg:col-span-7">
          <div className="min-h-[440px] rounded-3xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generated Intelligence
              </span>

              {outputResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleOpenInChat}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in Chat</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results body */}
            <div className="flex-1 my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 overflow-y-auto max-h-[500px] leading-relaxed">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-semibold">Synthesizing with Gemini Neural Core...</span>
                </div>
              ) : outputResult ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {outputResult}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-500">
                  <Wrench className="w-10 h-10 text-slate-700" />
                  <span className="text-xs">Select your parameters and click Generate to view result.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
