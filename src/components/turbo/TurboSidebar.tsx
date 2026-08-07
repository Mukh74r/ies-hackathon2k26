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
        relative flex items-center gap-3 px-3 py-3 m-1 rounded-lg cursor-pointer transition-all duration-300 group
        ${active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }
        ${collapsed ? 'justify-center' : ''}
      `}
        >
            {Icon && <Icon size={20} className={`transition-all duration-300 ${active ? 'stroke-primary text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />}
            {emoji && <span className="text-lg">{emoji}</span>}

            {!collapsed && (
                <span className="text-sm font-medium tracking-wide truncate flex-1">
                    {label}
                </span>
            )}

            {!collapsed && badge && (
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                    {badge}
                </span>
            )}

            {/* Active Glow Effect */}
            {active && !collapsed && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-20" />
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-black/90 border border-white/10 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
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
        { id: 'dashboard', label: 'Turbo V4', icon: LayoutDashboard },
        { id: 'library', label: 'My Library', icon: Database },
        { id: 'question-gen', label: 'Question Generator', icon: FileText },
        { id: 'homework', label: 'Homework Creator', icon: BookOpen },
        { id: 'lesson-plan', label: 'Lesson Plan Builder', icon: Brain },
        { id: 'ppt-gen', label: 'PPT Generator', icon: Presentation },
        { id: 'paper-solver', label: 'Paper Solver', icon: ClipboardList },
        { id: 'report-assistant', label: 'Report Assistant', icon: BarChart3 },
        { id: 'secretary', label: 'The Secretary', icon: FileEdit },
        { id: 'shuffler', label: 'The Shuffler', icon: Shuffle },
        { id: 'speech-gen', label: 'Speech Generator', icon: Mic },
        { id: 'graphics-tool', label: 'Graphics Engineering', icon: Ruler, badge: 'NEW' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
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
        relative h-full bg-[#020408] border-r border-white/5
        transition-all duration-500 ease-in-out flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Sidebar Search Area */}
            {!collapsed && (
                <div className="px-4 py-4 border-b border-white/5">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Tools..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all font-medium"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Menu */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10">
                <div className="px-2 space-y-1">
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
