import React, { useState } from 'react';
import { Loader2, Play, RotateCcw, Copy, Check, Download, Trash2, X, PlusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { apiEndpoint, getAuthHeaders, safeFetchJson, callDirectGroqInference } from '../../../utils/api';
import { useAI } from '../../../context/AIContext';
import { ToolField, ToolSchema, generateSmartFallbackOutput } from './ToolStudio';

interface Props {
    tool: ToolSchema;
    onDelete?: (toolId: string) => void;
}

export default function DynamicTool({ tool, onDelete }: Props) {
    const { provider } = useAI();

    const initValues = () => {
        const vals: Record<string, any> = {};
        tool.fields?.forEach(f => {
            vals[f.id] = f.defaultValue ?? (
                f.type === 'toggle' ? false :
                f.type === 'slider' ? (f.min ?? 0) :
                f.type === 'multiselect' || f.type === 'tags' ? [] : ''
            );
        });
        return vals;
    };

    const [values, setValues] = useState<Record<string, any>>(initValues);
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const run = async () => {
        setLoading(true);
        setOutput('');
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/tool-studio/run'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ tool, fieldValues: values, preferredProvider: provider }),
            }).catch(() => null);

            let generatedOutput = '';

            if (res) {
                const parsed = await safeFetchJson<any>(res);
                if (parsed.ok && parsed.data?.success && parsed.data?.output) {
                    generatedOutput = parsed.data.output;
                }
            }

            // Fallback 1: Direct Groq AI inference with populated prompt template
            if (!generatedOutput) {
                let populatedPrompt = tool.promptTemplate || '';
                for (const [key, value] of Object.entries(values)) {
                    const safeValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
                    populatedPrompt = populatedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue);
                }

                if (tool.outputFormat === 'markdown') {
                    populatedPrompt += '\n\nFormat your response with clear Markdown headings, bullet points, and structured sections.';
                }

                const groqResult = await callDirectGroqInference([
                    { role: 'system', content: 'You are a professional AI assistant for teachers. Generate high-quality, accurate, classroom-ready content.' },
                    { role: 'user', content: populatedPrompt }
                ]);

                if (groqResult) {
                    generatedOutput = groqResult;
                }
            }

            // Fallback 2: Deterministic smart structured output
            if (!generatedOutput) {
                generatedOutput = generateSmartFallbackOutput(tool, values);
            }

            setOutput(generatedOutput);
        } catch (e: any) {
            setError(e.message || "Failed to generate tool output.");
        } finally {
            setLoading(false);
        }
    };

    const deleteTool = async () => {
        try {
            // Delete from localStorage
            const local = localStorage.getItem('deephub_custom_tools');
            if (local) {
                try {
                    const tools: ToolSchema[] = JSON.parse(local);
                    if (Array.isArray(tools)) {
                        const filtered = tools.filter(t => t.toolId !== tool.toolId);
                        localStorage.setItem('deephub_custom_tools', JSON.stringify(filtered));
                    }
                } catch {}
            }

            // Also attempt backend delete
            const res = await fetch(apiEndpoint(`/api/tool-studio/${tool.toolId}`), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            }).catch(() => null);

            if (res) {
                await safeFetchJson<any>(res);
            }

            if (tool.toolId) onDelete?.(tool.toolId);
        } catch (err) {
            if (tool.toolId) onDelete?.(tool.toolId);
        }
    };

    const exportAntigravitySkill = () => {
        const skillName = (tool.name || 'custom-tool')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const skillContent = `---
name: ${skillName}
description: ${tool.description || `Generates ${tool.outputLabel || 'output'} for educational and classroom workflows.`}
---

# ${tool.name}

${tool.description}

## Input Fields & Parameters
${tool.fields?.map(f => `- **${f.label}** (\`${f.id}\`): Type \`${f.type}\`${f.placeholder ? ` — ${f.placeholder}` : ''}${f.required ? ' (Required)' : ' (Optional)'}`).join('\n') || 'None'}

## AI Prompt Template
\`\`\`
${tool.promptTemplate}
\`\`\`

## Output Specifications
- **Format**: ${tool.outputFormat || 'markdown'}
- **Output Label**: ${tool.outputLabel || 'Generated Output'}
`;

        const blob = new Blob([skillContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skillName}-SKILL.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const set = (id: string, val: any) => setValues(prev => ({ ...prev, [id]: val }));

    return (
        <div className="w-full space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 flex items-center justify-center text-2xl bg-white/5 border border-white/10 rounded-2xl">
                        {tool.icon || '✨'}
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">{tool.name}</h1>
                        <p className="text-xs text-white/40">{tool.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportAntigravitySkill}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-bold transition-all cursor-pointer shadow-xs"
                        title="Export as standardized Antigravity Agent Skill (SKILL.md)"
                    >
                        <Download size={13}/> Export Antigravity Skill (.md)
                    </button>
                    <button onClick={() => setConfirmDelete(!confirmDelete)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Tool"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>

            {confirmDelete && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                    <p className="text-sm text-red-300">Delete this tool permanently?</p>
                    <div className="flex gap-2">
                        <button onClick={deleteTool} className="px-3 py-1.5 bg-red-500/20 rounded-lg text-xs text-red-300 hover:bg-red-500/30 cursor-pointer">Delete</button>
                        <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/50 cursor-pointer">Cancel</button>
                    </div>
                </div>
            )}

            {/* Input fields */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tool.fields?.map(field => (
                        <FieldInput key={field.id} field={field} value={values[field.id]} onChange={v => set(field.id, v)}/>
                    ))}
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button onClick={run} disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-cyan-900/30"
                >
                    {loading ? <><Loader2 size={18} className="animate-spin"/> Generating...</> : <><Play size={18}/> Generate</>}
                </button>
            </div>

            {/* Output */}
            {output && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">{tool.outputLabel || 'Output'}</span>
                        <div className="flex gap-2">
                            <button onClick={run} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer">
                                <RotateCcw size={12}/> Redo
                            </button>
                            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white transition-colors cursor-pointer">
                                {copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {tool.outputFormat === 'markdown' ? (
                            <div className="prose prose-invert max-w-none prose-sm">
                                <ReactMarkdown>{output}</ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{output}</p>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

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
            {field.type === 'text' && <input type="text" placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={base}/>}
            {field.type === 'textarea' && <textarea rows={3} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={`${base} resize-none`}/>}
            {field.type === 'number' && <input type="number" min={field.min} max={field.max} step={field.step || 1} value={value || ''} onChange={e => onChange(Number(e.target.value))} className={base}/>}
            {field.type === 'select' && (
                <select value={value || ''} onChange={e => onChange(e.target.value)} className={base}>
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            )}
            {field.type === 'multiselect' && (
                <div className="flex flex-wrap gap-2">
                    {field.options?.map(o => {
                        const selected = Array.isArray(value) && value.includes(o);
                        return <button key={o} type="button" onClick={() => onChange(selected ? tags.filter(x => x !== o) : [...tags, o])}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${selected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>{o}</button>;
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
                    <input type="range" min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1} value={value ?? field.min ?? 0} onChange={e => onChange(Number(e.target.value))} className="w-full accent-cyan-500"/>
                    <p className="text-xs text-cyan-400 text-right font-bold">{value ?? field.min ?? 0}</p>
                </div>
            )}
            {field.type === 'tags' && (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(t => <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-200">{t}
                            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="ml-1 text-white/30 hover:text-white cursor-pointer"><X size={10}/></button>
                        </span>)}
                    </div>
                    <div className="flex gap-2">
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { onChange([...tags, tagInput.trim()]); setTagInput(''); e.preventDefault(); }}}
                            placeholder="Type and press Enter"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none"/>
                        <button type="button" onClick={() => { if (tagInput.trim()) { onChange([...tags, tagInput.trim()]); setTagInput(''); }}}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:text-white text-xs cursor-pointer">
                            <PlusCircle size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
