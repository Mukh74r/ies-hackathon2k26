import React, { useState } from "react";
import { Palette, Sparkles, Moon, Sun, Compass, Award } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const THEMES = [
    { id: "cyber-dark", name: "Cyber Dark", icon: Moon },
    { id: "educator-gold", name: "Educator Gold", icon: Award },
    { id: "midnight-blue", name: "Midnight Blue", icon: Compass },
    { id: "emerald-neon", name: "Emerald Neon", icon: Sparkles },
    { id: "solar-light", name: "Solar Light", icon: Sun },
];

export default function FloatingThemeToggle() {
    const { theme, setTheme } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];
    const CurrentIcon = currentThemeObj.icon;

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="mb-3 p-2 rounded-2xl bg-[#080d1a]/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 min-w-[170px] animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-white/40 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                        <Palette size={11} />
                        <span>Site Theme</span>
                    </div>
                    {THEMES.map((tOption) => {
                        const active = theme === tOption.id;
                        const OptionIcon = tOption.icon;
                        return (
                            <button
                                key={tOption.id}
                                onClick={() => {
                                    setTheme(tOption.id);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all
                                    ${active 
                                        ? 'bg-white/15 text-white shadow-inner border border-white/20' 
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <OptionIcon size={14} className="text-cyan-400" />
                                    <span>{tOption.name}</span>
                                </span>
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/70 border border-white/20 text-xs font-bold text-white shadow-2xl backdrop-blur-md hover:scale-105 hover:border-white/40 active:scale-95 transition-all"
                title="Switch Visual Site Theme"
            >
                <CurrentIcon size={14} className="text-cyan-400" />
                <span className="hidden sm:inline text-[11px] font-mono tracking-wide">{currentThemeObj.name}</span>
            </button>
        </div>
    );
}
