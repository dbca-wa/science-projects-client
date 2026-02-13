interface EmptyStateProps {
	title: string;
	description?: string;
	icon?: React.ReactNode;
}

/**
 * EmptyState component
 * Displays when a list has no items at all (not filtered, just empty)
 */
export const EmptyState = ({ title, description, icon }: EmptyStateProps) => {
	return (
		<div className="text-center py-12">
			{icon && <div className="flex justify-center mb-4">{icon}</div>}
			<p className="text-muted-foreground mb-2">{title}</p>
			{description && (
				<p className="text-sm text-muted-foreground">{description}</p>
			)}
		</div>
	);
};
