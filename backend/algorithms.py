import math
import random
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Any

from bandit import BanditEnvironment


@dataclass
class SimulationResult:
    cumulative_regret: List[float] = field(default_factory=list)
    cumulative_rewards: List[float] = field(default_factory=list)
    arm_counts: List[int] = field(default_factory=list)
    estimated_values: List[float] = field(default_factory=list)
    true_probabilities: List[float] = field(default_factory=list)
    arm_names: List[str] = field(default_factory=list)
    algorithm: str = ""

    def to_dict(self) -> Dict[str, Any]:
        # downsample for large runs so the response stays manageable
        step = max(1, len(self.cumulative_regret) // 500)
        return {
            "regret": [round(r, 4) for r in self.cumulative_regret[::step]],
            "rewards": [round(r, 4) for r in self.cumulative_rewards[::step]],
            "counts": self.arm_counts,
            "estimated_values": [round(v, 6) for v in self.estimated_values],
            "true_probabilities": [round(p, 4) for p in self.true_probabilities],
            "arm_names": self.arm_names,
            "algorithm": self.algorithm,
            "total_steps": len(self.cumulative_regret),
            "total_reward": round(self.cumulative_rewards[-1], 4) if self.cumulative_rewards else 0,
            "final_regret": round(self.cumulative_regret[-1], 4) if self.cumulative_regret else 0,
            "sample_step": step,
        }


def epsilon_greedy(env: BanditEnvironment, steps: int, epsilon: float = 0.1) -> SimulationResult:
    n_arms = env.n_arms
    best_prob = env.best_arm_prob

    q_values = [0.0] * n_arms
    n_counts = [0] * n_arms

    cumulative_regret = []
    cumulative_rewards = []
    total_reward = 0.0

    for t in range(1, steps + 1):
        if random.random() < epsilon:
            chosen_arm = random.randint(0, n_arms - 1)
        else:
            max_q = max(q_values)
            best_arms = [a for a in range(n_arms) if q_values[a] == max_q]
            chosen_arm = random.choice(best_arms)

        reward = env.pull_arm(chosen_arm)

        n_counts[chosen_arm] += 1
        # incremental mean update
        q_values[chosen_arm] += (reward - q_values[chosen_arm]) / n_counts[chosen_arm]

        total_reward += reward
        cumulative_rewards.append(total_reward)
        cumulative_regret.append(t * best_prob - total_reward)

    return SimulationResult(
        cumulative_regret=cumulative_regret,
        cumulative_rewards=cumulative_rewards,
        arm_counts=n_counts,
        estimated_values=q_values,
        true_probabilities=env.get_true_probabilities(),
        arm_names=env.get_arm_names(),
        algorithm=f"Epsilon-Greedy (e={epsilon})",
    )


def ucb1(env: BanditEnvironment, steps: int, c: float = 2.0) -> SimulationResult:
    n_arms = env.n_arms
    best_prob = env.best_arm_prob

    q_values = [0.0] * n_arms
    n_counts = [0] * n_arms

    cumulative_regret = []
    cumulative_rewards = []
    total_reward = 0.0

    for t in range(1, steps + 1):
        # pull each arm once first to avoid division by zero
        if t <= n_arms:
            chosen_arm = t - 1
        else:
            ucb_values = []
            for a in range(n_arms):
                exploitation = q_values[a]
                exploration = c * math.sqrt(math.log(t) / n_counts[a])
                ucb_values.append(exploitation + exploration)
            chosen_arm = ucb_values.index(max(ucb_values))

        reward = env.pull_arm(chosen_arm)

        n_counts[chosen_arm] += 1
        q_values[chosen_arm] += (reward - q_values[chosen_arm]) / n_counts[chosen_arm]

        total_reward += reward
        cumulative_rewards.append(total_reward)
        cumulative_regret.append(t * best_prob - total_reward)

    return SimulationResult(
        cumulative_regret=cumulative_regret,
        cumulative_rewards=cumulative_rewards,
        arm_counts=n_counts,
        estimated_values=q_values,
        true_probabilities=env.get_true_probabilities(),
        arm_names=env.get_arm_names(),
        algorithm=f"UCB1 (c={c})",
    )


def run_comparison(
    steps: int = 10000,
    epsilon: float = 0.1,
    c: float = 2.0,
    seed: int = None,
) -> Tuple[SimulationResult, SimulationResult]:
    env = BanditEnvironment.create_fixed()

    if seed is not None:
        random.seed(seed)
    eg_result = epsilon_greedy(env, steps, epsilon)

    if seed is not None:
        random.seed(seed + 1)
    ucb_result = ucb1(env, steps, c)

    return eg_result, ucb_result


if __name__ == "__main__":
    print("=" * 60)
    print("Multi-Armed Bandit Comparison")
    print("=" * 60)

    eg, ucb = run_comparison(steps=10000, seed=42)

    print(f"\nTrue probabilities: {eg.true_probabilities}")
    print(f"Best arm probability: {max(eg.true_probabilities):.4f}")

    print(f"\n--- {eg.algorithm} ---")
    print(f"  Final regret: {eg.cumulative_regret[-1]:.2f}")
    print(f"  Total reward: {eg.cumulative_rewards[-1]:.0f}")
    print(f"  Arm counts: {eg.arm_counts}")
    print(f"  Estimated Q: {[round(v, 4) for v in eg.estimated_values]}")

    print(f"\n--- {ucb.algorithm} ---")
    print(f"  Final regret: {ucb.cumulative_regret[-1]:.2f}")
    print(f"  Total reward: {ucb.cumulative_rewards[-1]:.0f}")
    print(f"  Arm counts: {ucb.arm_counts}")
    print(f"  Estimated Q: {[round(v, 4) for v in ucb.estimated_values]}")

    print(f"\nUCB1 regret improvement: "
          f"{((eg.cumulative_regret[-1] - ucb.cumulative_regret[-1]) / eg.cumulative_regret[-1] * 100):.1f}%")
