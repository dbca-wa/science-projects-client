import type { Difficulty } from "@/app/stores/game.store";

export interface UserSettings {
	username: string;
	email: string;
	defaultDifficulty: Difficulty;
	soundEnabled: boolean;
	theme: "light" | "dark";
}
