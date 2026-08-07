import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Brain,
    Presentation,
    ClipboardList,
    Database,
    Globe,
    ArrowRight,
    Sparkles,
    CheckCircle,
    Zap,
    GraduationCap,
    BookOpen,
    Users,
    Award,
    Shield,
    Star,
    Layers,
    ChevronRight
} from 'lucide-react';
import { INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'paper' | 'lesson' | 'ppt' | 'solve'>('paper');

    const sampleOutputs = {
        paper: {
            title: "CBSE Class 10 Science — 50 Marks Term 2 Blueprint",
            content: `**SECTION A: Multiple Choice Questions (1 Mark Each)**
1. What happens when dilute hydrochloric acid is added to iron filings?
   *(a) Hydrogen gas and iron chloride are produced.* (Correct)
   *(b) Chlorine gas and iron hydroxide are produced.*

**SECTION B: Short Answer Questions (3 Marks Each)**
4. State Snell's law of refraction. Calculate refractive index for light entering water from glass.
   *Marking Scheme: Formula (1M), Substitution (1M), Final Value with Units (1M).*

**SECTION C: Case-Based Integrated Problem (4 Marks)**
6. A student observes stomata under a high-power microscope during daytime...`
        },
        lesson: {
            title: "45-Minute Lesson Plan: Trigonometric Ratios (Class 9 Math)",
            content: `**Pedagogical Framework: Bloom's Taxonomy (Understand -> Apply -> Analyze)**

• **00:00 - 00:08 (Engage & Review)**: Real-world hook — measuring the height of the school flag pole without climbing using shadows.
• **00:08 - 00:22 (Concept Delivery)**: Define sine, cosine, tangent with right-angled triangle mnemonic (SOH CAH TOA).
• **00:22 - 00:35 (Guided Activity)**: Pair students to calculate $\\sin(30^\\circ)$ and $\\cos(60^\\circ)$ from standard triangles.
• **00:35 - 00:45 (Formative Assessment & Homework)**: 3 quick board problems + worksheet assignment.`
        },
        ppt: {
            title: "10-Slide Academic PPT: Photosynthesis & Light Reactions",
            content: `**Slide 1: Title & Curriculum Code** — Photosynthesis in Higher Plants (CBSE Class 11 Bio).
**Slide 2: Overview & Biochemical Equation** — $6CO_2 + 12H_2O \\xrightarrow{Light, Chlorophyll} C_6H_{12}O_6 + 6O_2 + 6H_2O$.
**Slide 3: Chloroplast Anatomy** — Thylakoid, Grana, and Stroma compartments with diagram cues.
**Slide 4: Light Dependent Phase** — Photolysis of water, electron transport chain, and ATP synthesis.
*Speaker Note: Emphasize Z-scheme diagram on board for 3 minutes before proceeding.*`
        },
        solve: {
            title: "Step-by-Step Solver: Electric Field & Gauss's Law",
            content: `**Problem**: Calculate the electric flux through a sphere of radius 10 cm enclosing a charge of $8.85 \\times 10^{-8}\\text{ C}$.

**Step 1: Formula Application (Gauss's Theorem)**:
$$\\Phi = \\frac{q_{\\text{enclosed}}}{\\varepsilon_0}$$

**Step 2: Substitution of Constants**:
$$\\Phi = \\frac{8.85 \\times 10^{-8}\\text{ C}}{8.854 \\times 10^{-12}\\text{ C}^2\\text{/N}\\cdot\\text{m}^2} \\approx 1.0 \\times 10^4\\text{ N}\\cdot\\text{m}^2\\text{/C}$$

**Step 3: Teacher's Marking Verification**: Correct formula (1M), Calculation (1M), Unit precision (1M).`
        }
    };

    return (
        <div className="min-h-screen bg-[#080C14] text-[#F8FAFC] font-sans-academic selection:bg-[#38BDF8]/30">
            {/* ── 1. Hero Section ── */}
            <section className="relative pt-12 pb-20 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#38BDF8]/10 blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-[#34D399]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    {/* Top Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-xs font-mono-stamp text-[#38BDF8] mb-6 shadow-lg">
                        <Sparkles size={13} className="text-[#38BDF8] animate-pulse" />
                        <span>DEEPHUB AI V4.0 · DESIGNED FOR 100,000+ INDIAN EDUCATORS</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[#F8FAFC] leading-[1.15] mb-6">
                        The Intelligent AI Operating System for <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#34D399]">
                            Indian Educators & Scholars
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-8">
                        Generate CBSE & State Board question papers, build 45-minute structured lesson plans, create PowerPoint slide decks, and solve complex syllabus problems across 11 Regional Indian Languages.
                    </p>

                    {/* Call to Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#38BDF8] hover:bg-[#0284c7] text-[#080C14] font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#38BDF8]/20 transition-all hover:scale-[1.02]"
                        >
                            <span>Launch Teacher Studio</span>
                            <ArrowRight size={16} />
                        </button>
                        <a
                            href="#tools"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8]/50 text-[#F8FAFC] font-semibold text-sm transition-all hover:bg-[#1E293B]"
                        >
                            Explore Curriculum AI Tools
                        </a>
                    </div>

                    {/* Regional Languages Pill Ribbon */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-[#1E293B]">
                        <span className="text-xs font-mono-stamp text-[#94A3B8] uppercase mr-2">Supported Boards & Languages:</span>
                        {INDIAN_LANGUAGES.map((lang) => (
                            <span
                                key={lang.code}
                                className="px-2.5 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[11px] font-mono-stamp text-[#38BDF8] flex items-center gap-1.5"
                            >
                                <span className="font-bold">{lang.code.toUpperCase()}</span>
                                <span className="text-[#94A3B8] text-[10px]">({lang.nativeName})</span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 2. Live Interactive AI Studio Playground Preview ── */}
            <section className="py-12 px-6 sm:px-12 max-w-6xl mx-auto">
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
                        <div>
                            <span className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider">Live Preview</span>
                            <h3 className="text-xl font-bold font-display text-[#F8FAFC] mt-0.5">
                                Real-Time Curriculum AI Generation
                            </h3>
                        </div>
                        {/* Selector Tabs */}
                        <div className="flex flex-wrap gap-2 p-1 bg-[#080C14] border border-[#1E293B] rounded-lg">
                            {[
                                { id: 'paper', label: 'Question Paper' },
                                { id: 'lesson', label: 'Lesson Plan' },
                                { id: 'ppt', label: 'Slide Deck' },
                                { id: 'solve', label: 'Problem Solver' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-[#38BDF8] text-[#080C14] font-bold shadow-md'
                                            : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Output Content Sheet */}
                    <div className="mt-6 bg-[#080C14] border border-[#1E293B] rounded-xl p-6 relative">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E293B] text-xs font-mono-stamp text-[#38BDF8]">
                            <span>{sampleOutputs[activeTab].title}</span>
                            <span className="text-[#34D399] flex items-center gap-1">
                                <CheckCircle size={13} />
                                <span>Verified Blueprint</span>
                            </span>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans-academic text-xs sm:text-sm text-[#F8FAFC] leading-relaxed">
                            {sampleOutputs[activeTab].content}
                        </pre>
                        <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between">
                            <span className="text-xs text-[#94A3B8]">Ready to customize for your school or classroom?</span>
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-4 py-2 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/40 hover:bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold font-mono-stamp uppercase flex items-center gap-1.5 transition-colors"
                            >
                                <span>Open Full Generator</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. Core Academic Tool Suite Showcase ── */}
            <section id="tools" className="py-16 px-6 sm:px-12 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider">The DeepHub Tool Suite</span>
                    <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#F8FAFC] mt-2 mb-4">
                        Everything an Indian Educator Needs, All in One Place
                    </h2>
                    <p className="text-sm sm:text-base text-[#94A3B8]">
                        Automate grading material, question setting, curriculum mapping, and presentations in seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: FileText,
                            title: "CBSE / State Board Question Generator",
                            desc: "Create comprehensive 50 & 80-mark papers with Section A (MCQs), Section B (Short Answer), Section C (Case-Based), and detailed marking schemes.",
                            badge: "CBSE & ICSE Aligned"
                        },
                        {
                            icon: Brain,
                            title: "45-Min Structured Lesson Plan Builder",
                            desc: "Construct pedagogical lesson flows based on Bloom's Taxonomy with learning objectives, board exercises, interactive activities, and homework.",
                            badge: "Pedagogy Standard"
                        },
                        {
                            icon: Presentation,
                            title: "PowerPoint Presentation Creator",
                            desc: "Generate full 10-15 slide presentation decks complete with slide key points, diagram suggestions, and teacher classroom speaker notes.",
                            badge: "PPTX Ready"
                        },
                        {
                            icon: ClipboardList,
                            title: "Exam Paper & Syllabus Solver",
                            desc: "Upload question papers or paste problems to receive step-by-step verified solutions with mathematical formulas and grading rubrics.",
                            badge: "Step-by-Step"
                        },
                        {
                            icon: Database,
                            title: "My Academic Library",
                            desc: "Secure cloud repository to store, organize, export (PDF / DOCX), and retrieve all created question papers, homework, and slide decks.",
                            badge: "Cloud Synced"
                        },
                        {
                            icon: Globe,
                            title: "11 Regional Indian Languages",
                            desc: "Native synthesis in Hindi, Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Kannada, Punjabi, and Odia without robotic translations.",
                            badge: "11 Languages"
                        }
                    ].map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                            <div
                                key={idx}
                                onClick={() => navigate('/turbo')}
                                className="group bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8]/60 p-6 rounded-xl transition-all hover:-translate-y-1 shadow-lg cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] group-hover:bg-[#38BDF8] group-hover:text-[#080C14] transition-colors">
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-[10px] font-mono-stamp uppercase px-2 py-0.5 rounded border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]">
                                            {tool.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mb-2">
                                        {tool.title}
                                    </h3>
                                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                                        {tool.desc}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs font-semibold text-[#38BDF8]">
                                    <span>Launch Tool in Studio</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. Proven Impact & Metrics Counter ── */}
            <section className="py-16 px-6 sm:px-12 bg-[#0F172A] border-y border-[#1E293B]">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "50,000+", label: "Questions Generated", sub: "CBSE, ICSE & State Boards" },
                        { value: "15,000+", label: "Lesson Plans Built", sub: "Bloom's Taxonomy Framework" },
                        { value: "11", label: "Regional Languages", sub: "Hindi, Tamil, Telugu, etc." },
                        { value: "4.9 / 5", label: "Teacher Satisfaction", sub: "1,200+ Verified Schools" },
                    ].map((stat, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold font-display text-[#38BDF8]">
                                {stat.value}
                            </div>
                            <div className="text-sm font-bold text-[#F8FAFC]">
                                {stat.label}
                            </div>
                            <div className="text-xs text-[#94A3B8]">
                                {stat.sub}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 5. Teacher Testimonials ── */}
            <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider">Teacher Community</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F8FAFC] mt-2 mb-3">
                        Trusted by Educators Across India
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            quote: "DeepHub AI cut my question paper preparation time from 4 hours to under 10 minutes. The CBSE blueprint formatting with marking schemes is phenomenal.",
                            author: "Rajesh Sharma",
                            role: "PGT Physics, Kendriya Vidyalaya Delhi"
                        },
                        {
                            quote: "Building lesson plans in Malayalam and English simultaneously used to be exhausting. DeepHub AI creates structured 45-minute lesson flows effortlessly.",
                            author: "Ananya Nair",
                            role: "High School Mathematics Teacher, Kochi"
                        },
                        {
                            quote: "The Slide Deck generator and Question Shuffler ensure no two quiz batches are identical. An absolute must-have tool for Indian school teachers.",
                            author: "Dr. K. Swaminathan",
                            role: "Senior Science Faculty, Chennai"
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#0F172A] border border-[#1E293B] p-6 rounded-xl flex flex-col justify-between shadow-lg">
                            <div className="space-y-3">
                                <div className="flex gap-1 text-[#38BDF8]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-xs text-[#94A3B8] leading-relaxed italic">
                                    "{item.quote}"
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#1E293B]">
                                <h4 className="text-sm font-bold font-display text-[#F8FAFC]">{item.author}</h4>
                                <p className="text-[11px] text-[#94A3B8]">{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 6. Bottom Call to Action Banner ── */}
            <section className="py-16 px-6 sm:px-12 max-w-5xl mx-auto text-center">
                <div className="bg-gradient-to-b from-[#0F172A] to-[#080C14] border border-[#38BDF8]/40 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#F8FAFC]">
                            Ready to Transform Your Classroom Preparation?
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Join thousands of educators saving over 15 hours every week with DeepHub AI Teacher Studio.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-8 py-3.5 rounded-lg bg-[#38BDF8] hover:bg-[#0284c7] text-[#080C14] font-bold text-sm uppercase tracking-wide inline-flex items-center gap-2 shadow-xl shadow-[#38BDF8]/30 transition-all hover:scale-105"
                            >
                                <span>Get Started with Teacher Studio</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. Footer ── */}
            <footer className="border-t border-[#1E293B] bg-[#080C14] py-8 px-6 text-center text-xs text-[#94A3B8]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold font-display text-[#F8FAFC]">DeepHub AI</span>
                        <span>· Empowering Indian Education</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span onClick={() => navigate('/terms')} className="hover:text-[#F8FAFC] cursor-pointer">Terms & Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#F8FAFC] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[#F8FAFC] cursor-pointer">Pricing</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} DeepHub AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
