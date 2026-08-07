import React from "react";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function FloatingThemeToggle() {
    const { theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';

    return (
        <div className="fixed bottom-5 right-5 z-[9999] notranslate" translate="no">
            <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] shadow-md hover:border-[var(--primary)] transition-all cursor-pointer notranslate card-lift"
                title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                translate="no"
            >
                {isLight ? (
                    <>
                        <Sun size={13} className="text-[#B5762A]" />
                        <span className="text-[11px] font-sans-academic text-[var(--muted-foreground)]">Light</span>
                    </>
                ) : (
                    <>
                        <Moon size={13} className="text-[#6E85D6]" />
                        <span className="text-[11px] font-sans-academic text-[var(--muted-foreground)]">Dark</span>
                    </>
                )}
            </button>
        </div>
    );
}
