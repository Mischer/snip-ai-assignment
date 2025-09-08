"use client";
import { useState } from "react";

type Props = {
  initialLimit?: number;
  initialSource?: string;
  loading?: boolean;
  onSubmit: (params: { limit: number; source?: string }) => void;
};

export default function SearchBar({
                                    initialLimit = 5,
                                    initialSource = "https://feeds.bbci.co.uk/sport/rss.xml",
                                    loading,
                                    onSubmit,
                                  }: Props) {
  const [limit, setLimit] = useState(initialLimit);
  const [source, setSource] = useState(initialSource);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="toolbar">
        <div className="field" style={{ minWidth: 120 }}>
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
        <button
          className="btn"
          onClick={() => onSubmit({ limit, source: source.trim() || undefined })}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </div>
    </div>
  );
}