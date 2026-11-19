import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH } from '../config/config';
import { getBestScores, getScoreHistory, openSettings, type GameMode } from '../controller/preferences';

export class LevelII extends Scene {
  constructor() { super('LevelII'); }

  preload() {
    this.load.setPath('assets');
    this.load.image('background', 'bg.png');
  }

  create() {
    const background = this.add.image(0, 0, 'background').setOrigin(0);
    background.setDisplaySize(BASE_WIDTH, BASE_HEIGHT);
    const username = localStorage.getItem('username')?.trim() || '';
    const displayName = username.length > 12 ? `${username.slice(0, 11)}…` : username;
    const history = getScoreHistory()
      .filter((record) => !username || record.username.toLowerCase() === username.toLowerCase())
      .slice(0, 10);
    const bestScores = getBestScores();

    this.add.text(BASE_WIDTH / 2, 85, username ? `${displayName}'S FLIGHT HISTORY` : 'FLIGHT HISTORY', {
      fontFamily: 'Arial Black', fontSize: `${Math.min(44, BASE_WIDTH * 0.085)}px`, color: '#ffffff',
      stroke: '#17342d', strokeThickness: 7, align: 'center',
    }).setOrigin(0.5);

    const modes: GameMode[] = ['chill', 'classic', 'spicy'];
    const cardWidth = Math.min(245, (BASE_WIDTH - 48) / 3);
    modes.forEach((mode, index) => {
      const x = BASE_WIDTH / 2 + (index - 1) * (cardWidth + 10);
      const card = this.add.rectangle(x, 200, cardWidth, 92, 0x173f3a, 0.82).setStrokeStyle(2, 0xb4ff7d, 0.6);
      this.add.text(x, 181, mode.toUpperCase(), {
        fontFamily: 'Arial Black', fontSize: `${Math.min(20, cardWidth * 0.12)}px`, color: '#dfffcb',
      }).setOrigin(0.5);
      this.add.text(x, 216, `BEST  ${bestScores[mode]}`, {
        fontFamily: 'Arial Black', fontSize: `${Math.min(22, cardWidth * 0.13)}px`, color: '#ffffff',
      }).setOrigin(0.5);
      this.tweens.add({ targets: card, scaleY: 1.06, duration: 900 + index * 140, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    this.add.text(BASE_WIDTH / 2, 270, `${history.length} RECENT RUN${history.length === 1 ? '' : 'S'} · SCORES ARE SAVED ON THIS DEVICE`, {
      fontFamily: 'Arial Black', fontSize: `${Math.min(20, BASE_WIDTH * 0.045)}px`, color: '#ffffff',
      stroke: '#17342d', strokeThickness: 4,
    }).setOrigin(0.5);

    const headerY = 320;
    const left = BASE_WIDTH / 2 - Math.min(420, BASE_WIDTH * 0.35);
    this.add.text(left, headerY, 'RUN', { fontSize: '22px', color: '#b4ff7d', fontStyle: 'bold' }).setOrigin(0, 0.5);
    this.add.text(BASE_WIDTH / 2 - 60, headerY, 'MODE', { fontSize: '20px', color: '#b4ff7d', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(BASE_WIDTH / 2 + 55, headerY, 'DATE', { fontSize: '20px', color: '#b4ff7d', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(BASE_WIDTH / 2 + Math.min(420, BASE_WIDTH * 0.35), headerY, 'SCORE', { fontSize: '22px', color: '#b4ff7d', fontStyle: 'bold' }).setOrigin(1, 0.5);

    if (history.length === 0) {
      this.add.text(BASE_WIDTH / 2, 430, 'No flights saved yet.\nPlay a round and your scores will appear here!', {
        fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff',
        stroke: '#17342d', strokeThickness: 5, align: 'center', lineSpacing: 14,
      }).setOrigin(0.5);
    } else {
      history.forEach((record, index) => {
        const y = 365 + index * 50;
        const row = this.add.rectangle(BASE_WIDTH / 2, y, Math.min(BASE_WIDTH * 0.9, 930), 42, index === 0 ? 0x285f53 : 0x173f3a, index === 0 ? 0.9 : 0.68);
        row.setStrokeStyle(index === 0 ? 2 : 1, index === 0 ? 0xb4ff7d : 0xffffff, 0.28);
        this.add.text(left, y, `#${index + 1}`, { fontSize: '20px', color: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(BASE_WIDTH / 2 - 60, y, record.mode.toUpperCase(), { fontSize: '17px', color: '#dfffcb' }).setOrigin(0.5);
        this.add.text(BASE_WIDTH / 2 + 55, y, new Date(record.date).toLocaleDateString(), { fontSize: '17px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(BASE_WIDTH / 2 + Math.min(420, BASE_WIDTH * 0.35), y, `${record.score}`, {
          fontFamily: 'Arial Black', fontSize: '23px', color: index === 0 ? '#b4ff7d' : '#ffffff',
        }).setOrigin(1, 0.5);
      });
    }

    const back = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT - 100, '←  BACK TO FLIGHT', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff',
      backgroundColor: '#173f3a', padding: { x: 22, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => this.tweens.add({ targets: back, scale: 1.06, duration: 120 }));
    back.on('pointerout', () => this.tweens.add({ targets: back, scale: 1, duration: 120 }));
    back.on('pointerdown', () => this.scene.start('Intro'));

    const settings = this.add.text(BASE_WIDTH - 30, 30, '⚙', {
      fontSize: '36px', color: '#ffffff', backgroundColor: '#173f3a', padding: { x: 12, y: 6 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    settings.on('pointerdown', () => {
      const parent = this.game.canvas.parentElement;
      if (parent) {
        this.input.enabled = false;
        openSettings(parent, () => { this.input.enabled = true; });
      }
    });
    EventBus.emit('current-scene-ready', this);
  }
}
