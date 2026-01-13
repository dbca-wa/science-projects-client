import type { Difficulty } from "@/app/stores/game.store";

/**
 * Game score entry
 */
export interface GameScore {
	id: string;
	userId: string;
	username: string;
	score: number;
	difficulty: Difficulty;
	hits: number;
	misses: number;
	accuracy: number;
	highestCombo: number;
	playedAt: string;
}

/**
 * User statistics
 */
export interface UserStats {
	totalGames: number;
	totalScore: number;
	averageScore: number;
	bestScore: number;
	totalHits: number;
	totalMisses: number;
	overallAccuracy: number;
	bestCombo: number;
	favoritesDifficulty: Difficulty;
	gamesPerDifficulty: {
		easy: number;
		normal: number;
		hard: number;
	};
	recentGames: GameScore[];
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
	rank: number;
	userId: string;
	username: string;
	score: number;
	difficulty: Difficulty;
	playedAt: string;
	isCurrentUser?: boolean;
}

/**
 * Leaderboard filter options
 */
export interface LeaderboardFilters {
	difficulty?: Difficulty | "all";
	timeframe?: "today" | "week" | "month" | "allTime";
	limit?: number;
}
