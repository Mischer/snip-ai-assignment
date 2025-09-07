import crypto from 'node:crypto';
import { NewsSourcePort } from '../domain/ports/news-source.port.js';
import { EnrichmentPort } from '../domain/ports/enrichment.port.js';
import { Article } from '../domain/entities/article.js';
import { Category } from '../domain/types/category.js';
import { logger } from '../logger.js';
import type { CachePort } from '../infra/cache/memory.cache.js';

export type EnrichedArticle = Article & { fakeTitle: string; category: Category };

export class NewsService {
    constructor(
        private readonly source: NewsSourcePort,
        private readonly enrichment: EnrichmentPort,
        private readonly cache?: CachePort
    ) {}

    public async getArticles(limit: number, feedUrl?: string): Promise<EnrichedArticle[]> {
        const items = await this.source.fetchLatest(limit, feedUrl);
        const out: EnrichedArticle[] = [];

        for (const item of items) {
            const key = this.makeKey(item);
            let enr = this.cache
                ? ((await this.cache.get(key)) as { fakeTitle: string; category: Category } | null)
                : null;

            if (!enr) {
                logger.info('enrich: cache miss', { url: item.url });
                enr = await this.enrichment.enrich(item);
                if (this.cache) {
                    await this.cache.set(key, enr, 2 * 60 * 60); // 2h
                }
            } else {
                logger.info('enrich: cache hit', { url: item.url });
            }

            out.push({ ...item, fakeTitle: enr.fakeTitle, category: enr.category });
        }

        return out;
    }

    private makeKey(a: Article): string {
        return 'enrich:' + crypto.createHash('sha1').update(`${a.realTitle}|${a.url}`).digest('hex');
    }
}
