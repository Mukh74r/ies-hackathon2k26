import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Database,
    Server,
    LayoutDashboard,
    Terminal,
    Lock,
    Globe,
    Cpu,
    ChevronRight,
    Radiation,
    FolderTree,
    FileCode,
    Folder,
    FileJson,
    Binary,
    ShieldCheck,
    Zap,
    Bug,
    Radio,
    MapPin,
    LucideIcon,
    Menu
} from "lucide-react";

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

// --- GLOBAL UI OVERLAYS (CRT & BASE EFFECTS) ---
const GlobalCyberOverlay: React.FC = () => (
    <style
        dangerouslySetInnerHTML={{
            __html: `
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    .crt-screen { position: relative; overflow: hidden; }
    .crt-screen::before {
      content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
                  linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      z-index: 10; background-size: 100% 3px, 3px 100%; pointer-events: none; opacity: 0.4;
    }
    .scanline { width: 100%; height: 2px; background: rgba(6, 182, 212, 0.1); position: absolute; animation: scanline 10s linear infinite; z-index: 11; pointer-events: none; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #06b6d4; border-radius: 10px; }
  `,
        }}
    />
);

interface SysStatus {
    threadLoad: string;
    latency: string;
}

export default function AdminHealth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [visitorIp, setVisitorIp] = useState("0.0.0.0"); // Global state for the whole OS
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedFile, setSelectedFile] = useState("src/App.jsx");
    const [sysStatus, setSysStatus] = useState<SysStatus>({ threadLoad: "0", latency: "0ms" });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => {
            setSysStatus({
                threadLoad: (Math.random() * 100).toFixed(2),
                latency: (Math.floor(Math.random() * 20) + 10) + "ms"
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

    return (
        <div className="flex h-screen bg-black text-cyan-500 font-mono overflow-hidden relative selection:bg-cyan-500 selection:text-black">
            <GlobalCyberOverlay />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={cn(
                "fixed lg:relative w-64 h-full bg-black border-r border-cyan-900/40 flex flex-col z-40 transition-transform duration-300 shadow-[5px_0_15px_rgba(0,0,0,0.8)]",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6 border-b border-cyan-900/30 bg-cyan-950/5">
                    <div className="flex items-center gap-3">
                        <Radiation className="animate-spin text-cyan-400" size={20} style={{ animationDuration: '10s' }} />
                        <span className="text-lg font-black tracking-tighter text-white uppercase italic">DEEPHUB_OS</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                        <span className="text-[7px] text-cyan-800 font-bold uppercase tracking-[0.4em]">v.4.0.2_SECURE</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <MenuBtn active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }} icon={LayoutDashboard} label="ROOT_DASH" />
                    <MenuBtn active={activeTab === "infrastructure"} onClick={() => { setActiveTab("infrastructure"); setIsSidebarOpen(false); }} icon={Server} label="NETWORK" />
                    <MenuBtn active={activeTab === "console"} onClick={() => { setActiveTab("console"); setIsSidebarOpen(false); }} icon={Bug} label="BUG_DETECTOR" />
                    <MenuBtn active={activeTab === "filesystem"} onClick={() => { setActiveTab("filesystem"); setIsSidebarOpen(false); }} icon={FolderTree} label="FS_EXPLORER" />
                </nav>

                <div className="p-6 border-t border-cyan-900/30">
                    <button onClick={() => setIsAuthenticated(false)} className="w-full p-2 text-red-900 hover:text-red-500 text-[10px] font-black border border-red-900/20 uppercase tracking-[0.3em] transition-all hover:bg-red-500/5">TERMINATE_LINK</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,_#020617_0%,_#000_100%)]">
                <div className="hidden">
                    <VisitorIntel onIpDetected={(ip) => setVisitorIp(ip)} />
                </div>

                <header className="h-16 border-b border-cyan-900/40 px-4 md:px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-cyan-500 border border-cyan-900/40 rounded hover:bg-cyan-950/20"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="flex items-center gap-2 md:gap-4 text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.5em] font-black uppercase">
                            <ChevronRight className="text-cyan-900 hidden sm:block" size={16} />
                            <span className="text-cyan-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] line-clamp-1">{activeTab}</span>
                        </div>
                    </div>
                    <div className="flex gap-8 text-[9px] font-bold">
                        <div className="text-right">
                            <p className="text-cyan-900 uppercase">Latency</p>
                            <p className="text-cyan-400">{sysStatus.latency}</p>
                        </div>
                        <div className="text-right border-l border-cyan-900/30 pl-8">
                            <p className="text-cyan-900 uppercase">Node_Time</p>
                            <p className="text-cyan-100">{new Date().toLocaleTimeString([], { hour12: false })}</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-hidden">
                    {activeTab === "overview" && (
                        <OverviewTab
                            visitorIp={visitorIp}
                        />
                    )}

                    {activeTab === "infrastructure" && (
                            <div className="h-full flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <PulseGraph label="PACKET_LOSS" />
                                    <PulseGraph label="BANDWIDTH_UTIL" />
                                    <div className="border border-cyan-900/30 bg-cyan-950/10 rounded flex items-center justify-center p-8 md:p-0">
                                        <Radio size={32} className="text-cyan-500 animate-ping" />
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <PingTerminal currentIp={visitorIp} />
                                </div>
                            </div>
                    )}

                    {activeTab === "console" && <BugDetectorTab />}
                    {activeTab === "filesystem" && <FileSystemTab selectedFile={selectedFile} onSelect={setSelectedFile} />}
                </div>
            </main>
        </div>
    );
}

interface LogEntry {
    id: number;
    type: "info" | "error" | "warn";
    msg: string;
    time: string;
}

// --- UPDATED: LIVE BUG DETECTOR (REPLACES TERMINAL) ---
function BugDetectorTab() {
    const [logs, setLogs] = useState<LogEntry[]>([
        {
            id: 1,
            type: "info",
            msg: "Debugger bridge initialized...",
            time: new Date().toLocaleTimeString(),
        },
        {
            id: 2,
            type: "info",
            msg: "Monitoring window.console for runtime exceptions...",
            time: new Date().toLocaleTimeString(),
        },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCapture = (type: "info" | "error" | "warn", args: any[]) => {
            setLogs((prev) => [
                ...prev.slice(-49),
                {
                    id: Date.now() + Math.random(),
                    type,
                    msg: args
                        .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
                        .join(" "),
                    time: new Date().toLocaleTimeString(),
                },
            ]);
        };

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            handleCapture("info", args);
            originalLog.apply(console, args);
        };
        console.error = (...args) => {
            handleCapture("error", args);
            originalError.apply(console, args);
        };
        console.warn = (...args) => {
            handleCapture("warn", args);
            originalWarn.apply(console, args);
        };

        const handleError = (event: ErrorEvent) => {
            handleCapture("error", [`Uncaught Exception: ${event.message} at ${event.lineno}`]);
        };

        window.addEventListener('error', handleError);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            window.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="h-full border border-cyan-500/20 bg-black/80 rounded-lg flex flex-col crt-screen">
            <div className="scanline" />
            <div className="p-3 bg-cyan-950/20 border-b border-cyan-900/30 flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                    <span className="text-[8px] font-black text-cyan-400 tracking-[0.2em] uppercase">
                        Runtime_Bug_Monitor
                    </span>
                </div>
                <button
                    onClick={() => setLogs([])}
                    className="text-[7px] text-cyan-900 hover:text-cyan-500 transition-colors uppercase font-bold"
                >
                    Flush_Logs
                </button>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 p-6 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar"
            >
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className={cn(
                            "p-2 border-l-2 flex gap-4 transition-all animate-in slide-in-from-left-2",
                            log.type === "error"
                                ? "border-red-600 bg-red-950/10 text-red-400"
                                : log.type === "warn"
                                    ? "border-yellow-600 bg-yellow-950/10 text-yellow-400"
                                    : "border-cyan-600 bg-cyan-950/10 text-cyan-400"
                        )}
                    >
                        <span className="opacity-30 whitespace-nowrap">[{log.time}]</span>
                        <span className="font-bold">[{log.type.toUpperCase()}]</span>
                        <span className="break-all">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface FSNode {
    name: string;
    path: string;
    type: "dir" | "file";
    code?: string;
    children?: FSNode[];
}

interface FileSystemTabProps {
    selectedFile: string;
    onSelect: (path: string) => void;
}

// --- FS_EXPLORER ---
function FileSystemTab({ selectedFile, onSelect }: FileSystemTabProps) {
    const [tree, setTree] = useState<FSNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const { apiEndpoint } = await import("../utils/api");
                const r = await fetch(apiEndpoint("/api/files"));
                const d = await r.json();
                setTree(d);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const getCode = (nodes: FSNode[], target: string): string => {
        let code = "// BUFFER_EMPTY: NO_DATA_RETRIEVED";
        const find = (items: FSNode[]) =>
            items.forEach((n) => {
                if (n.path === target) code = n.code || "";
                if (n.children) find(n.children);
            });
        find(nodes);
        return code;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-4 overflow-hidden animate-in fade-in duration-500">
            <div className="lg:col-span-1 border border-cyan-500/20 bg-cyan-950/10 rounded-tl-3xl rounded-bl-lg lg:rounded-bl-lg flex flex-col overflow-hidden max-h-[30vh] lg:max-h-none">
                <div className="p-4 border-b border-cyan-500/30 text-[10px] font-black tracking-widest text-cyan-100 uppercase italic">
                    Vault_Index
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {loading ? (
                        <div className="text-cyan-900 text-[10px] animate-pulse">
                            INIT_SCAN...
                        </div>
                    ) : (
                        renderTree(tree, selectedFile, onSelect)
                    )}
                </div>
            </div>
            <div className="lg:col-span-3 border border-cyan-500/30 bg-black/80 lg:rounded-tr-3xl rounded-br-lg flex flex-col overflow-hidden relative">
                <div className="p-3 border-b border-cyan-500/30 bg-cyan-900/10 flex justify-between px-4 lg:px-8 text-[9px] md:text-[10px] font-black text-cyan-400">
                    <span className="truncate">PATH: {selectedFile}</span>
                    <span className="text-cyan-900 hidden sm:block">SECURE_VIEW_MODE</span>
                </div>
                <div className="flex-1 overflow-auto bg-black/40">
                    <pre className="p-4 lg:p-10 text-[11px] md:text-[13px] text-cyan-300/60 leading-relaxed font-mono">
                        <code>{getCode(tree, selectedFile)}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}

const renderTree = (nodes: FSNode[], selected: string, onSelect: (path: string) => void) => {
    return nodes.map((node) =>
        node.type === "dir" ? (
            <details key={node.path} open className="group mb-1">
                <summary className="flex items-center gap-2 text-[10px] text-cyan-700 font-black uppercase p-2 cursor-pointer hover:text-cyan-400 list-none rounded-md">
                    <Folder size={12} className="group-open:text-cyan-400" />{" "}
                    <span>{node.name}</span>
                </summary>
                <div className="ml-4 border-l-2 border-cyan-950 pl-3">
                    {renderTree(node.children || [], selected, onSelect)}
                </div>
            </details>
        ) : (
            <button
                key={node.path}
                onClick={() => onSelect(node.path)}
                className={cn(
                    "w-full flex items-center gap-3 p-2 text-[9px] font-bold border-r-4 mb-1 text-left uppercase transition-all",
                    selected === node.path
                        ? "text-white border-cyan-400 bg-cyan-500/20"
                        : "text-cyan-900 border-transparent hover:text-cyan-500"
                )}
            >
                <FileCode size={11} /> <span className="truncate">{node.name}</span>
            </button>
        )
    );
};

// --- CORE DASHBOARD COMPONENTS ---
function PulseGraph({ label }: { label: string }) {
    const [points, setPoints] = useState<number[]>([
        20, 40, 30, 50, 45, 60, 55, 70, 65, 80,
    ]);
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints((p) => [...p.slice(1), Math.floor(Math.random() * 50) + 25]);
        }, 800);
        return () => clearInterval(interval);
    }, []);
    const pathData = points.map((p, i) => `${i * 20},${100 - p}`).join(" L ");
    return (
        <div className="border border-cyan-900/30 bg-black/40 p-6 rounded-lg relative overflow-hidden">
            <div className="flex justify-between mb-4 text-[8px] font-black text-cyan-900 uppercase">
                <span>{label}</span>
                <Activity size={12} className="text-cyan-500 animate-pulse" />
            </div>
            <svg viewBox="0 0 180 100" className="w-full h-16">
                <path
                    d={`M ${pathData}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                />
            </svg>
            <div className="mt-2 text-right text-xl font-black text-cyan-400">
                {points[points.length - 1]}%
            </div>
        </div>
    );
}

interface Ping {
    id: number;
    ip: string;
    time: string;
}

// --- NEW COMPONENT: PING STREAM (Replaces Radar) ---
function PingStream() {
    const [pings, setPings] = useState<Ping[]>([]);
    useEffect(() => {
        // Mock pings removed for real-time clarity
    }, []);
    return (
        <div className="h-full border border-cyan-900/30 bg-black/40 rounded-lg p-4 flex flex-col">
            <span className="text-[8px] text-cyan-500 font-black uppercase mb-3 border-b border-cyan-900/20 pb-2">
                Incoming_Pings
            </span>
            <div className="space-y-2">
                {pings.map((p) => (
                    <div
                        key={p.id}
                        className="flex justify-between text-[10px] font-mono"
                    >
                        <span className="text-white">{p.ip}</span>
                        <span className="text-cyan-900">{p.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- UPDATED OVERVIEW TAB ---
function OverviewTab({ visitorIp }: { visitorIp: string }) {
    return (
        <div className="flex flex-col h-full gap-6 animate-in slide-in-from-bottom-4 duration-700 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PulseGraph label="CORE_LOAD" />
                <PulseGraph label="NET_TRAFFIC" />
                <PingStream />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <VisitorIntel />
                <HardwareIntel />
            </div>
        </div>
    );
}

interface HWInfo {
    cores: number | string;
    ram: string;
    arch: string;
    gpu: string;
}

// --- NEW COMPONENT: HARDWARE INTEL ---
function HardwareIntel() {
    const [hw, setHw] = useState<HWInfo>({ cores: 0, ram: 0 + "GB", arch: "", gpu: "" });
    const [load, setLoad] = useState({ cpu: 0, gpu: 0 });

    useEffect(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        const debug = gl?.getExtension("WEBGL_debug_renderer_info");

        setHw({
            cores: navigator.hardwareConcurrency || "N/A",
            ram: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : "LOCKED",
            arch: navigator.userAgent.includes("x64") ? "x64" : "ARM",
            gpu: debug && gl
                ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)).split(" ").pop() || "GENERIC"
                : "GENERIC",
        });

        const interval = setInterval(() => {
            setLoad({
                cpu: Math.floor(Math.random() * 30) + 10,
                gpu: Math.floor(Math.random() * 20) + 5,
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="border border-cyan-900/30 p-6 bg-black/40 rounded flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <Cpu size={14} className="text-cyan-500" />
                <span className="text-[8px] text-cyan-100 font-black tracking-[0.3em] uppercase">
                    Architecture_Registry
                </span>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-cyan-950/20 p-2 border border-cyan-900/30">
                        <p className="text-[6px] text-cyan-700 uppercase">Cores</p>
                        <p className="text-lg font-black text-cyan-400">{hw.cores}</p>
                    </div>
                    <div className="bg-cyan-950/20 p-2 border border-cyan-900/30">
                        <p className="text-[6px] text-cyan-700 uppercase">RAM</p>
                        <p className="text-lg font-black text-cyan-400">{hw.ram}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[7px] font-black uppercase text-cyan-900">
                        <span>CPU_LOAD</span>
                        <span>{load.cpu}%</span>
                    </div>
                    <div className="h-1 bg-cyan-950 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500"
                            style={{ width: `${load.cpu}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[7px] font-black uppercase text-cyan-900">
                        <span>GPU_LOAD</span>
                        <span>{load.gpu}%</span>
                    </div>
                    <div className="h-1 bg-cyan-950 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-pink-600"
                            style={{ width: `${load.gpu}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MenuBtnProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

function MenuBtn({ active, onClick, icon: Icon, label }: MenuBtnProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-4 text-[10px] font-black border-l-2 mb-1 uppercase tracking-widest transition-all",
                active
                    ? "bg-cyan-500/10 text-white border-cyan-400"
                    : "text-cyan-900 border-transparent hover:text-cyan-500 hover:bg-white/5"
            )}
        >
            <Icon size={14} /> {label}
        </button>
    );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [creds, setCreds] = useState({ id: "", pass: "" });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (creds.id.toUpperCase() === "NIHAL" && creds.pass === "123") onLogin();
    };
    return (
        <div className="h-screen bg-black flex items-center justify-center font-mono crt-screen">
            <div className="scanline" />
            <div className="w-96 border-2 border-cyan-500/30 p-12 bg-black">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        className="w-full bg-cyan-950/20 border border-cyan-900/50 p-4 text-cyan-400 text-xs outline-none uppercase"
                        placeholder="IDENTITY"
                        onChange={(e) => setCreds({ ...creds, id: e.target.value })}
                    />
                    <input
                        type="password"
                        className="w-full bg-cyan-950/20 border border-cyan-900/50 p-4 text-cyan-400 text-xs outline-none"
                        placeholder="PASSKEY"
                        onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
                    />
                    <button className="w-full py-4 border border-cyan-500 text-cyan-500 text-[10px] font-black uppercase hover:bg-cyan-500 hover:text-black transition-colors">
                        Initialize
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- NEW COMPONENT: REAL-TIME IP INTEL ---
let globalIpCache: any = null;

function VisitorIntel({ onIpDetected }: { onIpDetected?: (ip: string) => void }) {
    const [data, setData] = useState(globalIpCache);
    const [loading, setLoading] = useState(!globalIpCache);

    useEffect(() => {
        if (globalIpCache) {
            if (onIpDetected) onIpDetected(globalIpCache.query);
            return;
        }

        const fetchIntel = async () => {
            try {
                const { apiEndpoint } = await import("../utils/api");
                const response = await fetch(apiEndpoint("/api/telemetry/intel"));
                const json = await response.json();
                
                globalIpCache = json;
                setData({
                    query: json.ip,
                    city: json.city,
                    country: json.country,
                    isp: json.isp
                });
                if (onIpDetected) onIpDetected(json.ip);
            } catch (err) {
                console.warn("TELEMETRY_OFFLINE: Using local loopback");
                const fallback = {
                    query: "127.0.0.1",
                    city: "Local",
                    country: "Internal",
                    isp: "System",
                };
                setData(fallback);
                if (onIpDetected) onIpDetected("127.0.0.1");
            } finally {
                setLoading(false);
            }
        };

        fetchIntel();
    }, [onIpDetected]);

    if (loading)
        return (
            <div className="col-span-2 h-full border border-cyan-900/30 bg-black/40 rounded-lg flex items-center justify-center font-black text-[8px] animate-pulse uppercase tracking-widest">
                Scanning_Network_Node...
            </div>
        );

    return (
        <div className="col-span-1 lg:col-span-2 border border-cyan-900/30 bg-black/60 p-4 md:p-6 rounded-lg relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity hidden sm:block">
                <Globe size={60} className="text-cyan-400" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                <span className="text-[9px] font-black text-cyan-100 tracking-[0.2em] md:tracking-[0.4em] uppercase">
                    Visitor_Origin_Protocol
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 relative z-10">
                <div className="border-b border-cyan-900/20 pb-2">
                    <p className="text-[7px] text-cyan-900 font-bold uppercase mb-1">
                        Entry_Point
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">{data?.query}</p>
                </div>
                <div className="border-b border-cyan-900/20 pb-2">
                    <p className="text-[7px] text-cyan-900 font-bold uppercase mb-1">
                        Location
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">
                        {data?.city}, {data?.country}
                    </p>
                </div>
                <div className="border-b border-cyan-900/20 pb-2">
                    <p className="text-[7px] text-cyan-900 font-bold uppercase mb-1">
                        Provider
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">
                        {data?.isp}
                    </p>
                </div>
                <div className="border-b border-cyan-900/20 pb-2">
                    <p className="text-[7px] text-cyan-900 font-bold uppercase mb-1">
                        Status
                    </p>
                    <p className="text-[11px] text-cyan-100 font-mono">
                        ENCRYPTED_TUNNEL
                    </p>
                </div>
            </div>
        </div>
    );
}

interface PacketLog {
    id: string;
    ip: string;
    status: string;
    content?: string; // NEW: Actual message content
    type: string;
    timestamp: string;
    latency: string;
}

// --- NEW COMPONENT: LIVE PING TERMINAL ---
function PingTerminal({ currentIp }: { currentIp: string }) {
    const [logs, setLogs] = useState<PacketLog[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((ip: string, status: string, type: string, content?: string) => {
        const newLog: PacketLog = {
            id: Math.random().toString(36).substr(2, 9),
            ip: ip || "0.0.0.0",
            status: status,
            content: content,
            type: type,
            timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
            latency: Math.floor(Math.random() * 45) + 5 + "ms",
        };
        setLogs((prev) => [...prev.slice(-25), newLog]);
    }, []);

    useEffect(() => {
        if (currentIp && currentIp !== "0.0.0.0") {
            addLog(currentIp, "HANDSHAKE_ESTABLISHED", "visitor");
        }

        // --- GLOBAL NEURAL FEED (SSE) ---
        // Allows monitoring users across any device/browser
        // Detect protocol/domain for SSE
        const setupSSE = async () => {
            const { apiEndpoint } = await import("../utils/api");
            const eventSource = new EventSource(apiEndpoint("/api/neural-feed"));
            
            console.log("AdminHealth: Connecting to global neural feed...");
            
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("Global neural activity detected:", data);
                    addLog(data.ip || "NEURAL_CORE", data.status, "neural", data.content);
                } catch (err) {
                    console.error("Failed to parse neural feed data:", err);
                }
            };
    
            eventSource.onerror = (err) => {
                console.error("Neural feed connection lost:", err);
                eventSource.close();
            };
            return eventSource;
        };

        const eventSourcePromise = setupSSE();
        
        return () => {
            eventSourcePromise.then(es => es.close());
        };
    }, [currentIp, addLog]);

    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="h-full border border-cyan-900/30 bg-black/80 rounded-lg flex flex-col overflow-hidden crt-screen">
            <div className="scanline" />
            <div className="p-3 border-b border-cyan-900/30 bg-cyan-950/20 flex justify-between items-center px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    Network_Packet_Stream
                </span>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto"
            >
                {logs.map((log) => (
                    <div key={log.id} className="mb-2 last:mb-0">
                        <div className="flex gap-4">
                            <span className="opacity-30">[{log.timestamp}]</span>
                            <span className={cn(
                                "font-bold", 
                                log.type === 'visitor' ? 'text-cyan-400' : 
                                log.type === 'neural' ? 'text-pink-500 animate-pulse' : 
                                'text-cyan-900'
                            )}>{log.status}</span>
                            <span className="flex-1 text-right opacity-50">{log.ip}</span>
                            <span className="text-cyan-100">{log.latency}</span>
                        </div>
                        {log.content && (
                            <div className="mt-1 ml-14 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-white/70 italic break-words max-w-[90%] font-sans text-[11px] leading-relaxed">
                                {log.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
