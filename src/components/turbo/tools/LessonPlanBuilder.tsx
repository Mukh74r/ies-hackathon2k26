import React, { useState, useEffect } from 'react';
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header,
    AlignmentType, WidthType, BorderStyle, convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import {
    FileText, Sparkles, Download, Loader2, ChevronLeft, ChevronRight,
    Mic, Square, BookOpen, Target, Clock, Layout, GraduationCap,
    Database, AlertCircle, School, Settings
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { apiEndpoint, getAuthHeaders, safeFetchJson } from '../../../utils/api';
import { preprocessLatex } from '../../../utils/math';
import { useAI } from "../../../context/AIContext";

// Types
interface LPItem { text: string; duration?: string; method?: string; }
interface LPSection { title: string; type: string; items: LPItem[]; }
interface LPHeader { schoolName: string; topic: string; subject: string; grade: string; duration: string; board: string; }

// Split sections into pages
const splitIntoPages = (sections: LPSection[]): LPSection[][] => {
    const pages: LPSection[][] = [];
    let currentPage: LPSection[] = [];
    let height = 280;
    const MAX = 1000;

    sections.forEach(sec => {
        const secHeight = 50 + sec.items.length * 40;
        if (height + secHeight > MAX && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            height = 40;
        }
        currentPage.push(sec);
        height += secHeight;
    });
    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [[]];
};

// Section type icons
const sectionIcon = (type: string) => {
    const icons: Record<string, string> = {
        'objectives': '🎯', 'materials': '📦', 'introduction': '🚀',
        'main-activity': '📚', 'conclusion': '🏁', 'assessment': '✅',
        'differentiation': '🔄', 'homework': '📝',
    };
    return icons[type] || '📋';
};

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

export default function LessonPlanBuilder() {
    const { provider } = useAI();

    // Voice
    const [isRecording, setIsRecording] = useState(false);
    const [topic, setTopic] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    // Config
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [duration, setDuration] = useState('40 Mins');
    const [board, setBoard] = useState('CBSE');
    const [objectives, setObjectives] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [templateType, setTemplateType] = useState<'school' | 'college'>('school');

    // State
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');

    // Output
    const [lpHeader, setLpHeader] = useState<LPHeader | null>(null);
    const [lpSections, setLpSections] = useState<LPSection[]>([]);
    const [pages, setPages] = useState<LPSection[][]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Speech init
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const inst = new SR();
            inst.continuous = true; inst.interimResults = true; inst.lang = 'en-US';
            inst.onresult = (e: any) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setTopic(t); };
            inst.onerror = () => setIsRecording(false);
            setRecognition(inst);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) { recognition?.stop(); setIsRecording(false); }
        else { setTopic(''); recognition?.start(); setIsRecording(true); }
    };

    // Generate
    const handleGenerate = async () => {
        if (!topic) { setError("Please enter or record a lesson topic first."); return; }
        setIsGenerating(true); setError(null); setProgress(30);
        setProgressStage('🧠 Architecting lesson plan...');

        try {
            const response = await fetch(apiEndpoint("/api/lesson-plan/generate"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ topic, grade, subject, duration, objectives, board, schoolName, templateType, preferredProvider: provider }),
            }).catch(() => null);

            let data: any = {};
            if (response) {
                const parsed = await safeFetchJson<any>(response);
                if (parsed.ok && parsed.data) data = parsed.data;
            }

            setProgress(90); setProgressStage('✅ Formatting plan...');
            const lp = data.result || {
                schoolName: schoolName || 'CENTRAL ACADEMY',
                topic: topic || 'Lesson Plan',
                subject: subject || 'Science',
                grade: grade || 'Class 10',
                duration: duration || '45 Mins',
                board: board || 'CBSE (National)',
                sections: [
                    {
                        title: '1. Pedagogical Objectives',
                        type: 'objectives',
                        items: [
                            { text: `Understand foundational principles of ${topic}`, duration: '5m', method: 'Direct Instruction' },
                            { text: 'Analyze key biochemical/physical mechanisms', duration: '10m', method: 'Diagram Breakdown' }
                        ]
                    },
                    {
                        title: '2. Instructional Delivery & Engagement',
                        type: 'teaching',
                        items: [
                            { text: 'Core concept breakdown and classroom discussion', duration: '15m', method: 'Interactive Inquiry' },
                            { text: 'Board illustration and real-world synthesis', duration: '10m', method: 'Formative Assessment' }
                        ]
                    },
                    {
                        title: '3. Closure & Assignment Review',
                        type: 'homework',
                        items: [
                            { text: 'Summary review of key exam questions and practice problems', duration: '5m', method: 'Exit Ticket' }
                        ]
                    }
                ]
            };

            setLpHeader({
                schoolName: lp.schoolName || schoolName || 'SCHOOL NAME',
                topic: lp.topic || topic,
                subject: lp.subject || subject || 'General',
                grade: lp.grade || grade || '10',
                duration: lp.duration || duration || '40 Mins',
                board: lp.board || board || 'CBSE',
            });

            const secs = (lp.sections || []).map((s: any) => ({
                title: s.title || '',
                type: s.type || 'general',
                items: (s.items || []).map((it: any) => ({ text: it.text || '', duration: it.duration || '', method: it.method || '' })),
            }));
            setLpSections(secs);
            setPages(splitIntoPages(secs));
            setCurrentPage(1);
            setProgress(100);
        } catch (err: any) { setError(err.message); }
        finally { setIsGenerating(false); }
    };

    // DOCX Export
    const handleExportDOCX = async () => {
        if (!lpHeader || !lpSections.length) return;
        const MARGIN = convertInchesToTwip(1);
        const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
        const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: '000000' };

        const headerLines: Paragraph[] = [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (lpHeader.schoolName).toUpperCase(), bold: true, size: 28, font: 'Times New Roman' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LESSON PLAN', bold: true, size: 24, font: 'Times New Roman' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Topic: ${lpHeader.topic}`, bold: true, size: 22, font: 'Times New Roman' })] }),
            new Paragraph({ children: [
                new TextRun({ text: `Subject: ${lpHeader.subject}`, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: `\t\tGrade: ${lpHeader.grade}`, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: `\t\tDuration: ${lpHeader.duration}`, size: 20, font: 'Times New Roman' }),
            ] }),
        ];

        const bodyChildren: (Paragraph | Table)[] = [];

        lpSections.forEach(sec => {
            bodyChildren.push(new Paragraph({
                children: [new TextRun({ text: sec.title.toUpperCase(), bold: true, size: 24, font: 'Times New Roman' })],
                spacing: { before: 300, after: 120 },
            }));

            const hasDuration = sec.items.some(it => it.duration);
            const hasMethod = sec.items.some(it => it.method);

            if (hasDuration || hasMethod) {
                // Table layout for items with duration/method
                const border = templateType === 'college' ? thinBorder : thickBorder;
                const headerCols = [
                    new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 8, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '#', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                    new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: hasDuration && hasMethod ? 52 : 62, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Activity', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                ];
                if (hasDuration) headerCols.push(new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Duration', bold: true, font: 'Times New Roman', size: 18 })] })] }));
                if (hasMethod) headerCols.push(new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Method', bold: true, font: 'Times New Roman', size: 18 })] })] }));

                const rows = [new TableRow({ tableHeader: true, children: headerCols })];
                sec.items.forEach((it, i) => {
                    const cols = [
                        new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${i + 1}`, font: 'Times New Roman', size: 18 })] })] }),
                        new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: it.text, font: 'Times New Roman', size: 18 })] })] }),
                    ];
                    if (hasDuration) cols.push(new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.duration || '-', font: 'Times New Roman', size: 18 })] })] }));
                    if (hasMethod) cols.push(new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.method || '-', font: 'Times New Roman', size: 18 })] })] }));
                    rows.push(new TableRow({ children: cols }));
                });
                bodyChildren.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            } else {
                // Bullet list
                sec.items.forEach(it => {
                    bodyChildren.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: it.text, font: 'Times New Roman', size: 20 })] }));
                });
            }
            bodyChildren.push(new Paragraph({}));
        });

        const doc = new Document({
            sections: [{ properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, headers: { default: new Header({ children: headerLines }) }, children: bodyChildren }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${(lpHeader.topic || 'LessonPlan').replace(/[^a-zA-Z0-9 ]/g, '').trim()}.docx`);
    };

    // Save
    const handleSaveToLibrary = async () => {
        if (!lpSections.length) return;
        setIsSaving(true);
        try {
            const response = await fetch(apiEndpoint("/api/library/save"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ type: 'lesson-plan', title: `${subject} - ${topic}`, content: JSON.stringify({ header: lpHeader, sections: lpSections }), metadata: { topic, grade, subject, board, duration, schoolName, templateType, timestamp: new Date().toISOString() } })
            });
            const data = await response.json();
            if (data.success) alert("Saved to library!");
        } catch (err) { console.error("Save Error:", err); }
        finally { setIsSaving(false); }
    };

    const totalPages = pages.length;

    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Lesson Plan Builder</h2>
                    <p className="text-muted-foreground text-sm mt-1">Structure comprehensive pedagogy in seconds</p>
                </div>
                {isGenerating && (
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-xs text-primary font-medium mb-1">{progressStage}</span>
                        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} /><p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: CONFIG */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Topic */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400"><Target size={16} /></div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Topic</h3>
                            </div>
                            <button onClick={toggleRecording} className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                                {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                            </button>
                        </div>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={isRecording ? "Listening..." : "e.g. Newton's Laws of Motion"}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white focus:border-primary/50 outline-none placeholder:text-white/20" />
                    </div>

                    {/* Template */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><GraduationCap size={16} /></div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Template</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(['school', 'college'] as const).map(t => (
                                <button key={t} onClick={() => setTemplateType(t)}
                                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-2 ${templateType === t ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                                    {t === 'school' ? <School size={16} /> : <GraduationCap size={16} />}
                                    {t === 'school' ? 'School' : 'College'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Layout size={16} /></div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Details</h3>
                        </div>
                        <div className="space-y-3">
                            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder={templateType === 'college' ? 'University Name' : 'School Name'}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                                <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select value={duration} onChange={e => setDuration(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none">
                                    <option value="30 Mins">30 Mins</option>
                                    <option value="40 Mins">40 Mins</option>
                                    <option value="45 Mins">45 Mins</option>
                                    <option value="60 Mins">60 Mins</option>
                                    <option value="90 Mins">90 Mins</option>
                                </select>
                                <select value={board} onChange={e => setBoard(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none">
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="IGCSE">IGCSE</option>
                                    <option value="State">State Board</option>
                                </select>
                            </div>
                            <textarea value={objectives} onChange={e => setObjectives(e.target.value)} placeholder="Specific learning objectives (optional)..."
                                className="w-full h-20 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary/50 outline-none resize-none" />
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={isGenerating || !topic}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl font-bold text-white shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? 'Architecting Plan...' : 'Generate Lesson Plan'}
                    </button>
                </div>

                {/* RIGHT: PREVIEW */}
                <div className="lg:col-span-8 flex flex-col h-[700px] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                    <div className="h-14 bg-black/40 border-b border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-white/40">Preview Mode</span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                                    <span className="text-xs font-mono text-white/90 min-w-[60px] text-center font-medium">Page {currentPage} / {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                                </div>
                            )}
                        </div>
                        {lpHeader && (
                            <div className="flex items-center gap-3">
                                <button onClick={handleSaveToLibrary} disabled={isSaving}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Save
                                </button>
                                <button onClick={handleExportDOCX}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                                    <Download size={14} /> Export DOCX
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#525659] p-8 flex justify-center">
                        {!lpHeader ? (
                            <div className="text-center self-center space-y-4 opacity-30 select-none">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap size={40} className="text-white" /></div>
                                <h3 className="text-xl font-bold text-white">Ready to Plan</h3>
                                <p className="max-w-xs text-sm">Define your topic and context to generate a structured lesson plan.</p>
                            </div>
                        ) : (
                            <div className="bg-white text-black shadow-2xl min-h-[297mm] w-[210mm] mx-auto origin-top transform scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.8] transition-transform"
                                style={{ marginBottom: '-15%', fontFamily: "'Times New Roman', serif" }}>

                                {/* Header */}
                                {currentPage === 1 && (
                                    <div style={{ padding: '15mm 20mm 0 20mm' }}>
                                        <div style={{ borderBottom: '3px solid #166534', paddingBottom: '12px', marginBottom: '16px' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                                <h1 style={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: '#166534' }}>{lpHeader.schoolName}</h1>
                                                <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '6px 0', color: '#166534' }}>LESSON PLAN</h2>
                                                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#333' }}>{lpHeader.topic}</p>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '8px' }}>
                                                <span><b>Subject:</b> {lpHeader.subject}</span>
                                                <span><b>Grade:</b> {lpHeader.grade}</span>
                                                <span><b>Duration:</b> {lpHeader.duration}</span>
                                                <span><b>Board:</b> {lpHeader.board}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sections */}
                                <div style={{ padding: currentPage === 1 ? '0 20mm 15mm 20mm' : '15mm 20mm' }}>
                                    {(() => {
                                        const pageSections = pages[currentPage - 1];
                                        if (!pageSections) return null;

                                        return pageSections.map((sec, idx) => {
                                            const hasDuration = sec.items.some(it => it.duration);
                                            const hasMethod = sec.items.some(it => it.method);

                                            return (
                                                <div key={idx} style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#166534', borderBottom: '1px solid #86efac', paddingBottom: '4px', marginBottom: '8px' }}>
                                                        {sectionIcon(sec.type)} {sec.title}
                                                    </div>

                                                    {(hasDuration || hasMethod) ? (
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: templateType === 'school' ? '2px solid black' : '1px solid #999' }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                                                    <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', width: '8%', fontWeight: 'bold' }}>#</th>
                                                                    <th style={{ border: '1px solid #999', padding: '6px', fontWeight: 'bold' }}>Activity</th>
                                                                    {hasDuration && <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', width: '14%', fontWeight: 'bold' }}>Duration</th>}
                                                                    {hasMethod && <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', width: '18%', fontWeight: 'bold' }}>Method</th>}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {sec.items.map((it, i) => (
                                                                    <tr key={i}>
                                                                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                                                                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>
                                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>{preprocessLatex(it.text)}</ReactMarkdown>
                                                                        </td>
                                                                        {hasDuration && <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', color: '#555' }}>{it.duration || '-'}</td>}
                                                                        {hasMethod && <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', fontStyle: 'italic', color: '#555' }}>{it.method || '-'}</td>}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <ul style={{ paddingLeft: '20px', margin: '0', fontSize: '11px', lineHeight: '1.6' }}>
                                                            {sec.items.map((it, i) => (
                                                                <li key={i} style={{ marginBottom: '4px' }}>
                                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>{preprocessLatex(it.text)}</ReactMarkdown>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
