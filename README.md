# Floppy Bird Game

Floppy Bird is a web-based game built using **React**, **TypeScript**, and **Phaser** for physics. It leverages **Vite** for fast bundling and development. This project showcases the seamless integration of React components with Phaser’s powerful game engine to deliver an engaging user experience.

---

## 🎮 Game Overview
Floppy Bird is inspired by the classic Flappy Bird game, with enhanced graphics and physics-based gameplay. The game features:
- Three distinct screens:
  - **Starting Screen**: Game introduction and start button
  - **Game Screen**: Main gameplay area
  - **Scoreboard**: Displays high scores with data stored in a MySQL database
- Physics-driven interactions using Phaser
- Responsive UI adaptable to multiple screen sizes
- Edge case handling for error possibilities

---

## 🚀 Tech Stack
- **React** - Frontend library for building UI components
- **TypeScript** - Type safety and maintainable codebase
- **Phaser** - Game engine for physics and rendering
- **Vite** - Fast development bundler
- **MySQL** - Database for storing high scores

---

## 📁 Project Structure
```
floppyBird/
├── index.html          # Main HTML container
├── src/                # React client source code
│   ├── main.tsx        # Bootstrap for React application
│   ├── App.tsx         # Main React component
│   └── game/           # Game related code
│       ├── PhaserGame.tsx  # Bridge between React and Phaser
│       └── scenes/         # Phaser Scenes (Starting, Game, Scoreboard)
└── public/assets/      # Static assets (images, sounds)
```

---

## ⚙️ Installation and Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/BittuKumar183040/floppyBird
   cd floppyBird
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The game will be available at `http://localhost:8080`.

---

## 📜 Available Scripts
- `npm run dev`: Starts the development server with hot-reloading
- `npm run build`: Creates a production build in the `dist` folder
- `npm run dev-nolog`: Development server without logging
- `npm run build-nolog`: Production build without logging

---

## 🌐 Live Demo
Play the game [here](https://flappybird-gg.vercel.app/).


