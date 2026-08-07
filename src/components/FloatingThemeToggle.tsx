import React, { useState } from "react";
import { BookOpen, Feather } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const THEMES = [
    { id: "educator-gold", name: "Academic Parchment", icon: BookOpen },
    { id: "cyber-dark", name: "Contrast Paper", icon: Feather },
];

export default function FloatingThemeToggle() {
    const { theme, setTheme } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];
    const CurrentIcon = currentThemeObj.icon;

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="mb-2 p-2 rounded bg-[#FDFAF3] border border-[#D8CBB0] shadow-md flex flex-col gap-1 min-w-[170px]">
                    <div className="px-2 py-1 text-[10px] uppercase font-mono-stamp text-[#8A6D3B] border-b border-[#D8CBB0] pb-1">
                        Paper Mode
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
                                    w-full flex items-center justify-between px-3 py-2 text-xs font-sans-academic transition-colors
                                    ${active 
                                        ? 'bg-[#A6522C]/10 text-[#A6522C] font-bold border-l-2 border-[#A6522C]' 
                                        : 'text-[#2B211A] hover:bg-[#EFE8D8]'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    <OptionIcon size={14} className="text-[#A6522C]" />
                                    <span>{tOption.name}</span>
                                </span>
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#A6522C]" />}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FDFAF3] border border-[#D8CBB0] text-xs font-mono-stamp text-[#2B211A] shadow-sm hover:border-[#A6522C] transition-colors"
                title="Toggle Parchment Theme"
            >
                <CurrentIcon size={14} className="text-[#A6522C]" />
                <span className="hidden sm:inline text-[11px] font-mono-stamp">{currentThemeObj.name}</span>
            </button>
        </div>
    );
}
