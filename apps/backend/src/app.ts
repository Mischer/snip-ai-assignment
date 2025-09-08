import express, { Express } from 'express';
import cors from 'cors';
import { buildContainer } from './di/container.js';
import { TOKENS } from './di/tokens.js';
import { newsRoutes } from './api/routes/news.routes.js';
import { errorHandler } from './handlers/errors.js';

type DisposableContainer = {
    disposeAll?: () => Promise<void>;
    get: <T>(token: symbol) => T;
};

/**
 * Builds the real DI container, wires routes into an Express app
 * and returns { app, container, dispose } so the server can gracefully shutdown.
 */
export function createAppWithContainer(): {
    app: Express;
    container: DisposableContainer;
    dispose: () => Promise<void>;
} {
    const app = express();
    app.use(express.json());
    app.use(
        cors({
            origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
            methods: ['GET', 'HEAD', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept'],
        })
    );

    // Health endpoint
    app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

    // Real DI container
    const container = buildContainer();
    app.use('/news', newsRoutes(container.get(TOKENS.NewsController)));
    app.use(errorHandler);

    // Expose a unified dispose() that is safe to call even if container has no disposeAll
    const dispose = async () => {
        if (typeof container.disposeAll === 'function') {
            await container.disposeAll();
        }
    };

    return { app, container, dispose };
}

/** Convenience for tests that only need the Express app */
export function createApp(): Express {
    return createAppWithContainer().app;
}
