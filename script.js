// Base size of the canvas
const canvasSize = 800;

// The y position of the floor.
const floorY = 275;

//determines color of obstacles, player, and floor:
const obstacleColors = [
  "white", "lightblue", "azure", "chartreuse", "salmon",
  "lemonchiffon", "lightcyan", "palegreen", "paleturquoise"
];

//handles the color of the floor (idk what the variable names mean)
const floorColors = [
  "blue", "rebeccapurple", "teal", "yellowgreen", "tomato",
  "orange", "indigo", "firebrick", "crimson", "coral"
];

// Play mp3 through js. See functions start() and die()
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
const sound = new Audio("audio/bensound-funkyelement.mp3");


// State that is reset for each game.
let obstacles;
let dead;
let speed;
let startFrame;
let lastSpawn;
let floorColor;
let playerColor;

// State that is set up once.
let player;

// State that persists across games.
let highScore = 0;
let initialSpeed = 6;


class Player {
  constructor(x, y, size, jumpHeight) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.initialY = y;
    this.ySpeed = 0;
    this.jumpHeight = jumpHeight;
  }

  jump() {
    if (this.y === this.initialY) {
      this.ySpeed = -this.jumpHeight;
      this.y -= 0.5;
    }
  }

  move() {
    if (this.y < this.initialY) {
      this.y = constrain(this.y + this.ySpeed, 0, this.initialY);
      this.ySpeed += (0.1 * this.jumpHeight);
    }
  }

  draw() {
    fill(playerColor);
    rect(this.x, this.y, this.size, this.size);
    fill('white');
  }
}

class Obstacle {
  constructor(speed, x, y, size) {
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = random(obstacleColors);
  }

  draw() {
    fill(this.color);
    this.drawShape();
    fill('white');
  }

  isOffscreen() {
    return this.x + this.size < 0;
  }

  move() {
    this.x -= this.speed;
  }

  hitPlayer() {
    return overlapping(this.x, this.x + this.size, player.x, player.x + player.size) &&
      overlapping(this.y, this.y + this.size, player.y, player.y + player.size);
  }

}

class Rectangle extends Obstacle {
  drawShape() {
    rect(this.x, this.y - this.size, this.size, this.size);
  }
}

class Triangle extends Obstacle {
  drawShape() {
    let p1 = p(this.x, this.y);
    let p2 = p(this.x + this.size, this.y);
    let p3 = p(this.x + (this.size / 2), this.y - this.size);
    triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  }
}

class Ball extends Obstacle {
  drawShape() {
    circle(this.x + this.size / 2, this.y - this.size / 2, this.size);
  }
}


//
// Called from UI
//

function easy() {
  initialSpeed = 6;
}

function medium() {
  initialSpeed = 10;
}

function hard() {
  initialSpeed = 12;
}


//
// DOM UI manipulation
//

function showMenu() {
  document.getElementById("setUp").style.display = "block";
}

function hideMenu() {
  document.getElementById("setUp").style.display = "none";
}


//
// P5 lifecycle methods
//

function setup() {
  createCanvas(canvasSize, 2 * canvasSize / 3);
  player = new Player(50, floorY - 25, 25, 11);
  frameRate(0);
}

function draw() {
  updateWorld();
  drawWorld();
}


//
// Our own lifecycle -- start is called from the start button in the
// UI and kicks everything else off.
//

function start() {
  hideMenu();
  initializeState();
  startSound();
  frameRate(60);
}

function gameOver() {
  showMenu();
  drawGameOver();
  frameRate(0);
  sound.pause();
}

function initializeState() {
  obstacles = [];
  dead = false;
  speed = initialSpeed;
  startFrame = frameCount;
  lastSpawn = frameCount; // we've got to set it to something
  floorColor = random(floorColors);
  playerColor = document.getElementById("playerColor").value;
}

function startSound() {
  sound.loop = true;
  sound.currentTime = 0;
  sound.play();
}

//
// Updating the state of the world before we redraw.
//

function updateWorld() {
  updatePlayer();
  updateObstacles();
}

function updatePlayer() {
  if (jumped()) {
    player.jump();
  }
  player.move();
}

function jumped() {
  return keyIsPressed && keyCode == 38;
}

function updateObstacles() {
  maybeCreateObstacle();
  moveObstacles();
}

function maybeCreateObstacle() {
  if (random() < spawnChance()) {
    let cls = random([Rectangle, Triangle, Ball]);
    let size = random(15) + 10;
    obstacles.push(new cls(speed, width + size, floorY, size));
    speed += 0.1;
    lastSpawn = frameCount;
  }
}

function spawnChance() {
  let totalFrames = frameCount - startFrame;
  let sinceSpawn = frameCount - lastSpawn;
  return 0.0001 * sinceSpawn * (1.0005 ** totalFrames);
}

function moveObstacles() {
  let stillOnScreen = [];
  for (let o of obstacles) {
    o.move();
    if (!o.isOffscreen()) {
      stillOnScreen.push(o);
    }
  }
  obstacles = stillOnScreen;
}


//
// Drawing the updated world.
//

function drawWorld() {
  clear();
  if (!dead) {
    drawFloor();
    player.draw();
    obstacles.forEach(o => o.draw());
    drawScore();
    dead = checkHitPlayer();
  } else {
    gameOver();
  }
}

function drawFloor() {
  fill(floorColor);
  rect(0, floorY, width, floorY);
}

function drawScore() {
  textSize(15);
  textAlign(RIGHT);
  text("Score: " + score(), width - 25, 25);
}

function checkHitPlayer() {
  // This could be made more efficient by only checking obstacles
  // until we get to the first obstacle whose x is greater than the
  // right edge of the player. But there are never so many obstacles
  // on the screen at once that that is likely to matter.
  return obstacles.some(o => o.hitPlayer());
}

function drawGameOver() {
  fill(220, 20, 60);
  drawFinalMessage();
  drawFinalScore(score());
}

function drawFinalMessage() {
  let mid = width / 2;
  textSize(50);
  textAlign(CENTER);
  text("You Are Dead", mid, 250);
  textSize(15);
  text("Click 'START!' to play a new game!", mid, 300);
  text("Press the 'UP' arrow to jump!", mid, 325);
  textSize(30);
}

function drawFinalScore(s) {
  textAlign(RIGHT);
  let r = width - 25;
  if (s > highScore) {
    text("New High Score: " + s, r, 50);
    highScore = s;
  } else {
    text("Score: " + s, r, 50);
    text("High Score: " + highScore, r, 80);
  }
}

//
// Utility functions
//

// Compute the score based on the number of frames that have gone by.
function score() {
  return Math.floor((frameCount - startFrame) / 25);
}

// Check whether two ranges overlap.
function overlapping(low1, high1, low2, high2) {
  return (low1 <= low2 && low2 <= high1) || (low2 <= low1 && low1 <= high2);
}

// Make a simple point object.
function p(x, y) {
  return {x: x, y: y};
}
