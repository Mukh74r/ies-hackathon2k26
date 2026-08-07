// src/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Note: Replace with your actual logo import
import BrandLogo from "../assets/brand-logo-main.svg";

import { Globe, ChevronDown, Check } from "lucide-react";
import { useAI } from "../context/AIContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage, INDIAN_LANGUAGES } from "../context/LanguageContext";

import AIModelSwitcher from "./AIModelSwitcher";


export default function Navbar() {
    const { user, logout } = useAuth();
    const { currentLanguage, setLanguageByCode, t } = useLanguage();
    const [astroHover, setAstroHover] = useState(false);
    const [astroOpen, setAstroOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);


    const wrapperRef = useRef<HTMLDivElement>(null);
    const astroRef = useRef<HTMLImageElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const LINKS = [
        { to: "/latest", label: "Latest" },
        { to: "/virtualbrain", label: "Virtual Brain" },
        { to: "/circuitbrain", label: "Circuit Brain" },
        { to: "/turbo", label: "Turbo" },
    ];

    if (user) {
        LINKS.push({ to: "/profile", label: "Profile" });
    }

    /* -------------------------------------------------
       Screen size detection
    -------------------------------------------------- */
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* -------------------------------------------------
       Close astronaut dropdown (desktop only)
    -------------------------------------------------- */
    useEffect(() => {
        if (isMobile) return;

        function handlePointer(e: PointerEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node) &&
                astroRef.current &&
                !astroRef.current.contains(e.target as Node)
            ) {
                setAstroOpen(false);
            }
        }

        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setAstroOpen(false);
        }

        document.addEventListener("pointerdown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("pointerdown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [isMobile]);

    /* -------------------------------------------------
       Close mobile menu on outside click
    -------------------------------------------------- */
    useEffect(() => {
        if (!isMobile) return;

        function handlePointer(e: PointerEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setAstroOpen(false);
            }
        }

        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setAstroOpen(false);
        }

        if (astroOpen) {
            document.addEventListener("pointerdown", handlePointer);
            document.addEventListener("keydown", handleKey);
        }

        return () => {
            document.removeEventListener("pointerdown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [isMobile, astroOpen]);

    /* -------------------------------------------------
       Astronaut styles (desktop / tablet)
    -------------------------------------------------- */
    const astroStyle: React.CSSProperties = {
        position: "fixed",
        top: 21,
        left: 10,
        width: 80,
        zIndex: 9990,
        cursor: "pointer",
        userSelect: "none",
        transformOrigin: "center",
        filter: astroHover
            ? "drop-shadow(0 14px 20px rgba(0,0,0,0.55))"
            : "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
        transform: astroHover
            ? "translateY(-6px) scale(1.05) rotate(-2deg)"
            : "none",
        transition: "transform 260ms cubic-bezier(.2,.9,.2,1), filter 260ms ease"
    };

    const go = (path: string) => {
        setAstroOpen(false);
        navigate(path);
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `nav-link ${isActive ? "active" : ""}`;

    /* -------------------------------------------------
       Animation variants
    -------------------------------------------------- */
    const menuVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 10,
            transition: { duration: 0.15 }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: [0.2, 0.9, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 5,
            transition: { duration: 0.15 }
        }
    };

    const mobileMenuVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 20,
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.25,
                ease: [0.2, 0.9, 0.2, 1],
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 10,
            transition: { duration: 0.15 }
        }
    };

    const menuItemVariants: Variants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.2 }
        }
    };

    const fabVariants: Variants = {
        tap: { scale: 0.9 },
        hover: { scale: 1.05 }
    };

    // HIDE GLOBAL NAV ON TURBO MOBILE & TABLET (Where Watch Dial replaces it)


    return (
        <>
            {/* =========================
          DESKTOP / TABLET ASTRONAUT
         ========================= */}
            {!isMobile && location.pathname !== "/turbo" && (
                <>
                    <motion.img
                        ref={astroRef}
                        src={BrandLogo}
                        alt=""
                        draggable="false"
                        onMouseEnter={() => setAstroHover(true)}
                        onMouseLeave={() => setAstroHover(false)}
                        onClick={() => setAstroOpen(s => !s)}
                        style={astroStyle}
                        whileTap={{ scale: 0.95 }}
                    />

                    <AnimatePresence>
                        {astroOpen && (
                            <motion.div
                                ref={wrapperRef}
                                variants={menuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={{
                                    position: "fixed",
                                    top: 95,
                                    left: 24,
                                    zIndex: 10000,
                                    background: "var(--nav-pill-bg)",
                                    border: "1px solid var(--nav-pill-border)",
                                    borderRadius: 12,
                                    padding: "8px 10px",
                                    minWidth: 180,
                                    boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
                                    backdropFilter: "blur(12px)"
                                } as React.CSSProperties}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--muted)",
                                        padding: "8px 12px",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        marginBottom: 6
                                    }}
                                >
                                    DeepHub AI V4.27 – BETA
                                </div>
 
                                {user ? (
                                    <>
                                        <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Active: {user.username}
                                        </div>
                                        <button className="astro-menu__item" onClick={() => go("/profile")}>My Profile</button>
                                        <button className="astro-menu__item" onClick={() => { logout(); navigate("/aboutus"); setAstroOpen(false); }}>Logout Node</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="astro-menu__item" onClick={() => go("/login")}>Initiate Login</button>
                                        <button className="astro-menu__item" onClick={() => go("/signup")}>Create Identity</button>
                                    </>
                                )}
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                                <button className="astro-menu__item" onClick={() => go("/report")}>Report Issue</button>
                                <button className="astro-menu__item" onClick={() => go("/aboutus")}>About Us</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
 
            {/* =========================
          CENTER PILL NAV (ALL)
         ========================= */}
            <header className="header__el p-safe-x flex items-center" role="banner">
                <nav className="navbar-scroll-container">
                    {LINKS.map(l => (
                        <NavLink key={l.to} to={l.to} className={navLinkClass}>
                            <span className="nav-text-wrap">
                                <span className="nav-text-original">{l.label}</span>
                                <span className="nav-text-clone">{l.label}</span>
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* GLOBAL INDIAN LANGUAGE SWITCHER PILL */}
                <div className="relative ml-2 z-50">
                    <button
                        onClick={() => setLangOpen(prev => !prev)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all backdrop-blur-md shadow-lg"
                        title="Switch Indian Regional Language"
                    >
                        <span>{currentLanguage.flag}</span>
                        <span>{currentLanguage.code.toUpperCase()}</span>
                        <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {langOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-52 py-2 bg-[#080d1a]/95 border border-cyan-500/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-[10005] max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20"
                            >
                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold text-cyan-400/70 border-b border-white/5 mb-1 flex items-center gap-1.5">
                                    <Globe size={11} />
                                    <span>Indian Regional Languages</span>
                                </div>
                                {INDIAN_LANGUAGES.map((lang) => {
                                    const active = currentLanguage.code === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguageByCode(lang.code);
                                                setLangOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors group
                                                ${active ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <span>{lang.flag}</span>
                                                <span className="font-medium">{lang.nativeName}</span>
                                                <span className="text-[10px] text-white/40 font-mono">({lang.name})</span>
                                            </div>
                                            {active && <Check size={12} className="text-cyan-400 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>


            {/* =========================
          MOBILE ROUND LOGO MENU
         ========================= */}
            {isMobile && location.pathname !== "/turbo" && (
                <>
                    {/* FAB Button */}
                    <motion.button
                        onClick={() => setAstroOpen(s => !s)}
                        variants={fabVariants}
                        whileTap="tap"
                        whileHover="hover"
                        animate={astroOpen ? { rotate: 45 } : { rotate: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mobile-fab-button"
                        aria-label="Open menu"
                    >
                        <motion.img
                            src={BrandLogo}
                            alt=""
                            draggable="false"
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover"
                            }}
                            animate={astroOpen ? { scale: 0.8 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* Pulse ring when closed */}
                        {!astroOpen && (
                            <motion.span
                                className="fab-pulse-ring"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                            />
                        )}
                    </motion.button>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {astroOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    className="mobile-menu-backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setAstroOpen(false)}
                                />

                                {/* Menu */}
                                <motion.div
                                    ref={wrapperRef}
                                    className="mobile-menu-popup"
                                    variants={mobileMenuVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <motion.div className="mobile-menu-header">
                                        <span>DeepHub AI</span>
                                        <span className="mobile-menu-version">v4.27 BETA</span>
                                    </motion.div>

                                    {user ? (
                                        <>
                                            <motion.div 
                                                className="astro-menu__item" 
                                                style={{ opacity: 0.5, pointerEvents: 'none' }}
                                                variants={menuItemVariants}
                                            >
                                                Node: {user.username}
                                            </motion.div>
                                            <motion.button
                                                className="astro-menu__item"
                                                onClick={() => go("/profile")}
                                                variants={menuItemVariants}
                                                whileTap={{ scale: 0.98, x: 5 }}
                                            >
                                                <span className="menu-icon">👤</span>
                                                My Profile
                                            </motion.button>
                                            <motion.button
                                                className="astro-menu__item"
                                                onClick={() => { logout(); navigate("/aboutus"); setAstroOpen(false); }}
                                                variants={menuItemVariants}
                                                whileTap={{ scale: 0.98, x: 5 }}
                                            >
                                                <span className="menu-icon">⏻</span>
                                                Logout Node
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.button
                                                className="astro-menu__item"
                                                onClick={() => go("/login")}
                                                variants={menuItemVariants}
                                                whileTap={{ scale: 0.98, x: 5 }}
                                            >
                                                <span className="menu-icon">→</span>
                                                Initiate Login
                                            </motion.button>

                                            <motion.button
                                                className="astro-menu__item"
                                                onClick={() => go("/signup")}
                                                variants={menuItemVariants}
                                                whileTap={{ scale: 0.98, x: 5 }}
                                            >
                                                <span className="menu-icon">+</span>
                                                Create Identity
                                            </motion.button>
                                        </>
                                    )}

                                    <motion.button
                                        className="astro-menu__item"
                                        onClick={() => go("/aboutus")}
                                        variants={menuItemVariants}
                                        whileTap={{ scale: 0.98, x: 5 }}
                                    >
                                        <span className="menu-icon">ℹ</span>
                                        About Us
                                    </motion.button>

                                    <motion.button
                                        className="astro-menu__item"
                                        onClick={() => go("/report")}
                                        variants={menuItemVariants}
                                        whileTap={{ scale: 0.98, x: 5 }}
                                    >
                                        <span className="menu-icon">⚑</span>
                                        Report Issue
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </>
    );
}
