import { observer } from "mobx-react-lite";
import { useEditorStore, useUIStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { RiLayout3Fill, RiLayoutTopFill } from "react-icons/ri";

interface ToggleLayoutProps {
	showText?: boolean;
	asMenuItem?: boolean;
}

export const ToggleLayout = observer(
	({ showText, asMenuItem }: ToggleLayoutProps) => {
		const editorStore = useEditorStore();
		const uiStore = useUIStore();

		const handleClick = () => {
			editorStore.manuallyCheckAndToggleDialog(() => {
				uiStore.toggleLayout();
			});
		};

		const layouts = {
			traditional: {
				key: "traditional",
				icon: <RiLayout3Fill />,
			},
			modern: {
				key: "modern",
				icon: <RiLayoutTopFill />,
			},
		};

		const currentLayout = layouts[uiStore.layout];

		if (asMenuItem) {
			return (
				<DropdownMenuItem
					onClick={handleClick}
					className="cursor-pointer"
				>
					{currentLayout.icon}
					<span className="ml-2">Toggle Layout</span>
				</DropdownMenuItem>
			);
		}

		return (
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={currentLayout.key}
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
							className="text-gray-400 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/50 hover:text-white"
						>
							<span className="pl-3">
								{uiStore.layout === "modern"
									? "Traditional"
									: "Modern"}
							</span>
							<span className="ml-2">{currentLayout.icon}</span>
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClick}
							className="text-gray-400 dark:text-gray-300"
							aria-label="Toggle Layout"
						>
							{currentLayout.icon}
						</Button>
					)}
				</motion.div>
			</AnimatePresence>
		);
	}
);

ToggleLayout.displayName = "ToggleLayout";
