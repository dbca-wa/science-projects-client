import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gameService, type SubmitScoreRequest } from "../services/game.service";
import type { LeaderboardFilters } from "../types/game.types";
import { useStore } from "@/app/stores/useStore";
import { toast } from "sonner";

/**
 * Mock flag - set to false when backend is ready
 */
const USE_MOCK = true;

/**
 * Mock delay to simulate network request
 */
const mockDelay = (ms: number = 500) =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock user statistics
 */
const mockStats = {
	totalGames: 42,
	totalScore: 12450,
	averageScore: 296,
	bestScore: 850,
	totalHits: 420,
	totalMisses: 89,
	overallAccuracy: 82,
	bestCombo: 15,
	favoritesDifficulty: "normal" as const,
	gamesPerDifficulty: { easy: 10, normal: 25, hard: 7 },
	recentGames: [
		{
			id: "1",
			userId: "1",
			username: "TestPlayer",
			score: 450,
			difficulty: "normal" as const,
			hits: 45,
			misses: 5,
			accuracy: 90,
			highestCombo: 12,
			playedAt: new Date().toISOString(),
		},
		{
			id: "2",
			userId: "1",
			username: "TestPlayer",
			score: 320,
			difficulty: "easy" as const,
			hits: 40,
			misses: 8,
			accuracy: 83,
			highestCombo: 8,
			playedAt: new Date(Date.now() - 86400000).toISOString(),
		},
		{
			id: "3",
			userId: "1",
			username: "TestPlayer",
			score: 280,
			difficulty: "hard" as const,
			hits: 35,
			misses: 12,
			accuracy: 74,
			highestCombo: 6,
			playedAt: new Date(Date.now() - 172800000).toISOString(),
		},
	],
};

/**
 * Mock leaderboard data
 */
const mockLeaderboard = [
	{
		rank: 1,
		userId: "2",
		username: "ProGamer",
		score: 1200,
		difficulty: "hard" as const,
		playedAt: new Date().toISOString(),
	},
	{
		rank: 2,
		userId: "1",
		username: "TestPlayer",
		score: 850,
		difficulty: "normal" as const,
		playedAt: new Date(Date.now() - 3600000).toISOString(),
		isCurrentUser: true,
	},
	{
		rank: 3,
		userId: "3",
		username: "CasualPlayer",
		score: 720,
		difficulty: "normal" as const,
		playedAt: new Date(Date.now() - 7200000).toISOString(),
	},
	{
		rank: 4,
		userId: "4",
		username: "SpeedRunner",
		score: 680,
		difficulty: "easy" as const,
		playedAt: new Date(Date.now() - 10800000).toISOString(),
	},
	{
		rank: 5,
		userId: "5",
		username: "NightOwl",
		score: 650,
		difficulty: "hard" as const,
		playedAt: new Date(Date.now() - 14400000).toISOString(),
	},
	{
		rank: 6,
		userId: "6",
		username: "QuickClick",
		score: 600,
		difficulty: "normal" as const,
		playedAt: new Date(Date.now() - 18000000).toISOString(),
	},
	{
		rank: 7,
		userId: "7",
		username: "Sniper99",
		score: 580,
		difficulty: "hard" as const,
		playedAt: new Date(Date.now() - 21600000).toISOString(),
	},
	{
		rank: 8,
		userId: "8",
		username: "ChillGamer",
		score: 550,
		difficulty: "easy" as const,
		playedAt: new Date(Date.now() - 25200000).toISOString(),
	},
	{
		rank: 9,
		userId: "9",
		username: "AccuracyKing",
		score: 520,
		difficulty: "normal" as const,
		playedAt: new Date(Date.now() - 28800000).toISOString(),
	},
	{
		rank: 10,
		userId: "10",
		username: "Rookie2024",
		score: 480,
		difficulty: "easy" as const,
		playedAt: new Date(Date.now() - 32400000).toISOString(),
	},
];

/**
 * Query key factory for game-related queries
 */
export const gameKeys = {
	all: ["game"] as const,
	stats: () => [...gameKeys.all, "stats"] as const,
	leaderboard: (filters: LeaderboardFilters) =>
		[...gameKeys.all, "leaderboard", filters] as const,
	history: (page: number) => [...gameKeys.all, "history", page] as const,
};

/**
 * Hook to fetch user statistics
 */
export const useUserStats = () => {
	const { authStore } = useStore();

	return useQuery({
		queryKey: gameKeys.stats(),
		queryFn: async () => {
			if (USE_MOCK) {
				await mockDelay();
				return mockStats;
			}
			return gameService.getUserStats();
		},
		enabled: authStore.isAuthenticated,
		staleTime: 1000 * 60 * 2,
	});
};

/**
 * Hook to fetch leaderboard with filters
 */
export const useLeaderboard = (filters: LeaderboardFilters = {}) => {
	return useQuery({
		queryKey: gameKeys.leaderboard(filters),
		queryFn: async () => {
			if (USE_MOCK) {
				await mockDelay();

				// Apply basic filtering to mock data
				let filteredData = [...mockLeaderboard];

				// Filter by difficulty
				if (filters.difficulty && filters.difficulty !== "all") {
					filteredData = filteredData.filter(
						(entry) => entry.difficulty === filters.difficulty
					);
				}

				// Re-rank after filtering
				filteredData = filteredData.map((entry, index) => ({
					...entry,
					rank: index + 1,
				}));

				return filteredData;
			}
			return gameService.getLeaderboard(filters);
		},
		staleTime: 1000 * 30,
		refetchInterval: USE_MOCK ? false : 1000 * 60, // Don't auto-refetch in mock mode
	});
};

/**
 * Hook to fetch game history with pagination
 */
export const useGameHistory = (page: number = 1) => {
	const { authStore } = useStore();

	return useQuery({
		queryKey: gameKeys.history(page),
		queryFn: async () => {
			if (USE_MOCK) {
				await mockDelay();
				return {
					data: mockStats.recentGames,
					meta: {
						page: 1,
						pageSize: 10,
						totalPages: 1,
						totalItems: mockStats.recentGames.length,
					},
				};
			}
			return gameService.getGameHistory(page);
		},
		enabled: authStore.isAuthenticated,
		staleTime: 1000 * 60 * 5,
	});
};

/**
 * Hook to submit game score
 */
export const useSubmitScore = () => {
	const { authStore } = useStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (scoreData: SubmitScoreRequest) => {
			if (USE_MOCK) {
				await mockDelay();
				return {
					id: Date.now().toString(),
					userId: authStore.user?.id || "1",
					username: authStore.user?.username || "TestPlayer",
					...scoreData,
					playedAt: new Date().toISOString(),
				};
			}
			return gameService.submitScore(scoreData);
		},
		onSuccess: (newScore) => {
			queryClient.invalidateQueries({ queryKey: gameKeys.stats() });
			queryClient.invalidateQueries({ queryKey: gameKeys.all });

			const currentStats = queryClient.getQueryData(
				gameKeys.stats()
			) as any;
			if (currentStats && newScore.score > currentStats.bestScore) {
				toast.success("🎉 New High Score!", {
					description: `You scored ${newScore.score} points!`,
				});
			} else {
				toast.success("Score submitted successfully!");
			}
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to submit score"
			);
		},
	});
};
