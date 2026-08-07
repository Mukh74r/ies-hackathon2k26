import mongoose from 'mongoose';
import { User } from '../server/models/User.ts';
import { DynamoService } from '../server/services/DynamoService.ts';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
    try {
        console.log("🚦 Starting Neural Migration (MongoDB -> DynamoDB)...");
        
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deephub_ai");
        console.log("🍃 MongoDB Linked.");

        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to migrate.`);

        for (const user of users) {
            const userObj = user.toObject() as any;
            delete userObj._id;
            delete userObj.__v;
            
            // Generate a Dynamo-style userId if not present
            userObj.userId = userObj.userId || 'user_' + Date.now() + Math.random().toString(36).substr(2, 5);
            
            await DynamoService.upsertUser(userObj);
            console.log(`✅ Migrated: ${userObj.email}`);
        }

        console.log("🎉 Neural Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
};

migrate();
