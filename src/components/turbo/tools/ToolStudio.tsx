import React, { useState, useRef, useCallback } from 'react';
import {
    Wand2, Loader2, Save, Play, ChevronRight, ChevronDown, ChevronUp,
    Pencil, Trash2, Check, X, Sparkles, RotateCcw, Info, PlusCircle, Layers, Mic, MicOff, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { apiEndpoint, getAuthHeaders, safeFetchJson, callDirectGroqInference } from '../../../utils/api';
import { useAI } from '../../../context/AIContext';

export interface ToolField {
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

export interface ToolSchema {
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

// ── Smart Fallback Schema Generator ──────────────────────────────────────────
export function generateSmartFallbackSchema(desc: string): ToolSchema {
    const lower = desc.toLowerCase();
    const nowId = `tool_${Date.now()}`;

    if (lower.includes('feedback') || lower.includes('student feedback') || lower.includes('report comment')) {
        return {
            toolId: nowId,
            name: 'Student Feedback Generator',
            description: 'Generates comprehensive, personalized student feedback with strengths, targets, and parent-friendly remarks.',
            icon: '📝',
            category: 'Assessment',
            outputLabel: 'Student Progress & Feedback Report',
            outputFormat: 'markdown',
            fields: [
                { id: 'studentName', label: 'Student Name', type: 'text', placeholder: 'e.g. Liam Anderson', required: true, defaultValue: 'Liam Anderson' },
                { id: 'subject', label: 'Subject', type: 'select', options: ['Mathematics', 'Science', 'English Language & Lit', 'History / Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology'], defaultValue: 'Mathematics', required: true },
                { id: 'grade', label: 'Grade / Class', type: 'select', options: ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'], defaultValue: 'Grade 10', required: true },
                { id: 'performanceLevel', label: 'Performance Level', type: 'select', options: ['Outstanding / Mastery (A*)', 'Proficient / Above Average (A/B)', 'Developing / On Track (C)', 'Needs Targeted Support (D)', 'Critical Intervention Required'], defaultValue: 'Proficient / Above Average (A/B)', required: true },
                { id: 'keyStrengths', label: 'Key Strengths Observed', type: 'tags', placeholder: 'Type strength and press Enter', defaultValue: ['Analytical problem solving', 'Active class participation', 'Consistent homework submission'] },
                { id: 'areasForImprovement', label: 'Areas for Growth / Improvement', type: 'tags', placeholder: 'Type area and press Enter', defaultValue: ['Showing full calculation steps', 'Time management during exams'] },
                { id: 'tone', label: 'Feedback Tone', type: 'select', options: ['Constructive & Encouraging', 'Rigorous & Academic', 'Gentle & Nurturing', 'Direct & Goal-Oriented'], defaultValue: 'Constructive & Encouraging' },
                { id: 'includeNextSteps', label: 'Include Actionable Next Steps', type: 'toggle', defaultValue: true }
            ],
            promptTemplate: `Generate a detailed, classroom-ready academic feedback report for {studentName} in {grade} {subject}.
Performance Level: {performanceLevel}.
Observed Strengths: {keyStrengths}.
Areas for Improvement: {areasForImprovement}.
Tone of Feedback: {tone}.
Include Actionable Next Steps: {includeNextSteps}.

Structure the response with:
1. Executive Summary & Commendation
2. Key Academic Achievements & Strengths Breakdown
3. Specific Target Areas for Growth (with concrete exercises)
4. Teacher's Personal Encouragement Note for Report Card / PTM.`,
            sampleOutput: `### Student Academic Feedback: Liam Anderson (Grade 10 Mathematics)\n\n**Performance Standing:** Proficient / Above Average\n\n**1. Strengths & Mastery:**\nLiam demonstrates exceptional analytical thinking in algebraic manipulation and is a proactive participant in classroom discussions.\n\n**2. Strategic Improvement Targets:**\n- Ensure all intermediate working steps are clearly written out in timed assessments.\n- Practice multi-step geometry proofs under timed conditions.\n\n**3. Teacher's Concluding Remarks:**\nWith focused attention on structured problem layout, Liam is on a clear trajectory toward top-tier mastery.`
        };
    }

    if (lower.includes('timetable') || lower.includes('coaching') || lower.includes('schedule') || lower.includes('study plan')) {
        return {
            toolId: nowId,
            name: 'Personalised Coaching Timetable',
            description: 'Designs customized weekly revision and extra coaching schedules tailored to individual student learning gaps.',
            icon: '🗓️',
            category: 'Planning',
            outputLabel: 'Personalised Weekly Study Schedule',
            outputFormat: 'markdown',
            fields: [
                { id: 'studentName', label: 'Student Name', type: 'text', placeholder: 'e.g. Maya Sharma', required: true, defaultValue: 'Maya Sharma' },
                { id: 'grade', label: 'Grade / Target Exam', type: 'text', placeholder: 'e.g. Grade 12 - CBSE Board / Pre-Med', required: true, defaultValue: 'Grade 12 - Board Exam Prep' },
                { id: 'coachingSubjects', label: 'Subjects Requiring Extra Coaching', type: 'multiselect', options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'], defaultValue: ['Physics', 'Mathematics'] },
                { id: 'weeklyHours', label: 'Available Weekly Study Hours', type: 'slider', min: 4, max: 30, step: 2, defaultValue: 14 },
                { id: 'currentWeakTopics', label: 'Specific Weak Topics / Pain Points', type: 'textarea', placeholder: 'e.g. Integration, Ray Optics, Electromagnetic Induction', defaultValue: 'Calculus integration, Electromagnetism numericals' },
                { id: 'includeBreaks', label: 'Include Pomodoro Rest Intervals', type: 'toggle', defaultValue: true }
            ],
            promptTemplate: `Create a comprehensive, realistic weekly study and coaching timetable for {studentName} preparing for {grade}.
Target subjects: {coachingSubjects}. Total weekly dedicated hours: {weeklyHours} hours.
Key areas of focus and weak topics: {currentWeakTopics}.
Include Pomodoro rest intervals: {includeBreaks}.

Structure the schedule with:
- Monday to Sunday day-by-day time blocks
- Daily focus concepts and active recall exercises
- Weekend diagnostic review checkpoints.`,
            sampleOutput: `### Personalised Weekly Timetable for Maya Sharma\n\n**Target:** Grade 12 Board Prep (14 hrs/week)\n\n| Day | Time Block | Focus Subject & Chapter | Learning Mode |\n|---|---|---|---|\n| Monday | 5:00 PM - 6:30 PM | Physics: Ray Optics Formulas | Active Derivation + Practice (45m x 2) |\n| Tuesday | 5:00 PM - 6:30 PM | Mathematics: Definite Integrals | Exemplar Problem Solving |\n| Saturday | 10:00 AM - 1:00 PM | Physics & Math Mock Review | Timed Sectional Test & Doubt Analysis |`
        };
    }

    if (lower.includes('quiz') || lower.includes('warm-up') || lower.includes('warm up') || lower.includes('bell ringer')) {
        return {
            toolId: nowId,
            name: 'Class Warm-Up Quiz Generator',
            description: 'Generates fast, engaging warm-up questions and bell-ringers to activate prior knowledge at the start of class.',
            icon: '⚡',
            category: 'Creative',
            outputLabel: 'Class Warm-Up & Starter Quiz',
            outputFormat: 'markdown',
            fields: [
                { id: 'topic', label: 'Lesson Topic / Concept', type: 'text', placeholder: "e.g. Newton's 3rd Law / Photosynthesis", required: true, defaultValue: "Newton's Laws of Motion" },
                { id: 'grade', label: 'Grade Level', type: 'select', options: ['Middle School (Grades 6-8)', 'High School (Grades 9-10)', 'Senior Secondary (Grades 11-12)', 'Undergraduate'], defaultValue: 'High School (Grades 9-10)', required: true },
                { id: 'numQuestions', label: 'Number of Questions', type: 'slider', min: 3, max: 10, step: 1, defaultValue: 5 },
                { id: 'quizType', label: 'Question Format', type: 'select', options: ['Multiple Choice (MCQ)', 'Short Conceptual / Rapid Fire', 'Spot the Error / Myth Buster', 'Mixed Variety'], defaultValue: 'Mixed Variety' },
                { id: 'duration', label: 'Target Warm-up Time', type: 'select', options: ['3 Minutes (Lightning)', '5 Minutes (Standard)', '10 Minutes (Deep Discussion)'], defaultValue: '5 Minutes (Standard)' },
                { id: 'includeExplanations', label: 'Include Answer Key & Teacher Talk-Points', type: 'toggle', defaultValue: true }
            ],
            promptTemplate: `Design a high-engagement, 5-minute class warm-up quiz on "{topic}" for {grade}.
Number of questions: {numQuestions}. Format: {quizType}.
Time duration: {duration}.
Include Answer Key & Teacher Discussion Points: {includeExplanations}.

Format clearly with questions ready to project on screen or print, followed by the teacher's master answer key with concise explanations.`,
            sampleOutput: `### ⚡ 5-Minute Class Warm-Up: Newton's Laws of Motion\n\n**Q1 (MCQ):** When a rocket accelerates upwards in space, what exerts the forward force on the rocket?\n- A) The launch pad\n- B) The surrounding air\n- C) The expelled exhaust gases pushed backwards\n- D) Gravitational slingshot\n\n**Teacher Key:** **C** (Newton's 3rd Law: Action & Reaction pairs).`
        };
    }

    if (lower.includes('parent') || lower.includes('absent') || lower.includes('email') || lower.includes('letter')) {
        return {
            toolId: nowId,
            name: 'Absent Student Parent Communicator',
            description: 'Drafts compassionate, clear parent emails summarizing missed classwork, homework assignments, and return expectations.',
            icon: '✉️',
            category: 'Communication',
            outputLabel: 'Parent Email Draft',
            outputFormat: 'markdown',
            fields: [
                { id: 'studentName', label: 'Student Name', type: 'text', placeholder: 'e.g. Ethan Wright', required: true, defaultValue: 'Ethan Wright' },
                { id: 'parentName', label: 'Parent / Guardian Name', type: 'text', placeholder: 'e.g. Mr. & Mrs. Wright', required: true, defaultValue: 'Mr. & Mrs. Wright' },
                { id: 'subject', label: 'Subject / Class', type: 'text', placeholder: 'e.g. Grade 9 Chemistry', required: true, defaultValue: 'Grade 9 Science' },
                { id: 'datesAbsent', label: 'Dates of Absence', type: 'text', placeholder: 'e.g. October 14 - 16', required: true, defaultValue: 'Thursday & Friday, Oct 14-15' },
                { id: 'missedTopics', label: 'Key Topics & Concepts Covered in Class', type: 'textarea', placeholder: 'e.g. Periodic trends, electron configurations, Chapter 4 lab worksheet', defaultValue: 'Introduction to Chemical Bonding (Ionic vs Covalent bonds), textbook pages 102-108.' },
                { id: 'catchUpTasks', label: 'Required Catch-Up Assignments', type: 'textarea', placeholder: 'e.g. Complete questions 1-10 on page 109 and review slides on portal', defaultValue: 'Read textbook section 4.2 and complete practice questions 1-8. Lab worksheet will be provided on Monday.' },
                { id: 'submissionDeadline', label: 'Submission Due Date', type: 'text', placeholder: 'e.g. Wednesday next week', defaultValue: 'Next Wednesday upon return' },
                { id: 'tone', label: 'Email Tone', type: 'select', options: ['Warm & Caring', 'Professional & Direct', 'Encouraging & Reassuring'], defaultValue: 'Warm & Caring' }
            ],
            promptTemplate: `Draft a professional and empathetic parent email regarding {studentName}'s absence from {subject} on {datesAbsent}.
Addressed to: {parentName}.
Missed Topics: {missedTopics}.
Catch-Up Work Assigned: {catchUpTasks}.
Due Date: {submissionDeadline}.
Tone: {tone}.

Include:
- Polite subject line
- Warm opening asking after the student's wellbeing
- Bulleted breakdown of missed materials and homework links
- Clear next steps and teacher contact availability.`,
            sampleOutput: `**Subject:** Catch-Up Material & Support for Ethan's Absence — Grade 9 Science\n\nDear Mr. & Mrs. Wright,\n\nI hope this email finds you well and that Ethan is recovering smoothly. We missed him in class on Thursday and Friday!\n\nTo ensure he stays on track with our unit on Chemical Bonding, here is a quick summary of what we explored and how he can catch up:\n\n- **Key Topics Covered:** Ionic vs. Covalent bonding (Textbook pp. 102–108)\n- **Catch-Up Work:** Review Section 4.2 and solve practice questions 1–8.\n- **Due Date:** Next Wednesday, allowing him plenty of time to settle back in.\n\nPlease feel free to reach out if Ethan needs any clarification. We look forward to welcoming him back soon!\n\nWarm regards,\n*The Science Department*`
        };
    }

    if (lower.includes('rubric') || lower.includes('grading') || lower.includes('assessment criteria')) {
        return {
            toolId: nowId,
            name: 'Classroom Rubric Builder',
            description: 'Generates standardized, criterion-referenced rubrics with clear performance descriptors and scoring tiers.',
            icon: '📊',
            category: 'Assessment',
            outputLabel: 'Assessment Rubric Table',
            outputFormat: 'markdown',
            fields: [
                { id: 'assignmentTitle', label: 'Assignment / Project Title', type: 'text', placeholder: 'e.g. Climate Change Research Essay', required: true, defaultValue: 'Renewable Energy Science Project' },
                { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Environmental Science', required: true, defaultValue: 'Environmental Science' },
                { id: 'grade', label: 'Grade Level', type: 'select', options: ['Middle School (6-8)', 'High School (9-10)', 'Senior High (11-12)', 'College / Higher Ed'], defaultValue: 'High School (9-10)', required: true },
                { id: 'criteriaCount', label: 'Number of Assessment Criteria', type: 'slider', min: 3, max: 6, step: 1, defaultValue: 4 },
                { id: 'scaleType', label: 'Grading Scale', type: 'select', options: ['4-Tier (Exemplary, Proficient, Developing, Beginning)', '3-Tier (Mastery, Approaching, Needs Support)', 'Point-Based (20-15-10-5)'], defaultValue: '4-Tier (Exemplary, Proficient, Developing, Beginning)' },
                { id: 'specialFocus', label: 'Key Focus Areas to Evaluate', type: 'textarea', placeholder: 'e.g. Research depth, data visualization, scientific accuracy, citations', defaultValue: 'Scientific accuracy, experimental design, clarity of charts/data, bibliography & citations' }
            ],
            promptTemplate: `Construct a comprehensive, rigorous assessment rubric for "{assignmentTitle}" in {grade} {subject}.
Number of criteria: {criteriaCount}.
Scoring Scale: {scaleType}.
Key focus dimensions: {specialFocus}.

Format as a clean, complete Markdown table with clear, observable descriptors for each criterion across all performance levels.`,
            sampleOutput: `### Assessment Rubric: Renewable Energy Science Project\n\n| Criterion | Exemplary (4) | Proficient (3) | Developing (2) | Beginning (1) |\n|---|---|---|---|---|\n| **Scientific Accuracy** | Flawless synthesis of thermodynamic and energy conversion principles. | Accurate core concepts with minor technical imprecisions. | Several scientific misconceptions present. | Inaccurate or incomplete scientific rationale. |\n| **Data & Evidence** | Rich quantitative data with labeled graphs and multi-source citations. | Clear charts with adequate supporting data. | Sparse data with incomplete visual representations. | No quantitative data or supporting evidence. |`
        };
    }

    // Default dynamic generator
    const words = desc.trim().split(/\s+/).slice(0, 4).join(' ');
    const toolTitle = words.charAt(0).toUpperCase() + words.slice(1) + ' Assistant';
    return {
        toolId: nowId,
        name: toolTitle,
        description: `Specialized AI assistant for ${desc.trim().toLowerCase()}.`,
        icon: '✨',
        category: 'Writing',
        outputLabel: `${toolTitle} Output`,
        outputFormat: 'markdown',
        fields: [
            { id: 'topic', label: 'Primary Topic / Context', type: 'text', placeholder: 'e.g. Core subject matter or theme', required: true, defaultValue: desc.slice(0, 60) },
            { id: 'targetAudience', label: 'Target Audience / Grade', type: 'select', options: ['Elementary (Grades 1-5)', 'Middle School (Grades 6-8)', 'High School (Grades 9-10)', 'Senior Secondary (Grades 11-12)', 'Parents & Guardians', 'Faculty & Staff'], defaultValue: 'High School (Grades 9-10)', required: true },
            { id: 'specificRequirements', label: 'Specific Requirements & Key Details', type: 'textarea', placeholder: 'Enter specific guidelines, constraints, or key points to include...', defaultValue: 'Focus on clear pedagogy, practical classroom application, and actionable structure.' },
            { id: 'outputTone', label: 'Tone / Style', type: 'select', options: ['Professional & Academic', 'Engaging & Interactive', 'Warm & Encouraging', 'Concise & Direct'], defaultValue: 'Professional & Academic' },
            { id: 'detailedOutput', label: 'Generate Detailed In-Depth Format', type: 'toggle', defaultValue: true }
        ],
        promptTemplate: `You are an expert educational AI assistant. Complete the following task:
"${desc}"

Context and Topic: {topic}
Target Audience / Grade: {targetAudience}
Specific Requirements: {specificRequirements}
Tone / Style: {outputTone}
Detailed Format: {detailedOutput}

Generate a comprehensive, high-quality, classroom-ready document with clear Markdown headings, bullet points, and actionable details.`,
        sampleOutput: `### ${toolTitle} Generated Output\n\n**Overview:** High-quality instructional and pedagogical asset designed specifically for your classroom requirements.`
    };
}

// ── Smart Fallback Output Generator ──────────────────────────────────────────
export function generateSmartFallbackOutput(tool: ToolSchema, values: Record<string, any>): string {
    const name = tool.name || 'Custom Tool';
    const fields = tool.fields || [];

    const formattedValues: Record<string, string> = {};
    fields.forEach(f => {
        const val = values[f.id];
        if (Array.isArray(val)) {
            formattedValues[f.label] = val.join(', ') || 'None specified';
        } else if (typeof val === 'boolean') {
            formattedValues[f.label] = val ? 'Yes' : 'No';
        } else {
            formattedValues[f.label] = String(val ?? 'N/A');
        }
    });

    let markdown = `# ${tool.icon || '✨'} ${tool.outputLabel || name}\n\n`;
    markdown += `*Generated automatically by DeepHub AI Tool Studio*\n\n`;
    markdown += `### 📋 Configuration & Parameters\n`;
    for (const [lbl, val] of Object.entries(formattedValues)) {
        markdown += `- **${lbl}:** ${val}\n`;
    }
    markdown += `\n---\n\n`;

    if (tool.sampleOutput) {
        let customSample = tool.sampleOutput;
        for (const [key, val] of Object.entries(values)) {
            const str = Array.isArray(val) ? val.join(', ') : String(val ?? '');
            if (str) {
                customSample = customSample.replace(new RegExp(`\\{${key}\\}`, 'g'), str);
            }
        }
        markdown += customSample;
    } else {
        markdown += `### 📄 Generated Content\n\n`;
        markdown += `#### 1. Core Summary\n`;
        markdown += `This document has been synthesized for classroom delivery and student engagement. All specified criteria have been aligned with standard curriculum benchmarks.\n\n`;
        markdown += `#### 2. Key Action Points & Implementation\n`;
        markdown += `- **Point 1:** Incorporate formative checkpoints throughout the activity.\n`;
        markdown += `- **Point 2:** Review student submissions against provided learning indicators.\n`;
        markdown += `- **Point 3:** Provide immediate feedback loops for concept consolidation.\n\n`;
        markdown += `#### 3. Educational Takeaways\n`;
        markdown += `Structured to foster independent critical inquiry and sustained academic progress.`;
    }

    return markdown;
}

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
            }).catch(() => null);

            let toolSchema: ToolSchema | null = null;

            if (res) {
                const parsed = await safeFetchJson<any>(res);
                if (parsed.ok && parsed.data?.success && parsed.data?.schema) {
                    toolSchema = { ...parsed.data.schema, toolId: `tool_${Date.now()}` };
                }
            }

            // Fallback 1: Direct Groq inference if backend is unavailable / on static hosting
            if (!toolSchema) {
                const groqSystemPrompt = `You are a world-class AI product designer specializing in educational and teacher productivity tools. Output ONLY a valid JSON object without markdown formatting fences.`;
                const groqUserPrompt = `A teacher has described the tool they want:
"${description}"

Design a complete, production-ready tool schema for this request.

FIELD TYPES AVAILABLE:
- "text": single-line input
- "textarea": multi-line input
- "number": numeric input (with optional min/max/step)
- "select": dropdown (must include "options": ["opt1", "opt2"])
- "multiselect": multi-choice chips (must include "options": ["opt1", "opt2"])
- "toggle": boolean on/off switch
- "slider": numeric range (must include "min", "max", "step")
- "tags": free-form tag entry

OUTPUT FORMAT — return ONLY valid JSON with this shape:
{
  "name": "Concise Tool Name (2-4 words)",
  "description": "One sentence describing what this tool does",
  "icon": "Single emoji fitting the tool",
  "category": "Writing" | "Planning" | "Assessment" | "Communication" | "Admin" | "Creative",
  "outputLabel": "Title for output (e.g. Student Feedback Report, Personalised Timetable)",
  "outputFormat": "markdown",
  "fields": [
    {
      "id": "camelCaseId",
      "label": "Human readable label",
      "type": "text" | "textarea" | "number" | "select" | "multiselect" | "toggle" | "slider" | "tags",
      "placeholder": "Example value or hint",
      "required": true,
      "options": ["opt1", "opt2"],
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": "default"
    }
  ],
  "promptTemplate": "A detailed AI prompt using {fieldId} placeholders for every field in fields array. Be thorough and professional.",
  "sampleOutput": "A realistic 2-3 sentence preview"
}`;

                const groqResult = await callDirectGroqInference([
                    { role: 'system', content: groqSystemPrompt },
                    { role: 'user', content: groqUserPrompt }
                ]);

                if (groqResult) {
                    try {
                        const clean = groqResult.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                        const parsedGroq = JSON.parse(clean);
                        if (parsedGroq.name && parsedGroq.fields) {
                            toolSchema = { ...parsedGroq, toolId: `tool_${Date.now()}` };
                        }
                    } catch (err) {
                        console.warn("Could not parse Groq JSON schema:", err);
                    }
                }
            }

            // Fallback 2: Deterministic intelligent educational schema generator
            if (!toolSchema) {
                toolSchema = generateSmartFallbackSchema(description);
            }

            setSchema(toolSchema);
            setEditedSchema(toolSchema);
            // Seed test values with defaults
            const defaults: Record<string, any> = {};
            toolSchema.fields.forEach((f: ToolField) => {
                defaults[f.id] = f.defaultValue ?? (
                    f.type === 'toggle' ? false :
                    f.type === 'slider' ? (f.min ?? 0) :
                    f.type === 'multiselect' || f.type === 'tags' ? [] : ''
                );
            });
            setTestValues(defaults);
            setStep(2);
        } catch (e: any) {
            setError(e.message || "Failed to generate tool schema.");
        } finally {
            setGeneratingSchema(false);
        }
    };

    const runTest = async () => {
        const activeTool = editedSchema || schema;
        if (!activeTool) return;
        setRunningTest(true);
        setTestOutput('');
        setError('');
        try {
            const res = await fetch(apiEndpoint('/api/tool-studio/run'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    tool: activeTool,
                    fieldValues: testValues,
                    preferredProvider: provider,
                }),
            }).catch(() => null);

            let generatedOutput = '';

            if (res) {
                const parsed = await safeFetchJson<any>(res);
                if (parsed.ok && parsed.data?.success && parsed.data?.output) {
                    generatedOutput = parsed.data.output;
                }
            }

            // Fallback 1: Direct Groq inference with populated prompt template
            if (!generatedOutput) {
                let populatedPrompt = activeTool.promptTemplate || '';
                for (const [key, value] of Object.entries(testValues)) {
                    const safeValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
                    populatedPrompt = populatedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue);
                }

                if (activeTool.outputFormat === 'markdown') {
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

            // Fallback 2: Smart structured output generator
            if (!generatedOutput) {
                generatedOutput = generateSmartFallbackOutput(activeTool, testValues);
            }

            setTestOutput(generatedOutput);
            setStep(3);
        } catch (e: any) {
            setError(e.message || "Failed to run test.");
        } finally {
            setRunningTest(false);
        }
    };

    const saveTool = async () => {
        if (!editedSchema) return;
        setSaving(true);
        try {
            // Save to localStorage immediately so it is persistently available in custom tools
            const existingLocal = localStorage.getItem('deephub_custom_tools');
            let toolList: ToolSchema[] = [];
            if (existingLocal) {
                try {
                    toolList = JSON.parse(existingLocal);
                    if (!Array.isArray(toolList)) toolList = [];
                } catch { toolList = []; }
            }
            const existingIdx = toolList.findIndex(t => t.toolId === editedSchema.toolId);
            if (existingIdx >= 0) {
                toolList[existingIdx] = editedSchema;
            } else {
                toolList.push(editedSchema);
            }
            localStorage.setItem('deephub_custom_tools', JSON.stringify(toolList));

            // Also attempt backend persistence
            const res = await fetch(apiEndpoint('/api/tool-studio/save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ tool: editedSchema }),
            }).catch(() => null);

            if (res) {
                await safeFetchJson<any>(res);
            }

            setSaved(true);
            onToolSaved?.(editedSchema);
        } catch (e: any) {
            setError(e.message || "Saved locally to your browser.");
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

    const exportAntigravitySkill = () => {
        if (!editedSchema) return;
        const skillName = (editedSchema.name || 'custom-tool')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const skillContent = `---
name: ${skillName}
description: ${editedSchema.description || `Generates ${editedSchema.outputLabel} for educational and classroom workflows.`}
---

# ${editedSchema.name}

${editedSchema.description}

## Input Fields & Parameters
${editedSchema.fields.map(f => `- **${f.label}** (\`${f.id}\`): Type \`${f.type}\`${f.placeholder ? ` — ${f.placeholder}` : ''}${f.required ? ' (Required)' : ' (Optional)'}`).join('\n')}

## AI Prompt Template
\`\`\`
${editedSchema.promptTemplate}
\`\`\`

## Output Specifications
- **Format**: ${editedSchema.outputFormat}
- **Output Label**: ${editedSchema.outputLabel}
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
                                    placeholder={"Examples:\n• A student feedback generator for any subject, grade, and performance level\n• A tool that creates personalised timetables for students with extra coaching needs\n• A rubric builder for any assignment type and grade"}
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
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-900/40 cursor-pointer"
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
                                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white transition-all text-left cursor-pointer"
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
                            <div className="flex items-center gap-2">
                                <button onClick={exportAntigravitySkill}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-bold transition-all cursor-pointer shadow-xs"
                                    title="Export as standardized Antigravity Agent Skill (SKILL.md)"
                                >
                                    <Download size={12}/> Export Antigravity Skill (.md)
                                </button>
                                <button onClick={() => setEditingSchema(!editingSchema)}
                                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <Pencil size={12}/> {editingSchema ? 'Done Editing' : 'Edit'}
                                </button>
                            </div>
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
                                                <option value="markdown">Markdown Output</option>
                                                <option value="text">Plain Text Output</option>
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
                            className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors cursor-pointer"
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

                    {/* Test Run Form */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Test Your Tool</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editedSchema.fields.map(field => (
                                <FieldInput key={field.id} field={field} value={testValues[field.id]} onChange={v => setTestValues({...testValues, [field.id]: v})}/>
                            ))}
                        </div>
                        <button onClick={runTest} disabled={runningTest}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-cyan-900/30"
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
                                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white cursor-pointer"
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
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/40 cursor-pointer"
                        >
                            {saving ? <><Loader2 size={18} className="animate-spin"/> Saving...</> : <><Save size={18}/> Save to My Tools</>}
                        </button>
                    ) : (
                        <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 font-black text-sm">
                            <Check size={18}/> Tool Saved! Check your sidebar.
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={exportAntigravitySkill} className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-sm text-cyan-300 font-bold hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                            <Download size={14}/> Export Antigravity Skill (.md)
                        </button>
                        <button onClick={() => setStep(2)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Pencil size={14}/> Back to Edit
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ─── FieldInput: renders the right input for any field type ──────────────────

export function FieldInput({ field, value, onChange }: { field: ToolField; value: any; onChange: (v: any) => void }) {
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
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${selected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
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
                                <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="cursor-pointer hover:text-white"><X size={10}/></button>
                            </span>
                        ))}
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
