import { logger } from '../../logger.js';

export async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    opts?: { retries?: number; baseDelayMs?: number }
): Promise<T> {
    const retries = opts?.retries ?? 3;
    const baseDelay = opts?.baseDelayMs ?? 500;

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= retries) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt === retries) {
                break;
            }

            const delay = baseDelay * 2 ** attempt;
            logger.warn('Retrying after failure', { attempt: attempt + 1, delay, message: (err as Error).message });

            await new Promise((resolve) => setTimeout(resolve, delay));
            attempt++;
        }
    }

    throw lastError;
}
