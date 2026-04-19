import random
from dataclasses import dataclass, field
from typing import List


@dataclass
class Arm:
    true_probability: float
    name: str

    def pull(self) -> int:
        return 1 if random.random() < self.true_probability else 0


@dataclass
class BanditEnvironment:
    arms: List[Arm] = field(default_factory=list)
    best_arm_prob: float = 0.0

    def __post_init__(self):
        if self.arms:
            self.best_arm_prob = max(arm.true_probability for arm in self.arms)

    @classmethod
    def create_random(cls, n_arms: int = 5, seed: int = None) -> "BanditEnvironment":
        if seed is not None:
            random.seed(seed)

        campaign_names = [
            "Email Blast A",
            "Social Media Ad B",
            "Search Campaign C",
            "Display Banner D",
            "Influencer Promo E",
        ]

        arms = []
        for i in range(n_arms):
            prob = round(random.uniform(0.05, 0.5), 4)
            name = campaign_names[i] if i < len(campaign_names) else f"Campaign {i+1}"
            arms.append(Arm(true_probability=prob, name=name))

        return cls(arms=arms)

    @classmethod
    def create_fixed(cls) -> "BanditEnvironment":
        fixed_probs = [0.12, 0.35, 0.08, 0.22, 0.45]
        campaign_names = [
            "Email Blast A",
            "Social Media Ad B",
            "Search Campaign C",
            "Display Banner D",
            "Influencer Promo E",
        ]

        arms = [
            Arm(true_probability=p, name=name)
            for p, name in zip(fixed_probs, campaign_names)
        ]
        return cls(arms=arms)

    def pull_arm(self, arm_index: int) -> int:
        return self.arms[arm_index].pull()

    @property
    def n_arms(self) -> int:
        return len(self.arms)

    def get_true_probabilities(self) -> List[float]:
        return [arm.true_probability for arm in self.arms]

    def get_arm_names(self) -> List[str]:
        return [arm.name for arm in self.arms]
