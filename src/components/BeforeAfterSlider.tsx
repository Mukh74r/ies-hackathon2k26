import React, { useState, useRef, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Sparkles,
    Zap,
    Play,
    RotateCcw,
    Layers,
    ShieldCheck,
    Languages,
    FileText,
    ArrowRight,
    HelpCircle,
    Code2,
    Sliders,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BenchmarkTab {
    id: string;
    label: string;
    icon: any;
    traditional: {
        title: string;
        desc: string;
        metric: string;
        detail: string;
    };
    deephub: {
        title: string;
        desc: string;
        metric: string;
        detail: string;
    };
}

export default function BeforeAfterSlider() {
    const navigate = useNavigate();
    const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('time');
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simStep, setSimStep] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const BENCHMARKS: BenchmarkTab[] = [
        {
            id: 'time',
            label: 'Speed & Time',
            icon: Clock,
            traditional: {
                title: '4.5 Hours of Manual Typing',
                desc: 'Manual question hunting across old textbooks, Word formatting glitches, missing answer keys, and multiple review cycles.',
                metric: '4h 30m',
                detail: 'High teacher fatigue & delayed examination schedules'
            },
            deephub: {
                title: '30 Seconds Automated Derivation',
                desc: 'Instant prompt-to-blueprint generation aligned with official curriculum guidelines, KaTeX equations, and step marking schemes.',
                metric: '30 Sec',
                detail: '90% time saved per examination cycle'
            }
        },
        {
            id: 'math',
            label: 'LaTeX Equations',
            icon: Code2,
            traditional: {
                title: 'Broken Fonts & Misaligned Formulas',
                desc: 'Equation editor font errors, blurry screenshot scans, unaligned square roots, and fraction formatting bugs in MS Word.',
                metric: 'Error-Prone',
                detail: 'Frequent student confusion during exam hours'
            },
            deephub: {
                title: 'Typeset Vector KaTeX & Diagrams',
                desc: 'Clean vector rendering of complex calculus, chemical mechanisms, circuit diagrams, and algebraic matrices with high-DPI clarity.',
                metric: '100% Crisp',
                detail: 'Zero math rendering or symbol ambiguity'
            }
        },
        {
            id: 'taxonomy',
            label: "Bloom's Taxonomy",
            icon: Sliders,
            traditional: {
                title: 'Subjective & Unbalanced Questioning',
                desc: 'Over-reliance on rote memorization (80% recall), accidental mark arithmetic errors (Total 78/80), and missing choice balance.',
                metric: 'Unbalanced',
                detail: 'Fails modern NEP 2020 competency benchmarks'
            },
            deephub: {
                title: 'Strict 80/80 Cognitive Balance',
                desc: 'Exact NEP 2020 matrix: 30% Knowledge, 40% Application, 30% HOTS (Higher-Order Thinking) with verified mark sums.',
                metric: '80/80 Exact',
                detail: 'Compliant with CBSE & State Board directives'
            }
        },
        {
            id: 'languages',
            label: '11 Languages',
            icon: Languages,
            traditional: {
                title: 'Manual Translation Bottleneck',
                desc: 'Days of external agency translation needed for Hindi and regional language mediums with frequent pedagogical translation drift.',
                metric: '1 Language',
                detail: 'High translation costs & delayed regional releases'
            },
            deephub: {
                title: 'Instant Multi-Medium Synchronization',
                desc: '1-click simultaneous generation across 11 Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, etc.) with unified rubrics.',
                metric: '11 Languages',
                detail: 'Synchronized difficulty across all mediums'
            }
        },
        {
            id: 'security',
            label: 'Paper Security',
            icon: ShieldCheck,
            traditional: {
                title: 'Unencrypted Word Files & Email Leaks',
                desc: 'Unprotected DOCX files shared across insecure email threads and WhatsApp groups with zero audit trails or tamper seals.',
                metric: 'Vulnerable',
                detail: 'High risk of paper compromise before exam day'
            },
            deephub: {
                title: 'Cryptographic QR Watermarking',
                desc: 'Dynamic institutional watermarks, randomized question banking, and cryptographic QR code validation for evaluation centers.',
                metric: 'Encrypted',
                detail: 'Zero-leak security architecture with role RBAC'
            }
        }
    ];

    const currentBenchmark = BENCHMARKS.find(b => b.id === activeTab) || BENCHMARKS[0];

    // Live AI Derivation Simulation
    const runSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setSimStep(1);

        setTimeout(() => setSimStep(2), 700);
        setTimeout(() => setSimStep(3), 1500);
        setTimeout(() => setSimStep(4), 2200);
        setTimeout(() => {
            setSimStep(5);
            setIsSimulating(false);
            setSliderPos(100);
        }, 3000);
    };

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const rawX = clientX - rect.left;
        const boundedX = Math.max(0, Math.min(rect.width, rawX));
        const percentage = (boundedX / rect.width) * 100;
        setSliderPos(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    return (
        <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-xs font-mono-stamp text-[#00A4E4]">
                    <Sparkles size={13} />
                    <span>Real-World Institutional Impact</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#FFFFFF] tracking-tight">
                    Before vs. After DeepHub AI
                </h2>
                <p className="text-sm sm:text-base text-[#94A3B8] font-sans-academic leading-relaxed">
                    Compare the traditional manual paper-setting ordeal with DeepHub AI's automated neural examination platform.
                </p>
            </div>

            {/* Interactive Benchmark Category Tabs (Mobile Scrollable & Desktop Centered) */}
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none max-w-full px-1 mb-8">
                {BENCHMARKS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSliderPos(50);
                            }}
                            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                                isActive
                                    ? 'bg-[#00A4E4] text-black shadow-lg shadow-[#00A4E4]/20 scale-102 font-bold'
                                    : 'bg-[#0E1424] text-[#94A3B8] border border-[#1E2640] hover:text-white hover:border-[#00A4E4]/40'
                            }`}
                        >
                            <Icon size={14} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Interactive Showcase Card */}
            <div className="rounded-3xl border border-[#1E2640] bg-[#0E1424]/90 backdrop-blur-md shadow-2xl p-4 sm:p-8 space-y-8">
                
                {/* Top Control Bar with Quick View Toggles & Simulation Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#1E2640]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#94A3B8] font-mono-stamp uppercase tracking-wider">Preview View:</span>
                        <div className="inline-flex rounded-lg bg-[#000000] p-1 border border-[#1E2640]">
                            <button
                                onClick={() => setSliderPos(0)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                    sliderPos < 20 ? 'bg-red-500/20 text-red-400 font-bold' : 'text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                Manual Only
                            </button>
                            <button
                                onClick={() => setSliderPos(50)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                    sliderPos >= 20 && sliderPos <= 80 ? 'bg-[#00A4E4]/20 text-[#00A4E4] font-bold' : 'text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                Side-by-Side
                            </button>
                            <button
                                onClick={() => setSliderPos(100)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                    sliderPos > 80 ? 'bg-[#00A4E4] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                DeepHub AI
                            </button>
                        </div>
                    </div>

                    {/* Live Simulation Button */}
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="px-5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
                    >
                        {isSimulating ? (
                            <>
                                <RotateCcw size={14} className="animate-spin text-[#00A4E4]" />
                                <span>Deriving Blueprint ({simStep}/4)...</span>
                            </>
                        ) : (
                            <>
                                <Play size={14} className="fill-black" />
                                <span>Simulate 30s Instant Paper Setting</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Simulation Step Progress Bar (when active) */}
                {isSimulating && (
                    <div className="p-4 rounded-2xl bg-[#000000] border border-[#00A4E4]/40 space-y-3 animate-settle">
                        <div className="flex items-center justify-between text-xs font-mono-stamp text-[#00A4E4]">
                            <span className="flex items-center gap-2">
                                <Zap size={14} className="animate-pulse" />
                                {simStep === 1 && 'Parsing Syllabus & Course Outcomes...'}
                                {simStep === 2 && "Balancing Bloom's Cognitive Weights (30% Knowledge, 40% App, 30% HOTS)..."}
                                {simStep === 3 && 'Typesetting LaTeX Scientific Formulas & Diagrams...'}
                                {simStep === 4 && 'Embedding Cryptographic QR Code & Step-by-Step Marking Rubric...'}
                                {simStep === 5 && '✓ Ready! 100% Balanced Examination Paper Generated.'}
                            </span>
                            <span className="font-bold">{simStep * 25}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#1E2640] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${simStep * 25}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Interactive Dual Comparison Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* ❌ Left / Traditional Card */}
                    <div
                        className={`rounded-2xl border p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all ${
                            sliderPos > 70
                                ? 'opacity-40 border-[#1E2640] bg-[#000000]/40'
                                : 'border-red-500/30 bg-red-950/10 shadow-lg'
                        }`}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400">
                                    <XCircle size={14} /> Traditional Manual Process
                                </span>
                                <span className="text-xs font-mono-stamp text-red-400 font-bold flex items-center gap-1">
                                    <Clock size={13} /> {currentBenchmark.traditional.metric}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white font-display">
                                {currentBenchmark.traditional.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans-academic">
                                {currentBenchmark.traditional.desc}
                            </p>

                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-mono-stamp">
                                ⚠️ Impact: {currentBenchmark.traditional.detail}
                            </div>
                        </div>

                        {/* Interactive Traditional Document Window */}
                        <div className="rounded-xl border border-red-500/20 bg-[#000000]/80 p-4 font-mono text-[11px] text-red-300/80 space-y-2.5">
                            <div className="flex items-center justify-between text-[10px] text-white/40 pb-2 border-b border-white/5">
                                <span>unbalanced_exam_draft.docx</span>
                                <span className="text-red-400 font-bold">Total: 78/80 (Math Error)</span>
                            </div>
                            <div className="text-white/60 space-y-1">
                                <div>Q.1) What is dipole? [1M - Low Cognitive Depth]</div>
                                <div>Q.2) Find root: [Missing Equation Font] ???</div>
                                <div className="text-red-400">⚠️ Error: Section B marks don't match syllabus weight</div>
                            </div>
                            <div className="text-[10px] text-white/30 pt-1 border-t border-white/5 flex items-center justify-between">
                                <span>Format: Unstandardized Word</span>
                                <span>Marking key: Missing</span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Right / DeepHub AI Card */}
                    <div
                        className={`rounded-2xl border p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all ${
                            sliderPos < 30
                                ? 'opacity-40 border-[#1E2640] bg-[#000000]/40'
                                : 'border-[#00A4E4]/40 bg-[#00A4E4]/5 shadow-xl shadow-[#00A4E4]/5'
                        }`}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A4E4]/15 border border-[#00A4E4]/40 text-xs font-bold text-[#00A4E4]">
                                    <CheckCircle2 size={14} /> DeepHub AI Engine
                                </span>
                                <span className="text-xs font-mono-stamp text-[#00A4E4] font-bold flex items-center gap-1">
                                    <Zap size={13} /> {currentBenchmark.deephub.metric}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white font-display">
                                {currentBenchmark.deephub.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans-academic">
                                {currentBenchmark.deephub.desc}
                            </p>

                            <div className="p-3 rounded-lg bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-xs text-cyan-200 font-mono-stamp">
                                ✓ Advantage: {currentBenchmark.deephub.detail}
                            </div>
                        </div>

                        {/* Interactive DeepHub AI Typeset Document Window */}
                        <div className="rounded-xl border border-[#00A4E4]/30 bg-[#000000]/90 p-4 font-mono text-[11px] text-[#00A4E4] space-y-2.5">
                            <div className="flex items-center justify-between text-[10px] text-white/60 pb-2 border-b border-white/10">
                                <span>CBSE_Class12_Physics_Term2.pdf</span>
                                <span className="text-[#00A4E4] font-bold">Total: 80/80 (100% Balanced)</span>
                            </div>
                            <div className="text-white font-sans text-xs space-y-1.5">
                                <div className="font-semibold text-cyan-300">
                                    Section C (HOTS - 3 Marks):
                                </div>
                                <div className="text-white/80 leading-relaxed">
                                    "Derive the expression for torque acting on an electric dipole placed in a uniform electric field <span className="font-mono text-cyan-300">\vec&#123;E&#125;</span>."
                                </div>
                            </div>
                            <div className="text-[10px] text-[#94A3B8] pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-green-400">✓ Step Rubric (1+1+1=3M)</span>
                                <span className="text-cyan-300">✓ LaTeX Rendered</span>
                                <span className="text-white/50">🔒 QR Sealed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Summary Stats */}
                <div className="pt-6 border-t border-[#1E2640] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-[#000000]/60 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-white font-mono-stamp">90%</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Time Saved</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/60 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-[#00A4E4] font-mono-stamp">100%</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">NEP 2020 Compliance</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/60 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-white font-mono-stamp">11</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Indian Languages</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/60 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-[#00A4E4] font-mono-stamp">0</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Calculation Discrepancies</div>
                    </div>
                </div>

                {/* Direct Action */}
                <div className="pt-2 text-center">
                    <button
                        onClick={() => navigate('/turbo')}
                        className="px-8 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                        <span>Open Turbo Studio & Build Your Blueprint</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>
    );
}
