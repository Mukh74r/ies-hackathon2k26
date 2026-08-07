import { LibraryItem, LibraryItemType } from '../models/LibraryItem.ts';
import { DynamoService } from './DynamoService.ts';

const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

export class LibraryService {

    static async saveItem(userId: string, itemData: Omit<LibraryItemType, 'user'>) {
        if (USE_DYNAMODB) {
            const itemId = 'item_' + Date.now();
            await DynamoService.saveLesson(userId, itemId, { ...itemData, type: itemData.type || 'library_item' });
            return { _id: itemId, ...itemData };
        }

        const item = new LibraryItem({ ...itemData, user: userId });
        return await item.save();
    }

    static async getItems(userId: string) {
        if (USE_DYNAMODB) {
            return await DynamoService.getLessonsByUser(userId);
        }
        return await LibraryItem.find({ user: userId }).sort({ createdAt: -1 });
    }

    /**
     * Delete a library item.
     * In DynamoDB mode: the itemId IS the lessonId (sort key) stored at save time.
     */
    static async deleteItem(userId: string, itemId: string) {
        if (USE_DYNAMODB) {
            await DynamoService.deleteLesson(userId, itemId);
            return true;
        }

        const result = await LibraryItem.deleteOne({ _id: itemId, user: userId });
        if (result.deletedCount === 0) {
            throw new Error('Item not found or unauthorized');
        }
        return true;
    }
}
