import Phaser from 'phaser';
import Hero from '../entities/Hero';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {}

  preload() {
    this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');

    this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
    this.load.image('clouds-sheet', 'assets/tilesets/clouds.png');

    const sprites = ['idle', 'run', 'pivot', 'jump', 'flip', 'fall'];
    sprites.forEach((sprite) =>
      this.load.spritesheet(
        `hero-${sprite}-sheet`,
        `assets/hero/${sprite}.png`,
        {
          frameWidth: 32,
          frameHeight: 64,
        },
      ),
    );
  }

  create(data) {
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    const anims = {
      idle: {
        animation: 'idle',
      },
      run: {
        animation: 'running',
        props: {
          frameRate: 10,
          repeat: -1,
        },
      },
      pivot: {
        animation: 'pivoting',
      },
      jump: {
        animation: 'jumping',
        props: {
          frameRate: 10,
          repeat: -1,
        },
      },
      flip: {
        animation: 'flipping',
        props: {
          frameRate: 30,
          repeat: 0,
        },
      },
      fall: {
        animation: 'falling',
        props: {
          frameRate: 10,
          repeat: -1,
        },
      },
    };
    Object.keys(anims).forEach((anim) =>
      this.anims.create({
        key: `hero-${anims[anim].animation}`,
        frames: this.anims.generateFrameNumbers(`hero-${anim}-sheet`, {}),
        ...anims[anim].props,
      }),
    );

    this._addMap();

    this._addHero();

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.cameras.main.startFollow(this.hero);
  }

  _addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
    const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');

    const backgroundLayer = this.map.createStaticLayer(
      'Background',
      backgroundTiles,
    );
    backgroundLayer.setScrollFactor(0.6);

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
    groundLayer.setCollision([1, 2, 5], true);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.physics.world.setBoundsCollision(true, true, false, true);

    this.spikeGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.map.getObjectLayer('Objects').objects.forEach((object) => {
      if (object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y };
      }
      if (object.gid === 8) {
        const spike = this.spikeGroup.create(
          object.x,
          object.y,
          'world-1-sheet',
          object.gid - 1,
        );
        spike.setOrigin(0, 1);
        spike.setSize(object.width - 10, object.height - 10);
        spike.setOffset(5, 10);
      }
    });

    this.map.createStaticLayer('Foreground', groundTiles);
  }

  _addHero() {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);

    this.children.moveTo(
      this.hero,
      this.children.getIndex(this.map.getLayer('Foreground').tilemapLayer),
    );

    this.physics.add.collider(
      this.hero,
      this.map.getLayer('Ground').tilemapLayer,
    );
  }

  update(time, delta) {}
}

export default Game;
