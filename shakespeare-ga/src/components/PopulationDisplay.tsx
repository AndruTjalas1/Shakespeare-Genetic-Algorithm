import React from 'react'
import '../styles/PopulationDisplay.css'
import { Individual } from '../services/api'

interface PopulationDisplayProps {
  population: Individual[]
  target: string
  generation: number
  bestEver: Individual | null
  averageFitness: number
  isComplete: boolean
}

const PopulationDisplay: React.FC<PopulationDisplayProps> = ({
  population,
  target,
  generation,
  bestEver,
  averageFitness,
  isComplete,
}) => {
  const highlightDifferences = (individual: string) => {
    return individual.split('').map((char, i) => ({
      char,
      match: char === target[i],
    }))
  }

  return (
    <div className="population-display">
      <div className="header-stats">
        <div className="stat">
          <span className="label">Generation:</span>
          <span className="value">{generation}</span>
        </div>
        <div className="stat">
          <span className="label">Average Fitness:</span>
          <span className="value">{(averageFitness * 100).toFixed(1)}%</span>
        </div>
      </div>

      {bestEver && (
        <div className="best-ever">
          <h3>🏆 Best Ever Found</h3>
          <div className="individual best">
            <div className="genes">
              {highlightDifferences(bestEver.genes).map((item, i) => (
                <span
                  key={i}
                  className={`char ${item.match ? 'match' : 'mismatch'}`}
                  title={item.match ? '✓' : `${target[i]}`}
                >
                  {item.char}
                </span>
              ))}
            </div>
            <div className="fitness">{(bestEver.fitness * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="target-phrase">
        <h3>🎯 Target Phrase</h3>
        <div className="phrase">{target}</div>
      </div>

      <div className="population-list">
        <h3>📊 Top 20 Individuals</h3>
        <div className="individuals">
          {population.slice(0, 20).map((individual, index) => (
            <div key={index} className={`individual ${index === 0 ? 'best' : ''}`}>
              <div className="rank">{index + 1}</div>
              <div className="genes">
                {highlightDifferences(individual.genes).map((item, i) => (
                  <span
                    key={i}
                    className={`char ${item.match ? 'match' : 'mismatch'}`}
                  >
                    {item.char}
                  </span>
                ))}
              </div>
              <div className="fitness">{(individual.fitness * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {isComplete && (
        <div className="completion-banner">
          <h2>🎉 Evolution Complete!</h2>
          <p>Successfully evolved to target phrase in {generation} generations</p>
        </div>
      )}
    </div>
  )
}

export default PopulationDisplay
