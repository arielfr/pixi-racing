/**
 * GameBackground class
 * Creates and animates the road, lanes, and lane markers
 */
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

    line.beginFill(GameConfig.ROAD_COLOR);
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

    // Use original game width for road calculation to maintain original size
    const gameWidth = GameConfig.GAME_WIDTH; // 320px
    const gridWidth = 10;
    const gridMinWidth = gameWidth / gridWidth;
    const playableGrid = 6;
    const nonPlayableGrid = gridWidth - playableGrid;
    const nonPlayableWidth = (nonPlayableGrid * gridMinWidth);

    // Road creation - centered in window
    const roadWidth = gridMinWidth * playableGrid;
    const roadX = (this.appWidth / 2) - (roadWidth / 2); // Center road in window

    const road = this.createRoad(roadX, 0, roadWidth, this.appHeight);

    background.addChild(road);

    this.xRoadStart = road.x;
    this.xRoadEnd = road.x + road.width;

    // Lanes Creation
    background.addChild(this.createYellowLine(this.xRoadStart, this.appHeight));
    background.addChild(this.createYellowLine(this.xRoadEnd, this.appHeight));

    const totalWidthPerLane = road.width / this.lanes;

    // First and last
    for (let i = 1; i <= (this.lanes - 1); i++) {
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
