import type { Request, Response, NextFunction } from 'express';
import { NewsService } from '../../services/news.service.js';
import { logger } from '../../logger.js';

export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    public getList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawLimit = Number(req.query.limit);
            const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 10;

            const rawSource = req.query.source;
            const feedUrl = typeof rawSource === 'string' && rawSource.length > 0 ? rawSource : undefined;

            if (feedUrl) {
                try {
                    new URL(feedUrl);
                } catch {
                    return res.status(400).json({ error: { message: 'Query "source" must be a valid URL.' } });
                }
            }

            const startedAt = Date.now();
            const articles = await this.newsService.getArticles(limit, feedUrl);

            res.json({
                items: articles.map((article) => ({
                    realTitle: article.realTitle,
                    url: article.url,
                    source: article.source,
                    publishedAt: article.publishedAt.toISOString(),
                })),
                meta: { count: articles.length, durationMs: Date.now() - startedAt },
            });
        } catch (error: any) {
            logger.error(`GET /news failed`, { error: error?.message });
            next(error);
        }
    };
}
