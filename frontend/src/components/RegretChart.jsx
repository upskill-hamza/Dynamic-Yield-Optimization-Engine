import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="custom-tooltip">
      <div className="label">Step {label?.toLocaleString()}</div>
      {payload.map((entry, i) => (
        <div key={i} className="value" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default function RegretChart({ results }) {
  if (!results) return null;

  let chartData = [];

  if (results.type === 'comparison') {
    const eg = results.epsilon_greedy;
    const ucb = results.ucb;
    const len = Math.min(eg.regret.length, ucb.regret.length);

    for (let i = 0; i < len; i++) {
      chartData.push({
        step: (i + 1) * eg.sample_step,
        'ε-Greedy': eg.regret[i],
        'UCB1': ucb.regret[i],
      });
    }

    return (
      <>
        <div className="chart-container__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>Cumulative Regret</span> — Lower is Better
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="step"
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              label={{ value: 'Time Step', position: 'insideBottom', offset: -3, fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Regret', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '0.82rem' }}
            />
            <Line
              type="monotone"
              dataKey="ε-Greedy"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
            <Line
              type="monotone"
              dataKey="UCB1"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  }

  const data = results.data;
  for (let i = 0; i < data.regret.length; i++) {
    chartData.push({
      step: (i + 1) * data.sample_step,
      Regret: data.regret[i],
    });
  }

  return (
    <>
      <div className="chart-container__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>Cumulative Regret</span> — {data.algorithm}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="step"
            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="Regret"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
