import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Trash2,
    Zap,
    Copy,
    Check,
    Globe,
    AlertCircle,
    Timer,
    Loader2
} from 'lucide-react';
import BrandLogo from '../../../assets/brand-logo-main.svg';
import { useChatStore, ChatMessage } from '../../../store/useChatStore';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { preprocessLatex } from '../../../utils/math';

import { useAI } from "../../../context/AIContext";
import { apiEndpoint } from '../../../utils/api';

export default function TurboChat() {
    const { provider } = useAI();
    const { messages, addMessage, setMessages, clearHistory } = useChatStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false); // Default: Off for speed
    const scrollRef = useRef<HTMLDivElement>(null);
    const [rateLimitTime, setRateLimitTime] = useState<number | null>(null); // Seconds remaining
    const [totalWait, setTotalWait] = useState<number>(0);

    // Initialize with a default message if the store is empty
    useEffect(() => {
        if (messages.length === 0) {
            addMessage({
                role: 'assistant',
                content: "Hello! I am **Turbo**, your advanced architectural research engine. How can I assist you in your engineering journey today?"
            });
        }
    }, [messages.length, addMessage]);

    // Rate Limit Countdown Logic
    useEffect(() => {
        if (rateLimitTime === null) return;
        if (rateLimitTime <= 0) {
            setRateLimitTime(null);
            return;
        }

        const timer = setInterval(() => {
            setRateLimitTime(prev => (prev && prev > 0) ? prev - 1 : null);
        }, 1000);

        return () => clearInterval(timer);
    }, [rateLimitTime]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Helper to extract seconds from various time strings (11m45.888s, 20m, 30s, etc)
    const parseTimeToSeconds = (timeStr: string): number => {
        if (!timeStr) return 300; // 5m fallback
        const lowerTime = timeStr.toLowerCase();
        
        let total = 0;
        
        // Handle minutes (e.g., 25m)
        const minMatch = lowerTime.match(/(\d+)m/);
        if (minMatch) total += parseInt(minMatch[1]) * 60;
        
        // Handle seconds (e.g., 18.9119s or 12s)
        // We look for a number followed by 's' that isn't part of a minute string
        const secMatch = lowerTime.match(/(\d+\.?\d*)s/g);
        if (secMatch) {
            // Find the one that actually looks like a second value (usually has decimals or follows 'm')
            const lastSec = secMatch[secMatch.length - 1];
            total += Math.ceil(parseFloat(lastSec));
        } else if (total === 0) {
            // If only a raw number is provided assume seconds
            total = Math.ceil(parseFloat(lowerTime)) || 300;
        }
        
        return total > 0 ? total : 300;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const userMessage: ChatMessage = { role: 'user', content: userMsg };
        addMessage(userMessage);
        const updatedMessages = [...messages, userMessage];
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(apiEndpoint('/api/chat'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    messages: updatedMessages,
                    mode: 'normal',
                    provider: provider,
                    webSearch: isSearchEnabled
                })
            });

            // Safe JSON Parse
            let data: any = {};
            try {
                data = await response.json();
            } catch (e) {
                console.warn("Non-JSON response from server", e);
            }

            // Giga-Robust Rate Limit Detection
            const errorDump = (JSON.stringify(data) + (data.details || "") + (data.error || "")).toLowerCase();
            const isRateLimit = response.status === 429 || 
                               errorDump.includes("429") || 
                               errorDump.includes("rate limit") || 
                               errorDump.includes("quota") ||
                               errorDump.includes("tokens_per_day");

            if (isRateLimit) {
                console.log("NEURAL LINK SATURATED:", data);
                
                // Try to find the time in ANY field
                const rawTime = data.retryAfter || 
                               (data.details && data.details.match(/in ([\d\w\.]+s)/i)?.[1]) || 
                               (errorDump.match(/in ([\d\w\.]+s)/i)?.[1]);
                
                const seconds = parseTimeToSeconds(rawTime);
                
                setTotalWait(seconds);
                setRateLimitTime(seconds);
                
                const restorationTime = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
                
                addMessage({ 
                    role: 'assistant', 
                    content: `⚠️ **NEURAL DEPLETION DETECTED**: Powering down **${provider.toUpperCase()}** link for replenishment. Restoration estimated in **${restorationTime}**. Please wait for the system to re-calibrate.` 
                });
                return;
            }

            if (!response.ok) {
                throw new Error(data.details || data.error || `NEURAL_LINK_CORRUPTED_${response.status}`);
            }

            if (data.response) {
                addMessage({ role: 'assistant', content: data.response });
            } else {
                throw new Error("EMPTY_NEURAL_REPLY");
            }
        } catch (err: any) {
            console.error("Chat Error:", err);
            
            const errStr = (err.message || "").toLowerCase();
            if (errStr.includes("429") || errStr.includes("rate limit") || errStr.includes("quota")) {
                setTotalWait(900); // 15m fallback
                setRateLimitTime(900);
                addMessage({ role: 'assistant', content: "⚠️ **Quota Exhausted**: Neural resources depleted. Initiating 15-minute emergency cooling cycle." });
                return;
            }

            addMessage({ role: 'assistant', content: "Neural link lost. Architectural systems offline. Please try again soon." });
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        clearHistory();
        setMessages([{ role: 'assistant', content: "Memory purged. Neural registers cleared." }]);
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#050608]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative transition-all duration-500">

            {/* Subtle Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [-20, 20, -20],
                        y: [-20, 20, -20],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [20, -20, 20],
                        y: [20, -20, 20],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Header */}
            <div className="bg-white/[0.02] border-b border-white/5 px-8 h-16 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 shadow-lg">
                        <img src={BrandLogo} alt="Turbo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Turbo V4</h3>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        </div>
                        <p className="text-[9px] text-white/30 font-medium uppercase tracking-[0.2em]">Neural Research Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap size={10} className="text-cyan-400 opacity-50" />
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{provider === 'ollama' ? 'Deep Core' : '70B Precision'}</span>
                    </div>
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        title="Clear Chat"
                    >
                        <Trash2 size={14} className="text-white/20 group-hover:text-red-400" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-none z-10"
            >
                <AnimatePresence mode='popLayout'>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-[85%] px-5 py-3 rounded-2xl text-[14px] leading-relaxed
                ${msg.role === 'user'
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20'
                                    : 'bg-white/[0.04] text-gray-200 border border-white/5 rounded-tl-none backdrop-blur-sm'}
              `}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        code({ className, children, ...props }: any) {
                                            const inline = !className;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const [copied, setCopied] = useState(false);

                                            const handleCopy = () => {
                                                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            };

                                            return !inline && match ? (
                                                <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={handleCopy}
                                                            className="flex items-center gap-1.5 hover:text-white transition-colors"
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <Check size={10} className="text-emerald-400" />
                                                                    <span className="text-emerald-400">Copied!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={10} />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="!bg-black/60 !m-0 !p-4 !text-xs"
                                                        {...(props as any)}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-xs" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li>{children}</li>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-md font-bold mb-2 text-white">{children}</h2>,
                                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{children}</a>,
                                    }}
                                >
                                    {preprocessLatex(msg.content)}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 ${provider === 'ollama' ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-white/[0.03] border border-white/5'}`}>
                            {provider === 'ollama' ? (
                                <>
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-full h-full bg-cyan-400/20 rounded-full animate-ping" />
                                        <Zap size={14} className="text-cyan-400 relative z-10" />
                                    </div>
                                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest animate-pulse">
                                        Conducting Deep Research...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Loader2 size={12} className="text-cyan-400 animate-spin" />
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Thinking...</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input & Rate Limit */}
            <div className="p-4 border-t border-cyan-900/30 bg-black/40 backdrop-blur-md z-10">
                {/* Rate Limit Display */}
                <AnimatePresence>
                    {rateLimitTime !== null && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertCircle size={18} className="animate-pulse" />
                                        <span className="text-sm font-bold tracking-wider uppercase">Neural Depletion Detected</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                                        <Timer size={14} />
                                        <span>REPLENISHING: {Math.floor(rateLimitTime / 60)}m {rateLimitTime % 60}s</span>
                                    </div>
                                </div>
                                
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-red-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                        style={{ width: `${(rateLimitTime / totalWait) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/40 text-center uppercase tracking-[0.2em] font-medium">
                                    Architectural resource allocation in progress...
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-3xl mx-auto flex gap-2">
                    <div className="relative flex-1 flex items-center bg-white/[0.02] border border-white/5 rounded-xl p-2 pl-6 focus-within:border-cyan-500/30 transition-all duration-300">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={rateLimitTime !== null ? "Neural Link Offline..." : "Ask Turbo anything..."}
                            disabled={rateLimitTime !== null || isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-white text-[14px] placeholder:text-white/20 h-10 disabled:cursor-not-allowed"
                        />
                        {/* Only show web search toggle for Groq/Gemini (Ollama doesn't use search) */}
                        {provider !== 'ollama' && (
                            <div className="px-2">
                                <button
                                    onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                                    className={`p-2 transition-colors ${isSearchEnabled ? 'text-cyan-400' : 'text-white/20 hover:text-white/40'}`}
                                    title={isSearchEnabled ? "Web Search Active" : "Enable Web Search"}
                                >
                                    <Globe size={18} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || rateLimitTime !== null}
                            className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-cyan-900/40"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
