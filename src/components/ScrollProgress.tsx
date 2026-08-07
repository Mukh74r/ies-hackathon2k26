import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const currentProgress = (window.scrollY / totalScroll) * 100;
                setProgress(Math.min(100, Math.max(0, currentProgress)));
            }
            setShowBackToTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Top Fixed Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
                <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#00A4E4] via-[#38BDF8] to-[#6E85D6] shadow-[0_0_12px_rgba(0,164,228,0.8)] transition-all duration-75 ease-out"
                />
            </div>

            {/* Floating Back-To-Top Indicator */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Scroll back to top"
                    className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0E1424]/90 hover:bg-[#00A4E4] text-[#00A4E4] hover:text-black border border-[#1E2640] hover:border-[#00A4E4] shadow-2xl transition-all duration-300 animate-settle active:scale-95 group"
                >
                    <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}
        </>
    );
}
