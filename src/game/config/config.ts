const ration = Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
export let BASE_HEIGHT = 1080;
export let BASE_WIDTH = ration * BASE_HEIGHT

// colors
export const primary = "#b4ff7d";
export const backendurl = import.meta.env.VITE_BACKEND_API