import { RssNewsSource } from './infra/sources/rss.news-source.js';
import { NewsService } from './services/news.service.js';
import { NewsController } from './api/controllers/news.controller.js';
import { MemoryCache } from './infra/cache/memory.cache.js';
import { OpenAiEnrichment } from './infra/enrichment/openai.enrichment.js';

export function buildContainer() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for enrichment');
    }

    const rss = new RssNewsSource();
    const enrichment = new OpenAiEnrichment(process.env.OPENAI_API_KEY);
    const cache = new MemoryCache();

    const newsService = new NewsService(rss, enrichment, cache);
    const newsController = new NewsController(newsService);

    return { newsController };
}
