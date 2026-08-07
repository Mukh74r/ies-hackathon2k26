import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import BrandLogo from "../assets/brand-logo-main.svg";
import { Globe, ChevronDown, Check, Sun, Moon, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, INDIAN_LANGUAGES } from "../context/LanguageContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { currentLanguage, setLanguageByCode, theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';
    const [langOpen, setLangOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const NAV_ITEMS = [
        { to: "/turbo", label: "Turbo" },
        { to: "/virtualbrain", label: "Virtual Brain" },
        { to: "/circuitbrain", label: "Circuit Brain" },
        { to: "/latest", label: "Latest" },
        { to: "/pricing", label: "Pricing" },
    ];

    if (user) {
        NAV_ITEMS.push({ to: "/profile", label: "Profile" });
    }

    return (
        <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] px-4 sm:px-8 py-2.5 transition-colors shadow-sm notranslate" translate="no">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* ── Brand Identifier (Left) ── */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2.5 cursor-pointer group"
                >
                    <img src={BrandLogo} alt="DeepHub AI Logo" className="w-7 h-7 object-contain" />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-display font-semibold text-base text-[var(--foreground)] tracking-tight">
                                DeepHub AI
                            </span>
                            <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold uppercase">
                                V4.2
                            </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)] hidden md:block leading-none mt-0.5">
                            Curriculum & Examination Architecture
                        </p>
                    </div>
                </div>

                {/* ── Navigation Center / Right ── */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                                    isActive
                                        ? "bg-[var(--primary)] text-white shadow-xs"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                                }`}
                            >
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* ── Action Utilities (Right) ── */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    
                    {/* Theme Toggle (Light Default / Dark Opt-In) */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] transition-all card-lift"
                        title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                    >
                        {isLight ? (
                            <>
                                <Sun size={13} className="text-[#B5762A]" />
                                <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">Light</span>
                            </>
                        ) : (
                            <>
                                <Moon size={13} className="text-[#6E85D6]" />
                                <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">Dark</span>
                            </>
                        )}
                    </button>

                    {/* Regional Language Switcher Dropdown */}
                    <div className="relative notranslate" translate="no">
                        <button
                            onClick={() => setLangOpen(prev => !prev)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] transition-all notranslate card-lift"
                            translate="no"
                        >
                            <Globe size={13} className="text-[var(--primary)]" />
                            <span className="font-semibold notranslate">{currentLanguage.code.toUpperCase()}</span>
                            <ChevronDown size={11} className={`text-[var(--muted-foreground)] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-64 p-2 bg-[var(--card)] border border-[var(--border)] shadow-lg rounded-lg grid grid-cols-2 gap-1 z-50 notranslate animate-settle" translate="no">
                                <div className="col-span-2 px-2 py-1 text-[10px] uppercase font-mono-stamp text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1">
                                    11 Regional Languages
                                </div>
                                {INDIAN_LANGUAGES.map((lang) => {
                                    const isSel = currentLanguage.code === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguageByCode(lang.code);
                                                setLangOpen(false);
                                            }}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-left transition-colors notranslate ${
                                                isSel
                                                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/25"
                                                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                            }`}
                                            translate="no"
                                        >
                                            <div className="flex flex-col notranslate">
                                                <span className="text-[11px] font-bold uppercase notranslate">{lang.code}</span>
                                                <span className="text-[10px] text-[var(--muted-foreground)] notranslate">{lang.nativeName}</span>
                                            </div>
                                            {isSel && <Check size={12} className="text-[var(--primary)]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Turbo Primary Button */}
                    <button
                        onClick={() => navigate('/turbo')}
                        className="px-3.5 py-1.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-98 card-lift"
                    >
                        Turbo
                    </button>
                </div>
            </div>
        </header>
    );
}
