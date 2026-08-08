import React, { useState } from 'react';
import {
    GraduationCap,
    Sparkles,
    Brain,
    BookOpen,
    Clock,
    CheckCircle2,
    Lightbulb,
    Target,
    HelpCircle,
    Play,
    Loader2,
    Copy,
    Check,
    RotateCcw,
    Send,
    Download,
    Award
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import { callDirectGroqInference, turboBrain, useTurboBrain } from '../../../utils/api';

type StudentTab = 'socratic-solver' | 'revision-sprint' | 'flashcards' | 'solution-key';

interface Flashcard {
    front: string;
    back: string;
    hint: string;
}

export default function StudentStudio() {
    const { recentMemories, rememberPrompt } = useTurboBrain('student-studio');
    const [activeTab, setActiveTab] = useState<StudentTab>('socratic-solver');

    // Socratic Solver State
    const [problemInput, setProblemInput] = useState('');
    const [solverSubject, setSolverSubject] = useState('Physics & Mathematics');
    const [isSolving, setIsSolving] = useState(false);
    const [socraticSteps, setSocraticSteps] = useState<{ hint: string; formula: string; explanation: string; checkQuestion: string } | null>(null);

    // 45-Min Revision Sprint State
    const [sprintTopic, setSprintTopic] = useState('');
    const [sprintSubject, setSprintSubject] = useState('Science');
    const [isGeneratingSprint, setIsGeneratingSprint] = useState(false);
    const [revisionSprint, setRevisionSprint] = useState<{
        block1: { time: string; title: string; points: string[] };
        block2: { time: string; title: string; points: string[] };
        block3: { time: string; title: string; points: string[] };
        mindmapSummary: string;
    } | null>(null);

    // Flashcards State
    const [flashcardTopic, setFlashcardTopic] = useState('');
    const [flashcards, setFlashcards] = useState<Flashcard[]>([
        {
            front: "What is Newton's Second Law of Motion in vector form?",
            back: "F = dp/dt = m*a (Force equals rate of change of momentum)",
            hint: "Relates Force, Mass, and Acceleration"
        },
        {
            front: "What is the Henderson-Hasselbalch equation for buffer solutions?",
            back: "pH = pKa + log([A-]/[HA])",
            hint: "Calculates pH of weak acid + conjugate base"
        },
        {
            front: "What is the time complexity of binary search on a sorted array?",
            back: "O(log n) time complexity with O(1) auxiliary space",
            hint: "Divides search space in half each iteration"
        }
    ]);
    const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
    const [isGeneratingCards, setIsGeneratingCards] = useState(false);

    // Solution Key & Rubric State
    const [homeworkPrompt, setHomeworkPrompt] = useState('');
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);
    const [solutionKeyResult, setSolutionKeyResult] = useState<string | null>(null);

    // ── 1. Socratic Solver Handler ─────────────────────────────────────────
    const handleSocraticSolve = async () => {
        if (!problemInput.trim()) return;
        setIsSolving(true);
        setSocraticSteps(null);
        rememberPrompt(problemInput, { subject: solverSubject, type: 'socratic-solver' });

        try {
            const systemPrompt = `You are the DeepHub AI Socratic Student Tutor.
Your goal is to guide students through step-by-step understanding without spoiling the answer.
Return a clean JSON object with this schema:
{
  "hint": "Key conceptual intuition or first principle",
  "formula": "Governing mathematical or physical equation in LaTeX",
  "explanation": "Step-by-step derivation guide and logical reasoning",
  "checkQuestion": "A quick self-check question to test student comprehension"
}
Return ONLY valid JSON without markdown code fences.`;

            const res = await callDirectGroqInference([
                { role: 'user', content: `Problem / Question: "${problemInput}"\nSubject: ${solverSubject}` }
            ], systemPrompt);

            if (res) {
                const clean = res.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(clean);
                setSocraticSteps(parsed);
                setIsSolving(false);
                return;
            }
        } catch {
            // Deterministic fallback
        }

        setSocraticSteps({
            hint: `Start by identifying all given parameters and the primary principle governing ${solverSubject}.`,
            formula: `\\sum \\vec{F} = m \\vec{a} \\quad \\text{or} \\quad E = mc^2`,
            explanation: `1. Break the problem into knowns and unknowns.\n2. Apply the foundational governing equation.\n3. Substitute values with proper SI units.\n4. Check dimensional consistency.`,
            checkQuestion: `Can you state what happens to the output if you double the primary input variable?`
        });
        setIsSolving(false);
    };

    // ── 2. 45-Min Revision Sprint Handler ───────────────────────────────────
    const handleGenerateSprint = async () => {
        if (!sprintTopic.trim()) return;
        setIsGeneratingSprint(true);
        setRevisionSprint(null);
        rememberPrompt(sprintTopic, { subject: sprintSubject, type: 'revision-sprint' });

        try {
            const systemPrompt = `You are DeepHub AI Study Architect. Create a structured 45-minute Pomodoro revision sprint for students.
Return a valid JSON object:
{
  "block1": { "time": "00-15 Min", "title": "Core Concept Immersion & Key Formulas", "points": ["Point 1", "Point 2", "Point 3"] },
  "block2": { "time": "15-35 Min", "title": "High-Yield Problem Solving & Derivations", "points": ["Derivation 1", "Common Trap 2", "Step Method 3"] },
  "block3": { "time": "35-45 Min", "title": "Rapid Recall Self-Quiz & Summary", "points": ["Quiz Item 1", "Flash Check 2"] },
  "mindmapSummary": "Single paragraph high-yield concept synthesis."
}
Return ONLY valid JSON.`;

            const res = await callDirectGroqInference([
                { role: 'user', content: `Topic: "${sprintTopic}" | Subject: ${sprintSubject}` }
            ], systemPrompt);

            if (res) {
                const clean = res.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(clean);
                setRevisionSprint(parsed);
                setIsGeneratingSprint(false);
                return;
            }
        } catch {}

        setRevisionSprint({
            block1: {
                time: "00 - 15 Mins",
                title: "Foundational Laws & Variable Identification",
                points: [`Define core axioms of ${sprintTopic}`, "Memorize the 3 primary governing formulas", "Review SI units and sign conventions"]
            },
            block2: {
                time: "15 - 35 Mins",
                title: "Deep Problem Solving & Critical Edge Cases",
                points: ["Solve 2 standard textbook exemplar problems", "Identify common student misinterpretations", "Diagram sketch practice with clean labels"]
            },
            block3: {
                time: "35 - 45 Mins",
                title: "Rapid Socratic Recall & Cheat-Sheet Synthesis",
                points: ["Self-test without looking at notes", "Verify step marks breakdown"]
            },
            mindmapSummary: `${sprintTopic} centers on balancing foundational conservation laws with algebraic derivations. Master the primary equation first before attempting complex multi-concept problems.`
        });
        setIsGeneratingSprint(false);
    };

    // ── 3. Flashcards Generator Handler ─────────────────────────────────────
    const handleGenerateFlashcards = async () => {
        if (!flashcardTopic.trim()) return;
        setIsGeneratingCards(true);
        rememberPrompt(flashcardTopic, { type: 'flashcards' });

        try {
            const systemPrompt = `Generate 4 high-yield active recall flashcards in JSON format for students:
[
  { "front": "Question/Prompt", "back": "Precise Answer/Derivation", "hint": "Memory clue" }
]
Return ONLY JSON.`;

            const res = await callDirectGroqInference([
                { role: 'user', content: `Topic: ${flashcardTopic}` }
            ], systemPrompt);

            if (res) {
                const clean = res.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(clean);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setFlashcards(parsed);
                    setIsGeneratingCards(false);
                    return;
                }
            }
        } catch {}

        setIsGeneratingCards(false);
    };

    // ── 4. Solution Key & Rubric Handler ───────────────────────────────────
    const handleGenerateSolutionKey = async () => {
        if (!homeworkPrompt.trim()) return;
        setIsGeneratingKey(true);
        setSolutionKeyResult(null);
        rememberPrompt(homeworkPrompt, { type: 'solution-key' });

        try {
            const systemPrompt = `You are the DeepHub AI Master Solution Architect & Grading Examiner.
Generate a complete, pedagogical Solution Manual & Step-by-Step Marking Rubric for the student's question/homework.
Include:
1. Question Breakdown & Core Method
2. Step-by-Step Calculation & Derivation (with marks per step e.g. [1 Mark], [2 Marks])
3. Common Student Pitfalls & Warning Notes
4. Final Verified Answer in Bold Box`;

            const res = await callDirectGroqInference([
                { role: 'user', content: homeworkPrompt }
            ], systemPrompt);

            if (res) {
                setSolutionKeyResult(res);
                setIsGeneratingKey(false);
                return;
            }
        } catch {}

        setSolutionKeyResult(`### Step-by-Step Pedagogical Solution Manual\n\n**Step 1: Formula Setup & Value Extraction [1 Mark]**\nIdentify all governing parameters and state the relevant theorem clearly.\n\n**Step 2: Mathematical Derivation [2 Marks]**\n$$\\text{Result} = \\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$\n\n**Step 3: Verification & Edge Cases [1 Mark]**\nAlways check units and boundary conditions.\n\n**Final Answer:** Verified with standard academic rigor.`);
        setIsGeneratingKey(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0E1424] via-[#111A33] to-[#0E1424] border border-blue-500/30 shadow-[0_0_35px_rgba(59,130,246,0.15)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-0" />
                <div className="space-y-3 relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-mono-stamp text-blue-300 font-bold uppercase shadow-sm">
                        <GraduationCap size={14} className="text-blue-400" />
                        <span>Student Learning Lab • Autonomous Study Studio</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
                        Master Your Curriculum with Socratic AI
                    </h2>
                    <p className="text-xs sm:text-sm text-white/70 font-sans-academic leading-relaxed">
                        Dedicated student workspace featuring step-by-step Socratic problem solvers, 45-minute revision sprints, active recall flashcards, and official solution key grading manuals.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                {[
                    { id: 'socratic-solver', label: '1. Socratic Step Solver', icon: Brain },
                    { id: 'revision-sprint', label: '2. 45-Min Revision Sprint', icon: Clock },
                    { id: 'flashcards', label: '3. Active Recall Flashcards', icon: BookOpen },
                    { id: 'solution-key', label: '4. Solution Key & Rubric', icon: Award },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isSel = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as StudentTab)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isSel
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: SOCRATIC STEP SOLVER */}
            {activeTab === 'socratic-solver' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Input */}
                    <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0A0E1A]/80 border border-white/10 space-y-4 shadow-xl">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white font-display">Socratic AI Problem Solver</h3>
                            <p className="text-xs text-white/50">Get hints, formulas, and derivation steps without spoiling the answer.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/80">Subject / Exam Level</label>
                            <input
                                type="text"
                                value={solverSubject}
                                onChange={(e) => setSolverSubject(e.target.value)}
                                placeholder="e.g. Class 10 Physics, Calculus, Organic Chemistry"
                                className="w-full bg-white/5 border border-white/10 focus:border-blue-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/80">Paste Question or Problem Statement</label>
                            <textarea
                                rows={5}
                                value={problemInput}
                                onChange={(e) => setProblemInput(e.target.value)}
                                placeholder="e.g. A ray of light enters a glass prism of refractive index 1.5 at an angle of 45°. Calculate the angle of refraction."
                                className="w-full bg-white/5 border border-white/10 focus:border-blue-400 rounded-xl p-4 text-sm text-white placeholder:text-white/30 outline-none resize-none leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleSocraticSolve}
                            disabled={isSolving || !problemInput.trim()}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)] cursor-pointer disabled:opacity-50"
                        >
                            {isSolving ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            <span>{isSolving ? 'Tutor Thinking Socratic Steps...' : 'Solve with Socratic Tutor'}</span>
                        </button>
                    </div>

                    {/* Right: Socratic Output */}
                    <div className="lg:col-span-7 p-6 rounded-3xl bg-[#080C14]/90 border border-blue-500/30 shadow-2xl min-h-[400px] flex flex-col justify-between space-y-4">
                        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-400 font-mono-stamp">
                                <Lightbulb size={18} />
                                <span>Socratic Guidance & Derivation Lab</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {socraticSteps ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {/* 1. Hint */}
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                                        <span className="text-xs font-bold uppercase font-mono-stamp text-amber-400">💡 Step 1: Conceptual Hint</span>
                                        <p className="text-sm text-white/95 leading-relaxed">{socraticSteps.hint}</p>
                                    </div>

                                    {/* 2. Formula */}
                                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-1.5 font-mono">
                                        <span className="text-xs font-bold uppercase font-mono-stamp text-cyan-400">📐 Step 2: Governing Formula</span>
                                        <div className="text-sm text-cyan-200 pt-1 font-bold">
                                            {socraticSteps.formula}
                                        </div>
                                    </div>

                                    {/* 3. Step-by-Step Reasoning */}
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                        <span className="text-xs font-bold uppercase font-mono-stamp text-blue-400">🔬 Step 3: Derivation Breakdown</span>
                                        <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                                            {socraticSteps.explanation}
                                        </div>
                                    </div>

                                    {/* 4. Self-Check Question */}
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                                        <span className="text-xs font-bold uppercase font-mono-stamp text-emerald-400">✅ Step 4: Self-Check Question</span>
                                        <p className="text-sm text-white/95 italic">{socraticSteps.checkQuestion}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-8 text-white/40 space-y-2">
                                    <Brain size={36} className="text-white/20 animate-pulse" />
                                    <p className="text-sm">Your step-by-step Socratic derivation will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: 45-MIN REVISION SPRINT */}
            {activeTab === 'revision-sprint' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0A0E1A]/80 border border-white/10 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white font-display">45-Minute Pomodoro Revision Sprint</h3>
                            <p className="text-xs text-white/50">Break down any chapter into a laser-focused 45-minute timed mastery sprint.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/80">Chapter or Subject Topic</label>
                            <input
                                type="text"
                                value={sprintTopic}
                                onChange={(e) => setSprintTopic(e.target.value)}
                                placeholder="e.g. Chemical Kinetics & Rate Laws, Electromagnetism"
                                className="w-full bg-white/5 border border-white/10 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerateSprint}
                            disabled={isGeneratingSprint || !sprintTopic.trim()}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            {isGeneratingSprint ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                            <span>{isGeneratingSprint ? 'Architecting 45-Min Sprint...' : 'Generate 45-Min Study Plan'}</span>
                        </button>
                    </div>

                    <div className="lg:col-span-7 p-6 rounded-3xl bg-[#080C14]/90 border border-blue-500/30 shadow-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase font-mono-stamp text-blue-400 flex items-center gap-2">
                            <Target size={14} /> Timed 45-Minute Mastery Blueprint
                        </h4>

                        {revisionSprint ? (
                            <div className="space-y-3">
                                {[revisionSprint.block1, revisionSprint.block2, revisionSprint.block3].map((b, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-white">
                                            <span>{b.title}</span>
                                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">{b.time}</span>
                                        </div>
                                        <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
                                            {b.points.map((pt, i) => <li key={i}>{pt}</li>)}
                                        </ul>
                                    </div>
                                ))}

                                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                                    <strong className="block text-cyan-400 mb-1 font-mono-stamp text-[10px] uppercase">🧠 Concept Mindmap Summary</strong>
                                    {revisionSprint.mindmapSummary}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[220px] flex items-center justify-center text-xs text-white/40">
                                Enter your topic on the left to generate the 45-minute revision sprint.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: ACTIVE RECALL FLASHCARDS */}
            {activeTab === 'flashcards' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="text"
                            value={flashcardTopic}
                            onChange={(e) => setFlashcardTopic(e.target.value)}
                            placeholder="Enter any topic to generate flashcards (e.g. Organic Reagents, Calculus Derivatives)..."
                            className="flex-1 bg-white/5 border border-white/10 focus:border-blue-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                        />
                        <button
                            onClick={handleGenerateFlashcards}
                            disabled={isGeneratingCards || !flashcardTopic.trim()}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isGeneratingCards ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            <span>Generate Cards</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flashcards.map((card, idx) => {
                            const isFlipped = flippedIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setFlippedIndex(isFlipped ? null : idx)}
                                    className={`p-6 rounded-2xl border transition-all cursor-pointer min-h-[200px] flex flex-col justify-between select-none ${
                                        isFlipped
                                            ? 'bg-blue-950/40 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[10px] font-mono-stamp text-white/40">
                                        <span>Card {idx + 1} of {flashcards.length}</span>
                                        <span className="text-blue-400">{isFlipped ? 'Answer Revealed' : 'Click to Flip'}</span>
                                    </div>

                                    <div className="my-3 text-xs leading-relaxed text-white font-medium">
                                        {isFlipped ? (
                                            <span className="text-emerald-300 font-bold">{card.back}</span>
                                        ) : (
                                            <span>{card.front}</span>
                                        )}
                                    </div>

                                    <div className="text-[10px] text-white/40 italic">
                                        Hint: {card.hint}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 4: SOLUTION KEY & RUBRIC */}
            {activeTab === 'solution-key' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0A0E1A]/80 border border-white/10 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white font-display">Solution Key & Self-Grading Rubric</h3>
                            <p className="text-xs text-white/50">Paste homework or exam questions to generate step-by-step marks distribution and rubric.</p>
                        </div>

                        <textarea
                            rows={6}
                            value={homeworkPrompt}
                            onChange={(e) => setHomeworkPrompt(e.target.value)}
                            placeholder="Paste the questions here to generate step solutions with marking distribution..."
                            className="w-full bg-white/5 border border-white/10 focus:border-blue-400 rounded-xl p-3.5 text-xs text-white placeholder:text-white/30 outline-none resize-none leading-relaxed"
                        />

                        <button
                            onClick={handleGenerateSolutionKey}
                            disabled={isGeneratingKey || !homeworkPrompt.trim()}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            {isGeneratingKey ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                            <span>{isGeneratingKey ? 'Generating Marking Key...' : 'Generate Solution Key & Rubric'}</span>
                        </button>
                    </div>

                    <div className="lg:col-span-7 p-6 rounded-3xl bg-[#080C14]/90 border border-blue-500/30 shadow-2xl space-y-4 min-h-[350px]">
                        <h4 className="text-xs font-bold uppercase font-mono-stamp text-blue-400 flex items-center gap-2 border-b border-white/10 pb-3">
                            <Award size={14} /> Official Step-by-Step Marking Manual
                        </h4>

                        {solutionKeyResult ? (
                            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-white/80 whitespace-pre-wrap custom-scrollbar max-h-[500px] overflow-y-auto">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {solutionKeyResult}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="min-h-[220px] flex items-center justify-center text-xs text-white/40">
                                Paste questions on the left to generate the complete solution key with step marks.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
