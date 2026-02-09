import { motion } from "framer-motion";
import React, { type ReactNode, type ReactElement } from "react";

interface ITypewriterProps {
	children: ReactNode;
	characterDelay?: number;
	characterDuration?: number;
}

// Helper function outside component - pure function, no mutations during render
function calculateChildrenWithDelays(
	childArray: React.ReactNode[],
	characterDelay: number
) {
	let totalCharacters = 0; // Safe for react - this is in a pure function

	return childArray
		.map((child, lineIndex) => {
			if (React.isValidElement(child)) {
				const element = child as ReactElement<{ children: ReactNode }>;
				const childContent = element.props.children;

				if (typeof childContent === "string") {
					const startDelay = totalCharacters * characterDelay;
					totalCharacters += childContent.length;

					return {
						type: "text" as const,
						content: childContent,
						startDelay,
						lineIndex,
					};
				} else {
					const startDelay = totalCharacters * characterDelay;
					return {
						type: "element" as const,
						content: child,
						startDelay,
						lineIndex,
					};
				}
			}
			return null;
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);
}

export const TypewriterText = ({
	children,
	characterDelay = 0.005,
	characterDuration = 0.005,
}: ITypewriterProps) => {
	const childArray = React.Children.toArray(children);

	// ✅ Call the pure function - no mutations happen during render
	const childrenWithDelays = calculateChildrenWithDelays(
		childArray,
		characterDelay
	);

	return (
		<motion.span
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			style={{ display: "inline", whiteSpace: "normal" }}
		>
			{childrenWithDelays.map((item) => {
				if (item.type === "text") {
					return (
						<AnimatedText
							key={item.lineIndex}
							text={item.content}
							delayStart={item.startDelay}
							characterDelay={characterDelay}
							characterDuration={characterDuration}
						/>
					);
				} else {
					return (
						<motion.span
							key={item.lineIndex}
							style={{ display: "inline", marginLeft: "0.2em" }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{
								delay: item.startDelay,
								duration: characterDuration,
							}}
						>
							{item.content}
						</motion.span>
					);
				}
			})}
		</motion.span>
	);
};

interface AnimatedTextProps {
	text: string;
	delayStart: number;
	characterDelay: number;
	characterDuration: number;
}

const AnimatedText = ({
	text,
	delayStart,
	characterDelay,
	characterDuration,
}: AnimatedTextProps) => {
	return (
		<motion.span style={{ display: "inline" }}>
			{text.split("").map((char, charIndex) => (
				<motion.span
					key={charIndex}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: delayStart + charIndex * characterDelay,
						duration: characterDuration,
					}}
				>
					{char}
				</motion.span>
			))}
		</motion.span>
	);
};
