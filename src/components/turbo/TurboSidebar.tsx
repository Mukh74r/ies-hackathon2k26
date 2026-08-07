import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    FileText,
    Presentation,
    ClipboardList,
    Database,
    Settings,
    Brain,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    FileEdit,
    Shuffle,
    Search,
    Mic,
    Wand2,
    Plus,
    Ruler,
    LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../../assets/brand-logo-main.svg';
import { apiEndpoint, getAuthHeaders } from '../../utils/api';

interface SidebarItemProps {
    icon?: LucideIcon;
    emoji?: string;
    label: string;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
    badge?: string;
}

const SidebarItem = ({ icon: Icon, emoji, label, active, collapsed, onClick, badge }: SidebarItemProps) => {
    return (
        <div
            onClick={onClick}
            className={`
                relative flex items-center gap-3 px-3 py-2.5 my-0.5 cursor-pointer transition-colors group font-sans-academic
                ${active
                    ? 'bg-[#FDFAF3] text-[#A6522C] border-l-4 border-[#A6522C] font-bold'
                    : 'text-[#6B5D4F] hover:bg-[#EFE8D8] hover:text-[#2B211A]'
                }
                ${collapsed ? 'justify-center' : ''}
            `}
        >
            {Icon && <Icon size={18} className={`${active ? 'text-[#A6522C]' : 'text-[#6B5D4F] group-hover:text-[#2B211A]'}`} />}
            {emoji && <span className="text-sm">{emoji}</span>}

            {!collapsed && (
                <span className="text-xs tracking-wide truncate flex-1">
                    {label}
                </span>
            )}

            {!collapsed && badge && (
                <span className="text-[9px] font-mono-stamp uppercase tracking-wider px-1 py-0.5 border border-[#8A6D3B]/40 bg-[#8A6D3B]/10 text-[#8A6D3B] rounded-sm">
                    {badge}
                </span>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#FDFAF3] border border-[#D8CBB0] text-xs text-[#2B211A] shadow-sm rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none font-sans-academic">
                    {label}
                </div>
            )}
        </div>
    );
};

interface TurboSidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

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

    const menuItems: { id: string; label: string; icon?: LucideIcon; badge?: string }[] = [
        { id: 'dashboard', label: 'Overview Sheet', icon: LayoutDashboard },
        { id: 'question-gen', label: 'Question Generator', icon: FileText },
        { id: 'lesson-plan', label: 'Lesson Plan Builder', icon: Brain },
        { id: 'ppt-gen', label: 'PPT Creator', icon: Presentation },
        { id: 'homework', label: 'Homework Creator', icon: BookOpen },
        { id: 'paper-solver', label: 'Paper Solver', icon: ClipboardList },
        { id: 'library', label: 'My Library', icon: Database },
        { id: 'report-assistant', label: 'Report Assistant', icon: BarChart3 },
        { id: 'secretary', label: 'The Secretary', icon: FileEdit },
        { id: 'shuffler', label: 'Quiz Shuffler', icon: Shuffle },
        { id: 'speech-gen', label: 'Speech Generator', icon: Mic },
        { id: 'graphics-tool', label: 'Graphics Engineering', icon: Ruler },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.label?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomTools = customTools.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside
            className={`
                relative h-full bg-[#F7F1E3] border-r border-[#D8CBB0]
                transition-all duration-300 ease-in-out flex flex-col
                ${collapsed ? 'w-16' : 'w-60'}
            `}
        >
            {/* Sidebar Search Area */}
            {!collapsed && (
                <div className="px-3 py-3 border-b border-[#D8CBB0] bg-[#FDFAF3]">
                    <div className="relative group">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B5D4F]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find Tool..."
                            className="w-full bg-[#F7F1E3] border border-[#D8CBB0] rounded-sm py-1.5 pl-8 pr-2 text-xs text-[#2B211A] placeholder:text-[#6B5D4F] focus:outline-none focus:border-[#A6522C] font-sans-academic"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Ruled Notebook Margin */}
            <div className="flex-1 overflow-y-auto py-2">
                <div className="space-y-0.5">
                    {filteredMenuItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activePage === item.id}
                            collapsed={collapsed}
                            onClick={() => setActivePage(item.id)}
                            badge={item.badge}
                        />
                    ))}

                    {/* ── Tool Studio + tree of custom tools ── */}
                    <SidebarItem
                        icon={Wand2}
                        label="Tool Studio"
                        active={activePage === 'tool-studio'}
                        collapsed={collapsed}
                        onClick={() => setActivePage('tool-studio')}
                        badge={filteredCustomTools.length > 0 ? undefined : 'NEW'}
                    />

                    {/* Custom tools as indented tree children */}
                    {!collapsed && filteredCustomTools.length > 0 && (
                        <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                            {filteredCustomTools.map((tool, idx) => {
                                const isLast = idx === filteredCustomTools.length - 1;
                                const isActive = activePage === `custom:${tool.toolId}`;
                                return (
                                    <div key={tool.toolId} className="relative">
                                        {/* L-connector line */}
                                        <div className="absolute -left-3 top-1/2 w-3 h-px bg-white/10" />
                                        <button
                                            onClick={() => setActivePage(`custom:${tool.toolId}`)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all group ${
                                                isActive
                                                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="text-base leading-none">{tool.icon}</span>
                                            <span className="text-[11px] font-medium truncate flex-1">{tool.name}</span>
                                        </button>
                                    </div>
                                );
                            })}
                            {/* + New Tool shortcut at the bottom of the tree */}
                            <div className="relative">
                                <div className="absolute -left-3 top-1/2 w-3 h-px bg-white/10" />
                                <button
                                    onClick={() => setActivePage('tool-studio')}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-white/25 hover:text-cyan-400 hover:bg-white/5"
                                >
                                    <Plus size={11} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">New Tool</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Collapsed state: show custom tools as emoji-only icons */}
                    {collapsed && filteredCustomTools.map(tool => (
                        <SidebarItem
                            key={tool.toolId}
                            emoji={tool.icon}
                            label={tool.name}
                            active={activePage === `custom:${tool.toolId}`}
                            collapsed={collapsed}
                            onClick={() => setActivePage(`custom:${tool.toolId}`)}
                        />
                    ))}
                </div>
            </div>


            {/* Collapse Toggle */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}
