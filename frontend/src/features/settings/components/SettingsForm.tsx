import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import {
	settingsSchema,
	type SettingsFormData,
} from "../schemas/settings.schema";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export const SettingsForm = observer(() => {
	const { authStore, uiStore, gameStore } = useStore();

	// Initialise form with default values from stores
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<SettingsFormData>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			username: authStore.user?.username || "",
			email: authStore.user?.email || "",
			defaultDifficulty: gameStore.difficulty,
			soundEnabled: uiStore.soundEnabled,
			theme: uiStore.theme,
		},
	});

	const onSubmit = async (data: SettingsFormData) => {
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Update stores with new values using actions
			authStore.updateUser(data.username, data.email);
			gameStore.setDifficulty(data.defaultDifficulty, true);
			uiStore.setSoundEnabled(data.soundEnabled);
			uiStore.setTheme(data.theme);

			toast.success("Settings saved successfully!");
		} catch (error) {
			toast.error("Failed to save settings");
			console.error(error);
		}
	};

	const handleReset = () => {
		reset({
			username: authStore.user?.username || "",
			email: authStore.user?.email || "",
			defaultDifficulty: gameStore.difficulty,
			soundEnabled: uiStore.soundEnabled,
			theme: uiStore.theme,
		});
		toast.info("Form reset to current values");
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* User Information Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					User Information
				</h2>

				<div className="space-y-2">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						{...register("username")}
						placeholder="Enter your username"
						className={errors.username ? "border-red-500" : ""}
					/>
					{errors.username && (
						<p className="text-sm text-red-500">
							{errors.username.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						{...register("email")}
						placeholder="Enter your email"
						className={errors.email ? "border-red-500" : ""}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">
							{errors.email.message}
						</p>
					)}
				</div>
			</div>

			{/* Game Preferences Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					Game Preferences
				</h2>

				<div className="space-y-2">
					<Label htmlFor="defaultDifficulty">
						Default Difficulty
					</Label>
					<select
						id="defaultDifficulty"
						{...register("defaultDifficulty")}
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="easy">Easy</option>
						<option value="normal">Normal</option>
						<option value="hard">Hard</option>
					</select>
					{errors.defaultDifficulty && (
						<p className="text-sm text-red-500">
							{errors.defaultDifficulty.message}
						</p>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="soundEnabled"
						{...register("soundEnabled")}
						className="h-4 w-4 rounded border-gray-300"
					/>
					<Label htmlFor="soundEnabled" className="cursor-pointer">
						Enable sound effects
					</Label>
				</div>
			</div>

			{/* UI Preferences Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					Appearance
				</h2>

				<div className="space-y-2">
					<Label>Theme</Label>
					<div className="flex gap-4">
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								{...register("theme")}
								value="light"
								className="h-4 w-4"
							/>
							<span className="text-sm">☀️ Light</span>
						</label>
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								{...register("theme")}
								value="dark"
								className="h-4 w-4"
							/>
							<span className="text-sm">🌙 Dark</span>
						</label>
					</div>
					{errors.theme && (
						<p className="text-sm text-red-500">
							{errors.theme.message}
						</p>
					)}
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<Button
					type="submit"
					disabled={isSubmitting}
					className="flex-1"
				>
					{isSubmitting ? "Saving..." : "Save Settings"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					disabled={isSubmitting}
				>
					Reset
				</Button>
			</div>
		</form>
	);
});
