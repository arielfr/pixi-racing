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

function canMoveHowMuch(elX, elY, elWidth, elHeight, startMovement, endMovement, appHeight, speed) {
  const crashRight = ((elX + (elWidth / 2)) <= endMovement);
  const crashLeft = (elX >= (startMovement + (elWidth / 2)));
  const xProblem = crashRight && crashLeft;
  const yProblem = ((elY + elHeight) <= appHeight) && (elY >= 0);

  let missing = 0;

  if (!crashRight) {
    missing = endMovement - elX - (elWidth / 2);
  }

  if (!crashLeft) {
    missing = elX - startMovement;
  }

  return (xProblem && yProblem) ? speed : ((missing > 0) ? 5 : 0);
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
  constructor(appWidth, appHeight, gameSpeed) {
    this.container = undefined;
    this.linesContainer = undefined;

    this.appWidth = appWidth;
    this.appHeight = appHeight;
    this.gameSpeed = gameSpeed;

    this.xRoadStart = undefined;
    this.xRoadEnd = undefined;

    this.create();
  }

  createYellowLine(x, height) {
    const line = new PIXI.Graphics();

    line.beginFill(0xFFAFF00);
    line.drawRect(x, 0, 6, height);
    line.endFill();

    return line;
  }

  create() {
    const background = new PIXI.Container();
    const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);

    const dividedWidth = this.appWidth / 8;
    const roadWidth = (dividedWidth * 6);

    rectangle.width = roadWidth;
    rectangle.height = this.appHeight;
    rectangle.tint = 0xF646464;
    rectangle.x = dividedWidth;
    rectangle.y = 0;

    background.addChild(rectangle);

    const borderOne = PIXI.Sprite.from(PIXI.Texture.WHITE);

    borderOne.width = 6;
    borderOne.height = this.appHeight;
    borderOne.tint = 0xFFFFFF;
    borderOne.x = dividedWidth - 6;
    borderOne.y = 0;

    const borderTwo = PIXI.Sprite.from(PIXI.Texture.WHITE);

    borderTwo.width = 6;
    borderTwo.height = this.appHeight;
    borderTwo.tint = 0xFFFFFF;
    borderTwo.x = this.appWidth - dividedWidth;
    borderTwo.y = 0;

    background.addChild(this.createYellowLine(dividedWidth - 6, this.appHeight));
    background.addChild(this.createYellowLine(dividedWidth * 3, this.appHeight));
    background.addChild(this.createYellowLine(dividedWidth * 5, this.appHeight));
    background.addChild(this.createYellowLine(this.appWidth - dividedWidth, this.appHeight));

    this.xRoadStart = borderOne.x;
    this.xRoadEnd = borderTwo.x;

    const linesContainer = new PIXI.Container();

    const laneWidth = (roadWidth / 3);

    for (let j = 1; j <= 3; j++) {
      for (let i = 0; i <= (this.appHeight * 2); i = (i + 40 + 64)) {

        const laneLine = new PIXI.Graphics();

        laneLine.beginFill(0xFFFFFF);
        laneLine.drawRect(laneWidth * j, -this.appHeight + i + 16, 6, 64);
        laneLine.endFill();

        linesContainer.addChild(laneLine);
      }
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

function getScoreText(score) {
  return `SCORE: ${score}`;
}

// Create Keyboard
const keyboard = new KeyBoard().addEvents();

window.onload = function () {
  // Create the application
  const app = new PIXI.Application({
    width: 640,
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
    const gameDiv = document.getElementById('game');

    // Append the application
    gameDiv.appendChild(app.view);

    const background = new gameBackground(app.renderer.width, app.renderer.height, gameSpeed);

    app.stage.addChild(background.container);

    const score = new PIXI.Text(getScoreText(0), { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF, align: 'left', stroke: 'black', strokeThickness: 4 });

    score.x = 20;
    score.y = 20;

    app.stage.addChild(score);

    // Crete player Car
    const playerCar = new Car(app.loader.resources.player.texture)
      .setPosition(app.renderer.width / 2, app.renderer.height / 2);

    const playerCarSprite = playerCar.sprite;

    // add the car to the stage
    app.stage.addChild(playerCarSprite);

    // Indicates if the players loss
    let loss = false;
    // Enemy Cars
    const enemyCars = [];
    // Start game date
    let startDate = new Date();
    let enemyCardsEvaded = 0;
    let enemySpeed = 5;
    let msToReleaseEnemy = 400;
    let difficultyIncrease = false;
    const maxEnemySpeed = 14;
    const maxEnemyMsToRelease = 50;

    // Start Game Loop
    app.ticker.add(() => {
      // If the player didn't loss
      if (!loss) {
        const now = new Date();

        background.animate();

        // Check if is time to add a car enemy to the game and increase difficulty
        if ((now - startDate) >= msToReleaseEnemy) {
          startDate = now;

          // Get a random enemy sprite
          const enemyTexture = app.loader.resources[`enemy${randomBetween(1,5)}`].texture;

          const enemyCar = new Car(enemyTexture);

          enemyCar.setPosition(randomBetween(background.xRoadStart + (enemyCar.sprite.width / 2), background.xRoadEnd - (enemyCar.sprite.width / 2)), -16);

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
          }

          if (enemyCardsEvaded % 10 === 0 && msToReleaseEnemy <= maxEnemyMsToRelease) {
            msToReleaseEnemy = msToReleaseEnemy - 50;
          }
        }


        // each frame we spin the bunny around a bit
        // rectangle.rotation += 0.01;
        let playerBounds = playerCarSprite.getBounds();

        if (keyboard.isKeyPress(40)) {
          playerCarSprite.y = playerCarSprite.y + canMoveHowMuch(playerBounds.x, (playerBounds.y + gameSpeed), playerCarSprite.width, playerCarSprite.height, background.xRoadStart, background.xRoadEnd, app.renderer.height, gameSpeed);
        }
        if (keyboard.isKeyPress(38)) {
          playerCarSprite.y = playerCarSprite.y - canMoveHowMuch(playerBounds.x, (playerBounds.y - gameSpeed), playerCarSprite.width, playerCarSprite.height, background.xRoadStart, background.xRoadEnd, app.renderer.height, gameSpeed);
        }

        if (keyboard.isKeyPress(37)) {
          playerCarSprite.x = playerCarSprite.x - canMoveHowMuch((playerBounds.x - gameSpeed), playerBounds.y, playerCarSprite.width, playerCarSprite.height, background.xRoadStart, background.xRoadEnd, app.renderer.height, gameSpeed);
        }
        if (keyboard.isKeyPress(39)) {
          playerCarSprite.x = playerCarSprite.x + canMoveHowMuch((playerBounds.x + gameSpeed), playerBounds.y, playerCarSprite.width, playerCarSprite.height, background.xRoadStart, background.xRoadEnd, app.renderer.height, gameSpeed);
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
            score.text = getScoreText(enemyCardsEvaded);
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
      }
    });
  }
};
