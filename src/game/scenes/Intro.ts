import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { primary, width } from '../config/config';

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
        this.add.image(width / 2, 384, 'background');
        this.add.image(width / 2, 350, 'logo').setDepth(100);

        const startButton = this.add.text(width / 2, 650, 'START', {
            fontFamily: 'Arial Black',
            fontSize: '25px',
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
