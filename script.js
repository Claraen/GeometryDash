//if true, ends the game
var dead = false;

//contains all the obstacles currently being handled
var obstacles = [];
var spawnChance = 0.005;
var timeBetweenSpawn = 1;

//miscellaneous global variables
var reset = false;
var restartButton;
var playerOne;
var playerY = 250;
var speed = 6;
var initialSpeed = 6;
var time = 0;
var oldScore = 0;

// Play mp3 through js. See functions start() and die()
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
var sound = new Audio("audio/bensound-funkyelement.mp3");
sound.loop = true;

//determines color of obstacles, player, and floor:
var oCol = ["white", "lightblue", "azure", "chartreuse", "salmon", "lemonchiffon", "lightcyan", "palegreen", "paleturquoise"];
var pCol = "pink";
//handles the color of the floor (idk what the variable names mean)
var fCol = ["blue", "rebeccapurple", "teal", "yellowgreen", "tomato", "orange", "indigo", "firebrick", "crimson", "coral"];
var fChoice = 0;

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
    if (dead == false) {
      fill(pCol);
      rect(this.x, this.y, this.size, this.size);
      fill('white');
    }
  }
}

function setup() {
  clear();
  textSize(15);
  dead = false;
  score = 0;
  var canvasSize = 600;
  createCanvas(canvasSize, 2 * canvasSize / 3);
  playerOne = new Player(playerY, 50, 25, 11);
  frameRate(0);
  fChoice = Math.floor(random(fCol.length));
}

function start() {
  var el = document.getElementById("setUp");
  el.style.display = "none";
  sound.currentTime = 0;
  sound.play();
  frameRate(speed);
}

class Obstacle {
  constructor(speed, yPos, xPos) {
    this.y = yPos;
    this.x = xPos;
    this.speed = speed;
  }

  move() {
    //console.log(this.ySpeed);
    if (this.y < this.initialY) {
      this.y += this.ySpeed;
      this.ySpeed += (0.1 * this.jumpHeight);
    } else if (this.y > this.initialY) {
      this.y = this.initialY;
    }
    this.x -= this.speed;
  }
}

class Rectangle extends Obstacle {
  constructor(xLength, yLength, yPos, speed, startX) {
    //sets speed, x, and y
    super(speed, yPos, startX); //600 is end of frame
    this.xLength = xLength;
    this.yLength = yLength;
    this.y += 25 - this.yLength;
    this.color = Math.floor(random(oCol.length));
  }

  //draws the obstacle at its location on screen
  draw() {
    fill(oCol[this.color]);
    rect(this.x, this.y, this.xLength, this.yLength);
    fill('white');
  }
  //sets the value of the global variable "dead" to true, which should trigger the death function
  kill(player) {
    //the collision might be a bit wonky
    if (this.x <= player.x && (this.x + this.xLength) >= player.x && this.y <= player.y + 25) {
      dead = true;
    }
  }
}

class Triangle extends Obstacle {
  constructor(xLength, yLength, yPos, speed, startX) {
    //sets speed, x, and y
    super(speed, yPos, startX);
    this.xLength = xLength;
    this.yLength = yLength;
    this.y += 25 - this.yLength;
    this.color = Math.floor(random(oCol.length));
  }

  //draws the obstacle at its location on screen
  draw() {
    fill(oCol[this.color]);
    triangle(this.x, this.y, (this.x + this.xLength), this.y, this.x + (this.xLength / 2), (this.y - this.yLength));
    //triangle(x1, y1, x2, y2, x3, y3)
    fill('white');
  }

  //sets the value of the global variable "dead" to true, which should trigger the death function
  kill(player) {
    //the collision might be a bit wonky
    if (this.x <= player.x && (this.x + this.xLength) >= player.x && (this.y - this.yLength) <= player.y + 25) {
      dead = true;
    }
  }
}

class Ball extends Obstacle {
  constructor(size, yPos, speed) {
    //sets speed, x, and y
    super(speed, yPos, 600);
    this.x = 600;
    this.y = yPos;

  }

  draw() {
    fill(oCol);
    circle(this.x + this.size / 2, this.y + this.size / 2, this.size)
    fill('white');
  }
}
//updates the screen
function draw() {
  frameRate(60);
  updateWorld(playerOne);
  time += (1 / 25);
  textSize(15);
  text("Score: " + Math.floor(time), 525, 25);
  checkJump();
}

function checkJump(){
  if (keyIsPressed && keyCode == 38) {
    playerOne.jump();
  }
  if (dead == true) {
    die();
  }
}

//updates the player and obstacles
function updateWorld(player) {
  clear();
  player.draw();
  player.move();
  handleObstacles(player);
  fill(fCol[fChoice]);
  rect(0, playerY + 25, 600, 600);
}

//handles creating + updating obstacles
function handleObstacles(player) {
  let rand = random();
  let size = random(15) + 10;
  spawnChance *= 1.0005;
  let currentChance = spawnChance * timeBetweenSpawn;
  createObstacle(rand,currentChance,size);
  //updates obstacles and checks their location
  obstacleUpdate(player);
}

function obstacleUpdate(player){
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].x + 100 >= player.x) {
      obstacles[i].move();
      obstacles[i].draw();
      obstacles[i].kill(player);
    }
  }
}

function createObstacle(rand,currentChance,size) {
  if (rand < currentChance) {
    obstacleType(new Rectangle(size, size, playerY, speed, 650));
  } else if (rand < currentChance * 2) {
    obstacleType(new Triangle(size, size, playerY + size, speed, 650));
  } else {
    timeBetweenSpawn += 0.02;
  }
}

function obstacleType(shape){
      obstacles[obstacles.length] = shape;
    speed += 0.1;
    timeBetweenSpawn = 0;
}

function die() {
  var el = document.getElementById("setUp");
  el.style.display = "block";
  clear();
  fill(220, 20, 60);
  printDead();
  frameRate(0);
  sound.pause();
}

function highScore(){
    if (time > oldScore) {
    text("New High Score: " + Math.floor(time), 300, 50);
    oldScore = Math.floor(time);
    console.log(oldScore);
  }
  else {
    text("Score: " + Math.floor(time), 350, 50);
    text("High Score: " + oldScore, 350, 80);
  }
}

function printDead(){
  textSize(50);
  text("You Are Dead", 150, 250);
  textSize(15);
  text("Click 'START!' to play a new game!", 185, 300);
  text("Press the 'UP' arrow to jump!", 195, 325);
  textSize(30);
}

function restartGame() {
  changePlayerColor();
  dead = false;
  spawnChance = 0.005;
  speed = initialSpeed;
  fChoice = Math.floor(random(fCol.length));
  start();
  obstacles = [];
  time = 0;
  var c = document.getElements
}

function changePlayerColor() {
  let color = document.getElementById("playerColor").value;
  pCol = color;
}

function easy() {
  speed = 6;
  initialSpeed = 6;
}

function medium() {
  speed = 10;
  initialSpeed = 10;
}

function hard() {
  speed = 12;
  initialSpeed = 12;
}

