import axios from 'axios';
import { z } from 'zod';
import { Article } from '../../domain/entities/article.js';
import { EnrichmentPort } from '../../domain/ports/enrichment.port.js';
import { retryWithExponentialBackoff } from '../utils/retry.js';

const OutSchema = z.object({
    fakeTitle: z.string().min(5).max(160),
    category: z.enum(['Politics', 'Sports', 'Technology', 'Other']),
});

export class OpenAiEnrichment implements EnrichmentPort {
    constructor(
        private readonly apiKey: string,
        private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini',
        private readonly retries = Number(process.env.OPENAI_RETRIES ?? 3)
    ) {
        if (!apiKey) {
            throw new Error('OpenAI API key is missing');
        }
    }

    public async enrich(article: Article) {
        const prompt = [
            'You are given a REAL sports news title and its URL.',
            '1) Create a plausible FAKE headline (<=120 chars).',
            '2) Classify the REAL article into one of: Politics, Sports, Technology, Other.',
            'Return STRICT JSON only with keys: fakeTitle, category.',
            `RealTitle: "${article.realTitle.replace(/"/g, '\\"')}"`,
            `URL: "${article.url.replace(/"/g, '\\"')}"`,
        ].join('\n');

        return retryWithExponentialBackoff(
            async () => {
                const { data } = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: this.model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                    },
                    {
                        timeout: 15_000,
                        headers: {
                            Authorization: `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        validateStatus: (s) => s >= 200 && s < 300,
                    }
                );

                const text: string = data?.choices?.[0]?.message?.content ?? '';
                const matches = text.match(/\{[\s\S]*\}/);
                if (!matches) {
                    throw new Error('OpenAI returned no JSON block');
                }

                const parsed = OutSchema.parse(JSON.parse(matches[0]));
                return parsed;
            },
            { retries: this.retries, baseDelayMs: 500 }
        );
    }
}
