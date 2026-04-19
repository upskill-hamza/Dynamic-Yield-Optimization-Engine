import random
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from bandit import BanditEnvironment
from algorithms import epsilon_greedy, ucb1

app = FastAPI(
    title="Dynamic Yield Optimization Engine",
    description="Multi-Armed Bandit simulation API for marketing campaign optimization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    steps: int = Field(default=10000, ge=100, le=100000)
    epsilon: float = Field(default=0.1, ge=0.0, le=1.0)
    c: float = Field(default=2.0, ge=0.1, le=10.0)
    algorithm: str = Field(default="ucb")
    seed: Optional[int] = Field(default=None)


class SimulationResponse(BaseModel):
    regret: list
    rewards: list
    counts: list
    estimated_values: list
    true_probabilities: list
    arm_names: list
    algorithm: str
    total_steps: int
    total_reward: float
    final_regret: float
    sample_step: int


class ComparisonResponse(BaseModel):
    epsilon_greedy: dict
    ucb: dict


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Dynamic Yield Optimization Engine"}


@app.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    env = BanditEnvironment.create_fixed()

    if request.seed is not None:
        random.seed(request.seed)

    algorithm = request.algorithm.lower().strip()

    if algorithm == "epsilon":
        result = epsilon_greedy(env, request.steps, request.epsilon)
    elif algorithm == "ucb":
        result = ucb1(env, request.steps, request.c)
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown algorithm '{request.algorithm}'. Use 'epsilon' or 'ucb'."
        )

    return result.to_dict()


@app.post("/compare", response_model=ComparisonResponse)
def compare(request: SimulationRequest):
    env = BanditEnvironment.create_fixed()

    if request.seed is not None:
        random.seed(request.seed)
    eg_result = epsilon_greedy(env, request.steps, request.epsilon)

    if request.seed is not None:
        random.seed(request.seed + 1)
    ucb_result = ucb1(env, request.steps, request.c)

    return {
        "epsilon_greedy": eg_result.to_dict(),
        "ucb": ucb_result.to_dict(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
