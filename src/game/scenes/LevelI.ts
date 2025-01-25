import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { height, primary, width } from '../config/config';


const setHeight = (asset: Phaser.GameObjects.Image, height: number) => {
    asset.displayWidth = height
    asset.displayHeight = asset.displayWidth * (asset.height / asset.width)
}
const PIPE_HEIGHT_LIMIT = 180
const PIPE_GAP = 300
const PIPE_WIDTH = 100
let currentPipePos = width + 200
export class LevelI extends Scene {

    pipeGroup!: Phaser.Physics.Arcade.Group;
    pipeTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('character', 'character.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('pipe', 'pipe.png')
    }

    create() {
        this.physics.world.gravity.y = 500;
        const screen = this.add.image(width / 2, 384, 'background').setInteractive();
        const logo = this.add.image(120, 50, 'logo').setDepth(200)
        setHeight(logo, 200)

        const bird = this.physics.add.image(250, height / 2, 'character').setDepth(100)
        setHeight(bird, 60)
        bird.setCollideWorldBounds(true)

        screen.on('pointerdown', () => {
            bird.setVelocityY(-300)
        })

        this.pipeGroup = this.physics.add.group({
            allowGravity: false
        });

        this.pipeTimer = this.time.addEvent({
            delay: 1500,
            callback: () => this.PipesSpawn(),
            callbackScope: this,
            loop: true
        })

        EventBus.emit('current-scene-ready', this);
    }

    removePipe(pipe: Phaser.Physics.Arcade.Sprite) {
        pipe.destroy();
    }

    PipesSpawn() {

        const pipeY = Phaser.Math.Between(PIPE_HEIGHT_LIMIT, height - PIPE_HEIGHT_LIMIT)
        console.log("pipeY : ", pipeY)

        const Pipe = this.pipeGroup.create(currentPipePos, pipeY, 'pipe').setDepth(100) as Phaser.Physics.Arcade.Sprite
        setHeight(Pipe, PIPE_WIDTH)
        Pipe.setImmovable(true);
        Pipe.setVelocityX(-200);
        currentPipePos = currentPipePos + PIPE_GAP;

        // remove sprite
        this.pipeGroup.children.iterate((pipe) => {
            const sprite = pipe as Phaser.Physics.Arcade.Sprite;
            if (sprite && sprite.getBounds().right < 0) {
                console.log("Removed", sprite)
                this.removePipe(sprite);
            }
            return null;
        });
    }

    update() {

    }
}
