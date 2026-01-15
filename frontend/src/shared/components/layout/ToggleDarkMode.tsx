import { useEditorStore, useUIStore } from "@/app/stores/useStore";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

interface ToggleDarkModeProps {
	showText?: boolean;
	asMenuItem?: boolean;
}

export const ToggleDarkMode = observer(
	({ showText, asMenuItem }: ToggleDarkModeProps) => {
		const { theme, setTheme } = useUIStore();
		const editorStore = useEditorStore();

		const isDark = theme === "dark";
		const icon = isDark ? <FaSun /> : <FaMoon />;
		const colorScheme = isDark ? "orange" : "blue";

		const handleClick = () => {
			editorStore.manuallyCheckAndToggleDialog(() => {
				setTheme(isDark ? "light" : "dark");
			});
		};

		if (asMenuItem) {
			return (
				<DropdownMenuItem
					onClick={handleClick}
					className="cursor-pointer"
				>
					{icon}
					<span className="ml-2">Toggle Dark Mode</span>
				</DropdownMenuItem>
			);
		}

		return (
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={theme}
					initial={{ x: -10, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 10, opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="inline-block"
				>
					{showText ? (
						<Button
							variant="ghost"
							onClick={handleClick}
							className={`${
								colorScheme === "blue"
									? "text-blue-400"
									: "text-orange-400"
							} hover:bg-white/40 dark:hover:bg-white/50 ${
								colorScheme === "blue"
									? "hover:text-blue-300"
									: "hover:text-orange-300"
							}`}
							aria-label="Toggle Dark Mode"
						>
							<span>{isDark ? "Light" : "Dark"}</span>
							<span className="ml-2">{icon}</span>
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClick}
							className={
								colorScheme === "blue"
									? "text-blue-400"
									: "text-orange-400"
							}
							aria-label="Toggle Dark Mode"
						>
							{icon}
						</Button>
					)}
				</motion.div>
			</AnimatePresence>
		);
	}
);

ToggleDarkMode.displayName = "ToggleDarkMode";
