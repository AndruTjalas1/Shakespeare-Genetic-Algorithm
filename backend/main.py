import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from genetic_algorithm import GeneticAlgorithm

# Initialize FastAPI app
app = FastAPI(title="Shakespeare GA API", version="1.0.0")

# CORS - Allow everything
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class InitializeRequest(BaseModel):
    target: str
    population_size: int = 200
    mutation_rate: float = 0.01
    crossover_rate: float = 0.8
    elitism_count: int = 2


class EvolveRequest(BaseModel):
    generations: int = 1


class PopulationResponse(BaseModel):
    genes: str
    fitness: float


class StatisticsResponse(BaseModel):
    generation: int
    best_fitness: float
    avg_fitness: float
    worst_fitness: float


class BestResponse(BaseModel):
    genes: str
    fitness: float
    found: bool


class HistoryEntry(BaseModel):
    generation: int
    best_fitness: float
    avg_fitness: float


# Global GA instance
current_ga: Optional[GeneticAlgorithm] = None


@app.get("/")
def read_root():
    """Root endpoint - API is running."""
    return {
        "message": "Shakespeare Genetic Algorithm API",
        "version": "1.0.0",
        "endpoints": [
            "/initialize",
            "/evolve",
            "/population",
            "/statistics",
            "/best",
            "/history",
            "/is-complete",
        ],
    }


@app.post("/initialize")
def initialize(request: InitializeRequest):
    """
    Initialize the genetic algorithm with a target phrase.

    Args:
        target: Target phrase to evolve toward
        population_size: Size of population
        mutation_rate: Mutation probability
        crossover_rate: Crossover probability
        elitism_count: Number of elite individuals to preserve

    Returns:
        Confirmation and initial statistics
    """
    global current_ga

    current_ga = GeneticAlgorithm(
        population_size=request.population_size,
        mutation_rate=request.mutation_rate,
        crossover_rate=request.crossover_rate,
        elitism_count=request.elitism_count,
    )

    current_ga.initialize(request.target)

    return {
        "status": "initialized",
        "target": request.target,
        "population_size": request.population_size,
        "mutation_rate": request.mutation_rate,
        "initial_population": current_ga.get_top_individuals(5),
    }


@app.post("/evolve")
def evolve(request: EvolveRequest = EvolveRequest()):
    """
    Run one or more generations of evolution.

    Args:
        generations: Number of generations to evolve (default: 1)

    Returns:
        Statistics after evolution
    """
    if current_ga is None:
        return {"error": "GA not initialized. Call /initialize first."}, 400

    for _ in range(request.generations):
        current_ga.evolve()

    stats = current_ga.get_statistics()
    return {
        "status": "evolved",
        "statistics": stats,
        "top_individuals": current_ga.get_top_individuals(10),
        "is_complete": current_ga.is_complete(),
    }


@app.get("/population")
def get_population(count: int = 50):
    """
    Get current population.

    Args:
        count: Number of top individuals to return

    Returns:
        Top individuals from current population
    """
    if current_ga is None:
        return {"error": "GA not initialized"}, 400

    return {
        "generation": current_ga.generation,
        "population": current_ga.get_top_individuals(count),
    }


@app.get("/statistics")
def get_statistics() -> StatisticsResponse:
    """Get current generation statistics."""
    if current_ga is None:
        return {"error": "GA not initialized"}, 400

    return current_ga.get_statistics()


@app.get("/best")
def get_best() -> BestResponse:
    """Get the best individual ever found."""
    if current_ga is None:
        return {"error": "GA not initialized"}, 400

    best = current_ga.get_best()
    return {
        "genes": best["genes"] if best else "",
        "fitness": best["fitness"] if best else 0,
        "found": current_ga.is_complete(),
    }


@app.get("/history")
def get_history() -> List[HistoryEntry]:
    """Get generation history."""
    if current_ga is None:
        return {"error": "GA not initialized"}, 400

    return current_ga.get_history()


@app.get("/is-complete")
def is_complete():
    """Check if the algorithm has found the target."""
    if current_ga is None:
        return {"error": "GA not initialized"}, 400

    return {"is_complete": current_ga.is_complete(), "generation": current_ga.generation}


@app.post("/reset")
def reset():
    """Reset the genetic algorithm."""
    global current_ga
    current_ga = None
    return {"status": "reset"}


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    import os
    import sys

    try:
        port = int(os.getenv("PORT", 8000))
        print(f"Starting server on port {port}", file=sys.stderr)
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
