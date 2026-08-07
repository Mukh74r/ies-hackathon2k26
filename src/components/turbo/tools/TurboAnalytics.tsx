import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Activity,
    Cpu,
    Gauge,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCcw,
    BrainCircuit,
    TrendingUp,
    Clock,
    Database,
    Sliders,
    Award,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from 'recharts';

export default function TurboAnalytics() {
    const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'ytd'>('7d');

    const KPI_METRICS = [
        {
            title: 'Examination Paper Generation Velocity',
            value: '30.2s',
            unit: 'Avg / 80M Paper',
            delta: '+24.5%',
            positive: true,
            icon: Zap,
            color: '#00A4E4',
            benchmark: 'Industry Std: 4.5 hrs'
        },
        {
            title: 'NEP 2020 Bloom’s Cognitive Balance',
            value: '99.8%',
            unit: 'Strict 80/80 SLA',
            delta: '+4.2%',
            positive: true,
            icon: Sliders,
            color: '#10B981',
            benchmark: 'Target: 98.0%'
        },
        {
            title: 'LaTeX Formula & KaTeX Typesetting',
            value: '100%',
            unit: 'Vector Fidelity',
            delta: '0% Drift',
            positive: true,
            icon: Award,
            color: '#6E85D6',
            benchmark: 'Zero Math Syntax Glitches'
        },
        {
            title: 'Multi-Campus Institutional Adoption',
            value: '14,820',
            unit: 'Papers Derived',
            delta: '+31.8%',
            positive: true,
            icon: Database,
            color: '#F59E0B',
            benchmark: 'Across 480+ Schools'
        }
    ];

    const REALTIME_THROUGHPUT = [
        { time: '09:00', derivations: 420, latency: 68, accuracy: 99.8 },
        { time: '10:00', derivations: 680, latency: 74, accuracy: 99.9 },
        { time: '11:00', derivations: 890, latency: 82, accuracy: 99.7 },
        { time: '12:00', derivations: 1120, latency: 79, accuracy: 100 },
        { time: '13:00', derivations: 750, latency: 71, accuracy: 99.9 },
        { time: '14:00', derivations: 980, latency: 85, accuracy: 99.8 },
        { time: '15:00', derivations: 1340, latency: 88, accuracy: 100 },
        { time: '16:00', derivations: 1050, latency: 76, accuracy: 99.9 },
    ];

    const BLOOM_DISTRIBUTION = [
        { name: 'Knowledge & Recall', weight: 30, color: '#00A4E4' },
        { name: 'Application & Problem Solving', weight: 40, color: '#3B82F6' },
        { name: 'HOTS & Critical Synthesis', weight: 30, color: '#8B5CF6' }
    ];

    const BOARD_USAGE = [
        { board: 'CBSE 2026', count: 6420, percent: '43%' },
        { board: 'ICSE / ISC', count: 3890, percent: '26%' },
        { board: 'State Secondary', count: 2850, percent: '19%' },
        { board: 'Cambridge / IB', count: 1660, percent: '12%' },
    ];

    const AUDIT_LOGS = [
        { time: '10:48:12', status: 'healthy', msg: 'Cryptographic QR Seal Generation latency 14ms (100% Validated)' },
        { time: '10:42:05', status: 'healthy', msg: 'CBSE Class 12 Physics derivation engine warm cache synced' },
        { time: '10:35:19', status: 'healthy', msg: '11 Indian Language neural translation models verified with 0% pedagogical drift' },
        { time: '10:21:40', status: 'healthy', msg: 'Automated 80-mark blueprint balance check passed with 0 errors' }
    ];

    return (
        <div className="space-y-8 animate-settle pb-12 font-sans-academic text-white">
            {/* ── HEADER & TIMEFRAME SELECTOR ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2640]">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-mono-stamp text-[#00A4E4] uppercase font-bold tracking-wider mb-1">
                        <Activity size={14} className="animate-pulse" />
                        <span>Executive Academic Analytics & KPI Center</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                        Performance & SLA Governance
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8] font-sans-academic">
                        Real-time neural telemetry, curriculum balancing accuracy, and institutional examination throughput.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-[#000000] p-1 border border-[#1E2640]">
                        {(['today', '7d', '30d', 'ytd'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                                    timeframe === tf
                                        ? 'bg-[#00A4E4] text-black font-bold shadow-md shadow-[#00A4E4]/20'
                                        : 'text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                {tf === 'ytd' ? '2026 YTD' : tf}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => alert('Exporting full institutional audit report (PDF/JSON)...')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0E1424] hover:bg-[#1E2640] border border-[#1E2640] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                        <Download size={14} />
                        <span>Export SLA</span>
                    </button>
                </div>
            </div>

            {/* ── 1. STRATEGIC EXECUTIVE KPI CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {KPI_METRICS.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            className="p-5 rounded-2xl bg-[#0E1424]/90 backdrop-blur-md border border-[#1E2640] hover:border-[#00A4E4] transition-all shadow-xl flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="p-2.5 rounded-xl border"
                                        style={{ backgroundColor: `${kpi.color}15`, borderColor: `${kpi.color}30` }}
                                    >
                                        <Icon size={18} style={{ color: kpi.color }} />
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-mono-stamp text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                        <ArrowUpRight size={12} />
                                        <span>{kpi.delta}</span>
                                    </span>
                                </div>

                                <div>
                                    <div className="text-[11px] text-[#94A3B8] font-mono-stamp uppercase font-semibold">
                                        {kpi.title}
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-3xl font-bold font-display text-white">{kpi.value}</span>
                                        <span className="text-xs font-mono text-white/50">{kpi.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#1E2640] text-[10px] font-mono-stamp text-[#94A3B8] flex items-center justify-between">
                                <span>{kpi.benchmark}</span>
                                <CheckCircle2 size={12} className="text-[#00A4E4]" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── 2. REAL-TIME THROUGHPUT & LATENCY CHARTS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Paper Derivations Area Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0E1424]/90 border border-[#1E2640] shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white font-display">
                                Examination Derivation Volume & SLA
                            </h3>
                            <p className="text-xs text-[#94A3B8]">
                                Hourly question papers compiled across all 11 Indian board mediums
                            </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono-stamp font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>1,340 Peak/hr</span>
                        </span>
                    </div>

                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REALTIME_THROUGHPUT} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDeriv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00A4E4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#00A4E4" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                                <YAxis stroke="#64748B" fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000000',
                                        border: '1px solid #1E2640',
                                        borderRadius: '0.75rem',
                                        fontSize: '12px',
                                        color: '#FFFFFF'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="derivations"
                                    stroke="#00A4E4"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorDeriv)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Col: Bloom's Cognitive Weights Breakdown */}
                <div className="p-6 rounded-2xl bg-[#0E1424]/90 border border-[#1E2640] shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-white font-display">
                            NEP 2020 Cognitive Balance
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                            Strict 80-mark curriculum distribution
                        </p>
                    </div>

                    <div className="space-y-4">
                        {BLOOM_DISTRIBUTION.map((item, idx) => (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-mono-stamp">
                                    <span className="text-white">{item.name}</span>
                                    <span className="font-bold text-[#00A4E4]">{item.weight}%</span>
                                </div>
                                <div className="h-2 w-full bg-[#000000] rounded-full overflow-hidden border border-[#1E2640]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${item.weight}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 rounded-xl bg-[#000000]/60 border border-[#1E2640] text-xs font-mono-stamp text-emerald-400 flex items-center gap-2">
                        <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                        <span>100% Verified against CBSE & ICSE 2026 Circulars</span>
                    </div>
                </div>
            </div>

            {/* ── 3. BOARD ADOPTION & REAL-TIME AUDIT FEED ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Board Adoption Breakdown */}
                <div className="p-6 rounded-2xl bg-[#0E1424]/90 border border-[#1E2640] shadow-xl space-y-4">
                    <h3 className="text-base font-bold text-white font-display">
                        Examinations by Education Board
                    </h3>
                    <div className="space-y-3">
                        {BOARD_USAGE.map((board, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-[#000000]/60 border border-[#1E2640] flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A4E4]" />
                                    <span className="text-xs font-bold text-white font-mono-stamp">{board.board}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-mono-stamp">
                                    <span className="text-[#94A3B8]">{board.count.toLocaleString()} papers</span>
                                    <span className="px-2 py-0.5 rounded bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-[#00A4E4] font-bold">
                                        {board.percent}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-time Incident & Telemetry Stream */}
                <div className="p-6 rounded-2xl bg-[#0E1424]/90 border border-[#1E2640] shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white font-display">
                            Real-Time System Audit Stream
                        </h3>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Telemetry Active</span>
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {AUDIT_LOGS.map((log, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-[#000000]/60 border border-[#1E2640] flex items-start gap-3 text-xs font-mono-stamp"
                            >
                                <span className="text-white/40 shrink-0 text-[11px]">{log.time}</span>
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                <span className="text-[#94A3B8] leading-relaxed">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
