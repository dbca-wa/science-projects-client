import { makeAutoObservable } from "mobx";

export type GameState = "idle" | "playing" | "paused" | "gameOver";
export type Difficulty = "easy" | "normal" | "hard";

export interface Target {
	id: string;
	x: number;
	y: number;
	createdAt: number;
}

export interface GameStats {
	score: number;
	hits: number;
	misses: number;
	accuracy: number;
	highestCombo: number;
}

export default class GameStore {
	gameState: GameState = "idle"; // Default to idle
	difficulty: Difficulty = "normal"; // Default to normal
	score = 0;
	timeRemainingMs = 5000; // Store in milliseconds internally
	targets: Target[] = [];
	currentCombo = 0;
	highestCombo = 0;
	hits = 0;
	misses = 0;
	boardDimensions = { width: 0, height: 0 };

	private difficultySettings = {
		// size of target, time reward if succeed, time penalty if fail
		easy: { targetSize: 80, reward: 2000, penalty: 1000 },
		normal: { targetSize: 60, reward: 1000, penalty: 2000 },
		hard: { targetSize: 40, reward: 500, penalty: 3000 },
	};

	constructor() {
		makeAutoObservable(this);
	}

	// Get current difficulty settings based on current set difficulty
	get settings() {
		return this.difficultySettings[this.difficulty];
	}

	// Calculate accuracy percentage
	get accuracy() {
		const total = this.hits + this.misses;
		return total === 0 ? 0 : Math.round((this.hits / total) * 100);
	}

	setBoardDimensions = (width: number, height: number) => {
		this.boardDimensions = { width, height };
	};

	// DRY Principle - helper function to prevent repetition between startGame and resetGame function
	softReset = (state: GameState) => {
		this.gameState = state;
		this.score = 0;
		this.timeRemainingMs = 5000;
		this.targets = [];
		this.currentCombo = 0;
		this.highestCombo = 0;
		this.hits = 0;
		this.misses = 0;
	};

	// New Target
	spawnTarget = () => {
		// Fallback to window size if dimensions aren't set yet,
		// but usually, we'll have these from the component
		const { width, height } = this.boardDimensions;

		// Use a default or window size if dimensions are 0 (prevents targets stuck at 0,0)
		const boardW = width || window.innerWidth;
		const boardH = height || window.innerHeight;

		const targetSize = this.settings.targetSize;
		const padding = 20;

		const maxX = boardW - targetSize - padding;
		const maxY = boardH - targetSize - padding;

		const x = Math.max(padding, Math.floor(Math.random() * maxX));
		const y = Math.max(padding, Math.floor(Math.random() * maxY));

		const target: Target = {
			id: `target-${Date.now()}-${Math.random()}`,
			x,
			y,
			createdAt: Date.now(),
		};

		this.targets = [target];
	};

	// Start Game
	startGame = () => {
		this.softReset("playing");
		this.spawnTarget();
	};

	// Pause Game
	pauseGame = () => {
		// Should only be pausable from play state
		if (this.gameState === "playing") {
			this.gameState = "paused";
		}
	};

	// Resume Game
	resumeGame = () => {
		// Should only be resumable from pause state
		if (this.gameState === "paused") {
			this.gameState = "playing";
		}
	};

	// End Game
	endGame = () => {
		this.gameState = "gameOver";
		this.targets = []; // Clear targets
	};

	// Reset Game
	resetGame = () => {
		this.softReset("idle");
	};

	// Set Difficulty
	setDifficulty = (difficulty: Difficulty) => {
		this.difficulty = difficulty;
	};

	// Remove Target via id
	removeTarget = (id: string) => {
		this.targets = this.targets.filter((t) => t.id !== id);
	};

	// Handle Target Hit
	hitTarget = (targetId: string, reactionTime: number) => {
		this.removeTarget(targetId);
		this.hits++;
		this.currentCombo++;

		// Check high combo
		if (this.currentCombo > this.highestCombo) {
			this.highestCombo = this.currentCombo;
		}

		// Calculate score based on reaction time and combo
		const baseScore = 10;
		const timeBonus = Math.max(0, 50 - reactionTime / 10);
		const comboMultipler = 1 + this.currentCombo * 0.1;
		const points = Math.round((baseScore + timeBonus) * comboMultipler);

		// Handle rewards
		this.score += points;
		this.timeRemainingMs += this.settings.reward;

		// Spawn next target immediately
		if (this.gameState === "playing") {
			this.spawnTarget();
		}
	};

	// DRY principle to prevent repeating in below functions
	timeCheck = () => {
		if (this.timeRemainingMs <= 0) {
			this.endGame();
		}
	};

	missTarget = (targetId: string) => {
		this.removeTarget(targetId);
		this.misses++;
		this.currentCombo = 0; // reset
		// Handle timer penalty
		this.timeRemainingMs -= this.settings.penalty;
		this.timeCheck();

		// Spawn next target immediately if game still playing
		if (this.gameState === "playing") {
			this.spawnTarget();
		}
	};

	// Timer
	tick = () => {
		if (this.gameState === "playing" && this.timeRemainingMs > 0) {
			this.timeRemainingMs -= 100;
			this.timeCheck();
		}
	};
}
