import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { buildContainer } from './container.js';
import { newsRoutes } from './api/routes/news.routes.js';
import { errorHandler } from './handlers/errors.js';
import { logger } from './logger.js';

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

const { newsController } = buildContainer();
app.use('/news', newsRoutes(newsController));

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`);
    logger.info(`Try: http://localhost:${port}/news?limit=5`);
});
