import React, { useState, useRef } from 'react';
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header,
    AlignmentType, WidthType, BorderStyle, convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import {
    FileText, Upload, Plus, Sparkles, Download, Printer, Settings,
    School, Check, Loader2, FileEdit, Database, GraduationCap, AlertCircle
} from 'lucide-react';
import { apiEndpoint, getAuthHeaders, safeFetchJson, turboBrain, useTurboBrain } from '../../../utils/api';

// ── TYPES ─────────────────────────────────────────
const TEMPLATES = [
    { id: 'permission', label: 'Permission Slip', icon: FileText, prompt: "Draft a formal school permission slip for a field trip/event." },
    { id: 'certificate', label: 'Certificate', icon: Check, prompt: "Draft a student achievement certificate wording." },
    { id: 'warning', label: 'Warning Letter', icon: FileEdit, prompt: "Draft a formal disciplinary warning letter for a student." },
    { id: 'notice', label: 'Event Notice', icon: Plus, prompt: "Draft a formal notice for an upcoming school event/holiday." },
] as const;

type Template = typeof TEMPLATES[number];

interface BrandingDetails { name: string; address: string; phone: string; email: string; motto: string; }
interface Branding { type: 'upload' | 'manual'; headerImage: string | null; details: BrandingDetails; }

interface DocResult {
    documentTitle: string;
    refNumber: string;
    date: string;
    to: string;
    subject: string;
    body: string[];
    closing: string;
    signatoryName: string;
    signatoryTitle: string;
    footer: string;
}

export default function DocumentSecretary() {
    const { recentMemories: brainMemories, rememberPrompt: cacheInTurboBrain } = useTurboBrain('document-secretary');
    const [activeTab, setActiveTab] = useState<'branding' | 'templates' | 'editor'>('branding');
    const [templateType, setTemplateType] = useState<'school' | 'college'>('school');
    const [branding, setBranding] = useState<Branding>({
        type: 'upload', headerImage: null,
        details: { name: '', address: '', phone: '', email: '', motto: '' }
    });
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [userInput, setUserInput] = useState('');
    const [docResult, setDocResult] = useState<DocResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => { if (event.target?.result) setBranding({ ...branding, headerImage: event.target.result as string }); };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || !userInput) return;
        cacheInTurboBrain(userInput, { template: selectedTemplate.id, school: branding.details.name });
        setIsGenerating(true); setError(null);
        try {
            const response = await fetch(apiEndpoint("/api/secretary/generate"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    template: selectedTemplate.id,
                    docType: selectedTemplate.label,
                    context: userInput,
                    branding: branding.type === 'manual' ? branding.details : null,
                    templateType,
                })
            }).catch(() => null);

            let data: any = {};
            if (response) {
                const parsed = await safeFetchJson<any>(response);
                if (parsed.ok && parsed.data) data = parsed.data;
            }

            const doc = (data.success && data.result) ? data.result : {
                subject: `${selectedTemplate.label.toUpperCase()} - OFFICIAL NOTIFICATION`,
                date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                recipient: 'To whom it may concern / Respected Parents & Students,',
                body: `This is an official communication regarding: ${userInput}.\n\nPlease review the stated terms and guidelines carefully. All relevant academic and institutional standards are to be strictly adhered to.`,
                signOff: 'Sincerely,',
                authority: branding.details.name || 'Principal & Institutional Head',
                bullets: ['Mandatory compliance required', 'For official record and documentation', 'Contact administrative office for inquiries']
            };

            setDocResult(doc);
            setActiveTab('editor');
        } catch (err: any) {
            setError(err.message || 'Failed to synthesize document');
        } finally { setIsGenerating(false); }
    };

    const handleSaveToLibrary = async () => {
        if (!docResult) return;
        setIsSaving(true);
        const item = {
            id: `doc_${Date.now()}`,
            type: 'secretary-doc',
            title: `${selectedTemplate?.label || 'Document'} - ${docResult.subject || 'Official Communication'}`,
            content: JSON.stringify(docResult),
            timestamp: new Date().toISOString(),
            metadata: { template: selectedTemplate?.id, templateType, timestamp: new Date().toISOString() }
        };
        try {
            // Save to localStorage
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

    // ── DOCX EXPORT ────────────────────────────────
    const handleExportDOCX = async () => {
        if (!docResult) return;
        const MARGIN = convertInchesToTwip(1);
        const schoolName = branding.details.name || 'INSTITUTION NAME';

        const headerLines: Paragraph[] = [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: schoolName.toUpperCase(), bold: true, size: 28, font: 'Times New Roman' })] }),
        ];
        if (branding.details.address) {
            headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: branding.details.address, size: 18, font: 'Times New Roman' })] }));
        }
        if (branding.details.phone || branding.details.email) {
            headerLines.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${branding.details.phone}${branding.details.phone && branding.details.email ? ' | ' : ''}${branding.details.email}`, size: 18, font: 'Times New Roman' })] }));
        }

        const bodyChildren: Paragraph[] = [];

        // Ref & Date
        bodyChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Ref: ${docResult.refNumber}`, size: 20, font: 'Times New Roman' }),
            new TextRun({ text: `\t\t\t\tDate: ${docResult.date}`, size: 20, font: 'Times New Roman' }),
        ], spacing: { before: 300 } }));

        // To
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `To: ${docResult.to}`, size: 20, font: 'Times New Roman' })], spacing: { before: 200 } }));

        // Subject
        bodyChildren.push(new Paragraph({ children: [
            new TextRun({ text: 'Subject: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: docResult.subject, bold: true, underline: {}, size: 22, font: 'Times New Roman' }),
        ], spacing: { before: 200, after: 200 } }));

        // Body
        docResult.body.forEach(para => {
            bodyChildren.push(new Paragraph({ children: [new TextRun({ text: para, size: 22, font: 'Times New Roman' })], spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED }));
        });

        // Closing
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: docResult.closing, size: 22, font: 'Times New Roman' })], spacing: { before: 300 } }));
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: docResult.signatoryName, bold: true, size: 22, font: 'Times New Roman' })], spacing: { before: 400 } }));
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: docResult.signatoryTitle, size: 20, font: 'Times New Roman' })] }));

        // Footer
        if (docResult.footer) {
            bodyChildren.push(new Paragraph({ children: [new TextRun({ text: docResult.footer, italics: true, size: 16, font: 'Times New Roman', color: '666666' })], spacing: { before: 400 } }));
        }

        const doc = new Document({
            sections: [{ properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, headers: { default: new Header({ children: headerLines }) }, children: bodyChildren }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${(docResult.documentTitle || 'Document').replace(/[^a-zA-Z0-9 ]/g, '').trim()}.docx`);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-8 gap-4">
                <div className="flex items-center gap-2 bg-[#0a0c10] border border-white/5 p-2 rounded-2xl w-full lg:w-fit overflow-x-auto">
                    {(['branding', 'templates', 'editor'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 lg:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><FileEdit size={20} /></div>
                    <div className="hidden lg:block">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">The Secretary</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold">Document Architect</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-200 mb-4">
                    <AlertCircle size={20} /><p>{error}</p>
                </div>
            )}

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 flex-1 min-h-0 relative z-10">
                {/* LEFT PANEL */}
                <div className="lg:col-span-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2 relative z-20 max-h-[60vh] lg:max-h-full">
                    {activeTab === 'branding' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                        <School className="text-blue-500" /> Branding Vault
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Set your institution identity for all documents.</p>
                                </div>

                                {/* Template Selector */}
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">Template Style</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['school', 'college'] as const).map(t => (
                                            <button key={t} onClick={() => setTemplateType(t)}
                                                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-2 ${templateType === t ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                                                {t === 'school' ? <School size={16} /> : <GraduationCap size={16} />}
                                                {t === 'school' ? 'School' : 'College'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setBranding({ ...branding, type: 'upload' })} className={`p-6 rounded-2xl border transition-all text-center space-y-3 ${branding.type === 'upload' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                        <Upload className={branding.type === 'upload' ? 'text-blue-500 mx-auto' : 'text-white/20 mx-auto'} />
                                        <span className="block text-[8px] font-black uppercase tracking-widest">Letterhead Upload</span>
                                    </button>
                                    <button onClick={() => setBranding({ ...branding, type: 'manual' })} className={`p-6 rounded-2xl border transition-all text-center space-y-3 ${branding.type === 'manual' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                        <Settings className={branding.type === 'manual' ? 'text-blue-500 mx-auto' : 'text-white/20 mx-auto'} />
                                        <span className="block text-[8px] font-black uppercase tracking-widest">Manual Setup</span>
                                    </button>
                                </div>

                                {branding.type === 'upload' ? (
                                    <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all overflow-hidden relative">
                                        <input type="file" className="hidden" onChange={handleHeaderUpload} accept="image/*" />
                                        {branding.headerImage ? (
                                            <img src={branding.headerImage} alt="Header" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                                <Plus size={32} /><span className="text-[10px] uppercase font-black tracking-widest text-center">Click to upload</span>
                                            </div>
                                        )}
                                    </label>
                                ) : (
                                    <div className="space-y-4">
                                        {(['name', 'address', 'phone', 'email'] as const).map(field => (
                                            <div key={field} className="space-y-1.5">
                                                <label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">{field}</label>
                                                <input type="text" value={branding.details[field]}
                                                    onChange={e => setBranding({ ...branding, details: { ...branding.details, [field]: e.target.value } })}
                                                    placeholder={`Enter Institution ${field}`}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 transition-all outline-none" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setActiveTab('templates')} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[0.98] transition-all text-xs">Save Branding</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 space-y-8 shadow-xl">
                                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <Plus className="text-blue-500" /> Choose Template
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {TEMPLATES.map(tmpl => (
                                        <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl)}
                                            className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 group ${selectedTemplate?.id === tmpl.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedTemplate?.id === tmpl.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-muted-foreground group-hover:text-white'}`}>
                                                <tmpl.icon size={18} />
                                            </div>
                                            <span className="block text-sm font-bold">{tmpl.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedTemplate && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Contextual Details</label>
                                        <textarea rows={3} value={userInput} onChange={e => setUserInput(e.target.value)}
                                            placeholder="Example: Field trip to Science Museum for Class 10 on Friday, Fee ₹500/-"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:border-blue-500 transition-all outline-none resize-none leading-relaxed" />

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
                                                            onClick={() => setUserInput(m.userPrompt)}
                                                            className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all truncate max-w-[200px] cursor-pointer"
                                                            title={m.userPrompt}
                                                        >
                                                            {m.userPrompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={handleGenerate} disabled={isGenerating}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[0.99]">
                                            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Generate Draft</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'editor' && (
                        <div className="space-y-6">
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
                                    <Check size={32} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Draft Ready!</h3>
                                <p className="text-sm text-blue-400 font-medium">Your {templateType} document is ready in the preview panel.</p>
                                <button onClick={() => setActiveTab('templates')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white underline underline-offset-4">
                                    Refine Template
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: PREVIEW */}
                <div className="lg:col-span-8 bg-[#111625] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[800px] lg:h-[calc(100vh-140px)] relative backdrop-blur-md">
                    <div className="bg-[#0a0e1a]/80 border-b border-white/10 px-6 h-14 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                            <Printer size={14} /> Document Preview
                        </span>
                        {docResult && (
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                >
                                    Print / PDF
                                </button>
                                <button onClick={handleSaveToLibrary} disabled={isSaving}
                                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />} Save
                                </button>
                                <button onClick={handleExportDOCX}
                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
                                    <Download size={13} /> Export DOCX
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-[#525659] custom-scrollbar relative flex justify-center">
                        <div className="bg-white text-black shadow-2xl min-h-[297mm] w-full max-w-[210mm] mx-auto origin-top p-8 rounded-sm"
                            style={{ fontFamily: "'Times New Roman', serif" }}>

                            {/* Letterhead */}
                            <div style={{ paddingBottom: '12px', marginBottom: '16px', borderBottom: '3px solid #1d4ed8' }}>
                                {branding.type === 'upload' && branding.headerImage ? (
                                    <img src={branding.headerImage} alt="Header" style={{ maxHeight: '80px', width: '100%', objectFit: 'contain' }} />
                                ) : branding.type === 'manual' && branding.details.name ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <h1 style={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, color: '#1d4ed8' }}>{branding.details.name}</h1>
                                        {branding.details.address && <p style={{ fontSize: '10px', color: '#666', margin: '4px 0' }}>{branding.details.address}</p>}
                                        {(branding.details.phone || branding.details.email) && (
                                            <p style={{ fontSize: '10px', color: '#666', margin: '2px 0' }}>
                                                {branding.details.phone}{branding.details.phone && branding.details.email ? ' | ' : ''}{branding.details.email}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', fontSize: '12px', padding: '20px 0' }}>
                                        Letterhead Area — Set up branding in the left panel
                                    </div>
                                )}
                            </div>

                            {/* Document Content */}
                            <div style={{ padding: '0 20mm 15mm 20mm' }}>
                                {!docResult ? (
                                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#ccc' }}>
                                        <FileEdit size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                        <p style={{ fontSize: '14px', fontStyle: 'italic' }}>Choose a template and add context to generate a document.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Document Title */}
                                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #333', display: 'inline-block', paddingBottom: '4px' }}>
                                                {docResult.documentTitle}
                                            </h2>
                                        </div>

                                        {/* Ref & Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '12px' }}>
                                            <span><b>Ref:</b> {docResult.refNumber}</span>
                                            <span><b>Date:</b> {docResult.date}</span>
                                        </div>

                                        {/* To */}
                                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                            <b>To:</b> {docResult.to}
                                        </div>

                                        {/* Subject */}
                                        <div style={{ fontSize: '12px', marginBottom: '16px' }}>
                                            <b>Subject:</b> <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{docResult.subject}</span>
                                        </div>

                                        {/* Body */}
                                        <div style={{ fontSize: '12px', lineHeight: '1.8', textAlign: 'justify' }}>
                                            {docResult.body.map((para, i) => (
                                                <p key={i} style={{ marginBottom: '10px', textIndent: '24px' }}>{para}</p>
                                            ))}
                                        </div>

                                        {/* Closing & Signature */}
                                        <div style={{ marginTop: '40px', fontSize: '12px' }}>
                                            <p>{docResult.closing}</p>
                                            <div style={{ marginTop: '40px' }}>
                                                <div style={{ width: '150px', borderTop: '1px solid #333', paddingTop: '4px' }}>
                                                    <p style={{ fontWeight: 'bold' }}>{docResult.signatoryName}</p>
                                                    <p style={{ color: '#666', fontSize: '11px' }}>{docResult.signatoryTitle}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        {docResult.footer && (
                                            <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '9px', fontStyle: 'italic', color: '#888' }}>
                                                {docResult.footer}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-0" />
        </div>
    );
}
