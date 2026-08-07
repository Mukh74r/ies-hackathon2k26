import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Brain,
    Presentation,
    ClipboardList,
    Database,
    Globe,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    Layers,
    ChevronRight,
    Printer,
    Download,
    FileSpreadsheet,
    Sliders,
    GraduationCap,
    School,
    Check
} from 'lucide-react';
import { INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Home() {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState('10');
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [selectedBoard, setSelectedBoard] = useState('CBSE');
    const [activeTab, setActiveTab] = useState<'paper' | 'lesson' | 'ppt' | 'solution'>('paper');

    const boardBlueprints = {
        paper: {
            title: `${selectedBoard} Class ${selectedGrade} ${selectedSubject} — Standard 50-Mark Examination Blueprint`,
            sections: [
                {
                    heading: "SECTION A — OBJECTIVE & MULTIPLE CHOICE (1 Mark Each)",
                    questions: [
                        {
                            num: "Q1.",
                            text: "A ray of light traveling from a medium of refractive index 1.5 into air strikes the boundary at an angle of incidence 30°. The angle of refraction is:",
                            options: ["(a) 48.6°", "(b) 30.0°", "(c) 60.0°", "(d) 90.0°"],
                            correct: "Key: (a) 48.6° [1 Mark: Correct formula & substitution]"
                        },
                        {
                            num: "Q2.",
                            text: "Which of the following properties of a wave is independent of the other three?",
                            options: ["(a) Velocity", "(b) Frequency", "(c) Wavelength", "(d) Amplitude"],
                            correct: "Key: (d) Amplitude [1 Mark: Direct recall of wave mechanics]"
                        }
                    ]
                },
                {
                    heading: "SECTION B — SHORT ANSWER & DERIVATIONS (3 Marks Each)",
                    questions: [
                        {
                            num: "Q3.",
                            text: "State Ohm's Law. Draw a circuit diagram showing the arrangement used to verify Ohm's law in the laboratory. List two factors on which the resistance of a conductor depends.",
                            options: [],
                            correct: "Marking Scheme: Statement (1M) + Circuit Diagram with Ammeter/Voltmeter (1M) + Two factors (Length/Area) (1M) = 3 Marks"
                        }
                    ]
                },
                {
                    heading: "SECTION C — CASE-BASED INTEGRATED ASSESSMENT (4 Marks)",
                    questions: [
                        {
                            num: "Q4.",
                            text: "Read the passage and answer the sub-questions: A concave mirror forms a real and inverted image of an object placed 20 cm in front of it. The magnification is -2.",
                            options: [
                                "(i) Determine the image distance v. [1M]",
                                "(ii) Calculate the focal length of the mirror. [2M]",
                                "(iii) State the nature of the image if the object is moved to 5 cm from pole. [1M]"
                            ],
                            correct: "Marking Scheme: (i) v = -40 cm (1M); (ii) 1/f = 1/v + 1/u => f = -13.3 cm (2M); (iii) Virtual & erect (1M)."
                        }
                    ]
                }
            ]
        },
        lesson: {
            title: `45-Minute Structured Lesson Plan: ${selectedSubject} (Class ${selectedGrade})`,
            sections: [
                {
                    heading: "STAGE 1 — ENGAGE & RECALL (00:00 - 00:08)",
                    questions: [
                        {
                            num: "Phase A",
                            text: "Anchor Phenomenon: Demonstrate a simple real-world observation to capture curiosity (e.g. pencil appearing bent in water beaker).",
                            options: [],
                            correct: "Blackboard Cue: Draw boundary line and normal to illustrate phase change."
                        }
                    ]
                },
                {
                    heading: "STAGE 2 — CONCEPT DELIVERY & GUIDED PRACTICE (00:08 - 00:28)",
                    questions: [
                        {
                            num: "Phase B",
                            text: "Direct Instruction: Formulate mathematical relations and derive governing equations step-by-step with student interaction.",
                            options: [
                                "• Step 1: Define key variables and physical dimensions",
                                "• Step 2: Blackboard worked example with student prompt",
                                "• Step 3: Paired calculation of edge-case parameters"
                            ],
                            correct: "Formative Check: Cold-call 2 students for variable definitions."
                        }
                    ]
                },
                {
                    heading: "STAGE 3 — INDEPENDENT PRACTICE & HOMEWORK (00:28 - 00:45)",
                    questions: [
                        {
                            num: "Phase C",
                            text: "Summary synthesis + 3 exit-ticket problems. Assign homework worksheet calibrated across Easy (3 Qs), Medium (2 Qs), and HOTS (1 Q).",
                            options: [],
                            correct: "Verification: Review exit ticket responses before dismissal."
                        }
                    ]
                }
            ]
        },
        ppt: {
            title: `Classroom Slide Deck Architecture: ${selectedSubject} (10 Slides)`,
            sections: [
                {
                    heading: "SLIDE SEQUENCE & TEACHING CUES",
                    questions: [
                        {
                            num: "Slide 1-2",
                            text: "Title & Learning Outcomes: Stated in clear student-friendly language with curriculum board references.",
                            options: [],
                            correct: "Speaker Note: Take 2 minutes to frame the learning goals with the class."
                        },
                        {
                            num: "Slide 3-6",
                            text: "Core Principles: High-contrast diagrams, labeled components, and stepwise equation derivation.",
                            options: [],
                            correct: "Speaker Note: Pause after Slide 4 for student question check."
                        },
                        {
                            num: "Slide 7-10",
                            text: "Worked Examples, Discussion Prompts & Exit Exercise for class closure.",
                            options: [],
                            correct: "Speaker Note: Keep Slide 9 on display during student calculation time."
                        }
                    ]
                }
            ]
        },
        solution: {
            title: `Verified Solution Key & Marking Breakdown: ${selectedSubject}`,
            sections: [
                {
                    heading: "STEP-BY-STEP MATHEMATICAL RESOLUTION",
                    questions: [
                        {
                            num: "Step 1",
                            text: "Identification of Given Parameters and Unit Standardization (SI system check).",
                            options: [],
                            correct: "Score: 0.5 Mark allocated for standard parameter list."
                        },
                        {
                            num: "Step 2",
                            text: "Selection of Governing Formula and Algebraic Rearrangement before numerical substitution.",
                            options: [],
                            correct: "Score: 1.0 Mark allocated for explicit formula statement."
                        },
                        {
                            num: "Step 3",
                            text: "Final Computation with Proper Dimensional Units and Significant Figures.",
                            options: [],
                            correct: "Score: 1.5 Marks allocated for final numeric answer with correct units."
                        }
                    ]
                }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-[#080C14] text-[#F8FAFC] font-sans-academic selection:bg-[#38BDF8]/20">
            {/* ── Top Institutional Header Strip ── */}
            <div className="border-b border-[#1E293B] bg-[#0B101D] px-6 py-2">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-stamp text-[#94A3B8]">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[#38BDF8]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                            DEEPHUB WORKSPACE V4.2
                        </span>
                        <span className="text-[#1E293B]">|</span>
                        <span>CURRICULUM ENGINE FOR INDIAN FACULTY</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                        <span>CBSE · ICSE · STATE BOARDS</span>
                        <span className="text-[#1E293B]">|</span>
                        <span>11 REGIONAL LANGUAGES</span>
                    </div>
                </div>
            </div>

            {/* ── 1. Hero Section: Architectural & Clear ── */}
            <section className="pt-16 pb-16 px-6 sm:px-12 max-w-7xl mx-auto">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-xs font-mono-stamp text-[#38BDF8] mb-6">
                        <GraduationCap size={14} className="text-[#38BDF8]" />
                        <span>FACULTY ARCHITECTURE PLATFORM</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[#F8FAFC] leading-[1.15] mb-6">
                        The Curriculum & Examination Architecture Platform for Indian Faculty
                    </h1>

                    <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-3xl mb-8 font-sans-academic">
                        Formulate board-standard question papers, structured 45-minute lesson plans, classroom slide presentations, and step-by-step syllabus solutions across 11 Indian Regional Languages.
                    </p>

                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
                        <button
                            onClick={() => navigate('/turbo')}
                            className="px-6 py-3 rounded-md bg-[#38BDF8] hover:bg-[#0284c7] text-[#080C14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <span>Open Teacher Studio</span>
                            <ArrowRight size={14} />
                        </button>
                        <a
                            href="#blueprint-workbench"
                            className="px-5 py-3 rounded-md bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8]/40 text-[#F8FAFC] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                        >
                            <Sliders size={14} className="text-[#38BDF8]" />
                            <span>View Interactive Blueprint</span>
                        </a>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-5 py-3 rounded-md bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8]/40 text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Institutional Plans</span>
                        </button>
                    </div>

                    {/* Board Badges */}
                    <div className="pt-6 border-t border-[#1E293B] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#94A3B8]">
                        <span className="font-mono-stamp text-[#38BDF8] uppercase">Supported Curricula:</span>
                        <span>CBSE (Central Board)</span>
                        <span className="text-[#1E293B]">·</span>
                        <span>CISCE / ICSE / ISC</span>
                        <span className="text-[#1E293B]">·</span>
                        <span>Maharashtra State Board</span>
                        <span className="text-[#1E293B]">·</span>
                        <span>Tamil Nadu Samacheer</span>
                        <span className="text-[#1E293B]">·</span>
                        <span>Kerala & Karnataka Boards</span>
                    </div>
                </div>
            </section>

            {/* ── 2. Interactive Board Exam Workbench ── */}
            <section id="blueprint-workbench" className="py-12 px-6 sm:px-12 max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider mb-1">
                            Interactive Studio Preview
                        </div>
                        <h2 className="text-2xl font-bold font-display text-[#F8FAFC]">
                            Curriculum & Question Workbench
                        </h2>
                    </div>
                    {/* Mode Selector */}
                    <div className="flex bg-[#0F172A] border border-[#1E293B] rounded-md p-1">
                        {[
                            { id: 'paper', label: 'Question Paper' },
                            { id: 'lesson', label: '45-Min Lesson Plan' },
                            { id: 'ppt', label: 'Slide Deck' },
                            { id: 'solution', label: 'Step-by-Step Solver' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-[#38BDF8] text-[#080C14] font-bold'
                                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Workbench Frame */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
                    {/* Controls Bar */}
                    <div className="bg-[#0B101D] border-b border-[#1E293B] p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono-stamp text-[#94A3B8]">BOARD:</span>
                                <select
                                    value={selectedBoard}
                                    onChange={(e) => setSelectedBoard(e.target.value)}
                                    className="bg-[#080C14] border border-[#1E293B] rounded px-2.5 py-1 text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:border-[#38BDF8]"
                                >
                                    <option value="CBSE">CBSE (Central)</option>
                                    <option value="ICSE">ICSE / ISC</option>
                                    <option value="State Board">State Board</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="font-mono-stamp text-[#94A3B8]">CLASS:</span>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="bg-[#080C14] border border-[#1E293B] rounded px-2.5 py-1 text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:border-[#38BDF8]"
                                >
                                    <option value="9">Class 9</option>
                                    <option value="10">Class 10</option>
                                    <option value="11">Class 11</option>
                                    <option value="12">Class 12</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="font-mono-stamp text-[#94A3B8]">SUBJECT:</span>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="bg-[#080C14] border border-[#1E293B] rounded px-2.5 py-1 text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:border-[#38BDF8]"
                                >
                                    <option value="Physics">Physics / Science</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                </select>
                            </div>
                        </div>

                        {/* Export Quick Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/turbo')}
                                className="px-3 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/40 hover:bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold font-mono-stamp uppercase flex items-center gap-1.5 transition-colors"
                            >
                                <Printer size={13} />
                                <span>Export Paper</span>
                            </button>
                        </div>
                    </div>

                    {/* Paper Document Preview Sheet */}
                    <div className="p-6 sm:p-8 bg-[#080C14]">
                        <div className="max-w-4xl mx-auto bg-[#0F172A] border border-[#1E293B] rounded-md p-6 sm:p-10 shadow-lg">
                            {/* Academic Paper Header */}
                            <div className="text-center pb-6 mb-6 border-b border-[#1E293B] space-y-1">
                                <div className="text-xs font-mono-stamp text-[#94A3B8] uppercase">
                                    ACADEMIC YEAR 2026-2027 · FORMATIVE ASSESSMENT
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold font-display text-[#F8FAFC] tracking-tight">
                                    {boardBlueprints[activeTab].title}
                                </h3>
                                <div className="flex justify-between items-center text-xs font-mono-stamp text-[#94A3B8] pt-2 max-w-md mx-auto">
                                    <span>TIME: 2.0 HOURS</span>
                                    <span>TOTAL MARKS: 50</span>
                                    <span>PASS MARKS: 18</span>
                                </div>
                            </div>

                            {/* Section Loop */}
                            <div className="space-y-6">
                                {boardBlueprints[activeTab].sections.map((sec, sIdx) => (
                                    <div key={sIdx} className="space-y-3">
                                        <div className="text-xs font-bold font-mono-stamp text-[#38BDF8] uppercase tracking-wider border-b border-[#1E293B] pb-1">
                                            {sec.heading}
                                        </div>
                                        <div className="space-y-4">
                                            {sec.questions.map((q, qIdx) => (
                                                <div key={qIdx} className="space-y-1.5 text-xs sm:text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-bold text-[#38BDF8] font-mono-stamp">{q.num}</span>
                                                        <span className="text-[#F8FAFC] font-sans-academic leading-relaxed">{q.text}</span>
                                                    </div>
                                                    {q.options.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6 pt-1 text-xs text-[#94A3B8]">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div key={oIdx} className="font-mono-stamp">{opt}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {q.correct && (
                                                        <div className="mt-1 ml-6 p-2 rounded bg-[#080C14] border border-[#1E293B] text-[11px] font-mono-stamp text-[#34D399]">
                                                            {q.correct}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Footer Note */}
                            <div className="mt-8 pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
                                <span>Verified against CBSE Circular & Curriculum Framework.</span>
                                <button
                                    onClick={() => navigate('/turbo')}
                                    className="px-4 py-2 rounded bg-[#38BDF8] hover:bg-[#0284c7] text-[#080C14] font-bold text-xs uppercase font-mono-stamp flex items-center gap-1.5 transition-colors"
                                >
                                    <span>Customize in Teacher Studio</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. Four Core Academic Pillars ── */}
            <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-[#1E293B]">
                <div className="max-w-2xl mb-12">
                    <span className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider">Functional Architecture</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F8FAFC] mt-1">
                        Purpose-Built Modules for Daily Teaching Operations
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            num: "01",
                            icon: FileText,
                            title: "Question Paper Blueprint Architecture",
                            desc: "Formulate 50 and 80-mark papers with calibrated difficulty distribution (30% Easy, 50% Medium, 20% Higher-Order Thinking Skills). Generates Section A (MCQs), Section B (Short Answer), Section C (Case Studies), and full marking schemes.",
                            badge: "CBSE / ICSE Compliant"
                        },
                        {
                            num: "02",
                            icon: Brain,
                            title: "45-Minute Lesson Pedagogy Engine",
                            desc: "Construct stage-wise lesson progressions mapped to Bloom's Taxonomy. Generates minute-by-minute timeline schedules, real-world hooks, interactive board derivations, formative assessments, and structured homework worksheets.",
                            badge: "Pedagogy Standard"
                        },
                        {
                            num: "03",
                            icon: Presentation,
                            title: "Classroom Presentation Slide Creator",
                            desc: "Produce 10 to 15 slide lecture presentations complete with learning objectives, key principles, diagram placeholders, step-by-step formulas, and classroom speaker notes for educators.",
                            badge: "PPT Ready"
                        },
                        {
                            num: "04",
                            icon: ClipboardList,
                            title: "Step-by-Step Marking & Solution Keys",
                            desc: "Generate complete mathematical and analytical solution manuals for all question papers. Includes step-by-step score allocation, unit checks, and alternative method credits.",
                            badge: "Exam Evaluation"
                        }
                    ].map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                onClick={() => navigate('/turbo')}
                                className="bg-[#0F172A] border border-[#1E293B] hover:border-[#38BDF8]/50 p-6 sm:p-8 rounded-lg transition-colors cursor-pointer group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2.5 rounded bg-[#080C14] border border-[#1E293B] text-[#38BDF8]">
                                            <Icon size={20} />
                                        </div>
                                        <span className="text-xs font-mono-stamp text-[#38BDF8] border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2 py-0.5 rounded">
                                            {card.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mb-2">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono-stamp text-[#38BDF8]">
                                    <span>Launch Module</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. 11 Regional Indian Languages Matrix ── */}
            <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-[#1E293B]">
                <div className="max-w-2xl mb-8">
                    <span className="text-xs font-mono-stamp text-[#38BDF8] uppercase tracking-wider">Regional Accessibility</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F8FAFC] mt-1">
                        Native Synthesis in 11 Indian Languages
                    </h2>
                    <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
                        DeepHub AI structures question papers, summaries, and lesson plans directly in regional vernacular without robotic translation artifacts.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {INDIAN_LANGUAGES.map(lang => (
                        <div
                            key={lang.code}
                            className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-md flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold font-mono-stamp text-[#38BDF8]">{lang.code.toUpperCase()}</span>
                                <span className="text-[10px] text-[#94A3B8]">{lang.name}</span>
                            </div>
                            <div className="text-sm font-bold text-[#F8FAFC]">
                                {lang.nativeName}
                            </div>
                            <div className="text-[10px] text-[#94A3B8] mt-1 truncate">
                                {lang.region}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 5. Footer ── */}
            <footer className="border-t border-[#1E293B] bg-[#080C14] py-8 px-6 sm:px-12 text-xs text-[#94A3B8]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold font-display text-[#F8FAFC]">DeepHub AI</span>
                        <span>· Curriculum & Examination Architecture</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span onClick={() => navigate('/terms')} className="hover:text-[#F8FAFC] cursor-pointer">Terms & Conditions</span>
                        <span onClick={() => navigate('/privacy')} className="hover:text-[#F8FAFC] cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/pricing')} className="hover:text-[#F8FAFC] cursor-pointer">Institutional Pricing</span>
                        <span onClick={() => navigate('/turbo')} className="hover:text-[#38BDF8] text-[#38BDF8] font-bold cursor-pointer">Teacher Studio</span>
                    </div>
                    <div>
                        © {new Date().getFullYear()} DeepHub AI. Built for Indian Educators.
                    </div>
                </div>
            </footer>
        </div>
    );
}
