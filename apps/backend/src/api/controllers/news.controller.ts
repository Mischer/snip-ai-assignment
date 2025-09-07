import type { Request, Response } from 'express';
import _ from 'lodash';
import { NewsService } from '../../services/news.service.js';
import { logger } from '../../logger.js';
import { BadRequestError } from '../http-errors.js';

export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    public getList = async (req: Request, res: Response) => {
        const startedAt = Date.now();

        const { limit, feedUrl } = this.parseQuery(req);

        try {
            const items = await this.newsService.getArticles(limit, feedUrl);

            const mapped = items.map((a) => ({
                realTitle: a.realTitle,
                fakeTitle: a.fakeTitle,
                category: a.category,
                url: a.url,
                source: a.source,
                publishedAt: a.publishedAt.toISOString(),
            }));

            return res.json({
                items: mapped,
                meta: { count: mapped.length, durationMs: Date.now() - startedAt, enriched: true },
            });
        } catch (err: any) {
            logger.error('GET /news failed', { message: err?.message, stack: err?.stack });
            throw err;
        }
    };

    private parseQuery(req: Request): { limit: number; feedUrl?: string } {
        const limitInput = _.toNumber(_.get(req, 'query.limit'));
        const limit = _.isFinite(limitInput) ? _.clamp(limitInput, 1, 50) : 10;

        // source to feedUrl: accept non-empty string, validate URL if present
        const sourceRaw = _.get(req, 'query.source');
        const feedUrl = _.isString(sourceRaw) && !_.isEmpty(_.trim(sourceRaw)) ? _.trim(sourceRaw) : undefined;

        if (feedUrl) {
            this.assertValidUrl(feedUrl);
        }

        return { limit, feedUrl };
    }

    private assertValidUrl(value: string): void {
        try {
            const url = new URL(value);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new BadRequestError('Query "source" must use http/https scheme.');
            }
        } catch {
            throw new BadRequestError('Query "source" must be a valid URL.');
        }
    }
}
