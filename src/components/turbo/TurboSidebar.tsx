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
    LucideIcon
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

    const coreTools: { id: string; label: string; icon: LucideIcon }[] = [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'question-gen', label: 'Question Paper Generator', icon: FileText },
        { id: 'lesson-plan', label: 'Lesson Plan Builder', icon: Brain },
        { id: 'ppt-gen', label: 'PPT Creator', icon: Presentation },
        { id: 'paper-solver', label: 'Paper Solver', icon: ClipboardList },
        { id: 'shuffler', label: 'Quiz Shuffler', icon: Shuffle },
        { id: 'speech-gen', label: 'Speech Generator', icon: Mic },
        { id: 'library', label: 'My Library', icon: Database },
        { id: 'tool-studio', label: 'Tool Studio', icon: Wand2 },
    ];

    const filteredTools = coreTools.filter(t =>
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
            {/* Sidebar Search */}
            {!collapsed && (
                <div className="p-3 border-b border-[var(--border)] bg-[var(--background)]">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter tools..."
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md py-1.5 pl-8 pr-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] font-sans-academic"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Tool Items */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                {filteredTools.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`
                                relative flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
                                font-sans-academic text-xs font-medium sidebar-nav-item
                                ${isActive
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border-l-[3px] border-[var(--primary)] shadow-2xs'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border-l-[3px] border-transparent'
                                }
                                ${collapsed ? 'justify-center px-2' : ''}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                            {!collapsed && (
                                <span className="truncate tracking-wide">{item.label}</span>
                            )}
                        </div>
                    );
                })}

                {/* Custom Tools if any */}
                {!collapsed && customTools.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-[var(--border)]">
                        <div className="px-3 pb-1 text-[10px] uppercase font-mono-stamp text-[var(--muted-foreground)]">
                            Custom Tools
                        </div>
                        {customTools.map(ct => {
                            const isCtActive = activePage === `custom:${ct.toolId}`;
                            return (
                                <div
                                    key={ct.toolId}
                                    onClick={() => setActivePage(`custom:${ct.toolId}`)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs
                                        ${isCtActive
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border-l-[3px] border-[var(--primary)]'
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border-l-[3px] border-transparent'
                                        }
                                    `}
                                >
                                    <span>{ct.icon}</span>
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
                    className="w-full flex items-center justify-center p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-xs font-mono-stamp gap-1.5"
                >
                    {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> <span>Collapse</span></>}
                </button>
            </div>
        </aside>
    );
}
