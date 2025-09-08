// di/tokens.ts
export type Token<T> = symbol;

export const TOKENS = {
    NewsService: Symbol('NewsService'),
    NewsController: Symbol('NewsController'),

    SourceResolver: Symbol('SourceResolver'),
    RssSourceStrategy: Symbol('RssSourceStrategy'),
    JsonFeedSourceStrategy: Symbol('JsonFeedSourceStrategy'),
} as const;
