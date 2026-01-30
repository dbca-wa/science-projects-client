import { useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { 
  UserSearchBar,
  UserFilterPanel,
  UserGrid,
  Pagination,
  UserDetailSheet,
  useUserSearch
} from "@/features/users";
import { EmptyState } from "@/shared/components/EmptyState";
import { NoResultsState } from "@/shared/components/NoResultsState";
import { ErrorState } from "@/shared/components/ErrorState";
import { NavigationButton } from "@/shared/components/navigation/NavigationButton";
import { SearchControls } from "@/shared/components/SearchControls";
import { useAuthStore, useUserSearchStore } from "@/app/stores/store-context";
import { Loader2 } from "lucide-react";
import { useSearchStoreInit } from "@/shared/hooks/useSearchStoreInit";
import { PageTransition } from "@/shared/components/PageTransition";

/**
 * UserListPage
 * Main page for browsing and searching users with detail sheet
 */
const UserListPage = observer(() => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const userSearchStore = useUserSearchStore();
  const [, setSearchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  
  // Sheet state - controlled by URL
  const selectedUserId = params.id ? Number(params.id) : null;
  const isSheetOpen = !!selectedUserId;

	// Initialize from URL params and localStorage
	// TypeScript infers TFilters = UserSearchFilters from userSearchStore
	useSearchStoreInit({
		store: userSearchStore,
		storageKey: "userSearchState",
		urlParamMapping: {
			staff: (v) => v === "true",
			external: (v) => v === "true",
			superuser: (v) => v === "true",
			baLead: (v) => v === "true",
			businessArea: (v) => Number(v),
		},
	});

  // Fetch users with search and filters from store
  const { data, isLoading, error, refetch } = useUserSearch({
    searchTerm: userSearchStore.state.searchTerm,
    filters: userSearchStore.state.filters,
    page: userSearchStore.state.currentPage,
  });

  // Update total results in store
  useEffect(() => {
    if (data?.total_results !== undefined) {
      userSearchStore.setTotalResults(data.total_results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.total_results]);

  // Sync store state to URL params
  useEffect(() => {
    setSearchParams(userSearchStore.searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userSearchStore.state.searchTerm,
    userSearchStore.state.currentPage,
    userSearchStore.state.filters,
    setSearchParams,
  ]);

  const handleCloseSheet = () => {
    navigate("/users");
  };

  const handleSearchChange = (value: string) => {
    userSearchStore.setSearchTerm(value);
  };

  const handleFiltersChange = (newFilters: typeof userSearchStore.state.filters) => {
    userSearchStore.setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    userSearchStore.setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSaveSearch = () => {
    userSearchStore.toggleSaveSearch();
  };

  const handleClearFilters = () => {
    userSearchStore.clearSearchAndFilters();
  };

  // Error state
  if (error) {
    return <ErrorState message="Failed to load users. Please try again." onRetry={refetch} />;
  }

  // Empty state (no users at all)
  const showEmptyState = data?.users.length === 0 && !userSearchStore.hasActiveFilters;

  // No results state (search/filter returned nothing)
  const showNoResults = data?.users.length === 0 && userSearchStore.hasActiveFilters;

  return (
    <PageTransition isLoading={isLoading}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
            <div className="text-lg font-medium text-muted-foreground">Loading users...</div>
          </div>
        </div>
      ) : (
      <div className="w-full">
      {/* Breadcrumb */}
      <AutoBreadcrumb />

      {/* Page header */}
      <div className="flex w-full mt-2 mb-6 flex-row">
        <div className="flex-1 w-full flex-col">
          <h1 className="text-2xl font-bold">
            Users ({userSearchStore.state.totalResults})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            Search a user above. You can also use the filters below.
          </p>
        </div>
        
        {/* Create button - admin only */}
        <div className="flex flex-1 w-full justify-end items-center">
          {authStore.isSuperuser && (
            <NavigationButton 
              targetPath="/users/create"
              className="ml-4 bg-green-600 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-400"
            >
              Add User
            </NavigationButton>
          )}
        </div>
      </div>

      {/* Filter container */}
      <div className="grid grid-cols-1 items-center border border-gray-300 dark:border-gray-500 w-full select-none mb-0">
        <div className="col-span-full pb-4">
          <div className="p-4 border-b border-gray-300 dark:border-gray-500 w-full space-y-3">
            {/* Layout: UserFilterPanel on left, UserSearchBar on right */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input - shows first on mobile */}
              <div className="flex-1 order-1 md:order-2">
                <UserSearchBar 
                  value={userSearchStore.state.searchTerm} 
                  onChange={handleSearchChange} 
                />
                
                {/* Remember my search and Clear - hidden on mobile, shown on desktop below search */}
                <div className="hidden md:flex mt-3 gap-2 justify-end">
                  <SearchControls
                    saveSearch={userSearchStore.state.saveSearch}
                    onToggleSaveSearch={handleToggleSaveSearch}
                    filterCount={userSearchStore.filterCount}
                    onClearFilters={handleClearFilters}
                    className="flex gap-2"
                  />
                </div>
              </div>
              
              {/* Business Area + Filters - shows second on mobile, expands naturally */}
              <div className="w-full md:w-auto md:flex-1 order-2 md:order-1">
                <UserFilterPanel 
                  filters={userSearchStore.state.filters} 
                  onFiltersChange={handleFiltersChange}
                />
              </div>
              
              {/* Remember my search and Clear - shown on mobile at bottom, hidden on desktop */}
              <div className="flex md:hidden order-3 gap-2 justify-end">
                <SearchControls
                  saveSearch={userSearchStore.state.saveSearch}
                  onToggleSaveSearch={handleToggleSaveSearch}
                  filterCount={userSearchStore.filterCount}
                  onClearFilters={handleClearFilters}
                  className="flex gap-2 ml-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] xl:grid-cols-[4fr_4fr_2.5fr] pt-0 pb-4 pl-6">
          <div className="w-full overflow-hidden text-ellipsis">
            <span className="font-bold">User</span>
          </div>
          <div className="hidden lg:block w-full overflow-hidden text-ellipsis">
            <span className="font-bold">Email</span>
          </div>
          <div className="hidden xl:block w-full overflow-hidden text-ellipsis">
            <span className="font-bold">Business Area</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex w-full min-h-[100px] pt-10 justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* User grid */}
      <UserGrid users={data?.users || []} isLoading={false} />

      {/* Empty state */}
      {showEmptyState && (
        <EmptyState
          title="No users found"
          description="There are no users in the system yet."
        />
      )}

      {/* No results state */}
      {showNoResults && (
        <NoResultsState
          searchTerm={userSearchStore.state.searchTerm}
          onClear={handleClearFilters}
        />
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <Pagination
          currentPage={userSearchStore.state.currentPage}
          totalPages={data.total_pages}
          onPageChange={handlePageChange}
        />
      )}

      {/* User Detail Sheet */}
      <UserDetailSheet
        userId={selectedUserId}
        open={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
      )}
    </PageTransition>
  );
});

export default UserListPage;
