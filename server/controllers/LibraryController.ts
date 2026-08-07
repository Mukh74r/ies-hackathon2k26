import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { LibraryService } from '../services/LibraryService.ts';

export class LibraryController {
    static async save(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const item = await LibraryService.saveItem(userId, req.body);
            res.json({ success: true, item });
        } catch (err) {
            next(err);
        }
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const library = await LibraryService.getItems(userId);
            res.json({ success: true, library });
        } catch (err) {
            next(err);
        }
    }

    static async remove(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            if (!userId) throw new Error('Unauthorized');

            await LibraryService.deleteItem(userId, id);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}
