// A subcomponent only used in ModernLayout for setting the base padding for the ModernLayout

interface IPageWrapperProps {
	children: React.ReactNode;
}

const ModernPageWrapper = ({ children }: IPageWrapperProps) => {
	return (
		<div className="h-[calc(100vh-3rem)] overflow-auto">
			<div className="flex flex-1 flex-col h-full max-h-full">
				<div className="pb-4 h-full">{children}</div>
			</div>
			<span>ModernPageWrapper</span>
		</div>
	);
};

export default ModernPageWrapper;
