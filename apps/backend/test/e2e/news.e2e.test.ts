import request from 'supertest';
import nock from 'nock';
import { describe, test, expect, beforeEach } from 'vitest';
import { createApp } from '../../src/app.js';

const RSS_HOST = 'https://news.example.com';
const RSS_PATH = '/feed.xml';
const RSS_URL = `${RSS_HOST}${RSS_PATH}`;

const RSS_XML = `
<rss version="2.0">
  <channel>
    <title>Example RSS</title>
    <item>
      <title>First RSS Post</title>
      <link>https://news.example.com/posts/1</link>
      <pubDate>Mon, 01 Sep 2025 10:00:00 GMT</pubDate>
      <category>tech</category>
    </item>
  </channel>
</rss>
`;

const OPENAI_REPLY = {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: 1_700_000_000,
    model: 'gpt-4o-mini',
    choices: [
        {
            index: 0,
            finish_reason: 'stop',
            message: {
                role: 'assistant',
                content: `{
  "fakeTitle": "First RSS Post — summary",
  "category": "Technology"
}`,
            },
        },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
};

describe('E2E: /healthz and /news', () => {
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        app = createApp();
    });

    test('GET /healthz returns ok', async () => {
        const healthResponse = await request(app).get('/healthz');
        expect(healthResponse.status).toBe(200);
        expect(healthResponse.body).toEqual({ status: 'ok' });
    });

    test('GET /news returns enriched items (RSS + OpenAI mocked)', async () => {
        nock(RSS_HOST).head(RSS_PATH).reply(200, '', { 'Content-Type': 'application/rss+xml' });
        nock(RSS_HOST).get(RSS_PATH).reply(200, RSS_XML, { 'Content-Type': 'application/rss+xml' });

        const openAiScope = nock('https://api.openai.com')
            .post('/v1/chat/completions')
            .reply(200, OPENAI_REPLY, { 'Content-Type': 'application/json' });

        const newsResponse = await request(app).get('/news').query({ limit: 1, source: RSS_URL });

        expect(newsResponse.status).toBe(200);
        expect(newsResponse.body.meta).toMatchObject({ enriched: true });
        expect(Array.isArray(newsResponse.body.items)).toBe(true);

        const article = newsResponse.body.items[0];
        expect(article.realTitle).toBe('First RSS Post');
        expect(article.fakeTitle).toContain('summary');
        expect(article.source).toBe('news.example.com');
        expect(typeof article.publishedAt).toBe('string');

        expect(openAiScope.isDone()).toBe(true);
    });

    test('GET /news uses cache (second call does not hit OpenAI)', async () => {
        // First request — must call OpenAI
        nock(RSS_HOST).head(RSS_PATH).reply(200, '', { 'Content-Type': 'application/rss+xml' });
        nock(RSS_HOST).get(RSS_PATH).reply(200, RSS_XML, { 'Content-Type': 'application/rss+xml' });

        const firstOpenAiScope = nock('https://api.openai.com')
            .post('/v1/chat/completions')
            .reply(200, OPENAI_REPLY, { 'Content-Type': 'application/json' });

        const firstNewsResponse = await request(app).get('/news').query({ limit: 1, source: RSS_URL });

        expect(firstNewsResponse.status).toBe(200);
        expect(firstOpenAiScope.isDone()).toBe(true);

        // Second request — should use cache, no OpenAI call
        nock(RSS_HOST).head(RSS_PATH).reply(200, '', { 'Content-Type': 'application/rss+xml' });
        nock(RSS_HOST).get(RSS_PATH).reply(200, RSS_XML, { 'Content-Type': 'application/rss+xml' });

        const cachedNewsResponse = await request(app).get('/news').query({ limit: 1, source: RSS_URL });

        expect(cachedNewsResponse.status).toBe(200);
        expect(cachedNewsResponse.body.items).toHaveLength(1);

        const cachedArticle = cachedNewsResponse.body.items[0];
        expect(cachedArticle.fakeTitle).toContain('summary');
    });
});
