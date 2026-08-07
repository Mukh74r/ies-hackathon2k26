import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, ChevronDown, Database, X } from 'lucide-react';
import { useAI } from '../../context/AIContext';

export default function TurboAISwitcher({ side = 'bottom' }: { side?: 'top' | 'bottom' }) {
    const { provider, setProvider } = useAI();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const models = [
        { id: 'auto', name: 'Auto Select', icon: <Sparkles size={14} />, color: 'cyan', desc: 'Fast & Intelligent' },
        { id: 'groq', name: 'Turbo Engine', icon: <Zap size={14} />, color: 'amber', desc: 'Ultra-Fast Reasoning' },
        { id: 'gemini', name: 'Gemini Pro', icon: <Brain size={14} />, color: 'violet', desc: 'Creative & Deep' },
        { id: 'ollama', name: 'Llama 3 (Local)', icon: <Database size={14} />, color: 'emerald', desc: 'Private & Secure' },
    ];

    const currentModel = models.find(m => m.id === provider) || models[0];

    // Click outside logic
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative h-10 px-4 rounded-xl flex items-center gap-3
                    bg-white/5 backdrop-blur-xl border border-white/10
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all group overflow-hidden
                    hover:border-white/20
                `}
            >
                <div className={`text-${currentModel.color}-400 group-hover:animate-pulse`}>
                    {currentModel.icon}
                </div>
                <span className="text-[11px] font-black text-white/90 uppercase tracking-widest hidden sm:block">
                    {currentModel.name}
                </span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isOpen ? (side === 'top' ? 'rotate-0' : 'rotate-180') : (side === 'top' ? 'rotate-180' : '0')}`} />
                
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-${currentModel.color}-500/0 via-${currentModel.color}-500/10 to-${currentModel.color}-500/0 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for Mobile */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] sm:hidden" 
                        />

                        <motion.div
                            initial={window.innerWidth < 640 
                                ? { y: '100%', opacity: 1 } 
                                : { opacity: 0, y: side === 'top' ? -10 : 10, scale: 0.95 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={window.innerWidth < 640 
                                ? { y: '100%', opacity: 1 }
                                : { opacity: 0, y: side === 'top' ? -10 : 10, scale: 0.95 }
                            }
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`
                                z-[9999] p-2
                                sm:absolute ${side === 'top' ? 'bottom-12' : 'top-12'} sm:right-0 sm:w-64 sm:rounded-2xl 
                                sm:bg-[#020408]/90 sm:backdrop-blur-2xl sm:border sm:border-white/10 sm:shadow-2xl sm:max-w-none
                                fixed bottom-0 left-0 right-0 bg-[#09090b] rounded-t-[2.5rem] border-t border-white/10
                            `}
                        >
                            {/* Mobile Drag Handle */}
                            <div className="flex justify-center pt-3 pb-2 sm:hidden">
                                <div className="w-12 h-1.5 rounded-full bg-white/10" />
                            </div>

                            <div className="px-4 py-3 sm:px-3 sm:py-2 flex items-center justify-between border-b border-white/5 mb-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Select Intelligence</span>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                                >
                                    <X size={14} className="text-white/40" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5 p-2 sm:p-0">
                                {models.map((m) => {
                                    const isSelected = provider === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setProvider(m.id as any);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                w-full p-4 sm:p-3 rounded-2xl sm:rounded-xl flex items-center gap-4 transition-all
                                                ${isSelected 
                                                    ? `bg-${m.color}-500/10 border border-${m.color}-500/20 shadow-[0_0_20px_rgba(0,0,0,0.2)]` 
                                                    : 'hover:bg-white/5 border border-transparent'}
                                            `}
                                        >
                                            <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center bg-${m.color}-500/10 text-${m.color}-400 shadow-inner`}>
                                                {m.icon}
                                            </div>
                                            <div className="flex flex-col items-start min-w-0">
                                                <span className={`text-sm sm:text-xs font-bold whitespace-nowrap ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                    {m.name}
                                                </span>
                                                <span className="text-[11px] sm:text-[10px] text-white/40 font-medium truncate w-full uppercase tracking-tighter">
                                                    {m.desc}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <motion.div 
                                                    layoutId="active-indicator"
                                                    className={`ml-auto w-1.5 h-1.5 rounded-full bg-${m.color}-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]`} 
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile Bottom Padding */}
                            <div className="h-6 sm:hidden" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
