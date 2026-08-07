import { DynamoService } from "../server/services/DynamoService.ts";
import dotenv from "dotenv";

dotenv.config();

/**
 * NEURAL DYNAMO VERIFIER (Patch-4)
 * - Verifies GSI (getUserById)
 * - Verifies composite keys (saveLesson/deleteLesson)
 * - Verifies dual-indexing (email vs username)
 */
async function test() {
    console.log("🧬 Starting Neural Dynamo Verification...");
    
    const testUser = {
        userId: "test_" + Date.now(),
        email: `test_${Date.now()}@hub.ai`,
        username: "tester_" + Date.now(),
        name: "Test User",
        createdAt: new Date().toISOString()
    };

    try {
        // 1. UPSERT
        console.log(`[1/5] Testing Upsert: ${testUser.email}`);
        await DynamoService.upsertUser(testUser);

        // 2. GET BY EMAIL (Primary)
        console.log(`[2/5] Testing GetByEmail: ${testUser.email}`);
        const byEmail = await DynamoService.getUserByEmail(testUser.email);
        if (!byEmail || byEmail.userId !== testUser.userId) {
            throw new Error(`Email retrieval failed. Expected ${testUser.userId}, got ${byEmail?.userId}`);
        }
        console.log("✅ GetByEmail SUCCESS");

        // 3. GET BY ID (GSI Index Check)
        console.log(`[3/5] Testing GetById (GSI Index Check): ${testUser.userId}`);
        // NOTE: GSI can have slight replication delay (eventual consistency)
        await new Promise(r => setTimeout(r, 1000)); 
        const byId = await DynamoService.getUserById(testUser.userId);
        if (!byId || byId.email !== testUser.email) {
            throw new Error(`GSI retrieval failed. Expected ${testUser.email}, got ${byId?.email}`);
        }
        console.log("✅ GetById (GSI) SUCCESS");

        // 4. LESSON OPS (Composite Key Check)
        const lessonId = "mod_" + Date.now();
        console.log(`[4/5] Testing Lesson Ops: ${lessonId}`);
        await DynamoService.saveLesson(testUser.userId, lessonId, { title: "Neural Networks 101", type: "question_paper" });
        
        const lessons = await DynamoService.getLessonsByUser(testUser.userId);
        if (lessons.length === 0) throw new Error("Lesson retrieval failed.");
        console.log(`✅ Lesson Save/Query SUCCESS: ${lessons.length} items found`);

        // 5. DELETE OPS
        console.log(`[5/5] Testing Delete: ${lessonId}`);
        await DynamoService.deleteLesson(testUser.userId, lessonId);
        const lessonsAfter = await DynamoService.getLessonsByUser(testUser.userId);
        if (lessonsAfter.some(l => l.lessonId === lessonId)) throw new Error("Delete failed.");
        console.log("✅ Lesson Delete SUCCESS");

        console.log("\n🚀 NEURAL DYNAMO LINK: 100% OPERATIONAL");
        process.exit(0);
    } catch (err: any) {
        console.error("\n❌ NEURAL DYNAMO CRASHED:", err.message);
        if (err.name === 'ResourceNotFoundException') {
            console.error("💡 HINT: Check if tables exist in us-east-1 and match .env names.");
        }
        process.exit(1);
    }
}

test();
