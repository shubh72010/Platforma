const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const jumpBtn = document.getElementById('jumpBtn');
const winMessage = document.getElementById('winMessage');

let canvasWidth, canvasHeight;

function resize() {
  const windowRatio = window.innerWidth / window.innerHeight;
  const gameRatio = 16 / 9;

  if (windowRatio > gameRatio) {
    canvasHeight = window.innerHeight;
    canvasWidth = canvasHeight * gameRatio;
  } else {
    canvasWidth = window.innerWidth;
    canvasHeight = canvasWidth / gameRatio;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}
resize();
window.addEventListener('resize', resize);

const gravity = 0.8;
const friction = 0.8;

class Player {
  constructor() {
    this.width = 40 * (canvasWidth / 800);
    this.height = 60 * (canvasHeight / 450);
    this.x = 50 * (canvasWidth / 800);
    this.y = canvasHeight - this.height - 10 * (canvasHeight / 450);
    this.velX = 0;
    this.velY = 0;
    this.speed = 5 * (canvasWidth / 800);
    this.jumping = false;
    this.grounded = false;
    this.step = 0; // for animation timing
  }

  update() {
    if (keys['left']) {
      if (this.velX > -this.speed) this.velX -= 1;
      this.step += 0.2; // increment animation step when moving
    } else {
      this.velX *= friction;
      if (this.step > 0) this.step -= 0.1; // slow down animation swing
      if (this.step < 0) this.step = 0;
    }

    if (keys['jump']) {
      if (!this.jumping && this.grounded) {
        this.jumping = true;
        this.grounded = false;
        this.velY = -15 * (canvasHeight / 450);
      }
    }

    this.velY += gravity;

    this.x += this.velX;
    this.y += this.velY;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.jumping = false;
      this.grounded = true;
      this.velY = 0;
    }
  }

  draw() {
    const centerX = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 4 * (canvasWidth / 800);

    // Head
    const headRadius = 8 * (canvasWidth / 800);
    ctx.beginPath();
    ctx.arc(centerX, this.y + headRadius, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Body line
    ctx.beginPath();
    ctx.moveTo(centerX, this.y + 2 * headRadius);
    ctx.lineTo(centerX, bottomY - 20 * (canvasHeight / 450));
    ctx.stroke();

    // Limb swing amplitude
    const swing = Math.sin(this.step) * 15;

    // Arms
    ctx.beginPath();
    if (this.jumping) {
      // arms up when jumping
      ctx.moveTo(centerX, this.y + 2 * headRadius);
      ctx.lineTo(centerX - 15 * (canvasWidth / 800), this.y + 2 * headRadius - 20 * (canvasHeight / 450));
      ctx.moveTo(centerX, this.y + 2 * headRadius);
      ctx.lineTo(centerX + 15 * (canvasWidth / 800), this.y + 2 * headRadius - 20 * (canvasHeight / 450));
    } else {
      // swinging arms
      ctx.moveTo(centerX, this.y + 2 * headRadius);
      ctx.lineTo(centerX - 20 * (canvasWidth / 800), this.y + 2 * headRadius + swing * (canvasHeight / 450) * 0.5);
      ctx.moveTo(centerX, this.y + 2 * headRadius);
      ctx.lineTo(centerX + 20 * (canvasWidth / 800), this.y + 2 * headRadius - swing * (canvasHeight / 450) * 0.5);
    }
    ctx.stroke();

    // Legs
    ctx.beginPath();
    if (this.jumping) {
      // legs bent when jumping
      ctx.moveTo(centerX, bottomY - 20 * (canvasHeight / 450));
      ctx.lineTo(centerX - 15 * (canvasWidth / 800), bottomY - 5 * (canvasHeight / 450));
      ctx.moveTo(centerX, bottomY - 20 * (canvasHeight / 450));
      ctx.lineTo(centerX + 15 * (canvasWidth / 800), bottomY - 5 * (canvasHeight / 450));
    } else {
      // swinging legs
      ctx.moveTo(centerX, bottomY - 20 * (canvasHeight / 450));
      ctx.lineTo(centerX - 20 * (canvasWidth / 800), bottomY + swing * (canvasHeight / 450) * 0.5);
      ctx.moveTo(centerX, bottomY - 20 * (canvasHeight / 450));
      ctx.lineTo(centerX + 20 * (canvasWidth / 800), bottomY - swing * (canvasHeight / 450) * 0.5);
    }
    ctx.stroke();
  }
}

class Platform {
  constructor(x, y, w, h, isGoal = false) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.isGoal = isGoal;
  }

  draw() {
    ctx.fillStyle = this.isGoal ? '#ff0' : '#555';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();
let platforms = [];
let gameWon = false;

const keys = {};

function generatePlatforms() {
  platforms = [];
  platforms.push(new Platform(0, canvas.height - 10, canvas.width, 10));

  let xPos = 100 * (canvasWidth / 800);
  while (xPos < canvasWidth - 150) {
    const width = (50 + Math.random() * 70) * (canvasWidth / 800);
    const yPos = 150 * (canvasHeight / 450) + Math.random() * (canvasHeight - 200 * (canvasHeight / 450));
    platforms.push(new Platform(xPos, yPos, width, 10 * (canvasHeight / 450)));
    xPos += width + (80 + Math.random() * 70) * (canvasWidth / 800);
  }

  platforms.push(new Platform(canvasWidth - 120 * (canvasWidth / 800), canvasHeight - 60 * (canvasHeight / 450), 100 * (canvasWidth / 800), 15 * (canvasHeight / 450), true));
}

function collisionCheck(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  );
}

function update() {
  if (gameWon) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.grounded = false;
  for (let plat of platforms) {
    if (
      collisionCheck(
        { x: player.x, y: player.y + player.velY, width: player.width, height: player.height },
        plat
      )
    ) {
      if (player.velY > 0) {
        player.y = plat.y - player.height;
        player.velY = 0;
        player.jumping = false;
        player.grounded = true;

        if (plat.isGoal) {
          gameWon = true;
          winMessage.style.display = 'block';
        }
      }
    }
    plat.draw();
  }

  player.update();
  player.draw();

  requestAnimationFrame(update);
}

function setupControlButton(btn, keyName) {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[keyName] = true;
  });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys[keyName] = false;
  });
  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    keys[keyName] = true;
  });
  btn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    keys[keyName] = false;
  });
  btn.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    keys[keyName] = false;
  });
}

setupControlButton(leftBtn, 'left');
setupControlButton(jumpBtn, 'jump');

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys['left'] = true;
  if (e.key === ' ') keys['jump'] = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys['left'] = false;
  if (e.key === ' ') keys['jump'] = false;
});

generatePlatforms();
update();