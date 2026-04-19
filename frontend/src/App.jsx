import { useState, useCallback } from 'react';
import ControlsPanel from './components/ControlsPanel';
import StatsPanel from './components/StatsPanel';
import RegretChart from './components/RegretChart';
import ArmCountsChart from './components/ArmCountsChart';
import ArmDetailsTable from './components/ArmDetailsTable';
import EmptyState from './components/EmptyState';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [config, setConfig] = useState({
    steps: 10000,
    epsilon: 0.1,
    c: 2.0,
    algorithm: 'both',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (config.algorithm === 'both') {
        const response = await fetch(`${API_BASE}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            steps: config.steps,
            epsilon: config.epsilon,
            c: config.c,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Simulation failed');
        }

        const data = await response.json();
        setResults({ type: 'comparison', epsilon_greedy: data.epsilon_greedy, ucb: data.ucb });
      } else {
        const response = await fetch(`${API_BASE}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            steps: config.steps,
            epsilon: config.epsilon,
            c: config.c,
            algorithm: config.algorithm,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Simulation failed');
        }

        const data = await response.json();
        setResults({ type: 'single', data });
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [config]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Multi-Armed Bandit Engine
        </div>
        <h1 className="app-header__title">Dynamic Yield Optimizer</h1>
        <p className="app-header__subtitle">
          Maximize marketing campaign conversions using intelligent exploration-exploitation algorithms
        </p>
      </header>

      <ControlsPanel
        config={config}
        setConfig={setConfig}
        onRun={runSimulation}
        loading={loading}
      />

      {error && (
        <div className="error-message fade-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {results ? (
        <div className="fade-in">
          <StatsPanel results={results} />

          <div className="charts-grid">
            <div className="chart-container chart-container--full">
              <RegretChart results={results} />
            </div>
            <div className="chart-container">
              <ArmCountsChart results={results} algorithm="epsilon_greedy" />
            </div>
            <div className="chart-container">
              <ArmCountsChart results={results} algorithm="ucb" />
            </div>
          </div>

          <ArmDetailsTable results={results} />
        </div>
      ) : (
        !loading && <EmptyState />
      )}

      <footer className="app-footer">
        Dynamic Yield Optimization Engine — Multi-Armed Bandit Simulation ·
        Built with FastAPI + React + Recharts
      </footer>
    </div>
  );
}

export default App;
