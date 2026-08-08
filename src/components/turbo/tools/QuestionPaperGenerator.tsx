import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Plus, Trash2, Sparkles, Loader2, CheckCircle2, Crop, Download, AlignLeft, AlertCircle, Eye, Printer, LayoutTemplate, Scissors, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, Header, ImageRun, AlignmentType, BorderStyle, WidthType, HeadingLevel, convertInchesToTwip, PageOrientation } from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import PDFSnipper from './PDFSnipper';

// A4 Pagination Constants
const A4_HEIGHT_PX = 1122.5;
const TOP_MARGIN_PX = 56.7; // 1.5cm
const BOTTOM_MARGIN_PX = 94.5; // 2.5cm
const FOOTER_RESERVE = 60;
const SAFETY_BUFFER = 40;
const USABLE_PAGE_HEIGHT = A4_HEIGHT_PX - TOP_MARGIN_PX - BOTTOM_MARGIN_PX - FOOTER_RESERVE - SAFETY_BUFFER;

interface Section {
    id: number;
    name: string;
    questions: number;
    marks: number;
}

interface Snippet {
    id: number;
    image: string;
    text?: string;
    page: number;
    processing?: boolean;
}

import { useAuth } from "../../../context/AuthContext";
import { apiEndpoint, getAuthHeaders, safeFetchJson } from "../../../utils/api";
import { preprocessLatex } from "../../../utils/math";

export default function QuestionPaperGenerator() {
    const { user } = useAuth();
    const { provider } = useAI();
    const [step, setStep] = useState(1);
    const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
    const [showSnipper, setShowSnipper] = useState(false);
    const [activeSnipperFile, setActiveSnipperFile] = useState<File | null>(null);
    const [syllabusSnippets, setSyllabusSnippets] = useState<Snippet[]>([]);
    const [materialSnippets, setMaterialSnippets] = useState<Snippet[]>([]);

    const [studyMaterials, setStudyMaterials] = useState<File[]>([]);
    const [examTime, setExamTime] = useState(180); // minutes
    const [difficulty, setDifficulty] = useState('medium');
    const [topics, setTopics] = useState(''); // Chapters/topics to focus on
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
    const [paperPages, setPaperPages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');
    const [sections, setSections] = useState<Section[]>([
        { id: 1, name: 'Section A', questions: 10, marks: 1 },
        { id: 2, name: 'Section B', questions: 5, marks: 2 },
        { id: 3, name: 'Section C', questions: 4, marks: 5 }
    ]);

    // Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisScore, setAnalysisScore] = useState<number | null>(null); // 0-100
    const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);
    const [schoolName, setSchoolName] = useState('');
    const [examTitle, setExamTitle] = useState('');
    const [instructionPoints, setInstructionPoints] = useState<string[]>(new Array(10).fill('').map((_, i) =>
        i === 0 ? "All questions are compulsory." :
            i === 1 ? "Draw diagrams wherever necessary." :
                i === 2 ? "Duration: The examination duration is 3 hours." :
                    i === 3 ? "No extra time will be given except as per institutional policy." :
                        i === 4 ? "Write your Name, Roll Number, and Registration Number clearly." :
                            i === 5 ? "The paper is divided into multiple sections (e.g. Section A, B, C)." :
                                i === 6 ? "Do not write anything outside the designated areas." :
                                    i === 7 ? "Attempt questions as per the instructions in each section." :
                                        i === 8 ? "Only non-programmable calculators are allowed (if permitted)." :
                                            i === 9 ? "Mobile phones and smart devices are strictly prohibited." : ""
    ));

    const [isEditing, setIsEditing] = useState(false);
    const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    // Template system
    const [templateType, setTemplateType] = useState<'school' | 'college'>('school');
    const [headerImage, setHeaderImage] = useState<string | null>(null);
    const [headerDocxFile, setHeaderDocxFile] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [semester, setSemester] = useState('');
    const paperRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    
    const [paperHeader, setPaperHeader] = useState<any>({
        schoolName: '',
        paperTitle: '',
        subject: '',
        grade: '',
        timeAllowed: '',
        maximumMarks: '',
        instructions: []
    });
    
    // Derived state for total pages: header page + content pages
    const effectiveTotalPages = paperPages.length > 0 ? paperPages.length + 1 : 1;
    
    const splitIntoPages = (allQuestions: any[]) => {
        const QUESTIONS_PER_PAGE = 8;
        const pages: any[] = [];
        let currentSection = "";

        for (let i = 0; i < allQuestions.length; i += QUESTIONS_PER_PAGE) {
            const pageQuestions = allQuestions.slice(i, i + QUESTIONS_PER_PAGE);
            const firstQ = pageQuestions[0];
            
            pages.push({
                questions: pageQuestions,
                sectionName: firstQ.sectionName,
                sectionDescription: firstQ.sectionDescription,
                isFirstOfSection: firstQ.sectionName !== currentSection
            });
            
            currentSection = pageQuestions[pageQuestions.length - 1].sectionName;
        }
        return pages;
    };

    const handleNextPage = () => {
        if (currentPage < effectiveTotalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const [paginatedPages, setPaginatedPages] = useState<string[]>([]);
    const [instructionFontSize, setInstructionFontSize] = useState('13px');
    const [firstPageHeaderHeight, setFirstPageHeaderHeight] = useState(250);
    const [firstPageInstHeight, setFirstPageInstHeight] = useState(100);

    // --- BROWSER OCR ENGINE (PERSISTENT) ---
    const workerRef = useRef<Tesseract.Worker | null>(null);
    const [isOcrReady, setIsOcrReady] = useState(false);

    const initOcrWorker = async () => {
        if (workerRef.current || isOcrReady) return;
        try {
            console.log('📡 Initializing Browser OCR Engine...');
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: m => console.log('OCR Progress:', m),
                cacheMethod: 'readOnly',
            });
            workerRef.current = worker;
            setIsOcrReady(true);
            console.log('✅ Browser OCR Engine Ready');
        } catch (err) {
            console.error('❌ Failed to initialize OCR worker:', err);
        }
    };

    const runOCR = async (id: number, base64: string, type: 'syllabus' | 'material') => {
        await initOcrWorker();
        
        try {
            if (!workerRef.current) throw new Error("OCR Engine not ready");

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("OCR Timeout (180s)")), 180000);
            });

            const result: any = await Promise.race([
                workerRef.current.recognize(base64),
                timeoutPromise
            ]);

            const text = result.data.text.trim();
            
            if (type === 'syllabus') {
                setSyllabusSnippets(current => current.map(s => s.id === id ? { ...s, text, processing: false } : s));
            } else {
                setMaterialSnippets(current => current.map(s => s.id === id ? { ...s, text, processing: false } : s));
            }
            
            console.log(`✅ Extracted ${text.length} characters from snippet.`);
        } catch (err) {
            console.error("Frontend OCR Error:", err);
            if (type === 'syllabus') {
                setSyllabusSnippets(current => current.map(s => s.id === id ? { ...s, processing: false, text: '' } : s));
            } else {
                setMaterialSnippets(current => current.map(s => s.id === id ? { ...s, processing: false, text: '' } : s));
            }
        }
    };

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    // Derived Statistics
    const [stats, setStats] = useState({ words: 0, chars: 0 });

    useEffect(() => {
        const allSnippets = [...syllabusSnippets, ...materialSnippets];
        const totalText = allSnippets.map(s => s.text || '').join(' ');
        const chars = totalText.length;
        const words = totalText.split(/\s+/).filter(Boolean).length;
        setStats({ words, chars });
    }, [syllabusSnippets, materialSnippets]);

    // LOCAL Compatibility Score — no AI call, no server round-trip
    useEffect(() => {
        if (syllabusSnippets.length > 0) {
            const totalText = syllabusSnippets.map(s => s.text || '').join(' ');
            const wordCount = totalText.split(/\s+/).filter(Boolean).length;
            
            if (wordCount > 100) {
                setAnalysisScore(Math.min(95, 50 + Math.floor(wordCount / 10)));
                setAnalysisFeedback(`${wordCount} words extracted from ${syllabusSnippets.length} snippet(s). Ready to generate.`);
            } else if (wordCount > 20) {
                setAnalysisScore(Math.min(50, 20 + wordCount));
                setAnalysisFeedback(`${wordCount} words extracted. Consider snipping more content for better results.`);
            } else if (syllabusSnippets.some(s => s.processing)) {
                setAnalysisScore(null);
                setAnalysisFeedback('Processing snippets...');
            } else {
                setAnalysisScore(wordCount > 0 ? 15 : 0);
                setAnalysisFeedback(wordCount === 0 
                    ? 'No text extracted yet. Snippet OCR may still be loading.'
                    : `Only ${wordCount} words found. Snip more content for better quality.`);
            }
        } else {
            setAnalysisScore(null);
            setAnalysisFeedback(null);
        }
    }, [syllabusSnippets]);

    // Synchronous generation handles all steps. No SSE required.

    const handleSynthesisComplete = (paperObj: any) => {
        try {
            const rawContent = typeof paperObj === 'string' ? paperObj : (paperObj.rawContent || JSON.stringify(paperObj));
            let paperData;

            try {
                const jsonMatch = rawContent.match(/```json\n([\s\S]*?)\n```/) || rawContent.match(/```([\s\S]*?)```/);
                const cleanJson = jsonMatch ? jsonMatch[1] : rawContent;
                paperData = JSON.parse(cleanJson);
            } catch (e) {
                if (paperObj.sections) {
                    paperData = paperObj;
                } else {
                    setGeneratedPaper(rawContent);
                    setPaperPages([]);
                    setCurrentPage(1);
                    setIsGenerating(false);
                    return;
                }
            }

            if (!paperData || !paperData.sections) {
                setGeneratedPaper(rawContent);
                setPaperPages([]);
                setCurrentPage(1);
                setIsGenerating(false);
                return;
            }

            setGeneratedPaper(rawContent); 
            
            setPaperHeader({
                schoolName: schoolName.trim() || paperData.schoolName || "DEEPHUB AI ACADEMY",
                paperTitle: examTitle.trim() || paperData.paperTitle || "ANNUAL EXAMINATION 2024-25",
                subject: paperData.subject || "Mathematics",
                grade: paperData.grade || "10",
                timeAllowed: `${examTime} Minutes` || paperData.timeAllowed,
                maximumMarks: sections.reduce((acc, curr) => acc + (curr.questions * curr.marks), 0).toString() || paperData.maximumMarks,
                instructions: paperData.instructions || instructionPoints.filter(p => p.trim())
            });

            let globalQNo = 1;
            const allQuestions: any[] = [];
            paperData.sections.forEach((section: any) => {
                if (!Array.isArray(section.questions)) return;
                
                const sectionQuestions = section.questions.map((q: any) => ({
                    ...q,
                    sectionName: section.name,
                    sectionDescription: section.description,
                    qNo: globalQNo++
                }));
                allQuestions.push(...sectionQuestions);
            });

            const pages = splitIntoPages(allQuestions);
            setPaperPages(pages);
            setCurrentPage(1);
            setIsGenerating(false);
            setActiveJobId(null);
        } catch (err) {
            console.error("Failed to map synthesis result:", err);
            setError("Synchronization failed during layout mapping.");
            setIsGenerating(false);
        }
    };

    const handleSyllabusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSyllabusFile(file);
    };

    const handleStudyMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setStudyMaterials([...studyMaterials, ...files]);
    };

    // Drag and drop handlers
    const [isDraggingSyllabus, setIsDraggingSyllabus] = useState(false);
    const [isDraggingMaterials, setIsDraggingMaterials] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleSyllabusDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingSyllabus(false);

        const file = e.dataTransfer.files?.[0];
        if (file) setSyllabusFile(file);
    };

    const handleMaterialsDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingMaterials(false);

        const files = Array.from(e.dataTransfer.files || []);
        setStudyMaterials([...studyMaterials, ...files]);
    };

    const removeStudyMaterial = (index: number) => {
        setStudyMaterials(studyMaterials.filter((_, i) => i !== index));
    };

    // Simplified: Show full paper in one scrollable view
    useEffect(() => {
        if (generatedPaper && !isEditing) {
            setCurrentPage(1);
        }
    }, [generatedPaper, isEditing]);

    const addSection = () => {
        const newId = Math.max(...sections.map(s => s.id), 0) + 1;
        setSections([...sections, {
            id: newId,
            name: `Section ${String.fromCharCode(64 + newId)}`, // Section A, B, C...
            questions: 5,
            marks: 1
        }]);
    };

    const removeSection = (id: number) => {
        if (sections.length > 1) {
            setSections(sections.filter(s => s.id !== id));
        }
    };

    const updateSection = (id: number, field: keyof Section, value: any) => {
        setSections(sections.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleGenerate = async () => {
        if (!syllabusFile && syllabusSnippets.length === 0) {
            setError('Please upload a syllabus and snip content from it');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedPaper(null);
        setProgress(10);
        setProgressStage('⚡ Initializing payload...');

        try {
            const { apiEndpoint } = await import("../../../utils/api");
            
            const computedTotalMarks = sections.reduce((acc, curr) => acc + (curr.questions * curr.marks), 0);
            
            // Collect pre-extracted snippet text from browser OCR (Syllabus + Materials)
            const allSnippets = [...syllabusSnippets, ...materialSnippets];
            const snippetText = allSnippets
                .map(s => s.text || '')
                .filter(t => t.trim())
                .join('\n\n');

            setProgress(30);
            setProgressStage(`📋 Extracted: ${stats.words} words | ${stats.chars} characters`);
            
            const formData = new FormData();
            
            // Send reference materials as files (server will extract text via pdf-parse)
            studyMaterials.forEach(material => {
                formData.append('materials', material);
            });
            
            // Send pre-extracted text — NOT raw images
            formData.append('snippetText', snippetText);
            formData.append('sections', JSON.stringify(sections));
            formData.append('examTime', examTime.toString());
            formData.append('totalMarks', computedTotalMarks.toString());
            formData.append('difficulty', difficulty);
            formData.append('topics', topics);
            formData.append('schoolName', schoolName || paperHeader.schoolName || '');
            formData.append('examTitle', examTitle || paperHeader.paperTitle || '');
            formData.append('subject', paperHeader.subject || '');
            formData.append('grade', paperHeader.grade || '');
            formData.append('generalInstructions', instructionPoints.filter(p => p.trim()).join('\n'));
            formData.append('provider', provider);

            setProgress(60);
            setProgressStage('🧠 Generating Paper... This may take up to 2-3 minutes.');

            const response = await fetch(apiEndpoint("/api/generate-questions"), {
                method: 'POST',
                headers: {
                    ...getAuthHeaders()
                } as HeadersInit,
                body: formData 
            }).catch(() => null);
            
            let responseData: any = {};
            if (response) {
                const parsed = await safeFetchJson<any>(response);
                if (parsed.ok && parsed.data) responseData = parsed.data;
            }
            
            if (responseData.success && responseData.result) {
                setProgress(90);
                setProgressStage('✅ Formatting Paper...');
                handleSynthesisComplete(responseData.result);
                return;
            }

            // Fallback: Deterministic Exam Synthesis if running in static client mode
            setProgress(90);
            setProgressStage('✅ Formatting Paper...');
            const fallbackResult = {
                paperHeader: {
                    schoolName: schoolName || 'CENTRAL ACADEMY / BOARD EXAMINATION',
                    paperTitle: examTitle || `${subject.toUpperCase()} EXAMINATION`,
                    subject: subject || 'General Science',
                    grade: grade || 'Class 10',
                    timeAllowed: timeAllowed || '3 Hours',
                    maximumMarks: maxMarks || '80',
                    instructions: instructionPoints.filter(p => p.trim())
                },
                sections: sections.map(sec => ({
                    name: sec.name,
                    description: `Section containing questions of weightage ${sec.marks} marks each.`,
                    marksPerQuestion: sec.marks,
                    type: sec.type,
                    questions: Array.from({ length: sec.questionCount }).map((_, idx) => ({
                        questionNumber: idx + 1,
                        text: `Explain the fundamental principles and mechanisms associated with ${topics.split(',')[0] || 'the syllabus topics'} (Part ${idx + 1}).`,
                        marks: sec.marks,
                        bloomsLevel: 'Application / Analysis',
                        answerKey: 'Full step-by-step mathematical or biochemical derivation required.'
                    }))
                }))
            };
            handleSynthesisComplete(fallbackResult);

        } catch (err: any) {
            setError(err.message || 'Failed to generate question paper. Timeouts can be averted by ensuring reasonable document sizes.');
            setIsGenerating(false);
        }
    };

    // ── DOCX EXPORT ──────────────────────────────────────────────────────────
    const handleExportDOCX = async () => {
        if (!paperHeader || !paperPages.length) return;

        const TWIP_PAGE_WIDTH = 11906; // A4 width in twips
        const MARGIN = convertInchesToTwip(1);

        // Strip markdown/LaTeX for plain Word text
        const stripMarkup = (s: string) =>
            s.replace(/\$\$?.*?\$\$?/g, '[Math]')
             .replace(/[*_`#~]/g, '')
             .replace(/\\\(.*?\\\)/g, '[Math]')
             .replace(/\\boxed\{[^}]*\}/g, '______')
             .trim();

        // Strip existing A)/B)/A./B./(A)/(B) prefixes from AI-generated options
        const stripOptionPrefix = (s: string) =>
            s.replace(/^\s*[A-Da-d][.):]\s*/, '')   // A) B. C: etc
             .replace(/^\s*\([A-Da-d]\)\s*/, '')    // (A) (B) etc
             .trim();

        // ── BUILD HEADER ────────────────────────────────────────────────────
        let wordHeader: Header;

        if (headerDocxFile) {
            // For uploaded DOCX headers, we skip building a wordHeader here.
            // Instead we will inject the header XML directly into the output ZIP
            // after packing (see post-pack section below). Set a placeholder.
            wordHeader = new Header({ children: [new Paragraph({ children: [] })] });

        } else if (headerImage) {
            // Convert base64 data URL → ArrayBuffer
            const base64 = headerImage.split(',')[1];
            const binaryStr = atob(base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

            wordHeader = new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: bytes.buffer,
                                transformation: { width: 595, height: 120 },
                                type: 'png',
                            }),
                        ],
                    }),
                ],
            });
        } else {
            // Auto-generate text letterhead
            const institutionName = paperHeader.schoolName || schoolName || 'Institution Name';
            const headerLines: Paragraph[] = [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: institutionName.toUpperCase(), bold: true, size: 28, font: 'Times New Roman' })],
                }),
            ];
            if (templateType === 'college') {
                if (semester) headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: semester, size: 22, font: 'Times New Roman' })] }));
                if (courseCode) headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Course Code : ${courseCode}`, size: 22, font: 'Times New Roman' })] }));
                if (courseName || paperHeader.subject) headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Course Name : ${courseName || paperHeader.subject}`, bold: true, size: 24, font: 'Times New Roman' })] }));
                headerLines.push(new Paragraph({
                    children: [
                        new TextRun({ text: `Time: ${paperHeader.timeAllowed}`, size: 20, font: 'Times New Roman' }),
                        new TextRun({ text: `\t\t\t\tTotal Marks: ${paperHeader.maximumMarks}`, size: 20, font: 'Times New Roman' }),
                    ],
                }));
            } else {
                if (paperHeader.paperTitle) headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: paperHeader.paperTitle, bold: true, size: 24, font: 'Times New Roman' })] }));
                headerLines.push(new Paragraph({
                    children: [
                        new TextRun({ text: `Time Allowed: ${paperHeader.timeAllowed}`, size: 20, font: 'Times New Roman' }),
                        new TextRun({ text: `\t\t\tMaximum Marks: ${paperHeader.maximumMarks}`, size: 20, font: 'Times New Roman' }),
                    ],
                }));
                headerLines.push(new Paragraph({
                    children: [
                        new TextRun({ text: `Subject: ${paperHeader.subject}`, size: 20, font: 'Times New Roman' }),
                        new TextRun({ text: `\t\t\tGrade: ${paperHeader.grade}`, size: 20, font: 'Times New Roman' }),
                    ],
                }));
            }
            wordHeader = new Header({ children: headerLines });
        }

        // ── BUILD BODY SECTIONS ──────────────────────────────────────────────
        const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
        const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
        const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: '000000' };

        const allQuestions = paperPages.flatMap(p => p.questions);
        const bodyChildren: (Paragraph | Table)[] = [];

        // Instructions (school template)
        if (templateType === 'school' && paperHeader.instructions?.length) {
            bodyChildren.push(new Paragraph({ children: [new TextRun({ text: 'General Instructions:', bold: true, underline: {}, font: 'Times New Roman', size: 22 })] }));
            paperHeader.instructions.forEach((inst: string, i: number) => {
                bodyChildren.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: inst, font: 'Times New Roman', size: 20 })] }));
            });
            bodyChildren.push(new Paragraph({}));
        }

        // Group questions by section
        const sectionMap: { [key: string]: any[] } = {};
        allQuestions.forEach((q: any) => {
            if (!sectionMap[q.sectionName]) sectionMap[q.sectionName] = [];
            sectionMap[q.sectionName].push(q);
        });

        for (const [sectionName, qs] of Object.entries(sectionMap)) {
            bodyChildren.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ 
                        text: sectionName.toUpperCase(), 
                        bold: true, 
                        size: 28, // 14pt (bigger and bolder)
                        font: 'Times New Roman' 
                    })
                ],
                spacing: { before: 400, after: 120 }
            }));

            const secDesc = qs[0]?.sectionDescription;
            if (secDesc) {
                bodyChildren.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `(${secDesc})`, italics: true, size: 22, font: 'Times New Roman' })],
                    spacing: { after: 240 }
                }));
            }

            if (templateType === 'college') {
                // Max marks line
                const secMax = qs.reduce((s: number, q: any) => s + (q.marks || 0), 0);
                bodyChildren.push(new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: `(Max Mark : ${secMax})`, size: 20, font: 'Times New Roman' })],
                }));

                // College table: Qno | Question | CO | BL | Marks
                const rows: TableRow[] = [
                    new TableRow({
                        children: [
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder }, width: { size: 7, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder }, width: { size: 66, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder }, width: { size: 9, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CO', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder }, width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BL', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Marks', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                        ],
                    }),
                ];

                qs.forEach((q: any) => {
                    if (q.isOr) {
                        rows.push(new TableRow({
                            children: [
                                new TableCell({ columnSpan: 5, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'OR', bold: true, italics: true, font: 'Times New Roman', size: 22 })] })] }),
                            ],
                        }));
                    }
                    const optionParagraphs: Paragraph[] = q.options?.map((opt: string, oi: number) =>
                        new Paragraph({ children: [new TextRun({ text: `${String.fromCharCode(65 + oi)}. ${stripMarkup(stripOptionPrefix(opt))}`, font: 'Times New Roman', size: 18 })] })
                    ) || [];

                    rows.push(new TableRow({
                        children: [
                            new TableCell({ borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ children: [new TextRun({ text: `${q.qNo}.`, bold: true, font: 'Times New Roman', size: 20 })] })] }),
                            new TableCell({ borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ children: [new TextRun({ text: stripMarkup(q.text), font: 'Times New Roman', size: 20 })] }), ...optionParagraphs] }),
                            new TableCell({ borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.co || 'CO1', font: 'Times New Roman', size: 18 })] })] }),
                            new TableCell({ borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(q.bl || 2), font: 'Times New Roman', size: 18 })] })] }),
                            new TableCell({ borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${q.marks})`, bold: true, font: 'Times New Roman', size: 18 })] })] }),
                        ],
                    }));
                });

                bodyChildren.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));

            } else {
                // School table: Q.No | Questions | Marks
                const rows: TableRow[] = [
                    new TableRow({
                        tableHeader: true,
                        children: [
                            new TableCell({ borders: { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder }, width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Q.No.', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                            new TableCell({ borders: { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder }, width: { size: 78, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Questions', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                            new TableCell({ borders: { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, shading: { fill: 'F0F0F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Marks', bold: true, font: 'Times New Roman', size: 20 })] })] }),
                        ],
                    }),
                    ...qs.map((q: any) => {
                        const optionParagraphs: Paragraph[] = q.options?.map((opt: string, oi: number) =>
                            new Paragraph({ children: [new TextRun({ text: `(${String.fromCharCode(65 + oi)}) ${stripMarkup(stripOptionPrefix(opt))}`, font: 'Times New Roman', size: 18 })] })
                        ) || [];
                        return new TableRow({
                            children: [
                                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.qNo}.`, bold: true, font: 'Times New Roman', size: 20 })] })] }),
                                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: stripMarkup(q.text), font: 'Times New Roman', size: 20 })] }), ...optionParagraphs] }),
                                new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(q.marks), bold: true, font: 'Times New Roman', size: 20 })] })] }),
                            ],
                        });
                    }),
                ];
                bodyChildren.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            bodyChildren.push(new Paragraph({})); // spacer between sections
        }

        // College: End marker + CO table
        if (templateType === 'college') {
            bodyChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '******** End ********', bold: true, font: 'Times New Roman', size: 22 })] }));
            const coRows = [
                new TableRow({
                    children: [
                        new TableCell({ columnSpan: 2, shading: { fill: 'E8E8E8' }, borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, children: [new Paragraph({ children: [new TextRun({ text: 'COURSE OUTCOME (CO)', bold: true, font: 'Times New Roman', size: 18 })] })] }),
                    ],
                }),
                ...['Understand foundational concepts and apply theoretical knowledge to solve problems.',
                    'Analyze real-world scenarios and design practical solutions using course concepts.',
                    'Evaluate complex problems and synthesize solutions with critical thinking.'].map((co, i) =>
                    new TableRow({
                        children: [
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `CO${i + 1}`, bold: true, font: 'Times New Roman', size: 18 })] })] }),
                            new TableCell({ borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }, width: { size: 88, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: co, font: 'Times New Roman', size: 18 })] })] }),
                        ],
                    })
                ),
            ];
            bodyChildren.push(new Table({ rows: coRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
        }

        // ── ASSEMBLE DOCUMENT ────────────────────────────────────────────────
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
                    },
                },
                headers: { default: wordHeader },
                children: bodyChildren,
            }],
        });

        const baseBlob = await Packer.toBlob(doc);
        const filename = `${(paperHeader.paperTitle || paperHeader.schoolName || 'QuestionPaper').replace(/[^a-zA-Z0-9 ]/g, '').trim()}.docx`;

        // ── POST-PACK: inject uploaded DOCX header directly into the ZIP ──────
        if (headerDocxFile) {
            try {
                const srcZip = await JSZip.loadAsync(headerDocxFile.buffer);
                const outZip = await JSZip.loadAsync(await baseBlob.arrayBuffer());

                // Find the first header file in the source DOCX
                let srcHeaderXml: Uint8Array | null = null;
                let srcHeaderName = '';
                for (const hf of ['word/header1.xml', 'word/header2.xml', 'word/header3.xml']) {
                    const f = srcZip.file(hf);
                    if (f) {
                        srcHeaderXml = await f.async('uint8array');
                        srcHeaderName = hf;
                        break;
                    }
                }

                // If the source DOCX has no Word header, use first part of document body as header XML
                if (!srcHeaderXml) {
                    const docBodyFile = srcZip.file('word/document.xml');
                    if (docBodyFile) {
                        const docXmlStr = await docBodyFile.async('text');
                        // Extract the body element first 8 paragraphs and wrap as a header
                        const parasMatches = [...docXmlStr.matchAll(/<w:p(?:\s[^>]*)?>[\/s\S]*?<\/w:p>/g)].slice(0, 8);
                        if (parasMatches.length > 0) {
                            const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="mv mo w14 wp14">${parasMatches.map(m => m[0]).join('')}</w:hdr>`;
                            srcHeaderXml = new TextEncoder().encode(headerXml);
                            srcHeaderName = 'word/header1.xml';
                        }
                    }
                }

                if (srcHeaderXml) {
                    // 1. Add header XML to the output ZIP
                    outZip.file('word/header1.xml', srcHeaderXml);

                    // 2. Patch word/_rels/document.xml.rels — add header relationship
                    const relsFile = outZip.file('word/_rels/document.xml.rels');
                    if (relsFile) {
                        let relsXml = await relsFile.async('text');
                        const relId = 'rIdHdr1';
                        if (!relsXml.includes(relId)) {
                            relsXml = relsXml.replace('</Relationships>',
                                `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>`);
                            outZip.file('word/_rels/document.xml.rels', relsXml);
                        }

                        // 3. Patch word/document.xml sectPr to reference the header
                        const docFile = outZip.file('word/document.xml');
                        if (docFile) {
                            let docXml = await docFile.async('text');
                            if (!docXml.includes('w:headerReference')) {
                                docXml = docXml.replace('</w:sectPr>',
                                    `<w:headerReference w:type="default" r:id="${relId}"/></w:sectPr>`);
                                outZip.file('word/document.xml', docXml);
                            }
                        }

                        // 4. Patch [Content_Types].xml
                        const ctFile = outZip.file('[Content_Types].xml');
                        if (ctFile) {
                            let ctXml = await ctFile.async('text');
                            if (!ctXml.includes('header1.xml')) {
                                ctXml = ctXml.replace('</Types>',
                                    `<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>`);
                                outZip.file('[Content_Types].xml', ctXml);
                            }
                        }
                    }

                    const finalBlob = await outZip.generateAsync({
                        type: 'blob',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });
                    saveAs(finalBlob, filename);
                } else {
                    saveAs(baseBlob, filename);
                }
            } catch (e) {
                console.error('DOCX header injection error:', e);
                saveAs(baseBlob, filename);
            }
        } else {
            saveAs(baseBlob, filename);
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const handleSnipConfirm = (newSnippets: Snippet[]) => {
        setSyllabusSnippets([...syllabusSnippets, ...newSnippets]);
        setShowSnipper(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">
            {/* Snipper Modal */}
            {showSnipper && activeSnipperFile && (
                <PDFSnipper
                    file={activeSnipperFile}
                    onConfirm={(newSnips) => {
                        const type = activeSnipperFile === syllabusFile ? 'syllabus' : 'material';
                        if (type === 'syllabus') {
                            setSyllabusSnippets(prev => {
                                const combined = [...prev, ...newSnips];
                                // Trigger OCR for any new snippet that isn't processing and has no text
                                newSnips.forEach(s => {
                                    if (s.processing) runOCR(s.id, s.image, 'syllabus');
                                });
                                return combined;
                            });
                        } else {
                            setMaterialSnippets(prev => {
                                const combined = [...prev, ...newSnips];
                                newSnips.forEach(s => {
                                    if (s.processing) runOCR(s.id, s.image, 'material');
                                });
                                return combined;
                            });
                        }
                        setShowSnipper(false);
                    }}
                    onCancel={() => setShowSnipper(false)}
                    initialSnippets={activeSnipperFile === syllabusFile ? syllabusSnippets : []}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Question Paper Generator</h2>
                    <p className="text-muted-foreground text-sm mt-1">Upload materials and configure exam structure</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isGenerating && (
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-xs text-primary font-medium mb-1">{progressStage}</span>
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN - CONFIGURATION */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. Upload Section */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                <Upload size={16} />
                            </div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Source Material</h3>
                        </div>

                        {/* Syllabus Upload */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 transition-all text-center cursor-pointer ${isDraggingSyllabus ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setIsDraggingSyllabus(true)}
                            onDragLeave={() => setIsDraggingSyllabus(false)}
                            onDrop={handleSyllabusDrop}
                            onClick={() => document.getElementById('syllabus-upload')?.click()}
                        >
                            <input type="file" id="syllabus-upload" className="hidden" onChange={handleSyllabusUpload} accept=".pdf,.docx,.txt" />
                            {syllabusFile ? (
                                <div className="flex items-center justify-center gap-3 text-green-400">
                                    <FileText size={24} />
                                    <div className="text-left">
                                        <p className="font-medium text-sm truncate max-w-[180px]">{syllabusFile.name}</p>
                                        <p className="text-xs opacity-70">{(syllabusFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <CheckCircle2 size={16} className="ml-2" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/40">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Upload Syllabus</p>
                                        <p className="text-xs text-white/40 mt-1">PDF, DOCX, or TXT</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Snippet Text Status */}
                        {syllabusSnippets.length > 0 && syllabusSnippets.some(s => s.processing) && (
                            <div className="flex items-center gap-2 text-xs text-white/50 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                <span>Extracting text from snippets...</span>
                            </div>
                        )}

                        {/* Snip Action - ADDED RESTORATION */}
                        {syllabusFile && (
                            <div className="animate-fade-in">
                                <button
                                    onClick={() => {
                                        setActiveSnipperFile(syllabusFile);
                                        setShowSnipper(true);
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-200 hover:text-white hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Scissors size={14} className="group-hover:rotate-12 transition-transform" />
                                    Snip Content from Syllabus
                                </button>
                            </div>
                        )}

                        {/* Display Snippets - ADDED RESTORATION */}
                        {syllabusSnippets.length > 0 && (
                            <div className="space-y-2 animate-fade-in">
                                <h4 className="text-xs font-medium text-white/60 uppercase">Captured Snippets</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {syllabusSnippets.map((snip, i) => (
                                        <div key={snip.id} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/40">
                                            <img src={snip.image} className="w-full h-full object-contain" alt={`Snippet ${i + 1}`} />
                                            <button
                                                onClick={() => setSyllabusSnippets(syllabusSnippets.filter(s => s.id !== snip.id))}
                                                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isAnalyzing && analysisScore !== null && (
                            <div className={`text-xs p-3 rounded-lg border ${analysisScore > 70 ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'}`}>
                                <div className="flex justify-between font-bold mb-1">
                                    <span>Compatibility Score</span>
                                    <span>{analysisScore}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] opacity-70 mt-2 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-primary font-bold">{stats.words}</span>
                                            <span>words</span>
                                        </div>
                                        <div className="h-3 w-[1px] bg-white/10"></div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-blue-400 font-bold">{stats.chars}</span>
                                            <span>characters</span>
                                        </div>
                                    </div>
                                    { (syllabusSnippets.some(s => s.processing) || materialSnippets.some(s => s.processing)) && (
                                        <div className="flex items-center gap-1 text-primary animate-pulse">
                                            <Loader2 size={10} className="animate-spin" />
                                            <span>Extracting...</span>
                                        </div>
                                    )}
                                </div>
                                <p className="opacity-80 mt-2">{analysisFeedback}</p>
                            </div>
                        )}


                        {/* Additional Materials */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-white/60 uppercase">Reference Materials</label>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40">{studyMaterials.length} files</span>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {studyMaterials.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={14} className="text-white/40 flex-shrink-0" />
                                            <span className="text-xs text-white/80 truncate">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => {
                                                    setActiveSnipperFile(file);
                                                    setShowSnipper(true);
                                                }}
                                                className="text-white/20 hover:text-purple-400 p-1 transition-colors"
                                                title="Snip from this material"
                                            >
                                                <Scissors size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); removeStudyMaterial(idx); }} className="text-white/20 hover:text-red-400 p-1">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div
                                    className={`border border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all ${isDraggingMaterials ? 'border-primary bg-primary/5' : ''}`}
                                    onClick={() => document.getElementById('materials-upload')?.click()}
                                    onDragOver={handleDragOver}
                                    onDragEnter={() => setIsDraggingMaterials(true)}
                                    onDragLeave={() => setIsDraggingMaterials(false)}
                                    onDrop={handleMaterialsDrop}
                                >
                                    <input type="file" id="materials-upload" multiple className="hidden" onChange={handleStudyMaterialUpload} />
                                    <div className="flex items-center justify-center gap-2 text-white/40">
                                        <Plus size={14} />
                                        <span className="text-xs font-medium">Add Material</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TEMPLATE SELECTOR */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <LayoutTemplate size={16} />
                            </div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Template</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {(['school', 'college'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTemplateType(t)}
                                    className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                                        templateType === t
                                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                                            : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                                    }`}
                                >
                                    {t === 'school' ? '🏫 School' : '🎓 College'}
                                </button>
                            ))}
                        </div>

                        {/* Header Upload — image OR docx */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/50 font-medium">
                                Header <span className="text-white/25">(image or .docx — optional)</span>
                            </label>
                            {headerImage ? (
                                <div className="relative">
                                    <img src={headerImage} alt="Header" className="w-full h-16 object-contain rounded-lg border border-white/10 bg-white/5" />
                                    <button
                                        onClick={() => setHeaderImage(null)}
                                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >✕</button>
                                </div>
                            ) : headerDocxFile ? (
                                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                                    <span className="text-lg">📄</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/80 font-medium truncate">{headerDocxFile.name}</p>
                                        <p className="text-[10px] text-white/30">Word letterhead — will be used as header</p>
                                    </div>
                                    <button
                                        onClick={() => setHeaderDocxFile(null)}
                                        className="text-white/30 hover:text-red-400 transition-colors"
                                    >✕</button>
                                </div>
                            ) : (
                                <div
                                    className="border border-dashed border-white/10 rounded-lg p-3 text-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all"
                                    onClick={() => document.getElementById('header-file-upload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="header-file-upload"
                                        accept="image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        className="hidden"
                                        onChange={async e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
                                                const buf = await file.arrayBuffer();
                                                setHeaderDocxFile({ name: file.name, buffer: buf });
                                                setHeaderImage(null);
                                            } else {
                                                const reader = new FileReader();
                                                reader.onload = ev => {
                                                    setHeaderImage(ev.target?.result as string);
                                                    setHeaderDocxFile(null);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div className="flex items-center justify-center gap-2 text-white/30">
                                        <Upload size={14} />
                                        <span className="text-xs">Upload image or .docx letterhead</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* College-only extra fields */}
                        {templateType === 'college' && (
                            <div className="space-y-3 border-t border-white/5 pt-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/50 font-medium">Course Code</label>
                                        <input
                                            type="text"
                                            value={courseCode}
                                            onChange={e => setCourseCode(e.target.value)}
                                            placeholder="e.g. CS401"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-white/50 font-medium">Semester / Series</label>
                                        <input
                                            type="text"
                                            value={semester}
                                            onChange={e => setSemester(e.target.value)}
                                            placeholder="e.g. S4 Series Test 1"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/50 font-medium">Course Name</label>
                                    <input
                                        type="text"
                                        value={courseName}
                                        onChange={e => setCourseName(e.target.value)}
                                        placeholder="e.g. Engineering Mathematics"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Exam Configuration */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                                <LayoutTemplate size={16} />
                            </div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Structure & Meta</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Exam Time (min)</label>
                                <input
                                    type="number"
                                    value={examTime}
                                    onChange={(e) => setExamTime(Number(e.target.value))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="balanced">Balanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/50 font-medium">School / Institute Name</label>
                            <input
                                type="text"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                placeholder="e.g. Greenwood High School"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/50 font-medium">Exam Title</label>
                            <input
                                type="text"
                                value={examTitle}
                                onChange={(e) => setExamTitle(e.target.value)}
                                placeholder="e.g. Mid-Term Physics Examination"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    {/* 3. Section Manager */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                                    <AlignLeft size={16} />
                                </div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Sections</h3>
                            </div>
                            <button onClick={addSection} className="text-xs bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded-md transition-all">+ Add</button>
                        </div>

                        <div className="space-y-3">
                            {sections.map((section, idx) => (
                                <div key={section.id} className="bg-black/20 rounded-lg p-3 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <input
                                            value={section.name}
                                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                                            className="bg-transparent text-sm font-bold text-white w-24 outline-none border-b border-transparent focus:border-white/20"
                                        />
                                        <button onClick={() => removeSection(section.id)} className="text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-white/40 uppercase block mb-1">Questions</label>
                                            <input
                                                type="number"
                                                value={section.questions}
                                                onChange={(e) => updateSection(section.id, 'questions', Number(e.target.value))}
                                                className="w-full bg-white/5 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-white/40 uppercase block mb-1">Marks/Q</label>
                                            <input
                                                type="number"
                                                value={section.marks}
                                                onChange={(e) => updateSection(section.id, 'marks', Number(e.target.value))}
                                                className="w-full bg-white/5 rounded px-2 py-1 text-xs text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/5 rounded-lg p-2 flex justify-between items-center text-xs text-white/60">
                            <span>Total Marks:</span>
                            <span className="font-bold text-white">{sections.reduce((acc, curr) => acc + (curr.questions * curr.marks), 0)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !syllabusFile}
                        className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 rounded-xl font-bold text-black shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? 'Generating Paper...' : 'Generate Question Paper'}
                    </button>

                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className="lg:col-span-8 flex flex-col h-[800px] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">

                    {/* Preview Header */}
                    <div className="h-14 bg-black/40 border-b border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Desktop View"><LayoutTemplate size={14} /></button>
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Print View"><Printer size={14} /></button>
                            </div>
                            <span className="text-xs font-medium text-white/40 ml-2">Preview Mode</span>
                        </div>

                        {generatedPaper && (
                            <div className="flex items-center gap-3">
                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                    <button 
                                        onClick={handlePrevPage} 
                                        disabled={currentPage === 1}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-mono text-white/90 min-w-[60px] text-center font-medium">
                                        Page {currentPage} / {effectiveTotalPages}
                                    </span>
                                    <button 
                                        onClick={handleNextPage} 
                                        disabled={currentPage === effectiveTotalPages}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Next Page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

                                <button onClick={handleExportDOCX} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20">
                                    <Download size={14} /> Export DOCX
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Paper Content */}
                    <div className="flex-1 overflow-y-auto bg-[#525659] p-8 flex justify-center relative">
                        {!generatedPaper ? (
                            <div className="text-center self-center space-y-4 opacity-30 select-none">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={40} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ready to Generate</h3>
                                <p className="max-w-xs text-sm">Upload your syllabus and configure sections to generate a professional question paper.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <div
                                id="question-paper-preview"
                                className="bg-white text-black shadow-2xl"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '15mm 20mm',
                                    boxSizing: 'border-box',
                                    fontFamily: 'Times New Roman, serif',
                                    fontSize: '11pt',
                                    lineHeight: '1.5',
                                    transformOrigin: 'top center',
                                    flexShrink: 0,
                                }}
                            >
                                {currentPage === 1 && (
                                    <>
                                        {templateType === 'college' ? (
                                            /* ===== COLLEGE TEMPLATE HEADER ===== */
                                            <div className="mb-5" style={{ fontFamily: 'Times New Roman, serif' }}>
                                                {headerDocxFile ? (
                                                    /* DOCX letterhead banner */
                                                    <div className="w-full border-b-2 border-black pb-3 mb-2 flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-2 w-full justify-center">
                                                            <span style={{ fontSize: '20px' }}>📄</span>
                                                            <div className="text-center">
                                                                <p className="font-bold text-sm text-blue-800">{headerDocxFile.name}</p>
                                                                <p className="text-[10px] text-blue-500">Letterhead from uploaded DOCX — appears in exported file</p>
                                                            </div>
                                                        </div>
                                                        {semester && <p className="text-sm font-semibold mt-1 text-black">{semester}</p>}
                                                    </div>
                                                ) : headerImage ? (
                                                    <img src={headerImage} alt="College Header" className="w-full object-contain mb-3" style={{ maxHeight: '130px' }} />
                                                ) : (
                                                    <div className="text-center border-b-2 border-black pb-3 mb-2">
                                                        <p className="font-bold text-xl uppercase tracking-wide">{paperHeader.schoolName || schoolName || 'Institution Name'}</p>
                                                        {semester && <p className="text-sm font-semibold mt-1">{semester}</p>}
                                                    </div>
                                                )}
                                                {courseCode && <p className="text-center text-sm font-semibold mt-2">Course Code : {courseCode}</p>}
                                                {(courseName || paperHeader.subject) && (
                                                    <p className="text-center text-base font-bold">Course Name : {courseName || paperHeader.subject}</p>
                                                )}
                                                {paperHeader.paperTitle && !courseName && (
                                                    <p className="text-center text-sm italic">{paperHeader.paperTitle}</p>
                                                )}
                                                <div className="flex justify-between items-start mt-3 text-sm font-semibold">
                                                    <span>Time: {paperHeader.timeAllowed}</span>
                                                    <span>Total Marks: {paperHeader.maximumMarks}</span>
                                                </div>
                                                <hr className="border-black mt-3" />
                                            </div>
                                        ) : (
                                            /* ===== SCHOOL TEMPLATE HEADER ===== */
                                            <div className="mb-8">
                                                {headerDocxFile ? (
                                                    <div className="w-full border-b-2 border-black pb-3 mb-4 flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-2 w-full justify-center">
                                                            <span style={{ fontSize: '20px' }}>📄</span>
                                                            <div className="text-center">
                                                                <p className="font-bold text-sm text-blue-800">{headerDocxFile.name}</p>
                                                                <p className="text-[10px] text-blue-500">Letterhead from uploaded DOCX — appears in exported file</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : headerImage ? (
                                                    <img src={headerImage} alt="School Header" className="w-full object-contain mb-4" style={{ maxHeight: '130px' }} />
                                                ) : (
                                                    <>
                                                        <h1 className="text-center text-xl font-bold uppercase mb-1 text-black">
                                                            {paperHeader.schoolName}
                                                        </h1>
                                                        <h2 className="text-center text-base font-semibold mb-4 text-black">
                                                            {paperHeader.paperTitle}
                                                        </h2>
                                                    </>
                                                )}
                                                {/* Time and Marks Box */}
                                                <table className="w-full border-2 border-black text-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-black px-3 py-1 font-semibold w-1/2">
                                                                Time Allowed: {paperHeader.timeAllowed}
                                                            </td>
                                                            <td className="border border-black px-3 py-1 font-semibold w-1/2 text-right">
                                                                Maximum Marks: {paperHeader.maximumMarks}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="border border-black px-3 py-1 font-semibold">
                                                                Subject: {paperHeader.subject}
                                                            </td>
                                                            <td className="border border-black px-3 py-1 font-semibold text-right">
                                                                Grade: {paperHeader.grade}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* GENERAL INSTRUCTIONS */}
                                        <div className="mb-6">
                                            <h3 className="font-bold text-sm mb-2 text-black underline">General Instructions:</h3>
                                            <ol className="text-xs space-y-1 ml-5 list-decimal text-black leading-relaxed">
                                                {paperHeader.instructions.length > 0 ? (
                                                    paperHeader.instructions.map((pt: string, i: number) => (
                                                        <li key={i}>{pt}</li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li>All questions are compulsory.</li>
                                                        <li>Read each question carefully before answering.</li>
                                                        <li>Write your answers neatly and legibly.</li>
                                                    </>
                                                )}
                                            </ol>
                                        </div>

                                        <div className="border-t border-black/30 pt-4"></div>
                                    </>
                                )}

                                {/* QUESTION PAPER CONTENT */}
                                {(() => {
                                    // If we have paginated data, render the current page's questions
                                    if (paperPages.length > 0) {
                                        // LOGIC SENSITIVE TO TOTAL PAGES
                                        // If effectiveTotalPages > 1, Page 1 is purely a cover page (Header + Instructions).
                                        // Questions start on Page 2.
                                        
                                        // If effectiveTotalPages === 1 (short paper), Page 1 must show questions too.
                                        const isSinglePage = effectiveTotalPages === 1;

                                        if (currentPage === 1 && !isSinglePage) {
                                            return <div className="text-center mt-8 italic text-gray-500">Please turn over for questions...</div>;
                                        }

                                        // Calculate page index
                                        // If multi-page: Page 2 -> index 0.
                                        // If single-page: Page 1 -> index 0.
                                        const pageIndex = isSinglePage ? 0 : currentPage - 2;
                                        const pageData = paperPages[pageIndex];
                                        
                                        if (!pageData) {
                                            console.warn('No page data found for index:', pageIndex, 'CurrentPage:', currentPage, 'TotalPages:', effectiveTotalPages);
                                            return null;
                                        }

                                        return (
                                            <div className="text-black" style={{ fontSize: '13px', fontFamily: 'Times New Roman, serif' }}>

                                                {templateType === 'college' ? (
                                                    /* ===== COLLEGE TEMPLATE QUESTIONS ===== */
                                                    <>
                                                        {pageData.isFirstOfSection && (
                                                            <>
                                                                <div className="text-center font-black text-xl uppercase tracking-widest mt-6 mb-1">{pageData.sectionName}</div>
                                                                <div className="text-center italic text-sm mb-2 text-gray-700">({pageData.sectionDescription})</div>
                                                                <div className="flex justify-end text-xs font-semibold mb-2 pr-1">
                                                                    <span>(Max Mark : {pageData.questions.reduce((s: number, q: any) => s + (q.marks || 0), 0)})</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        <table className="w-full text-xs mb-4" style={{ borderCollapse: 'collapse' }}>
                                                            <colgroup>
                                                                <col style={{ width: '7%' }} />
                                                                <col style={{ width: '66%' }} />
                                                                <col style={{ width: '9%' }} />
                                                                <col style={{ width: '8%' }} />
                                                                <col style={{ width: '10%' }} />
                                                            </colgroup>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid black' }}>
                                                                    <th className="px-1 py-1 text-left"></th>
                                                                    <th className="px-1 py-1 text-left"></th>
                                                                    <th className="px-1 py-1 text-center font-bold">CO</th>
                                                                    <th className="px-1 py-1 text-center font-bold">BL</th>
                                                                    <th className="px-1 py-1 text-center font-bold">Marks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pageData.questions.map((q: any, qIdx: number) => (
                                                                    <React.Fragment key={qIdx}>
                                                                        {q.isOr && (
                                                                            <tr>
                                                                                <td colSpan={5} className="text-center font-bold py-1 italic text-sm">OR</td>
                                                                            </tr>
                                                                        )}
                                                                        <tr style={{ verticalAlign: 'top', borderBottom: '1px solid #ddd' }}>
                                                                            <td className="px-1 py-2 font-bold">{q.qNo}.</td>
                                                                            <td className="px-1 py-2">
                                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                                    {preprocessLatex(q.text)}
                                                                                </ReactMarkdown>
                                                                                {q.options && q.options.length > 0 && (
                                                                                    <div className="grid grid-cols-2 gap-x-4 mt-1">
                                                                                        {q.options.map((opt: string, oi: number) => (
                                                                                            <div key={oi} className="flex items-start gap-1">
                                                                                                <span className="font-semibold shrink-0">{String.fromCharCode(65 + oi)}.</span>
                                                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>{preprocessLatex(opt.replace(/^\s*[A-Da-d][.):] /, '').replace(/^\s*\([A-Da-d]\) /, ''))}</ReactMarkdown>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-1 py-2 text-center">{q.co || 'CO1'}</td>
                                                                            <td className="px-1 py-2 text-center">{q.bl || '2'}</td>
                                                                            <td className="px-1 py-2 text-center font-semibold">({q.marks})</td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        {/* CO Table on last page */}
                                                        {currentPage === effectiveTotalPages && (
                                                            <>
                                                                <div className="text-center font-bold text-sm my-4">******** End ********</div>
                                                                <table className="w-full text-xs" style={{ borderCollapse: 'collapse', border: '1px solid black' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="border border-black px-2 py-1 text-left font-bold bg-gray-100" colSpan={2}>COURSE OUTCOME (CO)</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {['Understand foundational concepts and apply theoretical knowledge to solve problems.',
                                                                          'Analyze real-world scenarios and design practical solutions using course concepts.',
                                                                          'Evaluate complex problems and synthesize solutions with critical thinking.'].map((co, i) => (
                                                                            <tr key={i}>
                                                                                <td className="border border-black px-2 py-1 font-bold w-10">{`CO${i + 1}`}</td>
                                                                                <td className="border border-black px-2 py-1">{co}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    /* ===== SCHOOL TEMPLATE QUESTIONS ===== */
                                                    <>
                                                        {pageData.isFirstOfSection && (
                                                            <>
                                                                <div className="text-center font-black text-xl mb-2 mt-4 uppercase tracking-widest border-b-2 border-black pb-2">
                                                                    {pageData.sectionName}
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs font-semibold mb-3 px-1">
                                                                    <div className="italic">{pageData.sectionDescription}</div>
                                                                    <div>({pageData.questions.length} Questions x {pageData.questions[0]?.marks || 0} Marks = {pageData.questions.length * (pageData.questions[0]?.marks || 0)} Marks)</div>
                                                                </div>
                                                            </>
                                                        )}
                                                        <table className="w-full border-2 border-black mb-4" style={{ borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm w-16">Q.No.</th>
                                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm">Questions</th>
                                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm w-20">Marks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pageData.questions.map((q: any, qIdx: number) => (
                                                                    <tr key={qIdx}>
                                                                        <td className="border-2 border-black px-3 py-3 text-center align-top font-bold">{q.qNo}.</td>
                                                                        <td className="border-2 border-black px-3 py-3 align-top">
                                                                            <div className="mb-2">
                                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                                    {preprocessLatex(q.text)}
                                                                                </ReactMarkdown>
                                                                            </div>
                                                                            {q.options && q.options.length > 0 && (
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                                                                    {q.options.map((opt: string, optIdx: number) => (
                                                                                        <div key={optIdx} className="flex items-start">
                                                                                            <span className="font-semibold mr-1">({String.fromCharCode(65 + optIdx)})</span>
                                                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex] as any}>
                                                                                                {preprocessLatex(opt.replace(/^\s*[A-Da-d][.):] /, '').replace(/^\s*\([A-Da-d]\) /, ''))}
                                                                                            </ReactMarkdown>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="border-2 border-black px-3 py-3 text-center align-top font-semibold">{q.marks}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                )}

                                                <div className="text-right text-xs text-gray-500 mt-4">
                                                    Page {currentPage} of {effectiveTotalPages}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // FALLBACK: If we have NO paperPages parsed, it implies:
                                    // 1. We failed to split pages (JSON error?)
                                    // 2. Or it's raw content.
                                    // In this case, we MUST render the raw 'generatedPaper' so the user sees something.
                                    if (generatedPaper) {
                                        return (
                                            <div className="text-black" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkMath]} 
                                                    rehypePlugins={[rehypeKatex] as any}
                                                    components={{
                                                        table: ({node, ...props}) => <table className="w-full border-2 border-black mb-6" style={{ borderCollapse: 'collapse' }} {...props} />,
                                                        th: ({node, ...props}) => <th className="border-2 border-black px-3 py-2 font-semibold text-sm bg-gray-50" {...props} />,
                                                        td: ({node, ...props}) => <td className="border-2 border-black px-3 py-3 align-top" {...props} />,
                                                    }}
                                                >
                                                    {preprocessLatex(generatedPaper)}
                                                </ReactMarkdown>
                                            </div>
                                        );
                                    }
                                    
                                    return null;
                                })()}

                                {/* FOOTER */}
                                <div className="mt-8 pt-3 border-t border-black/20 text-center text-[10px] text-gray-500">
                                    — End of Question Paper —
                                </div>
                            </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
