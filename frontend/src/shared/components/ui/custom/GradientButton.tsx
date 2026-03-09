import { useState } from "react";

type ColorName =
	| "red"
	| "orange"
	| "amber"
	| "yellow"
	| "lime"
	| "green"
	| "emerald"
	| "teal"
	| "cyan"
	| "blue"
	| "indigo"
	| "violet"
	| "purple"
	| "fuchsia"
	| "pink"
	| "rose";
type ColorValue = "300" | "500" | "700";
type ButtonSize = "sm" | "md" | "lg";

interface GradientButtonProps {
	text?: string;
	color?: string;
	size?: ButtonSize;
	onClick?: () => void;
	className?: string;
}

type ColorMap = Record<ColorName, Record<ColorValue, string>>;

const colorMap: ColorMap = {
	red: { 300: "254,205,211", 500: "239,68,68", 700: "185,28,28" },
	orange: { 300: "253,186,116", 500: "249,115,22", 700: "194,65,12" },
	amber: { 300: "252,191,73", 500: "251,146,60", 700: "180,83,9" },
	yellow: { 300: "253,224,71", 500: "234,179,8", 700: "161,98,7" },
	lime: { 300: "190,214,82", 500: "132,204,22", 700: "101,163,13" },
	green: { 300: "134,239,172", 500: "34,197,94", 700: "21,128,61" },
	emerald: { 300: "110,231,183", 500: "16,185,129", 700: "5,150,105" },
	teal: { 300: "94,234,212", 500: "20,184,166", 700: "15,118,110" },
	cyan: { 300: "165,243,252", 500: "34,211,238", 700: "6,182,212" },
	blue: { 300: "147,197,253", 500: "59,130,246", 700: "29,78,216" },
	indigo: { 300: "165,180,252", 500: "79,70,229", 700: "55,48,163" },
	violet: { 300: "196,181,253", 500: "139,92,246", 700: "109,40,217" },
	purple: { 300: "216,180,254", 500: "168,85,247", 700: "126,34,206" },
	fuchsia: { 300: "232,121,249", 500: "217,70,239", 700: "162,28,175" },
	pink: { 300: "249,168,212", 500: "236,72,153", 700: "190,24,93" },
	rose: { 300: "253,164,175", 500: "244,63,94", 700: "190,24,93" },
};

const sizeConfig: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-6 py-2.5 text-base",
	lg: "px-8 py-3.5 text-lg",
};

export const GradientButton = ({
	text = "Click Me",
	color = "bg-green-500",
	size = "md",
	onClick = () => {},
	className = "",
}: GradientButtonProps) => {
	const [isPressed, setIsPressed] = useState<boolean>(false);

	const colorMatch = color.match(/bg-([\w]+)-/);
	const colorName = (colorMatch?.[1] ?? "green") as ColorName;
	const colorValue = (color.match(/-(\d+)$/)?.[1] ?? "500") as ColorValue;

	const colorRGB = colorMap[colorName]?.[colorValue] ?? colorMap.green["500"];
	const lighterRGB = colorMap[colorName]?.["300"] ?? colorMap.green["300"];
	const darkerRGB = colorMap[colorName]?.["700"] ?? colorMap.green["700"];

	const buttonStyle: React.CSSProperties = {
		background: `linear-gradient(135deg, rgb(${lighterRGB}) 0%, rgb(${colorRGB}) 50%, rgb(${darkerRGB}) 100%)`,
		boxShadow: isPressed
			? `0 2px 4px rgba(${colorRGB}, 0.3)`
			: `0 8px 16px rgba(${colorRGB}, 0.3)`,
		transform: isPressed ? "scale(0.98)" : "scale(1)",
	};

	return (
		<button
			onClick={onClick}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseLeave={() => setIsPressed(false)}
			className={`
        relative font-medium text-white rounded-lg
        transition-all duration-150 ease-out
        hover:shadow-lg active:shadow-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeConfig[size] ?? sizeConfig.md}
        ${className}
      `}
			style={buttonStyle}
		>
			<span className="relative z-10 drop-shadow-sm">{text}</span>
			<div
				className="absolute inset-0 rounded-lg opacity-20"
				style={{
					background:
						"linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
				}}
			/>
		</button>
	);
};
