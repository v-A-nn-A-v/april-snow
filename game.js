const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let snowflakes = [];
let snowCoverHeight = 0;
let score = 0;
let level = 1;
let snowSpeed = 1;
let spawnInterval = 2000;
let gameOver = false;
let gameStarted = false;
let lastSpawn = Date.now();

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const soundToggle = document.getElementById("soundToggle");
let soundEnabled = true;

// Load sounds
const captureSound = new Audio("assets/sounds/capture.mp3");
const gameoverSound = new Audio("assets/sounds/gameover.mp3");
const levelupSound = new Audio("assets/sounds/levelup.mp3");
const backgroundSound = new Audio("assets/sounds/background.mp3");
backgroundSound.loop = true;

soundToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled && gameStarted) backgroundSound.play();
  else backgroundSound.pause();
};

// Start game on first click
document.body.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    if (soundEnabled) backgroundSound.play();
    requestAnimationFrame(gameLoop);
  }
}, { once: true });

function drawSnowflake(x, y, size) {
  // Modern style snowflake with shadow (3D effect)
  const gradient = ctx.createRadialGradient(x, y, size * 0.1, x, y, size * 0.5);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "#cceeff");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y);
  for (let i = 1; i < 6; i++) {
    const angle = i * (Math.PI * 2) / 6;
    ctx.lineTo(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "#b0cde0";
  ctx.shadowBlur = 8;
}

function spawnSnowflake() {
  const size = Math.random() * 25 + 15; // Increased range: 15–40
  snowflakes.push({
    x: Math.random() * canvas.width,
    y: -size,
    size,
    speed: snowSpeed + Math.random()
  });
}

function updateSnowflakes(mouseX, mouseY) {
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const flake = snowflakes[i];
    flake.y += flake.speed;

    const dx = flake.x - mouseX;
    const dy = flake.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < flake.size / 2 + 10) {
      snowflakes.splice(i, 1);
      score++;
      scoreDisplay.textContent = `Очки: ${score}`;
      if (soundEnabled) captureSound.play();
    } else if (flake.y > canvas.height - snowCoverHeight) {
      snowflakes.splice(i, 1);
      snowCoverHeight += 5;
    }
  }
}

function drawGradientBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1e3c72"); // top
  gradient.addColorStop(1, "#2a5298"); // bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnowflakes() {
  drawGradientBackground();

  for (const flake of snowflakes) {
    drawSnowflake(flake.x, flake.y, flake.size);
  }

  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, canvas.height - snowCoverHeight, canvas.width, snowCoverHeight);

  if (snowCoverHeight >= canvas.height * 0.5) {
    gameOver = true;
    if (soundEnabled) gameoverSound.play();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px monospace";
    ctx.fillText("Игра окончена", canvas.width / 2 - 150, canvas.height / 2);
  }
}

function showStartPopup() {
  ctx.fillStyle = "rgba(100, 100, 100, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "36px monospace";
  ctx.fillText("Нажми, чтобы начать", canvas.width / 2 - 160, canvas.height / 2);
}

let mouseX = 0;
let mouseY = 0;
canvas.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function gameLoop() {
  if (!gameStarted) {
    showStartPopup();
    return;
  }

  if (gameOver) return;
  const now = Date.now();
  if (now - lastSpawn > spawnInterval) {
    spawnSnowflake();
    lastSpawn = now;
  }

  updateSnowflakes(mouseX, mouseY);
  drawSnowflakes();

  requestAnimationFrame(gameLoop);
}

function levelUp() {
  level++;
  if (soundEnabled) levelupSound.play();
  snowSpeed += 0.5;
  spawnInterval = Math.max(500, spawnInterval - 200);
  levelDisplay.textContent = `Уровень: ${level}`;
}

setInterval(() => {
  if (!gameOver) levelUp();
}, 30000);

drawGradientBackground();
showStartPopup();
