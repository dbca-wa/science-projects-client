import { useState, useMemo, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import { UserDisplay } from "@/shared/components/UserDisplay";
import { useUserSearch } from "../../hooks/useUserSearch";
import { debounce } from "@/shared/utils/common.utils";
import type { CaretakerUserSearchProps } from "../../types/caretaker.types";
import type { IUserData } from "@/shared/types/user.types";

/**
 * CaretakerUserSearch component
 * User search dropdown with exclusion logic for caretaker selection
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Only shows internal users (is_staff = true)
 * - Excludes users in excludeUserIds array
 * - Limits to 10 results
 * - Shows user avatar, name, email in results
 * - Selection locks input and shows selected user with clear button
 * 
 * @param onSelect - Callback when user is selected
 * @param excludeUserIds - Array of user IDs to exclude from search
 */
export const CaretakerUserSearch = ({ onSelect, excludeUserIds }: CaretakerUserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Debounce the search term (300ms as specified)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const debouncedSetSearch = useMemo(
    () => debounce((term: string) => setDebouncedSearchTerm(term), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // Search users with filters
  const { data: searchResults, isLoading } = useUserSearch({
    searchTerm: debouncedSearchTerm,
    filters: {
      onlyStaff: true, // Only internal users
      ignoreArray: excludeUserIds, // Pass ignore array to backend
    },
    page: 1,
  });

  // Limit to 10 results (backend filtering already excludes users)
  const filteredUsers = useMemo(() => {
    if (!searchResults?.users) return [];
    
    return searchResults.users.slice(0, 10);
  }, [searchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  const handleUserSelect = (user: IUserData) => {
    setSelectedUser(user);
    setSearchTerm("");
    setShowResults(false);
    onSelect(user.pk);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchTerm("");
    setShowResults(false);
    onSelect(0); // Clear selection with 0 instead of undefined
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0 && !selectedUser) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  // If user is selected, show selected user display instead of input
  if (selectedUser) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <UserDisplay 
            user={selectedUser} 
            showEmail={true} 
            size="sm" 
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0"
            onClick={handleClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a caretaker..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground bg-white dark:bg-gray-800">
              Searching...
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="py-1 bg-white dark:bg-gray-800">
              {filteredUsers.map((user) => (
                <button
                  key={user.pk}
                  type="button"
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none bg-white dark:bg-gray-800"
                  onClick={() => handleUserSelect(user)}
                >
                  <UserDisplay 
                    user={user} 
                    showEmail={true} 
                    size="sm" 
                  />
                </button>
              ))}
            </div>
          ) : debouncedSearchTerm.length > 0 ? (
            <div className="p-3 text-sm text-muted-foreground bg-white dark:bg-gray-800">
              No users found matching your search.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};