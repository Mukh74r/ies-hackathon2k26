import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Check,
    ChevronDown,
    ChevronRight,
    Sliders,
    Sun,
    Moon,
    FileText,
    Brain,
    Presentation,
    ClipboardList,
    Shuffle,
    Layers,
    Download,
    Printer,
    FileSpreadsheet,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Upload,
    ScanText,
    Target,
    Workflow,
    FileOutput,
    Cpu,
    BookOpen,
    BarChart3
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

    // Signature Hero Simulation: Runs strictly ONCE on page load (2.0s duration, never loops)
    const [animStage, setAnimStage] = useState<number>(0);
    const [pipelineActiveStep, setPipelineActiveStep] = useState<number>(4);

    useEffect(() => {
        // Section A (250ms) -> Section B (650ms) -> Section C (1100ms) -> Difficulty (1550ms) -> Coverage/Complete (1950ms)
        const t1 = setTimeout(() => setAnimStage(1), 250);
        const t2 = setTimeout(() => setAnimStage(2), 650);
        const t3 = setTimeout(() => setAnimStage(3), 1100);
        const t4 = setTimeout(() => setAnimStage(4), 1550);
        const t5 = setTimeout(() => setAnimStage(5), 1950);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, [selectedBoard, selectedGrade, selectedSubject]);

    const MULTI_OUTPUTS = [
        {
            title: "Question Paper (50M & 80M)",
            desc: "Standardized Section A, B, C structure formatted with LaTeX equations and school headers.",
            icon: FileText,
            badge: "Exam Ready"
        },
        {
            title: "45-Minute Lesson Plan",
            desc: "Minute-by-minute timeline with real-world engagement hooks and formative exit assessments.",
            icon: Brain,
            badge: "Pedagogy Mapped"
        },
        {
            title: "Classroom Slide Deck (PPT)",
            desc: "12-slide lecture presentations with learning objectives, diagrams, and speaker notes.",
            icon: Presentation,
            badge: "Smartboard"
        },
        {
            title: "Step-by-Step Marking Scheme",
            desc: "Evaluation manuals outlining exact score allocations and moderation guidelines per step.",
            icon: ClipboardList,
            badge: "Evaluation"
        },
        {
            title: "Shuffled Quiz Sets (A, B, C, D)",
            desc: "Permutated question and option banks with synchronized answer keys for secure testing.",
            icon: Shuffle,
            badge: "Anti-Copy"
        },
        {
            title: "Evaluation Answer Key",
            desc: "Complete numerical derivation proofs with SI unit checks and boxed final values.",
            icon: CheckCircle2,
            badge: "Solution Key"
        }
    ];

    const PIPELINE_STAGES = [
        { id: 1, title: 'Upload Curriculum', desc: 'NCERT & State Board PDFs', icon: Upload },
        { id: 2, title: 'OCR Extraction', desc: 'LaTeX, formulas & diagrams', icon: ScanText },
        { id: 3, title: 'Learning Outcomes', desc: 'Bloom\'s Taxonomy mapping', icon: Target },
        { id: 4, title: 'Blueprint Generation', desc: '50 & 80-mark structure grid', icon: Sliders },
        { id: 5, title: 'Question Paper', desc: 'Sec A, B, C formatted layout', icon: FileText },
        { id: 6, title: 'Export PDF / DOCX', desc: 'Print-ready evaluation sheets', icon: FileOutput },
    ];

    const INDIAN_LANGUAGE_CARDS = [
        { native: 'हिंदी', latin: 'Hindi', code: 'hi' },
        { native: 'മലയാളം', latin: 'Malayalam', code: 'ml' },
        { native: 'தமிழ்', latin: 'Tamil', code: 'ta' },
        { native: 'తెలుగు', latin: 'Telugu', code: 'te' },
        { native: 'ಕನ್ನಡ', latin: 'Kannada', code: 'kn' },
        { native: 'বাংলা', latin: 'Bengali', code: 'bn' },
        { native: 'ગુજરાતી', latin: 'Gujarati', code: 'gu' },
        { native: 'मराठी', latin: 'Marathi', code: 'mr' },
        { native: 'ਪੰਜਾਬੀ', latin: 'Punjabi', code: 'pa' },
        { native: 'اردو', latin: 'Urdu', code: 'ur' },
        { native: 'English', latin: 'English', code: 'en' },
    ];

    const SOLVER_CRITERIA_STEPS = [
        {
            stage: 'Introduction & Immediate Trigger',
            content: 'Introduction mentions Enfield rifle cartridge issue and underlying political discontent across princely states.',
            mark: '+0.5M'
        },
        {
            stage: 'Political Causes',
            content: 'Doctrine of Lapse under Lord Dalhousie, annexation of Awadh (1856), and termination of royal titles & pensions.',
            mark: '+1.0M'
        },
        {
            stage: 'Economic Causes',
            content: 'High land revenue assessments, permanent settlement ruin, and collapse of traditional artisan & textile manufacturing.',
            mark: '+1.0M'
        },
        {
            stage: 'Military Causes',
            content: 'General Service Enlistment Act (compulsory overseas service) and severe salary disparity between Indian and British sepoys.',
            mark: '+1.0M'
        },
        {
            stage: 'Socio-Religious Causes',
            content: 'Religious Disabilities Act, interference in customary laws (Lex Loci Act), and widespread fear of conversion activities.',
            mark: '+1.0M'
        },
        {
            stage: 'Conclusion & Queen\'s Proclamation',
            content: 'Government of India Act 1858 ends East India Company rule and transfers governance to the British Crown.',
            mark: '+0.5M'
        }
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#111827] font-sans-academic selection:bg-[#2A3F8F]/15 transition-colors">
            
            {/* ── TOP HEADER / NAVBAR ── */}
            <header className="border-b border-[#E7EAF0] bg-[#FFFFFF] px-4 sm:px-8 py-3.5 sticky top-0 z-50 shadow-xs notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="font-display font-bold text-base text-[#111827] tracking-tight flex items-center gap-1.5">
                                <span>DeepHub AI</span>
                                <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[#2A3F8F]/10 text-[#2A3F8F] border border-[#2A3F8F]/20 font-semibold uppercase">
                                    V4.2
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links Center */}
                    <nav className="hidden md:flex items-center gap-1">
                        <button onClick={() => navigate('/turbo')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors">
                            Turbo Workspace
                        </button>
                        <button onClick={() => navigate('/virtualbrain')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors">
                            VirtualBrain
                        </button>
                        <button onClick={() => navigate('/circuitbrain')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors">
                            CircuitBrain
                        </button>
                        <button onClick={() => navigate('/latest')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors">
                            Latest
                        </button>
                        <button onClick={() => navigate('/pricing')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors">
                            Pricing
                        </button>
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2.5">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E7EAF0] bg-[#FFFFFF] text-xs font-medium text-[#111827] hover:border-[#2A3F8F] transition-all card-lift"
                            title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                        >
                            {isLight ? (
                                <>
                                    <Sun size={13} className="text-[#8C2D33]" />
                                    <span className="hidden sm:inline text-[11px] text-[#6B7280]">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={13} className="text-[#6E85D6]" />
                                    <span className="hidden sm:inline text-[11px] text-[#6B7280]">Dark</span>
                                </>
                            )}
                        </button>

                        {/* Regional Language Switcher */}
                        <div className="relative notranslate" translate="no">
                            <button
                                onClick={() => setLangOpen(prev => !prev)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E7EAF0] bg-[#FFFFFF] text-xs font-semibold text-[#111827] hover:border-[#2A3F8F] transition-all notranslate card-lift"
                                translate="no"
                            >
                                <span className="text-[11px] text-[#2A3F8F] font-bold notranslate">{currentLanguage.code.toUpperCase()}</span>
                                <ChevronDown size={11} className={`text-[#6B7280] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {langOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-64 p-2 bg-[#FFFFFF] border border-[#E7EAF0] shadow-lg rounded-xl grid grid-cols-2 gap-1 z-50 notranslate animate-settle" translate="no">
                                    <div className="col-span-2 px-2 py-1 text-[10px] uppercase font-mono-stamp text-[#6B7280] border-b border-[#E7EAF0] mb-1">
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
                                                    ? 'bg-[#2A3F8F]/10 text-[#2A3F8F] font-semibold border border-[#2A3F8F]/25'
                                                    : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
                                            }`}
                                            translate="no"
                                        >
                                            <div className="flex flex-col notranslate">
                                                <span className="font-mono-stamp text-[11px] uppercase notranslate">{lang.code}</span>
                                                <span className="text-[10px] text-[#6B7280] notranslate">{lang.nativeName}</span>
                                            </div>
                                            {currentLanguage.code === lang.code && <Check size={12} className="text-[#2A3F8F]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Primary Button */}
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-4 py-1.5 rounded-md bg-[#2A3F8F] hover:bg-[#223377] text-white text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-98"
                        >
                            Generate First Paper
                        </button>
                    </div>
                </div>
            </header>

            {/* ── 1. HERO SECTION (55/45 Split Layout · Real Software Demonstration) ── */}
            <section className="pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* LEFT COLUMN (55%): Core Proposition */}
                    <div className="lg:col-span-6 space-y-6 pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E7EAF0] text-xs font-semibold text-[#2A3F8F]">
                            <ShieldCheck size={14} className="text-[#2A3F8F] flex-shrink-0" />
                            <span>INSTITUTIONAL CURRICULUM ARCHITECTURE</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold font-display tracking-tight text-[#111827] leading-[1.16]">
                            From Curriculum to Classroom — Everything in One Platform.
                        </h1>

                        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-sans-academic max-w-xl">
                            Generate examination blueprints, question papers, marking schemes, lesson plans and assessment material directly from your curriculum while maintaining board alignment.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-6 py-3 rounded-lg bg-[#2A3F8F] hover:bg-[#223377] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                            >
                                <span>Generate First Paper</span>
                                <ArrowRight size={14} />
                            </button>
                            <a
                                href="#blueprint-preview"
                                className="px-5 py-3 rounded-lg bg-[#FFFFFF] border border-[#E7EAF0] hover:border-[#2A3F8F] text-[#111827] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                                <span>View Sample Blueprint</span>
                            </a>
                        </div>

                        {/* Trust Bullets */}
                        <div className="pt-4 border-t border-[#E7EAF0] space-y-2 text-xs text-[#6B7280] font-medium font-sans-academic">
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-[#2F7D5C] flex-shrink-0" />
                                <span>CBSE / ICSE / State Board Alignment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-[#2F7D5C] flex-shrink-0" />
                                <span>11 Indian Languages</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={14} className="text-[#2F7D5C] flex-shrink-0" />
                                <span>Curriculum → Blueprint → Paper</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (45%): Live Examination Blueprint Preview */}
                    <div id="blueprint-preview" className="lg:col-span-6">
                        <div className="rounded-[18px] bg-[#FFFFFF] border border-[#E7EAF0] p-5 sm:p-6 shadow-sm space-y-4">
                            
                            {/* Window Header */}
                            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E7EAF0]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E7EAF0]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E7EAF0]" />
                                    <span className="text-xs font-bold font-display text-[#111827] ml-2">
                                        50 Mark Examination Blueprint
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono-stamp text-[#6B7280] uppercase px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E7EAF0]">
                                    CBSE Class 10 Physics
                                </span>
                            </div>

                            {/* Section A: 10 x 1M */}
                            <div className={`p-3 rounded-lg border border-[#E7EAF0] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">Section A (10 × 1M Objective &amp; MCQs)</span>
                                    <span className="mark-badge text-[10px]">+1.0M</span>
                                </div>
                                <p className="text-[11px] text-[#6B7280] font-sans-academic leading-relaxed">
                                    Q1. Refraction index n = 1.5, angle of incidence i = 30°. Calculate angle of refraction r in air.
                                </p>
                            </div>

                            {/* Section B: 8 x 2M / 3M */}
                            <div className={`p-3 rounded-lg border border-[#E7EAF0] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">Section B (8 × 3M Short Answer &amp; Derivations)</span>
                                    <span className="mark-badge text-[10px]">+3.0M</span>
                                </div>
                                <p className="text-[11px] text-[#6B7280] font-sans-academic leading-relaxed">
                                    Q2. State Ohm's Law and derive V = IR. List 2 physical parameters determining electrical resistivity.
                                </p>
                            </div>

                            {/* Section C: 4 x 5M */}
                            <div className={`p-3 rounded-lg border border-[#E7EAF0] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">Section C (4 × 5M Case-Based Assessment)</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="mark-badge text-[10px]">20% HOTS</span>
                                        <span className="mark-badge text-[10px]">+4.0M</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#6B7280] font-sans-academic leading-relaxed">
                                    Q3. Concave mirror (f = -15 cm) forms inverted image at 30 cm. Find object location u and magnification.
                                </p>
                            </div>

                            {/* Analytical Breakdowns (Difficulty Distribution & Chapter Coverage) */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                
                                {/* Difficulty Distribution */}
                                <div className="p-3 rounded-lg border border-[#E7EAF0] bg-[#FFFFFF] space-y-2">
                                    <div className="text-[10px] font-mono-stamp uppercase text-[#6B7280] font-semibold">
                                        Difficulty Distribution
                                    </div>
                                    <div className="space-y-1.5 text-[10px] font-mono-stamp">
                                        <div className="flex justify-between"><span>Easy (Recall)</span><span className="font-semibold text-[#111827]">30%</span></div>
                                        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#2F7D5C] transition-all duration-500" style={{ width: animStage >= 4 ? '30%' : '0%' }} />
                                        </div>
                                        <div className="flex justify-between"><span>Medium (Apply)</span><span className="font-semibold text-[#111827]">50%</span></div>
                                        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#2A3F8F] transition-all duration-500" style={{ width: animStage >= 4 ? '50%' : '0%' }} />
                                        </div>
                                        <div className="flex justify-between"><span>HOTS (Analysis)</span><span className="font-semibold text-[#8C2D33]">20%</span></div>
                                        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#8C2D33] transition-all duration-500" style={{ width: animStage >= 4 ? '20%' : '0%' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Chapter Coverage & Status */}
                                <div className="p-3 rounded-lg border border-[#E7EAF0] bg-[#FFFFFF] space-y-2">
                                    <div className="text-[10px] font-mono-stamp uppercase text-[#6B7280] font-semibold">
                                        Chapter Coverage
                                    </div>
                                    <div className="space-y-1 text-[11px] text-[#6B7280]">
                                        <div className="flex items-center justify-between">
                                            <span>Light &amp; Optics</span>
                                            <span className="font-mono-stamp text-[10px] text-[#2F7D5C]">18M (36%)</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Electricity</span>
                                            <span className="font-mono-stamp text-[10px] text-[#2F7D5C]">16M (32%)</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Magnetic Effects</span>
                                            <span className="font-mono-stamp text-[10px] text-[#2F7D5C]">16M (32%)</span>
                                        </div>
                                    </div>

                                    {/* Generation Status Indicator */}
                                    <div className="pt-2 border-t border-[#E7EAF0] flex items-center justify-between text-[10px] font-mono-stamp">
                                        <span className="text-[#6B7280]">Status:</span>
                                        <span className={`inline-flex items-center gap-1 font-semibold ${animStage >= 5 ? 'text-[#2F7D5C]' : 'text-[#8C2D33]'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${animStage >= 5 ? 'bg-[#2F7D5C]' : 'bg-[#8C2D33]'}`} />
                                            {animStage >= 5 ? 'Blueprint Complete (50M)' : 'Synthesizing Blueprint...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. ONE CURRICULUM ➔ MULTIPLE OUTPUTS ── */}
            <section className="py-20 px-4 sm:px-8 bg-[#F0F3FA] border-y border-[#E7EAF0]">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="max-w-2xl">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Institutional Workflow</span>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] mt-1">
                            One Curriculum Framework ➔ Six Classroom Ready Outputs
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-sans-academic">
                            A single syllabus ingestion simultaneously structures papers, lesson timelines, presentation decks, and marking schemes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {MULTI_OUTPUTS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => navigate('/turbo')}
                                    className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E7EAF0] hover:border-[#2A3F8F] transition-all cursor-pointer card-lift shadow-2xs flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 rounded-md bg-[#2A3F8F]/10 text-[#2A3F8F]">
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-mono-stamp text-[#8C2D33] border border-[#8C2D33]/20 bg-[#8C2D33]/8 px-2 py-0.5 rounded-md">
                                                {item.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-[#111827] font-display mb-1.5">{item.title}</h3>
                                        <p className="text-xs text-[#6B7280] leading-relaxed font-sans-academic">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-xs font-semibold text-[#2A3F8F]">
                                        <span>Open Tool</span>
                                        <ArrowRight size={13} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 3. PAPER SOLVER SHOWCASE (Transformation Panel: Before / After) ── */}
            <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="max-w-xl mb-10">
                    <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Marking Scheme Automation</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] mt-1">
                        Paper Solver Transformation Panel
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-sans-academic">
                        Converts raw textbook questions into step-by-step scoring manuals with discrete mark allocations.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT: Original Question */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F7F8FA] border border-[#E7EAF0] flex flex-col justify-between shadow-2xs">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-2.5">
                                <span className="text-[10px] font-mono-stamp uppercase text-[#6B7280] font-semibold">INPUT: ORIGINAL QUESTION</span>
                                <span className="mark-badge text-[10px]">5 Marks</span>
                            </div>
                            <div className="space-y-2 text-xs text-[#111827] font-sans-academic leading-relaxed">
                                <p className="font-bold text-sm">Class 10 History / Social Science:</p>
                                <p className="text-[#6B7280] text-xs">
                                    "Explain the causes of the Revolt of 1857."
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] font-mono-stamp text-[#6B7280]">
                            <span>CBSE Social Science Section D</span>
                            <span>Standard 5M Rubric</span>
                        </div>
                    </div>

                    {/* RIGHT: Generated Evaluation Guide with Maroon Mark Badges */}
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E7EAF0] shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-2.5">
                            <span className="text-[10px] font-mono-stamp uppercase text-[#2A3F8F] font-semibold">OUTPUT: GENERATED EVALUATION GUIDE</span>
                            <span className="text-xs font-mono-stamp font-semibold text-[#2F7D5C]">Total: 5.0 / 5.0 M</span>
                        </div>

                        <div className="space-y-2 text-xs">
                            {SOLVER_CRITERIA_STEPS.map((step, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg border border-[#E7EAF0] bg-[#FFFFFF] hover:border-[#2A3F8F]/40 transition-colors flex items-start justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="font-semibold text-[#111827] font-display">{step.stage}</div>
                                        <div className="text-[11px] text-[#6B7280] font-sans-academic leading-relaxed">{step.content}</div>
                                    </div>
                                    <span className="mark-badge flex-shrink-0 animate-mark-settle">{step.mark}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. CURRICULUM PROCESSING WORKFLOW ── */}
            <section className="py-20 px-4 sm:px-8 bg-[#F7F8FA] border-y border-[#E7EAF0]">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="max-w-xl">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Production Pipeline</span>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] mt-1">
                            Curriculum Processing Workflow
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-sans-academic">
                            A linear production pipeline translating official syllabi into classroom examination materials.
                        </p>
                    </div>

                    {/* Horizontal Step Nodes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
                        {PIPELINE_STAGES.map((step) => {
                            const Icon = step.icon;
                            const isActive = pipelineActiveStep === step.id;
                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setPipelineActiveStep(step.id)}
                                    className={`p-4 rounded-xl border bg-[#FFFFFF] transition-all cursor-pointer card-lift ${
                                        isActive
                                            ? 'border-[#2A3F8F] ring-1 ring-[#2A3F8F] shadow-xs'
                                            : 'border-[#E7EAF0] hover:border-[#2A3F8F]/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-md ${isActive ? 'bg-[#2A3F8F] text-white' : 'bg-[#F7F8FA] text-[#6B7280]'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-mono-stamp text-[#6B7280]">0{step.id}</span>
                                    </div>
                                    <div className="text-xs font-bold text-[#111827] font-display mb-0.5">{step.title}</div>
                                    <div className="text-[11px] text-[#6B7280] font-sans-academic">{step.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 5. 11 INDIAN LANGUAGE SUPPORT ── */}
            <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto notranslate" translate="no">
                <div className="max-w-xl mb-8 notranslate" translate="no">
                    <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold notranslate" translate="no">Vernacular Parity</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] mt-1 notranslate" translate="no">
                        Native Synthesis in 11 Indian Languages
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-sans-academic notranslate" translate="no">
                        Native scripts are prominent first-class typographic elements, eliminating translation artifacts.
                    </p>
                </div>

                {/* Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 notranslate" translate="no">
                    {INDIAN_LANGUAGE_CARDS.map((chip) => {
                        const isCurrent = currentLanguage.code === chip.code;
                        return (
                            <div
                                key={chip.code}
                                onClick={() => setLanguageByCode(chip.code)}
                                className={`p-4 rounded-xl border bg-[#FFFFFF] transition-all cursor-pointer card-lift notranslate ${
                                    isCurrent
                                        ? 'border-[#2A3F8F] ring-1 ring-[#2A3F8F] shadow-xs'
                                        : 'border-[#E7EAF0] hover:border-[#2A3F8F]'
                                }`}
                                translate="no"
                            >
                                <div className="text-lg font-bold text-[#111827] notranslate" translate="no">{chip.native}</div>
                                <div className="text-xs text-[#6B7280] font-medium mt-0.5 notranslate" translate="no">{chip.latin}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 6. VIRTUALBRAIN & CIRCUITBRAIN SHOWCASE ── */}
            <section className="py-20 px-4 sm:px-8 bg-[#F0F3FA] border-y border-[#E7EAF0]">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="max-w-xl">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Interactive Labs</span>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#111827] mt-1">
                            VirtualBrain &amp; CircuitBrain Modules
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 font-sans-academic">
                            Interactive 3D physical models, neural curriculum mapping, and real-time electronic circuit simulations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VirtualBrain Card */}
                        <div
                            onClick={() => navigate('/virtualbrain')}
                            className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E7EAF0] hover:border-[#2A3F8F] transition-all cursor-pointer card-lift shadow-2xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono-stamp text-[#2A3F8F] uppercase font-semibold">COGNITIVE ENGINE</span>
                                    <span className="mark-badge text-[10px]">3D Simulation</span>
                                </div>
                                <h3 className="text-base font-bold text-[#111827] font-display mb-1.5">VirtualBrain Curriculum Explorer</h3>
                                <p className="text-xs text-[#6B7280] leading-relaxed font-sans-academic">
                                    Visualize multi-chapter physics and chemistry derivations as connected cognitive graphs with 3D kinematic models.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-xs font-semibold text-[#2A3F8F]">
                                <span>Launch VirtualBrain</span>
                                <ArrowRight size={13} />
                            </div>
                        </div>

                        {/* CircuitBrain Card */}
                        <div
                            onClick={() => navigate('/circuitbrain')}
                            className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E7EAF0] hover:border-[#2A3F8F] transition-all cursor-pointer card-lift shadow-2xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono-stamp text-[#2A3F8F] uppercase font-semibold">ELECTRONICS LAB</span>
                                    <span className="mark-badge text-[10px]">Logic Simulation</span>
                                </div>
                                <h3 className="text-base font-bold text-[#111827] font-display mb-1.5">CircuitBrain Schematic Builder</h3>
                                <p className="text-xs text-[#6B7280] leading-relaxed font-sans-academic">
                                    Interactive breadboards, logic gates, Ohm's law verifications, and robotic automation schematics for school laboratories.
                                </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-xs font-semibold text-[#2A3F8F]">
                                <span>Launch CircuitBrain</span>
                                <ArrowRight size={13} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. TRUST & BOARD ALIGNMENT SECTION ── */}
            <section className="py-18 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-3">
                <div className="text-xs font-mono-stamp uppercase font-semibold text-[#2A3F8F]">
                    Curriculum Compliance Standard
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[#111827]">
                    Aligned with CBSE, ICSE, and State Board examination blueprints.
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] max-w-2xl mx-auto font-sans-academic">
                    Designed for schools, coaching centres, publishers, academic coordinators, and educational institutions.
                </p>
            </section>

            {/* ── 8. DEEP INDIGO INSTITUTIONAL CTA SECTION ── */}
            <section className="bg-[#2A3F8F] text-white py-18 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                        Standardize your institutional examination architecture.
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto font-sans-academic">
                        Deploy DeepHub AI across your faculty to formulate board-aligned examination papers and pedagogical timelines.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-6 py-3 rounded-lg bg-white text-[#2A3F8F] font-semibold text-xs uppercase tracking-wider shadow-sm hover:bg-[#F7F8FA] transition-all"
                        >
                            Open Turbo Workspace
                        </button>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-6 py-3 rounded-lg border border-white/30 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                        >
                            Institutional Licensing
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 9. INSTITUTIONAL FOOTER ── */}
            <footer className="border-t border-[#E7EAF0] bg-[#FFFFFF] py-8 px-4 sm:px-8 text-xs text-[#6B7280] notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-5 h-5 object-contain" />
                        <span className="font-semibold font-display text-[#111827]">DeepHub AI</span>
                        <span>· Curriculum &amp; Examination Architecture</span>
                    </div>
                    <div className="flex items-center gap-5 font-medium">
                        <span onClick={() => navigate('/terms')} className="hover:text-[#111827] cursor-pointer">Terms &amp; Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#111827] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[#111827] cursor-pointer">Pricing</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[#2A3F8F] text-[#2A3F8F] font-semibold cursor-pointer">Turbo</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} DeepHub AI. Built for Indian Educators.
                    </div>
                </div>
            </footer>
        </div>
    );
}
