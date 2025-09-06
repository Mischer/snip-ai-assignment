'use client';

import { useEffect, useState } from 'react';

type Article = {
  realTitle: string;
  url: string;
  source: string;
  publishedAt: string;
};

type ApiResponse = {
  items: Article[];
  meta: { count: number; durationMs: number };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export default function Page() {
  const [limit, setLimit] = useState<number>(10);
  const [source, setSource] = useState<string>('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (source.trim()) params.set('source', source.trim());

      const res = await fetch(`${API_BASE}/news?` + params.toString(), {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        const msg = `API error: ${res.status}`;
        setError(msg);
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
  };

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

        <button onClick={load} className="btn">
          Load
        </button>
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
        <div className="grid">
          {data.items.map((a, idx) => (
            <a key={`${a.url}-${idx}`} href={a.url} target="_blank" rel="noreferrer" className="news">
              <div className="news-date">{new Date(a.publishedAt).toLocaleString()}</div>
              <div className="news-title">{a.realTitle}</div>
              <div className="news-source">{a.source}</div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}