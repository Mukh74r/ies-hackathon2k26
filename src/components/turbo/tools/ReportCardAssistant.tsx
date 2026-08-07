import React, { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Sparkles,
    Loader2,
    ClipboardCheck,
    TrendingUp,
    Target,
    X,
    Download,
    BarChart3,
    Database,
    GraduationCap,
    School,
    Briefcase,
    Brain,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { apiEndpoint, getAuthHeaders } from '../../../utils/api';
import NeuralLoader from '../shared/NeuralLoader';

// --- TYPES ---
interface Subject {
    name: string;
    marks: number;
    grade: string;
}

interface CareerSuggestion {
    role: string;
    stream: string;
    match: number;
    reason: string;
}

interface AnalysisData {
    studentName: string;
    gradeClass: string;
    overallPercentage: number;
    performanceSummary: string;
    subjects: Subject[];
    collegeChances: {
        topTier: number;
        averageTier: number;
        comment: string;
    };
    careerSuggestions: CareerSuggestion[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

const LOADING_MESSAGES = [
    "Digitizing Report Card...",
    "Neural Engine Analyzing Scores...",
    "Extracting Academic Trends...",
    "Synthesizing Student Profile...",
    "Projecting College Admissions...",
    "Drafting Career Recommendations...",
    "Finalizing Analysis Report...",
];

export default function ReportCardAssistant() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAnalyzing || isProcessing) {
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isAnalyzing, isProcessing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let selectedFile: File | undefined;
        if ('files' in (e.target as HTMLInputElement) && (e.target as HTMLInputElement).files) {
            selectedFile = (e.target as HTMLInputElement).files?.[0];
        } else if (e.type === 'drop' && 'dataTransfer' in e && e.dataTransfer.files) {
            selectedFile = e.dataTransfer.files[0];
        }
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setPreview(selectedFile.type === 'application/pdf' ? 'pdf' : URL.createObjectURL(selectedFile));
                setAnalysis(null);
                setError(null);
            } else {
                setError("Please upload an image (PNG, JPG) or a PDF file.");
            }
        }
    };

    const startAnalysisProcess = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setIsProcessing(true);
        setError(null);
        setProgress(0);
        setLoadingStep(0);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) { clearInterval(progressInterval); return 90; }
                return prev + 8;
            });
        }, 600);

        try {
            const formData = new FormData();
            formData.append('report', file);

            const response = await fetch(apiEndpoint('/api/analyze-report'), {
                method: 'POST',
                headers: { ...getAuthHeaders() },
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await response.json();
            if (response.ok) {
                // Backend may return structured JSON or a string. Handle both.
                let parsed: AnalysisData;
                if (typeof data.analysis === 'string') {
                    try { parsed = JSON.parse(data.analysis); }
                    catch { parsed = fallbackAnalysis(file.name); }
                } else {
                    parsed = data.analysis || fallbackAnalysis(file.name);
                }
                setAnalysis(parsed);
            } else {
                throw new Error(data.error || "Neural Analysis failed.");
            }
        } catch (err: any) {
            clearInterval(progressInterval);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
            setIsProcessing(false);
        }
    };

    const fallbackAnalysis = (name: string): AnalysisData => ({
        studentName: name.replace(/\.[^/.]+$/, ''),
        gradeClass: "Grade 10",
        overallPercentage: 0,
        performanceSummary: "Analysis data not available",
        subjects: [],
        collegeChances: { topTier: 0, averageTier: 0, comment: "Insufficient data" },
        careerSuggestions: [],
        strengths: [],
        weaknesses: [],
        recommendations: [],
    });

    const handleSaveToLibrary = async () => {
        if (!analysis) return;
        setIsSaving(true);
        try {
            const response = await fetch(apiEndpoint('/api/library/save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    type: 'report-analysis',
                    title: `Analysis - ${analysis.studentName || 'Student Report'}`,
                    content: JSON.stringify(analysis, null, 2),
                    metadata: { fileName: file?.name, grade: analysis.gradeClass, score: analysis.overallPercentage }
                })
            });
            const data = await response.json();
            if (!data.success) throw new Error("Save failed");
        } catch (err) {
            console.error("Save Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const exportPDF = async () => {
        const dashboard = document.getElementById('student-dashboard');
        if (!dashboard) return;
        try {
            const canvas = await html2canvas(dashboard, { scale: 2, useCORS: true, logging: false, backgroundColor: '#0f1115' });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${analysis?.studentName || 'Student'}_Analysis.pdf`);
        } catch (e) { console.error("PDF Export failed", e); }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative overflow-hidden pb-4">
            {/* Background Ambience */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between z-10 shrink-0"
                    >
                        <div className="flex items-center gap-3 text-red-400"><X size={18} /><span className="text-sm font-bold">{error}</span></div>
                        <button onClick={() => setError(null)} className="text-red-500/40 hover:text-red-400 text-xs font-black uppercase tracking-widest">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full relative z-10 min-h-0">

                {/* LEFT COLUMN: Upload & Preview */}
                <div className="lg:col-span-4 space-y-4 flex flex-col h-full min-h-0">
                    <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-5 shadow-xl flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Report Assistant</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Neural Student Analytics</p>
                        </div>
                    </div>

                    <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-4 shadow-xl flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                        {!preview ? (
                            <label
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e); }}
                                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group h-full ${isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}
                            >
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'bg-emerald-500/20 scale-110' : 'bg-white/5 group-hover:scale-110'}`}>
                                    <Plus size={32} className={`transition-colors ${isDragging ? 'text-emerald-500' : 'text-white/20 group-hover:text-emerald-500'}`} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Upload Report Card</h4>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center px-4">PDF, PNG, or JPG — AI will extract and analyze all grades.</p>
                            </label>
                        ) : (
                            <div className="flex flex-col gap-4 h-full">
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group flex-1 min-h-0">
                                    {preview === 'pdf' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                                            <FileText size={48} className="text-emerald-500/50 mb-4" />
                                            <p className="text-sm font-medium text-white/80">{file?.name}</p>
                                        </div>
                                    ) : (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                        <label className="text-xs font-bold text-white bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/20">
                                            Change File
                                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={startAnalysisProcess}
                                    disabled={!file || isAnalyzing || isProcessing}
                                    className="shrink-0 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isAnalyzing || isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Brain size={18} /><span>Deep Analyze</span></>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Analytics Dashboard */}
                <div className="lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full min-h-0 relative">
                    {/* Header Toolbar */}
                    <div className="bg-white/5 border-b border-white/5 px-6 h-16 flex items-center justify-between shrink-0">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                            <ClipboardCheck size={14} /> Student Intelligence Dashboard
                        </span>
                        {analysis && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveToLibrary} disabled={isSaving}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs hover:bg-white/10 transition-all"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Save
                                </button>
                                <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg font-bold text-xs transition-all border border-emerald-500/20">
                                    <Download size={14} /> Export PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f1115]" id="student-dashboard">
                        {isProcessing || isAnalyzing ? (
                            <NeuralLoader
                                messages={LOADING_MESSAGES}
                                currentStep={loadingStep}
                                progress={progress}
                                accentColor="emerald"
                                label="Analyzing Report"
                            />
                        ) : !analysis ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4 p-8">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                                    <BarChart3 size={40} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">No Analysis Yet</h3>
                                <p className="text-sm text-center max-w-xs text-muted-foreground">Upload a report card to receive a deep-dive neural analysis of student performance, college chances, and career paths.</p>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">

                                {/* 1. Identity Card */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                    className="col-span-1 md:col-span-2 bg-[#161b22] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><User size={120} /></div>

                                    {/* Photo */}
                                    <div className="shrink-0 relative">
                                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-black/50 shadow-2xl relative">
                                            {preview && preview !== 'pdf' ? (
                                                <img src={preview} alt="Student" className="w-full h-full object-cover object-top" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-emerald-900/20 text-emerald-500"><User size={40} /></div>
                                            )}
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                                        </div>
                                        <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg border border-emerald-400">
                                            {analysis.overallPercentage}%
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3 text-center md:text-left z-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight">{analysis.studentName || "Student"}</h2>
                                            <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mt-1">{analysis.gradeClass || "Unknown Grade"}</p>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
                                            &ldquo;{analysis.performanceSummary || "No summary available"}&rdquo;
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {(analysis.strengths || []).slice(0, 4).map((s, i) => (
                                                <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-300 uppercase">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 2. Subject Analysis */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="bg-[#161b22] border border-white/10 p-6 rounded-3xl space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp size={18} /></div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Subject Analysis</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {(analysis.subjects || []).map((subj, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs font-medium text-white mb-1.5">
                                                    <span>{subj.name}</span>
                                                    <span className={subj.marks > 80 ? 'text-green-400' : subj.marks > 60 ? 'text-yellow-400' : 'text-red-400'}>
                                                        {subj.marks}/100 ({subj.grade})
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${subj.marks}%` }}
                                                        transition={{ duration: 1, delay: 0.1 * i }}
                                                        className={`h-full rounded-full ${subj.marks > 80 ? 'bg-gradient-to-r from-green-600 to-emerald-400' : subj.marks > 60 ? 'bg-gradient-to-r from-yellow-600 to-orange-400' : 'bg-gradient-to-r from-red-600 to-pink-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {analysis.subjects?.length === 0 && <p className="text-xs text-white/30 text-center py-4">No subjects extracted</p>}
                                    </div>
                                </motion.div>

                                {/* 3. College Admissions AI */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                    className="bg-[#161b22] border border-white/10 p-6 rounded-3xl space-y-5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><School size={18} /></div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">College Admissions AI</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Top Tier\n(Ivy/IIT)', value: analysis.collegeChances?.topTier || 0, color: 'text-purple-500' },
                                            { label: 'State/Tier 2\nUnivs', value: analysis.collegeChances?.averageTier || 0, color: 'text-blue-500' },
                                        ].map(({ label, value, color }, idx) => (
                                            <div key={idx} className="bg-black/30 rounded-2xl p-4 flex flex-col items-center space-y-2 border border-white/5">
                                                <div className="relative w-16 h-16 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" className="text-white/10" fill="none" />
                                                        <motion.circle
                                                            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" className={color}
                                                            fill="none" strokeDasharray="175"
                                                            initial={{ strokeDashoffset: 175 }}
                                                            animate={{ strokeDashoffset: 175 - (175 * value) / 100 }}
                                                            transition={{ duration: 1.5, delay: 0.3 }}
                                                        />
                                                    </svg>
                                                    <span className="absolute text-xs font-black text-white">{value}%</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest text-center whitespace-pre-line">{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-white/50 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                                        <span className="text-purple-400 font-bold">AI Insight: </span>{analysis.collegeChances?.comment || "No prediction available."}
                                    </p>
                                </motion.div>

                                {/* 4. Career Tracks */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="col-span-1 md:col-span-2 bg-[#161b22] border border-white/10 p-6 rounded-3xl space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Briefcase size={18} /></div>
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Recommended Career Paths</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(analysis.careerSuggestions || []).map((career, i) => (
                                            <div key={i} className="bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white text-sm">{career.role}</h4>
                                                    <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">{career.match}%</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mb-1">{career.stream}</div>
                                                <p className="text-[11px] text-white/50 leading-snug">{career.reason}</p>
                                            </div>
                                        ))}
                                        {analysis.careerSuggestions?.length === 0 && <p className="text-xs text-white/30 py-4">No career paths generated</p>}
                                    </div>
                                </motion.div>

                                {/* 5. Action Plan */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                    className="col-span-1 md:col-span-2 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-500/10 p-6 rounded-3xl space-y-4"
                                >
                                    <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={16} /> Strategic Action Plan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(analysis.recommendations || []).map((rec, i) => (
                                            <div key={i} className="flex gap-3 text-sm text-white/80 bg-black/20 p-3 rounded-xl border border-white/5">
                                                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold mt-0.5">{i + 1}</span>
                                                <span className="leading-5">{rec}</span>
                                            </div>
                                        ))}
                                        {analysis.recommendations?.length === 0 && <p className="text-xs text-white/30 py-4">No recommendations generated</p>}
                                    </div>
                                </motion.div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
