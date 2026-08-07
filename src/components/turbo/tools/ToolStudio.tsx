import React, { useState, useRef, useCallback } from 'react';
import {
    Wand2, Loader2, Save, Play, ChevronRight, ChevronDown, ChevronUp,
    Pencil, Trash2, Check, X, Sparkles, RotateCcw, Info, PlusCircle, Layers, Mic, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { apiEndpoint, getAuthHeaders } from '../../../utils/api';
import { useAI } from '../../../context/AIContext';

interface ToolField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'toggle' | 'slider' | 'tags';
    placeholder?: string;
    required?: boolean;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: any;
}

interface ToolSchema {
    toolId?: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    outputLabel: string;
    outputFormat: 'text' | 'markdown';
    fields: ToolField[];
    promptTemplate: string;
    sampleOutput?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    Writing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Planning: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Assessment: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Communication: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    Admin: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    Creative: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

export default function ToolStudio({ onToolSaved }: { onToolSaved?: (tool: ToolSchema) => void }) {
    const { provider } = useAI();

    // Step 1: Describe
    const [description, setDescription] = useState('');
    const [generatingSchema, setGeneratingSchema] = useState(false);

    // Step 2: Review schema
    const [schema, setSchema] = useState<ToolSchema | null>(null);
    const [editingSchema, setEditingSchema] = useState(false);
    const [editedSchema, setEditedSchema] = useState<ToolSchema | null>(null);

    // Step 3: Test run
    const [testValues, setTestValues] = useState<Record<string, any>>({});
    const [testOutput, setTestOutput] = useState('');
    const [runningTest, setRunningTest] = useState(false);

    // Save
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [error, setError] = useState('');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [expandedPrompt, setExpandedPrompt] = useState(false);

    // ── Voice dictation ──────────────────────────────────
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        let finalSoFar = description;
        rec.onresult = (e: any) => {
            let interim = '';
            let final = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) final += t;
                else interim += t;
            }
            if (final) finalSoFar = (finalSoFar + ' ' + final).trimStart();
            setDescription(finalSoFar + (interim ? ' ' + interim : ''));
        };
        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);
        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
    }, [description]);

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };
    // ─────────────────────────────────────────────────────

    const generateSchema = async () => {
        if (!description.trim()) return;
        setGeneratingSchema(true);
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/tool-studio/generate-schema'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ description, preferredProvider: provider }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const toolSchema = { ...data.schema, toolId: `tool_${Date.now()}` };
            setSchema(toolSchema);
            setEditedSchema(toolSchema);
            // Seed test values with defaults
            const defaults: Record<string, any> = {};
            toolSchema.fields.forEach((f: ToolField) => {
                defaults[f.id] = f.defaultValue ?? (f.type === 'toggle' ? false : f.type === 'slider' ? (f.min ?? 0) : '');
            });
            setTestValues(defaults);
            setStep(2);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setGeneratingSchema(false);
        }
    };

    const runTest = async () => {
        if (!schema) return;
        setRunningTest(true);
        setTestOutput('');
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/tool-studio/run'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    tool: editedSchema || schema,
                    fieldValues: testValues,
                    preferredProvider: provider,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setTestOutput(data.output);
            setStep(3);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setRunningTest(false);
        }
    };

    const saveTool = async () => {
        if (!editedSchema) return;
        setSaving(true);
        try {
            const res = await fetch(apiEndpoint('/api/tool-studio/save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ tool: editedSchema }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSaved(true);
            onToolSaved?.(data.tool);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const reset = () => {
        setSchema(null);
        setEditedSchema(null);
        setTestOutput('');
        setDescription('');
        setStep(1);
        setSaved(false);
        setError('');
    };

    const updateField = (fieldId: string, key: keyof ToolField, value: any) => {
        if (!editedSchema) return;
        setEditedSchema({
            ...editedSchema,
            fields: editedSchema.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f),
        });
    };

    return (
        <div className="w-full space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/40">
                        <Wand2 size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Tool Studio</h1>
                        <p className="text-sm text-white/40">Build your own AI tool in 30 seconds</p>
                    </div>
                </div>
                {step > 1 && (
                    <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all">
                        <RotateCcw size={14} /> Start Over
                    </button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
                {[
                    { n: 1, label: 'Describe' },
                    { n: 2, label: 'Review & Edit' },
                    { n: 3, label: 'Test & Save' },
                ].map(({ n, label }, i) => (
                    <React.Fragment key={n}>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            step === n ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' :
                            step > n  ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                        'bg-white/5 border border-white/10 text-white/30'
                        }`}>
                            {step > n ? <Check size={12}/> : <span>{n}</span>}
                            {label}
                        </div>
                        {i < 2 && <ChevronRight size={14} className="text-white/20 flex-shrink-0"/>}
                    </React.Fragment>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 flex items-center gap-3">
                    <X size={16}/> {error}
                </div>
            )}

            {/* ── STEP 1: Describe ────────────────────────────────── */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-6">
                        <div className="flex items-start gap-3 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                            <Info size={16} className="text-cyan-400 mt-0.5 flex-shrink-0"/>
                            <p className="text-sm text-cyan-200/70">
                                Describe the tool you need in plain English. The AI will design the input fields, prompt, and output format automatically.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest">Describe Your Tool</label>
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    title={isListening ? 'Stop dictation' : 'Dictate your description'}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        isListening
                                            ? 'bg-red-500/20 border border-red-500/30 text-red-300 animate-pulse'
                                            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {isListening ? <><MicOff size={13}/> Stop</> : <><Mic size={13}/> Dictate</>}
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    rows={5}
                                    placeholder={"Examples:\n• A tool that generates a personalised student feedback comment for any subject and grade\n• A parent meeting agenda generator for PTM\n• A tool to write warning letters for student behaviour issues"}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none resize-none transition-all ${
                                        isListening
                                            ? 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                            : 'border-white/10 focus:border-cyan-500/50'
                                    }`}
                                />
                                {isListening && (
                                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-red-400 font-bold">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"/>
                                        Listening...
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={generateSchema}
                            disabled={generatingSchema || !description.trim()}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-900/40"
                        >
                            {generatingSchema ? <><Loader2 size={18} className="animate-spin"/> Designing Your Tool...</> : <><Sparkles size={18}/> Design My Tool</>}
                        </button>
                    </div>

                    {/* Example prompts */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Quick Examples — click to use</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'A student feedback generator for any subject, grade, and performance level',
                                'A tool that creates personalised timetables for students with extra coaching needs',
                                'A tool to generate fun quiz questions from any topic for class warm-ups',
                                'A parent email generator for absent students',
                                'A rubric builder for any assignment type and grade',
                            ].map(ex => (
                                <button key={ex} onClick={() => setDescription(ex)}
                                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white transition-all text-left"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── STEP 2: Review Schema ───────────────────────────── */}
            {step === 2 && editedSchema && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Tool Identity */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Tool Identity</h3>
                            <button onClick={() => setEditingSchema(!editingSchema)}
                                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white transition-colors"
                            >
                                <Pencil size={12}/> {editingSchema ? 'Done Editing' : 'Edit'}
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-4xl">{editedSchema.icon}</div>
                            <div className="flex-1 space-y-2">
                                {editingSchema ? (
                                    <>
                                        <input value={editedSchema.name} onChange={e => setEditedSchema({...editedSchema, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"/>
                                        <input value={editedSchema.description} onChange={e => setEditedSchema({...editedSchema, description: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-cyan-500/50"/>
                                        <div className="flex gap-2">
                                            <input value={editedSchema.icon} onChange={e => setEditedSchema({...editedSchema, icon: e.target.value})}
                                                className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-cyan-500/50"/>
                                            <select value={editedSchema.outputFormat} onChange={e => setEditedSchema({...editedSchema, outputFormat: e.target.value as any})}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                                                <option value="text">Plain Text Output</option>
                                                <option value="markdown">Markdown Output</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-black text-white">{editedSchema.name}</h2>
                                        <p className="text-sm text-white/60">{editedSchema.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${CATEGORY_COLORS[editedSchema.category] || 'text-white/50 bg-white/5 border-white/10'}`}>
                                                {editedSchema.category}
                                            </span>
                                            <span className="text-[10px] text-white/40">{editedSchema.outputFormat === 'markdown' ? '📝 Markdown' : '📄 Plain Text'} output</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Input Fields ({editedSchema.fields.length})</h3>
                        <div className="space-y-3">
                            {editedSchema.fields.map((field) => (
                                <div key={field.id} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-cyan-400 uppercase">{field.type.slice(0,2)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {editingSchema ? (
                                            <div className="space-y-1.5">
                                                <input value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"/>
                                                <input value={field.placeholder || ''} onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white/50 focus:outline-none"/>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-white">{field.label}</p>
                                                {field.placeholder && <p className="text-[11px] text-white/30 truncate">{field.placeholder}</p>}
                                                {field.options && <p className="text-[10px] text-white/40">{field.options.join(' • ')}</p>}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${field.required ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-white/20 border-white/10'}`}>
                                            {field.required ? 'REQ' : 'OPT'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Template */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                        <button onClick={() => setExpandedPrompt(!expandedPrompt)}
                            className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors"
                        >
                            <span>AI Prompt Template</span>
                            {expandedPrompt ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                        <AnimatePresence>
                            {expandedPrompt && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    {editingSchema ? (
                                        <textarea rows={8} value={editedSchema.promptTemplate}
                                            onChange={e => setEditedSchema({...editedSchema, promptTemplate: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-green-300 focus:outline-none resize-none"/>
                                    ) : (
                                        <pre className="text-xs font-mono text-green-300/80 bg-black/40 p-4 rounded-xl whitespace-pre-wrap overflow-auto max-h-48">
                                            {editedSchema.promptTemplate}
                                        </pre>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Test Run */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Test Your Tool</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editedSchema.fields.map(field => (
                                <FieldInput key={field.id} field={field} value={testValues[field.id]} onChange={v => setTestValues({...testValues, [field.id]: v})}/>
                            ))}
                        </div>
                        <button onClick={runTest} disabled={runningTest}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                        >
                            {runningTest ? <><Loader2 size={18} className="animate-spin"/> Running...</> : <><Play size={18}/> Run Test</>}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── STEP 3: Output + Save ───────────────────────────── */}
            {step === 3 && editedSchema && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Output */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <span>{editedSchema.icon}</span> {editedSchema.outputLabel || 'Generated Output'}
                            </h3>
                            <button onClick={runTest} disabled={runningTest}
                                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white"
                            >
                                <RotateCcw size={12}/> Regenerate
                            </button>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                            {editedSchema.outputFormat === 'markdown' ? (
                                <div className="prose prose-invert max-w-none prose-sm">
                                    <ReactMarkdown>{testOutput}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{testOutput}</p>
                            )}
                        </div>
                    </div>

                    {/* Save */}
                    {!saved ? (
                        <button onClick={saveTool} disabled={saving}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/40"
                        >
                            {saving ? <><Loader2 size={18} className="animate-spin"/> Saving...</> : <><Save size={18}/> Save to My Tools</>}
                        </button>
                    ) : (
                        <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 font-black text-sm">
                            <Check size={18}/> Tool Saved! Check your sidebar.
                        </div>
                    )}

                    <button onClick={() => setStep(2)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Pencil size={14}/> Back to Edit
                    </button>
                </motion.div>
            )}
        </div>
    );
}

// ─── FieldInput: renders the right input for any field type ──────────────────

function FieldInput({ field, value, onChange }: { field: ToolField; value: any; onChange: (v: any) => void }) {
    const base = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50";

    const [tagInput, setTagInput] = useState('');
    const tags: string[] = Array.isArray(value) ? value : [];

    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-400">*</span>}
            </label>

            {field.type === 'text' && (
                <input type="text" placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={base}/>
            )}
            {field.type === 'textarea' && (
                <textarea rows={3} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={`${base} resize-none`}/>
            )}
            {field.type === 'number' && (
                <input type="number" min={field.min} max={field.max} step={field.step || 1} value={value || ''} onChange={e => onChange(Number(e.target.value))} className={base}/>
            )}
            {field.type === 'select' && (
                <select value={value || ''} onChange={e => onChange(e.target.value)} className={base}>
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            )}
            {field.type === 'multiselect' && (
                <div className="flex flex-wrap gap-2">
                    {field.options?.map(o => {
                        const selected = Array.isArray(value) ? value.includes(o) : false;
                        return (
                            <button key={o} type="button"
                                onClick={() => {
                                    const arr = Array.isArray(value) ? [...value] : [];
                                    onChange(selected ? arr.filter(x => x !== o) : [...arr, o]);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                            >{o}</button>
                        );
                    })}
                </div>
            )}
            {field.type === 'toggle' && (
                <div onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full cursor-pointer transition-all ${value ? 'bg-cyan-500' : 'bg-white/10'} relative`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-0.5'}`}/>
                </div>
            )}
            {field.type === 'slider' && (
                <div className="space-y-1">
                    <input type="range" min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1}
                        value={value ?? field.min ?? 0} onChange={e => onChange(Number(e.target.value))}
                        className="w-full accent-cyan-500"/>
                    <p className="text-xs text-cyan-400 text-right font-bold">{value ?? field.min ?? 0}</p>
                </div>
            )}
            {field.type === 'tags' && (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(t => (
                            <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-200">
                                {t}
                                <button onClick={() => onChange(tags.filter(x => x !== t))}><X size={10}/></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { onChange([...tags, tagInput.trim()]); setTagInput(''); }}}
                            placeholder="Type and press Enter"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none"/>
                        <button onClick={() => { if (tagInput.trim()) { onChange([...tags, tagInput.trim()]); setTagInput(''); }}}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:text-white text-xs">
                            <PlusCircle size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
