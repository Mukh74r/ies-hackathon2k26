import React, { useState, useEffect } from 'react';
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header,
    AlignmentType, WidthType, BorderStyle, convertInchesToTwip, ImageRun
} from 'docx';
import { saveAs } from 'file-saver';
import {
    FileText, Trash2, Sparkles, Download, Loader2, ChevronLeft, ChevronRight,
    Mic, Square, Calendar, BookOpen, Target, Plus, AlertCircle, Database,
    GraduationCap, School, Settings
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { apiEndpoint, getAuthHeaders, safeFetchJson, turboBrain, useTurboBrain } from '../../../utils/api';
import { preprocessLatex } from '../../../utils/math';
import { useAI } from "../../../context/AIContext";

// ── TYPES ─────────────────────────────────────────────────────────────────
interface HWSection {
    id: number;
    name: string;
    taskCount: number;
    marks: number;
    type: string;
}

interface HWQuestion {
    text: string;
    marks: number;
    options?: string[];
    sectionName: string;
    sectionDescription: string;
    sectionType: string;
    qNo: number;
}

interface HWPage {
    questions: HWQuestion[];
}

interface HWHeader {
    schoolName: string;
    assignmentTitle: string;
    subject: string;
    grade: string;
    dueDate: string;
    instructions: string[];
}

// Strip option prefix (from QPG)
const stripOptionPrefix = (s: string) =>
    s.replace(/^\s*[A-Da-d][.):]\s*/, '').replace(/^\s*\([A-Da-d]\)\s*/, '').trim();

// ── HOMEWORK TYPES ─────────────────────────────────────────────────────
const TASK_TYPES = [
    { value: 'practice', label: 'Practice Exercises' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'fill-blanks', label: 'Fill in the Blanks' },
    { value: 'word-problems', label: 'Word Problems' },
    { value: 'critical-thinking', label: 'Critical Thinking' },
    { value: 'mcq', label: 'Multiple Choice' },
];

// ── PAGINATION ────────────────────────────────────────────────────────
const splitIntoPages = (questions: HWQuestion[]): HWPage[] => {
    const pages: HWPage[] = [];
    let currentPageQuestions: HWQuestion[] = [];
    let currentHeight = 280; // header height
    const MAX_HEIGHT = 1000;

    questions.forEach(q => {
        const qHeight = 60 + (q.text.length * 0.3) + (q.options ? q.options.length * 25 : 0);
        if (currentHeight + qHeight > MAX_HEIGHT && currentPageQuestions.length > 0) {
            pages.push({ questions: currentPageQuestions });
            currentPageQuestions = [];
            currentHeight = 40;
        }
        currentPageQuestions.push(q);
        currentHeight += qHeight;
    });

    if (currentPageQuestions.length > 0) {
        pages.push({ questions: currentPageQuestions });
    }

    return pages.length > 0 ? pages : [{ questions: [] }];
};

// ── Speech Recognition ────────────────────────────────────────────────
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// ─── COMPONENT ──────────────────────────────────────────────────────────
export default function HomeworkCreator() {
    const { provider } = useAI();
    const { recentMemories: brainMemories, rememberPrompt: cacheInTurboBrain } = useTurboBrain('homework-creator');

    // Voice
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    // Config
    const [schoolName, setSchoolName] = useState('');
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('10');
    const [dueDate, setDueDate] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [templateType, setTemplateType] = useState<'school' | 'college'>('school');

    // Sections (QPG-style)
    const [sections, setSections] = useState<HWSection[]>([
        { id: 1, name: 'Part A', taskCount: 5, marks: 2, type: 'practice' },
        { id: 2, name: 'Part B', taskCount: 3, marks: 5, type: 'short-answer' },
    ]);

    // Generation
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');

    // Output
    const [paperHeader, setPaperHeader] = useState<HWHeader | null>(null);
    const [paperPages, setPaperPages] = useState<HWPage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // ── Speech Recognition Init ────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const inst = new SR();
            inst.continuous = true;
            inst.interimResults = true;
            inst.lang = 'en-US';
            inst.onresult = (event: any) => {
                let t = '';
                for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
                setTranscript(t);
            };
            inst.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };
            setRecognition(inst);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) { recognition?.stop(); setIsRecording(false); }
        else { setTranscript(''); recognition?.start(); setIsRecording(true); }
    };

    // ── Section Config ────────────────────────────────
    const addSection = () => {
        const newId = Math.max(...sections.map(s => s.id), 0) + 1;
        setSections([...sections, { id: newId, name: `Part ${String.fromCharCode(64 + newId)}`, taskCount: 5, marks: 2, type: 'practice' }]);
    };
    const removeSection = (id: number) => { if (sections.length > 1) setSections(sections.filter(s => s.id !== id)); };
    const updateSection = (id: number, field: keyof HWSection, value: any) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // ── GENERATE ──────────────────────────────────────
    const handleGenerate = async () => {
        if (!transcript) { setError("Please record or type a lesson summary first."); return; }

        setIsGenerating(true);
        setError(null);
        setProgress(20);
        setProgressStage('⚡ Preparing homework data...');

        try {
            cacheInTurboBrain(transcript || assignmentTitle, {
                subject,
                gradeLevel: grade,
                school: schoolName,
                difficulty
            });

            setProgress(40);
            setProgressStage('🧠 Generating homework... This may take a minute.');

            const response = await fetch(apiEndpoint("/api/generate-homework"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    topic: transcript,
                    subject,
                    grade,
                    difficulty,
                    schoolName,
                    assignmentTitle,
                    dueDate,
                    sections: sections.map(s => ({ name: s.name, taskCount: s.taskCount, marks: s.marks, type: s.type })),
                    templateType,
                    preferredProvider: provider,
                })
            }).catch(() => null);

            let data: any = {};
            if (response) {
                const parsed = await safeFetchJson<any>(response);
                if (parsed.ok && parsed.data) data = parsed.data;
            }

            setProgress(90);
            setProgressStage('✅ Formatting homework...');

            const hw = data.result || {
                schoolName: schoolName || 'CENTRAL ACADEMIC INSTITUTION',
                assignmentTitle: assignmentTitle || `${subject.toUpperCase()} HOMEWORK WORKSHEET`,
                subject: subject || 'General Science',
                grade: grade || 'Class 10',
                dueDate: dueDate || 'Next Session',
                instructions: ['Read all instructions carefully.', 'Attempt all questions in legible handwriting.'],
                sections: sections.map(s => ({
                    name: s.name,
                    description: `Practice problems for ${s.name}`,
                    type: s.type,
                    questions: Array.from({ length: s.taskCount }).map((_, idx) => ({
                        text: `Explain and apply the key concepts of ${transcript.slice(0, 40) || subject} in question ${idx + 1}.`,
                        marks: s.marks,
                        hint: 'Refer to textbook core principles.',
                        answerKey: 'Detailed step-by-step conceptual justification.'
                    }))
                }))
            };

            setPaperHeader({
                schoolName: hw.schoolName || schoolName || 'SCHOOL NAME',
                assignmentTitle: hw.assignmentTitle || assignmentTitle || 'Homework Assignment',
                subject: hw.subject || subject || 'General',
                grade: hw.grade || grade || '10',
                dueDate: hw.dueDate || dueDate || 'TBA',
                instructions: hw.instructions || [],
            });

            // Flatten sections into questions
            let globalQNo = 1;
            const allQuestions: HWQuestion[] = [];
            (hw.sections || []).forEach((section: any) => {
                (section.questions || []).forEach((q: any) => {
                    allQuestions.push({
                        ...q,
                        sectionName: section.name,
                        sectionDescription: section.description || '',
                        sectionType: section.type || 'practice',
                        qNo: globalQNo++,
                    });
                });
            });

            setPaperPages(splitIntoPages(allQuestions));
            setCurrentPage(1);
            setProgress(100);
        } catch (err: any) {
            setError(err.message || 'Failed to generate homework.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ── DOCX EXPORT ──────────────────────────────────
    const handleExportDOCX = async () => {
        if (!paperHeader || !paperPages.length) return;

        const MARGIN = convertInchesToTwip(1);
        const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
        const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
        const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: '000000' };

        const stripMarkup = (s: string) =>
            s.replace(/\$\$?.*?\$\$?/g, '[Math]').replace(/[*_`#~]/g, '').replace(/\\\(.*?\\\)/g, '[Math]').replace(/\\boxed\{[^}]*\}/g, '______').trim();

        // Header
        const headerLines: Paragraph[] = [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (paperHeader.schoolName || 'SCHOOL NAME').toUpperCase(), bold: true, size: 28, font: 'Times New Roman' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: paperHeader.assignmentTitle || 'Homework Assignment', bold: true, size: 24, font: 'Times New Roman' })] }),
        ];

        if (templateType === 'college') {
            headerLines.push(new Paragraph({ children: [
                new TextRun({ text: `Subject: ${paperHeader.subject}`, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: `\t\t\tGrade: ${paperHeader.grade}`, size: 20, font: 'Times New Roman' }),
            ] }));
            headerLines.push(new Paragraph({ children: [
                new TextRun({ text: `Due Date: ${paperHeader.dueDate}`, size: 20, font: 'Times New Roman' }),
            ] }));
        } else {
            headerLines.push(new Paragraph({ children: [
                new TextRun({ text: `Subject: ${paperHeader.subject}`, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: `\t\t\tDue Date: ${paperHeader.dueDate}`, size: 20, font: 'Times New Roman' }),
            ] }));
            headerLines.push(new Paragraph({ children: [
                new TextRun({ text: `Grade: ${paperHeader.grade}`, size: 20, font: 'Times New Roman' }),
            ] }));
        }

        const wordHeader = new Header({ children: headerLines });

        // Body
        const bodyChildren: (Paragraph | Table)[] = [];

        // Instructions
        if (paperHeader.instructions?.length) {
            bodyChildren.push(new Paragraph({ children: [new TextRun({ text: 'General Instructions:', bold: true, underline: {}, font: 'Times New Roman', size: 22 })] }));
            paperHeader.instructions.forEach((inst: string) => {
                bodyChildren.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: inst, font: 'Times New Roman', size: 20 })] }));
            });
            bodyChildren.push(new Paragraph({}));
        }

        // Group by section
        const allQuestions = paperPages.flatMap(p => p.questions);
        const sectionMap: { [key: string]: HWQuestion[] } = {};
        allQuestions.forEach(q => {
            if (!sectionMap[q.sectionName]) sectionMap[q.sectionName] = [];
            sectionMap[q.sectionName].push(q);
        });

        for (const [sectionName, qs] of Object.entries(sectionMap)) {
            bodyChildren.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: sectionName.toUpperCase(), bold: true, size: 28, font: 'Times New Roman' })],
                spacing: { before: 400, after: 120 },
            }));

            const secDesc = qs[0]?.sectionDescription;
            if (secDesc) {
                bodyChildren.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `(${secDesc})`, italics: true, size: 22, font: 'Times New Roman' })],
                    spacing: { after: 240 },
                }));
            }

            const border = templateType === 'college' ? thinBorder : thickBorder;
            const rows: TableRow[] = [
                new TableRow({
                    tableHeader: true,
                    children: [
                        new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Q.No.', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                        new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 78, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Task', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                        new TableCell({ borders: { top: border, bottom: border, left: border, right: border }, width: { size: 12, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Marks', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                    ],
                }),
            ];

            qs.forEach(q => {
                const optionParagraphs: Paragraph[] = q.options?.map((opt: string, oi: number) =>
                    new Paragraph({ children: [new TextRun({ text: `(${String.fromCharCode(65 + oi)}) ${stripMarkup(stripOptionPrefix(opt))}`, font: 'Times New Roman', size: 18 })] })
                ) || [];
                rows.push(new TableRow({
                    children: [
                        new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.qNo}.`, bold: true, font: 'Times New Roman', size: 20 })] })] }),
                        new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: stripMarkup(q.text), font: 'Times New Roman', size: 20 })] }), ...optionParagraphs] }),
                        new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(q.marks), bold: true, font: 'Times New Roman', size: 20 })] })] }),
                    ],
                }));
            });

            bodyChildren.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            bodyChildren.push(new Paragraph({}));
        }

        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
                headers: { default: wordHeader },
                children: bodyChildren,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${(paperHeader.assignmentTitle || 'Homework').replace(/[^a-zA-Z0-9 ]/g, '').trim()}.docx`);
    };

    // ── SAVE TO LIBRARY ──────────────────────────────
    const [isSaving, setIsSaving] = useState(false);
    const handleSaveToLibrary = async () => {
        if (!paperPages.length) return;
        setIsSaving(true);
        const item = {
            id: `hw_${Date.now()}`,
            type: 'homework',
            title: assignmentTitle || `${schoolName} - ${subject || 'Homework'}`,
            content: JSON.stringify({ header: paperHeader, pages: paperPages }),
            timestamp: new Date().toISOString(),
            metadata: { schoolName, assignmentTitle, subject, difficulty, dueDate, templateType, timestamp: new Date().toISOString() }
        };
        try {
            const local = localStorage.getItem('deephub_library_items');
            let list = [];
            if (local) {
                try { list = JSON.parse(local); if (!Array.isArray(list)) list = []; } catch {}
            }
            list.unshift(item);
            localStorage.setItem('deephub_library_items', JSON.stringify(list));

            const response = await fetch(apiEndpoint("/api/library/save"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(item)
            }).catch(() => null);
            if (response) {
                await safeFetchJson(response);
            }
            alert("Saved to library!");
        } catch (err) { console.error("Save Error:", err); }
        finally { setIsSaving(false); }
    };

    const totalMarks = sections.reduce((acc, s) => acc + (s.taskCount * s.marks), 0);
    const totalPages = paperPages.length;

    // ── RENDER ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Homework Creator</h2>
                    <p className="text-muted-foreground text-sm mt-1">Transform lesson summaries into structured homework assignments</p>
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
                {/* ── LEFT: CONFIG ────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Voice/Text Input */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400"><Mic size={16} /></div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Lesson Summary</h3>
                            </div>
                            <button onClick={toggleRecording} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/60 hover:text-white'}`}>
                                {isRecording ? <Square size={12} fill="currentColor" /> : <Mic size={12} />}
                                {isRecording ? 'Stop' : 'Record'}
                            </button>
                        </div>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Type or record your lesson summary. Example: 'Today we covered thermodynamics — entropy, heat transfer, and the three laws...'"
                            className="w-full h-36 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-cyan-500/50 outline-none resize-none transition-all placeholder:text-white/20 leading-relaxed"
                        />

                        {/* Turbo Brain Recent Prompts Recall */}
                        {brainMemories && brainMemories.length > 0 && (
                            <div className="pt-1 space-y-1">
                                <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono-stamp">
                                    <span>⚡ Turbo Brain Recall:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {brainMemories.slice(0, 4).map((m, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setTranscript(m.userPrompt);
                                                if (m.metadata?.subject) setSubject(m.metadata.subject);
                                                if (m.metadata?.gradeLevel) setGrade(m.metadata.gradeLevel);
                                                if (m.metadata?.school) setSchoolName(m.metadata.school);
                                            }}
                                            className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all truncate max-w-[200px] cursor-pointer"
                                            title={m.userPrompt}
                                        >
                                            {m.userPrompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Template Selector */}
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

                    {/* Assignment Details */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400"><BookOpen size={16} /></div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Details</h3>
                        </div>
                        <div className="space-y-3">
                            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder={templateType === 'college' ? 'University Name' : 'School Name'}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                            <input type="text" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} placeholder="Assignment Title"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                                <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade/Year"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <div className="relative">
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sections (QPG-style) */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400"><Settings size={16} /></div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Sections</h3>
                            </div>
                            <span className="text-xs text-primary font-bold">Total: {totalMarks} marks</span>
                        </div>
                        <div className="space-y-3">
                            {sections.map(s => (
                                <div key={s.id} className="bg-black/20 border border-white/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <input type="text" value={s.name} onChange={e => updateSection(s.id, 'name', e.target.value)}
                                            className="bg-transparent text-sm font-semibold text-white outline-none w-24" />
                                        {sections.length > 1 && (
                                            <button onClick={() => removeSection(s.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-white/40 uppercase">Type</label>
                                            <select value={s.type} onChange={e => updateSection(s.id, 'type', e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none">
                                                {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-white/40 uppercase">Tasks</label>
                                            <input type="number" min={1} max={20} value={s.taskCount} onChange={e => updateSection(s.id, 'taskCount', parseInt(e.target.value) || 1)}
                                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none text-center" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-white/40 uppercase">Marks</label>
                                            <input type="number" min={1} max={20} value={s.marks} onChange={e => updateSection(s.id, 'marks', parseInt(e.target.value) || 1)}
                                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none text-center" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addSection} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-1">
                                <Plus size={14} /> Add Section
                            </button>
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={isGenerating || !transcript}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? 'Generating Homework...' : 'Generate Homework'}
                    </button>
                </div>

                {/* ── RIGHT: PREVIEW ─────────────────────────────── */}
                <div className="lg:col-span-8 flex flex-col min-h-[800px] lg:h-[calc(100vh-140px)] bg-[#111625] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative backdrop-blur-md">

                    {/* Preview Header */}
                    <div className="h-14 bg-[#0a0e1a]/80 border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                                <FileText size={14} /> Homework Preview
                            </span>
                            {totalPages > 0 && paperPages[0]?.questions.length > 0 && (
                                <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                                    <span className="text-xs font-mono text-white/90 min-w-[50px] text-center font-medium">Page {currentPage} / {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                                </div>
                            )}
                        </div>
                        {paperHeader && (
                            <div className="flex items-center gap-2.5">
                                <button onClick={handleSaveToLibrary} disabled={isSaving}
                                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />} Save
                                </button>
                                <button onClick={handleExportDOCX}
                                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-500/20">
                                    <Download size={13} /> Export DOCX
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Paper Content */}
                    <div className="flex-1 overflow-y-auto bg-[#525659] p-6 flex justify-center custom-scrollbar">
                        {!paperHeader ? (
                            <div className="text-center self-center space-y-4 opacity-50 select-none max-w-sm">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Ready to Create Homework</h3>
                                <p className="text-xs text-white/60">Configure your lesson details on the left to generate a formatted homework assignment.</p>
                            </div>
                        ) : (
                            <div className="bg-white text-black shadow-2xl min-h-[297mm] w-full max-w-[210mm] mx-auto origin-top p-8 rounded-sm"
                                 style={{ fontFamily: "'Times New Roman', serif" }}>

                                {/* Page Header (School template) */}
                                {currentPage === 1 && templateType === 'school' && (
                                    <div style={{ padding: '15mm 20mm 0 20mm' }}>
                                        <div style={{ borderBottom: '3px solid black', paddingBottom: '12px', marginBottom: '16px' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                                <h1 style={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{paperHeader.schoolName}</h1>
                                                <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0', color: '#333' }}>{paperHeader.assignmentTitle}</h2>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                                                <span><b>Subject:</b> {paperHeader.subject}</span>
                                                <span><b>Grade:</b> {paperHeader.grade}</span>
                                                <span><b>Due Date:</b> {paperHeader.dueDate}</span>
                                                <span><b>Total Marks:</b> {totalMarks}</span>
                                            </div>
                                        </div>
                                        {paperHeader.instructions?.length > 0 && (
                                            <div style={{ marginBottom: '16px', fontSize: '11px' }}>
                                                <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>General Instructions:</p>
                                                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                                    {paperHeader.instructions.map((inst, i) => <li key={i} style={{ marginBottom: '2px' }}>{inst}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Page Header (College template) */}
                                {currentPage === 1 && templateType === 'college' && (
                                    <div style={{ padding: '15mm 20mm 0 20mm' }}>
                                        <div style={{ borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '16px' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                                <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{paperHeader.schoolName}</h1>
                                                <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#333' }}>{paperHeader.assignmentTitle}</h2>
                                                <p style={{ fontSize: '12px', margin: '2px 0', color: '#555' }}>Subject: {paperHeader.subject} | Grade/Year: {paperHeader.grade}</p>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                                                <span>Due: {paperHeader.dueDate}</span>
                                                <span>Max Marks: {totalMarks}</span>
                                            </div>
                                        </div>
                                        {paperHeader.instructions?.length > 0 && (
                                            <div style={{ marginBottom: '16px', fontSize: '11px' }}>
                                                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Instructions:</p>
                                                <ol style={{ paddingLeft: '16px', margin: 0 }}>
                                                    {paperHeader.instructions.map((inst, i) => <li key={i} style={{ marginBottom: '2px' }}>{inst}</li>)}
                                                </ol>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Questions Table */}
                                <div style={{ padding: currentPage === 1 ? '0 20mm 15mm 20mm' : '15mm 20mm' }}>
                                    {(() => {
                                        const pageData = paperPages[currentPage - 1];
                                        if (!pageData) return null;

                                        // Group questions in this page by section
                                        const sectionGroups: { [key: string]: HWQuestion[] } = {};
                                        pageData.questions.forEach(q => {
                                            if (!sectionGroups[q.sectionName]) sectionGroups[q.sectionName] = [];
                                            sectionGroups[q.sectionName].push(q);
                                        });

                                        return Object.entries(sectionGroups).map(([sectionName, qs]) => (
                                            <div key={sectionName} style={{ marginBottom: '20px' }}>
                                                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #999', paddingBottom: '6px', marginBottom: '4px' }}>
                                                    {sectionName}
                                                </div>
                                                {qs[0]?.sectionDescription && (
                                                    <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', color: '#555', marginBottom: '8px' }}>
                                                        ({qs[0].sectionDescription})
                                                    </div>
                                                )}

                                                {templateType === 'college' ? (
                                                    /* College: borderless table with CO/BL columns */
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                        <thead>
                                                            <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                                                                <th style={{ width: '8%', padding: '6px 4px', textAlign: 'center' }}></th>
                                                                <th style={{ width: '72%', padding: '6px 4px' }}></th>
                                                                <th style={{ width: '10%', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>CO</th>
                                                                <th style={{ width: '10%', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Marks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {qs.map((q) => (
                                                                <tr key={q.qNo} style={{ borderBottom: '1px solid #ddd' }}>
                                                                    <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>{q.qNo}.</td>
                                                                    <td style={{ padding: '8px 4px', verticalAlign: 'top' }}>
                                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                            {preprocessLatex(q.text)}
                                                                        </ReactMarkdown>
                                                                        {q.options && q.options.length > 0 && (
                                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: '4px' }}>
                                                                                {q.options.map((opt, oi) => (
                                                                                    <div key={oi} style={{ display: 'flex', gap: '4px' }}>
                                                                                        <span style={{ fontWeight: 'bold', flexShrink: 0 }}>({String.fromCharCode(65 + oi)})</span>
                                                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                                            {preprocessLatex(stripOptionPrefix(opt))}
                                                                                        </ReactMarkdown>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'top' }}>CO1</td>
                                                                    <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>({q.marks})</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    /* School: bordered table */
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '2px solid black' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                                                <th style={{ border: '2px solid black', padding: '8px', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>Q.No.</th>
                                                                <th style={{ border: '2px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Task</th>
                                                                <th style={{ border: '2px solid black', padding: '8px', textAlign: 'center', width: '12%', fontWeight: 'bold' }}>Marks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {qs.map((q) => (
                                                                <tr key={q.qNo}>
                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>{q.qNo}.</td>
                                                                    <td style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }}>
                                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                            {preprocessLatex(q.text)}
                                                                        </ReactMarkdown>
                                                                        {q.options && q.options.length > 0 && (
                                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: '4px' }}>
                                                                                {q.options.map((opt, oi) => (
                                                                                    <div key={oi} style={{ display: 'flex', gap: '4px' }}>
                                                                                        <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{String.fromCharCode(65 + oi)}.</span>
                                                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                                            {preprocessLatex(stripOptionPrefix(opt))}
                                                                                        </ReactMarkdown>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>{q.marks}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        ));
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
