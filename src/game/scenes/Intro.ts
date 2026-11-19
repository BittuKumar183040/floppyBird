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
        const flappybird = this.add.image(BASE_WIDTH / 2, 250, 'logo').setDepth(100);
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

        this.inputUsername = document.createElement('input');
        this.inputUsername.type = 'text';
        this.inputUsername.value = localStorage.getItem('username') || ""
        this.inputUsername.placeholder = 'Enter your username';
        this.inputUsername.maxLength = 18;
        this.inputUsername.autocomplete = 'nickname';
        this.styleInput(this.inputUsername);
        this.game.canvas.parentElement?.appendChild(this.inputUsername);
        this.scale.on('resize', this.positionInput, this);
        this.positionInput();
        this.inputUsername.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') startGame();
        });

        const startGame = () => {
            const value = this.inputUsername.value.trim();
            if (!value) {
                this.shakeInputField(this.inputUsername);
                this.inputUsername.focus();
                return;
            }
            localStorage.setItem('username', value);
            this.inputUsername.remove();
            this.scene.start('LevelI');
        };

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
                startGame();
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

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.positionInput, this);
            this.inputUsername.remove();
            this.input.manager.canvas.style.cursor = 'default';
        });

    }

    styleInput(input: HTMLInputElement) {
        Object.assign(input.style, {
            position: 'absolute', width: 'min(320px, 70vw)', height: '52px',
            transform: 'translate(-50%, -50%)', zIndex: '20',
            fontSize: '18px', textAlign: 'center', color: '#17342d',
            border: '3px solid #b4ff7d', padding: '10px 16px',
            letterSpacing: '1px', outline: 'none', borderRadius: '14px',
            background: 'rgba(255,255,255,.96)',
            boxShadow: '0 8px 24px rgba(0,0,0,.25)'
        });
    }

    private positionInput() {
        if (!this.inputUsername?.isConnected) return;
        const canvas = this.game.canvas.getBoundingClientRect();
        const x = canvas.left + canvas.width * 0.5;
        const y = canvas.top + canvas.height * (410 / BASE_HEIGHT);
        Object.assign(this.inputUsername.style, { left: `${x}px`, top: `${y}px` });
    }

    shakeInputField(input: HTMLInputElement) {
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }
}
