# Dynamic Yield Optimization Engine

A full-stack simulation system that models 5 marketing campaigns as bandit arms with unknown conversion rates, and learns to allocate traffic optimally using **Epsilon-Greedy** and **UCB1** algorithms — implemented from scratch.

**Stack:** Python + FastAPI | React + Vite + Recharts

---

## The Problem

You have 5 campaign variants (email subjects, ad creatives, landing pages), each with an unknown conversion rate. Given a limited budget of T interactions, how do you maximize conversions?

- **Exploit** — send traffic to whatever seems best so far. Risk: you might be wrong.
- **Explore** — try other campaigns to learn. Risk: wasting budget on bad ones.

This exploration-exploitation tradeoff is the core of the **Multi-Armed Bandit** problem.

### Regret

Regret quantifies how much worse we did compared to always picking the best arm:

```
Regret(T) = T * p* - total_reward
```

Lower regret = better algorithm.

---

## Algorithms

### Epsilon-Greedy

At each step:
- With probability ε → pick a random arm (explore)
- Otherwise → pick the arm with highest estimated mean (exploit)

Simple but flawed: it explores uniformly (wastes pulls on clearly bad arms) and never stops exploring. Regret grows linearly as O(εT).

### UCB1 (Upper Confidence Bound)

Selection rule:

```
A_t = argmax [ Q(a) + c * sqrt(ln(t) / N(a)) ]
```

Instead of random exploration, UCB1 adds a confidence bonus to each arm's estimate. Arms we're uncertain about get a larger bonus, directing exploration where it matters.

- The bonus shrinks as N(a) grows (we learn the arm's true value)
- ln(t) ensures exploration decays logarithmically
- Regret grows as O(log T) — much better than epsilon-greedy

---

## Project Structure

```
backend/
  bandit.py          # Bandit environment (arms, Bernoulli rewards)
  algorithms.py      # Epsilon-Greedy + UCB1 from scratch
  main.py            # FastAPI endpoints
  requirements.txt

frontend/
  src/
    App.jsx
    index.css
    components/
      ControlsPanel.jsx
      StatsPanel.jsx
      RegretChart.jsx
      ArmCountsChart.jsx
      ArmDetailsTable.jsx
      EmptyState.jsx
```

---

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API at http://localhost:8000, docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard at http://localhost:5173.

### Quick test (no frontend needed)

```bash
cd backend
python algorithms.py
```

---

## API

### POST /simulate

```json
{
  "steps": 10000,
  "epsilon": 0.1,
  "c": 2.0,
  "algorithm": "ucb"
}
```

Returns cumulative regret, rewards, arm counts, estimated values, and true probabilities.

### POST /compare

Same input, runs both algorithms on the same environment. Returns results for both side by side.

### GET /health

Returns `{ "status": "healthy" }`.

---

## Sample Output

```
============================================================
Multi-Armed Bandit Comparison
============================================================

True probabilities: [0.12, 0.35, 0.08, 0.22, 0.45]
Best arm probability: 0.4500

--- Epsilon-Greedy (ε=0.1) ---
  Final regret: 523.71
  Total reward: 3976
  Arm counts: [209, 626, 178, 225, 8762]

--- UCB1 (c=2.0) ---
  Final regret: 189.42
  Total reward: 4311
  Arm counts: [48, 154, 34, 72, 9692]

UCB1 regret improvement: 63.8%
```

UCB1 concentrates ~97% of pulls on the best arm vs ~88% for epsilon-greedy. It identifies the best arm faster through directed exploration and naturally stops exploring bad arms once their confidence bounds drop below the best arm's estimate.

---

## Why UCB1 wins

| | ε-Greedy | UCB1 |
|---|---|---|
| Exploration | Uniform random | Directed at uncertain arms |
| Exploration rate | Fixed forever | Decays automatically |
| Regret | O(εT) linear | O(log T) sublinear |
| Bad arms | Keeps wasting pulls | Abandons quickly |

The key difference: ε-greedy asks "should I explore?" (coin flip). UCB1 asks "what am I most uncertain about?" (informed decision).

---

## License

MIT
