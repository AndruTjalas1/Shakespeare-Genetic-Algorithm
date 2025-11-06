import random
from typing import Optional


class Individual:
    """Represents a candidate solution (chromosome) in the genetic algorithm."""

    def __init__(self, genes: str, fitness: float = 0.0):
        """
        Initialize an Individual.

        Args:
            genes: String representation of the chromosome
            fitness: Fitness score (0-1)
        """
        self.genes = genes
        self.fitness = fitness

    @staticmethod
    def create_random(length: int, charset: str) -> "Individual":
        """
        Create a random individual.

        Args:
            length: Length of the chromosome
            charset: Available characters for the chromosome

        Returns:
            A new Individual with random genes
        """
        genes = "".join(random.choice(charset) for _ in range(length))
        return Individual(genes)

    def calculate_fitness(self, target: str) -> None:
        """
        Calculate fitness as percentage of matching characters.

        Args:
            target: Target phrase to match
        """
        if len(self.genes) != len(target):
            self.fitness = 0.0
            return

        matches = sum(1 for i in range(len(target)) if self.genes[i] == target[i])
        self.fitness = matches / len(target)

    def mutate(self, mutation_rate: float, charset: str) -> "Individual":
        """
        Create a mutated copy of this individual.

        Args:
            mutation_rate: Probability (0-1) of each gene mutating
            charset: Available characters for mutation

        Returns:
            A new Individual with mutations applied
        """
        mutated_genes = ""
        for char in self.genes:
            if random.random() < mutation_rate:
                mutated_genes += random.choice(charset)
            else:
                mutated_genes += char
        return Individual(mutated_genes)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {"genes": self.genes, "fitness": round(self.fitness, 4)}

    def __repr__(self) -> str:
        return f"Individual(genes='{self.genes}', fitness={self.fitness:.4f})"
