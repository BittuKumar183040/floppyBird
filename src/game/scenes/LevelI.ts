import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH } from '../config/config';
import { getHighScore, setHeight } from '../controller/methods';


const width = BASE_WIDTH;
const height = BASE_HEIGHT;
const PIPE_WIDTH = 100;

export class LevelI extends Scene {
    private fpsText!: Phaser.GameObjects.Text;
    private scoreNumber: number = 0; // Score value
    private scoreText!: Phaser.GameObjects.Text; // Score display
    private readonly pipeVelocity: number = -400;
    pipeGroup!: Phaser.Physics.Arcade.Group;
    pipeTimer!: Phaser.Time.TimerEvent;
    private currentPipePos = width;
    private paused = false;
    private gameEnded = false;
    private pauseLabel!: Phaser.GameObjects.Text;
    private readyLabel!: Phaser.GameObjects.Text;

    constructor() {
        super('LevelI');
    }

    init() {
        this.scoreNumber = 0;
        this.currentPipePos = width;
        this.paused = false;
        this.gameEnded = false;
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('character', 'character.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('pipe', 'pipe.png');
    }

    handleUpMovement(bird: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
        bird.setVelocityY(-400);
        bird.setAngle(-25);
        this.time.delayedCall(200, () => {
            bird.setAngle(0);
        });
    }

    create() {

        this.physics.world.gravity.y = 800;
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
        this.pauseLabel.on('pointerdown', () => this.togglePause());
        this.add.text(width / 2, height - 38, 'TAP OR PRESS SPACE TO FLAP  •  P TO PAUSE', {
            fontSize: '20px', color: '#ffffff', stroke: '#17342d', strokeThickness: 5
        }).setOrigin(0.5).setDepth(500);
        this.readyLabel = this.add.text(width / 2, height / 2 - 120, 'GET READY', {
            fontFamily: 'Arial Black', fontSize: '38px', color: '#ffffff',
            stroke: '#17342d', strokeThickness: 7
        }).setOrigin(0.5).setDepth(500);
        this.time.delayedCall(900, () => { if (this.readyLabel.active) this.readyLabel.setText('FLAP!'); });
        this.time.delayedCall(1600, () => this.readyLabel?.destroy());

        const bird = this.physics.add.image(250, height / 2, 'character').setDepth(100);
        setHeight(bird, 60);
        bird.setCollideWorldBounds(true);

        screen.on('pointerdown', () => { if (!this.paused && !this.gameEnded) this.handleUpMovement(bird); });

        this.input.keyboard?.on('keydown-SPACE', () => {
            if (!this.paused && !this.gameEnded) this.handleUpMovement(bird)
        });
        this.input.keyboard?.on('keydown-P', () => this.togglePause());
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());

        this.pipeGroup = this.physics.add.group({
            allowGravity: false,
        });

        const pipeSpawnDelay = (this.scale.width / Math.abs(this.pipeVelocity)) * 300;
        this.pipeTimer = this.time.addEvent({
            delay: pipeSpawnDelay,
            callback: () => this.PipesSpawn(),
            callbackScope: this,
            loop: true,
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
        this.scene.pause()
        this.scene.start('GameOver', { score: this.scoreNumber })
    }

    removePipe(pipe: Phaser.Physics.Arcade.Sprite) {
        pipe.destroy();
    }

    PipesSpawn() {
        const pipeY = Phaser.Math.Between(-200, 250); // Random vertical position

        const pipeTop = this.pipeGroup.create(this.currentPipePos, pipeY, 'pipe').setDepth(100) as Phaser.Physics.Arcade.Sprite;
        setHeight(pipeTop, PIPE_WIDTH);
        pipeTop.setImmovable(true);
        pipeTop.setVelocityX(this.pipeVelocity);
        pipeTop.setFlipY(true);

        const pipeBottom = this.pipeGroup.create(this.currentPipePos, pipeTop.displayHeight + pipeY + 200, 'pipe').setDepth(100) as Phaser.Physics.Arcade.Sprite;
        setHeight(pipeBottom, PIPE_WIDTH);
        pipeBottom.setImmovable(true);
        pipeBottom.setVelocityX(this.pipeVelocity);

        this.currentPipePos = this.currentPipePos + Phaser.Math.Clamp(300 - this.scoreNumber * 3, 220, 300);
        const speed = -(400 + Math.min(this.scoreNumber * 5, 160));
        pipeTop.setVelocityX(speed);
        pipeBottom.setVelocityX(speed);

        pipeTop.setData('scored', false);

        this.pipeGroup.children.iterate((pipe) => {
            const sprite = pipe as Phaser.Physics.Arcade.Sprite;
            if (sprite && sprite.getBounds().right < 0) {
                this.removePipe(sprite);
            }
            return null;
        });
    }

    update() {

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
    }

    handleScoreCount() {
        this.scoreNumber += 1;
        const high_score = ~~getHighScore()
        if (this.scoreNumber > high_score) {

            localStorage.setItem("highscore", "" + this.scoreNumber)
        }

        this.scoreText.setText(`${this.scoreNumber}`);
        this.tweens.add({ targets: this.scoreText, scale: 1.18, duration: 90, yoyo: true, ease: 'Quad.out' });
    }
}
