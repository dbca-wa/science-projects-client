import { Breadcrumb } from "@/shared/components/Breadcrumb";

/**
 * ProjectMapPage
 * Map view of projects with location markers
 * TODO: Implement map functionality
 */
const ProjectMapPage = () => {
	const breadcrumbItems = [
		{ title: "Projects", link: "/projects" },
		{ title: "Map" },
	];

	return (
		<div className="w-full">
			{/* Breadcrumb */}
			<Breadcrumb items={breadcrumbItems} />

			{/* Page header */}
			<div className="flex w-full mt-2 mb-6 flex-row">
				<div className="flex-1 w-full flex-col">
					<h1 className="text-2xl font-bold">Project Map</h1>
					<p className="text-sm text-gray-600 dark:text-gray-200">
						View projects on a map by location
					</p>
				</div>
			</div>

			{/* Placeholder */}
			<div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
				<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
					Project Map
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Map view will be implemented in a future update.
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
					This will show all projects with location markers on an interactive map.
				</p>
			</div>
		</div>
	);
};

export default ProjectMapPage;
