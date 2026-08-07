import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Command,
    Zap,
    FileText,
    Brain,
    Cpu,
    BookOpen,
    HelpCircle,
    Newspaper,
    Shield,
    DollarSign,
    Sparkles,
    ArrowRight,
    X,
    Sliders
} from 'lucide-react';

interface CommandItem {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: any;
    path: string;
    badge?: string;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    const COMMANDS: CommandItem[] = [
        {
            id: 'turbo',
            title: 'Turbo Studio (Question Paper & Lesson Plan Generator)',
            description: 'Generate NEP 2020 question papers, lesson plans, PPTs & rubrics',
            category: 'Workspaces',
            icon: Zap,
            path: '/turbo',
            badge: 'Primary Tool'
        },
        {
            id: 'virtualbrain',
            title: 'VirtualBrain 3D Cognitive Explorer',
            description: 'Interactive neural network model & visual cognitive derivation',
            category: 'AI Labs',
            icon: Brain,
            path: '/virtualbrain',
            badge: '3D Lab'
        },
        {
            id: 'circuitbrain',
            title: 'CircuitBrain Robotics & Hardware Simulator',
            description: 'Explore robotic kits, microcontrollers & IoT simulations',
            category: 'AI Labs',
            icon: Cpu,
            path: '/circuitbrain',
            badge: 'Robotics'
        },
        {
            id: 'latest',
            title: 'Latest AI Updates & Breakthroughs',
            description: 'Real-time feed of reasoning models, EdTech news, and AI research',
            category: 'News & Insights',
            icon: Newspaper,
            path: '/latest',
            badge: 'Live Feed'
        },
        {
            id: 'pricing',
            title: 'Institutional Pricing & School Licensing',
            description: 'Teacher, Department, and Enterprise Multi-Campus Plans',
            category: 'Plans',
            icon: DollarSign,
            path: '/pricing',
            badge: 'Licensing'
        },
        {
            id: 'report',
            title: 'Help Centre & Issue Reporting',
            description: 'Submit platform feedback, request board additions, or report issues',
            category: 'Support',
            icon: HelpCircle,
            path: '/report-issue'
        },
        {
            id: 'terms',
            title: 'Terms of Use & Institutional Compliance',
            description: 'Data privacy, security guidelines, and academic integrity policies',
            category: 'Legal',
            icon: Shield,
            path: '/terms'
        },
        {
            id: 'privacy',
            title: 'Privacy Policy & Student Data Protection',
            description: 'FERPA & COPPA compliant encryption architecture',
            category: 'Legal',
            icon: Shield,
            path: '/privacy'
        }
    ];

    // Toggle on Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filtered = COMMANDS.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path: string) => {
        setIsOpen(false);
        setQuery('');
        navigate(path);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-settle">
            {/* Modal Box */}
            <div
                className="w-full max-w-2xl bg-[#0E1424] border border-[#1E2640] rounded-2xl shadow-2xl overflow-hidden text-white font-sans-academic relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Bar Input */}
                <div className="p-4 border-b border-[#1E2640] flex items-center gap-3 bg-[#000000]/60">
                    <Search size={18} className="text-[#00A4E4] shrink-0" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Type a command, board (CBSE, ICSE), or jump to tool... (Press ESC to exit)"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="w-full bg-transparent text-sm text-white placeholder-[#94A3B8] outline-none"
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-md bg-[#1E2640]/50 hover:bg-[#1E2640] text-[#94A3B8] hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Command Items List */}
                <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-[#1E2640]/30">
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#94A3B8] space-y-2">
                            <div>No matching workspaces or tools found for "{query}".</div>
                            <button
                                onClick={() => handleSelect('/turbo')}
                                className="px-4 py-1.5 rounded-lg bg-[#00A4E4]/10 text-[#00A4E4] border border-[#00A4E4]/30 text-xs font-semibold"
                            >
                                Open Turbo Studio instead
                            </button>
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const Icon = item.icon;
                            const isSelected = selectedIndex === idx;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item.path)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-[#00A4E4]/15 border border-[#00A4E4]/40 text-white'
                                            : 'hover:bg-white/[0.04] text-white/80 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#00A4E4] text-black' : 'bg-[#000000] text-[#00A4E4] border border-[#1E2640]'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white font-display truncate">
                                                    {item.title}
                                                </span>
                                                {item.badge && (
                                                    <span className="text-[9px] font-mono-stamp px-1.5 py-0.5 rounded bg-[#00A4E4]/10 border border-[#00A4E4]/30 text-[#00A4E4] font-semibold uppercase">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-[#94A3B8] font-mono uppercase">{item.category}</span>
                                        <ArrowRight size={14} className={isSelected ? 'text-[#00A4E4]' : 'text-white/20'} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Tip */}
                <div className="p-3 border-t border-[#1E2640] bg-[#000000]/60 flex items-center justify-between text-[10px] text-[#94A3B8] font-mono-stamp">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-[#1E2640] text-white">Cmd</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#1E2640] text-white">K</kbd> to toggle anytime
                    </span>
                    <span>DeepHub AI Fast Navigator</span>
                </div>
            </div>
        </div>
    );
}
