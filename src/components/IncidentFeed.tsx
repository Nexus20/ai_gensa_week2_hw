import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import { formatTimestamp, severityColor } from '../domain/formatting';
import type { IncidentsResponse, Incident } from '../api/types';

export default function IncidentFeed() {
  const { data, loading, error } = useApiResource<IncidentsResponse>('incidents');
  const [showResolved, setShowResolved] = useState(false);

  if (loading) {
    return (
      <section className="panel">
        <h2>Incidents</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading incident feed…</p>
        </div>
      </section>
    );
  }

  // preserve existing behavior: show empty list if fetch failed silently
  const items = error ? [] : (data?.items ?? []);

  const filtered = items.filter((i: Incident) => showResolved || !i.resolved);
  const rank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  filtered.sort((a: Incident, b: Incident) => {
    const ra = rank[a.severity] !== undefined ? rank[a.severity] : 3;
    const rb = rank[b.severity] !== undefined ? rank[b.severity] : 3;
    if (ra !== rb) return ra - rb;
    return a.timestamp < b.timestamp ? 1 : -1;
  });

  return (
    <section className="panel">
      <h2>
        Incidents
        <label className="toggle">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          show resolved
        </label>
      </h2>
      <ul className="incident-list">
        {filtered.map((inc: Incident) => (
          <li key={inc.id} className={inc.resolved ? 'incident-row incident-resolved' : 'incident-row'}>
            <span className="incident-sev" style={{ background: severityColor(inc.severity) }}>
              {inc.severity}
            </span>
            <div className="incident-main">
              <span className="incident-title">
                {inc.id} · {inc.title}
              </span>
              <span className="incident-meta">
                {inc.system} · {formatTimestamp(inc.timestamp)} · {inc.resolved ? 'resolved' : 'open'}
              </span>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="incident-empty">No incidents to show.</li>}
      </ul>
    </section>
  );
}
