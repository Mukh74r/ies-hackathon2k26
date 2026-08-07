import Razorpay from 'razorpay';
import crypto from 'crypto';
import { DynamoService } from './DynamoService.ts';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true';

// Lazy-init: only create the Razorpay instance when actually needed
let _razorpay: InstanceType<typeof Razorpay> | null = null;
function getRazorpay() {
    if (!_razorpay) {
        if (!RAZORPAY_KEY_ID) throw new Error('RAZORPAY_KEY_ID env var is not set. Add it to your deployment environment.');
        _razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    }
    return _razorpay;
}

const PRO_AMOUNT_PAISE = 6600; // ₹66 in paise
const PRO_DURATION_MONTHS = 3;

export class PaymentService {
    /**
     * Create a Razorpay order for Pro upgrade
     */
    static async createOrder(userId: string) {
        console.log(`💳 [Payment] Creating order for user: ${userId}`);

        const user = await DynamoService.getUserById(userId);
        if (!user) throw new Error('User not found');

        // Check if already Pro and not expired
        if (user.isPro && user.proExpiresAt && new Date(user.proExpiresAt) > new Date()) {
            throw new Error('You already have an active Pro subscription');
        }

        const order = await getRazorpay().orders.create({
            amount: PRO_AMOUNT_PAISE,
            currency: 'INR',
            receipt: `pro_${userId}_${Date.now()}`,
            notes: {
                userId,
                plan: 'pro_3_months',
            },
        });

        console.log(`✅ [Payment] Order created: ${order.id}`);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: RAZORPAY_KEY_ID,
        };
    }

    /**
     * Verify Razorpay payment signature and activate Pro
     */
    static async verifyPayment(userId: string, paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) {
        console.log(`🔐 [Payment] Verifying payment for user: ${userId}`);

        // Step 1: Verify signature
        const body = paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== paymentData.razorpay_signature) {
            console.error('❌ [Payment] Signature mismatch!');
            throw new Error('Payment verification failed — invalid signature');
        }

        console.log(`✅ [Payment] Signature verified`);

        // Step 2: Activate Pro
        const proExpiresAt = new Date();
        proExpiresAt.setMonth(proExpiresAt.getMonth() + PRO_DURATION_MONTHS);

        const user = await DynamoService.getUserById(userId);
        if (!user) throw new Error('User not found');

        // Update user with Pro status
        await DynamoService.upsertUser({
            ...user,
            isPro: true,
            proExpiresAt: proExpiresAt.toISOString(),
            razorpayPaymentId: paymentData.razorpay_payment_id,
        });

        console.log(`🚀 [Payment] Pro activated for user ${userId} until ${proExpiresAt.toISOString()}`);

        return {
            success: true,
            isPro: true,
            proExpiresAt: proExpiresAt.toISOString(),
            paymentId: paymentData.razorpay_payment_id,
        };
    }

    /**
     * Check Pro status for a user (with expiry check)
     */
    static async checkProStatus(userId: string) {
        const user = await DynamoService.getUserById(userId);
        if (!user) throw new Error('User not found');

        const now = new Date();
        const isActive = user.isPro === true && user.proExpiresAt && new Date(user.proExpiresAt) > now;

        // Auto-expire if past date
        if (user.isPro && !isActive) {
            await DynamoService.upsertUser({ ...user, isPro: false });
            return { isPro: false, proExpiresAt: null };
        }

        return {
            isPro: !!isActive,
            proExpiresAt: user.proExpiresAt ? new Date(user.proExpiresAt).toISOString() : null,
        };
    }
}
