'use client';

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import NewsCard from "../components/NewsCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

type Article = {
  realTitle: string;
  fakeTitle?: string;
  category?: string;
  url: string;
  source: string;
  publishedAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:3000";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ enriched?: boolean; durationMs?: number } | null>(null);
  const [items, setItems] = useState<Article[]>([]);

  const load = async ({ limit, source }: { limit: number; source?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams({
        limit: String(limit),
        ...(source ? { source } : {}),
      }).toString();

      const res = await fetch(`${API_BASE}/news?${qs}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      setItems(data?.items ?? []);
      setMeta(data?.meta ?? null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load";
      setItems([]);
      setMeta(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="topbar">
        <div className="topbar-inner">
          <h1 className="title">Snips News</h1>
        </div>
      </div>

      <div className="container">
        <SearchBar loading={loading} onSubmit={load} />

        {meta && (
          <div className="meta">
            <span className="badge badge-green">{meta.enriched ? "Enriched" : "Raw"}</span>
            <span className="dot" />
            {typeof meta.durationMs === "number" && (
              <span>Fetched in {meta.durationMs} ms</span>
            )}
          </div>
        )}

        {error && (
          <div className="card error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div className="grid">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((a, idx) => (
              <NewsCard
                key={idx}
                title={a.realTitle}
                subtitle={a.fakeTitle}
                url={a.url}
                source={a.source}
                category={a.category}
                publishedAt={a.publishedAt}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}