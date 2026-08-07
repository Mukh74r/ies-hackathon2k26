import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.ts';
import { UserZodSchema } from '../models/User.ts';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Manual Zod Validation if not using middleware
            const validatedData = UserZodSchema.parse(req.body);
            const result = await AuthService.register(validatedData);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, identifier, password } = req.body;
            const loginIdentifier = identifier || email;
            
            if (!loginIdentifier || !password) {
                throw new Error('Identifier (email or username) and password required');
            }
            const result = await AuthService.login({ identifier: loginIdentifier, password });
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
    
    static async google(req: Request, res: Response, next: NextFunction) {
        try {
            const { googleUser } = req.body;
            if (!googleUser) throw new Error('Google user payload missing');
            const result = await AuthService.googleLogin(googleUser);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
            await AuthService.forgotPassword(email.toLowerCase().trim());
            // Always 200 — prevents email enumeration
            res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        } catch (err: any) {
            console.error('[Auth] Forgot password error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            if (!token || !password) return res.status(400).json({ success: false, error: 'Token and password are required.' });
            await AuthService.resetPassword(token, password);
            res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
        } catch (err: any) {
            console.error('[Auth] Reset password error:', err);
            res.status(400).json({ success: false, error: err.message });
        }
    }
}
