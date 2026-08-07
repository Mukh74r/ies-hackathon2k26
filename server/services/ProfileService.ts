import { User } from '../models/User.ts';
import { LibraryItem } from '../models/LibraryItem.ts';
import { DynamoService } from './DynamoService.ts';

const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

export class ProfileService {

    /**
     * Update profile fields for the given userId.
     * In DynamoDB mode, we first look up the full user record by userId (via GSI),
     * then merge the allowed updates and upsert.
     */
    static async updateProfile(userId: string, updateData: any) {
        const allowedUpdates = [
            'name', 'username', 'age', 'preferences',
            'profilePicture', 'specialization', 'primaryNode',
            'firstName', 'lastName', 'dob', 'occupation'
        ];
        const filteredData: any = {};
        for (const key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        if (USE_DYNAMODB) {
            const existing = await DynamoService.getUserById(userId);
            if (!existing) throw new Error('User not found');

            const updatedPayload = {
                ...existing,
                ...filteredData,
                userId,
            };

            // Sync both email-keyed and username-keyed records for consistency
            const updated = await DynamoService.upsertUser(updatedPayload);
            return this.sanitizeUser(updated);
        }

        // Mongoose fallback
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: filteredData },
            { new: true },
        );
        if (!user) throw new Error('User not found');
        return this.sanitizeUser(user);
    }

    /**
     * Get the full profile + usage stats for the given userId.
     */
    static async getProfile(userId: string) {
        if (USE_DYNAMODB) {
            // Fetch user record by userId via the UserIdIndex GSI
            const user = await DynamoService.getUserById(userId);
            if (!user) throw new Error('User not found');

            // Fetch lesson stats
            const items = await DynamoService.getLessonsByUser(userId);
            const lessonsCount = items.length;
            const toolsUsed = new Set(items.map((i: any) => i.type)).size;

            return {
                ...this.sanitizeUser(user),
                stats: {
                    toolsUsed,
                    lessonsGenerated: lessonsCount,
                    timeSaved: Math.round(lessonsCount * 10) / 10, // More precise decimal saved
                },
            };
        }

        // Mongoose fallback
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const lessonsCount = await LibraryItem.countDocuments({ user: userId });
        const toolsUsedData = await LibraryItem.distinct('type', { user: userId });

        return {
            ...this.sanitizeUser(user),
            stats: {
                toolsUsed: toolsUsedData.length,
                lessonsGenerated: lessonsCount,
                timeSaved: Math.round(lessonsCount * 0.5),
            },
        };
    }

    private static sanitizeUser(user: any) {
        const userObj = USE_DYNAMODB ? { ...user } : user.toObject();
        delete userObj.password;
        delete userObj.PK;
        delete userObj.SK;
        return userObj;
    }
}
