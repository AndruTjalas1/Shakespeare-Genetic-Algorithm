import random
from typing import List, Tuple, Optional
from individual import Individual


class GeneticAlgorithm:
    """Core genetic algorithm implementation for text evolution."""

    def __init__(
        self,
        population_size: int = 200,
        mutation_rate: float = 0.01,
        crossover_rate: float = 0.8,
        elitism_count: int = 2,
        tournament_size: int = 5,
        charset: str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ",
    ):
        """
        Initialize the genetic algorithm.

        Args:
            population_size: Size of population each generation
            mutation_rate: Probability of gene mutation (0-1)
            crossover_rate: Probability of crossover (0-1)
            elitism_count: Number of best individuals to preserve
            tournament_size: Size of tournament for selection
            charset: Available characters for genes
        """
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elitism_count = elitism_count
        self.tournament_size = tournament_size
        self.charset = charset

        self.population: List[Individual] = []
        self.generation = 0
        self.target = ""
        self.best_ever: Optional[Individual] = None
        self.generation_history: List[dict] = []

    def initialize(self, target: str) -> None:
        """
        Initialize population with random individuals.

        Args:
            target: Target phrase to evolve toward
        """
        self.target = target
        self.generation = 0
        self.generation_history = []
        self.best_ever = None

        self.population = [
            Individual.create_random(len(target), self.charset)
            for _ in range(self.population_size)
        ]

    def evolve(self) -> None:
        """Execute one generation of evolution."""
        if not self.target:
            raise ValueError("Algorithm not initialized. Call initialize() first.")

        # Calculate fitness for all individuals
        for individual in self.population:
            individual.calculate_fitness(self.target)

        # Sort by fitness (best first)
        self.population.sort(key=lambda x: x.fitness, reverse=True)

        # Update best ever
        if self.best_ever is None or self.population[0].fitness > self.best_ever.fitness:
            best_individual = self.population[0]
            self.best_ever = Individual(best_individual.genes, best_individual.fitness)

        # Record statistics
        best_fitness = self.population[0].fitness
        avg_fitness = sum(ind.fitness for ind in self.population) / len(self.population)

        self.generation_history.append(
            {
                "generation": self.generation,
                "best_fitness": round(best_fitness, 4),
                "avg_fitness": round(avg_fitness, 4),
            }
        )

        # Create new population
        new_population: List[Individual] = []

        # Elitism: preserve best individuals
        for i in range(min(self.elitism_count, len(self.population))):
            new_population.append(
                Individual(self.population[i].genes, self.population[i].fitness)
            )

        # Generate offspring
        while len(new_population) < self.population_size:
            if random.random() < self.crossover_rate:
                # Crossover
                parent1 = self._select_parent()
                parent2 = self._select_parent()
                child = self._crossover(parent1, parent2)
            else:
                # Just mutate a selected parent
                parent = self._select_parent()
                child = Individual(parent.genes)

            # Mutate
            child = child.mutate(self.mutation_rate, self.charset)
            new_population.append(child)

        self.population = new_population
        self.generation += 1

    def _select_parent(self) -> Individual:
        """
        Select a parent using tournament selection.

        Returns:
            Selected Individual
        """
        tournament = random.sample(
            self.population, min(self.tournament_size, len(self.population))
        )
        return max(tournament, key=lambda x: x.fitness)

    def _crossover(self, parent1: Individual, parent2: Individual) -> Individual:
        """
        Perform single-point crossover.

        Args:
            parent1: First parent
            parent2: Second parent

        Returns:
            Child Individual
        """
        crossover_point = random.randint(0, len(parent1.genes) - 1)
        child_genes = (
            parent1.genes[:crossover_point] + parent2.genes[crossover_point:]
        )
        return Individual(child_genes)

    def get_population(self) -> List[dict]:
        """Get current population as list of dictionaries."""
        return [ind.to_dict() for ind in self.population]

    def get_best(self) -> dict:
        """Get best individual ever found."""
        if self.best_ever:
            return self.best_ever.to_dict()
        return None

    def get_top_individuals(self, count: int = 10) -> List[dict]:
        """Get top N individuals from current population."""
        sorted_pop = sorted(self.population, key=lambda x: x.fitness, reverse=True)
        return [ind.to_dict() for ind in sorted_pop[:count]]

    def get_statistics(self) -> dict:
        """Get current generation statistics."""
        if not self.population:
            return {}

        fitnesses = [ind.fitness for ind in self.population]
        return {
            "generation": self.generation,
            "best_fitness": round(max(fitnesses), 4),
            "avg_fitness": round(sum(fitnesses) / len(fitnesses), 4),
            "worst_fitness": round(min(fitnesses), 4),
        }

    def get_history(self) -> List[dict]:
        """Get generation history."""
        return self.generation_history

    def is_complete(self) -> bool:
        """Check if target has been found."""
        if self.best_ever:
            return self.best_ever.fitness >= 0.99  # Use tolerance for floating point
        return False
