import { Scene } from "phaser";
import { BASE_HEIGHT, BASE_WIDTH, primary } from "../config/config";
import { getHighScore, setHeight } from "../controller/methods";

interface ObjProp {
	score: number | undefined;
}

export class GameOver extends Scene {
	private gradientGraphics!: Phaser.GameObjects.Graphics;
	private gradientOffset: number = 0;

	constructor() {
		super('GameOver');
	}

	preload() {
		this.load.setPath('assets');
		this.load.image('gameover', 'gameover.png');
		this.load.image('logo', 'logo.png');
	}

	create(obj: ObjProp) {
		this.gradientGraphics = this.add.graphics();
		this.drawGradientBackground();

		const logo = this.add.image(120, 50, 'logo').setDepth(200);
		setHeight(logo, 200);

		const gameOver = this.add.image(BASE_WIDTH / 2, BASE_HEIGHT / 3, 'gameover').setDepth(100);
		setHeight(gameOver, 900);

		this.add.text(BASE_WIDTH - 40, 100, `SCORE : ${obj.score ? obj.score : 0}`, {
			fontFamily: 'Arial Black', stroke: "#000000",
			fontSize: '40px', strokeThickness: 5, color: '#ffffff',
		}).setOrigin(1).setDepth(100);

		this.add.text(BASE_WIDTH / 2, 70, `HIGH SCORE : ${getHighScore()}`, {
			fontFamily: 'Arial Black',
			fontSize: '40px', color: '#ffffff',
			stroke: "#000000", strokeThickness: 5,
		}).setOrigin(0.5).setDepth(100);

		this.add.text(BASE_WIDTH / 2, BASE_HEIGHT - 350, 'PLAY AGAIN?', {
			fontFamily: 'Arial Black', fontSize: '55px',
			color: '#ffffff', stroke: "#000000",
			strokeThickness: 5, align: 'center',
		}).setOrigin(0.5).setDepth(100);

		const btn_yes = this.add.text(BASE_WIDTH / 2 - 200, BASE_HEIGHT - 200, 'YES', {
			fontFamily: 'Arial Black', fontSize: '55px',
			color: '#ffffff', stroke: "#000000",
			strokeThickness: 5, align: 'center',
		}).setInteractive().setOrigin(0.5)
			.setDepth(100).on('pointerdown', () => {
				this.scene.start('LevelI');
			});

		btn_yes.on('pointerover', () => {
			btn_yes.setStyle({ color: primary, fontSize: '58px', });
			this.input.manager.canvas.style.cursor = 'pointer';
		});

		btn_yes.on('pointerout', () => {
			btn_yes.setStyle({ color: "#fff", fontSize: '55px' });
			this.input.manager.canvas.style.cursor = 'default';
		});

		const btn_no = this.add.text(BASE_WIDTH / 2 + 200, BASE_HEIGHT - 200, 'NO', {
			fontFamily: 'Arial Black', fontSize: '55px',
			color: '#ffffff', stroke: "#000000",
			strokeThickness: 5, align: 'center',
		}).setInteractive().setOrigin(0.5)
			.setDepth(100).on('pointerdown', () => {
				this.scene.start('Intro');
			});

		btn_no.on('pointerover', () => {
			btn_no.setStyle({ color: primary, fontSize: '58px', });
			this.input.manager.canvas.style.cursor = 'pointer';
		});
		btn_no.on('pointerout', () => {
			btn_no.setStyle({ color: "#ffffff", fontSize: '55px' });
			this.input.manager.canvas.style.cursor = 'default';
		});
	}

	update() {
		this.gradientOffset += 1;
		if (this.gradientOffset > BASE_HEIGHT) {
			this.gradientOffset = 0;
		} this.drawGradientBackground();
	}

	drawGradientBackground() {
		const gradientColors = [0xffc1cc, 0xffe4b5, 0xffffe0, 0xccffcc, 0xccffff, 0xccccff, 0xf5ccff];
		const gradientHeight = BASE_HEIGHT / gradientColors.length;

		this.gradientGraphics.clear();

		for (let i = 0; i < gradientColors.length; i++) {
			const color = gradientColors[i];
			const y = (gradientHeight * i + this.gradientOffset) % BASE_HEIGHT * 1.2;

			this.gradientGraphics.fillStyle(color, 1);
			this.gradientGraphics.fillRect(0, y - gradientHeight, BASE_WIDTH, gradientHeight);
		}
	}
}