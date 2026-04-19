export default function StatsPanel({ results }) {
  if (!results) return null;

  const getStats = (data) => ({
    totalReward: data.total_reward,
    finalRegret: data.final_regret,
    totalSteps: data.total_steps,
    bestEstIdx: data.estimated_values.indexOf(Math.max(...data.estimated_values)),
    bestTrueIdx: data.true_probabilities.indexOf(Math.max(...data.true_probabilities)),
    algorithm: data.algorithm,
  });

  if (results.type === 'comparison') {
    const eg = getStats(results.epsilon_greedy);
    const ucb = getStats(results.ucb);

    return (
      <div className="stats-grid fade-in">
        <div className="stat-card">
          <div className="stat-card__label">Steps</div>
          <div className="stat-card__value">{eg.totalSteps.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <span className="algo-badge algo-badge--epsilon">ε-Greedy</span> Regret
          </div>
          <div className="stat-card__value stat-card__value--warning">
            {eg.finalRegret.toFixed(1)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <span className="algo-badge algo-badge--ucb">UCB1</span> Regret
          </div>
          <div className="stat-card__value stat-card__value--accent">
            {ucb.finalRegret.toFixed(1)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <span className="algo-badge algo-badge--epsilon">ε-Greedy</span> Reward
          </div>
          <div className="stat-card__value">{eg.totalReward.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <span className="algo-badge algo-badge--ucb">UCB1</span> Reward
          </div>
          <div className="stat-card__value">{ucb.totalReward.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">UCB Improvement</div>
          <div className="stat-card__value stat-card__value--success">
            {eg.finalRegret > 0
              ? `${(((eg.finalRegret - ucb.finalRegret) / eg.finalRegret) * 100).toFixed(1)}%`
              : 'N/A'}
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats(results.data);
  return (
    <div className="stats-grid fade-in">
      <div className="stat-card">
        <div className="stat-card__label">Algorithm</div>
        <div className="stat-card__value" style={{ fontSize: '1rem' }}>{stats.algorithm}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Total Steps</div>
        <div className="stat-card__value">{stats.totalSteps.toLocaleString()}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Total Reward</div>
        <div className="stat-card__value stat-card__value--success">
          {stats.totalReward.toLocaleString()}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Final Regret</div>
        <div className="stat-card__value stat-card__value--warning">
          {stats.finalRegret.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
