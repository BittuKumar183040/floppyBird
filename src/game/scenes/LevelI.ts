import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BASE_HEIGHT, BASE_WIDTH } from '../config/config';
import { getHighScore, setHeight } from '../controller/methods';


const width = BASE_WIDTH;
const height = BASE_HEIGHT;
const PIPE_GAP = 300;
const PIPE_WIDTH = 100;

export class LevelI extends Scene {
    private fpsText!: Phaser.GameObjects.Text;
    private scoreNumber: number = 0; // Score value
    private scoreText!: Phaser.GameObjects.Text; // Score display
    private readonly pipeVelocity: number = -400;
    pipeGroup!: Phaser.Physics.Arcade.Group;
    pipeTimer!: Phaser.Time.TimerEvent;
    private currentPipePos = width;

    constructor() {
        super('LevelI');
    }

    init() {
        this.scoreNumber = 0;
        this.currentPipePos = width;
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

        this.fpsText = this.add.text(10, 10, 'FPS: 0', { font: '16px Arial' }).setDepth(500);

        this.scoreText = this.add.text(width / 2 , 50, `${this.scoreNumber}`, {
            font: '80px Arial',
        }).setDepth(200);

        const bird = this.physics.add.image(250, height / 2, 'character').setDepth(100);
        setHeight(bird, 60);
        bird.setCollideWorldBounds(true);

        screen.on('pointerdown', () => {
            this.handleUpMovement(bird)
        });

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.handleUpMovement(bird)
        });

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

    handleCollision() {
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

        this.currentPipePos = this.currentPipePos + PIPE_GAP;

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
    }
}
