import type {
    NewsSourceStrategy,
    NormalizedArticle,
    ResolveInput,
} from '../../domain/ports/news-source-strategy.interface.js';
import { logger } from '../../logger.js';

export class JsonFeedSourceStrategyImpl implements NewsSourceStrategy {
    canHandle({ url, contentTypeHint }: ResolveInput): boolean {
        logger.info('[JsonFeedSourceStrategyImpl.canHandle] called', { url, contentTypeHint });
        logger.info('[JsonFeedSourceStrategyImpl.canHandle] not implemented yet');
        return true;
    }

    async fetch(limit: number, { url }: { url?: string }): Promise<NormalizedArticle[]> {
        logger.info('[JsonFeedSourceStrategyImpl.fetch] called', { url, limit });
        logger.info('[JsonFeedSourceStrategyImpl.fetch] not implemented yet');

        return [];
    }
}
