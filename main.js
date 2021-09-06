const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
//
canvas.width = canvas.height = 600
canvas.style.width = '900px'
canvas.style.height = '900px'
canvas.style.border = '3px solid #000000'
//
const CELL_SIZE = 30
const WORLD_WIDTH = Math.floor(canvas.width / CELL_SIZE)
const WORLD_HEIGHT = Math.floor(canvas.height / CELL_SIZE)
const MOVE_INTERVAL = 300
const FOOD_SPAWN_INTERVAL = 1500
//
let input
let snake
let foods
let foodSpawnElapsed
let gameOver
let score
//
function reset () {
  input = {}
  snake = {
    moveElapsed: 0,
    length: 4,
    parts: [{
      x: 0,
      y: 0
    }],
    dir: null,
    newDir: {
      x: 1,
      y: 0
    }
  }

  foods = [
    {
      x: 10,
      y: 0
    }
  ]

  foodSpawnElapsed = 0
  gameOver = false
  score = 0
}

function update (delta) {
  if (gameOver) {
    if (input[' ']) {
      reset()
    }

    return
  }

  if (input.ArrowLeft && snake.dir.x !== 1) {
    snake.newDir = { x: -1, y: 0 }
  } else if (input.ArrowUp && snake.dir.y !== 1) {
    snake.newDir = { x: 0, y: -1 }
  } else if (input.ArrowRight && snake.dir.x !== -1) {
    snake.newDir = { x: 1, y: 0 }
  } else if (input.ArrowDown && snake.dir.y !== -1) {
    snake.newDir = { x: 0, y: 1 }
  }

  snake.moveElapsed += delta

  if (snake.moveElapsed > MOVE_INTERVAL) {
    snake.dir = snake.newDir
    snake.moveElapsed -= MOVE_INTERVAL
    const newSnakePart = {
      x: snake.parts[0].x + snake.dir.x,
      y: snake.parts[0].y + snake.dir.y
    }
    snake.parts.unshift(newSnakePart)

    if (snake.parts.length > snake.length) {
      snake.parts.pop()
    }

    const head = snake.parts[0]
    const foodEatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y)
    if (foodEatenIndex >= 0) {
      snake.length++
      score++
      foods.splice(foodEatenIndex, 1)
    }

    const worldEdgeIntersect = head.x < 0 || head.x >= WORLD_WIDTH || head.y < 0 || head.y >= WORLD_HEIGHT
    if (worldEdgeIntersect) {
      gameOver = true
      return
    }

    const snakePartIntersect = snake.parts.some((part, index) => index !== 0 && head.x === part.x && head.y === part.y)
    if (snakePartIntersect) {
      gameOver = true
      return
    }
  }

  foodSpawnElapsed += delta
  if (foodSpawnElapsed > FOOD_SPAWN_INTERVAL) {
    foodSpawnElapsed -= FOOD_SPAWN_INTERVAL
    foods.push({
      x: Math.floor(Math.random() * WORLD_WIDTH),
      y: Math.floor(Math.random() * WORLD_HEIGHT)
    })
  }
}

function render () {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'black'
  snake.parts.forEach(({ x, y }, index) => {
    if (index === 0) {
      ctx.fillStyle = 'black'
    } else {
      ctx.fillStyle = '#555'
    }
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
  })

  ctx.fillStyle = '#E1B48D '
  foods.forEach(({ x, y }) => {
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
  })

  ctx.fillStyle = '#000000'
  ctx.font = '20px Arial'
  ctx.fillText(`Pontszám: ${score}`, canvas.width / 2, CELL_SIZE / 2)

  if (gameOver) {
    ctx.fillStyle = 'red'
    ctx.font = '60px Arial'
    ctx.fillText('JÁTÉK VÉGE!', canvas.width / 2, canvas.height / 2)

    ctx.fillStyle = 'black'
    ctx.font = '15px Arial'
    ctx.fillText('Nyomj egy SPACE-t az újraindításhoz', canvas.width / 2, canvas.height / 2 + 40)
  }
}
//
let lastLoopTime = Date.now()
function gameLoop () {
  const now = Date.now()
  const delta = now - lastLoopTime
  lastLoopTime = now

  update(delta)
  render()

  window.requestAnimationFrame(gameLoop)
}
reset()
gameLoop()

window.addEventListener('keydown', (event) => {
  input[event.key] = true
})
window.addEventListener('keyup', (event) => {
  input[event.key] = false
})
