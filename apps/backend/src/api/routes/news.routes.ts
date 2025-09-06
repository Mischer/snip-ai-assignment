import { Router } from 'express';
import { NewsController } from '../controllers/news.controller.js';

export function newsRoutes(controller: NewsController) {
    const router = Router();
    router.get('/', controller.getList);
    return router;
}
