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
    ];

    if (user) {
        NAV_ITEMS.push({ to: "/profile", label: "Profile" });
    }

    return (
        <header className="sticky top-0 z-50 bg-[#040711]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3 transition-colors shadow-2xl notranslate relative" translate="no">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* ── Brand Identifier (Left) ── */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="relative">
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-base text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                                DeepHub AI
                            </span>
                            <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold uppercase shadow-[0_0_10px_rgba(0,164,228,0.2)]">
                                V4.2
                            </span>
                        </div>
                        <p className="text-[10px] text-white/50 hidden md:block leading-none mt-0.5 font-sans-academic">
                            Curriculum & Examination Architecture
                        </p>
                    </div>
                </div>

                {/* ── Navigation Center / Right ── */}
                <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-[0_0_15px_rgba(0,164,228,0.4)]"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* ── Action Utilities (Right) ── */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-white hover:border-cyan-500/40 hover:bg-white/10 transition-all card-lift"
                        title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                    >
                        {isLight ? (
                            <>
                                <Sun size={13} className="text-amber-400" />
                                <span className="text-[11px] text-white/70 hidden sm:inline">Light</span>
                            </>
                        ) : (
                            <>
                                <Moon size={13} className="text-cyan-400" />
                                <span className="text-[11px] text-white/70 hidden sm:inline">Dark</span>
                            </>
                        )}
                    </button>

                    {/* Regional Language Switcher Dropdown */}
                    <div className="relative notranslate" translate="no">
                        <button
                            onClick={() => setLangOpen(prev => !prev)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-white hover:border-cyan-500/40 hover:bg-white/10 transition-all notranslate card-lift"
                            translate="no"
                        >
                            <Globe size={13} className="text-cyan-400" />
                            <span className="font-semibold notranslate">{currentLanguage.code.toUpperCase()}</span>
                            <ChevronDown size={11} className={`text-white/50 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {langOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#0E1424]/95 border border-white/10 shadow-2xl rounded-2xl grid grid-cols-2 gap-1 z-50 notranslate backdrop-blur-xl animate-settle" translate="no">
                                <div className="col-span-2 px-2 py-1 text-[10px] uppercase font-mono-stamp text-white/40 border-b border-white/10 mb-1">
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
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left transition-colors notranslate ${
                                                isSel
                                                    ? "bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30"
                                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                            }`}
                                            translate="no"
                                        >
                                            <div className="flex flex-col notranslate">
                                                <span className="text-[11px] font-bold uppercase notranslate">{lang.code}</span>
                                                <span className="text-[10px] text-white/40 notranslate">{lang.nativeName}</span>
                                            </div>
                                            {isSel && <Check size={12} className="text-cyan-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Turbo Primary Button */}
                    <button
                        onClick={() => navigate('/turbo')}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(0,164,228,0.35)] hover:shadow-[0_0_25px_rgba(0,164,228,0.5)] hover:scale-[1.03] active:scale-98"
                    >
                        Turbo
                    </button>
                </div>
            </div>
        </header>
    );
}
