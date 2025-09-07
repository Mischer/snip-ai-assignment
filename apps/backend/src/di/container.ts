import { RssNewsSource } from '../infra/sources/rss.news-source.js';
import { NewsService } from '../services/news.service.js';
import { NewsController } from '../api/controllers/news.controller.js';
import { MemoryCache } from '../infra/cache/memory.cache.js';
import { OpenAiEnrichment } from '../infra/enrichment/openai.enrichment.js';
import { Token, TOKENS } from './tokens.js';

interface Disposable {
    dispose(): Promise<void> | void;
}

class Container {
    private providers = new Map<Token<any>, any>();

    register<T>(token: Token<T>, instance: T) {
        this.providers.set(token, instance);
    }

    // Currently, all beans are simple and do not require cleanup.
    // In the future, resources like DB or Redis connections may need proper disposal.
    get<T>(token: Token<T>): T {
        const dep = this.providers.get(token);
        if (!dep) throw new Error(`No provider for token ${token.toString()}`);
        return dep;
    }

    // For future use: this method will support graceful shutdown by disposing resources like DB/cache connections.
    async disposeAll() {
        for (const instance of this.providers.values()) {
            if (typeof (instance as any).dispose === 'function') {
                await (instance as Disposable).dispose();
            }
        }
        this.providers.clear();
    }
}

export function buildContainer() {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');

    const container = new Container();

    const rss = new RssNewsSource();
    const enrichment = new OpenAiEnrichment(process.env.OPENAI_API_KEY);
    const cache = new MemoryCache();
    const newsService = new NewsService(rss, enrichment, cache);
    const newsController = new NewsController(newsService);

    container.register(TOKENS.NewsService, newsService);
    container.register(TOKENS.NewsController, newsController);

    return container;
}
