import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { buildContainer } from './di/container.js';
import { newsRoutes } from './api/routes/news.routes.js';
import { errorHandler } from './handlers/errors.js';
import { logger } from './logger.js';
import { TOKENS } from './di/tokens.js';

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
        methods: ['GET', 'HEAD', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept'],
    })
);

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

const container = buildContainer();
app.use('/news', newsRoutes(container.get(TOKENS.NewsController)));

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`);
    logger.info(`Try: http://localhost:${port}/news?limit=5`);
});

// ---- Graceful shutdown ----
const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);

    // Stop accepting new connections; existing requests will finish
    server.close(async (err?: Error) => {
        if (err) {
            logger.error('Error while closing HTTP server', { message: err.message, stack: err.stack });
            process.exit(1);
            return;
        }

        try {
            await container.disposeAll();
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
