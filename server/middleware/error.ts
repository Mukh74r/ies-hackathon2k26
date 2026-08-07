import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[SERVER_ERROR] ${req.method} ${req.url}:`, err);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: Array.isArray(err.errors) ? err.errors.map((e: any) => ({
                path: e.path.join('.'),
                message: e.message
            })) : []
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            error: 'DUPLICATE_ENTRY',
            message: 'A record with this information already exists'
        });
    }

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: err.name === 'Error' ? 'AUTHENTICATION_FAILURE' : (err.name || 'INTERNAL_ERROR'),
        message
    });
};
