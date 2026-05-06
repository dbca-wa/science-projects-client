import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
	/** Primary message (e.g. "Email sent") */
	title: string;
	/** Secondary message (e.g. "They will receive your message shortly.") */
	subtitle?: string;
	/** How long to show before calling onComplete (ms). Default 1500. */
	duration?: number;
	/** Called after the animation duration elapses */
	onComplete?: () => void;
}

/**
 * Animated success state — green circle with spring-in tick, title, and subtitle.
 * Used after successful email sends, form submissions, etc.
 * Matches the Apple Face ID / bank transfer confirmation pattern.
 */
export const SuccessAnimation = ({
	title,
	subtitle,
	duration = 1500,
	onComplete,
}: SuccessAnimationProps) => {
	useEffect(() => {
		if (!onComplete) return;
		const timer = setTimeout(onComplete, duration);
		return () => clearTimeout(timer);
	}, [duration, onComplete]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.25 }}
			className="flex flex-col items-center justify-center py-10"
			role="status"
			aria-live="polite"
		>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{
					type: "spring",
					stiffness: 260,
					damping: 18,
					delay: 0.05,
				}}
				className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
			>
				<motion.div
					initial={{ scale: 0, rotate: -20 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 20,
						delay: 0.2,
					}}
				>
					<Check
						className="size-9 text-emerald-600 dark:text-emerald-400"
						strokeWidth={3}
						aria-hidden="true"
					/>
				</motion.div>
			</motion.div>
			<motion.p
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.25 }}
				className="mt-4 text-base font-semibold"
			>
				{title}
			</motion.p>
			{subtitle && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.25 }}
					className="mt-1 text-sm text-muted-foreground"
				>
					{subtitle}
				</motion.p>
			)}
		</motion.div>
	);
};
