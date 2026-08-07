import React, { useState, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, Sparkles, Layers, ShieldCheck, FileText, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BeforeAfterSlider() {
    const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

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
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
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

            {/* Interactive Dual Cards & Slider Container */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                className="relative select-none overflow-hidden rounded-3xl border border-[#1E2640] bg-[#0E1424]/90 backdrop-blur-md shadow-2xl p-4 sm:p-8"
            >
                {/* Mode Selector Pill Buttons */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <button
                        onClick={() => setSliderPos(0)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sliderPos < 35
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-[#000000] text-[#94A3B8] border border-[#1E2640] hover:text-white'
                        }`}
                    >
                        Traditional Manual (4.5 Hours)
                    </button>
                    <button
                        onClick={() => setSliderPos(50)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sliderPos >= 35 && sliderPos <= 65
                                ? 'bg-[#00A4E4]/20 text-[#00A4E4] border border-[#00A4E4]/40'
                                : 'bg-[#000000] text-[#94A3B8] border border-[#1E2640] hover:text-white'
                        }`}
                    >
                        Split Comparison
                    </button>
                    <button
                        onClick={() => setSliderPos(100)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sliderPos > 65
                                ? 'bg-[#00A4E4] text-black border border-[#00A4E4]'
                                : 'bg-[#000000] text-[#94A3B8] border border-[#1E2640] hover:text-white'
                        }`}
                    >
                        DeepHub AI (30 Seconds)
                    </button>
                </div>

                {/* Side by Side Grid for Desktop and Tabs for Mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ❌ BEFORE: Traditional Workflow */}
                    <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400">
                                    <XCircle size={14} /> Traditional Manual Process
                                </span>
                                <span className="text-xs font-mono-stamp text-red-400 font-bold flex items-center gap-1">
                                    <Clock size={13} /> 4.5 Hours / Paper
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white font-display">
                                Manual Question Setting & Formatting Fatigue
                            </h3>

                            <ul className="space-y-3 text-xs sm:text-sm text-[#94A3B8]">
                                <li className="flex items-start gap-2.5">
                                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">Unbalanced Marks & Math Errors:</strong> Accidental 78/80 mark sum mismatches and missing internal choice options.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">Broken Formulas & Equation Alignment:</strong> Misaligned square roots, fraction overlaps, and illegible diagram scans.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">No Step-by-Step Marking Scheme:</strong> Evaluators evaluate subjectively without standardized step mark rubrics.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">Single Language Lock-in:</strong> Days of manual translation required for Hindi or regional language mediums.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Traditional Mockup Window */}
                        <div className="rounded-xl border border-red-500/20 bg-[#000000]/60 p-4 font-mono text-[11px] text-red-300/80 space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-white/40 pb-2 border-b border-white/5">
                                <span>draft_paper_final_v3.docx</span>
                                <span className="text-red-400 font-bold">Total: 78/80 (Error)</span>
                            </div>
                            <div className="text-white/60">Q.3) Solve sqrt(x^2+4) = ??? [Missing equation font]</div>
                            <div className="text-red-400/80">⚠️ Warning: Bloom's HOTS taxonomy not balanced</div>
                            <div className="text-white/40">Marking key: Pending teacher manual creation</div>
                        </div>
                    </div>

                    {/* ✅ AFTER: DeepHub AI Engine */}
                    <div className="rounded-2xl border border-[#00A4E4]/40 bg-[#00A4E4]/5 p-6 sm:p-8 space-y-6 flex flex-col justify-between relative shadow-lg shadow-[#00A4E4]/5">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A4E4]/15 border border-[#00A4E4]/40 text-xs font-bold text-[#00A4E4]">
                                    <CheckCircle2 size={14} /> DeepHub AI Engine
                                </span>
                                <span className="text-xs font-mono-stamp text-[#00A4E4] font-bold flex items-center gap-1">
                                    <Zap size={13} /> 30 Seconds Instant
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white font-display">
                                NEP 2020 Aligned Neural Blueprint & Rubrics
                            </h3>

                            <ul className="space-y-3 text-xs sm:text-sm text-[#94A3B8]">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-[#00A4E4] shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">Exact Blueprint Balancing:</strong> Strict 80/80 marks allocation with Knowledge (30%), Application (40%), and HOTS (30%).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-[#00A4E4] shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">Typeset KaTeX Equations:</strong> Flawless mathematical notations, vector graphs, and SVG scientific diagrams.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-[#00A4E4] shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">QR-Authenticated Marking Scheme:</strong> Automated step-by-step solutions with mark distribution per step.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-[#00A4E4] shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-white">11 Indian Languages in 1 Click:</strong> Instant bilingual and regional translation with zero pedagogical drift.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* DeepHub AI Mockup Window */}
                        <div className="rounded-xl border border-[#00A4E4]/30 bg-[#000000]/80 p-4 font-mono text-[11px] text-[#00A4E4] space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-white/60 pb-2 border-b border-white/10">
                                <span>CBSE_Class12_Physics_2026.pdf</span>
                                <span className="text-[#00A4E4] font-bold">Total: 80/80 (100% Balanced)</span>
                            </div>
                            <div className="text-white font-sans">
                                <strong>Section C (3 Marks):</strong> "Derive the expression for electric field intensity at an axial point of a dipole."
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1">
                                <span>✓ LaTeX Typeset</span>
                                <span>✓ Step Marking: 1 + 1 + 1 = 3M</span>
                                <span>✓ QR Verification Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Metrics Bar */}
                <div className="mt-8 pt-8 border-t border-[#1E2640] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-[#000000]/50 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-white font-mono-stamp">90%</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Time Saved</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/50 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-[#00A4E4] font-mono-stamp">100%</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">NEP 2020 Compliance</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/50 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-white font-mono-stamp">11</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Indian Languages</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#000000]/50 border border-[#1E2640]">
                        <div className="text-2xl sm:text-3xl font-bold text-[#00A4E4] font-mono-stamp">0</div>
                        <div className="text-[11px] text-[#94A3B8] font-sans-academic uppercase tracking-wider mt-1">Calculation Discrepancies</div>
                    </div>
                </div>

                {/* Direct CTA */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/turbo')}
                        className="px-8 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                        <span>Generate Your First Blueprint in 30 Seconds</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>
    );
}
