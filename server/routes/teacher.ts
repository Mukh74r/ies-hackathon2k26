import express from "express";
import { qpUpload } from "../middleware/upload.ts";
import { TeacherController } from "../controllers/TeacherController.ts";
import { authenticate } from "../middleware/auth.ts";
import { toolLimiter } from "../middleware/toolLimiter.ts";

const router = express.Router();

router.post(
    "/generate-questions",
    authenticate,
    toolLimiter('question-generator'),
    qpUpload.fields([
        { name: "materials", maxCount: 10 }
    ]),
    TeacherController.generateQuestions
);

router.post(
    "/generate-homework",
    authenticate,
    toolLimiter('homework-creator'),
    TeacherController.generateHomework
);

router.post(
    "/lesson-plan/generate",
    authenticate,
    toolLimiter('lesson-plan'),
    TeacherController.generateLessonPlan
);

router.post(
    "/secretary/generate",
    authenticate,
    toolLimiter('secretary'),
    TeacherController.generateSecretaryDoc
);

router.post(
    "/solve-paper",
    authenticate,
    toolLimiter('paper-solver'),
    qpUpload.single("paper"), 
    TeacherController.solvePaper
);

router.post(
    "/shuffler/version",
    authenticate,
    toolLimiter('shuffler'),
    TeacherController.shuffleQuiz
);

router.post(
    "/analyze-report",
    authenticate,
    toolLimiter('report-assistant'),
    qpUpload.single("report"),
    TeacherController.analyzeReport
);

router.post(
    "/speech/generate",
    authenticate,
    toolLimiter('speech-generator'),
    TeacherController.generateSpeech
);

// ── Tool Studio ───────────────────────────────────────────────────────────────
router.post('/tool-studio/generate-schema', authenticate, TeacherController.generateToolSchema);
router.post('/tool-studio/run', authenticate, TeacherController.runCustomTool);
router.post('/tool-studio/save', authenticate, TeacherController.saveCustomTool);
router.get('/tool-studio/list', authenticate, TeacherController.listCustomTools);
router.delete('/tool-studio/:toolId', authenticate, TeacherController.deleteCustomTool);

export default router;

