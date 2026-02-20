import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { observer } from "mobx-react-lite";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { ProjectFilters, ProjectList } from "@/features/projects/components";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { NoResultsState } from "@/shared/components/NoResultsState";
import { ErrorState } from "@/shared/components/ErrorState";
import { NavigationButton } from "@/shared/components/navigation/NavigationButton";
import {
	useAuthStore,
	useProjectSearchStore,
} from "@/app/stores/store-context";
import { MapPin, Plus } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSearchStoreInit } from "@/shared/hooks/useSearchStoreInit";
import { DownloadProjectsCSVButton } from "@/features/projects/components/DownloadProjectsCSVButton";
import { PageTransition } from "@/shared/components/PageTransition";

/**
 * ProjectListPage
 * Main page for browsing and searching projects
 */
const ProjectListPage = observer(() => {
	const authStore = useAuthStore();
	const projectSearchStore = useProjectSearchStore();
	const [, setSearchParams] = useSearchParams();

	// Initialize from URL params and localStorage
	// TypeScript infers TFilters = ProjectSearchFilters from projectSearchStore
	useSearchStoreInit({
		store: projectSearchStore,
		storageKey: "projectSearchState",
		urlParamMapping: {
			businessArea: (v) => v,
			projectKind: (v) => v,
			projectStatus: (v) => v,
			year: (v) => Number(v),
			user: (v) => Number(v),
			onlyActive: (v) => v === "true",
			onlyInactive: (v) => v === "true",
		},
	});

	// Fetch projects with search and filters from store
	const { data, isLoading, error, refetch } = useProjects({
		page: projectSearchStore.state.currentPage,
		searchTerm: projectSearchStore.state.searchTerm,
		businessarea: projectSearchStore.state.filters.businessArea,
		projectkind: projectSearchStore.state.filters.projectKind,
		projectstatus: projectSearchStore.state.filters.projectStatus,
		year: projectSearchStore.state.filters.year,
		selected_user: projectSearchStore.state.filters.user || undefined,
		only_active: projectSearchStore.state.filters.onlyActive,
		only_inactive: projectSearchStore.state.filters.onlyInactive,
	});

	// Delay error display to avoid flash on initial load
	const [shouldShowError, setShouldShowError] = useState(false);

	useEffect(() => {
		if (error && !isLoading) {
			// Only show error if it persists for 300ms
			const timer = setTimeout(() => {
				setShouldShowError(true);
			}, 300);
			return () => clearTimeout(timer);
		} else {
			setShouldShowError(false);
		}
	}, [error, isLoading]);

	// Update pagination in store when data changes
	useEffect(() => {
		if (data) {
			projectSearchStore.setPagination({
				totalPages: data.total_pages,
				totalResults: data.total_results,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	// Sync store state to URL params
	useEffect(() => {
		setSearchParams(projectSearchStore.searchParams, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		projectSearchStore.state.searchTerm,
		projectSearchStore.state.currentPage,
		projectSearchStore.state.filters,
		setSearchParams,
	]);

	const handleSearchChange = (value: string) => {
		projectSearchStore.setSearchTerm(value);
	};

	const handleFiltersChange = (
		newFilters: Partial<typeof projectSearchStore.state.filters>
	) => {
		projectSearchStore.setFilters(newFilters);
	};

	const handlePageChange = (newPage: number) => {
		projectSearchStore.setCurrentPage(newPage);
	};

	const handleClearFilters = () => {
		projectSearchStore.resetFilters();
	};

	const handleToggleSaveSearch = () => {
		projectSearchStore.toggleSaveSearch();
	};

	// Error state - only show if error persists
	if (shouldShowError) {
		return (
			<ErrorState
				message="Failed to load projects. Please try again."
				onRetry={refetch}
			/>
		);
	}

	// Empty state (no projects at all)
	const showEmptyState =
		data?.projects.length === 0 && !projectSearchStore.hasActiveFilters;

	// No results state (search/filter returned nothing)
	const showNoResults =
		data?.projects.length === 0 && projectSearchStore.hasActiveFilters;

	return (
		<PageTransition isLoading={isLoading}>
			<div className="w-full">
				{/* Breadcrumb */}
				<AutoBreadcrumb />

				{/* Page header */}
				<div className="flex w-full mt-2 mb-6 flex-col gap-4 lg:flex-row">
					<div className="flex-1 w-full flex-col">
						<h1 className="text-2xl font-bold">
							Projects ({projectSearchStore.state.totalResults})
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-200">
							Ctrl + Click to open projects in another tab and keep filters.
						</p>
					</div>

					{/* Action buttons */}
					<div className="flex w-full lg:w-auto lg:flex-1 flex-col lg:flex-row justify-end items-stretch lg:items-center gap-2">
						<NavigationButton
							targetPath="/projects/map"
							className="w-full lg:w-auto lg:flex-initial bg-blue-600 hover:bg-blue-500 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
						>
							<MapPin className="mr-1 size-4" />
							Map
						</NavigationButton>
						{/* Project data - admin only */}
						{authStore.isSuperuser && <DownloadProjectsCSVButton />}
						<NavigationButton
							targetPath="/projects/create"
							className="w-full lg:w-auto lg:flex-initial bg-green-600 hover:bg-green-500 text-white dark:bg-green-600 dark:hover:bg-green-500"
						>
							<Plus className="mr-1 size-4" />
							New Project
						</NavigationButton>
					</div>
				</div>

				{/* Filters */}
				<ProjectFilters
					searchTerm={projectSearchStore.state.searchTerm}
					filters={projectSearchStore.state.filters}
					filterCount={projectSearchStore.filterCount}
					saveSearch={projectSearchStore.state.saveSearch}
					onSearchChange={handleSearchChange}
					onFiltersChange={handleFiltersChange}
					onClearFilters={handleClearFilters}
					onToggleSaveSearch={handleToggleSaveSearch}
				/>

				{/* Project list */}
				<ProjectList projects={data?.projects || []} isLoading={false} />

				{/* Empty state */}
				{showEmptyState && (
					<EmptyState
						title="No projects found"
						description="There are no projects in the system yet."
					/>
				)}

				{/* No results state */}
				{showNoResults && (
					<NoResultsState
						searchTerm={projectSearchStore.state.searchTerm}
						onClear={handleClearFilters}
					/>
				)}

				{/* Pagination */}
				{data && data.total_pages > 1 && (
					<Pagination
						currentPage={projectSearchStore.state.currentPage}
						totalPages={data.total_pages}
						onPageChange={handlePageChange}
						startIndex={(projectSearchStore.state.currentPage - 1) * 20}
						endIndex={Math.min(
							projectSearchStore.state.currentPage * 20,
							data.total_results
						)}
						totalItems={data.total_results}
						itemLabel="projects"
					/>
				)}
			</div>
		</PageTransition>
	);
});

export default ProjectListPage;
