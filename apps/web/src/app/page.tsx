'use client';

import { useEffect, useState } from 'react';

type Article = {
  realTitle: string;
  fakeTitle: string;
  category: 'Politics' | 'Sports' | 'Technology' | 'Other';
  url: string;
  source: string;
  publishedAt: string; // ISO
};

type ApiResponse = {
  items: Article[];
  meta: { count: number; durationMs: number; enriched: boolean };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export default function Page() {
  const [limit, setLimit] = useState<number>(10);
  const [source, setSource] = useState<string>('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (source.trim()) params.set('source', source.trim());

      // если настроил next.config переписывать /api → на бэк, можно использовать '/api/news?...'
      const res = await fetch(`${API_BASE}/news?` + params.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        setError(`API error: ${res.status}`);
        return;
      }

      const json = (await res.json()) as ApiResponse;
      setData(json);
      // eslint-disable-next-line
    } catch (e: any) {
      setError(e?.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container">
      <h1 className="title">Snips News</h1>

      <div className="toolbar">
        <div className="field">
          <label>Limit</label>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </div>

        <div className="field grow">
          <label>Source (RSS URL, optional)</label>
          <input
            type="url"
            placeholder="https://feeds.bbci.co.uk/sport/rss.xml"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <button onClick={load} className="btn">Load</button>
      </div>

      {loading && <div className="card muted">Loading…</div>}
      {error && (
        <div className="card error">
          <b>Error</b>
          <div>{error}</div>
          <button onClick={load} className="btn small">Retry</button>
        </div>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <div className="card muted">No articles found.</div>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="meta">
            <span>Enriched: {String(data.meta.enriched)}</span>
            <span>•</span>
            <span>Fetched in {data.meta.durationMs} ms</span>
          </div>

          <div className="grid">
            {data.items.map((a, idx) => (
              <a key={`${a.url}-${idx}`} href={a.url} target="_blank" rel="noreferrer" className="news">
                <div className="news-header">
                  <span className={`badge ${badgeClass(a.category)}`}>{a.category}</span>
                  <span className="news-source">{a.source}</span>
                </div>
                <div className="news-fake">{a.fakeTitle}</div>
                <div className="news-real" title={a.realTitle}>{a.realTitle}</div>
                <div className="news-date">{new Date(a.publishedAt).toLocaleString()}</div>
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function badgeClass(c: Article['category']): string {
  switch (c) {
    case 'Sports': return 'badge-green';
    case 'Technology': return 'badge-blue';
    case 'Politics': return 'badge-red';
    default: return 'badge-gray';
  }
}