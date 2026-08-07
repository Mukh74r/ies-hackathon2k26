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
        setMessages([{ role: 'assistant', content: "Memory purged. Conversation sheet reset." }]);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFAF3] text-[#2B211A] relative font-sans-academic border border-[#D8CBB0] shadow-sm rounded-sm overflow-hidden">
            {/* Studio Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#D8CBB0] bg-[#F7F1E3]">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-stamp px-2 py-0.5 border border-[#8A6D3B]/40 bg-[#8A6D3B]/10 text-[#8A6D3B] uppercase">
                        Teacher AI Studio
                    </span>
                    <h2 className="text-sm font-bold font-serif-academic text-[#2B211A]">
                        Academic Assistant Workspace
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearHistory}
                        className="p-1.5 text-[#6B5D4F] hover:text-[#A6522C] hover:bg-[#EFE8D8] transition-colors rounded-sm"
                        title="Clear Conversation Sheet"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Main Chat Workspace / Canvas */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Empty State: ChatGPT-style quick starter pills */}
                {messages.length <= 1 && (
                    <div className="max-w-2xl mx-auto py-8 text-center">
                        <div className="inline-block p-3 rounded-full bg-[#8A6D3B]/10 border border-[#8A6D3B]/30 text-[#8A6D3B] mb-3">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold font-serif-academic text-[#2B211A] mb-2">
                            What would you like to prepare today?
                        </h3>
                        <p className="text-xs text-[#6B5D4F] mb-6 max-w-md mx-auto">
                            Generate question papers, build lesson plans, draft PPT slides, or grade student assignments across 11 regional languages.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                            {[
                                { title: "Generate Question Paper", prompt: "Create a 50-mark Class 10 CBSE Science Question Paper with Section A, B, and C." },
                                { title: "45-Min Lesson Plan Builder", prompt: "Draft a 45-minute interactive lesson plan on Trigonometric Ratios for Class 9." },
                                { title: "Slide Presentation PPT", prompt: "Outline a 10-slide PowerPoint presentation structure for Photosynthesis." },
                                { title: "Solve Exam Paper", prompt: "Solve the following Physics question paper with detailed step-by-step mark schemes." }
                            ].map((pill, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(pill.prompt);
                                    }}
                                    className="p-3 bg-[#F7F1E3] border border-[#D8CBB0] rounded-sm hover:border-[#A6522C] hover:bg-[#EFE8D8] transition-colors text-left group"
                                >
                                    <div className="text-xs font-bold font-serif-academic text-[#2B211A] group-hover:text-[#A6522C]">
                                        {pill.title}
                                    </div>
                                    <div className="text-[11px] text-[#6B5D4F] line-clamp-2 mt-0.5">
                                        {pill.prompt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg: ChatMessage) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                                    max-w-[85%] sm:max-w-[75%] p-4 text-xs font-sans-academic leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-[#EFE8D8] border border-[#D8CBB0] text-[#2B211A] rounded-sm'
                                        : 'bg-[#FDFAF3] border border-[#D8CBB0] border-l-4 border-l-[#A6522C] text-[#2B211A] shadow-sm rounded-sm'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2 text-[10px] font-mono-stamp text-[#8A6D3B] pb-1 border-b border-[#D8CBB0]">
                                    <span>{msg.role === 'user' ? 'Educator Note' : 'DeepHub AI Studio'}</span>
                                    {msg.role === 'assistant' && (
                                        <span className="text-[#6B5D4F]">Verified Markdown</span>
                                    )}
                                </div>

                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const [copied, setCopied] = useState(false);
                                            const handleCopy = () => {
                                                navigator.clipboard.writeText(String(children));
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            };

                                            return !inline && match ? (
                                                <div className="relative group my-3 border border-[#D8CBB0] bg-[#F7F1E3] rounded-sm overflow-hidden">
                                                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#EFE8D8] border-b border-[#D8CBB0] text-[10px] font-mono-stamp text-[#8A6D3B]">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={handleCopy}
                                                            className="flex items-center gap-1 text-[#6B5D4F] hover:text-[#A6522C] transition-colors"
                                                        >
                                                            {copied ? <Check size={10} className="text-[#A6522C]" /> : <Copy size={10} />}
                                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="!bg-[#2B211A] !m-0 !p-3 !text-xs"
                                                        {...(props as any)}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className="bg-[#EFE8D8] px-1 py-0.5 text-[#A6522C] font-mono-stamp text-xs" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li>{children}</li>,
                                        h1: ({ children }) => <h1 className="text-base font-bold font-serif-academic mb-2 text-[#2B211A]">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-sm font-bold font-serif-academic mb-2 text-[#2B211A]">{children}</h2>,
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
                        <div className="px-4 py-2.5 bg-[#FDFAF3] border border-[#A6522C] border-l-4 border-l-[#A6522C] rounded-sm flex items-center gap-2 text-xs font-mono-stamp text-[#A6522C]">
                            <Loader2 size={14} className="animate-spin text-[#A6522C]" />
                            <span>Drafting Academic Response...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ChatGPT-style Bottom Composer Bar */}
            <div className="p-4 border-t border-[#D8CBB0] bg-[#F7F1E3]">
                {/* Rate Limit Display */}
                <AnimatePresence>
                    {rateLimitTime !== null && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-[#A6522C]/10 border border-[#A6522C]/30 p-3 rounded-sm flex items-center justify-between text-xs font-mono-stamp text-[#A6522C]">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>Rate limit reached. Please wait.</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Timer size={14} />
                                    <span>REPLENISHING: {Math.floor(rateLimitTime / 60)}m {rateLimitTime % 60}s</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-3xl mx-auto flex gap-2">
                    <div className="relative flex-1 flex items-center bg-[#FDFAF3] border border-[#D8CBB0] rounded-sm p-1.5 pl-4 focus-within:border-[#A6522C] transition-colors">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={rateLimitTime !== null ? "System replenishing..." : "Ask Turbo or type prompt (e.g. Generate 50-mark Class 10 exam paper)..."}
                            disabled={rateLimitTime !== null || isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-[#2B211A] text-xs font-sans-academic placeholder:text-[#6B5D4F] h-9 disabled:cursor-not-allowed"
                        />
                        {provider !== 'ollama' && (
                            <div className="px-1">
                                <button
                                    onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                                    className={`p-1.5 transition-colors ${isSearchEnabled ? 'text-[#A6522C]' : 'text-[#6B5D4F] hover:text-[#2B211A]'}`}
                                    title={isSearchEnabled ? "Web Search Active" : "Enable Web Search"}
                                >
                                    <Globe size={16} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || rateLimitTime !== null}
                            className="w-8 h-8 bg-[#A6522C] hover:bg-[#8e4423] disabled:opacity-30 text-[#FDFAF3] rounded-sm flex items-center justify-center transition-colors ml-1"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
