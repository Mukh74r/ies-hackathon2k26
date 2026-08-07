import {
    PutCommand,
    GetCommand,
    QueryCommand,
    DeleteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
    docClient,
    USERS_TABLE,
    LESSONS_TABLE,
    ACTIVITY_LOGS_TABLE,
    CATALOG_TABLE,
    SETTINGS_TABLE,
} from "../utils/dynamodb.ts";

export class DynamoService {
    // ============================================================
    //  USER OPERATIONS
    // ============================================================

    /**
     * Upsert a user record.
     * Saves two items: one keyed by email (primary), one by username (lookup alias).
     * Both items carry the full user payload so either can be retrieved directly.
     */
    static async upsertUser(userData: any) {
        const emailPK    = `USER#${userData.email.toLowerCase()}`;
        const usernamePK = `USER#${userData.username.toLowerCase()}`;

        const timestamp = new Date().toISOString();
        const baseItem = {
            ...userData,
            email:     userData.email.toLowerCase(),
            username:  userData.username.toLowerCase(),
            updatedAt: timestamp,
            createdAt: userData.createdAt || timestamp,
        };

        // Primary record — keyed by email
        await docClient.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: { PK: emailPK, SK: "METADATA", ...baseItem },
        }));

        // Alias record — keyed by username
        await docClient.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: { PK: usernamePK, SK: "METADATA", ...baseItem },
        }));

        console.log(`[Neural Sync] User updated: ${userData.email}`);
        return baseItem;
    }

    /**
     * Retrieve a user by their email address.
     */
    static async getUserByEmail(email: string) {
        const command = new GetCommand({
            TableName: USERS_TABLE,
            Key: {
                PK: `USER#${email.toLowerCase()}`,
                SK: "METADATA",
            },
        });
        const response = await docClient.send(command);
        return response.Item || null;
    }

    /**
     * Retrieve a user by their username.
     */
    static async getUserByUsername(username: string) {
        const command = new GetCommand({
            TableName: USERS_TABLE,
            Key: {
                PK: `USER#${username.toLowerCase()}`,
                SK: "METADATA",
            },
        });
        const response = await docClient.send(command);
        return response.Item || null;
    }

    /**
     * Retrieve a user by their unique userId.
     * Requires a GSI named "UserIdIndex" with partition key = "userId" on DeepHub_Users.
     * Set up the GSI in: AWS Console → DynamoDB → DeepHub_Users → Indexes → Create Index.
     */
    static async getUserById(userId: string) {
        const command = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "UserIdIndex",
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": userId,
            },
            Limit: 1,
        });
        const response = await docClient.send(command);
        return response.Items?.[0] || null;
    }

    /**
     * Scan all user records (both email-keyed and username-keyed).
     */
    static async scanAllUsers() {
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
        const items: any[] = [];
        let lastKey: any = undefined;

        do {
            const response: any = await docClient.send(new ScanCommand({
                TableName: USERS_TABLE,
                FilterExpression: "begins_with(PK, :prefix)",
                ExpressionAttributeValues: { ":prefix": "USER#" },
                ExclusiveStartKey: lastKey,
            }));
            items.push(...(response.Items || []));
            lastKey = response.LastEvaluatedKey;
        } while (lastKey);

        return items;
    }

    /**
     * Delete a user by removing both their email-keyed and username-keyed records.
     */
    static async deleteUser(email: string, username: string) {
        const emailPK = `USER#${email.toLowerCase()}`;
        const usernamePK = `USER#${username.toLowerCase()}`;

        await docClient.send(new DeleteCommand({
            TableName: USERS_TABLE,
            Key: { PK: emailPK, SK: "METADATA" },
        }));

        await docClient.send(new DeleteCommand({
            TableName: USERS_TABLE,
            Key: { PK: usernamePK, SK: "METADATA" },
        }));

        console.log(`[Neural Purge] Deleted user: ${email} / ${username}`);
    }

    // ============================================================
    //  NEURAL LESSON OPERATIONS  (Library Items & Question Papers)
    // ============================================================

    static async saveLesson(userId: string, lessonId: string, lessonData: any) {
        const command = new PutCommand({
            TableName: LESSONS_TABLE,
            Item: {
                userId,
                lessonId,
                ...lessonData,
                createdAt: lessonData.createdAt || new Date().toISOString(),
            },
        });
        return await docClient.send(command);
    }

    static async getLessonsByUser(userId: string) {
        const command = new QueryCommand({
            TableName: LESSONS_TABLE,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": userId,
            },
        });
        const response = await docClient.send(command);
        return response.Items || [];
    }

    /**
     * Delete a specific lesson / library item for a user.
     * Requires the composite primary key: userId (PK) + lessonId (SK).
     */
    static async deleteLesson(userId: string, lessonId: string) {
        const command = new DeleteCommand({
            TableName: LESSONS_TABLE,
            Key: {
                userId,
                lessonId,
            },
        });
        return await docClient.send(command);
    }

    // ============================================================
    //  ACTIVITY LOG OPERATIONS
    // ============================================================

    static async logActivity(logType: string, content: string, extraData: any = {}) {
        const timestamp = new Date().toISOString();
        const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30-day TTL

        const command = new PutCommand({
            TableName: ACTIVITY_LOGS_TABLE,
            Item: {
                logType,
                timestamp,
                content,
                ...extraData,
                ttl,
            },
        });
        return await docClient.send(command);
    }

    // ============================================================
    //  CATALOG OPERATIONS
    // ============================================================

    static async getCatalogItems(category: string) {
        const command = new QueryCommand({
            TableName: CATALOG_TABLE,
            KeyConditionExpression: "category = :cat",
            ExpressionAttributeValues: {
                ":cat": category,
            },
        });
        const response = await docClient.send(command);
        return response.Items || [];
    }

    // ============================================================
    //  SETTINGS OPERATIONS
    // ============================================================

    static async getSetting(group: string, key: string) {
        const command = new GetCommand({
            TableName: SETTINGS_TABLE,
            Key: {
                settingGroup: group,
                settingKey: key,
            },
        });
        const response = await docClient.send(command);
        return response.Item || null;
    }

    // ============================================================
    //  CUSTOM TOOL OPERATIONS  (Tool Studio)
    // ============================================================

    static async saveCustomTool(userId: string, tool: any) {
        const command = new PutCommand({
            TableName: LESSONS_TABLE,
            Item: {
                userId,
                lessonId: `TOOL#${tool.toolId}`,
                ...tool,
                createdAt: tool.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });
        return await docClient.send(command);
    }

    static async getCustomToolsByUser(userId: string) {
        const command = new QueryCommand({
            TableName: LESSONS_TABLE,
            KeyConditionExpression: 'userId = :uid AND begins_with(lessonId, :prefix)',
            ExpressionAttributeValues: {
                ':uid': userId,
                ':prefix': 'TOOL#',
            },
        });
        const response = await docClient.send(command);
        return (response.Items || []).map((item: any) => ({
            ...item,
            lessonId: undefined,
        }));
    }

    static async deleteCustomTool(userId: string, toolId: string) {
        const command = new DeleteCommand({
            TableName: LESSONS_TABLE,
            Key: {
                userId,
                lessonId: `TOOL#${toolId}`,
            },
        });
        return await docClient.send(command);
    }
}
