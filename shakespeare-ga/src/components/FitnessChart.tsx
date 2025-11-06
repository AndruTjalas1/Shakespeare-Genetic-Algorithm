import React, { useEffect, useRef } from 'react'
import '../styles/FitnessChart.css'

interface DataPoint {
  generation: number
  best_fitness: number
  avg_fitness: number
}

interface FitnessChartProps {
  data: DataPoint[]
  generation: number
}

const FitnessChart: React.FC<FitnessChartProps> = ({ data, generation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const y = padding + (height - 2 * padding) * (i / 10)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = '#666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${100 - i * 10}%`, padding - 10, y + 4)
    }

    // X-axis
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw data
    const maxGen = Math.max(1, Math.max(...data.map((d) => d.generation)))
    const xScale = (width - 2 * padding) / (maxGen || 1)
    const yScale = height - 2 * padding

    // Draw best fitness line
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 2
    ctx.beginPath()
    let started = false
    data.forEach((point, i) => {
      const x = padding + (point.generation / maxGen) * (width - 2 * padding)
      const y = height - padding - point.best_fitness * yScale
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw average fitness line
    ctx.strokeStyle = '#2196F3'
    ctx.lineWidth = 2
    ctx.beginPath()
    started = false
    data.forEach((point) => {
      const x = padding + (point.generation / maxGen) * (width - 2 * padding)
      const y = height - padding - point.avg_fitness * yScale
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw legend
    ctx.fillStyle = '#4CAF50'
    ctx.fillRect(width - 250, 20, 15, 15)
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Best Fitness', width - 230, 32)

    ctx.fillStyle = '#2196F3'
    ctx.fillRect(width - 250, 45, 15, 15)
    ctx.fillStyle = '#333'
    ctx.fillText('Average Fitness', width - 230, 57)

    // X-axis labels
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * (width - 2 * padding)
      const genNum = Math.floor((i / 5) * maxGen)
      ctx.fillText(genNum.toString(), x, height - padding + 20)
    }

    // Title
    ctx.fillStyle = '#333'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Fitness Progress', width / 2, 20)
  }, [data])

  return (
    <div className="fitness-chart">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
      />
      {data.length === 0 && (
        <div className="placeholder">Initialize and start evolution to see chart</div>
      )}
    </div>
  )
}

export default FitnessChart
