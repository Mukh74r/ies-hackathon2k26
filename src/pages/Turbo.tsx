import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Database
} from 'lucide-react';
import TurboSidebar from '../components/turbo/TurboSidebar';
import TurboAISwitcher from '../components/turbo/TurboAISwitcher';
import QuestionPaperGenerator from '../components/turbo/tools/QuestionPaperGenerator';
import HomeworkCreator from '../components/turbo/tools/HomeworkCreator';
import LessonPlanBuilder from '../components/turbo/tools/LessonPlanBuilder';
import PPTGenerator from '../components/turbo/tools/PPTGenerator';
import PaperSolver from '../components/turbo/tools/PaperSolver';
import ReportCardAssistant from '../components/turbo/tools/ReportCardAssistant';
import DocumentSecretary from '../components/turbo/tools/DocumentSecretary';
import QuizShuffler from '../components/turbo/tools/QuizShuffler';
import SpeechGenerator from '../components/turbo/tools/SpeechGenerator';
import ToolStudio from '../components/turbo/tools/ToolStudio';
import DynamicTool from '../components/turbo/tools/DynamicTool';
import Library from '../components/turbo/dashboard/Library';
import TurboChat from '../components/turbo/dashboard/TurboChat';
import TurboWatchDial from '../components/turbo/TurboWatchDial';
import TurboAnalytics from '../components/turbo/tools/TurboAnalytics';
import GraphicsEngineeringTool from '../components/turbo/tools/GraphicsEngineeringTool';
import { apiEndpoint, getAuthHeaders } from '../utils/api';

interface CustomTool {
    toolId: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    outputLabel: string;
    outputFormat: 'text' | 'markdown';
    fields: any[];
    promptTemplate: string;
}

export default function Turbo() {
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [customTools, setCustomTools] = useState<CustomTool[]>([]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch custom tools so we can render DynamicTool when activePage = custom:<toolId>
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(apiEndpoint('/api/tool-studio/list'), {
                    headers: getAuthHeaders(),
                });
                const data = await res.json();
                if (data.success) setCustomTools(data.tools || []);
            } catch {}
        };
        load();
    }, []);

    const handleToolSaved = (tool: CustomTool) => {
        setCustomTools(prev => {
            const exists = prev.find(t => t.toolId === tool.toolId);
            return exists ? prev.map(t => t.toolId === tool.toolId ? tool : t) : [...prev, tool];
        });
    };

    const handleToolDeleted = (toolId: string) => {
        setCustomTools(prev => prev.filter(t => t.toolId !== toolId));
        setActivePage('tool-studio'); // Navigate away after delete
    };

    const isMobile = windowWidth < 1024;

    useEffect(() => {
        if (!isMobile) setIsMobileMenuOpen(false);
    }, [isMobile]);

    // Find active custom tool (if activePage = custom:<toolId>)
    const activeCustomTool = activePage.startsWith('custom:')
        ? customTools.find(t => t.toolId === activePage.replace('custom:', ''))
        : null;

    return (
        <div className="min-h-screen bg-[#020408] text-foreground font-sans selection:bg-cyan-500/30 overflow-hidden relative">

            {/* Sidebar - Hidden on mobile by default, behaves as a drawer */}
            <div className={`
        fixed inset-y-0 left-0 z-[110] transition-transform duration-500 ease-in-out
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
                <TurboSidebar
                    activePage={activePage}
                    setActivePage={(page: string) => { setActivePage(page); setIsMobileMenuOpen(false); }}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    customTools={customTools}
                />
            </div>

            {/* Mobile Backdrop for Sidebar Drawer */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* THE WATCH DIAL - Primary Mobile Nav */}
            {isMobile && <TurboWatchDial activePage={activePage} setActivePage={setActivePage} customTools={customTools} />}

            <div
                className={`
          transition-all duration-500 ease-in-out
          ${isMobile ? 'ml-0' : (collapsed ? 'ml-20' : 'ml-64')}
          h-screen relative flex flex-col overflow-hidden
        `}
            >
                {/* Global Neural Background Accents - Replaced with Mesh Gradient */}
                <div className="absolute inset-0 pointer-events-none z-0 bg-mesh opacity-80" />

                {/* AI Model Switcher - Floating Top Right Aligned with Navbar */}
                {!isMobile && (
                    <div className="fixed top-[1.2rem] right-6 z-[10001]">
                        <TurboAISwitcher />
                    </div>
                )}

                <main className={`
          flex-1 relative z-10 overflow-hidden flex flex-col items-center transition-all duration-500
          ${isMobile ? 'p-3 pt-20 pb-24' : 'p-6 pt-10'}
        `}>

                    <div className="w-full h-full max-w-[1400px]">
                        {activePage === 'dashboard' && <TurboChat />}

                        {activePage !== 'dashboard' && (
                            <div className={`w-full h-full glass-panel rounded-[2rem] overflow-hidden ${isMobile ? 'rounded-2xl' : ''}`}>
                                <div className={`w-full h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 ${isMobile ? 'p-4' : 'p-6'}`}>
                                    {activePage === 'library' && <Library />}
                                    {activePage === 'question-gen' && <QuestionPaperGenerator />}
                                    {activePage === 'homework' && <HomeworkCreator />}
                                    {activePage === 'lesson-plan' && <LessonPlanBuilder />}
                                    {activePage === 'ppt-gen' && <PPTGenerator />}
                                    {activePage === 'paper-solver' && <PaperSolver />}
                                    {activePage === 'report-assistant' && <ReportCardAssistant />}
                                    {activePage === 'secretary' && <DocumentSecretary />}
                                    {activePage === 'shuffler' && <QuizShuffler />}
                                    {activePage === 'speech-gen' && <SpeechGenerator />}
                                    {activePage === 'analytics' && <TurboAnalytics />}
                                    {activePage === 'graphics-tool' && <GraphicsEngineeringTool />}

                                    {/* Tool Studio builder */}
                                    {activePage === 'tool-studio' && (
                                        <ToolStudio
                                            onToolSaved={(tool) => {
                                                handleToolSaved(tool as CustomTool);
                                                // Navigate to the newly saved tool
                                                setTimeout(() => setActivePage(`custom:${tool.toolId}`), 500);
                                            }}
                                        />
                                    )}

                                    {/* Dynamic custom tool renderer */}
                                    {activeCustomTool && (
                                        <DynamicTool
                                            tool={activeCustomTool}
                                            onDelete={handleToolDeleted}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                </main>
            </div>
        </div>
    );
}
