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
		<div className="h-[calc(100vh-4rem)] overflow-auto no-scrollbar">
			<div className="px-4 sm:px-6 md:px-[10%] lg:px-[15%] py-6 lg:ml-64">
				{children}
			</div>
		</div>
	);
};

export default ModernPageWrapper;
