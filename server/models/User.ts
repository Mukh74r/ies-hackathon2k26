const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';
import mongoose from 'mongoose';
import { z } from 'zod';

// Zod Schema for Validation
export const UserZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().optional(), // Date of Birth
  occupation: z.string().optional(),
  username: z.string().min(3).max(30).optional(), // Auto-generated if missing
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional(),
  googleId: z.string().optional(),
  avatar: z.string().optional(),
  provider: z.enum(['local', 'google']).default('local'),
  name: z.string().optional(), // Legacy field
  role: z.enum(['teacher', 'student', 'admin']).default('student'),
  age: z.number().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
  profilePicture: z.string().optional(),
  specialization: z.string().optional(),
  primaryNode: z.string().optional(),
  priority: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isPro: z.boolean().default(false),
  proExpiresAt: z.date().optional(),
  razorpayPaymentId: z.string().optional(),
});

export type UserType = z.infer<typeof UserZodSchema>;

let User: mongoose.Model<any>;
if (!USE_DYNAMODB) {
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    firstName: { type: String },
    lastName: { type: String },
    dob: { type: String },
    occupation: { type: String },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true, index: true },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    name: { type: String },
    role: { type: String, enum: ['teacher', 'student', 'admin'], default: 'student' },
    age: { type: Number },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    profilePicture: { type: String },
    specialization: { type: String },
    primaryNode: { type: String },
    priority: { type: String },
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date },
    razorpayPaymentId: { type: String },
  }, { timestamps: true });
  User = mongoose.model('User', userSchema);
} else {
  User = {} as any;
}
export { User };
