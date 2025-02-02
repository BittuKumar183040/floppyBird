import { BASE_HEIGHT, BASE_WIDTH } from './config/config';
import { GameOver } from './scenes/GameOver';
import { Intro } from './scenes/Intro';
import { LevelI } from './scenes/LevelI'
import { LevelII } from './scenes/LevelII'
import { AUTO, Game, Types } from 'phaser';

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#fff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER
    },
    scene: [
        Intro,
        LevelI,
        LevelII,
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