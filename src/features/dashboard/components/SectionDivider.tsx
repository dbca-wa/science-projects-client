import type { SectionDividerProps } from "../types/admin-tasks.types";

export const SectionDivider = ({ title }: SectionDividerProps) => {
	return (
		<div className="relative py-10">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-300 dark:border-gray-600" />
			</div>
			<div className="relative flex justify-center">
				<span className="bg-white dark:bg-gray-800 px-4 text-md font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</span>
			</div>
		</div>
	);
};
