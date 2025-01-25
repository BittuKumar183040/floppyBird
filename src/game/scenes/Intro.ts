import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH, primary } from '../config/config';

export class Intro extends Scene {
    constructor() {
        super('Intro');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('star', 'star.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create() {
        const screen = this.add.image(0, 0, 'background').setOrigin(0,0);
        screen.displayHeight = BASE_HEIGHT;
        screen.displayWidth = BASE_WIDTH;
        this.add.image(BASE_WIDTH / 2, 350, 'logo').setDepth(100);

        const startButton = this.add.text(BASE_WIDTH / 2, 650, 'START', {
            fontFamily: 'Arial Black',
            fontSize: '55px',
            color: '#ffffff',
            stroke: "#000000",
            strokeThickness: 5,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('LevelI');
            });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: primary });
            this.input.manager.canvas.style.cursor = 'pointer';
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#ffffff' });
            this.input.manager.canvas.style.cursor = 'default';
        });

        EventBus.emit('current-scene-ready', this);

    }
}
