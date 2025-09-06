import { RssNewsSource } from './infra/sources/rss.news-source.js';
import { NewsService } from './services/news.service.js';
import { NewsController } from './api/controllers/news.controller.js';

export function buildContainer() {
    const rssSource = new RssNewsSource();
    const newsService = new NewsService(rssSource);
    const newsController = new NewsController(newsService);

    return { newsController };
}
