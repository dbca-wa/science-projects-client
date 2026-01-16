interface IPageWrapperProps {
	children: React.ReactNode;
}

/**
 * ModernPageWrapper - Wrapper for page content in modern layout
 * - Provides padding for content (responsive)
 * - Ensures proper layout with sidebar offset
 * - Maintains scrollable container
 */
const ModernPageWrapper = ({ children }: IPageWrapperProps) => {
	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto">
			<div className="px-4 sm:px-6 md:px-9 py-4 lg:pl-64">{children}</div>
		</div>
	);
};

export default ModernPageWrapper;
