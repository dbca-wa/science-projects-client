import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import type { Target as TargetType } from "@/app/stores/game.store";

interface TargetProps {
	target: TargetType;
}

export const Target = observer(({ target }: TargetProps) => {
	const { gameStore } = useStore();
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isClicked) return;
		setIsClicked(true);

		const reactionTime = Date.now() - target.createdAt;
		gameStore.hitTarget(target.id, reactionTime);
	};

	const size = gameStore.settings.targetSize;

	return (
		<button
			onClick={handleClick}
			disabled={isClicked}
			style={{
				position: "absolute",
				left: `${target.x}px`,
				top: `${target.y}px`,
				width: `${size}px`,
				height: `${size}px`,
			}}
			className={`
				rounded-full bg-red-500 hover:bg-red-600 
				transition-colors
				flex items-center justify-center
				text-white font-bold shadow-lg
				${!isClicked && "hover:scale-110 active:scale-95 cursor-pointer"}
				${isClicked ? "pointer-events-none opacity-0 scale-0" : ""}
			`}
		>
			<span className="text-2xl">🎯</span>
		</button>
	);
});
