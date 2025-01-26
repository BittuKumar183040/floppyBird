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
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
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

let currentGame: Phaser.Game;

const StartGame = (parent: any) => {
    currentGame = new Game({ ...config, parent });
    return currentGame;
}

export default StartGame;