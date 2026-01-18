/**
 * Utility function to generate random number between min and max (inclusive)
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Base Car class
 * Handles sprite creation, positioning, and boundary management
 */
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

/**
 * Enemy Car class
 * Randomly selects a sprite and spawns at specified lane positions
 */
class EnemyCar extends Car {
  constructor(app, boundLeft, boundRight, boundBottom, speed) {
    // Get a random enemy sprite
    const texture = app.loader.resources[`enemy${randomBetween(1, 5)}`].texture;
    super(app, texture, boundLeft, boundRight, boundBottom, speed);
  }

  invoke(lanesQ, lanesPosition) {
    const whichLane = randomBetween(1, lanesQ);
    const laneToPushEnemy = lanesPosition[whichLane - 1];

    this.setPosition(laneToPushEnemy.x, -this.sprite.height);
  }
}

/**
 * Player Car class
 * Handles player movement with boundary checking and explosion animation
 */
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
    animatedSprite.visible = false; // Hide initially

    // Hide explosion after animation completes
    animatedSprite.onComplete = () => {
      animatedSprite.visible = false;
    };

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

    this.explosion.visible = true; // Show explosion
    this.explosion.gotoAndPlay(0);
  }
}
