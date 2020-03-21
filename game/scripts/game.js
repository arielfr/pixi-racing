class KeyBoard {
  constructor() {
    this.keys = {};
  }

  addEvents () {
    window.addEventListener('keydown', (event) => {
      this.keys[event.keyCode] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.keyCode] = false;
    });

    return this;
  }

  getKeys() {
    return this.keys;
  }

  isKeyPress(keyCode) {
    return this.getKeys()[keyCode];
  }
}

function canMoveHowMuch(elX, elY, elWidth, elHeight, xStartMovement, endMovement, appHeight, speed, moveX, moveY) {
  const notCrashRight = ((elX + (elWidth / 2)) <= endMovement);
  const notCrashLeft = (elX >= (xStartMovement + (elWidth / 2)));
  const notCrashTop = (elY >= 0);
  const notCrashBottom = (((elY + elHeight) <= appHeight));

  const xNotProblem = notCrashRight && notCrashLeft;
  const yNotProblem = notCrashBottom && notCrashTop;

  let missing = 0;

  if (!notCrashRight && moveX) {
    missing = endMovement - elX - (elWidth / 2);
  }

  if (!notCrashLeft && moveX) {
    missing = elX - xStartMovement;
  }
  if (!notCrashTop && moveY) {
    missing = elY - 0;
  }

  if (!notCrashBottom && moveY) {
    missing = appHeight - (elY + elHeight);
  }

  return ((xNotProblem && moveX) || (yNotProblem && moveY)) ? speed : ((missing > 0) ? 5 : 0);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

class Car {
  constructor(texture) {
    this.sprite = null;
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

    return this;
  }

  setPosition(x, y) {
    // Setup the position of the bunny
    this.sprite.x = x;
    this.sprite.y = y;

    return this;
  }
}

class gameBackground {
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

    line.beginFill(0xF646464);
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

// Create Keyboard
const keyboard = new KeyBoard().addEvents();

window.onload = function () {
  // Create the application
  const app = new PIXI.Application({
    width: 320,
    height: 640,
    backgroundColor: 0x659B35,
  });

  // Load the assets
  app.loader.add('player', 'assets/BlackOut.png');
  app.loader.add('enemy1', 'assets/RedStrip.png');
  app.loader.add('enemy2', 'assets/BlueStrip.png');
  app.loader.add('enemy3', 'assets/GreenStrip.png');
  app.loader.add('enemy4', 'assets/PinkStrip.png');
  app.loader.add('enemy5', 'assets/WhiteStrip.png');

  // When all the assets are loaded start the game
  app.loader.onComplete.add(startGame);

  // Start the application
  app.loader.load();

  function startGame () {
    const gameSpeed = 5;
    const lanes = 2;
    const gameDiv = document.getElementById('game');

    // Allow zIndex usage
    app.stage.sortableChildren = true;

    // Append the application
    gameDiv.appendChild(app.view);

    // Create Scenario
    const scenario = new gameBackground(app.renderer.width, app.renderer.height, gameSpeed, lanes);

    const textContainer = new PIXI.Container();

    // Create Score
    const scoreText = new PIXI.Text(getScoreText(0), { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    scoreText.x = 20;
    scoreText.y = 20;

    // Create Score
    const enemySpeedText = new PIXI.Text(getEnemySpeedText(0), { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 2 });

    enemySpeedText.x = 20;
    enemySpeedText.y = 50;

    // Create Score
    const msToReleaseText = new PIXI.Text(getMsToReleaseText(0), { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 2 });

    msToReleaseText.x = 20;
    msToReleaseText.y = 70;

    textContainer.addChild(scoreText);
    textContainer.addChild(enemySpeedText);
    textContainer.addChild(msToReleaseText);

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

    gameOverContainer.x = (app.renderer.width / 2) - (gameOverContainer.width / 2);
    gameOverContainer.y = (app.renderer.height / 2) - (gameOverContainer.height / 2);
    gameOverContainer.zIndex = 200;

    gameOverContainer.visible = false;

    // Crete Player Car
    const playerCar = new Car(app.loader.resources.player.texture)
      .setPosition(app.renderer.width / 2, app.renderer.height / 2);

    const playerCarSprite = playerCar.sprite;

    app.stage.addChild(scenario.container);
    app.stage.addChild(textContainer);
    app.stage.addChild(gameOverContainer);
    app.stage.addChild(playerCarSprite);

    // Indicates if the players loss
    let loss = false;
    // Enemy Cars
    let enemyCars = [];
    // Start game date
    let startDate = new Date();
    let enemyCardsEvaded = 0;
    let enemySpeed = gameSpeed;
    let msToReleaseEnemy = 400;
    let difficultyIncrease = false;
    const maxEnemySpeed = 12;
    const maxEnemyMsToRelease = 200;

    enemySpeedText.text = getEnemySpeedText(enemySpeed);
    msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

    restartButton.on('click', () => {
      enemyCars.forEach(c => {
        app.stage.removeChild(c);
      });

      enemyCars = [];
      enemyCardsEvaded = 0;
      enemySpeed = gameSpeed;
      msToReleaseEnemy = 400;
      difficultyIncrease = false;
      startDate = new Date();

      playerCar.setPosition(app.renderer.width / 2, app.renderer.height / 2);
      scoreText.text = getScoreText(0);
      enemySpeedText.text = getEnemySpeedText(enemySpeed);
      msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

      loss = false;
      gameOverContainer.visible = false;
    });

    // Start Game Loop
    app.ticker.add(() => {
      // If the player didn't loss
      if (!loss) {
        const now = new Date();

        scenario.animate();

        // Check if is time to add a car enemy to the game and increase difficulty
        if ((now - startDate) >= msToReleaseEnemy) {
          startDate = now;

          // Get a random enemy sprite
          const enemyTexture = app.loader.resources[`enemy${randomBetween(1,5)}`].texture;

          const enemyCar = new Car(enemyTexture);

          const whichLane = randomBetween(1, 4);
          const laneToPushEnemy = scenario.lanesPos[whichLane - 1];

          enemyCar.setPosition(laneToPushEnemy.x, -enemyCar.sprite.height);

          // Add Enemy Car
          enemyCars.push(enemyCar.sprite);

          // Add to the stage
          app.stage.addChild(enemyCars[enemyCars.length - 1]);
        }

        // Check if need to increase difficulty
        if (enemyCardsEvaded !== 0 && !difficultyIncrease) {
          difficultyIncrease = true;

          if (enemyCardsEvaded % 10 === 0 && enemySpeed <= maxEnemySpeed) {
            enemySpeed = enemySpeed + 1;
            enemySpeedText.text = getEnemySpeedText(enemySpeed);
          }

          if (enemyCardsEvaded % 20 === 0 && msToReleaseEnemy >= maxEnemyMsToRelease) {
            msToReleaseEnemy = msToReleaseEnemy - 50;
            msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);
          }
        }


        // each frame we spin the bunny around a bit
        // rectangle.rotation += 0.01;
        let playerBounds = playerCarSprite.getBounds();

        if (keyboard.isKeyPress(40)) {
          playerCarSprite.y = playerCarSprite.y + canMoveHowMuch(playerBounds.x, (playerBounds.y + gameSpeed), playerCarSprite.width, playerCarSprite.height, scenario.xRoadStart, scenario.xRoadEnd, app.renderer.height, gameSpeed, false, true);
        }
        if (keyboard.isKeyPress(38)) {
          playerCarSprite.y = playerCarSprite.y - canMoveHowMuch(playerBounds.x, (playerBounds.y - gameSpeed), playerCarSprite.width, playerCarSprite.height, scenario.xRoadStart, scenario.xRoadEnd, app.renderer.height, gameSpeed, false, true);
        }

        if (keyboard.isKeyPress(37)) {
          playerCarSprite.x = playerCarSprite.x - canMoveHowMuch((playerBounds.x - gameSpeed), playerBounds.y, playerCarSprite.width, playerCarSprite.height, scenario.xRoadStart, scenario.xRoadEnd, app.renderer.height, gameSpeed, true, false);
        }
        if (keyboard.isKeyPress(39)) {
          playerCarSprite.x = playerCarSprite.x + canMoveHowMuch((playerBounds.x + gameSpeed), playerBounds.y, playerCarSprite.width, playerCarSprite.height, scenario.xRoadStart, scenario.xRoadEnd, app.renderer.height, gameSpeed, true, false);
        }

        // Refresh after the movement
        playerBounds = playerCarSprite.getBounds();

        for (let i = 0; i < enemyCars.length; i++) {
          const car = enemyCars[i];

          let enemyBounds = car.getBounds();

          if ((enemyBounds.y - car.height) < app.renderer.height) {
            car.y += enemySpeed;
          } else {
            app.stage.removeChild(car);
            // enemyCar.destroy();
            enemyCars.splice(i, 1);
            i = i -1;

            // Cars evaded
            enemyCardsEvaded = enemyCardsEvaded + 1;
            scoreText.text = getScoreText(enemyCardsEvaded);
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
            loss = true;
          }
        }
      } else {
        gameOverContainer.visible = true;
      }
    });
  }
};