import { height, width } from './config/config';
import { Intro } from './scenes/Intro';
import { LevelI } from './scenes/LevelI'
import { AUTO, Game, Types } from 'phaser';

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: width,
    height: height,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        LevelI,
        Intro,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 500 },
            debug: false
        }
    }
};

const StartGame = (parent: any) => {
    return new Game({ ...config, parent });
}

export default StartGame;

