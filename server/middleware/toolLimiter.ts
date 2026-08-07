import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { UsageService } from '../services/UsageService.ts';

/**
 * Middleware factory that enforces free-tier usage limits for a specific tool.
 * Pro users and admins bypass this entirely.
 *
 * Usage: router.post('/generate', authenticate, toolLimiter('question-generator'), handler)
 */
export function toolLimiter(toolName: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED', message: 'Login required' });
            }

            const access = await UsageService.checkAccess(userId, toolName);

            // Attach usage info to the request for downstream handlers
            (req as any).toolAccess = access;

            if (!access.allowed) {
                const limitMsg = access.limit === 0
                    ? `${toolName} is a Pro-only feature. Upgrade to unlock it.`
                    : `You've used all ${access.limit} free uses of ${toolName} this month. Upgrade to Pro for unlimited access.`;

                return res.status(403).json({
                    error: 'USAGE_LIMIT_REACHED',
                    message: limitMsg,
                    tool: toolName,
                    used: access.used,
                    limit: access.limit,
                    isPro: access.isPro,
                    remaining: access.remaining,
                });
            }

            // Increment usage AFTER the check passes
            await UsageService.incrementUsage(userId, toolName);

            next();
        } catch (err: any) {
            console.error(`[ToolLimiter] Error checking ${toolName}:`, err.message);
            // On error, allow the request through (fail-open)
            next();
        }
    };
}
