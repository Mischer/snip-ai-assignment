import { Article } from '../entities/article.js';

export interface NewsSourcePort {
    fetchLatest(limit: number, sourceRef?: string): Promise<Article[]>;
}
