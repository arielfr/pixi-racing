/**
 * Main game logic
 * Handles game initialization, game loop, and UI
 */

// Utility functions for text display
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

function getCarsEvadedText(value) {
  return `CARS EVADED: ${value}`;
}

function getCarsToUnlockText(value) {
  return value > 0 ? `CARS TO UNLOCK: ${value}` : `CARS TO UNLOCK: N/A`;
}

function getActivePowerUpText(active, name) {
  return active ? `ACTIVE: ${name}` : `ACTIVE: None`;
}

function getPowerUpTimeText(timeLeft) {
  return timeLeft > 0 ? `TIME LEFT: ${timeLeft}s` : `TIME LEFT: N/A`;
}

// Create Keyboard
const keyboard = new KeyBoard().addEvents();

// Create Audio Manager
const audioManager = new AudioManager();

// Detect if device is mobile/touch
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
}

const isMobile = isMobileDevice();

window.onload = function () {
  // Use fixed game dimensions
  const windowWidth = GameConfig.GAME_WIDTH;
  const windowHeight = GameConfig.GAME_HEIGHT;

  // Create the application with fixed dimensions
  const app = new PIXI.Application({
    width: windowWidth,
    height: windowHeight,
    backgroundColor: GameConfig.BACKGROUND_COLOR,
    resolution: GameConfig.RESOLUTION,
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

  function startGame() {
    const FPS = PIXI.Ticker.shared.FPS;
    const gameDiv = document.getElementById('game');

    // Allow zIndex usage
    app.stage.sortableChildren = true;

    // Append the application
    gameDiv.appendChild(app.view);

    // Create Scenario using fixed dimensions
    const scenario = new GameBackground(
      windowWidth,
      windowHeight,
      GameConfig.GAME_SPEED,
      GameConfig.LANES
    );

    const textContainer = new PIXI.Container();

    // Create Score text
    const scoreText = new PIXI.Text(getScoreText(0), {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'left',
      stroke: 'black',
      strokeThickness: 4
    });

    scoreText.x = 20;
    scoreText.y = 20;

    // Create Mute indicator
    const muteText = new PIXI.Text('[M] MUTED', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFF0000,
      align: 'left',
      stroke: 'black',
      strokeThickness: 3
    });
    muteText.x = 20;
    muteText.y = windowHeight - 30;
    muteText.visible = false;

    textContainer.addChild(scoreText);
    textContainer.addChild(muteText);
    textContainer.zIndex = 100;

    // Create Debug Container (top right, hidden by default)
    const debugContainer = new PIXI.Container();
    debugContainer.zIndex = 100;

    // Debug background (black with opacity)
    const debugBackground = new PIXI.Graphics();
    debugBackground.beginFill(0x000000, 0.7);
    debugBackground.drawRect(0, 0, 150, 132);
    debugBackground.endFill();
    debugContainer.addChild(debugBackground);

    // Create Enemy Speed text
    const enemySpeedText = new PIXI.Text(getEnemySpeedText(0), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF,
      align: 'left'
    });
    enemySpeedText.x = 6;
    enemySpeedText.y = 6;

    // Create MS to Release text
    const msToReleaseText = new PIXI.Text(getMsToReleaseText(0), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF,
      align: 'left'
    });
    msToReleaseText.x = 6;
    msToReleaseText.y = 24;

    // Create Cars Evaded text
    const carsEvadedText = new PIXI.Text(getCarsEvadedText(0), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF,
      align: 'left'
    });
    carsEvadedText.x = 6;
    carsEvadedText.y = 42;

    // Create FPS text
    const fpsText = new PIXI.Text(getFPS(FPS), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFFFF,
      align: 'left'
    });
    fpsText.x = 6;
    fpsText.y = 60;

    // Create Cars to Unlock text
    const carsToUnlockText = new PIXI.Text(getCarsToUnlockText(GameConfig.POWERUP_START_THRESHOLD), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xFFFF00,
      align: 'left'
    });
    carsToUnlockText.x = 6;
    carsToUnlockText.y = 78;

    // Create Active Power-up text
    const activePowerUpText = new PIXI.Text(getActivePowerUpText(false, ''), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0x00FFFF,
      align: 'left'
    });
    activePowerUpText.x = 6;
    activePowerUpText.y = 96;

    // Create Power-up Time Left text
    const powerUpTimeText = new PIXI.Text(getPowerUpTimeText(0), {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0x00FFFF,
      align: 'left'
    });
    powerUpTimeText.x = 6;
    powerUpTimeText.y = 114;

    debugContainer.addChild(enemySpeedText);
    debugContainer.addChild(msToReleaseText);
    debugContainer.addChild(carsEvadedText);
    debugContainer.addChild(fpsText);
    debugContainer.addChild(carsToUnlockText);
    debugContainer.addChild(activePowerUpText);
    debugContainer.addChild(powerUpTimeText);

    // Position debug container in top right
    debugContainer.x = windowWidth - 160;
    debugContainer.y = 10;

    // Hide by default
    debugContainer.visible = false;

    app.stage.addChild(scenario.container);
    app.stage.addChild(textContainer);
    app.stage.addChild(debugContainer);

    // Create Game Over container with overlay
    const gameOverContainer = new PIXI.Container();
    gameOverContainer.zIndex = 200;

    // Semi-transparent background overlay
    const gameOverBackground = new PIXI.Graphics();
    gameOverBackground.beginFill(0x000000, 0.85);
    gameOverBackground.drawRect(0, 0, windowWidth, windowHeight);
    gameOverBackground.endFill();
    gameOverContainer.addChild(gameOverBackground);

    // Game Over title
    const gameOverText = new PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 52,
      fill: 0xFF0000,
      align: 'center',
      stroke: 'black',
      strokeThickness: 6
    });
    gameOverText.x = (windowWidth / 2) - (gameOverText.width / 2);
    gameOverText.y = 120;
    gameOverContainer.addChild(gameOverText);

    // Final score text (will be updated when game ends)
    const finalScoreText = new PIXI.Text('SCORE: 0', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFF00,
      align: 'center',
      stroke: 'black',
      strokeThickness: 4
    });
    finalScoreText.x = (windowWidth / 2) - (finalScoreText.width / 2);
    finalScoreText.y = 200;
    gameOverContainer.addChild(finalScoreText);

    // Separator line
    const separator = new PIXI.Graphics();
    separator.lineStyle(3, 0xFFFFFF, 0.5);
    separator.moveTo(60, 280);
    separator.lineTo(windowWidth - 60, 280);
    gameOverContainer.addChild(separator);

    // Play Again button
    const restartButton = new PIXI.Text('PLAY AGAIN', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0x00FF00,
      align: 'center',
      stroke: 'black',
      strokeThickness: 5,
      fontWeight: 'bold'
    });
    restartButton.x = (windowWidth / 2) - (restartButton.width / 2);
    restartButton.y = 320;
    restartButton.interactive = true;
    restartButton.buttonMode = true;
    restartButton.cursor = 'pointer';
    gameOverContainer.addChild(restartButton);

    // Instruction text for restart
    const restartInstructionText = new PIXI.Text(
      isMobile ? 'Tap to restart' : 'Click or press SPACE',
      {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xCCCCCC,
        align: 'center',
        stroke: 'black',
        strokeThickness: 3
      }
    );
    restartInstructionText.x = (windowWidth / 2) - (restartInstructionText.width / 2);
    restartInstructionText.y = 420;
    gameOverContainer.addChild(restartInstructionText);

    gameOverContainer.visible = false;

    // Create player car
    const playerCar = new PlayerCar(
      app,
      scenario.xRoadStart,
      scenario.xRoadEnd,
      windowHeight,
      GameConfig.PLAYER_SPEED
    ).setPosition(windowWidth / 2, windowHeight / 2);

    // Create shield visual indicator (semi-transparent bubble over player)
    const shieldIndicator = new PIXI.Graphics();
    shieldIndicator.beginFill(0x00FFFF, 0.25); // Cyan with 25% opacity
    shieldIndicator.lineStyle(3, 0x00FFFF, 0.8); // Bright cyan border
    shieldIndicator.drawCircle(0, 0, 35);
    shieldIndicator.endFill();
    shieldIndicator.zIndex = 110; // Above the player car
    shieldIndicator.visible = false;

    // Create slow-mo visual overlay (purple tint)
    const slowmoOverlay = new PIXI.Graphics();
    slowmoOverlay.beginFill(0x8B00FF, 1.0); // Purple with full opacity (alpha controlled separately)
    slowmoOverlay.drawRect(0, 0, windowWidth, windowHeight);
    slowmoOverlay.endFill();
    slowmoOverlay.zIndex = 95;
    slowmoOverlay.alpha = 0.15; // Control transparency here (15%)
    slowmoOverlay.visible = false;

    app.stage.addChild(gameOverContainer);
    app.stage.addChild(playerCar.sprite);
    app.stage.addChild(playerCar.explosion);
    app.stage.addChild(slowmoOverlay);
    app.stage.addChild(shieldIndicator); // Add shield on top

    // Create Start Screen
    const startScreenContainer = new PIXI.Container();
    startScreenContainer.zIndex = 300;

    // Semi-transparent background
    const startBackground = new PIXI.Graphics();
    startBackground.beginFill(0x000000, 0.8);
    startBackground.drawRect(0, 0, windowWidth, windowHeight);
    startBackground.endFill();
    startScreenContainer.addChild(startBackground);

    // Title
    const titleText = new PIXI.Text('PIXI RACING', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFF00,
      align: 'center',
      stroke: 'black',
      strokeThickness: 6
    });
    titleText.x = (windowWidth / 2) - (titleText.width / 2);
    titleText.y = 80;
    startScreenContainer.addChild(titleText);

    // Instructions title
    const instructionsTitle = new PIXI.Text('CONTROLS', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 'black',
      strokeThickness: 4
    });
    instructionsTitle.x = (windowWidth / 2) - (instructionsTitle.width / 2);
    instructionsTitle.y = 180;
    startScreenContainer.addChild(instructionsTitle);

    // Instructions based on device type
    const instructions = isMobile ? [
      { key: 'TAP & HOLD', action: 'to steer car' }
    ] : [
      { key: 'UP', action: 'Move Up' },
      { key: 'DOWN', action: 'Move Down' },
      { key: 'LEFT', action: 'Move Left' },
      { key: 'RIGHT', action: 'Move Right' }
    ];

    let instructionY = isMobile ? 260 : 240;
    instructions.forEach(instruction => {
      // Create a container for each instruction line
      const lineContainer = new PIXI.Container();

      // Key text (bold, highlighted)
      const keyText = new PIXI.Text(instruction.key, {
        fontFamily: 'Arial',
        fontSize: isMobile ? 20 : 22,
        fill: 0xFFFF00,
        align: 'left',
        stroke: 'black',
        strokeThickness: 3,
        fontWeight: 'bold'
      });

      // Arrow symbol
      const arrowText = new PIXI.Text('>', {
        fontFamily: 'Arial',
        fontSize: isMobile ? 20 : 22,
        fill: 0x00FF00,
        align: 'center',
        stroke: 'black',
        strokeThickness: 2
      });

      // Action text
      const actionText = new PIXI.Text(instruction.action, {
        fontFamily: 'Arial',
        fontSize: isMobile ? 20 : 22,
        fill: 0xFFFFFF,
        align: 'left',
        stroke: 'black',
        strokeThickness: 3
      });

      // Position elements
      keyText.x = 0;
      arrowText.x = keyText.width + 10;
      actionText.x = arrowText.x + arrowText.width + 10;

      lineContainer.addChild(keyText);
      lineContainer.addChild(arrowText);
      lineContainer.addChild(actionText);

      // Center the line container
      lineContainer.x = (windowWidth / 2) - (lineContainer.width / 2);
      lineContainer.y = instructionY;

      startScreenContainer.addChild(lineContainer);
      instructionY += isMobile ? 50 : 40;
    });

    // Add mobile-specific instructions
    if (isMobile) {
      const mobileHint = new PIXI.Text('Car follows your finger', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xFFFF00,
        align: 'center',
        stroke: 'black',
        strokeThickness: 3
      });
      mobileHint.x = (windowWidth / 2) - (mobileHint.width / 2);
      mobileHint.y = 340;
      startScreenContainer.addChild(mobileHint);
    }

    // Objective text
    const objectiveText = new PIXI.Text('Avoid enemy cars and survive!', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xCCCCCC,
      align: 'center',
      stroke: 'black',
      strokeThickness: 3
    });
    objectiveText.x = (windowWidth / 2) - (objectiveText.width / 2);
    objectiveText.y = isMobile ? 400 : 420;
    startScreenContainer.addChild(objectiveText);

    // Press any key text with blinking effect
    const pressKeyText = new PIXI.Text(
      isMobile ? 'Tap to start' : 'Press any arrow key to start',
      {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0x00FF00,
        align: 'center',
        stroke: 'black',
        strokeThickness: 3
      }
    );
    pressKeyText.x = (windowWidth / 2) - (pressKeyText.width / 2);
    pressKeyText.y = isMobile ? 480 : 520;
    startScreenContainer.addChild(pressKeyText);

    // Add blinking animation to press key text
    let blinkTime = 0;
    const blinkSpeed = 0.05;

    app.stage.addChild(startScreenContainer);

    // Game state variables
    let gameStarted = false;
    let lost = false;
    let enemyCars = [];
    let startTime = Date.now();
    let score = 0;  // Total score (points)
    let carsEvadedCount = 0;  // Actual number of cars evaded (for difficulty)
    let enemySpeed = GameConfig.INITIAL_ENEMY_SPEED;
    let msToReleaseEnemy = GameConfig.INITIAL_MS_TO_RELEASE;
    let difficultyIncrease = false;

    // Visual effects variables
    let screenShake = 0;
    let scorePopups = [];

    // Power-up variables
    let shields = [];
    let shieldActive = false;
    let shieldEndTime = 0;

    let slowmos = [];
    let slowmoActive = false;
    let slowmoEndTime = 0;
    let slowmoTransitioning = false;
    let slowmoTransitionStartTime = 0;
    const SLOWMO_TRANSITION_DURATION = 1000; // 1 second transition

    // Speed lines container
    const speedLinesContainer = new PIXI.Container();
    speedLinesContainer.zIndex = 50;
    app.stage.addChild(speedLinesContainer);

    // Create speed lines
    const speedLines = [];
    for (let i = 0; i < 15; i++) {
      const line = new PIXI.Graphics();
      line.lineStyle(2, 0xFFFFFF, 0.3);
      line.moveTo(0, 0);
      line.lineTo(0, randomBetween(20, 50));
      line.x = randomBetween(scenario.xRoadStart + 10, scenario.xRoadEnd - 10);
      line.y = randomBetween(-windowHeight, 0);
      speedLinesContainer.addChild(line);
      speedLines.push({
        sprite: line,
        baseSpeed: randomBetween(3, 6)
      });
    }

    enemySpeedText.text = getEnemySpeedText(enemySpeed);
    msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

    // Function to check if a position is clear of enemy cars
    function isPositionClearOfEnemies(x, y, safeDistance = 80) {
      for (let i = 0; i < enemyCars.length; i++) {
        const car = enemyCars[i].sprite;
        const carBounds = car.getBounds();

        // Check if the power-up would be too close to this enemy car
        const distance = Math.sqrt(
          Math.pow(x - (carBounds.x + carBounds.width / 2), 2) +
          Math.pow(y - (carBounds.y + carBounds.height / 2), 2)
        );

        if (distance < safeDistance) {
          return false; // Too close to an enemy car
        }
      }
      return true; // Position is clear
    }

    // Function to create a shield pickup
    function createShield(x, y) {
      const shield = new PIXI.Graphics();

      // Draw shield icon (hexagon shape)
      shield.beginFill(0x00FFFF, 0.8);
      shield.lineStyle(2, 0xFFFFFF, 1);

      const size = 15;
      shield.moveTo(size, 0);
      for (let i = 1; i <= 6; i++) {
        const angle = (Math.PI / 3) * i;
        shield.lineTo(size * Math.cos(angle), size * Math.sin(angle));
      }
      shield.endFill();

      shield.x = x;
      shield.y = y;
      shield.zIndex = 80;

      return shield;
    }

    // Function to create a slow-mo pickup
    function createSlowmo(x, y) {
      const slowmo = new PIXI.Graphics();

      // Draw clock/hourglass icon (circle with clock hands)
      slowmo.beginFill(0x8B00FF, 0.8); // Purple
      slowmo.lineStyle(2, 0xFFFFFF, 1);
      slowmo.drawCircle(0, 0, 15);
      slowmo.endFill();

      // Draw clock hands
      slowmo.lineStyle(2, 0xFFFFFF, 1);
      slowmo.moveTo(0, 0);
      slowmo.lineTo(0, -8); // Hour hand (up)
      slowmo.moveTo(0, 0);
      slowmo.lineTo(6, 0); // Minute hand (right)

      slowmo.x = x;
      slowmo.y = y;
      slowmo.zIndex = 80;

      return slowmo;
    }

    // Start game handler - listen for arrow key press only
    function startGameHandler(event) {
      const arrowKeys = [Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT];

      if (!gameStarted && !lost && arrowKeys.includes(event.code)) {
        gameStarted = true;
        startScreenContainer.visible = false;
        startTime = Date.now();
        window.removeEventListener('keydown', startGameHandler);

        // Start background music
        audioManager.startBackgroundMusic();
      }
    }

    // Touch handler to start game on mobile
    function touchStartGameHandler(event) {
      if (!gameStarted && !lost) {
        gameStarted = true;
        startScreenContainer.visible = false;
        startTime = Date.now();
        app.view.removeEventListener('touchstart', touchStartGameHandler);

        // Start background music
        audioManager.startBackgroundMusic();
      }
    }

    // Add appropriate event listeners based on device
    if (isMobile) {
      app.view.addEventListener('touchstart', touchStartGameHandler);
    } else {
      window.addEventListener('keydown', startGameHandler);
    }

    // Debug mode toggle with B key
    window.addEventListener('keydown', (event) => {
      if (event.code === Keys.KEY_B) {
        debugContainer.visible = !debugContainer.visible;
      }
    });

    // Mute toggle with M key
    window.addEventListener('keydown', (event) => {
      if (event.code === Keys.KEY_M) {
        const isMuted = audioManager.toggleMute();
        muteText.visible = isMuted;
      }
    });

    // Restart button handler function
    function restartGame() {
      // Remove old keyboard listener if it exists
      if (!isMobile && keyboardRestartHandler) {
        window.removeEventListener('keydown', keyboardRestartHandler);
      }

      // Remove enemy cars
      enemyCars.forEach(c => {
        app.stage.removeChild(c.sprite);
      });

      // Clean up score popups
      scorePopups.forEach(popup => {
        app.stage.removeChild(popup);
      });
      scorePopups = [];

      // Clean up shields
      shields.forEach(s => {
        app.stage.removeChild(s);
      });
      shields = [];

      // Clean up slow-mos
      slowmos.forEach(s => {
        app.stage.removeChild(s);
      });
      slowmos = [];

      // Reset shield state
      shieldActive = false;
      shieldEndTime = 0;
      shieldIndicator.visible = false;

      // Reset slow-mo state
      slowmoActive = false;
      slowmoEndTime = 0;
      slowmoTransitioning = false;
      slowmoTransitionStartTime = 0;
      slowmoOverlay.visible = false;
      slowmoOverlay.alpha = 0.15; // Reset alpha

      // Reset screen shake
      screenShake = 0;
      app.stage.position.x = 0;
      app.stage.position.y = 0;

      enemyCars = [];
      score = 0;
      carsEvadedCount = 0;
      enemySpeed = GameConfig.INITIAL_ENEMY_SPEED;
      msToReleaseEnemy = GameConfig.INITIAL_MS_TO_RELEASE;
      difficultyIncrease = false;
      startTime = Date.now();

      playerCar.setPosition(windowWidth / 2, windowHeight / 2);
      playerCar.explosion.gotoAndStop(-1);
      playerCar.explosion.visible = false; // Hide explosion on restart
      scoreText.text = getScoreText(0);
      enemySpeedText.text = getEnemySpeedText(enemySpeed);
      msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);

      // Start playing immediately - skip start screen
      lost = false;
      gameStarted = true;
      gameOverContainer.visible = false;
      startScreenContainer.visible = false;

      // Restart background music
      audioManager.startBackgroundMusic();

      // Recreate keyboard restart handler for next game over (space key only)
      if (!isMobile) {
        keyboardRestartHandler = (event) => {
          if (lost && gameOverContainer.visible && event.code === Keys.SPACE) {
            restartGame();
          }
        };
      }
    }

    // Restart button handlers for both mouse and touch
    restartButton.on('click', restartGame);
    restartButton.on('tap', restartGame);
    restartButton.on('pointerdown', restartGame);

    // Keyboard restart handler for desktop (space key only)
    let keyboardRestartHandler = null;
    if (!isMobile) {
      keyboardRestartHandler = (event) => {
        if (lost && gameOverContainer.visible && event.code === Keys.SPACE) {
          restartGame();
        }
      };
    }

    // Touch controls for mobile gameplay
    let touchActive = false;
    let touchX = 0;

    if (isMobile) {
      app.view.addEventListener('touchstart', (event) => {
        if (gameStarted && !lost) {
          touchActive = true;
          const touch = event.touches[0];
          const rect = app.view.getBoundingClientRect();
          touchX = touch.clientX - rect.left;
        }
      });

      app.view.addEventListener('touchmove', (event) => {
        if (gameStarted && !lost && touchActive) {
          const touch = event.touches[0];
          const rect = app.view.getBoundingClientRect();
          touchX = touch.clientX - rect.left;
        }
      });

      app.view.addEventListener('touchend', () => {
        touchActive = false;
      });
    }

    // Start Game Loop
    app.ticker.add(() => {
      // Update debug info
      fpsText.text = getFPS(FPS);
      carsEvadedText.text = getCarsEvadedText(carsEvadedCount);

      // Update power-up debug info
      const carsRemaining = carsEvadedCount < GameConfig.POWERUP_START_THRESHOLD
        ? GameConfig.POWERUP_START_THRESHOLD - carsEvadedCount
        : 0;
      carsToUnlockText.text = getCarsToUnlockText(carsRemaining);

      // Show active power-up (prioritize shield, then slow-mo)
      if (shieldActive) {
        activePowerUpText.text = getActivePowerUpText(true, 'Shield');
        const timeLeft = Math.max(0, Math.ceil((shieldEndTime - Date.now()) / 1000));
        powerUpTimeText.text = getPowerUpTimeText(timeLeft);
      } else if (slowmoActive) {
        activePowerUpText.text = getActivePowerUpText(true, 'Slow-Mo');
        const timeLeft = Math.max(0, Math.ceil((slowmoEndTime - Date.now()) / 1000));
        powerUpTimeText.text = getPowerUpTimeText(timeLeft);
      } else if (slowmoTransitioning) {
        activePowerUpText.text = getActivePowerUpText(true, 'Slow-Mo (Fading)');
        const transitionTimeLeft = Math.max(0, Math.ceil((SLOWMO_TRANSITION_DURATION - (Date.now() - slowmoTransitionStartTime)) / 1000));
        powerUpTimeText.text = getPowerUpTimeText(transitionTimeLeft);
      } else {
        activePowerUpText.text = getActivePowerUpText(false, '');
        powerUpTimeText.text = getPowerUpTimeText(0);
      }

      // Update screen shake effect
      if (screenShake > 0) {
        app.stage.position.x = (Math.random() - 0.5) * screenShake;
        app.stage.position.y = (Math.random() - 0.5) * screenShake;
        screenShake *= 0.9; // Decay shake

        if (screenShake < 0.1) {
          screenShake = 0;
          app.stage.position.x = 0;
          app.stage.position.y = 0;
        }
      }

      // Update score popups
      for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y -= 2;
        popup.alpha -= 0.02;

        if (popup.alpha <= 0) {
          app.stage.removeChild(popup);
          scorePopups.splice(i, 1);
        }
      }

      // Update speed lines
      if (gameStarted && !lost) {
        speedLines.forEach(line => {
          line.sprite.y += (GameConfig.GAME_SPEED + line.baseSpeed);

          if (line.sprite.y > windowHeight) {
            line.sprite.y = -50;
            line.sprite.x = randomBetween(scenario.xRoadStart + 10, scenario.xRoadEnd - 10);
          }
        });
      }

      // Update shield indicator position and rotation
      shieldIndicator.x = playerCar.sprite.x;
      shieldIndicator.y = playerCar.sprite.y;
      if (shieldActive) {
        shieldIndicator.rotation += 0.05; // Rotate shield for visual effect
      }

      // Check if shield should expire
      if (shieldActive && Date.now() >= shieldEndTime) {
        shieldActive = false;
        shieldIndicator.visible = false;
      }

      // Check if slow-mo should expire and start transition
      if (slowmoActive && Date.now() >= slowmoEndTime) {
        slowmoActive = false;
        slowmoTransitioning = true;
        slowmoTransitionStartTime = Date.now();
      }

      // Handle slow-mo transition (gradual speed return)
      if (slowmoTransitioning) {
        const transitionElapsed = Date.now() - slowmoTransitionStartTime;
        const transitionProgress = Math.min(transitionElapsed / SLOWMO_TRANSITION_DURATION, 1.0);

        // Fade out overlay gradually
        slowmoOverlay.alpha = 0.15 * (1 - transitionProgress);

        // Transition complete
        if (transitionProgress >= 1.0) {
          slowmoTransitioning = false;
          slowmoOverlay.visible = false;
          slowmoOverlay.alpha = 0.15; // Reset alpha for next time
        }
      }

      // Update slow-mo overlay visibility
      slowmoOverlay.visible = slowmoActive || slowmoTransitioning;

      // Blinking animation for start screen
      if (!gameStarted && !lost) {
        blinkTime += blinkSpeed;
        pressKeyText.alpha = Math.abs(Math.sin(blinkTime));
      }

      // If the game has started and player hasn't lost
      if (gameStarted && !lost) {
        const now = Date.now();

        scenario.animate();

        // Check if is time to add an enemy car to the game and increase difficulty
        if ((now - startTime) >= msToReleaseEnemy) {
          startTime = now;

          const enemyCar = new EnemyCar(
            app,
            scenario.xRoadStart,
            scenario.xRoadEnd,
            windowHeight,
            GameConfig.GAME_SPEED
          );

          enemyCar.invoke((scenario.lanes * 2), scenario.lanesPos);

          // Track near miss status and scoring
          enemyCar.nearMissTriggered = false;
          enemyCar.pointsAwarded = false;
          enemyCar.popupShown = false;

          // Add Enemy Car
          enemyCars.push(enemyCar);

          // Add to the stage
          app.stage.addChild(enemyCars[enemyCars.length - 1].sprite);

          // Chance to spawn power-ups (only if player has evaded enough cars and NO power-up is active)
          const anyPowerUpActive = shieldActive || slowmoActive || slowmoTransitioning;

          if (carsEvadedCount >= GameConfig.POWERUP_START_THRESHOLD && !anyPowerUpActive) {
            // Spawn shield (only if position is clear of enemies)
            if (Math.random() < GameConfig.SHIELD_SPAWN_CHANCE) {
              const randomLane = randomBetween(0, (scenario.lanes * 2) - 1);
              const shieldX = scenario.lanesPos[randomLane].x;
              const shieldY = -50;

              // Only spawn if position is clear of enemy cars
              if (isPositionClearOfEnemies(shieldX, shieldY)) {
                const shield = createShield(shieldX, shieldY);
                shields.push(shield);
                app.stage.addChild(shield);
              }
            }

            // Spawn slow-mo (only if position is clear of enemies)
            if (Math.random() < GameConfig.SLOWMO_SPAWN_CHANCE) {
              const randomLane = randomBetween(0, (scenario.lanes * 2) - 1);
              const slowmoX = scenario.lanesPos[randomLane].x;
              const slowmoY = -50;

              // Only spawn if position is clear of enemy cars
              if (isPositionClearOfEnemies(slowmoX, slowmoY)) {
                const slowmo = createSlowmo(slowmoX, slowmoY);
                slowmos.push(slowmo);
                app.stage.addChild(slowmo);
              }
            }
          }
        }

        // Check if need to increase difficulty based on actual cars evaded
        if (carsEvadedCount !== 0 && !difficultyIncrease) {
          difficultyIncrease = true;

          if (carsEvadedCount % GameConfig.SPEED_INCREASE_INTERVAL === 0 &&
              enemySpeed < GameConfig.MAX_ENEMY_SPEED) {
            enemySpeed = enemySpeed + 1;
            enemySpeedText.text = getEnemySpeedText(enemySpeed);
          }

          if (carsEvadedCount % GameConfig.SPAWN_RATE_INCREASE_INTERVAL === 0 &&
              msToReleaseEnemy > GameConfig.MAX_ENEMY_MS_TO_RELEASE) {
            msToReleaseEnemy = msToReleaseEnemy - GameConfig.SPAWN_RATE_DECREASE;
            msToReleaseText.text = getMsToReleaseText(msToReleaseEnemy);
          }
        }

        // Handle player input
        if (isMobile && touchActive) {
          // Touch controls for mobile - constant speed movement
          const currentCarX = playerCar.sprite.x;
          const targetX = touchX * (windowWidth / app.view.getBoundingClientRect().width);

          if (targetX < currentCarX) {
            // Touch is to the left of car - move left
            playerCar.moveLeft();
          } else if (targetX > currentCarX) {
            // Touch is to the right of car - move right
            playerCar.moveRight();
          }
        } else {
          // Keyboard controls for desktop
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
        }

        // Move and check slow-mo pickups
        for (let i = 0; i < slowmos.length; i++) {
          const slowmo = slowmos[i];
          slowmo.y += GameConfig.GAME_SPEED;

          // Check if player collected the slow-mo
          const playerBounds = playerCar.sprite.getBounds();

          const distance = Math.sqrt(
            Math.pow(playerBounds.x + playerBounds.width / 2 - slowmo.x, 2) +
            Math.pow(playerBounds.y + playerBounds.height / 2 - slowmo.y, 2)
          );

          // Can collect slow-mo if: no shield active AND (no power-up active OR slow-mo is active/transitioning to refresh it)
          const canCollectSlowmo = !shieldActive && (!slowmoActive && !slowmoTransitioning || slowmoActive || slowmoTransitioning);

          if (distance < 30 && canCollectSlowmo) {
            // Slow-mo collected! (activates or refreshes duration)
            slowmoActive = true;
            slowmoEndTime = Date.now() + GameConfig.SLOWMO_DURATION;
            slowmoTransitioning = false; // Cancel transition if it was transitioning
            slowmoOverlay.visible = true;
            slowmoOverlay.alpha = 0.15; // Reset alpha if it was fading

            // Play power-up collection sound
            audioManager.playPowerUp();

            // Remove this slow-mo
            app.stage.removeChild(slowmo);
            slowmos.splice(i, 1);
            i--;

            // Remove all other power-ups on screen
            for (let j = slowmos.length - 1; j >= 0; j--) {
              app.stage.removeChild(slowmos[j]);
              slowmos.splice(j, 1);
            }
            for (let j = shields.length - 1; j >= 0; j--) {
              app.stage.removeChild(shields[j]);
              shields.splice(j, 1);
            }

            // Show collection message
            const slowmoText = new PIXI.Text('SLOW MOTION!', {
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0x8B00FF,
              align: 'center',
              stroke: 'black',
              strokeThickness: 4,
              fontWeight: 'bold'
            });
            slowmoText.x = playerCar.sprite.x;
            slowmoText.y = playerCar.sprite.y - 50;
            slowmoText.anchor.set(0.5);
            slowmoText.zIndex = 150;
            app.stage.addChild(slowmoText);
            scorePopups.push(slowmoText);
            continue;
          }

          // Remove if off screen
          if (slowmo.y > windowHeight) {
            app.stage.removeChild(slowmo);
            slowmos.splice(i, 1);
            i--;
          }
        }

        // Move and check shield pickups
        for (let i = 0; i < shields.length; i++) {
          const shield = shields[i];
          shield.y += GameConfig.GAME_SPEED;

          // Check if player collected the shield
          const playerBounds = playerCar.sprite.getBounds();
          const shieldBounds = shield.getBounds();

          const distance = Math.sqrt(
            Math.pow(playerBounds.x + playerBounds.width / 2 - shield.x, 2) +
            Math.pow(playerBounds.y + playerBounds.height / 2 - shield.y, 2)
          );

          // Can collect shield if: no slow-mo active AND (no power-up active OR shield is active to refresh it)
          const canCollectShield = !slowmoActive && !slowmoTransitioning && !shieldActive || shieldActive;

          if (distance < 30 && canCollectShield) {
            // Shield collected! (activates or refreshes duration)
            shieldActive = true;
            shieldEndTime = Date.now() + GameConfig.SHIELD_DURATION;
            shieldIndicator.visible = true;

            // Play power-up collection sound
            audioManager.playPowerUp();

            // Remove this shield
            app.stage.removeChild(shield);
            shields.splice(i, 1);
            i--;

            // Remove all other power-ups on screen
            for (let j = shields.length - 1; j >= 0; j--) {
              app.stage.removeChild(shields[j]);
              shields.splice(j, 1);
            }
            for (let j = slowmos.length - 1; j >= 0; j--) {
              app.stage.removeChild(slowmos[j]);
              slowmos.splice(j, 1);
            }

            // Show collection message
            const shieldText = new PIXI.Text('SHIELD!', {
              fontFamily: 'Arial',
              fontSize: 28,
              fill: 0x00FFFF,
              align: 'center',
              stroke: 'black',
              strokeThickness: 4,
              fontWeight: 'bold'
            });
            shieldText.x = playerCar.sprite.x;
            shieldText.y = playerCar.sprite.y - 50;
            shieldText.anchor.set(0.5);
            shieldText.zIndex = 150;
            app.stage.addChild(shieldText);
            scorePopups.push(shieldText);
            continue;
          }

          // Remove if off screen
          if (shield.y > windowHeight) {
            app.stage.removeChild(shield);
            shields.splice(i, 1);
            i--;
          }
        }

        // Move enemy cars and check for collisions
        for (let i = 0; i < enemyCars.length; i++) {
          const playerBounds = playerCar.sprite.getBounds();
          const car = enemyCars[i].sprite;

          let enemyBounds = car.getBounds();

          // Calculate current enemy speed (apply slow-mo if active or transitioning)
          let currentEnemySpeed = enemySpeed;

          if (slowmoActive) {
            // Full slow-mo effect
            currentEnemySpeed = enemySpeed * GameConfig.SLOWMO_MULTIPLIER;
          } else if (slowmoTransitioning) {
            // Gradual transition from slow to normal
            const transitionElapsed = Date.now() - slowmoTransitionStartTime;
            const transitionProgress = Math.min(transitionElapsed / SLOWMO_TRANSITION_DURATION, 1.0);

            // Interpolate from SLOWMO_MULTIPLIER (0.5) to 1.0
            const currentMultiplier = GameConfig.SLOWMO_MULTIPLIER +
              (1.0 - GameConfig.SLOWMO_MULTIPLIER) * transitionProgress;

            currentEnemySpeed = enemySpeed * currentMultiplier;
          }

          // Move car if still in visible area, otherwise remove it
          if ((enemyBounds.y - car.height) < windowHeight) {
            car.y += currentEnemySpeed;

            // Refresh bounds after movement
            enemyBounds = car.getBounds();

            // Check if car passed below player - show popup immediately
            if (!enemyCars[i].popupShown && !enemyCars[i].pointsAwarded) {
              const playerCenterY = playerBounds.y + (playerBounds.height / 2);
              const enemyCenterY = enemyBounds.y + (enemyBounds.height / 2);

              // Car has passed below player (with margin to ensure it's clearly past)
              if (enemyCenterY > playerCenterY + 60) {
                enemyCars[i].popupShown = true;

                // Show +1 popup now
                const scorePopup = new PIXI.Text('+1', {
                  fontFamily: 'Arial',
                  fontSize: 28,
                  fill: 0x00FF00,
                  align: 'center',
                  stroke: 'black',
                  strokeThickness: 4,
                  fontWeight: 'bold'
                });
                scorePopup.x = playerCar.sprite.x;
                scorePopup.y = playerCar.sprite.y - 40;
                scorePopup.anchor.set(0.5);
                scorePopup.zIndex = 150;
                app.stage.addChild(scorePopup);
                scorePopups.push(scorePopup);

                // Play score increase sound
                audioManager.playScore();
              }
            }

            // Near miss detection
            if (!enemyCars[i].nearMissTriggered) {
            const playerCenterX = playerBounds.x + (playerBounds.width / 2);
            const playerCenterY = playerBounds.y + (playerBounds.height / 2);
            const enemyCenterX = enemyBounds.x + (enemyBounds.width / 2);
            const enemyCenterY = enemyBounds.y + (enemyBounds.height / 2);

            // Calculate distance between centers
            const distanceX = Math.abs(playerCenterX - enemyCenterX);
            const distanceY = Math.abs(playerCenterY - enemyCenterY);

            // Check if enemy is passing by the player (similar Y position)
            const isPassing = (enemyCenterY >= playerCenterY - 20 && enemyCenterY <= playerCenterY + 20);

            // Near miss if close but not colliding
            if (isPassing && distanceX > 20 && distanceX < GameConfig.NEAR_MISS_DISTANCE) {
              // Mark as triggered to prevent multiple triggers
              enemyCars[i].nearMissTriggered = true;
              enemyCars[i].pointsAwarded = true;  // Mark that this car already awarded points
              enemyCars[i].popupShown = true;  // Don't show regular +1 popup

              // Award bonus points (only to score, not car count)
              score += GameConfig.NEAR_MISS_BONUS;
              scoreText.text = getScoreText(score);

              // Play near miss sound
              audioManager.playNearMiss();

              // Create near miss popup
              const nearMissPopup = new PIXI.Text('NEAR MISS!', {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFFFF00,
                align: 'center',
                stroke: 'black',
                strokeThickness: 4,
                fontWeight: 'bold'
              });
              nearMissPopup.x = playerCar.sprite.x;
              nearMissPopup.y = playerCar.sprite.y - 50;
              nearMissPopup.anchor.set(0.5);
              nearMissPopup.zIndex = 150;
              app.stage.addChild(nearMissPopup);
              scorePopups.push(nearMissPopup);

              // Create bonus points popup
              const bonusPopup = new PIXI.Text(`+${GameConfig.NEAR_MISS_BONUS}`, {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xFFAA00,
                align: 'center',
                stroke: 'black',
                strokeThickness: 4,
                fontWeight: 'bold'
              });
              bonusPopup.x = playerCar.sprite.x;
              bonusPopup.y = playerCar.sprite.y - 20;
              bonusPopup.anchor.set(0.5);
              bonusPopup.zIndex = 150;
              app.stage.addChild(bonusPopup);
              scorePopups.push(bonusPopup);
            }
          }

          // Collision detection with margin error
          const marginError = 2;

          if (
            (enemyBounds.y + (enemyBounds.height / 2)) >= (playerBounds.y - (playerBounds.height / 2)) &&
            (enemyBounds.y - (enemyBounds.height / 2)) <= (playerBounds.y + (playerBounds.height / 2)) &&
            (enemyBounds.x + (enemyBounds.width / 2) - marginError) >= (playerBounds.x - (playerBounds.width / 2) + marginError) &&
            (enemyBounds.x - (enemyBounds.width / 2) + marginError) <= (playerBounds.x + (playerBounds.width / 2) - marginError)
          ) {
            // Check if shield is active
            if (shieldActive) {
              // Shield protects - just remove the enemy car
              app.stage.removeChild(car);
              enemyCars.splice(i, 1);
              i--;

              // Show protection message
              const protectedText = new PIXI.Text('PROTECTED!', {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x00FFFF,
                align: 'center',
                stroke: 'black',
                strokeThickness: 4,
                fontWeight: 'bold'
              });
              protectedText.x = playerCar.sprite.x;
              protectedText.y = playerCar.sprite.y - 40;
              protectedText.anchor.set(0.5);
              protectedText.zIndex = 150;
              app.stage.addChild(protectedText);
              scorePopups.push(protectedText);

              // Play shield hit sound
              audioManager.playShieldHit();
            } else {
              // No shield - normal collision
              playerCar.explode();
              lost = true;

              // Trigger screen shake effect
              screenShake = 15;

              // Play collision sound and stop background music
              audioManager.playCollision();
              audioManager.stopBackgroundMusic();

              // Update final score on game over screen
              finalScoreText.text = `SCORE: ${score}`;
              finalScoreText.x = (windowWidth / 2) - (finalScoreText.width / 2);

              // Add keyboard restart listener immediately
              if (!isMobile && keyboardRestartHandler) {
                window.addEventListener('keydown', keyboardRestartHandler);
              }
            }
          }
        } else {
          // Car is off screen - remove it
          app.stage.removeChild(car);

          // Increment car evaded count for difficulty (always, regardless of near miss)
          carsEvadedCount++;
          difficultyIncrease = false;

          // Only award points if this car didn't already give near miss bonus
          if (!enemyCars[i].pointsAwarded) {
            // Increase score for evaded car
            score += 1;
            scoreText.text = getScoreText(score);

            // Only show popup if it wasn't already shown when car passed player
            if (!enemyCars[i].popupShown) {
              // Play score increase sound
              audioManager.playScore();

              // Create score popup animation
              const scorePopup = new PIXI.Text('+1', {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0x00FF00,
                align: 'center',
                stroke: 'black',
                strokeThickness: 4,
                fontWeight: 'bold'
              });
              scorePopup.x = playerCar.sprite.x;
              scorePopup.y = playerCar.sprite.y - 40;
              scorePopup.anchor.set(0.5);
              scorePopup.zIndex = 150;
              app.stage.addChild(scorePopup);
              scorePopups.push(scorePopup);
            }
          }

          enemyCars.splice(i, 1);
          i = i - 1;
        }
      }
    }

    // Show game over screen when player has lost
    if (lost) {
      gameOverContainer.visible = true;
    }
  });
  }
};
