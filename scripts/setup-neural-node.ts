import { DynamoService } from "../server/services/DynamoService.ts";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

/**
 * Setup Neural Node Script
 * This script initializes the DynamoDB 'Need' items:
 * 1. Default Admin User (Nihal)
 * 2. Initial System Log
 */
async function initialize() {
    console.log("🚀 STARTING NEURAL NODE INITIALIZATION...");

    try {
        // 1. Create Admin User
        const hashedPassword = await bcrypt.hash("123", 10);
        const adminUser = {
            email: "admin@deephub.ai",
            username: "NIHAL",
            password: hashedPassword,
            role: "admin",
            name: "Neural Overseer",
            userId: "user_primary_node_01",
            createdAt: new Date().toISOString()
        };

        console.log("👤 Creating Admin Identity (NIHAL)...");
        await DynamoService.upsertUser(adminUser);
        console.log("✅ Admin Identity Established.");

        // 2. Initial Log
        console.log("📝 Initializing Activity Stream...");
        await DynamoService.logActivity("SYSTEM", "NEURAL_CORE_INITIALIZED", {
            node: "PRIMARY_NODE_AWS",
            status: "ONLINE",
            version: "4.0.2_PROD"
        });
        console.log("✅ Activity Stream Ready.");

        console.log("\n✨ NEURAL ARCHITECTURE ONLINE ✨");
        console.log("You can now log in with NIHAL / 123");
        
    } catch (err) {
        console.error("❌ INITIALIZATION FAILED:", err);
        process.exit(1);
    }
}

initialize();
