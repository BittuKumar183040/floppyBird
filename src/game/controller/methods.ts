import StartGame from "../main";

export const setHeight = (asset: Phaser.GameObjects.Image, height: number) => {
		asset.displayWidth = height;
		asset.displayHeight = asset.displayWidth * (asset.height / asset.width);
};

export const getHighScore = () => {
	const score = localStorage.getItem('highscore');
	return score ?? 0;
}
