import { NewsSourcePort } from '../domain/ports/news-source.port.js';
import { Article } from '../domain/entities/article.js';

export class NewsService {
    constructor(private readonly newsSource: NewsSourcePort) {}

    public async getArticles(limit: number, feedUrl?: string): Promise<Article[]> {
        return this.newsSource.fetchLatest(limit, feedUrl);
    }
}
