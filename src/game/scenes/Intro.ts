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

        const createText = ({text, fontSize, pos, onPointDown }:any) => {
            const button = this.add.text(pos.x, pos.y, text, {
                    fontFamily: 'Arial Black',
                    fontSize: fontSize + 'px',
                    color: '#ffffff',
                    stroke: "#000000",
                    strokeThickness: 5,
                    align: 'center'
            }).setOrigin(0, 1).setDepth(100)
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
        
        const gapText = 150

        createText({text:"START", fontSize: 44, onPointDown:() => {
                this.scene.start('LevelI');
            },
            pos:{
                x:200,
                y:BASE_HEIGHT-100-gapText*3
            }
        })

        createText({text:"Fullscreen", fontSize: 40, onPointDown:() => {

            const element = document.querySelector('canvas');
            if (element) {
                element.requestFullscreen()
            }},
            pos:{
                x:200,
                y:BASE_HEIGHT-100-gapText*2
            }
        })
        createText({text:"EXIT", fontSize: 40, onPointDown:() => {
            location.reload()
        },
        pos:{
            x:200,
            y:BASE_HEIGHT-100-gapText*1
        }
        })
        

        EventBus.emit('current-scene-ready', this);

    }
}
