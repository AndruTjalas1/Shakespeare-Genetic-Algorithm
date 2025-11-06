import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import ControlPanel, { GAConfig } from './components/ControlPanel'
import PopulationDisplay from './components/PopulationDisplay'
import FitnessChart from './components/FitnessChart'
import { gaAPI, Individual, HistoryEntry } from './services/api'

interface AppState {
  isInitialized: boolean
  isRunning: boolean
  generation: number
  target: string
  population: Individual[]
  bestEver: Individual | null
  averageFitness: number
  isComplete: boolean
  history: HistoryEntry[]
  error: string | null
}

function App() {
  const [state, setState] = useState<AppState>({
    isInitialized: false,
    isRunning: false,
    generation: 0,
    target: '',
    population: [],
    bestEver: null,
    averageFitness: 0,
    isComplete: false,
    history: [],
    error: null,
  })

  const evolutionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check API health on mount
  useEffect(() => {
    gaAPI
      .healthCheck()
      .then(() => {
        console.log('API is healthy')
      })
      .catch((error) => {
        console.error('API health check failed:', error)
        setState((prev) => ({
          ...prev,
          error: 'Cannot connect to API. Make sure the backend is running on http://localhost:8000',
        }))
      })

    return () => {
      if (evolutionIntervalRef.current) {
        clearInterval(evolutionIntervalRef.current)
      }
    }
  }, [])

  const handleStart = async (target: string, config: GAConfig) => {
    try {
      setState((prev) => ({ ...prev, error: null }))

      // Initialize GA
      const initResponse = await gaAPI.initialize({
        target,
        population_size: config.population_size,
        mutation_rate: config.mutation_rate,
        crossover_rate: config.crossover_rate,
        elitism_count: config.elitism_count,
      })

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isRunning: true,
        target,
        generation: 0,
        population: initResponse.data.initial_population,
      }))

      // Start evolution loop
      evolutionIntervalRef.current = setInterval(() => {
        evolveGeneration()
      }, 100)
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to initialize GA',
      }))
    }
  }

  const evolveGeneration = async () => {
    try {
      const evolveResponse = await gaAPI.evolve({ generations: 1 })

      const population = evolveResponse.data.top_individuals
      const stats = evolveResponse.data.statistics
      const isComplete = evolveResponse.data.is_complete

      // Get history
      const historyResponse = await gaAPI.getHistory()
      const history = historyResponse.data

      // Get best ever
      const bestResponse = await gaAPI.getBest()
      const bestEver = bestResponse.data

      setState((prev) => ({
        ...prev,
        population,
        generation: stats.generation,
        averageFitness: stats.avg_fitness,
        bestEver,
        isComplete,
        history,
      }))

      // IMPORTANT: Check and stop immediately if complete
      if (isComplete) {
        console.log('Evolution complete! Stopping...')
        if (evolutionIntervalRef.current) {
          clearInterval(evolutionIntervalRef.current)
          evolutionIntervalRef.current = null
        }
        setState((prev) => ({ ...prev, isRunning: false }))
      }
    } catch (error: any) {
      console.error('Evolution error:', error)
      if (evolutionIntervalRef.current) {
        clearInterval(evolutionIntervalRef.current)
        evolutionIntervalRef.current = null
      }
      setState((prev) => ({ ...prev, isRunning: false }))
    }
  }

  const stopEvolution = () => {
    if (evolutionIntervalRef.current) {
      clearInterval(evolutionIntervalRef.current)
      evolutionIntervalRef.current = null
    }
    setState((prev) => ({ ...prev, isRunning: false }))
  }

  const handleReset = async () => {
    try {
      stopEvolution()
      await gaAPI.reset()
      setState({
        isInitialized: false,
        isRunning: false,
        generation: 0,
        target: '',
        population: [],
        bestEver: null,
        averageFitness: 0,
        isComplete: false,
        history: [],
        error: null,
      })
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to reset',
      }))
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎭 Shakespeare Genetic Algorithm</h1>
        <p>Evolving random text into Shakespeare quotes using evolutionary computation</p>
      </header>

      {state.error && (
        <div className="error-banner">
          <p>❌ {state.error}</p>
        </div>
      )}

      <div className="container">
        <div className="left-panel">
          <ControlPanel
            onStart={handleStart}
            onStop={stopEvolution}
            onReset={handleReset}
            isRunning={state.isRunning}
            isComplete={state.isComplete}
          />
        </div>

        <div className="right-panel">
          {!state.isInitialized ? (
            <div className="welcome-section">
              <h2>Welcome to Shakespeare GA! 🎬</h2>
              <p>This application uses genetic algorithms to evolve random text into Shakespeare quotes.</p>
              <ul>
                <li>🧬 <strong>Genetic Algorithms</strong> mimic natural evolution</li>
                <li>🎯 <strong>Fitness Function</strong> measures how close we are to the target</li>
                <li>🔄 <strong>Selection</strong> favors better solutions</li>
                <li>🧩 <strong>Crossover & Mutation</strong> create genetic diversity</li>
              </ul>
              <p>Configure parameters on the left and click "Start Evolution" to begin!</p>
            </div>
          ) : (
            <>
              <PopulationDisplay
                population={state.population}
                target={state.target}
                generation={state.generation}
                bestEver={state.bestEver}
                averageFitness={state.averageFitness}
                isComplete={state.isComplete}
              />
              <FitnessChart data={state.history} generation={state.generation} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
