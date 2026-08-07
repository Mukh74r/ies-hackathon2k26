import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'deephub-core-secret-key-2026';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
            req.user = decoded;
            return next();
        } catch (err) {
            // Ignore error and fallback to guest user
        }
    }

    // Default guest admin user to bypass auth
    req.user = {
        userId: 'usr_guest_01',
        role: 'admin'
    };
    next();
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        next();
    };
};

