import { NewsSourcePort } from '../../domain/ports/news-source.port.js';
import { Article } from '../../domain/entities/article.js';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../../logger.js';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import _ from 'lodash';

export class RssNewsSource implements NewsSourcePort {
    private readonly parser: XMLParser;
    private readonly http: AxiosInstance;

    constructor() {
        this.parser = new XMLParser({ ignoreAttributes: false });
        this.http = axios.create({
            responseType: 'text',
            headers: {
                'User-Agent': process.env.USER_AGENT || 'SnipsNewsBot/1.0',
            },
            validateStatus: (statusCode) => statusCode >= 200 && statusCode < 400,
            timeout: 10_000,
        });
    }

    public async fetchLatest(limit: number, rssUrl?: string): Promise<Article[]> {
        const url: string = rssUrl || process.env.DEFAULT_RSS_URL!;

        logger.info(`Fetching RSS from ${url}, limit=${limit}`);

        let xml: string;
        try {
            const response = await this.http.get<string>(url);
            xml = response.data;
        } catch (err: any) {
            logger.error(`RSS HTTP error for ${url}: ${err?.message}`);
            throw new Error(`RSS fetch failed: ${err?.message ?? 'unknown error'}`);
        }

        const json = this.parser.parse(xml);
        const items: unknown = _.get(json, 'rss.channel.item', []);

        if (!_.isArray(items) || items.length === 0) {
            logger.warn(`RSS feed empty or invalid: ${url}`);
            return [];
        }

        const mapped: Article[] = _.chain(items)
            .slice(0, limit)
            .map((item: any) => this.toArticle(item))
            .value();

        logger.info(`Fetched ${mapped.length} items from ${url}`);
        return mapped;
    }

    private toArticle(item: any): Article {
        const rawLink: unknown = _.defaultTo(_.get(item, 'link'), '');
        const link: string = _.isObject(rawLink) ? _.defaultTo((rawLink as any)['#text'], '') : _.toString(rawLink);

        let host: string = 'unknown';
        try {
            host = new URL(link).host;
        } catch {
            logger.warn(`Invalid link in RSS feed: ${link}`);
        }

        const title: string = _.defaultTo(item?.title, '');
        const pub: string | undefined = _.get(item, 'pubDate');
        const publishedAt: Date = pub ? new Date(pub) : new Date();

        const article = {
            realTitle: title,
            url: link,
            source: host,
            publishedAt,
        } satisfies Article;

        return article;
    }
}
