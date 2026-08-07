import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Sparkles,
    ChevronDown,
    Plus,
    Minus,
    ExternalLink,
    Bot,
    Cpu,
    Zap,
    Users,
    Newspaper,
    Sliders,
    MessageSquare,
    CheckCircle2,
    Shield,
    Globe,
    Search,
    Layers,
    Brain,
    HelpCircle,
    Star
} from 'lucide-react';
import BrandLogo from '../assets/brand-logo-main.svg';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const { theme } = useLanguage();
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState('');

    const AI_INNOVATIONS = [
        { name: 'ChatGPT', role: 'Language Model', provider: 'OpenAI', icon: '🤖', link: 'https://chat.openai.com' },
        { name: 'Gemini', role: 'Google AI', provider: 'Google', icon: '✨', link: 'https://gemini.google.com' },
        { name: 'Claude', role: 'Anthropic AI', provider: 'Anthropic', icon: '🧠', link: 'https://claude.ai' },
        { name: 'Perplexity', role: 'Search AI', provider: 'Perplexity', icon: '🔍', link: 'https://perplexity.ai' },
        { name: 'Mistral', role: 'Open Source AI', provider: 'Mistral AI', icon: '🌪️', link: 'https://mistral.ai' },
        { name: 'DeepSeek', role: 'Reasoning AI', provider: 'DeepSeek', icon: '⚡', link: 'https://deepseek.com' },
        { name: 'Groq', role: 'Hardware AI', provider: 'Groq Inc', icon: '⚡', link: 'https://groq.com' },
        { name: 'Midjourney', role: 'Image Gen', provider: 'Midjourney', icon: '🎨', link: 'https://midjourney.com' },
        { name: 'Runway', role: 'Video AI', provider: 'RunwayML', icon: '🎬', link: 'https://runwayml.com' },
        { name: 'Pika', role: 'Video AI', provider: 'Pika Labs', icon: '📹', link: 'https://pika.art' },
        { name: 'HeyGen', role: 'Avatar AI', provider: 'HeyGen', icon: '👤', link: 'https://heygen.com' },
        { name: 'ElevenLabs', role: 'Audio AI', provider: 'ElevenLabs', icon: '🎙️', link: 'https://elevenlabs.io' },
        { name: 'GitHub Copilot', role: 'Coding AI', provider: 'GitHub', icon: '💻', link: 'https://github.com/features/copilot' },
        { name: 'Cursor', role: 'Coding AI', provider: 'Anysphere', icon: '🖱️', link: 'https://cursor.com' },
        { name: 'Jasper', role: 'Marketing AI', provider: 'Jasper', icon: '✍️', link: 'https://jasper.ai' },
        { name: 'Copy.ai', role: 'Writing AI', provider: 'Copy.ai', icon: '📝', link: 'https://copy.ai' },
        { name: 'Canva Pro', role: 'Design AI', provider: 'Canva', icon: '📐', link: 'https://canva.com' },
        { name: 'Brisk Teaching', role: 'EdTech AI', provider: 'Brisk', icon: '🎓', link: 'https://briskteaching.com' },
        { name: 'Diffit', role: 'EdTech AI', provider: 'Diffit', icon: '📚', link: 'https://diffit.me' },
        { name: 'Curipod', role: 'EdTech AI', provider: 'Curipod', icon: '💡', link: 'https://curipod.com' },
        { name: 'Otter.ai', role: 'Meeting AI', provider: 'Otter', icon: '🗣️', link: 'https://otter.ai' },
        { name: 'Adobe Firefly', role: 'Design AI', provider: 'Adobe', icon: '🖌️', link: 'https://firefly.adobe.com' },
        { name: 'Perplexity Pages', role: 'Content AI', provider: 'Perplexity', icon: '📄', link: 'https://perplexity.ai' },
        { name: 'Ollama', role: 'Local AI', provider: 'Ollama', icon: '🦙', link: 'https://ollama.com' },
    ];

    const WHY_CARDS = [
        {
            title: 'All-in-One AI Hub',
            desc: 'A unified platform for everything AI.',
            icon: Layers,
            badge: 'Unified',
            color: '#FF9900'
        },
        {
            title: 'Customized Platform',
            desc: 'Solutions that adapt to your needs, workflow, and goals.',
            icon: Sliders,
            badge: 'Adaptive',
            color: '#00A4E4'
        },
        {
            title: 'News & Updates',
            desc: 'Stay ahead with real-time AI breakthroughs and insights.',
            icon: Newspaper,
            badge: 'Real-Time',
            color: '#FF9900'
        },
        {
            title: 'Explore AI Products',
            desc: 'Discover advanced robots, smart tools, and futuristic technologies.',
            icon: Bot,
            badge: 'Robotics',
            color: '#00A4E4'
        },
        {
            title: 'Personalized AI Assistant',
            desc: 'Your intelligent companion for tasks, learning, and decision-making.',
            icon: Brain,
            badge: 'Companion',
            color: '#FF9900'
        },
        {
            title: 'Powerful AI Community',
            desc: 'Connect, collaborate, and grow with innovators shaping the future.',
            icon: Users,
            badge: 'Community',
            color: '#00A4E4'
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

    const filteredInnovations = AI_INNOVATIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans-academic selection:bg-[#FF9900]/25 transition-colors">
            
            {/* ── TOP NAVBAR ── */}
            <header className="border-b border-[#1E2640] bg-[#000000]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-50 shadow-lg notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="font-display font-bold text-base text-[#FFFFFF] tracking-tight flex items-center gap-1.5">
                                <span>DeepHub AI</span>
                                <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 font-semibold uppercase">
                                    AI HUB
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links Center */}
                    <nav className="hidden md:flex items-center gap-2">
                        <a href="#why" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            Why
                        </a>
                        <a href="#innovations" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            Integrated Intelligence
                        </a>
                        <a href="#faq" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            FAQ
                        </a>
                        <a href="#feedback" className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0E1424] transition-colors">
                            Feedback
                        </a>
                        <button onClick={() => navigate('/turbo')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#FF9900] hover:bg-[#FF9900]/10 transition-colors">
                            Turbo Studio
                        </button>
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-4 py-1.5 rounded-md bg-[#FF9900] hover:bg-[#FFA726] text-black text-xs font-bold tracking-wide transition-all shadow-md active:scale-98"
                        >
                            Open DeepHub AI
                        </button>
                    </div>
                </div>
            </header>

            {/* ── 1. HERO SECTION ── */}
            <section className="pt-20 pb-24 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1424] border border-[#1E2640] text-xs font-semibold text-[#FF9900] shadow-inner">
                    <Sparkles size={14} className="text-[#FF9900]" />
                    <span>Welcome to the World’s First All-in-One AI Hub</span>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-[#FFFFFF] leading-[1.08]">
                        AI <br />
                        <span className="text-[#FF9900]">for Everyone.</span>
                    </h1>

                    <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mx-auto font-sans-academic pt-2">
                        Making AI products simple, accessible, and powerful for individuals and enterprises.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate('/turbo')}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF9900] hover:bg-[#FFA726] text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                        <span>Discover our story</span>
                        <ArrowRight size={16} />
                    </button>
                    <a
                        href="#why"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0E1424] border border-[#1E2640] hover:border-[#FF9900] text-[#FFFFFF] text-sm font-semibold tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                        <span>DeepHub AI</span>
                    </a>
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

            {/* ── 2. INTEGRATED INTELLIGENCE / EXPLORE AI INNOVATIONS ── */}
            <section id="innovations" className="py-20 px-4 sm:px-8 bg-[#080C14] border-y border-[#1E2640]">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider mb-2">
                                <Zap size={14} />
                                <span>Integrated Intelligence</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#FFFFFF]">
                                Explore AI Innovations from the World's Leading Companies.
                            </h2>
                        </div>
                        
                        {/* Quick Search */}
                        <div className="relative w-full md:w-72">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Filter AI models..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#0E1424] border border-[#1E2640] rounded-lg text-xs text-[#FFFFFF] placeholder-[#94A3B8] focus:border-[#FF9900] outline-none"
                            />
                        </div>
                    </div>

                    {/* AI Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                        {filteredInnovations.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl bg-[#0E1424] border border-[#1E2640] hover:border-[#FF9900] transition-all card-lift flex flex-col justify-between group shadow-md"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl">{item.icon}</span>
                                        <ExternalLink size={12} className="text-[#94A3B8] group-hover:text-[#FF9900] transition-colors" />
                                    </div>
                                    <div className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#FF9900] transition-colors font-display">
                                        {item.name}
                                    </div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-[#1E2640]/60 text-[11px] text-[#00A4E4] font-medium">
                                    {item.role}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. WHY CHOOSE DEEPHUB AI? ── */}
            <section id="why" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-mono-stamp text-[#FF9900] uppercase font-bold tracking-wider">
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
                                className="p-6 rounded-2xl bg-[#0E1424] border border-[#1E2640] hover:border-[#FF9900] transition-all card-lift shadow-xl flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 rounded-xl bg-[#000000] border border-[#1E2640] text-[#FF9900]">
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
                                <div className="mt-6 pt-4 border-t border-[#1E2640] flex items-center justify-between text-xs font-semibold text-[#FF9900]">
                                    <span>Learn more</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
            <section id="faq" className="py-20 px-4 sm:px-8 bg-[#080C14] border-y border-[#1E2640]">
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
                                    className="rounded-xl bg-[#0E1424] border border-[#1E2640] overflow-hidden transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#FFFFFF] hover:text-[#FF9900] transition-colors"
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

            {/* ── 5. WE VALUE YOUR FEEDBACK ── */}
            <section id="feedback" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
                <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1424] border border-[#1E2640] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 p-3 rounded-full bg-[#000000] border border-[#1E2640] text-[#FF9900]">
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
                            className="px-8 py-3.5 rounded-xl bg-[#FF9900] hover:bg-[#FFA726] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98"
                        >
                            Share Feedback
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 6. FOOTER ── */}
            <footer className="border-t border-[#1E2640] bg-[#000000] py-12 px-4 sm:px-8 text-xs text-[#94A3B8] notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-6 h-6 object-contain" />
                        <span className="font-bold font-display text-base text-[#FFFFFF]">DEEPHUB AI</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
                        <span onClick={() => navigate('/report-issue')} className="hover:text-[#FFFFFF] cursor-pointer">Help Centre</span>
                        <span onClick={() => navigate('/terms')} className="hover:text-[#FFFFFF] cursor-pointer">Jobs</span>
                        <span onClick={() => navigate('/terms')} className="hover:text-[#FFFFFF] cursor-pointer">Terms Of Use</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#FFFFFF] cursor-pointer">Cookie Preference</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[#FF9900] text-[#FF9900] font-semibold cursor-pointer">Turbo</span>
                    </div>

                    <div className="text-center md:text-right">
                        © {new Date().getFullYear()} DeepHubAI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
