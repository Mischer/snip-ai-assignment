import crypto from 'node:crypto';
import _ from 'lodash';
import { logger } from '../logger.js';

import type { Article } from '../domain/entities/article.js';
import type { Category } from '../domain/types/category.js';
import type { EnrichmentPort } from '../domain/ports/enrichment.port.js';
import type { CachePort } from '../infra/cache/memory.cache.js';

import type { SourceResolver } from '../infra/sources/source-strategy.resolver.js';
import type { NormalizedArticle } from '../domain/ports/news-source-strategy.interface.js';

export type EnrichedArticle = Article & { fakeTitle: string; category: Category };

export class NewsService {
    constructor(
        private readonly resolver: SourceResolver, // ⬅️ вместо одного конкретного источника
        private readonly enrichment: EnrichmentPort,
        private readonly cache?: CachePort
    ) {}

    public async getArticles(limit: number, feedUrl?: string): Promise<EnrichedArticle[]> {
        const safeLimit = _.clamp(_.toInteger(limit), 1, 50);

        const strategy = await this.resolver.resolve({ url: feedUrl });
        const items = await strategy.fetch(safeLimit, { url: feedUrl });

        const baseArticles: Article[] = items.map(this.toDomainArticle);

        const enriched = await Promise.all(
            baseArticles.map(async (item) => {
                const key = this.makeKey(item);
                let cached = this.cache
                    ? ((await this.cache.get(key)) as { fakeTitle: string; category: Category } | null)
                    : null;

                if (!cached) {
                    logger.info('enrich: cache miss', { url: item.url });
                    cached = await this.enrichment.enrich(item);
                    if (this.cache) {
                        // TTL 2h
                        await this.cache.set(key, cached, 2 * 60 * 60);
                    }
                } else {
                    logger.info('enrich: cache hit', { url: item.url });
                }

                return { ...item, fakeTitle: cached.fakeTitle, category: cached.category } as EnrichedArticle;
            })
        );

        return enriched;
    }

    private toDomainArticle(a: NormalizedArticle): Article {
        return {
            realTitle: _.isString(a.realTitle) ? a.realTitle : _.toString(a.realTitle),
            url: a.url,
            source: a.source,
            publishedAt: a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt),
        } as Article;
    }

    private makeKey(a: Article): string {
        const title = _.defaultTo(a.realTitle, '');
        const url = _.defaultTo(a.url, '');
        return 'enrich:' + crypto.createHash('sha1').update(`${title}|${url}`).digest('hex');
    }
}
