import 'dotenv/config';

import { createAppWithContainer } from './app.js';
import { logger } from './logger.js';

const port = process.env.PORT || 3000;
const { app, dispose } = createAppWithContainer();

// Start HTTP server
const server = app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`);
    logger.info(`Try: http://localhost:${port}/news?limit=5`);
});

// ---- Graceful shutdown ----
const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);

    // Stop accepting new connections; let in-flight requests finish
    server.close(async (err?: Error) => {
        if (err) {
            logger.error('Error while closing HTTP server', { message: err.message, stack: err.stack });
            process.exit(1);
            return;
        }

        try {
            await dispose();
            logger.info('Container resources disposed');
        } catch (e: any) {
            logger.error('Error while disposing container resources', { message: e?.message, stack: e?.stack });
        } finally {
            logger.info('HTTP server closed');
            process.exit(0);
        }
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
