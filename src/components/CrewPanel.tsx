import { useApiResource } from '../hooks/useApiResource';
import type { CrewResponse, CrewMember } from '../api/types';

export default function CrewPanel() {
  const { data, loading, error, retry } = useApiResource<CrewResponse>('crew');

  if (loading) {
    return (
      <section className="panel">
        <h2>Crew</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading crew roster…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Crew</h2>
        <div className="panel-error">
          <p>⚠ {error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const sorted = [...data.members].sort((a: CrewMember, b: CrewMember) => {
    if (a.onDuty !== b.onDuty) return a.onDuty ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });

  return (
    <section className="panel">
      <h2>Crew</h2>
      <ul className="crew-list">
        {sorted.map((m: CrewMember) => (
          <li key={m.id} className={m.onDuty ? 'crew-row crew-on' : 'crew-row'}>
            <span className="crew-dot" style={{ background: m.onDuty ? '#3ddc84' : '#8892a6' }} />
            <div className="crew-main">
              <span className="crew-name">{m.name}</span>
              <span className="crew-role">{m.role} · shift {m.shift}</span>
            </div>
            <div className="crew-vitals">
              <span title="heart rate">♥ {m.heartRate}</span>
              <span title="sleep last night">☾ {m.sleepHours}h</span>
              <span title="mission day">d{m.missionDay}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
