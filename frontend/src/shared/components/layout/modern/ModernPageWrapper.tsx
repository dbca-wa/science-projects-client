// A subcomponent only used in ModernLayout for setting the base padding for the ModernLayout

interface IPageWrapperProps {
	children: React.ReactNode;
}

/**
 * ModernPageWrapper - Wrapper for page content in modern layout
 * - Ensures proper layout for Dashboard and other pages
 * - Maintains existing styling with proper padding
 */
const ModernPageWrapper = ({ children }: IPageWrapperProps) => {
	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto">
			<div className="flex flex-1 flex-col h-full max-h-full">
				<div className="p-6 lg:pl-64 h-full">{children}</div>
			</div>
		</div>
	);
};

export default ModernPageWrapper;
