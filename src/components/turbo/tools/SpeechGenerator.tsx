import React, { useState, useRef } from 'react';
import {
    Mic, Sparkles, Download, Save, ChevronDown, ChevronUp,
    RefreshCw, Copy, Check, Clock, Users, Volume2, School,
    GraduationCap, Quote, BookHeart, Feather, Star, Play, Loader2,
    FileText, AlignLeft, SlidersHorizontal, Wand2, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { apiEndpoint, getAuthHeaders } from '../../../utils/api';
import { useAI } from '../../../context/AIContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpeechOpening { salutation: string; hook: string; text: string; }
interface SpeechBodySection { section: string; text: string; transitionLine: string; }
interface SpeechClosing { callToAction: string; thankYou: string; signOff: string; }
interface GeneratedSpeech {
    title: string;
    occasion: string;
    tone: string;
    estimatedDuration: string;
    speakerName: string;
    institution: string;
    opening: SpeechOpening;
    body: SpeechBodySection[];
    quote: string;
    poem: string;
    closing: SpeechClosing;
    keyPhrases: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OCCASIONS = [
    'Annual Day / Prize Distribution',
    'Teachers\' Day',
    'Independence Day / Republic Day',
    'School / College Farewell',
    'Welcome Address (New Students)',
    'Graduation / Convocation',
    'Parent-Teacher Meeting (PTM)',
    'Sports Day',
    'Science & Cultural Fest',
    'Seminar / Workshop Opening',
    'School Foundation Day',
    'Retirement / Farewell (Colleague)',
    'Online Webinar Opening',
    'Custom Occasion',
];

const TONES = [
    { value: 'formal', label: 'Formal', icon: '🎩', desc: 'Professional & dignified' },
    { value: 'inspirational', label: 'Inspirational', icon: '🔥', desc: 'Motivating & uplifting' },
    { value: 'warm', label: 'Warm & Heartfelt', icon: '💛', desc: 'Personal & emotional' },
    { value: 'humorous', label: 'Light & Humorous', icon: '😄', desc: 'Fun with a message' },
    { value: 'scholarly', label: 'Scholarly', icon: '📚', desc: 'Academic & authoritative' },
    { value: 'ceremonial', label: 'Ceremonial', icon: '🏛️', desc: 'Grand & dignified' },
];

const AUDIENCES = [
    'Students Only',
    'Students & Parents',
    'Students, Parents & Staff',
    'Staff & Colleagues',
    'Parents Only',
    'Mixed General Audience',
    'Academic Peers / Faculty',
];

const LANGUAGES = ['English', 'Hinglish (English mixed with Hindi)', 'Formal Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toneGradient = (tone: string) => {
    const map: Record<string, string> = {
        formal: 'from-slate-500/20 to-slate-600/10',
        inspirational: 'from-orange-500/20 to-amber-600/10',
        warm: 'from-yellow-500/20 to-amber-400/10',
        humorous: 'from-emerald-500/20 to-teal-400/10',
        scholarly: 'from-indigo-500/20 to-blue-500/10',
        ceremonial: 'from-violet-500/20 to-purple-500/10',
    };
    return map[tone] || 'from-cyan-500/20 to-blue-500/10';
};

// ─── Export helpers ───────────────────────────────────────────────────────────

const buildDocx = (speech: GeneratedSpeech, template: 'school' | 'college') => {
    const isSchool = template === 'school';
    const primaryColor = isSchool ? '1A56DB' : '6C3FC5';

    const makeHeading = (text: string) =>
        new Paragraph({
            text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
            border: { bottom: { color: primaryColor, size: 6, style: BorderStyle.SINGLE } },
        });

    const para = (text: string, opts: any = {}) =>
        new Paragraph({
            children: [new TextRun({ text, size: 24, font: 'Garamond', ...opts })],
            spacing: { after: 200, line: 360 },
        });

    const italic = (text: string) =>
        new Paragraph({
            children: [new TextRun({ text, italics: true, size: 22, font: 'Garamond', color: '555555' })],
            spacing: { after: 200, line: 340 },
            alignment: AlignmentType.CENTER,
        });

    const children: Paragraph[] = [
        new Paragraph({
            children: [new TextRun({ text: speech.title, bold: true, size: 52, font: 'Cormorant Garamond', color: primaryColor })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `${speech.occasion} • ${isSchool ? '🏫' : '🎓'} ${speech.institution}`, size: 22, color: '777777' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Speaker: ${speech.speakerName}  |  Tone: ${speech.tone}  |  Est. Duration: ${speech.estimatedDuration}`, size: 20, color: '999999' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
        }),

        makeHeading('Opening'),
        para(speech.opening.salutation, { bold: true }),
        italic(`"${speech.opening.hook}"`),
        para(speech.opening.text),

        ...(speech.quote ? [makeHeading('Featured Quote'), italic(`"${speech.quote}"`)] : []),

        ...speech.body.flatMap(s => [makeHeading(s.section), para(s.text), italic(s.transitionLine)]),

        ...(speech.poem ? [makeHeading('A Verse'), italic(speech.poem)] : []),

        makeHeading('Closing'),
        para(speech.closing.callToAction),
        para(speech.closing.thankYou),
        para(speech.closing.signOff, { bold: true }),

        new Paragraph({ spacing: { before: 600, after: 200 } }),
        makeHeading('Key Phrases'),
        ...speech.keyPhrases.map(p => new Paragraph({ children: [new TextRun({ text: `• ${p}`, size: 22, italics: true, color: primaryColor })], spacing: { after: 100 } })),
    ];

    return new Document({ sections: [{ children }] });
};

const exportDocx = async (speech: GeneratedSpeech, template: 'school' | 'college') => {
    const doc = buildDocx(speech, template);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${speech.title.replace(/[^a-z0-9]/gi, '_')}_speech.docx`);
};

const copyToClipboard = (speech: GeneratedSpeech) => {
    const lines = [
        `${speech.title.toUpperCase()}`,
        `${'─'.repeat(60)}`,
        `Occasion: ${speech.occasion} | Speaker: ${speech.speakerName}`,
        `Institution: ${speech.institution} | Est. Duration: ${speech.estimatedDuration}`,
        ``,
        `OPENING`,
        speech.opening.salutation,
        `"${speech.opening.hook}"`,
        speech.opening.text,
        speech.quote ? `\nFEATURED QUOTE\n"${speech.quote}"` : '',
        ...speech.body.flatMap(s => [`\n${s.section.toUpperCase()}`, s.text, s.transitionLine]),
        speech.poem ? `\nVERSE\n${speech.poem}` : '',
        `\nCLOSING`,
        speech.closing.callToAction,
        speech.closing.thankYou,
        speech.closing.signOff,
        `\nKEY PHRASES`,
        ...speech.keyPhrases.map(p => `• ${p}`),
    ];
    return lines.filter(Boolean).join('\n');
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpeechGenerator() {
    const { provider } = useAI();

    // Config state
    const [occasion, setOccasion] = useState('Annual Day / Prize Distribution');
    const [customOccasion, setCustomOccasion] = useState('');
    const [tone, setTone] = useState('formal');
    const [audience, setAudience] = useState('Students & Parents');
    const [speakerName, setSpeakerName] = useState('');
    const [institution, setInstitution] = useState('');
    const [duration, setDuration] = useState(7);
    const [language, setLanguage] = useState('English');
    const [keyPoints, setKeyPoints] = useState('');
    const [includePoem, setIncludePoem] = useState(false);
    const [includeQuote, setIncludeQuote] = useState(true);
    const [templateType, setTemplateType] = useState<'school' | 'college'>('school');

    // UI state
    const [loading, setLoading] = useState(false);
    const [speech, setSpeech] = useState<GeneratedSpeech | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2]));
    const [showConfig, setShowConfig] = useState(true);

    const previewRef = useRef<HTMLDivElement>(null);

    const toggleSection = (i: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    };

    const generate = async () => {
        const finalOccasion = occasion === 'Custom Occasion' ? customOccasion : occasion;
        if (!finalOccasion.trim()) { setError('Please specify an occasion.'); return; }
        setLoading(true);
        setError('');
        setSpeech(null);

        try {
            const res = await fetch(apiEndpoint('/api/speech/generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    occasion: finalOccasion,
                    tone,
                    audience,
                    speakerName,
                    institution,
                    duration,
                    language,
                    keyPoints,
                    includePoem,
                    includeQuote,
                    templateType,
                    preferredProvider: provider,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Generation failed.');
            setSpeech(data.result);
            setShowConfig(false);
            setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!speech) return;
        navigator.clipboard.writeText(copyToClipboard(speech));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full space-y-8 pb-20">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-900/40">
                        <Mic size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Speech Generator</h1>
                        <p className="text-sm text-white/40">Professional teacher speeches for every occasion</p>
                    </div>
                </div>
                {speech && (
                    <button
                        onClick={() => { setSpeech(null); setShowConfig(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all"
                    >
                        <RotateCcw size={14} /> New Speech
                    </button>
                )}
            </div>

            {/* ── Template Toggle ────────────────────────────────────── */}
            <div className="flex gap-3">
                {(['school', 'college'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTemplateType(t)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                            templateType === t
                                ? t === 'school'
                                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                    : 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                    >
                        {t === 'school' ? <School size={16} /> : <GraduationCap size={16} />}
                        {t === 'school' ? 'School / K-12' : 'College / University'}
                    </button>
                ))}
            </div>

            {/* ── Config Panel ───────────────────────────────────────── */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                    >
                        {/* Row 1: Occasion + Tone */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Occasion */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <FileText size={13} /> Occasion
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {OCCASIONS.map(occ => (
                                        <button
                                            key={occ}
                                            onClick={() => setOccasion(occ)}
                                            className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                                                occasion === occ
                                                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-200 font-semibold'
                                                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/20'
                                            }`}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                                {occasion === 'Custom Occasion' && (
                                    <input
                                        type="text"
                                        placeholder="Describe the custom occasion..."
                                        value={customOccasion}
                                        onChange={e => setCustomOccasion(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                                    />
                                )}
                            </div>

                            {/* Tone */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <Volume2 size={13} /> Tone & Style
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {TONES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTone(t.value)}
                                            className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border transition-all text-left ${
                                                tone === t.value
                                                    ? 'bg-violet-600/20 border-violet-500/40 text-white'
                                                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-xl">{t.icon}</span>
                                            <span className="text-sm font-bold">{t.label}</span>
                                            <span className="text-[10px] text-white/40">{t.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Duration Slider */}
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Clock size={13}/> Duration</span>
                                        <span className="text-sm font-bold text-violet-300">{duration} min</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={2} max={20} value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full accent-violet-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/30">
                                        <span>2 min (Quick)</span>
                                        <span>10 min (Standard)</span>
                                        <span>20 min (Full)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Speaker Details + Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Speaker Details */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <Feather size={13} /> Speaker Details
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Speaker Name (e.g., Mrs. Anitha Sharma)"
                                    value={speakerName}
                                    onChange={e => setSpeakerName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="Institution / School / College Name"
                                    value={institution}
                                    onChange={e => setInstitution(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                                />
                                {/* Audience */}
                                <div>
                                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Users size={11}/> Audience</label>
                                    <div className="flex flex-wrap gap-2">
                                        {AUDIENCES.map(a => (
                                            <button key={a} onClick={() => setAudience(a)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                                    audience === a
                                                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-200 font-semibold'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                                                }`}
                                            >{a}</button>
                                        ))}
                                    </div>
                                </div>
                                {/* Language */}
                                <div>
                                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Language</label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                    >
                                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <SlidersHorizontal size={13} /> Extra Configurations
                                </h3>

                                {/* Key Points */}
                                <div>
                                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 block">Key Points to Cover (Optional)</label>
                                    <textarea
                                        rows={4}
                                        placeholder={"e.g.,\n- Celebrate student achievements\n- Thank the support staff\n- Highlight school's vision for the year"}
                                        value={keyPoints}
                                        onChange={e => setKeyPoints(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="space-y-3">
                                    {[
                                        { value: includeQuote, setter: setIncludeQuote, icon: Quote, label: 'Include Inspirational Quote', desc: 'Adds a relevant quote from a great mind', color: 'text-amber-400' },
                                        { value: includePoem, setter: setIncludePoem, icon: BookHeart, label: 'Include an Original Poem / Verse', desc: 'Adds a short poem or poetic verse', color: 'text-pink-400' },
                                    ].map(({ value, setter, icon: Icon, label, desc, color }) => (
                                        <div key={label}
                                            onClick={() => setter(!value)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                                value ? 'border-violet-500/30 bg-violet-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                                            }`}
                                        >
                                            <Icon size={20} className={value ? color : 'text-white/30'} />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-white">{label}</p>
                                                <p className="text-[11px] text-white/40">{desc}</p>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full transition-all ${value ? 'bg-violet-500' : 'bg-white/10'} relative`}>
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">{error}</div>
                        )}
                        <button
                            onClick={generate}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-50 text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-900/40 hover:shadow-violet-900/60"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Crafting Your Speech...</>
                            ) : (
                                <><Wand2 size={20} /> Generate Speech</>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Generated Speech Preview ─────────────────────────── */}
            <AnimatePresence>
                {speech && (
                    <motion.div
                        ref={previewRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all"
                            >
                                {copied ? <><Check size={15} className="text-green-400"/> Copied!</> : <><Copy size={15}/> Copy Text</>}
                            </button>
                            <button onClick={() => exportDocx(speech, templateType)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-sm text-violet-200 hover:text-white transition-all"
                            >
                                <Download size={15}/> Export DOCX
                            </button>
                            <button onClick={() => { setSpeech(null); setShowConfig(true); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all ml-auto"
                            >
                                <RefreshCw size={15}/> Regenerate
                            </button>
                        </div>

                        {/* Speech Document */}
                        <div className={`bg-gradient-to-br ${toneGradient(speech.tone)} border border-white/10 rounded-3xl overflow-hidden`}>
                            {/* Document Header */}
                            <div className="px-8 py-8 border-b border-white/10 text-center space-y-2">
                                <div className="flex justify-center gap-3 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300">
                                        {speech.occasion}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50">
                                        {speech.tone}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 flex items-center gap-1">
                                        <Clock size={10}/> {speech.estimatedDuration}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-white leading-tight">{speech.title}</h2>
                                <p className="text-white/50 text-sm">{speech.speakerName} • {speech.institution}</p>
                            </div>

                            {/* Opening */}
                            <div className="px-8 py-6 space-y-4 border-b border-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400">
                                    <Play size={12}/> Opening
                                </div>
                                <p className="text-white font-bold text-lg leading-relaxed">{speech.opening.salutation}</p>
                                <div className="pl-4 border-l-2 border-violet-500/40 italic text-white/80">
                                    "{speech.opening.hook}"
                                </div>
                                <div className="text-white/80 leading-relaxed whitespace-pre-line">{speech.opening.text}</div>
                            </div>

                            {/* Quote */}
                            {speech.quote && (
                                <div className="px-8 py-5 border-b border-white/5 bg-amber-500/5">
                                    <div className="flex items-start gap-4">
                                        <Quote size={32} className="text-amber-400/40 flex-shrink-0 mt-1" />
                                        <p className="text-amber-100/90 italic text-lg leading-relaxed">{speech.quote}</p>
                                    </div>
                                </div>
                            )}

                            {/* Body Sections */}
                            {speech.body.map((section, i) => (
                                <div key={i} className="border-b border-white/5">
                                    <button
                                        onClick={() => toggleSection(i)}
                                        className="w-full flex items-center justify-between px-8 py-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Star size={14} className="text-violet-400/60"/>
                                            <span className="text-sm font-bold text-white">{section.section}</span>
                                        </div>
                                        {expandedSections.has(i) ? <ChevronUp size={16} className="text-white/30"/> : <ChevronDown size={16} className="text-white/30"/>}
                                    </button>
                                    <AnimatePresence>
                                        {expandedSections.has(i) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-8 pb-6 space-y-3">
                                                    <p className="text-white/80 leading-relaxed whitespace-pre-line">{section.text}</p>
                                                    {section.transitionLine && (
                                                        <p className="text-violet-300/70 italic text-sm pl-4 border-l border-violet-500/30">{section.transitionLine}</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Poem */}
                            {speech.poem && (
                                <div className="px-8 py-6 border-b border-white/5 bg-pink-500/5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-pink-400 mb-4">
                                        <BookHeart size={12}/> A Verse
                                    </div>
                                    <p className="text-pink-100/80 italic whitespace-pre-line leading-relaxed text-center">{speech.poem}</p>
                                </div>
                            )}

                            {/* Closing */}
                            <div className="px-8 py-6 border-b border-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">
                                    <AlignLeft size={12}/> Closing
                                </div>
                                <div className="space-y-4">
                                    <p className="text-white/80 leading-relaxed">{speech.closing.callToAction}</p>
                                    <p className="text-white/80 leading-relaxed">{speech.closing.thankYou}</p>
                                    <p className="text-white font-bold text-lg">{speech.closing.signOff}</p>
                                </div>
                            </div>

                            {/* Key Phrases */}
                            {speech.keyPhrases?.length > 0 && (
                                <div className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">
                                        <Sparkles size={12}/> Key Phrases
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {speech.keyPhrases.map((phrase, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-200 text-xs italic">
                                                "{phrase}"
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reconfigure button */}
                        <button
                            onClick={() => setShowConfig(v => !v)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <SlidersHorizontal size={14}/> {showConfig ? 'Hide' : 'Show'} Configuration
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
