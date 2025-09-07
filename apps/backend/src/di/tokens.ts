// di/tokens.ts
export type Token<T> = symbol;

export const TOKENS = {
    NewsService: Symbol('NewsService'),
    NewsController: Symbol('NewsController'),
} as const;
