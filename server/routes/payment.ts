import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { PaymentService } from '../services/PaymentService.ts';
import { UsageService, TOOL_LIMITS } from '../services/UsageService.ts';

const router = express.Router();

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for Pro upgrade
 */
router.post('/create-order', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const order = await PaymentService.createOrder(userId);
        res.json(order);
    } catch (err: any) {
        console.error('❌ [Payment] Create order error:', err.message);
        res.status(400).json({ error: 'PAYMENT_ERROR', message: err.message });
    }
});

/**
 * POST /api/payment/verify
 * Verifies payment signature and activates Pro
 */
router.post('/verify', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Missing payment verification data' });
        }

        const result = await PaymentService.verifyPayment(userId, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        res.json(result);
    } catch (err: any) {
        console.error('❌ [Payment] Verify error:', err.message);
        res.status(400).json({ error: 'VERIFICATION_FAILED', message: err.message });
    }
});

/**
 * GET /api/payment/status
 * Check user's Pro subscription status
 */
router.get('/status', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const status = await PaymentService.checkProStatus(userId);
        res.json(status);
    } catch (err: any) {
        console.error('❌ [Payment] Status check error:', err.message);
        res.status(400).json({ error: 'STATUS_ERROR', message: err.message });
    }
});

/**
 * GET /api/payment/usage
 * Get all tool usage counts + limits for the current month
 */
router.get('/usage', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;
        const usage = await UsageService.getAllUsage(userId);
        const proStatus = await PaymentService.checkProStatus(userId);

        // Build response with all tools
        const tools: Record<string, { used: number; limit: number; remaining: number }> = {};
        for (const [tool, limit] of Object.entries(TOOL_LIMITS)) {
            const used = usage[tool] || 0;
            tools[tool] = {
                used,
                limit: proStatus.isPro ? -1 : limit,
                remaining: proStatus.isPro ? -1 : Math.max(0, limit - used),
            };
        }

        res.json({
            isPro: proStatus.isPro,
            proExpiresAt: proStatus.proExpiresAt,
            tools,
        });
    } catch (err: any) {
        console.error('❌ [Payment] Usage check error:', err.message);
        res.status(400).json({ error: 'USAGE_ERROR', message: err.message });
    }
});

export default router;
