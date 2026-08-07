import React, { useEffect, useState } from 'react';

export default function Maintenance() {
    const [dots, setDots] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 1));
        }, 150);
        return () => clearInterval(progressInterval);
    }, []);

    return (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center px-6 overflow-hidden relative"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

            {/* Enhanced animated gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/[0.08] to-blue-600/[0.05] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }}/>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/[0.06] to-purple-600/[0.04] rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '10s' }}/>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/[0.05] to-cyan-500/[0.03] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}/>
            </div>

            {/* Animated grid pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(6,182,212,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.2) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    animation: 'grid-flow 20s linear infinite'
                }}
            />

            <div className="relative z-10 max-w-2xl w-full text-center space-y-12">

                {/* Enhanced Logo with glow */}
                <div className="flex flex-col items-center gap-6 mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-3xl blur-2xl opacity-50 animate-pulse" style={{ animationDuration: '3s' }}/>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-900/60 border border-cyan-400/20" style={{ animation: 'float 6s ease-in-out infinite' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-2">
                            Deep<span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Hub</span> AI
                        </h1>
                        <div className="text-[11px] font-bold text-white/30 uppercase tracking-[0.5em]">Neural Intelligence Platform</div>
                    </div>
                </div>

                {/* Status badge with better animation */}
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-full mx-auto backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                    <div className="relative flex items-center justify-center">
                        <span className="w-3 h-3 bg-cyan-400 rounded-full animate-ping absolute"/>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"/>
                    </div>
                    <span className="text-sm font-bold text-cyan-300 uppercase tracking-widest">System Maintenance</span>
                </div>

                {/* Main message with better typography */}
                <div className="space-y-6 px-4">
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        We're upgrading our <br/>
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">neural systems</span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-lg mx-auto leading-relaxed">
                        DeepHub AI is currently undergoing scheduled maintenance to bring you an even better experience with enhanced AI capabilities.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%`, backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }}
                        />
                    </div>
                    <p className="text-xs text-white/30 mt-3 font-medium">
                        Optimizing AI models and infrastructure{dots}
                    </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <a 
                        href="https://over-the-air-updates.vercel.app/deephub-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-8 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">View Live Status</span>
                            <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>

                    <a 
                        href="mailto:support@deephubai.com"
                        className="px-8 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    >
                        <span className="text-sm font-bold text-white/60 hover:text-white/80 uppercase tracking-wider transition-colors">Contact Support</span>
                    </a>
                </div>

                {/* Footer */}
                <div className="pt-8 space-y-3 border-t border-white/5">
                    <p className="text-xs text-white/20 font-medium">
                        Expected completion: <span className="text-white/40 font-bold">June 25, 2026 · 3:00 AM IST</span>
                    </p>
                    <p className="text-xs text-white/15">
                        © 2026 DeepHub AI. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes grid-flow {
                    0% { background-position: 0 0; }
                    100% { background-position: 80px 80px; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
