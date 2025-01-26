import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH, primary } from '../config/config';
import { setHeight } from '../controller/methods';
export class Intro extends Scene {
    constructor() {
        super('Intro');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('start', 'start.png');
        this.load.svg('fullScreen', 'fullscreen.svg')
    }

    create() {
        const screen = this.add.image(0, 0, 'background').setOrigin(0, 0);
        screen.displayHeight = BASE_HEIGHT;
        screen.displayWidth = BASE_WIDTH;
        const flappybird = this.add.image(BASE_WIDTH / 2, 350, 'logo').setDepth(100);
        setHeight(flappybird, 700)

        const createText = ({ text, fontSize, pos, onPointDown }: any) => {
            const button = this.add.text(pos.x, pos.y, text, {
                fontFamily: 'Arial Black',
                fontSize: fontSize + 'px',
                color: '#ffffff',
                stroke: "#000000",
                strokeThickness: 5,
                align: 'center'
            }).setOrigin(0.5).setDepth(100)
                .setInteractive().on('pointerdown', onPointDown);

            button.on('pointerover', () => {
                button.setStyle({ color: primary });
                this.input.manager.canvas.style.cursor = 'pointer';
            });

            button.on('pointerout', () => {
                button.setStyle({ color: '#ffffff' });
                this.input.manager.canvas.style.cursor = 'default';
            });
            return button
        }

        const gapText = 100
        const left = BASE_WIDTH / 2
        createText({
            text: "START", fontSize: 44, onPointDown: () => {
                this.scene.start('LevelI');
            },
            pos: {
                x: left,
                y: BASE_HEIGHT - 100 - gapText * 3
            }
        })

        const fullscreen = this.add.image(BASE_WIDTH - 60, BASE_HEIGHT - 60, 'fullScreen')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                if (!this.scale.isFullscreen) {
                    this.scale.startFullscreen();
                    this.scale.resize(BASE_WIDTH, BASE_HEIGHT);
                } else {
                    this.scale.stopFullscreen();
                }
            });

        setHeight(fullscreen, 50)

        fullscreen.on('pointerover', () => {
            this.tweens.add({
                targets: fullscreen, scale: 2.2,
                angle: 180,
                duration: 200, ease: 'Power2'
            })
            this.input.manager.canvas.style.cursor = 'pointer';
        });

        fullscreen.on('pointerout', () => {
            this.tweens.add({
                targets: fullscreen, scale: 2,
                angle: 0,
                duration: 200, ease: 'Power2'
            })
            this.input.manager.canvas.style.cursor = 'default';
        });

        // START BUTTON
        const startBtn = this.add.image(BASE_WIDTH / 2, 650, 'start')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('LevelI'));

        startBtn.on('pointerover', () => {
            this.tweens.add({
                targets: startBtn, scale: 0.7,
                duration: 200, ease: 'Power2'
            });
            this.input.manager.canvas.style.cursor = 'pointer';
        });

        startBtn.on('pointerout', () => {
            this.tweens.add({
                targets: startBtn, scale: 0.65,
                duration: 200, ease: 'Power2'
            });
            this.input.manager.canvas.style.cursor = 'default';
        });
        setHeight(startBtn, 200)

        EventBus.emit('current-scene-ready', this);

    }
}
