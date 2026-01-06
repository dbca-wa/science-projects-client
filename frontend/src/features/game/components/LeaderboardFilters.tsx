import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import type { Difficulty } from "@/app/stores/game.store";
import type { LeaderboardFilters } from "../types/game.types";

interface LeaderboardFiltersProps {
	onFilterChange: (filters: LeaderboardFilters) => void;
}

export const LeaderboardFiltersComponent = ({
	onFilterChange,
}: LeaderboardFiltersProps) => {
	const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
	const [timeframe, setTimeframe] = useState<
		"today" | "week" | "month" | "allTime"
	>("allTime");

	const handleDifficultyChange = (newDifficulty: Difficulty | "all") => {
		setDifficulty(newDifficulty);
		onFilterChange({ difficulty: newDifficulty, timeframe });
	};

	const handleTimeframeChange = (
		newTimeframe: "today" | "week" | "month" | "allTime"
	) => {
		setTimeframe(newTimeframe);
		onFilterChange({ difficulty, timeframe: newTimeframe });
	};

	return (
		<div className="space-y-4 mb-6">
			<div>
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
					Difficulty
				</label>
				<div className="flex flex-wrap gap-2">
					{(["all", "easy", "normal", "hard"] as const).map(
						(diff) => (
							<Button
								key={diff}
								variant={
									difficulty === diff ? "default" : "outline"
								}
								size="sm"
								onClick={() => handleDifficultyChange(diff)}
								className="capitalize"
							>
								{diff}
							</Button>
						)
					)}
				</div>
			</div>

			<div>
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
					Timeframe
				</label>
				<div className="flex flex-wrap gap-2">
					{(["today", "week", "month", "allTime"] as const).map(
						(time) => (
							<Button
								key={time}
								variant={
									timeframe === time ? "default" : "outline"
								}
								size="sm"
								onClick={() => handleTimeframeChange(time)}
								className="capitalize"
							>
								{time === "allTime" ? "All Time" : time}
							</Button>
						)
					)}
				</div>
			</div>
		</div>
	);
};
