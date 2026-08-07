import React, { useEffect, useState } from "react";
import Footer1 from "../components/Footer1";
import Card3D from "../components/Card3D";
import ScrollProgress from "../components/ScrollProgress";
import "../index.css";
import { Brain, Cpu, ExternalLink, BookOpen, Layers, Star, Compass } from "lucide-react";

/* ==============================
   TYPING HOOK
================================ */
function useTypewriter(text: string, speed: number = 35) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        setDisplayed("");
        if (!text) return;
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return displayed;
}

/* ==============================
   INTERFACES & TYPES
================================ */
export type ToolCategory = "All Tools" | "Lesson Planning" | "Quiz & Assessment" | "Visuals & Slides" | "Transcription & Notes" | "Adaptive Learning";

interface EducatorTool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    bestFor: string;
    features: string[];
    pricing: string;
    url: string;
    domain: string;
}

interface AIAgent {
    id: string;
    name: string;
    author: string;
    score: number;
    url: string;
    downloads: number;
}

/* ==============================
   EDUCATOR TOOLS DIRECTORY
================================ */
const EDUCATOR_TOOLS: EducatorTool[] = [
    {
        id: "tool-1",
        name: "ChatGPT (OpenAI)",
        category: "Lesson Planning",
        bestFor: "Lesson ideas, explanations, quiz creation, writing help",
        features: ["Conversational AI for content creation", "Lesson plans", "Quizzes", "Worksheets"],
        pricing: "Free tier; Plus ~$20/mo",
        description: "Versatile conversational AI for generating unit outlines, reading passages, and step-by-step math explanations.",
        url: "https://chatgpt.com/",
        domain: "chatgpt.com"
    },
    {
        id: "tool-2",
        name: "Brisk Teaching",
        category: "Lesson Planning",
        bestFor: "Google Workspace integration & feedback",
        features: ["AI lesson plan & quiz generator", "Targeted student feedback", "Google Docs/Slides extension"],
        pricing: "Free tier; Premium ~$10–$12/mo",
        description: "Integrates directly inside Google Docs to generate lesson plans, targeted student feedback, and reading level adaptations.",
        url: "https://www.briskteaching.com/",
        domain: "briskteaching.com"
    },
    {
        id: "tool-3",
        name: "MagicSchool AI",
        category: "Lesson Planning",
        bestFor: "60+ specialized K-12 educator AI tools",
        features: ["IEP generator", "Multiple choice generator", "Rubric builder", "Diagnostic tools"],
        pricing: "Free plan; Pro ~$9.99/mo",
        description: "Comprehensive suite of 60+ AI tools designed specifically for educators to handle administrative and instructional tasks.",
        url: "https://www.magicschool.ai/",
        domain: "magicschool.ai"
    },
    {
        id: "tool-4",
        name: "Curipod",
        category: "Visuals & Slides",
        bestFor: "Interactive student slides & real-time polling",
        features: ["AI-generated interactive slides", "Real-time polls", "Drawing prompts", "Student participation stats"],
        pricing: "Free tier; Premium ~$10/mo",
        description: "Generates fully interactive slide decks with live student polling, open-ended response prompts, and word clouds.",
        url: "https://curipod.com/",
        domain: "curipod.com"
    },
    {
        id: "tool-5",
        name: "Diffit for Teachers",
        category: "Adaptive Learning",
        bestFor: "Adapting text & reading passages to grade levels",
        features: ["Multi-level reading passages", "Vocab flashcards", "Checks for understanding", "Export to PDF/Docs"],
        pricing: "Free tier; Pro ~$8/mo",
        description: "Takes any article, video, or topic and instantly generates differentiated reading passages adapted to any grade level.",
        url: "https://www.diffit.me/",
        domain: "diffit.me"
    },
    {
        id: "tool-6",
        name: "Khanmigo (Khan Academy)",
        category: "Adaptive Learning",
        bestFor: "Socratic AI tutoring & student guidance",
        features: ["Socratic guidance without direct answers", "Math problem helper", "Code tutor"],
        pricing: "Free for US teachers; Low-cost student plans",
        description: "Socratic AI assistant that prompts students with guided questions instead of revealing direct solutions.",
        url: "https://www.khanacademy.org/khan-labs",
        domain: "khanacademy.org"
    },
    {
        id: "tool-7",
        name: "Canva Magic Studio",
        category: "Visuals & Slides",
        bestFor: "Visual classroom materials & infographics",
        features: ["AI visual generator", "Worksheets & poster templates", "Automated presentations"],
        pricing: "Free for verified educators",
        description: "Empowers teachers to design visually engaging classroom posters, educational infographics, and slide decks.",
        url: "https://www.canva.com/",
        domain: "canva.com"
    },
    {
        id: "tool-8",
        name: "Otter.ai",
        category: "Transcription & Notes",
        bestFor: "Real-time lecture transcription & automated notes",
        features: ["Live voice-to-text transcription", "Searchable lecture notes", "Automated summary bullet points"],
        pricing: "Free tier; Pro ~$16.99/mo",
        description: "Transcribes live classroom lectures, faculty meetings, and guest presentations with automated topic tagging.",
        url: "https://otter.ai/",
        domain: "otter.ai"
    },
    {
        id: "tool-9",
        name: "Eduaide.AI",
        category: "Quiz & Assessment",
        bestFor: "Instructional design, rubrics & assessment generation",
        features: ["100+ resource generators", "Assessment builder", "Scaffolding tools", "Gamification ideas"],
        pricing: "Free plan; Pro ~$5.99/mo",
        description: "Designed by teachers to create curriculum resources, differentiated assessments, and clear evaluation rubrics.",
        url: "https://www.eduaide.ai/",
        domain: "eduaide.ai"
    }
];

export default function Virtualbrain() {
    const heading = useTypewriter("#Virtual Brain Tools & Hub.", 35);

    /* Directory State */
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "All Tools">("All Tools");

    /* HuggingFace Models State */
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(true);

    /* Fetch Live HuggingFace Models */
    useEffect(() => {
        async function fetchAgents() {
            try {
                const res = await fetch(
                    "https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=8"
                );
                if (res.ok) {
                    const data = await res.json();
                    const maxDownloads = data[0]?.downloads || 1;
                    const formatted: AIAgent[] = data.map((m: any) => ({
                        id: m.id,
                        name: m.id.split("/").pop().replace(/-/g, " "),
                        author: m.author || "Community",
                        score: Math.round((m.downloads / maxDownloads) * 100),
                        url: `https://huggingface.co/${m.id}`,
                        downloads: m.downloads
                    }));
                    setAgents(formatted);
                }
            } catch (err) {
                console.error("Failed to fetch AI agents", err);
            } finally {
                setLoadingAgents(false);
            }
        }
        fetchAgents();
    }, []);

    /* Category Filtered Tools */
    const categoryList: (ToolCategory | "All Tools")[] = [
        "All Tools",
        "Lesson Planning",
        "Quiz & Assessment",
        "Visuals & Slides",
        "Transcription & Notes",
        "Adaptive Learning"
    ];

    const filteredTools = EDUCATOR_TOOLS.filter(t => {
        const matchesCat = selectedCategory === "All Tools" || t.category === selectedCategory;
        const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    return (
        <div className="min-h-screen bg-[#020408] text-white">
            {/* Scroll Experience: Dynamic Reading Progress Bar & Back-to-Top Button */}
            <ScrollProgress />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* HEADER SECTION */}
                <header className="mb-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                        Virtual Brain Neural Core • EdTech Directory
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white/90 min-h-[1.4em]">
                        {heading}
                    </h1>

                    <p className="text-sm sm:text-base text-white/60 mt-3 leading-relaxed">
                        Explore curated AI platforms, K-12 educator tools, and open-source model benchmarks.
                    </p>
                </header>

                {/* ========================================================
                    1. CURATED EDTECH TOOLS DIRECTORY
                   ======================================================== */}
                <section className="mb-16">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-cyan-400" />
                                AI Tools for Educators
                            </h2>
                            <p className="text-xs text-white/50 mt-1">Directory of classroom tools & platform integrations</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Filter tools by name, features, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder:text-white/30 outline-none transition-all"
                            />
                            <div className="absolute left-3 top-2.5 text-white/40">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categoryList.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    selectedCategory === cat
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                                        : "bg-white/[0.03] text-white/60 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid of Educator Tools with 3D Web Spatial Depth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <Card3D key={tool.id} depth={10} glare={true}>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between h-full min-h-[280px] shadow-xl">
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                                                    alt={tool.name}
                                                    className="w-7 h-7 rounded-lg object-contain p-1 bg-white/10"
                                                />
                                                <div>
                                                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                        {tool.name}
                                                    </h3>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                                        {tool.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-white/40 hover:text-cyan-400 rounded-lg hover:bg-white/10 transition-colors"
                                                title="Visit website"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>

                                        <p className="text-xs text-white/70 leading-relaxed mb-3">
                                            {tool.description}
                                        </p>

                                        <div className="mb-4">
                                            <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mb-1.5">
                                                Key Features
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {tool.features.map((feat, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/60">
                                                        {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-mono text-emerald-400">
                                            {tool.pricing}
                                        </span>

                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                                        >
                                            <span>Open Tool</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </Card3D>
                        ))}
                    </div>
                </section>

                {/* ========================================================
                    2. HUGGINGFACE FOUNDATION MODELS & BENCHMARKS
                   ======================================================== */}
                <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-indigo-400" />
                                Open-Source AI Agent & Model Benchmarks
                            </h2>
                            <p className="text-xs text-white/50 mt-1">Live downloads from Hugging Face model registry</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loadingAgents ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-white/[0.02] border border-white/10 rounded-xl animate-pulse" />
                            ))
                        ) : (
                            agents.map(agent => (
                                <a
                                    key={agent.id}
                                    href={agent.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/40 hover:bg-indigo-500/[0.04] transition-all group block"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                                            {agent.name}
                                        </p>
                                        <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-indigo-400 flex-shrink-0" />
                                    </div>

                                    <p className="text-[10px] text-white/40 font-mono uppercase mb-2">
                                        {agent.author}
                                    </p>

                                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/[0.06]">
                                        <span className="text-indigo-400">{(agent.downloads / 1000).toFixed(0)}k DLs</span>
                                        <span className="text-emerald-400">Score: {agent.score}%</span>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <Footer1 />
        </div>
    );
}
