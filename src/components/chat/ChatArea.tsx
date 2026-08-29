import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { XYBotLogo } from '../common/XYBotLogo';
import { ModeSelector } from '../common/ModeSelector';
import { XY_MODES, XYBotModeId } from '../../constants/modes';
import { Message, Attachment } from '../../types';
import { Sparkles, Bot, Zap, ArrowDown, RefreshCw, AlertCircle, Compass, Code, PenTool, Lightbulb, Brain, Layers, Home } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export const ChatArea: React.FC = () => {
  const { 
    currentChat, 
    activeChatId, 
    addMessageToChat, 
    updateMessageInChat, 
    settings, 
    showToast,
    user,
    activeMode,
    setActiveMode,
    setChatMode,
    setActiveView
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentModeId: XYBotModeId = currentChat?.mode || activeMode || 'xy-base';
  const currentModeConfig = XY_MODES[currentModeId] || XY_MODES['xy-base'];
  const ModeIcon = currentModeConfig.icon;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeChatId]);

  useEffect(() => {
    if (isGenerating) {
      scrollToBottom(true);
    }
  }, [streamingContent]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };

    addMessageToChat(activeChatId, userMessage);
    setIsGenerating(true);
    setStreamingContent('');

    const assistantMsgId = 'msg_ai_' + Date.now();
    let accumulatedText = '';
    let followUpSuggestions: string[] = [];

    abortControllerRef.current = new AbortController();

    try {
      // Build conversation context
      const historyToSend = settings.conversationMemory && currentChat
        ? [...currentChat.messages, userMessage]
        : [userMessage];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          model: settings.defaultModel,
          mode: currentModeId,
          userName: user.name,
          userPersona: user.customInstruction,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error) {
            errMessage = typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error);
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('No readable stream available in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastRenderTime = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        let hasNewChunks = false;
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                hasNewChunks = true;
              }
              if (data.done) {
                if (data.suggestions) {
                  followUpSuggestions = data.suggestions;
                }
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (err: any) {
              if (err.message && !err.message.includes('JSON')) {
                throw err;
              }
            }
          }
        }

        if (hasNewChunks) {
          const now = performance.now();
          // Render immediately on first chunk, then throttle to ~30fps during heavy stream to save GPU/CPU on low-end devices
          if (now - lastRenderTime > 24 || accumulatedText.length < 50) {
            setStreamingContent(accumulatedText);
            lastRenderTime = now;
          }
        }
      }

      // Flush remaining text
      setStreamingContent(accumulatedText);

      // Add final assistant message
      const finalAssistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: accumulatedText || 'I have completed processing your request.',
        timestamp: Date.now(),
        suggestedFollowUps: followUpSuggestions.length > 0 ? followUpSuggestions : undefined,
      };

      addMessageToChat(activeChatId, finalAssistantMsg);
      sounds.playReceive();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (accumulatedText) {
          const partialMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: accumulatedText + '\n\n*(Generation stopped by user)*',
            timestamp: Date.now(),
          };
          addMessageToChat(activeChatId, partialMsg);
        }
      } else {
        console.error('Chat error:', error);
        showToast({ type: 'error', title: 'Neural Connection Error', message: error.message || 'Failed to generate response' });
        const errorMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: `⚠️ **XYBOT Neural Error:** ${error.message || 'Unable to establish connection with Gemini Core. Please verify internet and API settings.'}`,
          timestamp: Date.now(),
        };
        addMessageToChat(activeChatId, errorMsg);
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      showToast({ type: 'info', title: 'Generation Stopped' });
    }
  };

  const handleRegenerate = () => {
    if (!currentChat || currentChat.messages.length === 0 || isGenerating) return;
    const lastUserMsg = [...currentChat.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeChatId) return;
    updateMessageInChat(activeChatId, messageId, newContent);
    handleSendMessage(newContent);
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <Bot className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-1">No Active Conversation</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-4">Select an existing chat from the sidebar or initialize a new XYBOT session.</p>
      </div>
    );
  }

  const messages = currentChat.messages;
  const latestMessage = messages[messages.length - 1];

  return (
    <div
      id="chat_area_viewport"
      className="flex-1 flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-transparent"
    >
      {/* Active Mode Banner Header inside Chat */}
      <div className="px-4 py-2 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-xs text-white/80 hover:text-cyan-400 transition-all font-semibold active:scale-95"
            title="Go to Home Screen"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <span className="text-white/25 mx-0.5">|</span>

          <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${currentModeConfig.bgGlow} ${currentModeConfig.color} border border-white/10`}>
            <ModeIcon className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">{currentModeConfig.name}</span>
            <span className="text-[10px] text-white/40 hidden sm:inline">• {currentModeConfig.tagline}</span>
          </div>
        </div>

        {/* Quick mode switcher pill */}
        <ModeSelector variant="banner" className="hidden sm:flex" />
      </div>

      {/* Scrollable Messages Thread */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 sm:px-6 py-2.5 sm:py-4 space-y-2.5 sm:space-y-4"
      >
        {messages.length === 0 ? (
          /* Empty Chat Welcome State with Mode context */
          <div className="max-w-2xl mx-auto py-6 sm:py-10 flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl p-1 neon-border flex items-center justify-center mb-4">
              <XYBotLogo size={48} isPremium={user.plan !== 'free'} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              XYBOT <span className="neon-text">{currentModeConfig.name.toUpperCase()}</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1 mb-6 max-w-md">
              {currentModeConfig.description}
            </p>

            {/* Quick Prompts Grid for current mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {currentModeConfig.samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sp.prompt)}
                  className="p-4 rounded-2xl glass hover:bg-white/5 border border-white/10 hover:border-[#00f2ff]/40 transition-all flex flex-col gap-1.5 text-left group shadow-sm active:scale-98"
                >
                  <div className="flex items-center gap-2 text-[#00f2ff]">
                    <ModeIcon className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">{sp.title}</span>
                  </div>
                  <span className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                    {sp.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={index === messages.length - 1}
              onRegenerate={handleRegenerate}
              onEdit={(newContent) => handleEditMessage(msg.id, newContent)}
            />
          ))
        )}

        {/* Live Streaming Message Indicator */}
        {isGenerating && streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming_msg',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
            isLatest={true}
            isStreaming={true}
          />
        )}

        {/* Loading skeleton when waiting for initial stream token */}
        {isGenerating && !streamingContent && (
          <div className="flex gap-4 p-5 rounded-[2rem] glass max-w-md items-center">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentModeConfig.bgGlow} ${currentModeConfig.color} border border-white/10`}>
              <Sparkles className="w-4 h-4 text-[#00f2ff] animate-spin-slow" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="text-[10px] text-white/40 font-mono">
                {currentModeConfig.name} reasoning...
              </span>
            </div>
          </div>
        )}

        {/* Smart Follow-up Suggestions Chips */}
        {latestMessage && latestMessage.role === 'assistant' && latestMessage.suggestedFollowUps && !isGenerating && (
          <div className="flex flex-wrap gap-2 pt-2 pb-1 max-w-4xl mx-auto px-2">
            {latestMessage.suggestedFollowUps.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="glass px-4 py-2 rounded-full text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3 h-3 text-[#00f2ff]" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-24 right-6 p-2.5 rounded-full bg-[#00f2ff] hover:bg-cyan-300 text-black shadow-xl shadow-[#00f2ff]/30 transition-all z-20"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Fixed Chat Input Form */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        onStopGenerating={handleStopGenerating}
      />
    </div>
  );
};

