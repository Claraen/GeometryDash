//if true, ends the game
let dead = false;

//contains all the obstacles currently being handled
let obstacles = [];
let spawnChance = 0.005;
let timeBetweenSpawn = 1;

//miscellaneous global variables
let reset = false;
let restartButton;
let playerOne;
let playerY = 250;
let speed = 6;
let initialSpeed = 6;
let time = 0;
let oldScore = 0;

// Play mp3 through js. See functions start() and die()
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
let sound = new Audio("audio/bensound-funkyelement.mp3");

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
  constructor(startingY, startingX, size, jumpHeight) {
    this.x = startingX;
    this.y = startingY;
    this.initialY = startingY;
    this.ySpeed = 0;
    this.size = size;
    this.jumpHeight = jumpHeight;
  }

  //jumps when the space key is pressed
  jump() {
    if (this.y == this.initialY) {
      this.ySpeed = -this.jumpHeight;
      this.y -= 0.5;
    }
  }

  //moves the player up and down
  move() {
    //console.log(this.ySpeed);
    if (this.y < this.initialY) {
      this.y += this.ySpeed;
      this.ySpeed += (0.1 * this.jumpHeight);
    } else if (this.y > this.initialY) {
      this.y = this.initialY;
    }
  }

  //draws the obstacle at its location on screen
  draw() {
    if (!dead) {
      fill(playerColor);
      rect(this.x, this.y, this.size, this.size);
      fill('white');
    }
  }
}

function setup() {
  clear();
  textSize(15);
  let canvasSize = 600;
  createCanvas(canvasSize, 2 * canvasSize / 3);
  playerOne = new Player(playerY, 50, 25, 11);
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


class Obstacle {
  constructor(speed, x, y) {
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.color = random(obstacleColors);
  }

  move() {
    this.x -= this.speed;
  }
}

class Rectangle extends Obstacle {
  constructor(speed, x, y, xLength, yLength) {
    super(speed, x, y);
    this.xLength = xLength;
    this.yLength = yLength;
    this.y += 25 - this.yLength;
  }

  draw() {
    fill(this.color);
    rect(this.x, this.y, this.xLength, this.yLength);
    fill('white');
  }

  kill(player) {
    //the collision might be a bit wonky
    dead == this.x <= player.x && (this.x + this.xLength) >= player.x && this.y <= player.y + 25;
  }
}

class Triangle extends Obstacle {
  constructor(speed, x, y, xLength, yLength) {
    super(speed, x, y);
    this.xLength = xLength;
    this.yLength = yLength;
    this.y += 25 - this.yLength;
  }

  draw() {
    fill(this.color);
    triangle(this.x, this.y, (this.x + this.xLength), this.y, this.x + (this.xLength / 2), (this.y - this.yLength));
    fill('white');
  }

  kill(player) {
    //the collision might be a bit wonky
    dead = this.x <= player.x && (this.x + this.xLength) >= player.x && (this.y - this.yLength) <= player.y + 25;
  }
}

class Ball extends Obstacle {
  constructor(size, y, speed) {
    super(speed, 600, y);
  }

  draw() {
    fill(this.color);
    circle(this.x + this.size / 2, this.y + this.size / 2, this.size)
    fill('white');
  }
}

//updates the screen
function draw() {
  updateWorld(playerOne);
  time += (1 / 25);
  textSize(15);
  text("Score: " + Math.floor(time), 525, 25);
  checkJump();
}

function checkJump() {
  if (keyIsPressed && keyCode == 38) {
    playerOne.jump();
  }
  if (dead) {
    die();
  }
}

//updates the player and obstacles
function updateWorld(player) {
  clear();
  player.draw();
  player.move();
  handleObstacles(player);
  fill(floorColor);
  rect(0, playerY + 25, 600, 600);
}

function handleObstacles(player) {
  maybeCreateObstacle();
  obstacleUpdate(player);
}

function obstacleUpdate(player) {
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].x + 100 >= player.x) {
      obstacles[i].move();
      obstacles[i].draw();
      obstacles[i].kill(player);
    }
  }
}

function maybeCreateObstacle() {

  spawnChance *= 1.0005;

  if (random() < spawnChance * timeBetweenSpawn) {
    let size = random(15) + 10;
    if (random() < 0.5) {
      addObstacle(new Rectangle(speed, 650, playerY, size, size));
    } else {
      addObstacle(new Triangle(speed, 650, playerY + size, size, size));
    }
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
