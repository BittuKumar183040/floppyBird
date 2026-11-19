export const setHeight = (asset: Phaser.GameObjects.Image, height: number) => {
	asset.displayWidth = height;
	asset.displayHeight = asset.displayWidth * (asset.height / asset.width);
};

export const getHighScore = () => {
	const score = Number(localStorage.getItem('highscore'));
	return Number.isFinite(score) ? score : 0;
}
