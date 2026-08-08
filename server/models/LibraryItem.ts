const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';
import mongoose from 'mongoose';
import { z } from 'zod';

export const LibraryItemZodSchema = z.object({
  user: z.string(), // UserId
  type: z.string(),
  title: z.string(),
  content: z.any(),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
});

export type LibraryItemType = z.infer<typeof LibraryItemZodSchema>;

let LibraryItem: mongoose.Model<any>;
if (!USE_DYNAMODB) {
  const libraryItemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
    tags: [{ type: String }],
  }, { timestamps: true });
  LibraryItem = mongoose.model('LibraryItem', libraryItemSchema);
} else {
  LibraryItem = {} as any;
}
export { LibraryItem };
