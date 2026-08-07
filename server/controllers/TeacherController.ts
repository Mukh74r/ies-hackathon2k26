import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { TeacherService } from '../services/TeacherService.ts';
import { processDocument } from '../utils/file_scanner.ts';

export class TeacherController {
    static async generateQuestions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = req.body.provider || 'auto';
            
            // Wait for generation synchronously
            const result = await TeacherService.generateQuestionPaper(userId, req.body, req.files, provider);

            res.json({ success: true, result, message: 'Neural Synthesis completed successfully.' });
        } catch (err: any) {
            console.error(`[Synthesis Failed]:`, err);
            // Don't leak full error traces, but give descriptive error
            res.status(500).json({ success: false, error: err.message || 'Neural Synthesis failed.' });
        }
    }

    static async generateHomework(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { topic, difficulty, schoolName, subject, grade, assignmentTitle, dueDate, sections, templateType, preferredProvider } = req.body;
            
            const provider = preferredProvider || 'auto';

            const hwData = {
                topic: topic || '',
                subject: subject || 'General',
                grade: grade || '10',
                difficulty: difficulty || 'medium',
                schoolName: schoolName || '',
                assignmentTitle: assignmentTitle || 'Homework Assignment',
                dueDate: dueDate || '',
                sections: sections || [
                    { name: 'Part A', taskCount: 5, marks: 2, type: 'practice' },
                    { name: 'Part B', taskCount: 3, marks: 5, type: 'short-answer' },
                ],
                templateType: templateType || 'school',
            };

            const result = await TeacherService.generateHomework(userId, hwData, provider);

            const content = result.choices[0].message.content || "{}";
            let parsed;
            try {
                const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
                parsed = JSON.parse(cleaned);
            } catch {
                parsed = null;
            }

            res.json({ success: true, result: parsed, rawContent: content, message: 'Homework generated successfully.' });
        } catch (err: any) {
            console.error(`[Homework Synthesis Failed]:`, err);
            res.status(500).json({ success: false, error: err.message || 'Homework Synthesis failed.' });
        }
    }

    static async generateLessonPlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { topic, grade, duration, subject, objectives, board, schoolName, templateType, preferredProvider } = req.body;
            const provider = preferredProvider || 'auto';

            const lpData = {
                topic: topic || '',
                grade: grade || '10',
                subject: subject || 'General',
                duration: duration || '40 Mins',
                objectives: objectives || '',
                board: board || 'CBSE',
                schoolName: schoolName || '',
                templateType: templateType || 'school',
            };

            const result = await TeacherService.generateLessonPlan(userId, lpData, provider);
            const content = result.choices[0].message.content || "{}";
            let parsed;
            try {
                const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
                parsed = JSON.parse(cleaned);
            } catch {
                parsed = null;
            }

            res.json({ success: true, result: parsed, rawContent: content });
        } catch (err: any) {
            console.error(`[Lesson Plan Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async generateSecretaryDoc(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { promptText, context, docType, template, branding, templateType, preferredProvider } = req.body;
            const provider = preferredProvider || 'auto';

            const secData = {
                docType: docType || template || 'notice',
                context: context || promptText || '',
                branding: branding || null,
                templateType: templateType || 'school',
            };

            const result = await TeacherService.generateSecretaryDoc(userId, secData, provider);
            const content = result.choices[0].message.content || "{}";
            let parsed;
            try {
                const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
                parsed = JSON.parse(cleaned);
            } catch {
                parsed = null;
            }

            res.json({ success: true, result: parsed, rawContent: content, content: content });
        } catch (err: any) {
            console.error(`[Secretary Doc Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async solvePaper(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const provider = req.body.preferredProvider || 'auto';
            let paperText: string = req.body.paperText || '';

            // multer.single("paper") stores the file in req.file (SINGULAR), not req.files
            const uploadedFile = (req as any).file || null;
            
            console.log(`[SolvePaper] File present: ${!!uploadedFile}, paperText length: ${paperText.length}`);
            if (uploadedFile) {
                console.log(`[SolvePaper] File details: name=${uploadedFile.originalname}, key=${uploadedFile.key || 'N/A'}, path=${uploadedFile.path || 'N/A'}, location=${uploadedFile.location || 'N/A'}, size=${uploadedFile.size}`);
            }

            if ((!paperText || !paperText.trim()) && uploadedFile) {
                console.log(`[SolvePaper] Extracting text from uploaded file: ${uploadedFile.originalname}`);
                try {
                    paperText = await processDocument(uploadedFile);
                    console.log(`[SolvePaper] Extracted ${paperText.length} chars from PDF`);
                } catch (e: any) {
                    console.error('[SolvePaper] File extraction failed:', e);
                    throw new Error(`Could not extract text from PDF: ${e.message}`);
                }
            }

            if (!paperText || !paperText.trim()) {
                if (uploadedFile) {
                    throw new Error(
                        'Could not extract text from this PDF. It appears to be a scanned/image PDF with no embedded text layer. ' +
                        'Please upload a digitally-created (text-based) PDF, or copy-paste the questions manually.'
                    );
                }
                throw new Error('No text provided. Please upload a PDF or paste the question text.');
            }

            console.log(`[SolvePaper] Solving paper, text length: ${paperText.length} chars`);

            // solvePaper returns the parsed solutions array directly
            const solutions = await TeacherService.solvePaper(userId, paperText, provider);

            res.json({ success: true, solutions });
        } catch (err: any) {
            console.error(`[Solver Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async shuffleQuiz(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { masterQuiz, preferredProvider } = req.body;
            const provider = preferredProvider || 'auto';

            const versions = await TeacherService.shuffleQuiz(userId, masterQuiz, provider);

            res.json({ success: true, versions });
        } catch (err: any) {
            console.error(`[Shuffler Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async analyzeReport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { reportText, preferredProvider } = req.body;
            const provider = preferredProvider || 'auto';

            const result = await TeacherService.analyzeReport(userId, reportText, provider);
            const analysis = result.choices[0].message.content || "";

            res.json({ success: true, analysis });
        } catch (err: any) {
            console.error(`[Analysis Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async generateSpeech(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const {
                occasion, tone, audience, speakerName, institution, duration,
                language, keyPoints, includePoem, includeQuote, templateType,
                preferredProvider
            } = req.body;

            const provider = preferredProvider || 'auto';

            const speechData = {
                occasion: occasion || 'Annual Day',
                tone: tone || 'formal',
                audience: audience || 'Students and Staff',
                speakerName: speakerName || '',
                institution: institution || '',
                duration: Number(duration) || 5,
                language: language || 'English',
                keyPoints: keyPoints || '',
                includePoem: !!includePoem,
                includeQuote: !!includeQuote,
                templateType: templateType || 'school',
            };

            const result = await TeacherService.generateSpeech(userId, speechData, provider);
            res.json({ success: true, result });
        } catch (err: any) {
            console.error(`[Speech Gen Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  TOOL STUDIO
    // ──────────────────────────────────────────────────────────────

    static async generateToolSchema(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');
            const { description, preferredProvider } = req.body;
            if (!description?.trim()) throw new Error('Description is required.');
            const schema = await TeacherService.generateToolSchema(userId, description.trim(), preferredProvider || 'auto');
            res.json({ success: true, schema });
        } catch (err: any) {
            console.error(`[ToolStudio Schema Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async runCustomTool(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');
            const { tool, fieldValues, preferredProvider } = req.body;
            if (!tool?.promptTemplate) throw new Error('Invalid tool schema.');
            const output = await TeacherService.runCustomTool(userId, tool, fieldValues || {}, preferredProvider || 'auto');
            res.json({ success: true, output });
        } catch (err: any) {
            console.error(`[ToolStudio Run Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async saveCustomTool(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');
            const { tool } = req.body;
            if (!tool?.name || !tool?.fields) throw new Error('Invalid tool schema.');
            const { DynamoService } = await import('../services/DynamoService.ts');
            const toolWithId = { ...tool, toolId: tool.toolId || `tool_${Date.now()}`, userId };
            await DynamoService.saveCustomTool(userId, toolWithId);
            res.json({ success: true, tool: toolWithId });
        } catch (err: any) {
            console.error(`[ToolStudio Save Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async listCustomTools(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');
            const { DynamoService } = await import('../services/DynamoService.ts');
            const tools = await DynamoService.getCustomToolsByUser(userId);
            res.json({ success: true, tools });
        } catch (err: any) {
            console.error(`[ToolStudio List Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async deleteCustomTool(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');
            const { toolId } = req.params;
            const { DynamoService } = await import('../services/DynamoService.ts');
            await DynamoService.deleteCustomTool(userId, String(toolId));
            res.json({ success: true });
        } catch (err: any) {
            console.error(`[ToolStudio Delete Failed]:`, err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

