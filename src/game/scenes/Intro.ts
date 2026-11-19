import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH } from '../config/config';
import { setHeight } from '../controller/methods';
import { openSettings, refreshMusic } from '../controller/preferences';

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
        this.load.image('character', 'character.png');
        this.load.svg('fullScreen', 'fullscreen.svg')
    }

    create() {
        refreshMusic();
        this.input.once('pointerdown', () => refreshMusic());
        this.input.keyboard?.once('keydown', () => refreshMusic());
        const screen = this.add.image(0, 0, 'background').setOrigin(0, 0);
        screen.displayHeight = BASE_HEIGHT;
        screen.displayWidth = BASE_WIDTH;
        const flappybird = this.add.image(BASE_WIDTH / 2, 250, 'logo').setDepth(100);
        setHeight(flappybird, Math.min(700, BASE_WIDTH * 0.88))
        this.tweens.add({ targets: flappybird, y: 265, angle: 2, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        const mascotX = Math.min(BASE_WIDTH * 0.82, BASE_WIDTH / 2 + 320);
        const mascot = this.add.image(mascotX, 545, 'character').setDepth(90);
        setHeight(mascot, 72);
        this.tweens.add({ targets: mascot, x: Math.max(BASE_WIDTH * 0.58, mascotX - 60), y: 515, angle: { from: -8, to: 8 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

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
            refreshMusic();
            this.inputUsername.remove();
            this.scene.start('LevelI');
        };

        const fullscreen = this.add.image(BASE_WIDTH - 60, BASE_HEIGHT - 60, 'fullScreen')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                if (!this.scale.isFullscreen) {
                    this.scale.startFullscreen();
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
        this.tweens.add({ targets: startBtn, scale: { from: 0.65, to: 0.69 }, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        // SCOREBOARD
        const scoreboard = this.add.image(BASE_WIDTH / 2, 780, 'dashboard')
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => {
                this.inputUsername.remove();
                this.scene.start('LevelII');
            });

        setHeight(scoreboard, 300)
        this.tweens.add({ targets: scoreboard, y: 795, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
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

        const settingsButton = this.add.text(BASE_WIDTH - 150, 125, '⚙  SETTINGS', {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
            backgroundColor: '#173f3a', padding: { x: 16, y: 12 },
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(150).setInteractive({ useHandCursor: true });
        settingsButton.on('pointerdown', () => {
            const parent = this.game.canvas.parentElement;
            if (parent) {
                this.input.enabled = false;
                openSettings(parent, () => { this.input.enabled = true; });
            }
        });
        settingsButton.on('pointerover', () => {
            this.tweens.add({ targets: settingsButton, scale: 1.08, duration: 140, yoyo: true });
            this.input.manager.canvas.style.cursor = 'pointer';
        });
        settingsButton.on('pointerout', () => { this.input.manager.canvas.style.cursor = 'default'; });

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
