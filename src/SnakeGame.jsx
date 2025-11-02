```jsx
import React, { useEffect, useRef, useState } from 'react'

const CELL = 20
const COLS = 20
const ROWS = 20
const WIDTH = CELL * COLS
const HEIGHT = CELL * ROWS

function randomPos() {
  return [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const dirRef = useRef([1, 0]) // right
  const snakeRef = useRef([[8,10], [7,10], [6,10]])
  const foodRef = useRef(randomPos())
  const tickRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function draw() {
      // background
      ctx.fillStyle = '#0b1223'
      ctx.fillRect(0,0,WIDTH,HEIGHT)

      // draw food
      ctx.fillStyle = '#f39c12'
      ctx.fillRect(foodRef.current[0]*CELL, foodRef.current[1]*CELL, CELL, CELL)

      // draw snake
      ctx.fillStyle = '#2ecc71'
      snakeRef.current.forEach((p, idx) => {
        ctx.fillRect(p[0]*CELL, p[1]*CELL, CELL, CELL)
      })

      // HUD
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px monospace'
      ctx.fillText('Score: ' + score, 8, HEIGHT - 8)
    }

    function step() {
      const dir = dirRef.current
      const snake = snakeRef.current
      const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]]

      // wall wrap (optional) or wall collision -> game over. We'll wrap vertically/horizontally.
      head[0] = (head[0] + COLS) % COLS
      head[1] = (head[1] + ROWS) % ROWS

      // check self collision
      for (let i = 0; i < snake.length; i++) {
        if (snake[i][0] === head[0] && snake[i][1] === head[1]) {
          setRunning(false)
          clearInterval(tickRef.current)
          return
        }
      }

      snake.unshift(head)

      // check food
      if (head[0] === foodRef.current[0] && head[1] === foodRef.current[1]) {
        setScore(s => s + 1)
        // place new food in cell not occupied
        let tries = 0
        while (tries < 1000) {
          const pos = randomPos()
          const taken = snake.some(p => p[0]===pos[0] && p[1]===pos[1])
          if (!taken) { foodRef.current = pos; break }
          tries++
        }
      } else {
        snake.pop()
      }

      draw()
    }

    draw()
    tickRef.current = setInterval(() => { if (running) step() }, 120)

    function handleKey(e) {
      const k = e.key
      const d = dirRef.current
      if (k === 'ArrowUp' && !(d[1] === 1)) dirRef.current = [0,-1]
      if (k === 'ArrowDown' && !(d[1] === -1)) dirRef.current = [0,1]
      if (k === 'ArrowLeft' && !(d[0] === 1)) dirRef.current = [-1,0]
      if (k === 'ArrowRight' && !(d[0] === -1)) dirRef.current = [1,0]
    }

    window.addEventListener('keydown', handleKey)

    // simple touch controls (swipe)
    let startX = 0, startY = 0
    function touchStart(e) { const t = e.touches[0]; startX = t.clientX; startY = t.clientY }
    function touchEnd(e) {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && !(dirRef.current[0]===-1)) dirRef.current = [1,0]
        if (dx < -20 && !(dirRef.current[0]===1)) dirRef.current = [-1,0]
      } else {
        if (dy > 20 && !(dirRef.current[1]===-1)) dirRef.current = [0,1]
        if (dy < -20 && !(dirRef.current[1]===1)) dirRef.current = [0,-1]
      }
    }

    canvas.addEventListener('touchstart', touchStart)
    canvas.addEventListener('touchend', touchEnd)

    return () => {
      clearInterval(tickRef.current)
      window.removeEventListener('keydown', handleKey)
      canvas.removeEventListener('touchstart', touchStart)
      canvas.removeEventListener('touchend', touchEnd)
    }
  }, [running, score])

  function reset() {
    snakeRef.current = [[8,10],[7,10],[6,10]]
    dirRef.current = [1,0]
    foodRef.current = randomPos()
    setScore(0)
    setRunning(true)
    // restart interval by re-rendering; we rely on key in parent to remount if needed
  }

  return (
    <div className="game-wrap">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{touchAction: 'none'}} />
      <div className="controls">
        <div>Score: {score}</div>
        {!running && <div className="gameover">
          <div>Game Over</div>
          <button onClick={reset}>Restart</button>
        </div>}
      </div>
    </div>
  )
}
```
