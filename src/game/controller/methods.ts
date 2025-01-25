export const setHeight = (asset: Phaser.GameObjects.Image, height: number) => {
		asset.displayWidth = height;
		asset.displayHeight = asset.displayWidth * (asset.height / asset.width);
};