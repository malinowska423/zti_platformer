import Phaser from 'phaser'
import Hero from '../entities/Hero'

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  init(data) {}

  preload() {
    const sprites = ['idle', 'run', 'pivot', 'jump', 'flip', 'fall']
    sprites.forEach((sprite) =>
      this.load.spritesheet(
        `hero-${sprite}-sheet`,
        `assets/hero/${sprite}.png`,
        {
          frameWidth: 32,
          frameHeight: 64,
        }
      )
    )
  }

  create(data) {
    this.cursorKeys = this.input.keyboard.createCursorKeys()

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
    }
    Object.keys(anims).forEach((anim) =>
      this.anims.create({
        key: `hero-${anims[anim].animation}`,
        frames: this.anims.generateFrameNumbers(`hero-${anim}-sheet`, {}),
        ...anims[anim].props,
      })
    )

    this.hero = new Hero(this, 250, 160)

    const platform = this.add.rectangle(220, 240, 260, 10, 0x4bcb7c)
    this.physics.add.existing(platform, true)
    this.physics.add.collider(this.hero, platform)
  }

  update(time, delta) {}
}

export default Game
