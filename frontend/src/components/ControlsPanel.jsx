export default function ControlsPanel({ config, setConfig, onRun, loading }) {
  const update = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="controls-panel">
      <div className="card">
        <div className="card__title">
          <svg className="card__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
          Simulation Parameters
        </div>

        <div className="controls-section">
          <div className="form-group">
            <label htmlFor="steps-input">Time Steps</label>
            <input
              id="steps-input"
              type="number"
              min="100"
              max="100000"
              step="1000"
              value={config.steps}
              onChange={(e) => update('steps', parseInt(e.target.value) || 1000)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="algorithm-select">Algorithm</label>
            <select
              id="algorithm-select"
              value={config.algorithm}
              onChange={(e) => update('algorithm', e.target.value)}
            >
              <option value="both">Compare Both (ε-Greedy vs UCB1)</option>
              <option value="epsilon">Epsilon-Greedy Only</option>
              <option value="ucb">UCB1 Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__title">
          <svg className="card__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Algorithm Tuning
        </div>

        <div className="controls-section">
          <div className="form-group">
            <label htmlFor="epsilon-input">Epsilon (ε) — Exploration Rate</label>
            <input
              id="epsilon-input"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={config.epsilon}
              onChange={(e) => update('epsilon', parseFloat(e.target.value) || 0.1)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="c-input">UCB Constant (c) — Confidence Width</label>
            <input
              id="c-input"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={config.c}
              onChange={(e) => update('c', parseFloat(e.target.value) || 2.0)}
            />
          </div>

          <button
            id="run-simulation-btn"
            className="btn btn--primary btn--large"
            onClick={onRun}
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <div className="btn__spinner" />
                Running Simulation…
              </>
            ) : (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
