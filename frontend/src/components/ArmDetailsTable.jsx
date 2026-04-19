const ARM_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#34d399', '#f59e0b'];

function ArmRow({ name, trueProb, estimatedValue, count, totalCount, isBest, colorIdx }) {
  const accuracy = trueProb > 0
    ? (100 - Math.abs(estimatedValue - trueProb) / trueProb * 100).toFixed(1)
    : '—';
  const pct = ((count / totalCount) * 100).toFixed(1);

  return (
    <tr>
      <td className={`arm-name ${isBest ? 'arm-best' : ''}`}>
        <span className="arm-color-dot" style={{ backgroundColor: ARM_COLORS[colorIdx % ARM_COLORS.length] }} />
        {name} {isBest && '★'}
      </td>
      <td>{trueProb.toFixed(4)}</td>
      <td>{estimatedValue.toFixed(4)}</td>
      <td>{count.toLocaleString()} ({pct}%)</td>
      <td style={{ color: parseFloat(accuracy) > 90 ? '#34d399' : '#f59e0b' }}>
        {accuracy}%
      </td>
    </tr>
  );
}

function AlgorithmTable({ title, data, badgeClass }) {
  if (!data) return null;

  const bestIdx = data.true_probabilities.indexOf(Math.max(...data.true_probabilities));
  const totalCount = data.counts.reduce((a, b) => a + b, 0);

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card__title">
        <svg className="card__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
        </svg>
        Arm Details
        {badgeClass && (
          <span className={`algo-badge ${badgeClass}`} style={{ marginLeft: '0.5rem' }}>
            {title}
          </span>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="arm-table">
          <thead>
            <tr>
              <th>Campaign / Arm</th>
              <th>True Probability</th>
              <th>Estimated Value</th>
              <th>Selections</th>
              <th>Estimation Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {data.arm_names.map((name, i) => (
              <ArmRow
                key={i}
                name={name}
                trueProb={data.true_probabilities[i]}
                estimatedValue={data.estimated_values[i]}
                count={data.counts[i]}
                totalCount={totalCount}
                isBest={i === bestIdx}
                colorIdx={i}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ArmDetailsTable({ results }) {
  if (!results) return null;

  if (results.type === 'comparison') {
    return (
      <>
        <AlgorithmTable
          title="ε-Greedy"
          data={results.epsilon_greedy}
          badgeClass="algo-badge--epsilon"
        />
        <AlgorithmTable
          title="UCB1"
          data={results.ucb}
          badgeClass="algo-badge--ucb"
        />
      </>
    );
  }

  return <AlgorithmTable title={results.data.algorithm} data={results.data} />;
}
