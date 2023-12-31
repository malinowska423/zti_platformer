import Phaser from 'phaser';
import Hero from '../entities/Hero';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {}

  preload() {
    this.load.image('title', 'assets/images/title.png');
    this.load.image('action', 'assets/images/action.png');
    this.load.image('over', 'assets/images/over.png');
    this.load.image('win', 'assets/images/win.png');
    this.load.image('legend', 'assets/images/legend.png');

    this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');

    this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
    this.load.image('clouds-sheet', 'assets/tilesets/clouds.png');
    this.load.spritesheet('props-sheet', 'assets/tilesets/props.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0,
    });

    const sprites = [
      'idle',
      'run',
      'pivot',
      'jump',
      'flip',
      'fall',
      'die',
      'win',
    ];
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

  __addImages() {
    this.titleImage = this.add.image(0, 0, 'title');
    this.overImage = this.add.image(0, 0, 'over');
    this.winImage = this.add.image(0, 0, 'win');

    this.actionImage = this.add.image(0, 0, 'action');
    this.legendImage = this.add.image(0, 0, 'legend');

    this.titleImage.visible = false;
    this.overImage.visible = false;
    this.winImage.visible = false;
    this.actionImage.visible = false;
  }

  __displayScreen(texture) {
    const camera = this.cameras.main;
    const cameraCenterX = camera.width / 2 + camera.scrollX;
    const cameraCenterY = camera.height / 2 + camera.scrollY;

    const mainImage =
      texture === 'over'
        ? this.overImage
        : texture === 'win'
        ? this.winImage
        : this.titleImage;
    mainImage.setPosition(cameraCenterX, cameraCenterY - 25);
    this.actionImage.setPosition(cameraCenterX, cameraCenterY + 25);
    texture === 'title' &&
      this.legendImage.setPosition(cameraCenterX, cameraCenterY + 60);

    mainImage.visible = true;
    this.actionImage.visible = true;
  }

  create(data) {
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this._addAnimations();

    this._addMap();

    this.__addImages();
    this.__displayScreen('title');

    this.space.on('up', () => {
      if (!this.gameOn) {
        this.gameOn = true;
        this.titleImage.visible = false;
        this.overImage.visible = false;
        this.winImage.visible = false;
        this.actionImage.visible = false;
        this.legendImage.visible = false;
        this._addHero();
      }
    });

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
  }

  _addAnimations() {
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
      die: {
        animation: 'dead',
      },
      win: {
        animation: 'won',
      },
    };
    Object.keys(anims).forEach((anim) =>
      this.anims.create({
        key: `hero-${anims[anim].animation}`,
        frames: this.anims.generateFrameNumbers(`hero-${anim}-sheet`, {}),
        ...anims[anim].props,
      }),
    );
  }

  _addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
    const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');
    const propsTiles = this.map.addTilesetImage('land-props', 'props-sheet');

    const backgroundLayer = this.map.createStaticLayer(
      'Background',
      backgroundTiles,
    );
    backgroundLayer.setScrollFactor(0.6);

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
    groundLayer.setCollision([1, 2, 5], true);

    this.map.createStaticLayer('Props', propsTiles);

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

    this.endGameDoorGroup = this.physics.add.group({
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
      if (object.name.toLowerCase() === 'door') {
        const endDoor = this.endGameDoorGroup.create(
          object.x,
          object.y,
          'props-sheet',
          object.gid - 1,
        );
        endDoor.setOrigin(-0.3, 1);
        endDoor.setSize(object.width - 15, object.height);
      }
    });

    this.map.createStaticLayer('Foreground', groundTiles);
  }

  _addHero() {
    !!this.hero && this.hero.destroy();

    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);
    this.cameras.main.startFollow(this.hero);

    this.children.moveTo(
      this.hero,
      this.children.getIndex(this.map.getLayer('Foreground').tilemapLayer),
    );

    const groundCollider = this.physics.add.collider(
      this.hero,
      this.map.getLayer('Ground').tilemapLayer,
    );

    const spikesCollider = this.physics.add.overlap(
      this.hero,
      this.spikeGroup,
      () => this.hero.kill(),
    );

    const endDoorCollider = this.physics.add.overlap(
      this.hero,
      this.endGameDoorGroup,
      () => this.hero.win(),
    );

    const destroyColliders = () => {
      spikesCollider.destroy();
      endDoorCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    };

    this.hero.on('died', () => {
      groundCollider.destroy();
      destroyColliders();
    });
    this.hero.on('won', destroyColliders);
  }

  update(time, delta) {
    const cameraBottom = this.cameras.main.getWorldPoint(
      0,
      this.cameras.main.height,
    ).y;

    if (
      this.hero &&
      this.hero.isDead() &&
      this.hero.getBounds().top > cameraBottom + 100
    ) {
      this.hero.destroy();
      this.gameOn = false;
      this.__displayScreen('over');
    }

    if (this.hero && this.hero.hasWon()) {
      this.gameOn = false;
      this.__displayScreen('win');
    }
  }
}

export default Game;
