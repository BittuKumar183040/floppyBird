import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH } from '../config/config';
import { getHighScore, setHeight } from '../controller/methods';
import { getPreferences, openSettings, playEffect, refreshMusic } from '../controller/preferences';


const width = BASE_WIDTH;
const height = BASE_HEIGHT;
const PIPE_WIDTH = 100;

export class LevelI extends Scene {
    private fpsText!: Phaser.GameObjects.Text;
    private scoreNumber: number = 0; // Score value
    private scoreText!: Phaser.GameObjects.Text; // Score display
    pipeGroup!: Phaser.Physics.Arcade.Group;
    pipeTimer!: Phaser.Time.TimerEvent;
    private bird!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    private paused = false;
    private gameEnded = false;
    private pauseLabel!: Phaser.GameObjects.Text;
    private readyLabel!: Phaser.GameObjects.Text;
    private countdown = 3;
    private gameStarted = false;
    private bestAtStart = 0;
    private recordBanner?: Phaser.GameObjects.Text;

    constructor() {
        super('LevelI');
    }

    init() {
        this.scoreNumber = 0;
        this.paused = false;
        this.gameEnded = false;
        this.countdown = 3;
        this.gameStarted = false;
        this.bestAtStart = Number(getHighScore());
        this.recordBanner = undefined;
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('character', 'character.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('pipe', 'pipe.png');
    }

    handleUpMovement(bird: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        if (!this.gameStarted) return;
        bird.setVelocityY(-400);
        playEffect('flap');
    }

    create() {

        this.physics.world.gravity.y = 0;
        const screen = this.add.image(0, 0, 'background').setInteractive().setOrigin(0, 0);
        screen.displayHeight = height;
        screen.displayWidth = width;
        const logo = this.add.image(120, 50, 'logo').setDepth(200);
        setHeight(logo, 200);

        this.fpsText = this.add.text(20, 20, 'FPS: 0', { font: '18px Arial', color: '#ffffff', stroke: '#17342d', strokeThickness: 4 }).setDepth(500);

        this.scoreText = this.add.text(width / 2 , 50, `${this.scoreNumber}`, {
            font: 'bold 88px Arial', color: '#ffffff', stroke: '#17342d', strokeThickness: 7,
        }).setOrigin(0.5, 0).setDepth(200);

        this.pauseLabel = this.add.text(width - 24, 24, 'Ⅱ  PAUSE', {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
            backgroundColor: '#17342d', padding: { x: 14, y: 10 }
        }).setOrigin(1, 0).setDepth(500).setInteractive({ useHandCursor: true });
        this.pauseLabel.on('pointerdown', (_pointer, _x, _y, event) => {
            event.stopPropagation();
            this.togglePause();
        });
        this.add.text(width / 2, height - 38, 'TAP OR PRESS SPACE TO FLAP  •  P TO PAUSE', {
            fontSize: '20px', color: '#ffffff', stroke: '#17342d', strokeThickness: 5
        }).setOrigin(0.5).setDepth(500);
        this.readyLabel = this.add.text(width / 2, height / 2 - 120, '3', {
            fontFamily: 'Arial Black', fontSize: '110px', color: '#ffffff',
            stroke: '#17342d', strokeThickness: 7
        }).setOrigin(0.5).setDepth(500);
        this.tweens.add({ targets: this.readyLabel, scale: { from: 0.75, to: 1.15 }, alpha: { from: 0.7, to: 1 }, duration: 500, yoyo: true, repeat: 5 });
        this.time.addEvent({ delay: 1000, repeat: 2, callback: () => {
            this.countdown -= 1;
            if (this.countdown > 0) this.readyLabel.setText(`${this.countdown}`);
            else {
                this.readyLabel.setText('FLAP!');
                this.gameStarted = true;
                this.physics.world.gravity.y = 800;
                this.pipeTimer = this.time.delayedCall(600, () => this.PipesSpawn());
                refreshMusic();
                this.time.delayedCall(500, () => this.readyLabel?.destroy());
            }
        } });

        const bird = this.physics.add.image(250, height / 2, 'character').setDepth(100);
        this.bird = bird;
        setHeight(bird, 60);
        bird.setCollideWorldBounds(true);

        screen.on('pointerdown', () => { if (!this.paused && !this.gameEnded) this.handleUpMovement(bird); });

        this.input.keyboard?.on('keydown-SPACE', () => {
            if (!this.paused && !this.gameEnded && this.gameStarted) this.handleUpMovement(bird)
        });
        this.input.keyboard?.on('keydown-P', () => this.togglePause());
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());

        const settingsButton = this.add.text(width - 205, 24, '⚙', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#17342d', padding: { x: 13, y: 9 }
        }).setOrigin(1, 0).setDepth(500).setInteractive({ useHandCursor: true });
        settingsButton.on('pointerdown', (_pointer, _x, _y, event) => {
            event.stopPropagation();
            const parent = this.game.canvas.parentElement;
            if (!parent || this.gameEnded) return;
            this.paused = true;
            this.physics.world.pause();
            this.time.paused = true;
            this.pauseLabel.setText('▶  RESUME');
            openSettings(parent, () => {
                if (!this.gameEnded && this.scene.isActive()) {
                    this.paused = false;
                    this.physics.world.resume();
                    this.time.paused = false;
                    this.pauseLabel.setText('Ⅱ  PAUSE');
                }
            });
        });

        this.pipeGroup = this.physics.add.group({
            allowGravity: false,
        });

        this.physics.add.collider(bird, this.pipeGroup, this.handleCollision, undefined, this);

        bird.body.onWorldBounds = true;
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject === bird) {
                this.handleCollision();
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    private togglePause() {
        if (this.gameEnded) return;
        this.paused = !this.paused;
        if (this.paused) {
            this.physics.world.pause();
            this.time.paused = true;
            this.pauseLabel.setText('▶  RESUME');
            this.add.text(width / 2, height / 2, 'PAUSED', {
                fontFamily: 'Arial Black', fontSize: '64px', color: '#ffffff',
                stroke: '#17342d', strokeThickness: 8, backgroundColor: '#00000088',
                padding: { x: 30, y: 18 }
            }).setOrigin(0.5).setDepth(900).setName('pause-overlay');
        } else {
            this.physics.world.resume();
            this.time.paused = false;
            this.pauseLabel.setText('Ⅱ  PAUSE');
            this.children.getByName('pause-overlay')?.destroy();
        }
    }

    handleCollision() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        playEffect('dead');
        this.scene.pause()
        this.scene.start('GameOver', { score: this.scoreNumber, previousBest: this.bestAtStart })
    }

    removePipe(pipe: Phaser.Physics.Arcade.Sprite) {
        pipe.destroy();
    }

    PipesSpawn() {
        if (!this.gameStarted || this.gameEnded) return;
        const difficulty = getPreferences().difficulty;
        const speed = (400 + Math.min(this.scoreNumber * 5, 160)) * difficulty;
        const pipeGap = Phaser.Math.Clamp(300 / difficulty - this.scoreNumber * 2, 180, 430);
        const spawnX = this.scale.width + PIPE_WIDTH;
        const pipeY = Phaser.Math.Between(-200, 250);

        const pipeTop = this.pipeGroup.create(spawnX, pipeY, 'pipe').setDepth(100) as Phaser.Physics.Arcade.Sprite;
        setHeight(pipeTop, PIPE_WIDTH);
        pipeTop.setImmovable(true);
        pipeTop.setVelocityX(-speed);
        pipeTop.setFlipY(true);

        const pipeBottom = this.pipeGroup.create(spawnX, pipeTop.displayHeight + pipeY + pipeGap, 'pipe').setDepth(100) as Phaser.Physics.Arcade.Sprite;
        setHeight(pipeBottom, PIPE_WIDTH);
        pipeBottom.setImmovable(true);
        pipeBottom.setVelocityX(-speed);

        pipeTop.setData('scored', false);

        const nextDelay = Math.max(420, pipeGap / speed * 1000);
        this.pipeTimer = this.time.delayedCall(nextDelay, () => this.PipesSpawn());

        this.pipeGroup.children.iterate((pipe) => {
            const sprite = pipe as Phaser.Physics.Arcade.Sprite;
            if (sprite && sprite.getBounds().right < 0) {
                this.removePipe(sprite);
            }
            return null;
        });
    }

    update(_time: number, delta: number) {

        this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);

        this.pipeGroup.children.each((pipe) => {
            const sprite = pipe as Phaser.Physics.Arcade.Sprite;

            if (
                sprite &&
                sprite.getBounds().right < 250 &&
                !sprite.getData('scored') &&
                sprite.flipY
            ) {
                sprite.setData('scored', true);
                this.handleScoreCount();
            }
            return null;
        });

        if (this.bird?.active) {
            const targetAngle = Phaser.Math.Clamp(this.bird.body.velocity.y * 0.055, -24, 80);
            this.bird.angle = Phaser.Math.Linear(this.bird.angle, targetAngle, Math.min(1, delta / 90));
        }
    }

    handleScoreCount() {
        this.scoreNumber += 1;
        if (this.scoreNumber > this.bestAtStart) {
            localStorage.setItem("highscore", "" + this.scoreNumber)
            if (!this.recordBanner) this.showNewRecord();
        } else {
            playEffect('score');
        }

        this.scoreText.setText(`${this.scoreNumber}`);
        this.tweens.add({ targets: this.scoreText, scale: 1.18, duration: 90, yoyo: true, ease: 'Quad.out' });
    }

    private showNewRecord() {
        playEffect('record');
        this.recordBanner = this.add.text(width / 2, height / 2 - 230, '✦  NEW PERSONAL BEST!  ✦', {
            fontFamily: 'Arial Black', fontSize: '36px', color: '#fff4a8',
            stroke: '#7e4315', strokeThickness: 8,
            shadow: { color: '#ffdc55', blur: 22, fill: true, stroke: true }
        }).setOrigin(0.5).setDepth(700).setScale(0.4).setAlpha(0);
        this.tweens.add({ targets: this.recordBanner, scale: 1, alpha: 1, y: height / 2 - 260, duration: 420, ease: 'Back.Out' });
        this.tweens.add({ targets: this.recordBanner, angle: { from: -3, to: 3 }, duration: 180, yoyo: true, repeat: 5, delay: 420 });
    }
}
