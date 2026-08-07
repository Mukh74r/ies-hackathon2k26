import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Brain,
    Presentation,
    ClipboardList,
    Database,
    Globe,
    ArrowRight,
    Sliders,
    GraduationCap,
    Check,
    Sun,
    Moon,
    ChevronDown,
    ChevronRight,
    Cpu,
    BookOpen,
    Layers,
    ShieldCheck,
    CheckCircle2,
    Sparkles,
    FileSpreadsheet,
    Printer,
    Download
} from 'lucide-react';
import BrandLogo from '../assets/brand-logo-main.svg';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const { currentLanguage, setLanguageByCode, theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';
    const [langOpen, setLangOpen] = useState(false);

    // Interactive Blueprint State
    const [selectedBoard, setSelectedBoard] = useState('CBSE');
    const [selectedGrade, setSelectedGrade] = useState('10');
    const [selectedSubject, setSelectedSubject] = useState('Physics');

    // Live Generation simulation for the Hero Snapshot
    const [visibleSections, setVisibleSections] = useState<number>(0);

    useEffect(() => {
        // Honest progressive fill-in once on load: Section A (100ms) -> Section B (350ms) -> Section C (600ms)
        const t1 = setTimeout(() => setVisibleSections(1), 100);
        const t2 = setTimeout(() => setVisibleSections(2), 380);
        const t3 = setTimeout(() => setVisibleSections(3), 680);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [selectedBoard, selectedGrade, selectedSubject]);

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans-academic selection:bg-[var(--primary)]/15 transition-colors">
            
            {/* ── 1. Top Header Navigation (Institutional Standard) ── */}
            <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-8 py-2.5 sticky top-0 z-50 shadow-xs notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-7 h-7 object-contain" />
                        <div>
                            <div className="font-display font-semibold text-base text-[var(--foreground)] tracking-tight flex items-center gap-1.5">
                                <span>DeepHub AI</span>
                                <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold uppercase">
                                    V4.2
                                </span>
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] hidden sm:block leading-none mt-0.5">
                                Curriculum & Examination Architecture Platform
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        >
                            Institutional Pricing
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        >
                            Profile
                        </button>

                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-3.5 py-1.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
                        >
                            <span>Turbo</span>
                            <ChevronRight size={13} />
                        </button>

                        {/* Theme Toggle (Light Default / Dark Opt-In) */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] transition-all card-lift"
                            title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                        >
                            {isLight ? (
                                <>
                                    <Sun size={13} className="text-[#B5762A]" />
                                    <span className="hidden sm:inline text-[11px] text-[var(--muted-foreground)]">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={13} className="text-[#6E85D6]" />
                                    <span className="hidden sm:inline text-[11px] text-[var(--muted-foreground)]">Dark</span>
                                </>
                            )}
                        </button>

                        {/* Regional Language Picker Dropdown */}
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
                                    <div className="col-span-2 px-2 py-1 text-[10px] font-mono-stamp text-[var(--muted-foreground)] uppercase border-b border-[var(--border)] mb-1">
                                        11 Regional Languages
                                    </div>
                                    {INDIAN_LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguageByCode(lang.code);
                                                setLangOpen(false);
                                            }}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-left transition-colors notranslate ${
                                                currentLanguage.code === lang.code
                                                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/25'
                                                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                            }`}
                                            translate="no"
                                        >
                                            <div className="flex flex-col notranslate">
                                                <span className="font-mono-stamp text-[11px] uppercase notranslate">{lang.code}</span>
                                                <span className="text-[10px] text-[var(--muted-foreground)] notranslate">{lang.name} ({lang.nativeName})</span>
                                            </div>
                                            {currentLanguage.code === lang.code && <Check size={12} className="text-[var(--primary)]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── 2. HERO: Split Layout (Concrete Function Left + Real Live Blueprint Right) ── */}
            <section className="pt-12 pb-14 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Plain, Credible Institutional Proposition */}
                    <div className="lg:col-span-5 space-y-6 pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--primary)] shadow-2xs">
                            <ShieldCheck size={14} className="text-[var(--primary)] flex-shrink-0" />
                            <span>CBSE · ICSE · STATE BOARD BLUEPRINTS</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-semibold font-display tracking-tight text-[var(--foreground)] leading-[1.2]">
                            Curriculum-to-examination architecture for Indian schools.
                        </h1>

                        <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-sans-academic">
                            DeepHub AI ingests syllabus frameworks and chapter weightage to formulate standardized 50-mark examination papers, 45-minute lesson timelines, and step-by-step marking rubrics across 11 Indian regional languages.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-5 py-2.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 card-lift"
                            >
                                <span>Open Turbo</span>
                                <ArrowRight size={14} />
                            </button>
                            <a
                                href="#solver-showcase"
                                className="px-4 py-2.5 rounded-md bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all card-lift"
                            >
                                <Sliders size={14} className="text-[var(--primary)]" />
                                <span>View Marking Engine</span>
                            </a>
                        </div>

                        {/* Board Blueprint Selector Controls */}
                        <div className="p-3.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] shadow-xs space-y-2.5 mt-4">
                            <div className="text-[11px] font-mono-stamp uppercase text-[var(--muted-foreground)] font-semibold">
                                Live Blueprint Parameters
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-medium">Board</label>
                                    <select
                                        value={selectedBoard}
                                        onChange={(e) => setSelectedBoard(e.target.value)}
                                        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 font-medium text-[var(--foreground)]"
                                    >
                                        <option value="CBSE">CBSE</option>
                                        <option value="ICSE">ICSE</option>
                                        <option value="State Board">State Board</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-medium">Class</label>
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 font-medium text-[var(--foreground)]"
                                    >
                                        <option value="9">Class 9</option>
                                        <option value="10">Class 10</option>
                                        <option value="11">Class 11</option>
                                        <option value="12">Class 12</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[var(--muted-foreground)] mb-1 font-medium">Subject</label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 font-medium text-[var(--foreground)]"
                                    >
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Biology">Biology</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Real Miniature Snapshot of 50-Mark Examination Blueprint */}
                    <div className="lg:col-span-7">
                        <div className="paper-surface p-5 sm:p-7 shadow-xs">
                            {/* Academic Paper Header */}
                            <div className="border-b border-[var(--border)] pb-4 mb-4 text-center space-y-1">
                                <div className="text-[10px] font-mono-stamp text-[var(--muted-foreground)] uppercase">
                                    ACADEMIC YEAR 2026-27 · FORMATIVE ASSESSMENT BLUEPRINT
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold font-display text-[var(--foreground)]">
                                    {selectedBoard} Class {selectedGrade} {selectedSubject} — Standard 50-Mark Paper
                                </h3>
                                <div className="flex justify-between items-center text-[11px] font-mono-stamp text-[var(--muted-foreground)] pt-1 max-w-sm mx-auto">
                                    <span>TIME: 2.0 HOURS</span>
                                    <span>TOTAL: 50 MARKS</span>
                                    <span>PASS: 18 MARKS</span>
                                </div>
                            </div>

                            {/* Section A: Objective & MCQs */}
                            {visibleSections >= 1 && (
                                <div className="space-y-2.5 pb-4 border-b border-[var(--border)] animate-settle">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold font-mono-stamp text-[var(--primary)] uppercase">
                                            SECTION A — OBJECTIVE & MULTIPLE CHOICE
                                        </span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-stamp">1 Mark Each</span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-1.5">
                                                <span className="font-semibold text-[var(--primary)]">Q1.</span>
                                                <span className="text-[var(--foreground)]">
                                                    A ray of light traveling from a medium (n = 1.5) strikes air at incidence angle 30°. The angle of refraction is:
                                                </span>
                                            </div>
                                            <span className="mark-badge animate-mark-settle flex-shrink-0">+1.0M</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pl-4 text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                                            <span>(a) 48.6°</span>
                                            <span>(b) 30.0°</span>
                                            <span>(c) 60.0°</span>
                                            <span>(d) 90.0°</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section B: Short Answer & Derivations */}
                            {visibleSections >= 2 && (
                                <div className="space-y-2.5 py-4 border-b border-[var(--border)] animate-settle">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold font-mono-stamp text-[var(--primary)] uppercase">
                                            SECTION B — SHORT ANSWER & DERIVATIONS
                                        </span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono-stamp">3 Marks Each</span>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-1.5">
                                                <span className="font-semibold text-[var(--primary)]">Q2.</span>
                                                <span className="text-[var(--foreground)]">
                                                    State Ohm's Law. Draw a circuit diagram to verify Ohm's law with proper voltmeter polarity. List two conductor resistance factors.
                                                </span>
                                            </div>
                                            <span className="mark-badge animate-mark-settle flex-shrink-0">+3.0M</span>
                                        </div>
                                        <div className="pl-4 pt-1 text-[11px] text-[#2F7D5C] font-mono-stamp">
                                            ✓ Statement (1M) + Labeled Diagram (1M) + Length/Area Factor (1M)
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section C: Case-Based Integrated HOTS */}
                            {visibleSections >= 3 && (
                                <div className="space-y-2.5 pt-4 animate-settle">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold font-mono-stamp text-[var(--primary)] uppercase">
                                            SECTION C — CASE-BASED INTEGRATED ASSESSMENT
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="mark-badge text-[10px]">20% HOTS</span>
                                            <span className="text-[10px] text-[var(--muted-foreground)] font-mono-stamp">4 Marks</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-1.5">
                                                <span className="font-semibold text-[var(--primary)]">Q3.</span>
                                                <span className="text-[var(--foreground)]">
                                                    A concave mirror forms a real inverted image of an object placed 20 cm in front. Linear magnification is -2.
                                                </span>
                                            </div>
                                            <span className="mark-badge animate-mark-settle flex-shrink-0">+4.0M</span>
                                        </div>
                                        <div className="pl-4 space-y-0.5 text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                                            <div>(i) Image distance v = -40 cm [1M]</div>
                                            <div>(ii) Mirror formula: 1/f = 1/v + 1/u =&gt; f = -13.3 cm [2M]</div>
                                            <div>(iii) Nature when moved to 5 cm from pole: Virtual &amp; erect [1M]</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. CURRICULUM INGESTION FLOWCHART (Linear Horizontal 01 to 04) ── */}
            <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
                <div className="max-w-2xl mb-8">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold">Sequential Architecture</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1">
                        Curriculum Ingestion Flowchart
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 font-sans-academic">
                        A deterministic 4-stage pipeline translating board syllabi into classroom-ready materials.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                    {[
                        {
                            step: "01",
                            icon: Database,
                            title: "Syllabus Ingestion",
                            detail: "PDF / DOCX Chapter Upload",
                            desc: "Ingests CBSE / ICSE official textbooks, extracting chapter weightage and designated learning objectives."
                        },
                        {
                            step: "02",
                            icon: Cpu,
                            title: "Pedagogical Reasoning",
                            detail: "Bloom's Taxonomy Calibration",
                            desc: "Calibrates question balance: 30% Recall, 50% Application, 20% Higher-Order Thinking Skills (HOTS)."
                        },
                        {
                            step: "03",
                            icon: Globe,
                            title: "Vernacular Synthesis",
                            detail: "11 Native Indian Languages",
                            desc: "Synthesizes mathematical and scientific terminology directly in native script without translation glitches."
                        },
                        {
                            step: "04",
                            icon: FileText,
                            title: "Formatted Export",
                            detail: "Print-Ready DOCX & Marking Key",
                            desc: "Generates aligned exam sheets with header cards, point-by-point marking rubrics, and LaTeX formulas."
                        }
                    ].map((flow, idx) => {
                        const Icon = flow.icon;
                        return (
                            <div
                                key={idx}
                                className="p-4 sm:p-5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between card-lift"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-xs font-mono-stamp font-bold text-[var(--primary)]">STEP {flow.step}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold font-display text-[var(--foreground)]">
                                        {flow.title}
                                    </h3>
                                    <div className="text-[11px] font-mono-stamp text-[var(--secondary)] font-medium mt-0.5 mb-2">
                                        {flow.detail}
                                    </div>
                                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans-academic">
                                        {flow.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. CONCRETE BEFORE / AFTER SHOWCASE: PAPER SOLVER MODULE ── */}
            <section id="solver-showcase" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
                <div className="max-w-2xl mb-8">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold">Concrete Module Inspection</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1">
                        Paper Solver: Raw Question ➔ Step-by-Step Marking Key
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 font-sans-academic">
                        Teachers grade faster with automated step allocations and error-tolerance guidelines.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Before: Raw Question Prompt */}
                    <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg bg-[var(--card)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2">
                                <span className="text-[11px] font-mono-stamp uppercase font-semibold text-[var(--muted-foreground)]">INPUT (Raw Exam Question)</span>
                                <span className="mark-badge text-[10px]">3 Marks Total</span>
                            </div>
                            <div className="text-xs text-[var(--foreground)] font-sans-academic leading-relaxed space-y-2">
                                <p className="font-semibold text-sm">Question 4 (Class 10 Optics):</p>
                                <p>
                                    "A convex lens of focal length 15 cm forms an image 30 cm from the optical center on the other side. Find the position of the object and calculate the linear magnification produced."
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                            Direct textbook problem ingestion
                        </div>
                    </div>

                    {/* After: Full Step-by-Step Marking Manual with Maroon Badges */}
                    <div className="lg:col-span-7 p-5 sm:p-6 rounded-lg paper-surface shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                            <span className="text-[11px] font-mono-stamp uppercase font-semibold text-[var(--primary)]">OUTPUT (Step-by-Step Marking Manual)</span>
                            <span className="text-xs font-mono-stamp text-[#2F7D5C] font-semibold">Total: 3.0 / 3.0 M</span>
                        </div>

                        <div className="space-y-3 text-xs">
                            {/* Step 1 */}
                            <div className="flex items-start justify-between gap-3 p-2.5 rounded bg-[var(--background)] border border-[var(--border)]">
                                <div className="space-y-0.5">
                                    <div className="font-semibold text-[var(--foreground)]">Step 1: Formula Declaration &amp; Given Sign Convention</div>
                                    <div className="text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                                        Given: f = +15 cm, v = +30 cm. Lens formula: 1/f = 1/v - 1/u
                                    </div>
                                </div>
                                <span className="mark-badge flex-shrink-0 animate-mark-settle">+0.5M</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start justify-between gap-3 p-2.5 rounded bg-[var(--background)] border border-[var(--border)]">
                                <div className="space-y-0.5">
                                    <div className="font-semibold text-[var(--foreground)]">Step 2: Algebraic Substitution &amp; Object Distance u</div>
                                    <div className="text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                                        1/u = 1/30 - 1/15 = -1/30 =&gt; u = -30 cm (30 cm in front of lens)
                                    </div>
                                </div>
                                <span className="mark-badge flex-shrink-0 animate-mark-settle">+1.5M</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start justify-between gap-3 p-2.5 rounded bg-[var(--background)] border border-[var(--border)]">
                                <div className="space-y-0.5">
                                    <div className="font-semibold text-[var(--foreground)]">Step 3: Magnification Calculation &amp; Nature of Image</div>
                                    <div className="text-[11px] text-[var(--muted-foreground)] font-mono-stamp">
                                        m = v/u = (+30)/(-30) = -1.0 (Real and inverted, same size)
                                    </div>
                                </div>
                                <span className="mark-badge flex-shrink-0 animate-mark-settle">+1.0M</span>
                            </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[var(--muted-foreground)] font-sans-academic">
                            <span className="font-semibold text-[#2F7D5C]">Teacher Moderation Note:</span> Credit alternate algebraic steps if sign convention is correctly applied without penalizing unit omission twice.
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. 11-LANGUAGE MATRIX (Native Scripts Prominent & Protected) ── */}
            <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)] notranslate" translate="no">
                <div className="max-w-2xl mb-8 notranslate" translate="no">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold notranslate" translate="no">Vernacular Parity</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1 notranslate" translate="no">
                        Native Synthesis in 11 Indian Languages
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 font-sans-academic notranslate" translate="no">
                        Native scripts are first-class elements — eliminating machine translation distortion for regional board schools.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 notranslate" translate="no">
                    {INDIAN_LANGUAGES.map(lang => {
                        const isCurrent = currentLanguage.code === lang.code;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => setLanguageByCode(lang.code)}
                                className={`p-3.5 rounded-lg border text-left transition-all notranslate card-lift ${
                                    isCurrent
                                        ? 'border-[var(--primary)] border-l-[3px] bg-[var(--card)] shadow-xs'
                                        : 'border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/60'
                                }`}
                                translate="no"
                            >
                                <div className="text-base font-bold text-[var(--foreground)] mb-0.5 notranslate" translate="no">
                                    {lang.nativeName}
                                </div>
                                <div className="text-xs font-medium text-[var(--muted-foreground)] notranslate" translate="no">
                                    {lang.name}
                                </div>
                                <div className="text-[10px] font-mono-stamp text-[var(--primary)] uppercase mt-2 notranslate" translate="no">
                                    {lang.code.toUpperCase()} · {lang.region}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── 6. TRUST & BOARD COMPLIANCE STRIP ── */}
            <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)] bg-[var(--muted)] rounded-lg my-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="space-y-1">
                        <div className="text-xs font-mono-stamp uppercase font-semibold text-[var(--primary)]">
                            Institutional Compliance Standard
                        </div>
                        <h4 className="text-base font-semibold text-[var(--foreground)] font-display">
                            Aligned with CBSE, ICSE, and State Board Curriculum Frameworks
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] font-sans-academic">
                            Adheres to circular specifications, chapter weightage, and standard 50-mark &amp; 80-mark evaluation formats.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="px-5 py-2.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold tracking-wide transition-all shadow-xs flex-shrink-0 card-lift"
                    >
                        Institutional Licensing
                    </button>
                </div>
            </section>

            {/* ── 7. Institutional Footer ── */}
            <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 px-4 sm:px-8 text-xs text-[var(--muted-foreground)] notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-5 h-5 object-contain" />
                        <span className="font-semibold font-display text-[var(--foreground)]">DeepHub AI</span>
                        <span>· Curriculum &amp; Examination Architecture</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span onClick={() => navigate('/terms')} className="hover:text-[var(--foreground)] cursor-pointer">Terms &amp; Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[var(--foreground)] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[var(--foreground)] cursor-pointer">Institutional Pricing</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[var(--primary)] text-[var(--primary)] font-semibold cursor-pointer">Turbo</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} DeepHub AI. Built for Indian Educators.
                    </div>
                </div>
            </footer>
        </div>
    );
}
