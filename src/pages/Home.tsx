import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Sparkles,
    Plus,
    Minus,
    Bot,
    Sliders,
    MessageSquare,
    CheckCircle2,
    Layers,
    Brain,
    Newspaper,
    Users,
    ExternalLink,
    TrendingUp,
    Radio
} from 'lucide-react';
import BrandLogo from '../assets/brand-logo-main.svg';
import GraphicalBackend from '../components/GraphicalBackend';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

export default function Home() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const LATEST_AI_NEWS = [
        {
            tag: 'Reasoning AI',
            title: 'DeepSeek-R1 & OpenAI o3 Open Architecture',
            summary: 'Mathematical derivation models achieving 99.2% accuracy on complex STEM benchmarks with step-by-step cognitive verification.',
            time: '2 hours ago'
        },
        {
            tag: 'Curriculum AI',
            title: 'CBSE & ICSE 2026 Examination Blueprint Directives',
            summary: 'Standardized Bloom’s Revised Taxonomy mandate requiring 50% competency-based questions across all secondary assessments.',
            time: '5 hours ago'
        },
        {
            tag: 'Multilingual AI',
            title: 'Indic Neural Translation Engine (11 Languages)',
            summary: 'Zero pedagogical drift translation across Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, and Gujarati educational mediums.',
            time: '1 day ago'
        }
    ];

    const WHY_CARDS = [
        {
            title: 'All-in-One AI Hub',
            desc: 'A unified platform for everything AI.',
            icon: Layers,
            badge: 'Unified',
            color: '#00A4E4'
        },
        {
            title: 'Customized Platform',
            desc: 'Solutions that adapt to your needs, workflow, and goals.',
            icon: Sliders,
            badge: 'Adaptive',
            color: '#6E85D6'
        },
        {
            title: 'News & Updates',
            desc: 'Stay ahead with real-time AI breakthroughs and insights.',
            icon: Newspaper,
            badge: 'Real-Time',
            color: '#00A4E4'
        },
        {
            title: 'Explore AI Products',
            desc: 'Discover advanced robots, smart tools, and futuristic technologies.',
            icon: Bot,
            badge: 'Robotics',
            color: '#6E85D6'
        },
        {
            title: 'Personalized AI Assistant',
            desc: 'Your intelligent companion for tasks, learning, and decision-making.',
            icon: Brain,
            badge: 'Companion',
            color: '#00A4E4'
        },
        {
            title: 'Powerful AI Community',
            desc: 'Connect, collaborate, and grow with innovators shaping the future.',
            icon: Users,
            badge: 'Community',
            color: '#6E85D6'
        }
    ];

    const FAQS = [
        {
            q: 'What is Deephub AI?',
            a: 'Deephub AI is an all-in-one platform offering AI products, personalised assistants, and real-time AI updates. designed to simplify and enhance everyday workflows.'
        },
        {
            q: 'What type of robots and AI products do you offer?',
            a: 'We offer next-generation robots, smart automation tools, AI assistants, and productivity-focused solutions built for individuals, startups, and businesses.'
        },
        {
            q: 'Can I customize the AI tools for my needs?',
            a: 'Yes. Deephub AI provides a fully customizable platform where tools adapt to your workflow, preferences, and goals.'
        },
        {
            q: 'Do I need technical knowledge to use Deephub AI?',
            a: 'No. Everything is designed to be simple, intuitive, and user-friendly—anyone can start using our AI tools with ease.'
        },
        {
            q: 'How often do you release updates or new products?',
            a: 'We regularly release new features, AI tools, and robotics updates to keep you ahead with the latest innovations.'
        },
        {
            q: 'Is there a personalized AI assistant available?',
            a: 'Yes. Deephub AI includes a personalised assistant that helps with tasks, learning, recommendations, and real-time support.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans-academic selection:bg-[#00A4E4]/25 transition-colors relative overflow-hidden">
            {/* Interactive Graphical Starfield Backend */}
            <GraphicalBackend />

            {/* ── TOP NAVBAR ── */}
            <header className="border-b border-[#1E2640]/80 bg-[#000000]/85 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-50 shadow-lg notranslate relative" translate="no">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="font-display font-bold text-base text-[#FFFFFF] tracking-tight flex items-center gap-1.5">
                                <span>DeepHub AI</span>
                                <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[#00A4E4]/15 text-[#00A4E4] border border-[#00A4E4]/30 font-semibold uppercase">
                                    DEEPHUB AI
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links Center */}
                    <nav className="hidden md:flex items-center gap-3">
                        <a href="#why" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            Why
                        </a>
                        <a href="#comparison" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            Before vs After
                        </a>
                        <button
                            onClick={() => navigate('/latest')}
                            className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#00A4E4] hover:bg-[#00A4E4]/10 transition-colors flex items-center gap-1"
                        >
                            <Radio size={12} className="text-[#00A4E4] animate-pulse" />
                            <span>Latest AI News</span>
                        </button>
                        <a href="#faq" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            FAQ
                        </a>
                        <button onClick={() => navigate('/turbo')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                            Turbo Studio
                        </button>
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-4 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black text-xs font-bold tracking-wide transition-all shadow-md active:scale-98"
                        >
                            Open DeepHub AI
                        </button>
                    </div>
                </div>
            </header>

            {/* ── 1. HERO SECTION ── */}
            <section className="pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1424]/90 backdrop-blur-sm border border-[#1E2640] text-xs font-semibold text-[#00A4E4] shadow-inner">
                    <Sparkles size={14} className="text-[#00A4E4]" />
                    <span>Welcome to the World’s First All-in-One AI Hub</span>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-[#FFFFFF] leading-[1.08]">
                        AI <br />
                        <span className="text-[#00A4E4]">for Everyone.</span>
                    </h1>

                    <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mx-auto font-sans-academic pt-2">
                        Making AI products simple, accessible, and powerful for individuals and enterprises.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate('/turbo')}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                        <span>Discover Turbo</span>
                        <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={() => navigate('/latest')}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0E1424]/90 backdrop-blur-sm border border-[#1E2640] hover:border-[#00A4E4] text-[#FFFFFF] text-sm font-semibold tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                        <Radio size={14} className="text-[#00A4E4]" />
                        <span>Latest AI Updates</span>
                    </button>
                </div>

                {/* Sub Hero Badges */}
                <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#94A3B8] font-mono-stamp">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#00A4E4]" /> All-in-One AI Hub
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#00A4E4]" /> Customized Platform
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#00A4E4]" /> Real-time Breakthroughs
                    </span>
                </div>
            </section>

            {/* ── 2. LATEST UPDATES IN AI WORLD SPOTLIGHT ── */}
            <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 border-t border-[#1E2640]/80">
                <div className="p-6 sm:p-10 rounded-3xl bg-[#0E1424]/90 backdrop-blur-md border border-[#1E2640] shadow-2xl space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-xs font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider">
                                <Radio size={14} className="animate-pulse" />
                                <span>Real-Time Intelligence Feed</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#FFFFFF]">
                                Latest Updates in the AI World
                            </h2>
                            <p className="text-xs sm:text-sm text-[#94A3B8] font-sans-academic leading-relaxed">
                                Stay ahead with breaking breakthroughs in frontier reasoning models, curriculum engineering, and educational robotics.
                            </p>
                        </div>

                        <div>
                            <button
                                onClick={() => navigate('/latest')}
                                className="px-6 py-3 rounded-xl bg-[#00A4E4] hover:bg-[#38BDF8] text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md active:scale-98"
                            >
                                <span>Go to Latest AI Updates</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* 3 News Snapshot Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {LATEST_AI_NEWS.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate('/latest')}
                                className="p-5 rounded-2xl bg-[#000000]/60 border border-[#1E2640] hover:border-[#00A4E4] transition-all card-lift flex flex-col justify-between cursor-pointer group shadow-md"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-[#00A4E4] font-semibold font-mono-stamp">
                                            {item.tag}
                                        </span>
                                        <span className="text-white/40 font-mono text-[10px]">{item.time}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-[#00A4E4] transition-colors font-display line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 font-sans-academic">
                                        {item.summary}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-[#00A4E4]">
                                    <span>Read Full Article</span>
                                    <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. WHY CHOOSE DEEPHUB AI? ── */}
            <section id="why" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#1E2640]/80 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider">
                        Why Choose
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#FFFFFF]">
                        DeepHub AI?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-sans-academic">
                        Designed to simplify, unify, and empower everyday workflows with next-generation artificial intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {WHY_CARDS.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-[#0E1424]/90 backdrop-blur-md border border-[#1E2640] hover:border-[#00A4E4] transition-all card-lift shadow-xl flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 rounded-xl bg-[#000000] border border-[#1E2640] text-[#00A4E4]">
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-[10px] font-mono-stamp text-[#00A4E4] border border-[#00A4E4]/30 bg-[#00A4E4]/10 px-2 py-0.5 rounded">
                                            {card.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#FFFFFF] font-display">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans-academic">
                                        {card.desc}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[#1E2640] flex items-center justify-between text-xs font-semibold text-[#00A4E4]">
                                    <span>Learn more</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. BEFORE VS. AFTER COMPARISON ── */}
            <div id="comparison">
                <BeforeAfterSlider />
            </div>

            {/* ── 5. FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
            <section id="faq" className="py-24 px-4 sm:px-8 bg-[#080C14]/90 backdrop-blur-md border-y border-[#1E2640]/80 relative z-0">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <span className="text-xs font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider">
                            Got Questions?
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#FFFFFF]">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-3.5">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-[#0E1424]/90 backdrop-blur-sm border border-[#1E2640] overflow-hidden transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#FFFFFF] hover:text-[#00A4E4] transition-colors"
                                    >
                                        <span>{faq.q}</span>
                                        <div className="p-1 rounded-md bg-[#000000] border border-[#1E2640] text-[#94A3B8]">
                                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans-academic border-t border-[#1E2640]/60 pt-3 animate-settle">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 6. WE VALUE YOUR FEEDBACK ── */}
            <section id="feedback" className="py-24 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6 relative z-0">
                <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1424]/90 backdrop-blur-md border border-[#1E2640] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 p-3 rounded-full bg-[#000000] border border-[#1E2640] text-[#00A4E4]">
                        <MessageSquare size={24} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#FFFFFF]">
                            We Value Your Feedback
                        </h2>
                        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto font-sans-academic">
                            Help us improve by sharing your thoughts and suggestions.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => navigate('/report-issue')}
                            className="px-8 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98"
                        >
                            Share Feedback
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 7. FOOTER ── */}
            <footer className="border-t border-[#1E2640]/80 bg-[#000000]/95 backdrop-blur-md py-12 px-4 sm:px-8 text-xs text-[#94A3B8] notranslate relative z-10" translate="no">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-6 h-6 object-contain" />
                        <span className="font-bold font-display text-base text-[#FFFFFF]">DEEPHUB AI</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
                        <span onClick={() => navigate('/latest')} className="hover:text-[#00A4E4] cursor-pointer font-semibold text-[#00A4E4]">Latest Feed</span>
                        <span onClick={() => navigate('/report-issue')} className="hover:text-[#FFFFFF] cursor-pointer">Help Centre</span>
                        <span onClick={() => navigate('/terms')} className="hover:text-[#FFFFFF] cursor-pointer">Jobs</span>
                        <span onClick={() => navigate('/terms')} className="hover:text-[#FFFFFF] cursor-pointer">Terms Of Use</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#FFFFFF] cursor-pointer">Cookie Preference</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[#00A4E4] text-[#00A4E4] font-semibold cursor-pointer">Turbo</span>
                    </div>

                    <div className="text-center md:text-right">
                        © {new Date().getFullYear()} DeepHubAI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
