import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { backendurl, BASE_HEIGHT, BASE_WIDTH, primary } from '../config/config';

export class LevelII extends Scene {
  constructor() {
    super('LevelII');
  }

  async fetchScoreboard() {
    try {
      const response = await fetch(`${backendurl}/scoreboard/flappybird`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching scoreboard:", error);
      return [{ score: 0, username: 'Failed to load scoreboard' }];
    }
  }

  preload() {
    this.load.setPath('assets');
    this.load.image('background', 'bg.png');
    this.load.svg('fullScreen', 'fullscreen.svg');
  }

  create() {
    const screen = this.add.image(0, 0, 'background').setOrigin(0, 0);
    screen.displayHeight = BASE_HEIGHT;
    screen.displayWidth = BASE_WIDTH;

    const createText = ({ text, fontSize, pos, onPointDown, origin = 0.5 }: any) => {
      const button = this.add.text(pos.x, pos.y, text, {
        fontFamily: 'Arial Black', fontSize: fontSize + 'px',
        color: '#ffffff', stroke: "#000000",
        strokeThickness: 5, align: 'center'
      }).setOrigin(origin).setDepth(100)
        .setInteractive().on('pointerdown', onPointDown);

      button.on('pointerover', () => {
        button.setStyle({ color: primary });
        this.input.manager.canvas.style.cursor = 'pointer';
      });

      button.on('pointerout', () => {
        button.setStyle({ color: '#ffffff' });
        this.input.manager.canvas.style.cursor = 'default';
      });
      return button;
    };

    createText({
      text: `◀️ B A C K`,
      fontSize: 32, onPointDown: () => { this.scene.start('Intro'); },
      pos: { x: 200, y: 200 }
    });

    createText({
      text: `S C O R E   B O A R D`,
      fontSize: 32, onPointDown: () => { },
      pos: { x: BASE_WIDTH / 2, y: 300 }
    });

    const loadingText = this.add.text(BASE_WIDTH / 2, 400, "Loading...", {
      fontFamily: 'Arial Black', align: 'center',
      fontSize: '32px', color: '#ffffff',
      stroke: "#000000", strokeThickness: 5,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: loadingText,
      alpha: { from: 1, to: 0.3 },
      duration: 500, yoyo: true,
      repeat: -1
    });

    this.fetchScoreboard().then(scoreboardData => {
      loadingText.destroy();

      if (!Array.isArray(scoreboardData)) {
        console.error("Invalid scoreboard data format:", scoreboardData);
        return;
      }

      scoreboardData.forEach(({ username, score }, index) => {
        createText({
          text: `${username}`, fontSize: 32,
          onPointDown: () => { },
          pos: { x: BASE_WIDTH / 2 - 300, y: 400 + (60 * index) },
          origin: 0
        });

        createText({
          text: `${score}`, fontSize: 32,
          onPointDown: () => { },
          pos: { x: BASE_WIDTH / 2 + 300, y: 400 + (60 * index) },
          origin: 0
        });
      });
    });

    EventBus.emit('current-scene-ready', this);
  }
}
