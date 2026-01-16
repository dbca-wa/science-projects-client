import { useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { UserSearchBar } from "@/features/users/components/UserSearchBar";
import { UserFilterPanel } from "@/features/users/components/UserFilterPanel";
import { UserGrid } from "@/features/users/components/UserGrid";
import { Pagination } from "@/features/users/components/Pagination";
import { UserDetailSheet } from "@/features/users/components/UserDetailSheet";
import { useUserSearch } from "@/features/users/hooks/useUserSearch";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useAuthStore, useUserSearchStore } from "@/app/stores/useStore";
import { Loader2 } from "lucide-react";

/**
 * UserListPage
 * Main page for browsing and searching users with detail sheet
 */
export const UserListPage = observer(() => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const userSearchStore = useUserSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  
  // Sheet state - controlled by URL
  const selectedUserId = params.id ? Number(params.id) : null;
  const isSheetOpen = !!selectedUserId;

  // Initialize from URL params on mount
  useEffect(() => {
    // First, let the store load from localStorage
    // Then check if saveSearch is disabled
    const storedState = localStorage.getItem("userSearchState");
    let shouldClearState = false;
    
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        if (parsed.saveSearch === false) {
          shouldClearState = true;
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    if (shouldClearState) {
      // User disabled persistence - clear store state and URL params
      userSearchStore.clearState();
      userSearchStore.state.saveSearch = false;
      setSearchParams(new URLSearchParams(), { replace: true });
      return;
    }

    // Otherwise, read from URL params (if any)
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const staff = searchParams.get("staff");
    const external = searchParams.get("external");
    const superuser = searchParams.get("superuser");
    const businessArea = searchParams.get("businessArea");

    if (search) userSearchStore.setSearchTerm(search);
    if (page) userSearchStore.setCurrentPage(Number(page));
    if (staff || external || superuser || businessArea) {
      userSearchStore.setFilters({
        onlyStaff: staff === "true",
        onlyExternal: external === "true",
        onlySuperuser: superuser === "true",
        businessArea: businessArea ? Number(businessArea) : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Failed to load users. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Empty state (no users at all)
  const showEmptyState = !isLoading && data?.users.length === 0 && !userSearchStore.hasActiveFilters;

  // No results state (search/filter returned nothing)
  const showNoResults = !isLoading && data?.users.length === 0 && userSearchStore.hasActiveFilters;

  return (
    <div className="w-full">
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
            <Button 
              onClick={() => navigate("/users/create")}
              className="ml-4 bg-green-600 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-400"
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Filter container */}
      <div className="grid grid-cols-1 items-center border border-gray-300 dark:border-gray-500 w-full select-none mb-0">
        <div className="col-span-full pb-4">
          <div className="p-4 border-b border-gray-300 dark:border-gray-500 w-full space-y-3">
            {/* Layout: UserFilterPanel on left, UserSearchBar on right */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left side: Business Area + Filters (stacked vertically) */}
              <div className="w-full md:w-auto md:min-w-[280px]">
                <UserFilterPanel 
                  filters={userSearchStore.state.filters} 
                  onFiltersChange={handleFiltersChange}
                />
              </div>
              
              {/* Right side: Search Input + Remember my search (stacked vertically) */}
              <div className="flex-1 flex flex-col gap-3">
                <UserSearchBar 
                  value={userSearchStore.state.searchTerm} 
                  onChange={handleSearchChange} 
                />
                
                {/* Remember my search */}
                <div className="flex">
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted/50 ml-auto">
                    <Checkbox
                      id="save-search"
                      checked={userSearchStore.state.saveSearch}
                      onCheckedChange={handleToggleSaveSearch}
                    />
                    <Label
                      htmlFor="save-search"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember my search
                    </Label>
                  </div>
                </div>
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
      {!isLoading && (
        <UserGrid users={data?.users || []} isLoading={isLoading} />
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No users found</p>
          <p className="text-sm text-muted-foreground">
            There are no users in the system yet.
          </p>
        </div>
      )}

      {/* No results state */}
      {showNoResults && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">
            No results for "{userSearchStore.state.searchTerm}"
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={() => userSearchStore.resetFilters()}
          >
            Clear search and filters
          </Button>
        </div>
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
  );
});
