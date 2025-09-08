export default function EmptyState() {
  return (
    <div className="card muted" style={{ textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>No results yet</div>
      <div>Set limit and source, then click <b>Load</b>.</div>
    </div>
  );
}