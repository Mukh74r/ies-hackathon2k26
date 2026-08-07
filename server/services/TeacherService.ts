import { AIService } from './AIService.ts';
import { QuestionPaper } from '../models/QuestionPaper.ts';
import { DynamoService } from './DynamoService.ts';
import { processDocument } from '../utils/file_scanner.ts';



const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

export class TeacherService {
    /**
     * STREAMLINED PIPELINE (Patch-42)
     * - Frontend extracts ALL text (snippets via Tesseract, PDFs via pdfjs)
     * - Backend receives PRE-EXTRACTED text only
     * - AI is called EXACTLY ONCE — to generate questions
     * - No redundant OCR, no redundant analysis calls
     */
    static async generateQuestionPaper(userId: string, data: any, files: any, provider: string = 'auto') {
        const startTime = Date.now();
        console.log(`[TeacherService] 🚀 Starting Sync Job for User ${userId}. Provider: ${provider}`);

        const { sections, difficulty, syllabusText, materialText } = data;

        // ===== STAGE 1: Process Snippet Text =====
        let snippetText = "";
        if (data.snippetText) {
            snippetText = data.snippetText;
        }

        // ===== STAGE 2: Process Reference Material =====
        let extractedMaterials = materialText || "";
        
        // If raw files were sent (fallback), extract text server-side with safety timeout
        if (files?.materials && !materialText) {
            for (const file of files.materials) {
                try {
                    // Safety Guard: 60s timeout per file
                    const extractionTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Extraction Timeout")), 60000));
                    const content = await Promise.race([
                        processDocument(file),
                        extractionTimeout
                    ]) as string;
                    
                    extractedMaterials += `\n\n--- ${file.originalname} ---\n${content}`;
                } catch (e) {
                    console.error(`[Extraction Failed] ${file.originalname}:`, e);
                    extractedMaterials += `\n\n--- ${file.originalname} ---\n(Extraction skipped due to complexity or timeout)`;
                }
            }
        }
        
        // ===== CONTEXT GUARD & TRUNCATION =====
        let totalContext = (snippetText + extractedMaterials).trim();
        const wordCount = totalContext.split(/\s+/).filter(Boolean).length;
        
        if (wordCount < 5) {
            console.warn(`[Sync Job] Insufficient context: ${wordCount} words.`);
            throw new Error("Insufficient content. Please snip at least a few lines from the syllabus before generating.");
        }

        // Safety Truncation: 128k context limit (roughly 40k words)
        if (wordCount > 40000) {
            console.warn(`[Sync Job] Context too large (${wordCount} words). Truncating to 40k words.`);
            const words = totalContext.split(/\s+/);
            totalContext = words.slice(0, 40000).join(' ');
        }
        
        console.log(`[Sync Job] Total Context Size: ${totalContext.length} chars (~${wordCount} words).`);

        // ===== STAGE 3: Build Prompt & Generate =====
        const sectionDataList = typeof sections === 'string' ? JSON.parse(sections) : sections;
        const formattedRequirements = sectionDataList.map((s: any) => ({
            sectionName: s.name,
            generateCount: s.questions,
            marksPerQuestion: s.marks
        }));

        const prompt = `Act as an expert Academic Professor. Generate a professional CBSE-standard question paper in JSON format.

DOCUMENT CONTEXT:
1. Syllabus Snippets: ${snippetText}
2. Reference Materials: ${extractedMaterials}

EXAM SPECIFICATIONS:
- School: ${data.schoolName || "DeepHub Academy"}
- Title: ${data.examTitle || "Standard Examination"}
- Subject: ${data.subject} | Grade: ${data.grade}
- Time: ${data.examTime} Mins | Marks: ${data.totalMarks}
- Difficulty: ${difficulty}
- Sections Required: ${JSON.stringify(formattedRequirements)}

STRICT RULES:
- Generate EXACTLY the number of questions per section.
- Generate EXACTLY the marks specified per question.
- The FIRST section (usually Section A) MUST be Multiple Choice Questions (MCQs) ONLY. Every question in this section MUST have exactly 4 options (A, B, C, D) provided in the "options" array.
- Generate AT LEAST 7 professional "Exam Instructions".
- NO answers or solutions. Questions ONLY.
- Use LaTeX for ALL math/science notation ONLY inside $...$ or $$...$$ delimiters.
- For fill-in-the-blank questions, use ______ (six underscores), NEVER use \boxed{}.

OUTPUT JSON SCHEMA:
{
  "schoolName": "string",
  "paperTitle": "string",
  "subject": "string",
  "grade": "string",
  "timeAllowed": "string",
  "maximumMarks": "string",
  "instructions": ["string"],
  "sections": [
    {
      "name": "string",
      "description": "string",
      "questions": [
        { "text": "string", "marks": number, "options": ["string"] }
      ]
    }
  ]
}

Return JSON ONLY.`;
        
        try {
            const completion = await AIService.complete({
                messages: [
                    { role: 'system', content: 'You are an elite professor. Output valid JSON question papers only. No pre-amble. No spoilers.' }, 
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' },
                forcedProvider: (provider.toLowerCase().includes('groq') ? 'groq' : 
                                 provider.toLowerCase().includes('gemini') ? 'gemini' : 
                                 provider.toLowerCase().includes('ollama') ? 'ollama' : 
                                 'groq') // Default to 'groq' for speed
            });

            const paperContent = completion.choices[0].message.content || "{}";
            const parsedContent = JSON.parse(paperContent);
            
            const paperData = {
                title: data.examTitle || 'Generated Paper',
                sections: parsedContent.sections,
                difficulty,
                rawContent: paperContent,
                type: 'question_paper'
            };
            
            let finalResult: any;
            if (USE_DYNAMODB) {
                const paperId = 'paper_' + Date.now();
                await DynamoService.saveLesson(userId, paperId, paperData);
                finalResult = { _id: paperId, ...paperData };
            } else {
                const paper = new QuestionPaper({
                    user: userId,
                    ...paperData,
                    sections: paperData.sections
                });
                finalResult = await paper.save();
            }

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[Sync Job] 🎯 Paper generated in ${elapsed}s`);

            return finalResult;
        } catch (err: any) {
            if (err.name === 'AbortError') {
                throw new Error("Neural Timeout: AI took longer than 10 minutes. Ensure your context size is reasonable or switch to Groq (Cloud) for faster synthesis.");
            }
            throw err;
        }
    }

    static async generateHomework(userId: string, data: {
        topic: string;
        subject: string;
        grade: string;
        difficulty: string;
        schoolName: string;
        assignmentTitle: string;
        dueDate: string;
        sections: { name: string; taskCount: number; marks: number; type: string }[];
        templateType: string;
    }, provider: string = 'auto') {

        const formattedSections = data.sections.map(s => ({
            sectionName: s.name,
            type: s.type,
            generateCount: s.taskCount,
            marksPerTask: s.marks,
        }));

        const prompt = `Act as an expert Academic Teacher. Generate a professional HOMEWORK ASSIGNMENT in JSON format.

CONTEXT:
- School: ${data.schoolName || "DeepHub Academy"}
- Assignment Title: ${data.assignmentTitle || "Homework Assignment"}
- Subject: ${data.subject || "General"} | Grade: ${data.grade || "10"}
- Due Date: ${data.dueDate || "Next Class"}
- Difficulty: ${data.difficulty || "medium"}
- Template: ${data.templateType || "school"}
- Topic/Summary: ${data.topic}

SECTION REQUIREMENTS: ${JSON.stringify(formattedSections)}

HOMEWORK TYPES (match each section's "type"):
- "practice": Drill exercises (solve equations, compute values, apply formulas)
- "short-answer": Short answer questions (2-3 sentence answers expected)
- "fill-blanks": Fill in the blanks (use ______ for blanks)
- "word-problems": Real-world application word problems
- "critical-thinking": Higher-order thinking / analysis questions
- "mcq": Multiple choice with 4 options

STRICT RULES:
- This is HOMEWORK for students to do at HOME — NOT an exam paper. Use friendly, encouraging language.
- Generate EXACTLY the number of tasks per section.
- Use LaTeX for math/science inside $...$ or $$...$$ only.
- For fill-in-the-blank, use ______ (six underscores).
- Include clear instructions for each section.
- Generate AT LEAST 4 general instructions.

OUTPUT JSON SCHEMA:
{
  "schoolName": "string",
  "assignmentTitle": "string", 
  "subject": "string",
  "grade": "string",
  "dueDate": "string",
  "instructions": ["string"],
  "sections": [
    {
      "name": "string",
      "description": "string",
      "type": "string",
      "questions": [
        { "text": "string", "marks": number, "options": ["string"] }
      ]
    }
  ]
}

The "options" array should ONLY be present for "mcq" type sections. Return JSON ONLY.`;

        return await AIService.complete({
            messages: [
                { role: 'system', content: 'You are an expert homework designer. Output valid JSON homework assignments only. No extra text.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
            forcedProvider: (provider.toLowerCase().includes('groq') ? 'groq' : 
                             provider.toLowerCase().includes('gemini') ? 'gemini' : 
                             provider.toLowerCase().includes('ollama') ? 'ollama' : 
                             'groq')
        });
    }

    static async generateLessonPlan(userId: string, data: {
        topic: string;
        grade: string;
        subject: string;
        duration: string;
        objectives: string;
        board: string;
        schoolName: string;
        templateType: string;
    }, provider: string = 'auto') {
        const prompt = `Act as an expert Academic Strategist. Create a professional, detailed Lesson Plan in JSON format.

CONTEXT:
- School/Institution: ${data.schoolName || "DeepHub Academy"}
- Topic: ${data.topic}
- Subject: ${data.subject || "General"}
- Grade/Level: ${data.grade || "10"}
- Duration: ${data.duration || "40 Mins"}
- Board/Curriculum: ${data.board || "CBSE"}
- Template: ${data.templateType || "school"}
${data.objectives ? `- Specific Objectives: ${data.objectives}` : ''}

OUTPUT JSON SCHEMA:
{
  "schoolName": "string",
  "topic": "string",
  "subject": "string",
  "grade": "string",
  "duration": "string",
  "board": "string",
  "sections": [
    {
      "title": "string",
      "type": "objectives|materials|introduction|main-activity|conclusion|assessment|differentiation|homework",
      "items": [
        { "text": "string", "duration": "string (optional)", "method": "string (optional)" }
      ]
    }
  ]
}

REQUIRED SECTIONS (in order):
1. "Learning Objectives" (type: objectives) — 3-5 objectives using Bloom's Taxonomy verbs
2. "Materials Required" (type: materials) — list of materials/resources
3. "Introduction / Warm-Up" (type: introduction) — engaging opener with duration
4. "Main Activity / Development" (type: main-activity) — step-by-step teaching procedure with durations
5. "Conclusion / Wrap-Up" (type: conclusion) — summary activity with duration
6. "Assessment" (type: assessment) — how to check understanding
7. "Differentiation Strategies" (type: differentiation) — adaptations for different learners
8. "Homework / Extension" (type: homework) — follow-up work

RULES:
- Each item should have "text" (the content), and optionally "duration" (e.g. "5 mins") and "method" (e.g. "Interactive", "Lecture", "Group Work")
- Use LaTeX for any math/science formulas inside $...$ only
- Be detailed and specific, not generic

Return JSON ONLY.`;
        
        return await AIService.complete({
            messages: [
                { role: 'system', content: 'You are an expert lesson plan designer. Output valid JSON lesson plans only. No extra text.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
            forcedProvider: (provider.toLowerCase().includes('groq') ? 'groq' : 
                             provider.toLowerCase().includes('gemini') ? 'gemini' : 
                             provider.toLowerCase().includes('ollama') ? 'ollama' : 
                             'groq')
        });
    }

    static async generateSecretaryDoc(userId: string, data: {
        docType: string;
        context: string;
        branding: { name: string; address: string; phone: string; email: string; } | null;
        templateType: string;
    }, provider: string = 'auto') {
        const prompt = `Act as a professional School Secretary/Administrator. Draft a professional ${data.docType} document in JSON format.

CONTEXT/REQUIREMENTS:
${data.context}

${data.branding ? `INSTITUTION BRANDING:
- Name: ${data.branding.name}
- Address: ${data.branding.address}
- Phone: ${data.branding.phone}
- Email: ${data.branding.email}` : ''}

Template Style: ${data.templateType || 'school'}

OUTPUT JSON SCHEMA:
{
  "documentTitle": "string (e.g. 'PERMISSION SLIP', 'NOTICE', etc.)",
  "refNumber": "string (e.g. 'REF/2026/001')",
  "date": "string (today's date formatted)",
  "to": "string (addressed to whom)",
  "subject": "string (subject line)",
  "body": ["string (each paragraph of the document body)"],
  "closing": "string (e.g. 'Yours sincerely,')",
  "signatoryName": "string",
  "signatoryTitle": "string",
  "footer": "string (optional notes/disclaimer)"
}

RULES:
- Professional, formal tone appropriate for ${data.templateType === 'college' ? 'a university' : 'a school'}
- Each paragraph in "body" should be a complete, well-formed paragraph
- Include a proper reference number
- Ensure all required fields are filled

Return JSON ONLY.`;
        
        return await AIService.complete({
            messages: [
                { role: 'system', content: 'You are a professional academic document drafter. Output valid JSON documents only. No extra text.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.4,
            response_format: { type: 'json_object' },
            forcedProvider: (provider.toLowerCase().includes('groq') ? 'groq' : 
                             provider.toLowerCase().includes('gemini') ? 'gemini' : 
                             provider.toLowerCase().includes('ollama') ? 'ollama' : 
                             'groq')
        });
    }

    static async solvePaper(userId: string, paperText: string, provider: string = 'auto') {
        const prompt = `You are an expert Academic Solver. Solve every question in the following question paper.

PAPER CONTENT:
${paperText}

RULES:
1. Solve EVERY question — do NOT skip any.
2. Provide a detailed, step-by-step answer for each question.
3. Explain the key concept behind each answer.
4. Use LaTeX for all mathematical notation (e.g., $x^2$, $$\\frac{a}{b}$$).
5. Return a JSON object with a single key "solutions" containing an array.

OUTPUT FORMAT (must be a JSON object with a solutions array):
{
  "solutions": [
    {
      "question_no": 1,
      "question": "Full question text here",
      "answer": "Complete step-by-step answer here",
      "explanation": "Key concept/pedagogical explanation here"
    }
  ]
}`;
        
        const completion = await AIService.complete({
            messages: [
                { role: 'system', content: 'You are a Neural Academic Solver. Output ONLY a valid JSON object with a "solutions" key containing an array. Never include markdown fences.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 8192,
            response_format: { type: 'json_object' },
            forcedProvider: (provider.toLowerCase().includes('groq') ? 'groq' :
                             provider.toLowerCase().includes('gemini') ? 'gemini' :
                             provider.toLowerCase().includes('ollama') ? 'ollama' : 'groq')
        });
        
        let content = (completion.choices[0].message.content || '').trim();
        
        // Strip markdown code fences if AI wraps in ```json ... ```
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        
        try {
            const parsed = JSON.parse(content);
            
            // Primary: { solutions: [...] }
            if (parsed.solutions && Array.isArray(parsed.solutions)) return parsed.solutions;
            
            // Fallback: bare array
            if (Array.isArray(parsed)) return parsed;
            
            // Fallback: find first array value in object
            for (const val of Object.values(parsed)) {
                if (Array.isArray(val) && (val as any[]).length > 0) return val as any[];
            }
            
            return [parsed];
        } catch (e) {
            console.error("[Solver Parse Error] Raw content:", content.substring(0, 800));
            throw new Error("Neural Solver returned invalid data. Please try again.");
        }
    }

    static async shuffleQuiz(userId: string, masterQuiz: string, provider: string = 'auto') {
        const prompt = `Act as a secure Assessment Architect. Generate 3 unique versions (Set A, Set B, Set C) of the following quiz.
            
MASTER QUIZ:
${masterQuiz}

STRICT RULES:
1. Shuffle question order.
2. Shuffle option order within multiple choice questions.
3. Keep the DIFFICULTY parity identical across all sets.
4. Output as a JSON object with keys: setA, setB, setC.

Return JSON only.`;
        
        const completion = await AIService.complete({
            messages: [{ role: 'system', content: 'Secure Assessment Engine. Output JSON ONLY.' }, { role: 'user', content: prompt }],
            temperature: 0.2,
            response_format: { type: 'json_object' },
            forcedProvider: provider
        });
        
        return JSON.parse(completion.choices[0].message.content || '{"setA": "", "setB": "", "setC": ""}');
    }

    static async analyzeReport(userId: string, reportText: string, provider: string = 'auto') {
        const prompt = `Act as an expert Neural Student Counselor. Analyze this student report card.
            
REPORT CONTENT:
${reportText}

Provide:
1. Academic Performance Summary (### Executive Summary)
2. Strength Analysis (### Key Strengths)
3. Areas of Improvement (### Critical Gaps)
4. Strategic Action Plan (### Growth Roadmap)

Format with professional Markdown.`;
        
        return await AIService.complete({
            messages: [{ role: 'system', content: 'Student Success Analyst' }, { role: 'user', content: prompt }],
            temperature: 0.4,
            forcedProvider: provider
        });
    }

    static async generateSpeech(userId: string, data: any, provider: string = 'auto') {
        const {
            occasion, tone, audience, speakerName, institution, duration,
            language, keyPoints, includePoem, includeQuote, templateType
        } = data;

        const durationGuide = duration <= 3 ? 'very short (1–3 min, ~300 words)' :
            duration <= 7  ? 'short (4–7 min, ~700 words)' :
            duration <= 12 ? 'medium (8–12 min, ~1200 words)' :
                             'long (13–20 min, ~2000 words)';

        const prompt = `You are a master speechwriter with decades of experience crafting speeches for educators and academic institutions.

Write a ${tone} speech for a teacher/educator for the following occasion.

SPEECH BRIEF:
- Occasion: ${occasion}
- Speaker: ${speakerName || 'The Teacher'}
- Institution: ${institution || 'Our Institution'}
- Audience: ${audience}
- Tone: ${tone}
- Target Duration: ${durationGuide}
- Template Style: ${templateType} (school = K-12 formal; college = university/professional)
- Language Preference: ${language}
${keyPoints ? `- Key Points to Cover:\n${keyPoints}` : ''}
${includePoem ? '- Include a short original poem or verse relevant to the occasion.' : ''}
${includeQuote ? '- Include 1–2 powerful, relevant quotes from famous educators, philosophers, or leaders.' : ''}

STRICT OUTPUT FORMAT — Return ONLY a valid JSON object:
{
  "title": "Speech title",
  "occasion": "${occasion}",
  "tone": "${tone}",
  "estimatedDuration": "${durationGuide}",
  "speakerName": "${speakerName || 'The Teacher'}",
  "institution": "${institution || 'Our Institution'}",
  "opening": {
    "salutation": "Respected Principal, dear colleagues, beloved students...",
    "hook": "Engaging opening line or anecdote",
    "text": "Full opening paragraph(s)"
  },
  "body": [
    {
      "section": "Section heading (e.g., The Journey We Shared)",
      "text": "Full section content",
      "transitionLine": "Bridging sentence to next section"
    }
  ],
  "quote": "Optional memorable quote (empty string if not requested)",
  "poem": "Optional short poem/verse (empty string if not requested)",
  "closing": {
    "callToAction": "Inspiring call to action or final thought",
    "thankYou": "Formal closing and acknowledgements",
    "signOff": "Final sign-off line"
  },
  "keyPhrases": ["memorable phrase 1", "memorable phrase 2", "memorable phrase 3"]
}`;

        const completion = await AIService.complete({
            messages: [
                { role: 'system', content: 'You are a master speechwriter for educators. Output ONLY a valid JSON object. Never include markdown fences.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.75,
            max_tokens: 8192,
            response_format: { type: 'json_object' },
            forcedProvider: provider
        });

        const content = (completion.choices[0].message.content || '{}').trim()
            .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        return JSON.parse(content);
    }

    // ──────────────────────────────────────────────────────────────
    //  TOOL STUDIO
    // ──────────────────────────────────────────────────────────────

    /**
     * Takes a natural-language description of a tool a teacher wants,
     * and returns a complete tool schema that can be rendered dynamically.
     */
    static async generateToolSchema(userId: string, description: string, provider: string = 'auto') {
        const prompt = `You are a world-class AI product designer specializing in teacher productivity tools.

A teacher has described the tool they want in plain English:
"${description}"

Your job is to design a complete, production-ready tool schema for this request.

FIELD TYPES AVAILABLE:
- "text"       : single-line input
- "textarea"   : multi-line input
- "number"     : numeric input (with optional min/max)
- "select"     : dropdown (must include "options": ["opt1", "opt2"])
- "multiselect": multi-choice chips (must include "options": ["opt1", "opt2"])
- "toggle"     : boolean on/off switch
- "slider"     : numeric range (must include "min", "max", "step")
- "tags"       : free-form tag entry

OUTPUT FORMAT — return ONLY this JSON object:
{
  "name": "Tool name (short, catchy, describes the task)",
  "description": "One sentence describing what this tool does",
  "icon": "Single emoji that fits the tool",
  "category": "One of: Writing, Planning, Assessment, Communication, Admin, Creative",
  "outputLabel": "What to call the result (e.g., 'Generated Letter', 'Your Worksheet')",
  "outputFormat": "text or markdown",
  "fields": [
    {
      "id": "camelCaseId",
      "label": "Human readable label",
      "type": "text|textarea|number|select|multiselect|toggle|slider|tags",
      "placeholder": "Example value or hint",
      "required": true,
      "options": ["only for select/multiselect"],
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": "sensible default"
    }
  ],
  "promptTemplate": "A detailed AI prompt using {fieldId} placeholders. Be thorough — this is what the AI will use to generate the output. Include all field values using {fieldId} syntax. The prompt should be professional and produce high-quality teacher-grade output.",
  "sampleOutput": "A realistic 2-3 sentence example of what the output would look like"
}

Rules:
1. Design 3–7 fields maximum (keep it usable)
2. The promptTemplate must use {fieldId} for every field
3. Name should be concise (2–4 words max)
4. Make the tool genuinely useful for a teacher
5. Return ONLY valid JSON`;

        const completion = await AIService.complete({
            messages: [
                { role: 'system', content: 'You are an expert AI product designer. Output ONLY a valid JSON object.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
            forcedProvider: provider
        });

        const content = (completion.choices[0].message.content || '{}').trim()
            .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        return JSON.parse(content);
    }

    /**
     * Runs a custom tool by interpolating field values into the tool's prompt template
     * and calling the AI to generate output.
     */
    static async runCustomTool(userId: string, tool: any, fieldValues: Record<string, any>, provider: string = 'auto') {
        let prompt = tool.promptTemplate;

        // Replace all {fieldId} placeholders with actual values
        for (const [key, value] of Object.entries(fieldValues)) {
            const safeValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
            prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue);
        }

        // Append output format instruction
        if (tool.outputFormat === 'markdown') {
            prompt += '\n\nFormat your response with clear Markdown headings, bullet points, and structure.';
        }

        const completion = await AIService.complete({
            messages: [
                { role: 'system', content: `You are a professional AI assistant for teachers. Generate high-quality, accurate, classroom-ready content.` },
                { role: 'user', content: prompt }
            ],
            temperature: 0.6,
            max_tokens: 4096,
            forcedProvider: provider
        });

        return completion.choices[0].message.content || '';
    }
}

