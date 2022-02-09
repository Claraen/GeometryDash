//if true, ends the game
let dead = false;

//contains all the obstacles currently being handled
let obstacles = [];
let spawnChance = 0.005;
let timeBetweenSpawn = 1;
let reset = false;
let restartButton;
let playerOne;
let speed = 6;
let initialSpeed = 6;
let time = 0;
let oldScore = 0;

// Play mp3 through js. See functions start() and die()
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
const sound = new Audio("audio/bensound-funkyelement.mp3");

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

let playerColor = "pink";
let floorColor;

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
  let canvasSize = 600;
  createCanvas(canvasSize, 2 * canvasSize / 3);
  playerOne = new Player(50, floorY - 25, 25, 11);
  frameRate(0);
}

function start() {
  document.getElementById("setUp").style.display = "none";
  initializeState();
  startSound();
  frameRate(60);
}

function initializeState() {
  obstacles = [];
  time = 0;
  score = 0;
  dead = false;
  spawnChance = 0.005;
  speed = initialSpeed;
  floorColor = random(floorColors);
  playerColor = document.getElementById("playerColor").value;
}


function startSound() {
  sound.loop = true;
  sound.currentTime = 0;
  sound.play();
}

function overlapping(low1, high1, low2, high2) {
  return (low1 <= low2 && low2 <= high1) || (low2 <= low1 && low1 <= high2);
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
    triangle(this.x, this.y, (this.x + this.size), this.y, this.x + (this.size / 2), (this.y - this.size));
  }
}

class Ball extends Obstacle {
  drawShape() {
    circle(this.x + this.size / 2, this.y - this.size / 2, this.size);
  }
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
  if (dead) {
    die();
  } else {
    clear();
    fill(floorColor);
    rect(0, floorY, 600, 600);
    player.draw();
    drawObstacles();
    updateScore();
  }
}

function updateScore() {
  time += (1 / 25);
  textSize(15);
  text("Score: " + Math.floor(time), 525, 25);
}

function jumped() {
  return keyIsPressed && keyCode == 38;
}

function updateObstacles() {
  maybeCreateObstacle();
  moveObstacles();
}

function moveObstacles() {
  let remaining = [];
  for (let o of obstacles) {
    o.move();
    if (!o.isOffscreen()) {
      remaining.push(o);
    }
  }
  obstacles = remaining;
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

  spawnChance *= 1.0005;

  if (random() < spawnChance * timeBetweenSpawn) {
    let cls = random([Rectangle, Triangle, Ball]);
    addObstacle(new cls(speed, 650, floorY, random(15) + 10));
  } else {
    timeBetweenSpawn += 0.02;
  }
}

function addObstacle(shape) {
  obstacles.push(shape);
  speed += 0.1;
  timeBetweenSpawn = 0;
}

function die() {
  document.getElementById("setUp").style.display = "block";
  clear();
  fill(220, 20, 60);
  printDead();
  frameRate(0);
  sound.pause();
}

function highScore() {
  if (time > oldScore) {
    text("New High Score: " + Math.floor(time), 300, 50);
    oldScore = Math.floor(time);
    console.log(oldScore);
  } else {
    text("Score: " + Math.floor(time), 350, 50);
    text("High Score: " + oldScore, 350, 80);
  }
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
