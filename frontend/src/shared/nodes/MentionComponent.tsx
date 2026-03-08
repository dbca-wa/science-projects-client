/**
 * MentionComponent - React component for rendering mentions
 *
 * Clickable mention that opens UserDetailSheet when clicked.
 */
interface MentionComponentProps {
	userId: number;
	displayName: string;
	email: string;
}

export function MentionComponent({
	userId,
	displayName,
	email,
}: MentionComponentProps) {
	const handleClick = () => {
		// Dispatch custom event to open UserDetailSheet
		const event = new CustomEvent("openUserDetail", {
			detail: { userId },
		});
		window.dispatchEvent(event);
	};

	return (
		<span
			className="text-blue-600 hover:underline cursor-pointer font-medium"
			data-lexical-mention="true"
			data-user-id={userId}
			data-display-name={displayName}
			data-email={email}
			onClick={handleClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			@{displayName}
		</span>
	);
}
