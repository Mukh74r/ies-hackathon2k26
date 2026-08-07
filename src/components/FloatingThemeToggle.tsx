import React from "react";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function FloatingThemeToggle() {
    const { theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-mono-stamp text-[var(--foreground)] shadow-2xl hover:border-[var(--primary)] transition-all cursor-pointer notranslate active:scale-95"
                title={`Switch to ${isLight ? 'Dark Mode' : 'White Mode'}`}
                translate="no"
            >
                {isLight ? (
                    <>
                        <Sun size={14} className="text-[#D97706]" />
                        <span className="hidden sm:inline text-[11px] font-mono-stamp font-bold text-[#0F172A]">White Mode</span>
                    </>
                ) : (
                    <>
                        <Moon size={14} className="text-[#FF9900]" />
                        <span className="hidden sm:inline text-[11px] font-mono-stamp font-bold text-[#FF9900]">Dark Mode</span>
                    </>
                )}
            </button>
        </div>
    );
}
