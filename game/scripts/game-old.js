// Key constants
const Keys = {
  ARROW_LEFT: 'ArrowLeft',
  ARROW_UP: 'ArrowUp',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_DOWN: 'ArrowDown',
};

class KeyBoard {
  constructor() {
    this.keys = {};
  }

  addEvents () {
    window.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    return this;
  }

  getKeys() {
    return this.keys;
  }

  isKeyPress(key) {
    return this.getKeys()[key];
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

class Car {
  constructor(app, texture, boundLeft, boundRight, boundBottom, speed) {
    this.app = app;
    this.sprite = null;

    this.bounds = {
      xLeft: boundLeft,
      xRight: boundRight,
      yTop: 0,
      yBottom: boundBottom,
    };

    this.speed = speed;

    this.create(texture);
  }

  create(texture) {
    // Create Sprite
    const sprite = new PIXI.Sprite(texture);

    // Set the anchor
    sprite.anchor.set(0.5);
    // Flip the texture
    sprite.angle = -90;
    sprite.scale.x = 0.8;
    sprite.scale.y = 0.8;

    this.sprite = sprite;
    this.center = this.sprite.width / 2;

    return this;
  }

  setPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;

    return this;
  }
}

class EnemyCar extends Car {
  constructor(app, boundLeft, boundRight, boundBottom, speed) {
    // Get a random enemy sprite
    const texture = app.loader.resources[`enemy${randomBetween(1,5)}`].texture;
    super(app, texture, boundLeft, boundRight, boundBottom, speed);
  }

  invoke(lanesQ, lanesPosition) {
    const whichLane = randomBetween(1, lanesQ);
    const laneToPushEnemy = lanesPosition[whichLane - 1];

    this.setPosition(laneToPushEnemy.x, -this.sprite.height);
  }
}

class PlayerCar extends Car {
  constructor(app, boundLeft, boundRight, boundBottom, speed) {
    // Get the player sprite
    const texture = app.loader.resources.player.texture;
    super(app, texture, boundLeft, boundRight, boundBottom, speed);

    this.explosion = this.createExplosion();
  }

  createExplosion() {
    const expFrames = [];

    for (let i = 0; i <= 63; i++) {
      expFrames.push(`exp-${i}`);
    }

    const animatedSprite = PIXI.AnimatedSprite.fromFrames(expFrames);

    animatedSprite.anchor.set(0.5);
    animatedSprite.loop = false;
    animatedSprite.animationSpeed = 0.4;

    return animatedSprite;
  }

  moveLeft() {
    const bounds = this.sprite.getBounds();
    const notCrashLeft = (bounds.x >= (this.bounds.xLeft + (this.center / 2)));
    const missing = (bounds.x - this.bounds.xLeft);
    const toMove = notCrashLeft ? this.speed : (missing > 0) ? missing : 0;

    this.setPosition(this.sprite.x - toMove, this.sprite.y);
  }

  moveRight() {
    const bounds = this.sprite.getBounds();
    const notCrashRight = ((bounds.x + this.center) <= this.bounds.xRight);
    const missing = (this.bounds.xRight - bounds.x - this.center);
    const toMove = notCrashRight ? this.speed : (missing > 0) ? missing : 0;

    this.setPosition(this.sprite.x + toMove, this.sprite.y);
  }

  moveUp() {
    const bounds = this.sprite.getBounds();
    const notCrashTop = (bounds.y >= this.bounds.yTop);
    const missing = (bounds.y - this.bounds.yTop);
    const toMove = notCrashTop ? this.speed : (missing > 0) ? missing : 0;

    this.setPosition(this.sprite.x, this.sprite.y - toMove);
  }

  moveDown() {
    const bounds = this.sprite.getBounds();
    const notCrashBottom = ((bounds.y + this.sprite.height) <= this.bounds.yBottom);
    const missing = this.bounds.yBottom - (bounds.y + this.sprite.height);
    const toMove = notCrashBottom ? this.speed : (missing > 0) ? missing : 0;

    this.setPosition(this.sprite.x, this.sprite.y + toMove);
  }

  explode() {
    this.explosion.x = (this.sprite.getBounds().x + this.center) - 7;
    this.explosion.y = (this.sprite.getBounds().y + (this.sprite.height / 2));

    this.explosion.gotoAndPlay(0);
  }
}

class GameBackground {
  constructor(appWidth, appHeight, gameSpeed, lanes) {
    this.lanes = lanes;
    this.container = null;
    this.linesContainer = null;

    this.appWidth = appWidth;
    this.appHeight = appHeight;
    this.gameSpeed = gameSpeed + 2;

    this.xRoadStart = null;
    this.xRoadEnd = null;

    this.lanesPos = [];

    this.create();
  }

  createRoad(x, y, width, height) {
    const line = new PIXI.Graphics();

    line.beginFill(0x646464);
    line.drawRect(0, 0, width, height);
    line.endFill();

    line.position.set(x, y);

    return line;
  }

  createLine({ x = 0, y = 0, width = 6, height = 64, color = 0xFFFFFF }) {
    const line = new PIXI.Graphics();

    line.beginFill(color);
    line.drawRect(0, 0, width, height);
    line.endFill();

    line.position.set(x, y);

    return line;
  }

  createYellowLine(x, height) {
    return this.createLine({
      x: x,
      height: height,
      color: 0xFFAFF00,
    });
  }

  create() {
    const background = new PIXI.Container();

    const gridWidth = 10;
    const gridMinWidth = this.appWidth / gridWidth;
    const playableGrid = 6;
    const nonPlayableGrid = gridWidth - playableGrid;
    const nonPlayableWidth = (nonPlayableGrid * gridMinWidth);

    // Road cration
    const roadX = nonPlayableWidth / 2;
    const roadWidth = gridMinWidth * playableGrid;

    const road = this.createRoad(roadX, 0, roadWidth, this.appHeight);

    background.addChild(road);

    this.xRoadStart = road.x;
    this.xRoadEnd = road.x + road.width;

    // Lanes Creation
    background.addChild(this.createYellowLine(this.xRoadStart, this.appHeight));
    background.addChild(this.createYellowLine(this.xRoadEnd, this.appHeight));

    const totalWidthPerLane = road.width / this.lanes;

    // First and last
    for (let i = 1; i <= (this.lanes - 1); i ++) {
      background.addChild(
        this.createYellowLine(this.xRoadStart + (totalWidthPerLane * i), this.appHeight)
      );
    }

    // Lines creation
    const linesContainer = new PIXI.Container();
    const lineDistanceFromStart = (totalWidthPerLane / 2);

    for (let j = 1; j <= this.lanes; j++) {
      const laneStart = this.xRoadStart + (totalWidthPerLane * j) - lineDistanceFromStart;

      for (let i = 0; i <= (this.appHeight * 2); i = (i + 40 + 64)) {
        // Line Creation
        linesContainer.addChild(
          this.createLine({
            x: laneStart,
            y: -this.appHeight + i + 16,
          })
        );
      }

      this.lanesPos.push({
        x: laneStart - (lineDistanceFromStart / 2),
      });

      this.lanesPos.push({
        x: laneStart + (lineDistanceFromStart / 2),
      });
    }

    background.addChild(linesContainer);

    this.container = background;
    this.linesContainer = linesContainer;
  }

  animate() {
    this.linesContainer.position.y = this.linesContainer.position.y + this.gameSpeed;

    if (this.linesContainer.position.y >= this.appHeight) {
      this.linesContainer.position.y = this.linesContainer.position.y - this.appHeight + 16;
    }
  }
}

function getScoreText(value) {
  return `SCORE: ${value}`;
}

function getEnemySpeedText(value) {
  return `ENEMY SPEED: ${value}`;
}

function getMsToReleaseText(value) {
  return `MS TO RELEASE: ${value}`;
}

function getFPS(value) {
  return `FPS: ${Math.ceil(value)}`;
}

// Create Keyboard
const keyboard = new KeyBoard().addEvents();

window.onload = function () {
  // Create the application with higher resolution for crisp rendering
  const app = new PIXI.Application({
    width: 320,
    height: 640,
    backgroundColor: 0x659B35,
    resolution: 2,
  });

  // Load the assets
  app.loader.add('player', 'assets/BlackOut.png');
  app.loader.add('enemy1', 'assets/RedStrip.png');
  app.loader.add('enemy2', 'assets/BlueStrip.png');
  app.loader.add('enemy3', 'assets/GreenStrip.png');
  app.loader.add('enemy4', 'assets/PinkStrip.png');
  app.loader.add('enemy5', 'assets/WhiteStrip.png');

  for (let i = 0; i <= 63; i++) {
    app.loader.add(`exp-${i}`, `assets/explosion/frame00${(i < 10 ? '0' : '')}${i}.png`);
  }

  // When all the assets are loaded start the game
  app.loader.onComplete.add(startGame);

  // Start the application
  app.loader.load();

  function startGame () {
    const FPS = PIXI.Ticker.shared.FPS;

    const gameSpeed = 5;
    const lanes = 2;
    const gameDiv = document.getElementById('game');

    // Logical game dimensions
    const GAME_WIDTH = 320;
    const GAME_HEIGHT = 640;

    // Allow zIndex usage
    app.stage.sortableChildren = true;

    // Append the application
    gameDiv.appendChild(app.view);

    // Create Scenario using logical dimensions
    const scenario = new GameBackground(GAME_WIDTH, GAME_HEIGHT, gameSpeed, lanes);

    const textContainer = new PIXI.Container();

    // Create Score
    const scoreText = new PIXI.Text(getScoreText(0), { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    scoreText.x = 20;
    scoreText.y = 20;

    // Create Score
    const enemySpeedText = new PIXI.Text(getEnemySpeedText(0), { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    enemySpeedText.x = 20;
    enemySpeedText.y = 50;

    // Create Score
    const msToReleaseText = new PIXI.Text(getMsToReleaseText(0), { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    msToReleaseText.x = 20;
    msToReleaseText.y = 70;

    // Create Score
    const fpsText = new PIXI.Text(getFPS(FPS), { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    fpsText.x = GAME_WIDTH - 70;
    fpsText.y = 26;

    textContainer.addChild(scoreText);
    textContainer.addChild(enemySpeedText);
    textContainer.addChild(msToReleaseText);
    textContainer.addChild(fpsText);

    textContainer.zIndex = 100;

    const gameOverContainer = new PIXI.Container();

    const gameOverText = new PIXI.Text('GAME OVER', { fontFamily: 'Arial', fontSize: 40, fill: 0xFFFFFF, align: 'center', stroke: 'black', strokeThickness: 4 });
    const restartButton = new PIXI.Text('Play Again', { fontFamily: 'Arial', fontSize: 30, fill: 0xFFFFFF, align: 'center', stroke: 'black', strokeThickness: 4 });

    restartButton.interactive = true;
    restartButton.buttonMode = true;
    restartButton.y = 50;
    restartButton.x = (gameOverText.width / 2) - (restartButton.width / 2)

    gameOverContainer.addChild(gameOverText);
    gameOverContainer.addChild(restartButton);

    gameOverContainer.x = (GAME_WIDTH / 2) - (gameOverContainer.width / 2);
    gameOverContainer.y = (GAME_HEIGHT / 2) - (gameOverContainer.height / 2);
    gameOverContainer.zIndex = 200;

    gameOverContainer.visible = false;

    // Crete Player Car
    const playerCar = new PlayerCar(app, scenario.xRoadStart, scenario.xRoadEnd, GAME_HEIGHT, gameSpeed)
      .setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    app.stage.addChild(scenario.container);
    app.stage.addChild(textContainer);
    app.stage.addChild(gameOverContainer);
    app.stage.addChild(playerCar.sprite);
    app.stage.addChild(playerCar.explosion);

    // Indicates if the player has lost
    let lost = false;
    // Enemy Cars
    let enemyCars = [];
    // Start game timestamp
    let startTime = Date.now();
    let enemyCarsEvaded = 0;
    let enemySpeed = gameSpeed;
    let msToReleaseEnemy = 400;
    let difficultyIncrease = false;
    const maxEnemySpeed = 12;
    const maxEnemyMsToRelease = 200;

    enemySpeedText.text = getEnemySpeedText(enemySpeed);
    msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

    restartButton.on('click', () => {
      enemyCars.forEach(c => {
        app.stage.removeChild(c.sprite);
      });

      enemyCars = [];
      enemyCarsEvaded = 0;
      enemySpeed = gameSpeed;
      msToReleaseEnemy = 400;
      difficultyIncrease = false;
      startTime = Date.now();

      playerCar.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      playerCar.explosion.gotoAndStop(-1);
      scoreText.text = getScoreText(0);
      enemySpeedText.text = getEnemySpeedText(enemySpeed);
      msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

      lost = false;
      gameOverContainer.visible = false;
    });

    // Start Game Loop
    app.ticker.add(() => {
      fpsText.text = getFPS(FPS);

      // If the player didn't lost
      if (!lost) {
        const now = Date.now();

        scenario.animate();

        // Check if is time to add a car enemy to the game and increase difficulty
        if ((now - startTime) >= msToReleaseEnemy) {
          startTime = now;

          const enemyCar = new EnemyCar(app, scenario.xRoadStart, scenario.xRoadEnd, GAME_HEIGHT, gameSpeed);

          enemyCar.invoke((scenario.lanes * 2), scenario.lanesPos);

          // Add Enemy Car
          enemyCars.push(enemyCar);

          // Add to the stage
          app.stage.addChild(enemyCars[enemyCars.length - 1].sprite);
        }

        // Check if need to increase difficulty
        if (enemyCarsEvaded !== 0 && !difficultyIncrease) {
          difficultyIncrease = true;

          if (enemyCarsEvaded % 10 === 0 && enemySpeed <= maxEnemySpeed) {
            enemySpeed = enemySpeed + 1;
            enemySpeedText.text = getEnemySpeedText(enemySpeed);
          }

          if (enemyCarsEvaded % 20 === 0 && msToReleaseEnemy >= maxEnemyMsToRelease) {
            msToReleaseEnemy = msToReleaseEnemy - 50;
            msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);
          }
        }

        if (keyboard.isKeyPress(Keys.ARROW_DOWN)) {
          playerCar.moveDown();
        }
        if (keyboard.isKeyPress(Keys.ARROW_UP)) {
          playerCar.moveUp();
        }

        if (keyboard.isKeyPress(Keys.ARROW_LEFT)) {
          playerCar.moveLeft();
        }
        if (keyboard.isKeyPress(Keys.ARROW_RIGHT)) {
          playerCar.moveRight();
        }

        for (let i = 0; i < enemyCars.length; i++) {
          // Refresh after the movement
          const playerBounds = playerCar.sprite.getBounds();
          const car = enemyCars[i].sprite;

          let enemyBounds = car.getBounds();

          if ((enemyBounds.y - car.height) < GAME_HEIGHT) {
            car.y += enemySpeed;
          } else {
            app.stage.removeChild(car);
            // enemyCar.destroy();
            enemyCars.splice(i, 1);
            i = i -1;

            // Cars evaded
            enemyCarsEvaded = enemyCarsEvaded + 1;
            scoreText.text = getScoreText(enemyCarsEvaded);
            difficultyIncrease = false;
          }

          // After Movement
          enemyBounds = car.getBounds();

          // Mirrors
          const marginError = 2;

          if (
            (enemyBounds.y + (enemyBounds.height / 2)) >= (playerBounds.y - (playerBounds.height / 2)) &&
            (enemyBounds.y - (enemyBounds.height / 2)) <= (playerBounds.y + (playerBounds.height / 2)) &&
            (enemyBounds.x + (enemyBounds.width / 2) - marginError) >= (playerBounds.x - (playerBounds.width / 2) + marginError) &&
            (enemyBounds.x - (enemyBounds.width / 2) + marginError) <= (playerBounds.x + (playerBounds.width / 2) - marginError)
          ) {
            playerCar.explode();
            lost = true;
          }
        }
      } else {
        gameOverContainer.visible = true;
      }
    });
  }
};
