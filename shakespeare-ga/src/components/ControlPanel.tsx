import React, { useState } from 'react'
import '../styles/ControlPanel.css'

interface ControlPanelProps {
  onStart: (target: string, config: GAConfig) => void
  onStop: () => void
  onReset: () => void
  isRunning: boolean
  isComplete: boolean
}

export interface GAConfig {
  population_size: number
  mutation_rate: number
  crossover_rate: number
  elitism_count: number
}

const SHAKESPEARE_QUOTES = [
  'TO BE OR NOT TO BE',
  'ALL THE WORLDS A STAGE',
  'WHAT IS IN A NAME',
  'LOVE ALL TRUST A FEW',
  'BREVITY IS THE SOUL OF WIT',
]

const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  onStop,
  onReset,
  isRunning,
  isComplete,
}) => {
  const [targetPhrase, setTargetPhrase] = useState('TO BE OR NOT TO BE')
  const [useCustom, setUseCustom] = useState(false)
  const [customPhrase, setCustomPhrase] = useState('')
  const [populationSize, setPopulationSize] = useState(200)
  const [mutationRate, setMutationRate] = useState(0.01)
  const [crossoverRate, setCrossoverRate] = useState(0.8)
  const [elitismCount, setElitismCount] = useState(2)

  const handleStart = () => {
    const target = useCustom ? customPhrase.toUpperCase() : targetPhrase
    if (!target.trim()) {
      alert('Please enter a target phrase')
      return
    }
    
    onStart(target, {
      population_size: populationSize,
      mutation_rate: mutationRate,
      crossover_rate: crossoverRate,
      elitism_count: elitismCount,
    })
  }

  return (
    <div className="control-panel">
      <h2>🎭 Evolution Configuration</h2>

      <div className="section">
        <label>
          <input
            type="radio"
            checked={!useCustom}
            onChange={() => setUseCustom(false)}
          />
          Use Shakespeare Quote
        </label>
        {!useCustom && (
          <select
            value={targetPhrase}
            onChange={(e) => setTargetPhrase(e.target.value)}
            disabled={isRunning}
          >
            {SHAKESPEARE_QUOTES.map((quote) => (
              <option key={quote} value={quote}>
                {quote}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="section">
        <label>
          <input
            type="radio"
            checked={useCustom}
            onChange={() => setUseCustom(true)}
          />
          Custom Phrase
        </label>
        {useCustom && (
          <input
            type="text"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            placeholder="Enter your phrase..."
            disabled={isRunning}
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
          />
        )}
      </div>

      <div className="parameters">
        <div className="parameter">
          <label>
            Population Size: <strong>{populationSize}</strong>
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={populationSize}
            onChange={(e) => setPopulationSize(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className="parameter">
          <label>
            Mutation Rate: <strong>{mutationRate.toFixed(3)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={mutationRate}
            onChange={(e) => setMutationRate(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className="parameter">
          <label>
            Crossover Rate: <strong>{crossoverRate.toFixed(3)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={crossoverRate}
            onChange={(e) => setCrossoverRate(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className="parameter">
          <label>
            Elitism Count: <strong>{elitismCount}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={elitismCount}
            onChange={(e) => setElitismCount(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="buttons">
        {!isRunning ? (
          <button onClick={handleStart} className="btn btn-primary">
            🚀 Start Evolution
          </button>
        ) : (
          <button onClick={onStop} className="btn btn-danger">
            ⏹️ Stop Evolution
          </button>
        )}
        <button
          onClick={onReset}
          className="btn btn-secondary"
          disabled={isRunning}
        >
          🔄 Reset
        </button>
      </div>

      {isComplete && (
        <div className="success-message">
          ✅ Target found! Evolution complete.
        </div>
      )}

      <div className="phrase-info">
        <p><strong>Target:</strong> {useCustom ? customPhrase.toUpperCase() : targetPhrase}</p>
        <p><strong>Length:</strong> {(useCustom ? customPhrase : targetPhrase).length} characters</p>
      </div>
    </div>
  )
}

export default ControlPanel
