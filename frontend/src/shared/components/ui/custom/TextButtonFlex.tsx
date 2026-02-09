import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/store-context";
import { cn } from "@/shared/lib/utils";

interface IProps {
	onClick?: () => void;
	name?: string;
}

export const TextButtonFlex = observer(({ onClick, name }: IProps) => {
	const uiStore = useUIStore();

	return (
		<div className="flex justify-start items-center max-w-full pr-8">
			<button
				type="button"
				onClick={onClick}
				disabled={!name}
				className={cn(
					"font-semibold whitespace-normal break-words text-left",
					name
						? cn(
								"cursor-pointer transition-colors",
								uiStore.theme === "light"
									? "text-blue-500 hover:text-blue-400 hover:underline"
									: "text-blue-400 hover:text-blue-300 hover:underline"
						  )
						: "cursor-default"
				)}
			>
				{name ?? "-"}
			</button>
		</div>
	);
});

TextButtonFlex.displayName = "TextButtonFlex";
