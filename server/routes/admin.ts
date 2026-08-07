import express from 'express';
import bcrypt from 'bcryptjs';
import { DynamoService } from '../services/DynamoService.ts';

const router = express.Router();

const SEED_SECRET = process.env.SEED_SECRET || 'deephub-seed-2026';

/**
 * POST /api/admin/seed
 * Clears all users and creates the 2 admin accounts with lifetime Pro.
 * Protected by a secret key in the request body.
 */
router.post('/seed', async (req, res) => {
    try {
        const { secret } = req.body;
        if (secret !== SEED_SECRET) {
            return res.status(403).json({ error: 'FORBIDDEN', message: 'Invalid seed secret' });
        }

        console.log('🧹 [SEED] Starting database cleanup...');

        // Step 1: Delete all existing users
        const allUsers = await DynamoService.scanAllUsers();
        // Get unique email/username pairs
        const seen = new Set<string>();
        for (const user of allUsers) {
            const key = user.email;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            await DynamoService.deleteUser(user.email, user.username);
        }

        console.log(`🗑️ [SEED] Deleted ${seen.size} users`);

        // Step 2: Create admin users with lifetime Pro
        const adminUsers = [
            {
                email: 'naifxevieee@gmail.com',
                password: 'Aezakmi10053@',
                firstName: 'Mohammed',
                lastName: 'Naif',
                username: 'mohammednaif',
                occupation: 'Admin',
                role: 'admin',
            },
            {
                email: 'nhlshhz@gmail.com',
                password: 'nhlshhz10053@',
                firstName: 'Nihal',
                lastName: 'Shahz',
                username: 'nihalshahz',
                occupation: 'Admin',
                role: 'admin',
            },
        ];

        const createdUsers = [];

        for (const admin of adminUsers) {
            const hashedPassword = await bcrypt.hash(admin.password, 12);
            const userData = {
                ...admin,
                password: hashedPassword,
                userId: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name: `${admin.firstName} ${admin.lastName}`,
                provider: 'local',
                isPro: true,
                proExpiresAt: '2099-12-31T23:59:59.999Z', // Lifetime Pro
                dob: '',
                avatar: '',
                createdAt: new Date().toISOString(),
            };

            await DynamoService.upsertUser(userData);
            createdUsers.push({ email: admin.email, username: admin.username, isPro: true });
            console.log(`✅ [SEED] Created admin: ${admin.email}`);
        }

        res.json({
            success: true,
            message: 'Database seeded successfully',
            deletedCount: seen.size,
            createdUsers,
        });

    } catch (err: any) {
        console.error('❌ [SEED] Error:', err.message);
        res.status(500).json({ error: 'SEED_ERROR', message: err.message });
    }
});

export default router;
