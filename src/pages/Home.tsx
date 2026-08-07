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
    ClipboardList,
    BarChart3,
    Layers,
    FolderKanban,
    Download,
    Printer,
    FileSpreadsheet,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Sparkles,
    Upload,
    ScanText,
    Target,
    Workflow,
    FileOutput
} from 'lucide-react';
import BrandLogo from '../assets/brand-logo-main.svg';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const { currentLanguage, setLanguageByCode, theme, toggleTheme } = useLanguage();
    const isLight = theme === 'light';
    const [langOpen, setLangOpen] = useState(false);

    // Signature Hero Simulation: Runs strictly ONCE on page load (1.8s - 2.2s total duration)
    const [animStage, setAnimStage] = useState<number>(0);
    const [pipelineActiveStep, setPipelineActiveStep] = useState<number>(3); // interactive pipeline node
    const [solverStep, setSolverStep] = useState<number>(6); // expanding marking guide steps

    useEffect(() => {
        // Honest step-by-step blueprint formulation (never loops)
        const t1 = setTimeout(() => setAnimStage(1), 300);  // Section A fills
        const t2 = setTimeout(() => setAnimStage(2), 750);  // Section B fills
        const t3 = setTimeout(() => setAnimStage(3), 1200); // Section C fills
        const t4 = setTimeout(() => setAnimStage(4), 1600); // Difficulty bars animate
        const t5 = setTimeout(() => setAnimStage(5), 1950); // Coverage bars & generation complete
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, []);

    const PIPELINE_STEPS = [
        { id: 1, title: 'Upload Curriculum', subtitle: 'NCERT / State PDF', icon: Upload },
        { id: 2, title: 'OCR Extraction', subtitle: 'LaTeX & Ray Diagrams', icon: ScanText },
        { id: 3, title: 'Learning Outcomes', subtitle: 'Bloom\'s Taxonomy', icon: Target },
        { id: 4, title: 'Blueprint Generation', subtitle: '50 & 80-Mark Grid', icon: Sliders },
        { id: 5, title: 'Question Paper', subtitle: 'Sec A / B / C Formatted', icon: FileText },
        { id: 6, title: 'Export PDF / DOCX', subtitle: 'Print-Ready Layout', icon: FileOutput },
    ];

    const INDIAN_LANGUAGE_CHIPS = [
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

    const SOLVER_CRITERIA = [
        { title: 'Introduction & Context', detail: 'Outlines immediate trigger (Enfield rifle cartridge) and background discontent', mark: '+0.5M' },
        { title: 'Political Causes', detail: 'Doctrine of Lapse (Lord Dalhousie), annexation of Awadh (1856), pension cessation', mark: '+1.0M' },
        { title: 'Economic Causes', detail: 'Heavy land revenue settlements, destruction of traditional Indian handicraft industries', mark: '+1.0M' },
        { title: 'Military Causes', detail: 'General Service Enlistment Act (overseas duty), racial discrimination in promotions', mark: '+1.0M' },
        { title: 'Socio-Religious Causes', detail: 'Interference with customary practices, fear of forcible religious conversions', mark: '+1.0M' },
        { title: 'Conclusion & Impact', detail: 'End of East India Company rule and transition to direct British Crown governance (1858)', mark: '+0.5M' },
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1C2434] font-sans-academic selection:bg-[#2A3F8F]/15 transition-colors">
            
            {/* ── TOP NAVBAR ── */}
            <header className="border-b border-[#E5E7EB] bg-[#FFFFFF] px-4 sm:px-8 py-3 sticky top-0 z-50 shadow-xs notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={BrandLogo} alt="DeepHub AI Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="font-display font-semibold text-base text-[#1C2434] tracking-tight flex items-center gap-1.5">
                                <span>DeepHub AI</span>
                                <span className="text-[10px] font-mono-stamp px-1.5 py-0.5 rounded bg-[#2A3F8F]/10 text-[#2A3F8F] border border-[#2A3F8F]/20 font-semibold uppercase">
                                    Institutional V4.2
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links Center */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        <button onClick={() => navigate('/turbo')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#5C6474] hover:text-[#1C2434] hover:bg-[#F7F8FA] transition-colors">
                            Turbo
                        </button>
                        <button onClick={() => navigate('/virtualbrain')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#5C6474] hover:text-[#1C2434] hover:bg-[#F7F8FA] transition-colors">
                            VirtualBrain
                        </button>
                        <button onClick={() => navigate('/circuitbrain')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#5C6474] hover:text-[#1C2434] hover:bg-[#F7F8FA] transition-colors">
                            CircuitBrain
                        </button>
                        <button onClick={() => navigate('/latest')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#5C6474] hover:text-[#1C2434] hover:bg-[#F7F8FA] transition-colors">
                            Latest
                        </button>
                        <button onClick={() => navigate('/pricing')} className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#5C6474] hover:text-[#1C2434] hover:bg-[#F7F8FA] transition-colors">
                            Pricing
                        </button>
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2.5">
                        {/* Theme Toggle (Light Default / Dark Opt-In) */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] text-xs font-medium text-[#1C2434] hover:border-[#2A3F8F] transition-all card-lift"
                            title={`Switch to ${isLight ? 'Dark Mode' : 'Light Mode'}`}
                        >
                            {isLight ? (
                                <>
                                    <Sun size={13} className="text-[#B5762A]" />
                                    <span className="hidden sm:inline text-[11px] text-[#5C6474]">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={13} className="text-[#6E85D6]" />
                                    <span className="hidden sm:inline text-[11px] text-[#5C6474]">Dark</span>
                                </>
                            )}
                        </button>

                        {/* Regional Language Switcher */}
                        <div className="relative notranslate" translate="no">
                            <button
                                onClick={() => setLangOpen(prev => !prev)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] text-xs font-semibold text-[#1C2434] hover:border-[#2A3F8F] transition-all notranslate card-lift"
                                translate="no"
                            >
                                <span className="text-[11px] text-[#2A3F8F] font-bold notranslate">{currentLanguage.code.toUpperCase()}</span>
                                <ChevronDown size={11} className={`text-[#5C6474] transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {langOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-64 p-2 bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg rounded-xl grid grid-cols-2 gap-1 z-50 notranslate animate-settle" translate="no">
                                    <div className="col-span-2 px-2 py-1 text-[10px] uppercase font-mono-stamp text-[#5C6474] border-b border-[#E5E7EB] mb-1">
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
                                                    : 'text-[#5C6474] hover:bg-[#F7F8FA] hover:text-[#1C2434]'
                                            }`}
                                            translate="no"
                                        >
                                            <div className="flex flex-col notranslate">
                                                <span className="font-mono-stamp text-[11px] uppercase notranslate">{lang.code}</span>
                                                <span className="text-[10px] text-[#5C6474] notranslate">{lang.nativeName}</span>
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
                            Generate Blueprint
                        </button>
                    </div>
                </div>
            </header>

            {/* ── 1. HERO SECTION (55/45 Split Layout · Real Product Miniature) ── */}
            <section className="pt-14 pb-18 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* LEFT COLUMN (55%): Plain, Authoritative Institutional Statement */}
                    <div className="lg:col-span-6 space-y-6 pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-xs font-semibold text-[#2A3F8F]">
                            <ShieldCheck size={14} className="text-[#2A3F8F] flex-shrink-0" />
                            <span>INSTITUTIONAL CURRICULUM ARCHITECTURE</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold font-display tracking-tight text-[#1C2434] leading-[1.16]">
                            Curriculum-aligned Question Papers for Indian Schools
                        </h1>

                        <p className="text-sm sm:text-base text-[#5C6474] leading-relaxed font-sans-academic max-w-xl">
                            Generate examination blueprints, question papers, marking schemes, lesson plans and assessment material directly from your curriculum while maintaining board alignment.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-6 py-3 rounded-lg bg-[#2A3F8F] hover:bg-[#223377] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                            >
                                <span>Generate Blueprint</span>
                                <ArrowRight size={14} />
                            </button>
                            <a
                                href="#blueprint-preview"
                                className="px-5 py-3 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#2A3F8F] text-[#1C2434] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                                <span>View Sample Paper</span>
                            </a>
                        </div>

                        {/* Trust Bullets */}
                        <div className="pt-4 border-t border-[#E5E7EB] space-y-2 text-xs text-[#5C6474] font-medium font-sans-academic">
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

                    {/* RIGHT COLUMN (45%): Realistic Miniature of Software Interface */}
                    <div id="blueprint-preview" className="lg:col-span-6">
                        <div className="rounded-[18px] bg-[#FFFFFF] border border-[#E5E7EB] p-5 sm:p-6 shadow-sm space-y-4">
                            
                            {/* Window Header */}
                            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                                    <span className="text-xs font-semibold font-display text-[#1C2434] ml-2">
                                        50 Mark Examination Blueprint
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono-stamp text-[#5C6474] uppercase px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB]">
                                    CBSE Class 10 Physics
                                </span>
                            </div>

                            {/* Section A */}
                            <div className={`p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">SECTION A (MCQs · 1M Each)</span>
                                    <span className="mark-badge text-[10px]">+1.0M</span>
                                </div>
                                <p className="text-[11px] text-[#5C6474] font-sans-academic leading-relaxed">
                                    Q1. Refraction index n = 1.5, angle of incidence i = 30°. Calculate angle of refraction r in air.
                                </p>
                            </div>

                            {/* Section B */}
                            <div className={`p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">SECTION B (Short Answer &amp; Derivations)</span>
                                    <span className="mark-badge text-[10px]">+3.0M</span>
                                </div>
                                <p className="text-[11px] text-[#5C6474] font-sans-academic leading-relaxed">
                                    Q2. State Ohm's Law and derive V = IR. List 2 physical parameters determining electrical resistivity.
                                </p>
                            </div>

                            {/* Section C */}
                            <div className={`p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] transition-all duration-300 ${animStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-[#2A3F8F] font-mono-stamp uppercase">SECTION C (Case-Based Integrated Assessment)</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="mark-badge text-[10px]">20% HOTS</span>
                                        <span className="mark-badge text-[10px]">+4.0M</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#5C6474] font-sans-academic leading-relaxed">
                                    Q3. Concave mirror (f = -15 cm) forms inverted image at 30 cm. Find object location u and magnification.
                                </p>
                            </div>

                            {/* Analytical Breakdowns (Difficulty, Chapter Coverage, Bloom's Taxonomy) */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                
                                {/* Difficulty Distribution */}
                                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] space-y-2">
                                    <div className="text-[10px] font-mono-stamp uppercase text-[#5C6474] font-semibold">
                                        Difficulty Distribution
                                    </div>
                                    <div className="space-y-1.5 text-[10px] font-mono-stamp">
                                        <div className="flex justify-between"><span>Easy (Recall)</span><span className="font-semibold text-[#1C2434]">30%</span></div>
                                        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#2F7D5C] transition-all duration-500" style={{ width: animStage >= 4 ? '30%' : '0%' }} />
                                        </div>
                                        <div className="flex justify-between"><span>Medium (Apply)</span><span className="font-semibold text-[#1C2434]">50%</span></div>
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
                                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] space-y-2">
                                    <div className="text-[10px] font-mono-stamp uppercase text-[#5C6474] font-semibold">
                                        Chapter Coverage
                                    </div>
                                    <div className="space-y-1 text-[11px] text-[#5C6474]">
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
                                    <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono-stamp">
                                        <span className="text-[#5C6474]">Status:</span>
                                        <span className={`inline-flex items-center gap-1 font-semibold ${animStage >= 5 ? 'text-[#2F7D5C]' : 'text-[#B5762A]'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${animStage >= 5 ? 'bg-[#2F7D5C]' : 'bg-[#B5762A]'}`} />
                                            {animStage >= 5 ? 'Blueprint Complete (50M)' : 'Synthesizing Blueprint...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. CURRICULUM PIPELINE (Wide Horizontal Workflow) ── */}
            <section className="py-18 px-4 sm:px-8 bg-[#F7F8FA] border-y border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="max-w-xl">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Production Pipeline</span>
                        <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#1C2434] mt-1">
                            Curriculum to Examination Pipeline
                        </h2>
                        <p className="text-xs sm:text-sm text-[#5C6474] mt-1.5 font-sans-academic">
                            A linear production workflow linking official syllabi directly to classroom examination materials.
                        </p>
                    </div>

                    {/* Horizontal Step Nodes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
                        {PIPELINE_STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = pipelineActiveStep === step.id;
                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setPipelineActiveStep(step.id)}
                                    className={`p-4 rounded-xl border bg-[#FFFFFF] transition-all cursor-pointer card-lift ${
                                        isActive
                                            ? 'border-[#2A3F8F] ring-1 ring-[#2A3F8F] shadow-xs'
                                            : 'border-[#E5E7EB] hover:border-[#2A3F8F]/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-md ${isActive ? 'bg-[#2A3F8F] text-white' : 'bg-[#F7F8FA] text-[#5C6474]'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-mono-stamp text-[#5C6474]">0{step.id}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-[#1C2434] font-display mb-0.5">{step.title}</div>
                                    <div className="text-[11px] text-[#5C6474] font-sans-academic">{step.subtitle}</div>
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
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#1C2434] mt-1">
                        Paper Solver Transformation Panel
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C6474] mt-1.5 font-sans-academic">
                        Converts raw textbook questions into step-by-step scoring manuals with discrete mark allocations.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT: Original Question */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] flex flex-col justify-between shadow-2xs">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                                <span className="text-[10px] font-mono-stamp uppercase text-[#5C6474] font-semibold">INPUT: ORIGINAL QUESTION</span>
                                <span className="mark-badge text-[10px]">5 Marks</span>
                            </div>
                            <div className="space-y-2 text-xs text-[#1C2434] font-sans-academic leading-relaxed">
                                <p className="font-semibold text-sm">Class 10 History / Social Science:</p>
                                <p className="text-[#5C6474] text-xs">
                                    "Explain the causes of the Revolt of 1857."
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] font-mono-stamp text-[#5C6474]">
                            <span>CBSE Social Science Section D</span>
                            <span>Standard 5M Rubric</span>
                        </div>
                    </div>

                    {/* RIGHT: Generated Evaluation Guide (Step-by-Step with Maroon Badges) */}
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                            <span className="text-[10px] font-mono-stamp uppercase text-[#2A3F8F] font-semibold">OUTPUT: GENERATED EVALUATION GUIDE</span>
                            <span className="text-xs font-mono-stamp font-semibold text-[#2F7D5C]">Total: 5.0 / 5.0 M</span>
                        </div>

                        <div className="space-y-2 text-xs">
                            {SOLVER_CRITERIA.map((criterion, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#2A3F8F]/40 transition-colors flex items-start justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="font-semibold text-[#1C2434] font-display">{criterion.title}</div>
                                        <div className="text-[11px] text-[#5C6474] font-sans-academic leading-relaxed">{criterion.detail}</div>
                                    </div>
                                    <span className="mark-badge flex-shrink-0 animate-mark-settle">{criterion.mark}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. LANGUAGE SECTION (Prominent Native Scripts Chip Grid) ── */}
            <section className="py-18 px-4 sm:px-8 bg-[#F0F3FA] border-y border-[#E5E7EB] notranslate" translate="no">
                <div className="max-w-7xl mx-auto space-y-8 notranslate" translate="no">
                    <div className="max-w-xl notranslate" translate="no">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold notranslate" translate="no">Vernacular Parity</span>
                        <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#1C2434] mt-1 notranslate" translate="no">
                            Native Synthesis in 11 Indian Languages
                        </h2>
                        <p className="text-xs sm:text-sm text-[#5C6474] mt-1.5 font-sans-academic notranslate" translate="no">
                            Native scripts are prominent first-class typographic elements, eliminating translation artifacts.
                        </p>
                    </div>

                    {/* Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 notranslate" translate="no">
                        {INDIAN_LANGUAGE_CHIPS.map((chip) => {
                            const isCurrent = currentLanguage.code === chip.code;
                            return (
                                <div
                                    key={chip.code}
                                    onClick={() => setLanguageByCode(chip.code)}
                                    className={`p-4 rounded-xl border bg-[#FFFFFF] transition-all cursor-pointer card-lift notranslate ${
                                        isCurrent
                                            ? 'border-[#2A3F8F] ring-1 ring-[#2A3F8F] shadow-xs'
                                            : 'border-[#E5E7EB] hover:border-[#2A3F8F]'
                                    }`}
                                    translate="no"
                                >
                                    <div className="text-lg font-bold text-[#1C2434] notranslate" translate="no">{chip.native}</div>
                                    <div className="text-xs text-[#5C6474] font-medium mt-0.5 notranslate" translate="no">{chip.latin}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 5. MODULES (Dashboard Previews Instead of Generic Icon Grids) ── */}
            <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
                <div className="max-w-xl mb-10">
                    <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Institutional Workspace</span>
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#1C2434] mt-1">
                        Purpose-Built Academic Modules
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C6474] mt-1.5 font-sans-academic">
                        Each module is calibrated to solve specific day-to-day administrative and teaching tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        {
                            title: 'Question Paper Generator',
                            category: 'Examination Suite',
                            preview: '50M / 80M Blueprint · Section A, B, C · LaTeX formulas',
                            badge: 'CBSE / ICSE Aligned'
                        },
                        {
                            title: 'Lesson Plan Builder',
                            category: 'Pedagogy Suite',
                            preview: '45-Min Timeline · 00:00 Engage · 00:08 Derive · 00:28 Exit Slip',
                            badge: 'Bloom\'s Taxonomy'
                        },
                        {
                            title: 'Paper Solver',
                            category: 'Evaluation Suite',
                            preview: 'Step-by-Step Scoring Guide · Right-aligned +0.5M, +1M badges',
                            badge: 'Marking Scheme'
                        },
                        {
                            title: 'Assessment Analytics',
                            category: 'Administrative Suite',
                            preview: 'Chapter weightage tracking · Item difficulty index · Learning gaps',
                            badge: 'Academic Audit'
                        },
                        {
                            title: 'Curriculum Manager',
                            category: 'Syllabus Suite',
                            preview: 'Chapter repository · Learning objectives · Board updates repository',
                            badge: 'Framework Ingestion'
                        },
                        {
                            title: 'VirtualBrain',
                            category: 'Interactive Suite',
                            preview: 'Neural curriculum visualization · Derivation graph inspector',
                            badge: 'Cognitive Engine'
                        }
                    ].map((mod, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate('/turbo')}
                            className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#2A3F8F] transition-all cursor-pointer card-lift shadow-2xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono-stamp text-[#5C6474] uppercase">{mod.category}</span>
                                    <span className="text-[10px] font-mono-stamp text-[#8C2D33] border border-[#8C2D33]/20 bg-[#8C2D33]/8 px-2 py-0.5 rounded-md">
                                        {mod.badge}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-[#1C2434] font-display mb-1.5">{mod.title}</h3>
                                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-mono-stamp text-[#5C6474]">
                                    {mod.preview}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#2A3F8F]">
                                <span>Open Module</span>
                                <ArrowRight size={13} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 6. DATA VISUALIZATION (Real Educational Analytics) ── */}
            <section className="py-18 px-4 sm:px-8 bg-[#F7F8FA] border-y border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="max-w-xl">
                        <span className="text-xs font-mono-stamp text-[#2A3F8F] uppercase font-semibold">Institutional Telemetry</span>
                        <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#1C2434] mt-1">
                            Educational Quality Analytics
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Question Generation Throughput', value: '100% Board Compliant', sub: 'Calibrated to circular mark schemes' },
                            { label: 'Blueprint Completion Rate', value: '50M & 80M Pre-Set', sub: 'Section-wise mark integrity' },
                            { label: 'Language Parity Index', value: '11 Regional Languages', sub: 'Zero machine translation distortion' },
                            { label: 'Cognitive Balance', value: '30 / 50 / 20 Ratio', sub: 'Recall / Application / HOTS' },
                        ].map((metric, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-2xs space-y-1">
                                <div className="text-[10px] font-mono-stamp uppercase text-[#5C6474] font-semibold">{metric.label}</div>
                                <div className="text-base font-bold font-display text-[#1C2434]">{metric.value}</div>
                                <div className="text-[11px] text-[#5C6474] font-sans-academic pt-1">{metric.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. TRUST SECTION (Clean Typography, No Fake Logos) ── */}
            <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-3">
                <div className="text-xs font-mono-stamp uppercase font-semibold text-[#2A3F8F]">
                    Curriculum Compliance Standard
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold font-display text-[#1C2434]">
                    Aligned with CBSE, ICSE, and State Board examination blueprints.
                </h3>
                <p className="text-xs sm:text-sm text-[#5C6474] max-w-2xl mx-auto font-sans-academic">
                    Supports institutional academic workflows for schools, coaching centres, publishers, and educators.
                </p>
            </section>

            {/* ── 8. DEEP INDIGO INSTITUTIONAL CTA SECTION ── */}
            <section className="bg-[#2A3F8F] text-white py-16 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-semibold font-display tracking-tight text-white">
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
                            Open Turbo Studio
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
            <footer className="border-t border-[#E5E7EB] bg-[#FFFFFF] py-8 px-4 sm:px-8 text-xs text-[#5C6474] notranslate" translate="no">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <img src={BrandLogo} alt="DeepHub AI" className="w-5 h-5 object-contain" />
                        <span className="font-semibold font-display text-[#1C2434]">DeepHub AI</span>
                        <span>· Curriculum &amp; Examination Architecture</span>
                    </div>
                    <div className="flex items-center gap-5 font-medium">
                        <span onClick={() => navigate('/terms')} className="hover:text-[#1C2434] cursor-pointer">Terms &amp; Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#1C2434] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[#1C2434] cursor-pointer">Pricing</span>
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
