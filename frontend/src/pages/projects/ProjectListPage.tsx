import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { observer } from "mobx-react-lite";
import { Breadcrumb } from "@/shared/components/Breadcrumb";
import { ProjectFilters, ProjectList } from "@/features/projects/components";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { NoResultsState } from "@/shared/components/NoResultsState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Button } from "@/shared/components/ui/button";
import {
	useAuthStore,
	useProjectSearchStore,
} from "@/app/stores/store-context";
import { Loader2, MapPin, Plus } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useSearchStoreInit } from "@/shared/hooks/useSearchStoreInit";
import { DownloadProjectsCSVButton } from "@/features/projects/components/DownloadProjectsCSVButton";

/**
 * ProjectListPage
 * Main page for browsing and searching projects
 */
const ProjectListPage = observer(() => {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const projectSearchStore = useProjectSearchStore();
	const [, setSearchParams] = useSearchParams();

	const breadcrumbItems = [{ title: "Projects" }];

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
		newFilters: Partial<typeof projectSearchStore.state.filters>,
	) => {
		projectSearchStore.setFilters(newFilters);
	};

	const handlePageChange = (newPage: number) => {
		projectSearchStore.setCurrentPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleClearFilters = () => {
		projectSearchStore.resetFilters();
	};

	const handleToggleSaveSearch = () => {
		projectSearchStore.toggleSaveSearch();
	};

	// Error state
	if (error) {
		return (
			<ErrorState
				message="Failed to load projects. Please try again."
				onRetry={refetch}
			/>
		);
	}

	// Empty state (no projects at all)
	const showEmptyState =
		!isLoading &&
		data?.projects.length === 0 &&
		!projectSearchStore.hasActiveFilters;

	// No results state (search/filter returned nothing)
	const showNoResults =
		!isLoading &&
		data?.projects.length === 0 &&
		projectSearchStore.hasActiveFilters;

	return (
		<div className="w-full">
			{/* Breadcrumb */}
			<Breadcrumb items={breadcrumbItems} />

			{/* Page header */}
			<div className="flex w-full mt-2 mb-6 flex-col gap-4 lg:flex-row">
				<div className="flex-1 w-full flex-col">
					<h1 className="text-2xl font-bold">
						Projects ({projectSearchStore.state.totalResults})
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-200">
						Ctrl + Click to open projects in another tab and keep
						filters.
					</p>
				</div>

				{/* Action buttons */}
				<div className="flex w-full lg:w-auto lg:flex-1 flex-col lg:flex-row justify-end items-stretch lg:items-center gap-2">
					<Button
						onClick={() => navigate("/projects/map")}
						className="w-full lg:w-auto lg:flex-initial bg-blue-600 hover:bg-blue-500 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
					>
						<MapPin className="mr-1 size-4" />
						Map
					</Button>
					{/* Project data - admin only */}
					{authStore.isSuperuser && <DownloadProjectsCSVButton />}
					<Button
						onClick={() => navigate("/projects/create")}
						className="w-full lg:w-auto lg:flex-initial bg-green-600 hover:bg-green-500 text-white dark:bg-green-600 dark:hover:bg-green-500"
					>
						<Plus className="mr-1 size-4" />
						New Project
					</Button>
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

			{/* Loading state */}
			{isLoading && (
				<div className="flex w-full min-h-[100px] pt-10 justify-center">
					<Loader2 className="size-8 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* Project list */}
			{!isLoading && (
				<ProjectList
					projects={data?.projects || []}
					isLoading={isLoading}
				/>
			)}

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
				/>
			)}
		</div>
	);
});

export default ProjectListPage;
