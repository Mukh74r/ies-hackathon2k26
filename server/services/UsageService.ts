import { GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, USERS_TABLE } from "../utils/dynamodb.ts";

const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

/**
 * Monthly usage limits for free tier users.
 * Pro users have unlimited access (no limits enforced).
 */
export const TOOL_LIMITS: Record<string, number> = {
    'question-generator': 3,
    'ppt-generator':      2,
    'homework-creator':   5,
    'lesson-plan':        3,
    'paper-solver':       2,
    'shuffler':           1,
    'secretary':          0,   // Locked for free
    'analytics':          0,   // Locked for free
    'report-assistant':   2,
};

/**
 * Get the current month key, e.g. "2026-03"
 */
function getMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export class UsageService {
    /**
     * Get usage count for a specific tool for the current month.
     */
    static async getUsage(userId: string, tool: string): Promise<number> {
        if (!USE_DYNAMODB) return 0; // Mongo mode — skip for now

        const monthKey = getMonthKey();
        const fieldName = `usage_${tool}_${monthKey}`;

        try {
            // Read from the user's email-keyed record via UserIdIndex
            const user = await this.getUserRecord(userId);
            if (!user) return 0;
            return user[fieldName] || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Increment usage count for a tool. Returns the new count.
     */
    static async incrementUsage(userId: string, tool: string): Promise<number> {
        if (!USE_DYNAMODB) return 0;

        const monthKey = getMonthKey();
        const fieldName = `usage_${tool}_${monthKey}`;

        try {
            const user = await this.getUserRecord(userId);
            if (!user) return 0;

            const emailPK = `USER#${user.email.toLowerCase()}`;
            const usernamePK = `USER#${user.username.toLowerCase()}`;

            // Increment on both records (email + username)
            for (const pk of [emailPK, usernamePK]) {
                await docClient.send(new UpdateCommand({
                    TableName: USERS_TABLE,
                    Key: { PK: pk, SK: "METADATA" },
                    UpdateExpression: `SET #field = if_not_exists(#field, :zero) + :one`,
                    ExpressionAttributeNames: { "#field": fieldName },
                    ExpressionAttributeValues: { ":zero": 0, ":one": 1 },
                }));
            }

            return (user[fieldName] || 0) + 1;
        } catch (err) {
            console.error(`[Usage] Failed to increment for ${userId}/${tool}:`, err);
            return 0;
        }
    }

    /**
     * Get all usage counts for a user for the current month.
     */
    static async getAllUsage(userId: string): Promise<Record<string, number>> {
        if (!USE_DYNAMODB) return {};

        const monthKey = getMonthKey();
        const user = await this.getUserRecord(userId);
        if (!user) return {};

        const usage: Record<string, number> = {};
        const prefix = `usage_`;
        const suffix = `_${monthKey}`;

        for (const key of Object.keys(user)) {
            if (key.startsWith(prefix) && key.endsWith(suffix)) {
                const tool = key.slice(prefix.length, key.length - suffix.length);
                usage[tool] = user[key] || 0;
            }
        }

        return usage;
    }

    /**
     * Check if a user can use a tool. Returns { allowed, used, limit, isPro }.
     */
    static async checkAccess(userId: string, tool: string): Promise<{
        allowed: boolean;
        used: number;
        limit: number;
        isPro: boolean;
        remaining: number;
    }> {
        const user = await this.getUserRecord(userId);
        if (!user) {
            return { allowed: false, used: 0, limit: 0, isPro: false, remaining: 0 };
        }

        // Check Pro status
        const isPro = user.isPro === true && user.proExpiresAt && new Date(user.proExpiresAt) > new Date();

        // Admin role always gets unlimited
        if (user.role === 'admin' || isPro) {
            return { allowed: true, used: 0, limit: -1, isPro: true, remaining: -1 };
        }

        const limit = TOOL_LIMITS[tool];
        if (limit === undefined) {
            // Unknown tool — allow by default
            return { allowed: true, used: 0, limit: -1, isPro: false, remaining: -1 };
        }

        if (limit === 0) {
            // Locked for free tier
            return { allowed: false, used: 0, limit: 0, isPro: false, remaining: 0 };
        }

        const monthKey = getMonthKey();
        const fieldName = `usage_${tool}_${monthKey}`;
        const used = user[fieldName] || 0;
        const remaining = Math.max(0, limit - used);

        return {
            allowed: used < limit,
            used,
            limit,
            isPro: false,
            remaining,
        };
    }

    /**
     * Internal: get user record by userId via GSI.
     */
    private static async getUserRecord(userId: string): Promise<any> {
        const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
        const response = await docClient.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "UserIdIndex",
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId },
            Limit: 1,
        }));
        return response.Items?.[0] || null;
    }
}
