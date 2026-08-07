import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
    messages: string[];
    currentStep: number;
    progress?: number;
    accentColor?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'pink' | 'blue';
    label?: string;
}

const ACCENT_STYLES: Record<string, { ring: string; border: string; inner: string; progress: string; icon: string; badge: string }> = {
    cyan:    { ring: 'border-t-cyan-500 border-r-cyan-500/50',    border: 'border-cyan-500/20',    inner: 'bg-cyan-500/10',    progress: 'from-cyan-500 to-blue-500',      icon: 'text-cyan-400',    badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' },
    violet:  { ring: 'border-t-violet-500 border-r-violet-500/50',  border: 'border-violet-500/20',  inner: 'bg-violet-500/10',  progress: 'from-violet-500 to-fuchsia-500',  icon: 'text-violet-400',  badge: 'text-violet-300 bg-violet-500/10 border-violet-500/20' },
    emerald: { ring: 'border-t-emerald-500 border-r-emerald-500/50', border: 'border-emerald-500/20', inner: 'bg-emerald-500/10', progress: 'from-emerald-500 to-teal-500',    icon: 'text-emerald-400', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
    amber:   { ring: 'border-t-amber-500 border-r-amber-500/50',    border: 'border-amber-500/20',   inner: 'bg-amber-500/10',   progress: 'from-amber-500 to-orange-500',    icon: 'text-amber-400',   badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
    pink:    { ring: 'border-t-pink-500 border-r-pink-500/50',      border: 'border-pink-500/20',    inner: 'bg-pink-500/10',    progress: 'from-pink-500 to-rose-500',       icon: 'text-pink-400',    badge: 'text-pink-300 bg-pink-500/10 border-pink-500/20' },
    blue:    { ring: 'border-t-blue-500 border-r-blue-500/50',      border: 'border-blue-500/20',    inner: 'bg-blue-500/10',    progress: 'from-blue-500 to-indigo-500',     icon: 'text-blue-400',    badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
};

export default function NeuralLoader({ messages, currentStep, progress, accentColor = 'cyan', label }: NeuralLoaderProps) {
    const styles = ACCENT_STYLES[accentColor];
    const currentMessage = messages[currentStep % messages.length];

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 select-none">
            {/* Animated Orb */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Glow Pulse */}
                <div className={`absolute inset-0 rounded-full ${styles.inner} animate-ping opacity-30`} />
                {/* Ring */}
                <div className={`absolute inset-0 border-4 border-white/5 rounded-full`} />
                <div className={`absolute inset-0 border-4 ${styles.ring} border-white/0 rounded-full animate-spin`} />
                {/* Inner Glow */}
                <div className={`absolute inset-4 rounded-full ${styles.inner} flex items-center justify-center`}>
                    {/* Neural pulse dots */}
                    <div className="grid grid-cols-3 gap-1 opacity-60">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${styles.icon.replace('text', 'bg')}`}
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: (i * 0.15) % 1.5,
                                    ease: 'easeInOut'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="text-center space-y-4 max-w-sm w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                    >
                        <p className={`text-xs font-black uppercase tracking-[0.2em] border rounded-full px-3 py-1 inline-block ${styles.badge}`}>
                            {label || 'Neural Processing'}
                        </p>
                        <h3 className="text-base font-bold text-white">{currentMessage}</h3>
                    </motion.div>
                </AnimatePresence>

                {/* Step indicators */}
                <div className="flex justify-center gap-2">
                    {messages.map((_, i) => (
                        <motion.div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === (currentStep % messages.length)
                                ? `w-6 ${styles.progress.split(' ')[0].replace('from', 'bg')}`
                                : 'w-1.5 bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Progress Bar (optional) */}
                {progress !== undefined && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${styles.progress} rounded-full`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
