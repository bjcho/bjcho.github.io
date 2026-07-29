"use strict";

(() => {
  const canvas = document.querySelector("#game-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  const status = document.querySelector("[data-game-status]");
  const scoreElement = document.querySelector("[data-score]");
  const bestElement = document.querySelector("[data-best]");
  const gridSize = 16;
  const cellSize = canvas.width / gridSize;
  const tickMs = 160;
  const bestKey = "bjcho-snake-best";
  let snake;
  let food;
  let direction;
  let nextDirection;
  let score;
  let best = Number(localStorage.getItem(bestKey)) || 0;
  let timer = null;
  let running = false;
  let paused = false;
  let gameOver = false;
  let touchStart = null;

  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  function resetState() {
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    direction = directions.right;
    nextDirection = direction;
    score = 0;
    paused = false;
    gameOver = false;
    placeFood();
    updateScore();
    draw();
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  }

  function updateScore() {
    scoreElement.textContent = String(score);
    bestElement.textContent = String(best);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(step, tickMs);
  }

  function start() {
    if (gameOver) resetState();
    running = true;
    paused = false;
    setStatus("진행 중 · 방향키, WASD 또는 스와이프");
    startTimer();
  }

  function pause() {
    if (!running || gameOver) return;
    paused = !paused;
    setStatus(paused ? "일시정지" : "진행 중");
  }

  function restart() {
    clearInterval(timer);
    running = false;
    resetState();
    setStatus("준비 완료 · 시작을 누르세요");
  }

  function setDirection(candidate) {
    if (!candidate || (direction.x + candidate.x === 0 && direction.y + candidate.y === 0)) return;
    nextDirection = candidate;
  }

  function step() {
    if (!running || paused || gameOver) return;
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
    if (hitWall || hitSelf) return endGame();

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      if (score > best) {
        best = score;
        localStorage.setItem(bestKey, String(best));
      }
      placeFood();
      updateScore();
    } else {
      snake.pop();
    }
    draw();
  }

  function endGame() {
    gameOver = true;
    running = false;
    clearInterval(timer);
    setStatus("게임 오버 · 재시작을 누르세요");
    draw();
  }

  function draw() {
    context.fillStyle = "#050810";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#8dff9c";
    context.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? "#e6f0ff" : "#5db7ff";
      context.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
  }

  function handleKey(event) {
    const keyMap = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    const key = keyMap[event.key];
    if (!key) return;
    event.preventDefault();
    setDirection(directions[key]);
  }

  canvas.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    setDirection(Math.abs(dx) > Math.abs(dy) ? directions[dx > 0 ? "right" : "left"] : directions[dy > 0 ? "down" : "up"]);
  }, { passive: true });

  document.addEventListener("keydown", handleKey);
  document.querySelectorAll("[data-direction]").forEach((button) => button.addEventListener("click", () => setDirection(directions[button.dataset.direction])));
  document.querySelector('[data-game-action="start"]').addEventListener("click", start);
  document.querySelector('[data-game-action="pause"]').addEventListener("click", pause);
  document.querySelector('[data-game-action="restart"]').addEventListener("click", restart);
  bestElement.textContent = String(best);
  resetState();
  setStatus("준비 완료 · 시작을 누르세요");
})();
