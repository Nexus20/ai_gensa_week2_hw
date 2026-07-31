import Dashboard from './components/Dashboard';
import FuelWidget from './components/FuelWidget';
import TelemetryChart from './components/TelemetryChart';
import CrewPanel from './components/CrewPanel';
import IncidentFeed from './components/IncidentFeed';

export default function App() {
  return (
    <div className="app">
      <Dashboard />
      <FuelWidget />
      <div className="grid">
        <TelemetryChart />
        <CrewPanel />
        <IncidentFeed />
      </div>
      <footer className="footer">
        Orbital Ops · training playground · data is fictional
      </footer>
    </div>
  );
}
