import { apiClient } from "@/shared/services/api/api-client";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/api.types";
import type {
	GameScore,
	UserStats,
	LeaderboardEntry,
	LeaderboardFilters,
} from "../types/game.types";
import type { GameStats } from "@/app/stores/game.store";

/**
 * Submit game score request
 */
export interface SubmitScoreRequest extends GameStats {
	difficulty: string;
}

/**
 * Game service for score and stats management
 */
export const gameService = {
	/**
	 * Submit game score after completing a game
	 */
	async submitScore(scoreData: SubmitScoreRequest): Promise<GameScore> {
		const response = await apiClient.post<ApiResponse<GameScore>>(
			"/game/scores",
			scoreData
		);
		return response.data.data;
	},

	/**
	 * Get current user's statistics
	 */
	async getUserStats(): Promise<UserStats> {
		const response = await apiClient.get<ApiResponse<UserStats>>(
			"/game/stats/me"
		);
		return response.data.data;
	},

	/**
	 * Get leaderboard with optional filters
	 */
	async getLeaderboard(
		filters: LeaderboardFilters = {}
	): Promise<LeaderboardEntry[]> {
		const params = new URLSearchParams();

		if (filters.difficulty && filters.difficulty !== "all") {
			params.append("difficulty", filters.difficulty);
		}
		if (filters.timeframe) {
			params.append("timeframe", filters.timeframe);
		}
		if (filters.limit) {
			params.append("limit", filters.limit.toString());
		}

		const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
			`/game/leaderboard?${params.toString()}`
		);
		return response.data.data;
	},

	/**
	 * Get user's game history
	 */
	async getGameHistory(
		page: number = 1,
		pageSize: number = 10
	): Promise<PaginatedResponse<GameScore>> {
		const response = await apiClient.get<
			ApiResponse<PaginatedResponse<GameScore>>
		>(`/game/history?page=${page}&pageSize=${pageSize}`);
		return response.data.data;
	},
};
