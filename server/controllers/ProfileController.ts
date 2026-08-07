import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { ProfileService } from '../services/ProfileService.ts';

export class ProfileController {
    static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const profile = await ProfileService.getProfile(userId);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    static async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const profile = await ProfileService.updateProfile(userId, req.body);
            res.json({ success: true, profile });
        } catch (err) {
            next(err);
        }
    }
}
