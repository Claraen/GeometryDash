// Base size of the canvas
const canvasSize = 600;

// The y position of the floor.
const floorY = 275;

// State that is reset for each game.
let obstacles;
let dead;
let speed;
let startFrame;
let lastSpawn;
let floorColor;
let playerColor;

let playerOne;
let canvas;
let highScore = 0;
let initialSpeed = 6;

// Play mp3 through js. See functions start() and die()
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
const sound = new Audio("audio/bensound-funkyelement.mp3");


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

function setup() {
  clear();
  textSize(15);
  canvas = createCanvas(canvasSize, 2 * canvasSize / 3);
  playerOne = new Player(50, floorY - 25, 25, 11);
  frameRate(0);
}

function start() {
  hideMenu();
  initializeState();
  startSound();
  frameRate(60);
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

  hitPlayer(player) {
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

function p(x, y) {
  return {x: x, y: y};
}


// P5 method called once per frame to update the screen.
function draw() {
  updateWorld(playerOne);
  drawWorld(playerOne);
}

function updateWorld(player) {
  if (jumped()) {
    player.jump();
  }
  player.move();
  updateObstacles();
  dead = checkHitPlayer(player);
}

function drawWorld(player) {
  clear();
  if (dead) {
    die();
  } else {
    fill(floorColor);
    rect(0, floorY, canvas.width, floorY);
    player.draw();
    drawObstacles();
    updateScore();
  }
}

function updateScore() {
  textSize(15);
  text("Score: " + score(), 525, 25);
}

function jumped() {
  return keyIsPressed && keyCode == 38;
}

function updateObstacles() {
  maybeCreateObstacle();
  moveObstacles();
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

function drawObstacles() {
  obstacles.forEach(o => o.draw());
}

function checkHitPlayer(player) {
  // This could be made more efficient by only checking obstacles
  // until we get to the first obstacle whose x is greater than the
  // right edge of the player. But there are never so many obstacles
  // on the screen at once that that is likely to matter.
  return obstacles.some(o => o.hitPlayer(player));
}

function maybeCreateObstacle() {
  if (random() < spawnChance()) {
    let cls = random([Rectangle, Triangle, Ball]);
    obstacles.push(new cls(speed, 650, floorY, random(15) + 10));
    speed += 0.1;
    lastSpawn = frameCount;
  }
}

function spawnChance() {
  let totalFrames = frameCount - startFrame;
  let sinceSpawn = frameCount - lastSpawn;
  return 0.0001 * sinceSpawn * (1.0005 ** totalFrames);
}

function die() {
  showMenu();
  fill(220, 20, 60);
  printDead();
  showScore(score());
  frameRate(0);
  sound.pause();
}

function showScore(s) {
  if (s > highScore) {
    text("New High Score: " + s, 300, 50);
    highScore = s;
  } else {
    text("Score: " + s, 350, 50);
    text("High Score: " + highScore, 350, 80);
  }
}

function score() {
  return Math.floor((frameCount - startFrame) / 25);
}

function printDead() {
  textSize(50);
  text("You Are Dead", 150, 250);
  textSize(15);
  text("Click 'START!' to play a new game!", 185, 300);
  text("Press the 'UP' arrow to jump!", 195, 325);
  textSize(30);
}

function easy() {
  initializeSpeed(6);
}

function medium() {
  initializeSpeed(10);
}

function hard() {
  initializeSpeed(12);
}

function initializeSpeed(s) {
  speed = s;
  initialSpeed = s;
}


function showMenu() {
  document.getElementById("setUp").style.display = "block";
}

function hideMenu() {
  document.getElementById("setUp").style.display = "none";
}

// Check whether two ranges overlap.
function overlapping(low1, high1, low2, high2) {
  return (low1 <= low2 && low2 <= high1) || (low2 <= low1 && low1 <= high2);
}
