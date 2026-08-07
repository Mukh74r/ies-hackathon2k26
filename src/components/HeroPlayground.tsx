import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Zap,
    Layers,
    Sliders,
    BookOpen,
    Code2,
    CheckCircle2,
    ArrowRight,
    QrCode,
    Cpu,
    RotateCcw
} from 'lucide-react';

interface Preset {
    id: string;
    label: string;
    board: string;
    subject: string;
    grade: string;
    totalMarks: number;
    timeLimit: string;
    taxonomy: { knowledge: number; application: number; hots: number };
    sampleQuestion: string;
    equation: string;
    rubric: string;
}

export default function HeroPlayground() {
    const navigate = useNavigate();
    const PRESETS: Preset[] = [
        {
            id: 'cbse-phy',
            label: 'CBSE Class 12 Physics',
            board: 'CBSE / NCERT 2026',
            subject: 'Physics',
            grade: 'Class XII',
            totalMarks: 70,
            timeLimit: '3 Hours',
            taxonomy: { knowledge: 25, application: 45, hots: 30 },
            sampleQuestion: 'Derive the expression for the magnetic dipole moment of a revolving electron. Hence, deduce Bohr magneton.',
            equation: '\\mu_B = \\frac{e \\hbar}{2 m_e} = 9.274 \\times 10^{-24} \\text{ J/T}',
            rubric: 'Derivation: 2M | Formula: 1M | Value & Unit: 1M (Total: 4 Marks)'
        },
        {
            id: 'icse-math',
            label: 'ICSE Class 10 Mathematics',
            board: 'CISCE / ICSE 2026',
            subject: 'Mathematics',
            grade: 'Class X',
            totalMarks: 80,
            timeLimit: '2.5 Hours',
            taxonomy: { knowledge: 20, application: 50, hots: 30 },
            sampleQuestion: 'Solve the quadratic equation using formula: 2x² - 7x + 3 = 0, giving your answer correct to 2 decimal places.',
            equation: 'x = \\frac{-(-7) \\pm \\sqrt{(-7)^2 - 4(2)(3)}}{2(2)} = \\frac{7 \\pm \\sqrt{25}}{4}',
            rubric: 'Discriminant: 1M | Roots Calculation: 1M | Decimal Rounding: 1M (Total: 3 Marks)'
        },
        {
            id: 'state-chem',
            label: 'State Board Chemistry',
            board: 'State Board 2026',
            subject: 'Chemistry',
            grade: 'Class XII',
            totalMarks: 70,
            timeLimit: '3 Hours',
            taxonomy: { knowledge: 30, application: 40, hots: 30 },
            sampleQuestion: 'Explain the mechanism of nucleophilic bimolecular substitution (SN2) reaction with stereochemical inversion.',
            equation: '\\text{Nu}^- + \\text{R-LG} \\longrightarrow [\\text{Nu}\\cdots\\text{R}\\cdots\\text{LG}]^\\ddagger \\longrightarrow \\text{Nu-R} + \\text{LG}^-',
            rubric: 'Mechanism: 2M | Transition State: 1M | Inversion Proof: 1M (Total: 4 Marks)'
        }
    ];

    const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSelect = (preset: Preset) => {
        setIsGenerating(true);
        setSelectedPreset(preset);
        setTimeout(() => setIsGenerating(false), 250);
    };

    return (
        <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#1E2640] bg-[#0E1424]/90 backdrop-blur-md shadow-2xl p-4 sm:p-8 space-y-6 text-left relative overflow-hidden notranslate" translate="no">
            {/* Top Bar: Selector Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2640]">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#00A4E4]/10 text-[#00A4E4]">
                        <Zap size={16} />
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                        Interactive Blueprint Sandbox
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {PRESETS.map(preset => {
                        const isSelected = selectedPreset.id === preset.id;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => handleSelect(preset)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    isSelected
                                        ? 'bg-[#00A4E4] text-black font-bold shadow-md shadow-[#00A4E4]/20'
                                        : 'bg-[#000000] text-[#94A3B8] border border-[#1E2640] hover:text-white hover:border-[#00A4E4]/40'
                                }`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Live Derived Output Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Exam Paper Question Preview */}
                <div className="lg:col-span-2 rounded-2xl bg-[#000000]/80 border border-[#1E2640] p-5 sm:p-6 space-y-4 font-sans-academic relative">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                        <div className="flex items-center gap-2 font-mono-stamp text-white">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">{selectedPreset.board}</span>
                            <span className="text-[#00A4E4]">{selectedPreset.subject} ({selectedPreset.grade})</span>
                        </div>
                        <div className="text-[#94A3B8] font-mono-stamp text-[11px]">
                            Max Marks: <strong className="text-white">{selectedPreset.totalMarks}</strong> | Time: {selectedPreset.timeLimit}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-3 pt-1">
                        <div className="flex items-start gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-[#00A4E4]/15 border border-[#00A4E4]/30 text-[#00A4E4] text-xs font-bold font-mono">
                                SECTION C (4M)
                            </span>
                            <div className="text-sm font-semibold text-white leading-relaxed">
                                {selectedPreset.sampleQuestion}
                            </div>
                        </div>

                        {/* LaTeX Equation Box */}
                        <div className="p-3.5 rounded-xl bg-[#0E1424] border border-[#1E2640] font-mono text-xs text-[#00A4E4] overflow-x-auto flex items-center justify-between gap-4">
                            <span className="text-white/80 font-mono tracking-wide">{selectedPreset.equation}</span>
                            <span className="text-[10px] font-mono text-white/40 uppercase shrink-0">LaTeX Vector</span>
                        </div>

                        {/* Step-by-Step Rubric */}
                        <div className="p-3 rounded-lg bg-green-950/20 border border-green-500/30 text-xs text-green-300 font-mono-stamp flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                            <span>Step Marking Rubric: {selectedPreset.rubric}</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Cognitive Breakdown & Direct Launch */}
                <div className="rounded-2xl bg-[#000000]/80 border border-[#1E2640] p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                        <span className="text-[11px] font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider">
                            Bloom's Taxonomy Weights
                        </span>

                        <div className="space-y-2.5 text-xs font-mono-stamp">
                            <div>
                                <div className="flex justify-between text-white/80 mb-1">
                                    <span>Knowledge (Recall)</span>
                                    <span>{selectedPreset.taxonomy.knowledge}%</span>
                                </div>
                                <div className="h-1.5 bg-[#1E2640] rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedPreset.taxonomy.knowledge}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-white/80 mb-1">
                                    <span>Application (Problem Solving)</span>
                                    <span>{selectedPreset.taxonomy.application}%</span>
                                </div>
                                <div className="h-1.5 bg-[#1E2640] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedPreset.taxonomy.application}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-white/80 mb-1">
                                    <span>HOTS (Analysis & Synthesis)</span>
                                    <span>{selectedPreset.taxonomy.hots}%</span>
                                </div>
                                <div className="h-1.5 bg-[#1E2640] rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${selectedPreset.taxonomy.hots}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="w-full py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                        >
                            <span>Open Full Paper in Turbo</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
