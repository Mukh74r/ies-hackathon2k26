const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';
import mongoose from 'mongoose';
import { z } from 'zod';

export const QuestionPaperZodSchema = z.object({
  user: z.string(),
  title: z.string(),
  schoolName: z.string().optional(),
  examTime: z.number().optional(),
  difficulty: z.string().optional(),
  sections: z.array(z.any()),
  isJSON: z.boolean().default(true),
  rawContent: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type QuestionPaperType = z.infer<typeof QuestionPaperZodSchema>;

let QuestionPaper: mongoose.Model<any>;
if (!USE_DYNAMODB) {
  const questionPaperSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    schoolName: { type: String },
    examTime: { type: Number },
    difficulty: { type: String },
    sections: { type: mongoose.Schema.Types.Mixed, required: true },
    isJSON: { type: Boolean, default: true },
    rawContent: { type: String },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  }, { timestamps: true });
  QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
} else {
  QuestionPaper = {} as any;
}
export { QuestionPaper };
