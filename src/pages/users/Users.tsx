// Route for displaying users.

import { BreadCrumb } from "@/shared/components/layout/base/BreadCrumb";
import { Head } from "@/shared/components/layout/base/Head";
import { CreateUserModal } from "@/features/users/components/modals/CreateUserModal";
import { SearchUsers } from "@/features/users/components/SearchUsers";
import { PaginatorUser } from "@/features/users/components/PaginatorUser";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";
import { type IUserData } from "@/shared/types";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useTheme } from "next-themes";
import { cn } from "@/shared/utils";

export const Users = observer(() => {
  const {
    filteredItems,
    loading,
    totalPages,
    currentUserResultsPage,
    setCurrentUserResultsPage,
    onlyExternal,
    onlySuperuser,
    businessArea,
    onlyStaff,
    setSearchFilters,
    totalResults,
    setIsOnUserPage,
  } = useUserSearchContext();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [filtered, setFiltered] = useState<IUserData[]>([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Set page status for user search store
  useEffect(() => {
    setIsOnUserPage(true);
    return () => {
      setIsOnUserPage(false);
    };
  }, [setIsOnUserPage]);

  useEffect(() => {
    if (!isInitialRender && !loading) {
      const filteredData = filteredItems.filter((user: IUserData) => {
        let match = true;

        if (onlyStaff && !user.is_staff) {
          match = false;
        }
        if (onlySuperuser && !user.is_superuser) {
          match = false;
        }

        if (onlyExternal && user.is_staff) {
          match = false;
        }
        return match;
      });

      setFiltered([...filteredData]); // Update to spread the filteredData array
    }
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [
    filteredItems,
    onlyExternal,
    onlySuperuser,
    onlyStaff,
    loading,
    isInitialRender,
  ]);

  const handleOnlyExternalChange = () => {
    if (!onlyExternal) {
      setSearchFilters({
        onlyExternal: true,
        onlySuperuser: false,
        onlyStaff: false,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser,
        onlyStaff,
        businessArea: businessArea,
      });
    }
  };

  const handleOnlyStaffChange = () => {
    if (!onlyStaff) {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser: false,
        onlyStaff: true,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal,
        onlySuperuser,
        onlyStaff: false,
        businessArea: businessArea,
      });
    }
  };

  const handleOnlySuperChange = () => {
    if (!onlySuperuser) {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser: true,
        onlyStaff: false,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal,
        onlySuperuser: false,
        onlyStaff,
        businessArea: businessArea,
      });
    }
  };

  // Custom breakpoint logic using window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXlOrLarger = windowWidth >= 1280; // xl breakpoint
  const isLargerOrLarger = windowWidth >= 1024; // lg breakpoint  
  const isOver690 = windowWidth >= 690; // custom breakpoint

  const { layout } = useLayoutSwitcher();

  return (
    <>
      {layout === "traditional" && (
        <BreadCrumb
          subDirOne={{
            title: "Manage Users",
            link: "/users",
          }}
        />
      )}
      <Head title="Users" />
      <div className="flex w-full mt-2 mb-6 flex-row">
        <div className="flex-1 w-full flex-col">
          <h1 className="text-2xl font-bold">
            Users ({totalResults})
          </h1>
          <p className={cn(
            "text-sm",
            isDark ? "text-gray-200" : "text-gray-600"
          )}>
            Search a user above. You can also use the filters below.
          </p>
        </div>

        <div className="flex flex-1 w-full justify-end items-center">
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            className={cn(
              "ml-4 text-white",
              isDark 
                ? "bg-green-600 hover:bg-green-400" 
                : "bg-green-500 hover:bg-green-600"
            )}
          >
            Add User
          </Button>
        </div>
      </div>
      <>
        <CreateUserModal
          isOpen={isCreateUserModalOpen}
          onClose={() => setIsCreateUserModalOpen(false)}
        />
        <div className="grid grid-cols-1 items-center border w-full select-none">
          <div className="col-span-full pb-4">
            <div className="grid p-4 border-0 border-b items-center w-full grid-cols-2 gap-4">
              <div className="flex flex-1 w-full">
                <div className="w-full flex-1 flex flex-col sm:flex-row gap-1 sm:gap-5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="only-external"
                      checked={onlyExternal}
                      onCheckedChange={handleOnlyExternalChange}
                      disabled={onlyStaff || onlySuperuser}
                    />
                    <label htmlFor="only-external" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Only External
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="only-staff"
                      checked={onlyStaff}
                      onCheckedChange={handleOnlyStaffChange}
                      disabled={onlyExternal || onlySuperuser}
                    />
                    <label htmlFor="only-staff" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Only Staff
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="only-admin"
                      checked={onlySuperuser}
                      onCheckedChange={handleOnlySuperChange}
                      disabled={onlyExternal || onlyStaff}
                    />
                    <label htmlFor="only-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Only Admin
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <SearchUsers />
              </div>
            </div>
          </div>

          <div className={cn(
            "grid pt-0 pb-4 pl-6",
            isXlOrLarger ? "grid-cols-[4fr_4fr_2.5fr]" : 
            isLargerOrLarger ? "grid-cols-[8fr_4fr]" : 
            "grid-cols-1"
          )}>
            <div className="w-full overflow-hidden text-ellipsis">
              <span className="font-bold">User</span>
            </div>
            {isXlOrLarger ? (
              <>
                <div className="w-full overflow-hidden text-ellipsis">
                  <span className="font-bold">Email</span>
                </div>
                <div className="w-full overflow-hidden text-ellipsis">
                  <span className="font-bold">Business Area</span>
                </div>
              </>
            ) : isLargerOrLarger ? (
              <div className="w-full overflow-hidden text-ellipsis">
                <span className="font-bold">Email</span>
              </div>
            ) : !isOver690 ? (
              <div className="w-full overflow-hidden text-ellipsis">
                <span className="font-bold">Email</span>
              </div>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="flex w-full min-h-[100px] pt-10 justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : (
          <PaginatorUser
            loading={loading}
            data={filtered}
            currentUserResultsPage={currentUserResultsPage}
            setCurrentUserResultsPage={setCurrentUserResultsPage}
            totalPages={totalPages}
          />
        )}
      </>
    </>
  );
});
