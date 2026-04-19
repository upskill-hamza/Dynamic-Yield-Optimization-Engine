import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const ARM_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#34d399', '#f59e0b'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="custom-tooltip">
      <div className="label">{data.name}</div>
      <div className="value">Selections: {data.count.toLocaleString()}</div>
      <div className="value" style={{ color: '#94a3b8', fontWeight: 400 }}>
        {data.percentage}% of total
      </div>
    </div>
  );
}

export default function ArmCountsChart({ results, algorithm }) {
  if (!results) return null;

  let data;
  let title;

  if (results.type === 'comparison') {
    const result = algorithm === 'ucb' ? results.ucb : results.epsilon_greedy;
    data = result;
    title = algorithm === 'ucb' ? 'UCB1' : 'ε-Greedy';
  } else {
    data = results.data;
    title = data.algorithm;
  }

  if (!data) return null;

  const totalCounts = data.counts.reduce((a, b) => a + b, 0);
  const bestArmIdx = data.true_probabilities.indexOf(Math.max(...data.true_probabilities));

  const chartData = data.arm_names.map((name, i) => ({
    name: name.length > 14 ? name.substring(0, 12) + '…' : name,
    fullName: name,
    count: data.counts[i],
    percentage: ((data.counts[i] / totalCounts) * 100).toFixed(1),
    isBest: i === bestArmIdx,
  }));

  return (
    <>
      <div className="chart-container__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="5" width="4" height="16" rx="1" />
          <rect x="17" y="8" width="4" height="13" rx="1" />
        </svg>
        <span>Arm Selections</span> —{' '}
        {results.type === 'comparison' ? (
          <span className={`algo-badge algo-badge--${algorithm === 'ucb' ? 'ucb' : 'epsilon'}`}>
            {title}
          </span>
        ) : title}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isBest ? '#34d399' : ARM_COLORS[i % ARM_COLORS.length]}
                fillOpacity={entry.isBest ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
