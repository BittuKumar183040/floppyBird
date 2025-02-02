import { backendurl } from "../config/config";

export const setHeight = (asset: Phaser.GameObjects.Image, height: number) => {
	asset.displayWidth = height;
	asset.displayHeight = asset.displayWidth * (asset.height / asset.width);
};

export const getHighScore = () => {
	const score = localStorage.getItem('highscore');
	return score ?? 0;
}


export const submitScore = async (username: string, score: number) => {
	try {
		if (score < 1) return null;

		const response = await fetch(`${backendurl}/scoreboard`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, score, "website": "flappybird" }),
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error submitting score:', error);
		return null;
	}
}