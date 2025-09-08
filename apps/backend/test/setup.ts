import nock from 'nock';
import { afterAll, beforeAll } from 'vitest';

// Ensure env for DI container
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
process.env.USER_AGENT = process.env.USER_AGENT || 'SnipsTests/1.0';

nock.disableNetConnect();

const allowLocal = (host: string) => {
    return host.includes('127.0.0.1') || host.includes('localhost') || host.includes('::1') || host.includes('[::1]');
};
nock.enableNetConnect(allowLocal);

beforeAll(() => {});

afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
});
