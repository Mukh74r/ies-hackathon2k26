import { User, UserType } from '../models/User.ts';
import { DynamoService } from './DynamoService.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'deephub-core-secret-key-2026';
const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

export class AuthService {
    static async register(userData: any) {
        // Auto-generate username from name if missing
        if (!userData.username) {
            const base = (userData.firstName + (userData.lastName || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
            userData.username = base + Math.floor(Math.random() * 10000);
        }

        // Keep 'name' field updated for legacy UI parts
        userData.name = `${userData.firstName} ${userData.lastName}`;

        if (USE_DYNAMODB) {
            const existingEmail = await DynamoService.getUserByEmail(userData.email);
            if (existingEmail) throw new Error('Email already registered in Neural Cluster');

            const existingUsername = await DynamoService.getUserByUsername(userData.username);
            if (existingUsername) throw new Error('Username collision. Try again.');

            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = await DynamoService.upsertUser({
                ...userData,
                password: hashedPassword,
                userId: 'user_' + Date.now()
            });

            const token = this.generateToken(user.userId, user.role);
            return { user: this.sanitizeUser(user), token };
        }

        // Mongoose Fallback
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) throw new Error('Email already registered');

        const existingUsername = await User.findOne({ username: userData.username });
        if (existingUsername) throw new Error('Username already taken');

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({ ...userData, password: hashedPassword });
        await user.save();
        
        const token = this.generateToken(user._id.toString(), user.role);
        return { user: this.sanitizeUser(user), token };
    }

    static async login(credentials: { identifier: string; password: string }) {
        let user;
        if (USE_DYNAMODB) {
            // Check email first
            user = await DynamoService.getUserByEmail(credentials.identifier);
            // If not found, check username
            if (!user) {
                user = await DynamoService.getUserByUsername(credentials.identifier);
            }
        } else {
            user = await User.findOne({ 
                $or: [{ email: credentials.identifier }, { username: credentials.identifier }] 
            });
        }
        
        if (!user) {
            throw new Error('Identity not found');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid access protocol');
        }

        const userId = USE_DYNAMODB ? user.userId : user._id.toString();
        const token = this.generateToken(userId, user.role);
        return { user: this.sanitizeUser(user), token };
    }
    
    static async googleLogin(googleUser: { sub: string; email: string; name?: string; picture?: string }) {
        const { sub: googleId, email, name, picture } = googleUser;
        let user;
        let isNewUser = false;

        console.log(`🔑 [AuthService] Google Login Requested for: ${email}`);

        if (USE_DYNAMODB) {
            console.log("📡 [AuthService] Mode: DYNAMODB. Looking up user...");
            user = await DynamoService.getUserByEmail(email);
            if (!user) {
                isNewUser = true;
                console.log("🆕 [AuthService] User not found. Creating new DynamoDB record...");
                // Split Google name into first/last for the profile
                const nameParts = (name || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                user = await DynamoService.upsertUser({
                    userId: 'user_' + Date.now(),
                    email,
                    googleId,
                    username: (name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0]) + Math.floor(Math.random() * 1000),
                    name,
                    firstName,
                    lastName,
                    avatar: picture,
                    provider: 'google',
                    role: 'student'
                });
                console.log("✅ [AuthService] New DynamoDB User Created.");
            } else if (!user.googleId) {
                console.log("🔗 [AuthService] Existing user found. Linking Google ID...");
                user.googleId = googleId;
                user.avatar = user.avatar || picture;
                user.provider = 'google';
                user = await DynamoService.upsertUser(user);
                console.log("✅ [AuthService] DynamoDB Record Linked.");
            } else {
                console.log("🔓 [AuthService] Existing Google user found.");
            }
        } else {
            console.log("📡 [AuthService] Mode: MONGO. Looking up user...");
            user = await User.findOne({ $or: [{ googleId }, { email }] });
            if (!user) {
                isNewUser = true;
                console.log("🆕 [AuthService] User not found. Creating new Mongo record...");
                const nameParts = (name || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                user = new User({
                    email,
                    googleId,
                    username: (name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0]) + Math.floor(Math.random() * 1000),
                    name,
                    firstName,
                    lastName,
                    avatar: picture,
                    provider: 'google'
                });
                await user.save();
                console.log("✅ [AuthService] New Mongo User Created.");
            } else if (!user.googleId) {
                console.log("🔗 [AuthService] Existing user found. Linking Google ID...");
                user.googleId = googleId;
                user.avatar = user.avatar || picture;
                user.provider = 'google';
                await user.save();
                console.log("✅ [AuthService] Mongo Record Linked.");
            } else {
                console.log("🔓 [AuthService] Existing Google user found.");
            }
        }

        const userId = user ? (USE_DYNAMODB ? user.userId : user._id.toString()) : '';
        console.log(`🎫 [AuthService] Generating Token for User: ${userId} (isNewUser: ${isNewUser})`);
        const token = this.generateToken(userId, user?.role || 'student');
        return { user: this.sanitizeUser(user), token, isNewUser };
    }

    private static generateToken(userId: string, role: string) {
        return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
    }

    private static sanitizeUser(user: any) {
        const userObj = USE_DYNAMODB ? { ...user } : user.toObject();
        delete userObj.password;
        delete userObj.PK;
        delete userObj.SK;
        return userObj;
    }

    // ──────────────────────────────────────────────────────────────
    //  PASSWORD RESET
    // ──────────────────────────────────────────────────────────────

    static async forgotPassword(email: string) {
        const { EmailService } = await import('./EmailService.ts');
        const { randomBytes } = await import('crypto');

        const user = USE_DYNAMODB
            ? await DynamoService.getUserByEmail(email)
            : await (await import('../models/User.ts')).User.findOne({ email });

        // Always respond 200 — don't leak whether email exists
        if (!user) return;

        const token = randomBytes(32).toString('hex');
        const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

        if (USE_DYNAMODB) {
            await DynamoService.upsertUser({
                ...user,
                resetToken: token,
                resetTokenExpiry: expiry,
            });
        } else {
            user.resetToken = token;
            user.resetTokenExpiry = expiry;
            await user.save();
        }

        const name = user.firstName || user.name || 'Teacher';
        await EmailService.sendPasswordResetEmail(email, token, name);
    }

    static async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword || newPassword.length < 6) {
            throw new Error('Invalid request. Password must be at least 6 characters.');
        }

        let user: any = null;

        if (USE_DYNAMODB) {
            // Scan users for matching token (tokens are rare — short scan)
            const { QueryCommand, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
            const { docClient, USERS_TABLE } = await import('../utils/dynamodb.ts');
            const response: any = await docClient.send(new (await import('@aws-sdk/lib-dynamodb')).ScanCommand({
                TableName: USERS_TABLE,
                FilterExpression: 'resetToken = :t AND SK = :sk',
                ExpressionAttributeValues: { ':t': token, ':sk': 'METADATA' },
            }));
            user = response.Items?.[0] || null;
        } else {
            const { User } = await import('../models/User.ts');
            user = await User.findOne({ resetToken: token });
        }

        if (!user) throw new Error('Invalid or expired reset link.');
        if (Date.now() > (user.resetTokenExpiry || 0)) throw new Error('Reset link has expired. Please request a new one.');

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        if (USE_DYNAMODB) {
            await DynamoService.upsertUser({
                ...user,
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            });
        } else {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
        }
    }
}
