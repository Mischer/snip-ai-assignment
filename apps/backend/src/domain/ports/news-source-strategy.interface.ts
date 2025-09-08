export type NormalizedArticle = {
    realTitle: string;
    fakeTitle?: string;
    category?: string;
    url: string;
    source: string;
    publishedAt: Date;
};

export type ResolveInput = {
    url?: string;
    contentTypeHint?: string;
};

export interface NewsSourceStrategy {
    canHandle(input: ResolveInput): boolean;
    fetch(limit: number, input: { url?: string }): Promise<NormalizedArticle[]>;
}
