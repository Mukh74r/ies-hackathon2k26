import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Activity,
    Cpu,
    Gauge,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    RefreshCcw,
    ZapOff,
    BrainCircuit,
    TrendingUp,
    Clock,
    Database
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
    Cell
} from 'recharts';

const performanceData = [
    { time: '10:00', tps: 45, latency: 120 },
    { time: '10:05', tps: 52, latency: 98 },
    { time: '10:10', tps: 48, latency: 110 },
    { time: '10:15', tps: 65, latency: 85 },
    { time: '10:20', tps: 58, latency: 92 },
    { time: '10:25', tps: 72, latency: 78 },
    { time: '10:30', tps: 68, latency: 82 },
];

const modelEfficiency = [
    { name: 'Turbo V4 (70B)', value: 98, color: '#06b6d4' },
    { name: 'Llama 3 (8B)', value: 82, color: '#8b5cf6' },
    { name: 'GPT-3.5 Std', value: 74, color: '#6366f1' },
    { name: 'Mixtral 8x7B', value: 88, color: '#ec4899' },
];

const toolUsage = [
    { name: 'Homework', sessions: 142, color: '#06b6d4' },
    { name: 'PPT Gen', sessions: 98, color: '#8b5cf6' },
    { name: 'Q-Paper', sessions: 215, color: '#10b981' },
    { name: 'Lesson', sessions: 67, color: '#f59e0b' },
    { name: 'Solver', sessions: 189, color: '#ec4899' },
    { name: 'Shuffle', sessions: 54, color: '#6366f1' },
    { name: 'Report', sessions: 38, color: '#14b8a6' },
];

const MetricCard = ({ title, value, unit, icon: Icon, trend, color }: any) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 shadow-2xl transition-all duration-300"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Icon size={80} />
        </div>

        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl border`} style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</span>
        </div>

        <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
            <span className="text-xs font-bold text-white/20 mb-2 uppercase tracking-widest">{unit}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <ArrowUpRight size={10} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">{trend}</span>
            </div>
            <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Since last sync</span>
        </div>
    </motion.div>
);

const CustomTooltipStyle = {
    backgroundColor: 'rgba(2, 4, 8, 0.95)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: '11px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
};

export default function TurboAnalytics() {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Activity size={22} className="animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Neural Analytics</h2>
                    </div>
                    <p className="text-white/30 text-xs font-medium uppercase tracking-[0.3em] ml-1">Real-time performance monitoring & benchmarks</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-2 hover:bg-white/10">
                        <RefreshCcw size={14} /> Re-Sync
                    </button>
                    <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">System Live</span>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Processing Speed" value="72.4" unit="Tokens/s" icon={Zap} trend="+18.5%" color="#06b6d4" />
                <MetricCard title="Inference Latency" value="85" unit="ms/req" icon={Gauge} trend="-12.2%" color="#6366f1" />
                <MetricCard title="System Uptime" value="99.9" unit="Percent" icon={ShieldCheck} trend="+0.01%" color="#10b981" />
                <MetricCard title="Neural Load" value="42" unit="Percent" icon={Cpu} trend="-5.4%" color="#f59e0b" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latency & Throughput Chart */}
                <div className="lg:col-span-2 bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Throughput Velocity</h3>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">Neural bandwidth monitoring</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                            <span className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white">Realtime</span>
                            <span className="px-3 py-1.5 rounded-lg text-white/30 hover:text-white cursor-pointer transition-all">Historical</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#ffffff08" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#ffffff40' }} />
                                <YAxis stroke="#ffffff08" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#ffffff40' }} />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="tps" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorTps)" dot={false} activeDot={{ r: 5, fill: '#06b6d4' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Model Efficiency Benchmarks */}
                <div className="bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Efficiency</h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">Comparative Score (0-100)</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {modelEfficiency.map((model, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-white/60">{model.name}</span>
                                    <span className="text-white">{model.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${model.value}%` }}
                                        transition={{ duration: 1.5, delay: idx * 0.1, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: model.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-white/5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-2">Verdict</p>
                        <p className="text-xs text-white/40 leading-relaxed font-medium uppercase italic">
                            Turbo V4 is operating at <span className="text-cyan-400 font-bold">128% efficiency</span> compared to standard LLM benchmarks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tool Usage Bar Chart */}
            <div className="bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Tool Usage Distribution</h3>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">Sessions this month across all Turbo features</p>
                    </div>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={toolUsage} barSize={32}>
                            <XAxis dataKey="name" stroke="#ffffff08" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#ffffff40' }} />
                            <YAxis stroke="#ffffff08" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#ffffff40' }} />
                            <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="sessions" radius={[8, 8, 0, 0]}>
                                {toolUsage.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* System Status Table */}
            <div className="bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                        <Database size={24} />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Neural Node Status</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: RefreshCcw, label: 'Node Primary', status: 'Active & Distributed', color: 'cyan', dot: true },
                        { icon: Activity, label: 'Semantic Pulse', status: 'Optimum Sync (0.2ms)', color: 'indigo', dot: true },
                        { icon: ZapOff, label: 'Offline Buffers', status: 'Empty & Secure', color: 'violet', dot: false },
                    ].map(({ icon: Icon, label, status, color, dot }, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-${color}-500/30 transition-all cursor-default`}
                        >
                            <div className={`w-11 h-11 rounded-full bg-${color}-500/10 flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={`text-${color}-400`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
                                    {dot && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                </div>
                                <p className="text-xs font-bold text-white uppercase tracking-tight mt-0.5">{status}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
