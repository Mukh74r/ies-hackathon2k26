import React, { useState } from 'react';
import {
    FileText,
    Brain,
    Presentation,
    ClipboardList,
    Database,
    Shuffle,
    Mic,
    Wand2,
    Search,
    ChevronLeft,
    ChevronRight,
    Plus,
    LayoutDashboard,
    LucideIcon,
    Sparkles,
    GraduationCap,
    School,
    HelpCircle
} from 'lucide-react';

interface CustomTool {
    toolId: string;
    name: string;
    icon: string;
}

interface TurboSidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    customTools: CustomTool[];
}

export default function TurboSidebar({ activePage, setActivePage, collapsed, setCollapsed, customTools }: TurboSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suiteMode, setSuiteMode] = useState<'educator' | 'student'>('educator');

    // Educator Suite Tools
    const educatorTools: { id: string; label: string; icon: LucideIcon }[] = [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'prompt-optimizer', label: 'Prompt Optimizer', icon: Sparkles },
        { id: 'question-gen', label: 'Question Paper Generator', icon: FileText },
        { id: 'lesson-plan', label: '45-Min Lesson Builder', icon: Brain },
        { id: 'ppt-gen', label: 'PPT Creator Deck', icon: Presentation },
        { id: 'paper-solver', label: 'Paper & Step Solver', icon: ClipboardList },
        { id: 'secretary', label: 'Document Secretary', icon: School },
        { id: 'shuffler', label: 'Quiz Shuffler', icon: Shuffle },
        { id: 'speech-gen', label: 'Speech Generator', icon: Mic },
        { id: 'library', label: 'My Library', icon: Database },
        { id: 'tool-studio', label: 'Tool Studio', icon: Wand2 },
    ];

    // Student Studio Tools
    const studentTools: { id: string; label: string; icon: LucideIcon }[] = [
        { id: 'student-studio', label: 'Student Learning Lab', icon: GraduationCap },
        { id: 'prompt-optimizer', label: 'Prompt Optimizer', icon: Sparkles },
        { id: 'paper-solver', label: 'Socratic Step Solver', icon: ClipboardList },
        { id: 'shuffler', label: 'Quiz Practice Shuffler', icon: Shuffle },
        { id: 'library', label: 'My Study Notes', icon: Database },
    ];

    const currentTools = suiteMode === 'educator' ? educatorTools : studentTools;

    const filteredTools = currentTools.filter(t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside
            className={`
                relative h-full bg-[var(--card)] border-r border-[var(--border)]
                transition-all duration-300 ease-in-out flex flex-col z-20 select-none
                ${collapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* Suite Mode Switcher: Educator Suite vs Student Studio */}
            {!collapsed ? (
                <div className="p-3 border-b border-[var(--border)] bg-[#080C14]">
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl text-xs font-mono-stamp font-bold">
                        <button
                            type="button"
                            onClick={() => {
                                setSuiteMode('educator');
                                if (activePage === 'student-studio') setActivePage('dashboard');
                            }}
                            className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                suiteMode === 'educator'
                                    ? 'bg-cyan-500 text-black shadow-sm font-black'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <School size={14} />
                            <span>Educator</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSuiteMode('student');
                                setActivePage('student-studio');
                            }}
                            className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                suiteMode === 'student'
                                    ? 'bg-blue-600 text-white shadow-sm font-black'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <GraduationCap size={14} />
                            <span>Student</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-2.5 border-b border-[var(--border)] flex justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            const next = suiteMode === 'educator' ? 'student' : 'educator';
                            setSuiteMode(next);
                            if (next === 'student') setActivePage('student-studio');
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400"
                        title={suiteMode === 'educator' ? 'Switch to Student Studio' : 'Switch to Educator Suite'}
                    >
                        {suiteMode === 'educator' ? <School size={18} /> : <GraduationCap size={18} />}
                    </button>
                </div>
            )}

            {/* Sidebar Search */}
            {!collapsed && (
                <div className="p-3 border-b border-[var(--border)] bg-[var(--background)]">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter tools..."
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] font-sans-academic"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Tool Items */}
            <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1.5 custom-scrollbar">
                {filteredTools.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`
                                relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl cursor-pointer
                                font-sans-academic text-sm font-medium sidebar-nav-item transition-all
                                ${isActive
                                    ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-bold border-l-[3px] border-[var(--primary)] shadow-sm'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 border-l-[3px] border-transparent'
                                }
                                ${collapsed ? 'justify-center px-2 py-3' : ''}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                            {!collapsed && (
                                <span className="truncate tracking-wide">{item.label}</span>
                            )}
                        </div>
                    );
                })}

                {/* Custom Tools if any */}
                {!collapsed && customTools.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-[var(--border)]">
                        <div className="px-3 pb-1.5 text-xs uppercase font-mono-stamp text-[var(--muted-foreground)] font-bold">
                            Custom Tools
                        </div>
                        {customTools.map(ct => {
                            const isCtActive = activePage === `custom:${ct.toolId}`;
                            return (
                                <div
                                    key={ct.toolId}
                                    onClick={() => setActivePage(`custom:${ct.toolId}`)}
                                    className={`
                                        flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer text-sm font-medium
                                        ${isCtActive
                                            ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-bold border-l-[3px] border-[var(--primary)]'
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 border-l-[3px] border-transparent'
                                        }
                                    `}
                                >
                                    <span className="text-base">{ct.icon}</span>
                                    <span className="truncate">{ct.name}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Collapse / Expand Toggle */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center py-2 px-3 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-xs font-mono-stamp gap-2 font-bold cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse Navigation</span></>}
                </button>
            </div>
        </aside>
    );
}
