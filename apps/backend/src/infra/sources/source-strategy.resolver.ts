import axios from 'axios';
import _ from 'lodash';
import type { NewsSourceStrategy, ResolveInput } from '../../domain/ports/news-source-strategy.interface.js';
import { logger } from '../../logger.js';

export class SourceResolver {
    constructor(private readonly strategies: NewsSourceStrategy[]) {}

    async resolve(input: ResolveInput): Promise<NewsSourceStrategy> {
        const url = _.trim(input.url);

        const byUrl = _.find(this.strategies, (s) => s.canHandle({ url }));
        if (byUrl) return byUrl;

        let contentTypeHint: string | undefined;
        if (_.isString(url) && !_.isEmpty(url)) {
            contentTypeHint = await this.detectContentType(url);
        }

        const enrichedInput: ResolveInput = { ...input, url, contentTypeHint };

        const byType = _.find(this.strategies, (s) => s.canHandle(enrichedInput));
        if (byType) return byType;

        throw new Error('No suitable source strategy was found for the given input');
    }

    private async detectContentType(url: string): Promise<string | undefined> {
        const userAgent = _.defaultTo(process.env.USER_AGENT, 'SnipsNewsBot/1.0');
        const baseCfg = {
            timeout: 5_000,
            headers: { 'User-Agent': userAgent },
            validateStatus: (s: number) => s >= 200 && s < 400,
        };

        try {
            const head = await axios.head(url, baseCfg);
            const ct = _.toLower(_.toString(_.get(head, 'headers.content-type', '')));
            if (ct) return ct;
        } catch {
            logger.debug('SourceResolver failed to detectContentType' + url);
        }

        try {
            const get = await axios.get(url, baseCfg);
            const ct = _.toLower(_.toString(_.get(get, 'headers.content-type', '')));
            if (ct) return ct;
        } catch {
            logger.debug('SourceResolver failed to detectContentType' + url);
        }

        return undefined;
    }
}
