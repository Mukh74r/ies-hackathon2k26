import React, { useState } from 'react';
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
    School
} from 'lucide-react';
import BrandLogo from '../assets/brand-logo-main.svg';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const { currentLanguage, setLanguageByCode, theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';
    const [langOpen, setLangOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('10');
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [selectedBoard, setSelectedBoard] = useState('CBSE');
    const [activeTab, setActiveTab] = useState<'paper' | 'lesson' | 'ppt' | 'solution'>('paper');

    const boardBlueprints = {
        paper: {
            title: `${selectedBoard} Class ${selectedGrade} ${selectedSubject} — Standard 50-Mark Examination Blueprint`,
            sections: [
                {
                    heading: "SECTION A — OBJECTIVE & MULTIPLE CHOICE (1 Mark Each)",
                    questions: [
                        {
                            num: "Q1.",
                            text: "A ray of light traveling from a medium of refractive index 1.5 into air strikes the boundary at an angle of incidence 30°. The angle of refraction is:",
                            options: ["(a) 48.6°", "(b) 30.0°", "(c) 60.0°", "(d) 90.0°"],
                            markBadge: "+1.0M",
                            correct: "Key: (a) 48.6° [Formula sin r = n * sin i & exact substitution]"
                        },
                        {
                            num: "Q2.",
                            text: "Which of the following physical quantities remains unchanged when a sound wave travels from air into water?",
                            options: ["(a) Velocity", "(b) Frequency", "(c) Wavelength", "(d) Amplitude"],
                            markBadge: "+1.0M",
                            correct: "Key: (b) Frequency [Wave mechanics fundamental: frequency depends only on the source]"
                        }
                    ]
                },
                {
                    heading: "SECTION B — SHORT ANSWER & DERIVATIONS (3 Marks Each)",
                    questions: [
                        {
                            num: "Q3.",
                            text: "State Ohm's Law. Draw a labeled circuit diagram used to verify Ohm's law in the laboratory. List two factors on which the resistance of a cylindrical conductor depends.",
                            options: [],
                            markBadge: "+3.0M",
                            correct: "Marking Scheme: Statement (1M) + Circuit Diagram with Ammeter/Voltmeter polarity (1M) + Two physical factors (Length/Cross-sectional area) (1M) = 3 Marks"
                        }
                    ]
                },
                {
                    heading: "SECTION C — CASE-BASED INTEGRATED ASSESSMENT (4 Marks · HOTS)",
                    questions: [
                        {
                            num: "Q4.",
                            text: "Read the passage and answer the sub-questions: A concave mirror forms a real and inverted image of an object placed 20 cm in front of it. The linear magnification is -2.",
                            options: [
                                "(i) Determine the image distance v. [1M]",
                                "(ii) Calculate the focal length of the mirror using mirror formula. [2M]",
                                "(iii) State the nature of the image if the object is moved to 5 cm from pole. [1M]"
                            ],
                            markBadge: "+4.0M",
                            hotsBadge: "20% HOTS",
                            correct: "Marking Scheme: (i) v = -40 cm (1M); (ii) 1/f = 1/v + 1/u => f = -13.3 cm (2M); (iii) Virtual & erect (1M)."
                        }
                    ]
                }
            ]
        },
        lesson: {
            title: `45-Minute Structured Lesson Plan: ${selectedSubject} (Class ${selectedGrade})`,
            sections: [
                {
                    heading: "STAGE 1 — ENGAGE & RECALL (00:00 - 00:08)",
                    questions: [
                        {
                            num: "00:00–00:08",
                            text: "Anchor Phenomenon: Demonstrate a simple real-world observation to capture curiosity (e.g. pencil appearing bent in water beaker).",
                            options: [],
                            markBadge: "8 MIN",
                            correct: "Blackboard Cue: Draw boundary line and normal to illustrate phase change across optical interfaces."
                        }
                    ]
                },
                {
                    heading: "STAGE 2 — DERIVATION & GUIDED PRACTICE (00:08 - 00:28)",
                    questions: [
                        {
                            num: "00:08–00:28",
                            text: "Core Mathematical Proof: Step-by-step derivation of Snell's Law and Total Internal Reflection with student participation checks.",
                            options: [],
                            markBadge: "20 MIN",
                            correct: "Check for Understanding: Ask 2 randomly selected students to calculate critical angle for diamond (n=2.42)."
                        }
                    ]
                },
                {
                    heading: "STAGE 3 — FORMATIVE EXIT ASSESSMENT (00:28 - 00:45)",
                    questions: [
                        {
                            num: "00:28–00:45",
                            text: "3-minute exit slip with 2 numerical problems followed by homework worksheet distribution.",
                            options: [],
                            markBadge: "17 MIN",
                            correct: "Worksheet Task: Complete NCERT Exercise Q4 to Q9 with labeled ray diagrams."
                        }
                    ]
                }
            ]
        },
        ppt: {
            title: `12-Slide Classroom Lecture Deck: ${selectedSubject} (Class ${selectedGrade})`,
            sections: [
                {
                    heading: "SLIDE SEQUENCE & LEARNING OUTCOMES",
                    questions: [
                        {
                            num: "Slides 01–03",
                            text: "Title, Learning Objectives (Bloom's Taxonomy Level 1-3), and Prior Knowledge Activation.",
                            options: [],
                            markBadge: "3 SLIDES",
                            correct: "Speaker Note: Emphasize practical applications in optical fiber telecommunications."
                        },
                        {
                            num: "Slides 04–08",
                            text: "Core Principles, Ray Diagrams, Equation Box with Variable Annotations, and Worked Example.",
                            options: [],
                            markBadge: "5 SLIDES",
                            correct: "Visual Layout: Split-screen ray diagram on left, mathematical substitution steps on right."
                        },
                        {
                            num: "Slides 09–12",
                            text: "Classroom Clicker MCQs, Common Pitfalls & Misconceptions, Summary, and Next Class Preview.",
                            options: [],
                            markBadge: "4 SLIDES",
                            correct: "Interactive Pause: 90-second peer discussion for Slide 10 MCQ."
                        }
                    ]
                }
            ]
        },
        solution: {
            title: `Complete Marking Manual & Step-by-Step Solutions: ${selectedSubject}`,
            sections: [
                {
                    heading: "EVALUATION CRITERIA & SCORE ALLOCATION",
                    questions: [
                        {
                            num: "Step 01",
                            text: "Formula identification and SI unit declaration.",
                            options: [],
                            markBadge: "+0.5M",
                            correct: "Credit alternate correct physical formulations without penalty."
                        },
                        {
                            num: "Step 02",
                            text: "Algebraic rearrangement and intermediate numerical values.",
                            options: [],
                            markBadge: "+1.5M",
                            correct: "Deduct 0.5 Mark only once for missing or incorrect physical units."
                        },
                        {
                            num: "Step 03",
                            text: "Final boxed numerical value with proper sign convention.",
                            options: [],
                            markBadge: "+1.0M",
                            correct: "Highlight common student sign convention errors for teacher moderation."
                        }
                    ]
                }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans-academic selection:bg-[#2A3F8F]/15 transition-colors">
            
            {/* ── Top Header Navigation ── */}
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
                            <span>Teacher Studio</span>
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

            {/* ── Hero Section (Authoritative Institutional Statement) ── */}
            <section className="pt-14 pb-14 px-4 sm:px-8 max-w-6xl mx-auto animate-settle">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--primary)] mb-5 shadow-2xs">
                        <ShieldCheck size={14} className="text-[var(--primary)]" />
                        <span>INSTITUTIONAL COMPLIANCE · CBSE, ICSE & STATE BOARDS</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-semibold font-display tracking-tight text-[var(--foreground)] leading-[1.18] mb-5">
                        Curriculum & Examination Architecture for Indian Institutions
                    </h1>

                    <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-7 font-sans-academic">
                        Formulate board-compliant 50-mark examination papers, structured 45-minute lesson pedagogies, slide decks, and step-by-step marking rubrics across 11 Indian Regional Languages.
                    </p>

                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-9">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-6 py-3 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 card-lift"
                        >
                            <span>Open Teacher Studio</span>
                            <ArrowRight size={14} />
                        </button>
                        <a
                            href="#blueprint-workbench"
                            className="px-5 py-3 rounded-md bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all card-lift"
                        >
                            <Sliders size={14} className="text-[var(--primary)]" />
                            <span>Interactive Blueprint</span>
                        </a>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-5 py-3 rounded-md bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Institutional Licensing</span>
                        </button>
                    </div>

                    {/* Institutional Metric Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--border)]">
                        {[
                            { label: "Standard 50 & 80 Marks", value: "CBSE / ICSE Calibrated" },
                            { label: "Bloom's Taxonomy", value: "100% Pedagogy Mapped" },
                            { label: "11 Regional Languages", value: "Native Vernacular Synthesis" },
                            { label: "Full Marking Scheme", value: "Step-by-Step Score Rubrics" }
                        ].map((stat, i) => (
                            <div key={i} className="p-3 rounded-md bg-[var(--card)] border border-[var(--card-border)]">
                                <div className="text-[11px] font-mono-stamp text-[var(--primary)] uppercase font-semibold">{stat.label}</div>
                                <div className="text-xs font-medium text-[var(--foreground)] mt-0.5">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Curriculum Ingestion Flowchart (Linear 01-04 Sequence) ── */}
            <section className="py-14 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[var(--border)]">
                <div className="max-w-2xl mb-8">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold">Sequential Architecture</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1">
                        Curriculum Ingestion to Board-Grade Synthesis
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 font-sans-academic">
                        A rigorous 4-step pedagogical pipeline calibrated to Indian educational standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                    {[
                        {
                            step: "01",
                            icon: Database,
                            title: "Curriculum Ingestion",
                            desc: "Ingests CBSE, ICSE, and State Board frameworks with exact chapter weightage and mark allocations."
                        },
                        {
                            step: "02",
                            icon: Cpu,
                            title: "Cognitive Pedagogical Reasoning",
                            desc: "Distributes difficulty: 30% Recall, 50% Application, 20% Higher-Order Thinking Skills (HOTS)."
                        },
                        {
                            step: "03",
                            icon: Globe,
                            title: "Vernacular Multi-Dialect Synthesis",
                            desc: "Translates terminology directly into 11 regional Indian languages without clumsy translation glitches."
                        },
                        {
                            step: "04",
                            icon: FileText,
                            title: "Publish-Ready Export",
                            desc: "Generates formatted question paper sheets, LaTeX mathematical formulas, and complete scoring manuals."
                        }
                    ].map((pipeline, idx) => {
                        const Icon = pipeline.icon;
                        return (
                            <div
                                key={idx}
                                className="p-5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between card-lift"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-xs font-mono-stamp font-bold text-[var(--primary)]">STEP {pipeline.step}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold font-display text-[var(--foreground)] mb-1.5">
                                        {pipeline.title}
                                    </h3>
                                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans-academic">
                                        {pipeline.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Interactive 50-Mark Examination Blueprint Workbench ── */}
            <section id="blueprint-workbench" className="py-14 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[var(--border)]">
                <div className="max-w-2xl mb-8">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold">Interactive Workbench</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1">
                        Formative Examination Blueprint Simulator
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 font-sans-academic">
                        Configure board standards, subject specializations, and difficulty distributions in real time.
                    </p>
                </div>

                <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-xs">
                    {/* Control Panel Toolbar */}
                    <div className="p-3.5 bg-[var(--muted)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Board Selector */}
                            <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-md text-xs font-medium">
                                {['CBSE', 'ICSE', 'State Board'].map(b => (
                                    <button
                                        key={b}
                                        onClick={() => setSelectedBoard(b)}
                                        className={`px-2.5 py-1 rounded-sm transition-colors ${
                                            selectedBoard === b
                                                ? 'bg-[var(--primary)] text-white font-semibold'
                                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>

                            {/* Class Selector */}
                            <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-md text-xs font-medium">
                                {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setSelectedGrade(g.replace('Class ', ''))}
                                        className={`px-2 py-1 rounded-sm transition-colors ${
                                            selectedGrade === g.replace('Class ', '')
                                                ? 'bg-[var(--primary)] text-white font-semibold'
                                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>

                            {/* Subject Selector */}
                            <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-md text-xs font-medium">
                                {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSubject(s)}
                                        className={`px-2.5 py-1 rounded-sm transition-colors ${
                                            selectedSubject === s
                                                ? 'bg-[var(--primary)] text-white font-semibold'
                                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Tabs */}
                        <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-md text-xs font-medium">
                            {[
                                { id: 'paper', label: '50M Paper' },
                                { id: 'lesson', label: 'Lesson Plan' },
                                { id: 'ppt', label: 'Slide Deck' },
                                { id: 'solution', label: 'Marking Key' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-1 rounded-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[var(--primary)] text-white font-semibold'
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paper Document Preview Sheet */}
                    <div className="p-6 sm:p-8 bg-[var(--background)]">
                        <div className="max-w-4xl mx-auto paper-surface p-6 sm:p-10">
                            {/* Academic Paper Header */}
                            <div className="text-center pb-6 mb-6 border-b border-[var(--border)] space-y-1.5">
                                <div className="text-xs font-mono-stamp text-[var(--muted-foreground)] uppercase">
                                    ACADEMIC YEAR 2026-2027 · FORMATIVE ASSESSMENT
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold font-display text-[var(--foreground)] tracking-tight">
                                    {boardBlueprints[activeTab].title}
                                </h3>
                                <div className="flex justify-between items-center text-xs font-mono-stamp text-[var(--muted-foreground)] pt-2 max-w-md mx-auto">
                                    <span>TIME: 2.0 HOURS</span>
                                    <span>TOTAL MARKS: 50</span>
                                    <span>PASS MARKS: 18</span>
                                </div>
                            </div>

                            {/* Section Loop */}
                            <div className="space-y-6">
                                {boardBlueprints[activeTab].sections.map((sec, sIdx) => (
                                    <div key={sIdx} className="space-y-3.5">
                                        <div className="text-xs font-semibold font-mono-stamp text-[var(--primary)] uppercase tracking-wider border-b border-[var(--border)] pb-1">
                                            {sec.heading}
                                        </div>
                                        <div className="space-y-4">
                                            {sec.questions.map((q, qIdx) => (
                                                <div key={qIdx} className="space-y-2 text-xs sm:text-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-2">
                                                            <span className="font-semibold text-[var(--primary)] font-mono-stamp">{q.num}</span>
                                                            <span className="text-[var(--foreground)] font-sans-academic leading-relaxed">{q.text}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            {q.hotsBadge && (
                                                                <span className="mark-badge animate-mark-settle">
                                                                    {q.hotsBadge}
                                                                </span>
                                                            )}
                                                            <span className="mark-badge animate-mark-settle">
                                                                {q.markBadge}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {q.options.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6 pt-1 text-xs text-[var(--muted-foreground)]">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div key={oIdx} className="font-mono-stamp">{opt}</div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.correct && (
                                                        <div className="mt-1 ml-6 p-2.5 rounded-md bg-[var(--muted)] border border-[var(--border)] text-[11px] text-[var(--foreground)] leading-relaxed font-sans-academic">
                                                            <span className="font-semibold text-[#2F7D5C]">Evaluation Standard:</span> {q.correct}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Footer Note */}
                            <div className="mt-8 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                                <span>Verified against CBSE Circular & Curriculum Framework.</span>
                                <button
                                    onClick={() => navigate('/turbo')}
                                    className="px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-colors shadow-2xs card-lift"
                                >
                                    <span>Customize in Teacher Studio</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Purpose-Built Daily Teaching Modules ── */}
            <section className="py-14 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[var(--border)]">
                <div className="max-w-2xl mb-10">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold">Institutional Modules</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1">
                        Purpose-Built Modules for Daily Teaching Operations
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            num: "01",
                            icon: FileText,
                            title: "Question Paper Blueprint Architecture",
                            desc: "Formulate 50 and 80-mark papers with calibrated difficulty distribution (30% Easy, 50% Medium, 20% Higher-Order Thinking Skills). Generates Section A (MCQs), Section B (Short Answer), Section C (Case Studies), and full marking schemes.",
                            badge: "CBSE / ICSE Compliant"
                        },
                        {
                            num: "02",
                            icon: Brain,
                            title: "45-Minute Lesson Pedagogy Engine",
                            desc: "Construct stage-wise lesson progressions mapped to Bloom's Taxonomy. Generates minute-by-minute timeline schedules, real-world hooks, interactive board derivations, formative assessments, and structured homework worksheets.",
                            badge: "Pedagogy Standard"
                        },
                        {
                            num: "03",
                            icon: Presentation,
                            title: "Classroom Presentation Slide Creator",
                            desc: "Produce 10 to 15 slide lecture presentations complete with learning objectives, key principles, diagram placeholders, step-by-step formulas, and classroom speaker notes for educators.",
                            badge: "Smartboard Ready"
                        },
                        {
                            num: "04",
                            icon: ClipboardList,
                            title: "Step-by-Step Marking & Solution Keys",
                            desc: "Generate complete mathematical and analytical solution manuals for all question papers. Includes step-by-step score allocation, unit checks, and alternative method credits.",
                            badge: "Exam Evaluation"
                        }
                    ].map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                onClick={() => navigate('/turbo')}
                                className="bg-[var(--card)] border border-[var(--card-border)] p-6 rounded-lg transition-all cursor-pointer group flex flex-col justify-between shadow-xs card-lift"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3.5">
                                        <div className="p-2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-[11px] font-mono-stamp text-[var(--secondary)] border border-[var(--secondary)]/25 bg-[var(--secondary)]/8 px-2 py-0.5 rounded">
                                            {card.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold font-display text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors mb-2">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans-academic">
                                        {card.desc}
                                    </p>
                                </div>
                                <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
                                    <span>Open Module</span>
                                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 11 Regional Indian Languages Matrix ── */}
            <section className="py-14 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[var(--border)] notranslate" translate="no">
                <div className="max-w-2xl mb-8 notranslate" translate="no">
                    <span className="text-xs font-mono-stamp text-[var(--primary)] uppercase tracking-wider font-semibold notranslate" translate="no">Regional Vernacular Matrix</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[var(--foreground)] mt-1 notranslate" translate="no">
                        Native Synthesis in 11 Indian Languages
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 notranslate" translate="no">
                        DeepHub AI structures question papers, summaries, and lesson plans directly in regional vernacular without robotic translation artifacts.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 notranslate" translate="no">
                    {INDIAN_LANGUAGES.map(lang => (
                        <div
                            key={lang.code}
                            onClick={() => setLanguageByCode(lang.code)}
                            className={`bg-[var(--card)] border p-3 rounded-md flex flex-col justify-between shadow-2xs notranslate cursor-pointer transition-all card-lift ${
                                currentLanguage.code === lang.code
                                    ? 'border-[var(--primary)] border-l-4 bg-[var(--card)]'
                                    : 'border-[var(--card-border)] hover:border-[var(--primary)]/60'
                            }`}
                            translate="no"
                        >
                            <div className="flex items-center justify-between mb-1.5 notranslate" translate="no">
                                <span className="text-xs font-bold font-mono-stamp text-[var(--primary)] notranslate" translate="no">{lang.code.toUpperCase()}</span>
                                <span className="text-[10px] text-[var(--muted-foreground)] notranslate" translate="no">{lang.name}</span>
                            </div>
                            <div className="text-sm font-semibold text-[var(--foreground)] notranslate" translate="no">
                                {lang.nativeName}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate notranslate" translate="no">
                                {lang.region}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Institutional Footer ── */}
            <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 px-4 sm:px-8 text-xs text-[var(--muted-foreground)] notranslate" translate="no">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-5 h-5 object-contain" />
                        <span className="font-semibold font-display text-[var(--foreground)]">DeepHub AI</span>
                        <span>· Curriculum & Examination Architecture</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span onClick={() => navigate('/terms')} className="hover:text-[var(--foreground)] cursor-pointer">Terms & Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[var(--foreground)] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[var(--foreground)] cursor-pointer">Institutional Pricing</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[var(--primary)] text-[var(--primary)] font-semibold cursor-pointer">Teacher Studio</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} DeepHub AI. Built for Indian Educators.
                    </div>
                </div>
            </footer>
        </div>
    );
}
