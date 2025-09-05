import {Article} from '../entities/article.js';
import {Category} from '../types/category.js';

export interface EnrichmentPort {
  enrich(article: Article): Promise<{fakeTitle: string; category: Category}>;
}
