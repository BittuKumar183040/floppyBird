import { Scene } from "phaser";
import { BASE_HEIGHT, BASE_WIDTH, primary } from "../config/config";
import { getHighScore, setHeight } from "../controller/methods";

interface ObjProp {
	score : number | undefined

}


export class GameOver extends Scene {
	constructor() {
		super('GameOver');
	}

	preload() {
		this.load.setPath('assets');
		this.load.image('gameover', 'gameover.png');
	}

	create(obj : ObjProp) {
		
		const logo = this.add.image(BASE_WIDTH/2, BASE_HEIGHT/3 , 'gameover').setDepth(100);
		setHeight(logo, 900);
		
		this.add.text(BASE_WIDTH - 40, 100, `SCORE : ${obj.score ? obj.score : 0}`, {
			fontFamily: 'Arial Black',
			fontSize: '55px',
			color: '#ffffff'
		}).setOrigin(1).setDepth(100)

		this.add.text(BASE_WIDTH/2, 70, `HIGH SCORE : ${getHighScore()}`, {
			fontFamily: 'Arial Black',
			fontSize: '40px',
			color: '#ffffff'
		}).setOrigin(0.5).setDepth(100)


		this.add.text(BASE_WIDTH / 2, BASE_HEIGHT - 350, 'PLAY AGAIN?', {
			fontFamily: 'Arial Black',
			fontSize: '55px',
			color: '#ffffff',
			stroke: "#000000",
			strokeThickness: 5,
			align: 'center'
		})
			.setOrigin(0.5)
			.setDepth(100)

		const btn_yes= this.add.text(BASE_WIDTH / 2-200, BASE_HEIGHT - 200, 'YES', {
			fontFamily: 'Arial Black',
			fontSize: '55px',
			color: '#ffffff',
			stroke: "#000000",
			strokeThickness: 5,
			align: 'center'
		})
			.setInteractive()
			.setOrigin(0.5)
			.setDepth(100)
			.on('pointerdown', () => {
				this.scene.start('LevelI');
		});

		btn_yes.on('pointerover', () => {
			btn_yes.setStyle({ color: primary});
			this.input.manager.canvas.style.cursor = 'pointer';
		});
		btn_yes.on('pointerout', () => {
			btn_yes.setStyle({ color: "#fff"});
			this.input.manager.canvas.style.cursor = 'pointer';
		});


		const btn_no = this.add.text(BASE_WIDTH / 2+200, BASE_HEIGHT - 200, 'NO', {
			fontFamily: 'Arial Black',
			fontSize: '55px',
			color: '#ffffff',
			stroke: "#000000",
			strokeThickness: 5,
			align: 'center'
		})
		.setInteractive()
			.setOrigin(0.5)
			.setDepth(100).on('pointerdown', () => {
				this.scene.start('Intro');
		});

		btn_no.on('pointerover', () => {
			btn_no.setStyle({ color: primary});
			this.input.manager.canvas.style.cursor = 'pointer';
		});
		btn_no.on('pointerout', () => {
			btn_no.setStyle({ color: "#ffffff"});
			this.input.manager.canvas.style.cursor = 'pointer';
		});



	}
}	