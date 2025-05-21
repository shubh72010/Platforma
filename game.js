const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const gravity = 0.8;
const friction = 0.8;

class Player {
  constructor() {
    this.width = 40;
    this.height = 60;
    this.x = 50;
    this.y = canvas.height - this.height - 10;
    this.velX = 0;
    this.velY = 0;
    this.speed = 5;
    this.jumping = false;
    this.grounded = false;
  }

  update() {
    if (keys['right']) {
      if (this.velX < this.speed) this.velX++;
    }
    if (keys['left']) {
      if (this.velX > -this.speed) this.velX--;
    }
    if (keys['up']) {
      if (!this.jumping && this.grounded) {
        this.jumping = true;
        this.grounded = false;
        this.velY = -15;
      }
    }

    this.velX *= friction;
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
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Platform {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  draw() {
    ctx.fillStyle = '#555';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();
let platforms = [];

const keys = {};

// Auto-generate platforms for level
function generatePlatforms() {
  platforms = [];
  // Ground platform always present
  platforms.push(new Platform(0, canvas.height - 10, canvas.width, 10));

  let xPos = 100;
  while (xPos < canvas.width - 50) {
    // random platform width 50-120
    const width = 50 + Math.random() * 70;
    // random y between 150 and canvas.height - 50
    const yPos = 150 + Math.random() * (canvas.height - 200);
    platforms.push(new Platform(xPos, yPos, width, 10));
    // increase xPos by platform width + random gap 80-150
    xPos += width + 80 + Math.random() * 70;
  }
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
      }
    }
    plat.draw();
  }

  player.update();
  player.draw();

  requestAnimationFrame(update);
}

// Mobile buttons setup
const controlsDiv = document.createElement('div');
controlsDiv.style.position = 'fixed';
controlsDiv.style.bottom = '20px';
controlsDiv.style.left = '50%';
controlsDiv.style.transform = 'translateX(-50%)';
controlsDiv.style.display = 'flex';
controlsDiv.style.gap = '20px';
document.body.appendChild(controlsDiv);

function createButton(name) {
  const btn = document.createElement('button');
  btn.innerText = name;
  btn.style.fontSize = '24px';
  btn.style.padding = '10px 20px';
  btn.style.borderRadius = '10px';
  btn.style.border = 'none';
  btn.style.background = '#444';
  btn.style.color = '#fff';
  btn.style.userSelect = 'none';
  btn.style.touchAction = 'none'; // prevent default scroll on touch

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[name.toLowerCase()] = true;
  });
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys[name.toLowerCase()] = false;
  });
  return btn;
}

controlsDiv.appendChild(createButton('Left'));
controlsDiv.appendChild(createButton('Up'));
controlsDiv.appendChild(createButton('Right'));

// Keyboard support too
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') keys['right'] = true;
  if (e.key === 'ArrowLeft') keys['left'] = true;
  if (e.key === 'ArrowUp') keys['up'] = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') keys['right'] = false;
  if (e.key === 'ArrowLeft') keys['left'] = false;
  if (e.key === 'ArrowUp') keys['up'] = false;
});

generatePlatforms();
update();