import axios from 'axios';
import _ from 'lodash';
import { XMLParser } from 'fast-xml-parser';
import type {
    NewsSourceStrategy,
    NormalizedArticle,
    ResolveInput,
} from '../../domain/ports/news-source-strategy.interface.js';

export class RssSourceStrategyImpl implements NewsSourceStrategy {
    private parser = new XMLParser({ ignoreAttributes: false });

    canHandle({ url, contentTypeHint }: ResolveInput): boolean {
        if (contentTypeHint && /xml|rss|atom/i.test(contentTypeHint)) return true;
        return !!url && /(rss|\.xml|feed)/i.test(url ?? '');
    }

    async fetch(limit: number, { url }: { url?: string }): Promise<NormalizedArticle[]> {
        if (!url) throw new Error('RSS strategy requires url');

        const userAgent = _.defaultTo(process.env.USER_AGENT, 'SnipsNewsBot/1.0');

        const res = await axios.get(url, {
            timeout: 10_000,
            headers: { 'User-Agent': userAgent },
            validateStatus: (s) => s < 400,
        });

        const xml = _.isString(res.data) ? res.data : _.toString(res.data);
        const json = this.parser.parse(xml);

        let items: unknown = _.get(json, 'rss.channel.item') ?? _.get(json, 'feed.entry') ?? [];
        const arr: any[] = _.compact(_.castArray(items));
        const host = new URL(url).hostname.replace(/^www\./, '');

        return _.take(arr, limit).map((item: any): NormalizedArticle => {
            const rawTitle = _.get(item, 'title.#text', _.get(item, 'title', '(no title)'));
            const title = _.isString(rawTitle) ? rawTitle : _.toString(rawTitle);

            const linkCandidate =
                _.get(item, 'link.href') ??
                (_.isArray(item?.link) ? _.get(item, 'link[0].href') : _.get(item, 'link')) ??
                url;
            const link = _.isString(linkCandidate) ? linkCandidate : _.toString(linkCandidate) || url;

            const rawCategory = _.isArray(item?.category)
                ? _.get(item, 'category[0].term', _.get(item, 'category[0]'))
                : _.get(item, 'category.term', _.get(item, 'category'));
            const category = _.isString(rawCategory)
                ? rawCategory
                : _.isNil(rawCategory)
                  ? undefined
                  : _.toString(rawCategory);

            const publishedRaw =
                _.get(item, 'pubDate') ?? _.get(item, 'published') ?? _.get(item, 'updated') ?? Date.now();

            const publishedAt = new Date(
                _.isString(publishedRaw) || _.isNumber(publishedRaw) ? (publishedRaw as any) : _.toString(publishedRaw)
            );

            return {
                realTitle: title,
                url: link,
                source: host,
                category,
                publishedAt,
            };
        });
    }
}
