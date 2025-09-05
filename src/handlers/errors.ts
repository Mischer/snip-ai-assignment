import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status: number = typeof err?.status === 'number' ? err.status : 500;
    const message: string = typeof err?.message === 'string' ? err.message : 'Internal Server Error';

    logger.error(`Unhandled error`, {
        status,
        message,
        stack: err?.stack,
    });

    res.status(status).json({
        error: {
            message,
            status,
        },
    });
}
