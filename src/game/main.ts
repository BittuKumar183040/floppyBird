import { BASE_HEIGHT, BASE_WIDTH } from './config/config';
import { GameOver } from './scenes/GameOver';
import { Intro } from './scenes/Intro';
import { LevelI } from './scenes/LevelI'
import { AUTO, Game, Types } from 'phaser';

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        Intro,
        LevelI, 
        GameOver,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const StartGame = (parent: any) => {
    return new Game({ ...config, parent });
}

export default StartGame;

