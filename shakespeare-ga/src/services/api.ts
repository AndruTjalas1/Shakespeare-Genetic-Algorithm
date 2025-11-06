import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface InitializePayload {
  target: string
  population_size?: number
  mutation_rate?: number
  crossover_rate?: number
  elitism_count?: number
}

export interface EvolvePayload {
  generations?: number
}

export interface Individual {
  genes: string
  fitness: number
}

export interface Statistics {
  generation: number
  best_fitness: number
  avg_fitness: number
  worst_fitness: number
}

export interface HistoryEntry {
  generation: number
  best_fitness: number
  avg_fitness: number
}

export const gaAPI = {
  initialize: (payload: InitializePayload) =>
    api.post('/initialize', payload),
  
  evolve: (payload?: EvolvePayload) =>
    api.post('/evolve', payload || { generations: 1 }),
  
  getPopulation: (count?: number) =>
    api.get('/population', { params: { count: count || 50 } }),
  
  getStatistics: () =>
    api.get('/statistics'),
  
  getBest: () =>
    api.get('/best'),
  
  getHistory: () =>
    api.get('/history'),
  
  isComplete: () =>
    api.get('/is-complete'),
  
  reset: () =>
    api.post('/reset'),
  
  healthCheck: () =>
    api.get('/health'),
}

export default api
