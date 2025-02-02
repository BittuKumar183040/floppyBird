import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH, primary } from '../config/config';
import { setHeight } from '../controller/methods';

export class Intro extends Scene {
    private inputUsername!: HTMLInputElement;

    constructor() {
        super('Intro');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('start', 'start.png');
        this.load.image('dashboard', 'dashboard.png');
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

        createText({
            text: "START", fontSize: 44, onPointDown: () => {
                this.scene.start('LevelI');
            },
            pos: {
                x: BASE_WIDTH / 2,
                y: BASE_HEIGHT - 100 - 100 * 3
            }
        })

        this.inputUsername = document.createElement('input');
        this.inputUsername.type = 'text';
        this.inputUsername.value = localStorage.getItem('username') || ""
        this.inputUsername.placeholder = 'Enter your username';
        this.styleInput(this.inputUsername, 20, "20px");
        document.body.appendChild(this.inputUsername);

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
                angle: 180, duration: 200, ease: 'Power2'
            })
            this.input.manager.canvas.style.cursor = 'pointer';
        });

        fullscreen.on('pointerout', () => {
            this.tweens.add({
                targets: fullscreen, scale: 2,
                angle: 0, duration: 200, ease: 'Power2'
            })
            this.input.manager.canvas.style.cursor = 'default';
        });

        const startBtn = this.add.image(BASE_WIDTH / 2, 650, 'start')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                let value = this.inputUsername.value.trim();
                if (value && value.length > 0) {
                    localStorage.setItem('username', value)
                    this.inputUsername.remove();
                    this.scene.start('LevelI');
                    return null;
                } else {
                    this.shakeInputField(this.inputUsername);
                    return null;
                }
            });

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

        // SCOREBOARD
        const scoreboard = this.add.image(BASE_WIDTH / 2, 780, 'dashboard')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                this.inputUsername.remove();
                this.scene.start('LevelII');
            });

        setHeight(scoreboard, 300)
        scoreboard.on('pointerover', () => {
            this.tweens.add({
                targets: scoreboard, scale: 0.7,
                duration: 200, ease: 'Power2'
            });
            this.input.manager.canvas.style.cursor = 'pointer';
        });
        scoreboard.on('pointerout', () => {
            this.tweens.add({
                targets: scoreboard, scale: 0.65,
                duration: 200, ease: 'Power2'
            });
            this.input.manager.canvas.style.cursor = 'default';
        });

        EventBus.emit('current-scene-ready', this);

    }

    styleInput(input: HTMLInputElement, x: number, y: string) {
        Object.assign(input.style, {
            position: 'absolute', width: '180px',
            left: `${x}px`, top: `${y}`,
            fontSize: '14px',
            border: "2px solid transparent",

            padding: '8px', letterSpacing: '1px',
            outline: 'none', borderRadius: '5px',
            boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.2), 2px 2px 5px rgba(0, 0, 0, 0.2)'
        });
    }

    shakeInputField(input: HTMLInputElement) {
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }
}
