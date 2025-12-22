// Handles displaying the tabs for the modern dashboard

import { useEffect, useState } from "react";
import { useUser } from "@/features/users/hooks/useUser";
import { Quote } from "@/shared/components/Quote";
import { MyTasksSection } from "./MyTasksSection";
import { useGetDocumentsPendingMyAction } from "@/features/documents/hooks/useGetDocumentsPendingMyAction";
import { useGetEndorsementsPendingMyAction } from "@/features/documents/hooks/useGetEndorsementsPendingMyAction";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetMyProjects } from "@/features/projects/hooks/useGetMyProjects";
import type { IDashProps } from "@/shared/types";
import { Admin } from "./Admin";
import { MyProjectsSection } from "./MyProjectsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTheme } from "next-themes";
import { cn } from "@/shared/utils";

export const ModernDashboard = ({ activeTab }: IDashProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activeTabFromQueryParam = parseInt(
    queryParams.get("activeTab") || `${activeTab || 0}`,
    10,
  );

  const [activeTabPanel, setActiveTabPanel] = useState<number>(
    activeTabFromQueryParam,
  );

  useEffect(() => {
    // Set the activeTabPanel state based on the location state
    if (location.state && typeof location.state.activeTab === "number") {
      setActiveTabPanel(location.state.activeTab);
    }
  }, [location.state]);

  const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } =
    useGetDocumentsPendingMyAction();
  const { pendingEndorsementsData, pendingEndorsementsDataLoading } =
    useGetEndorsementsPendingMyAction();

  const { projectData, projectsLoading } = useGetMyProjects();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { userData } = useUser();

  const tabValue = activeTabPanel === 0 ? "dash" : activeTabPanel === 1 ? "projects" : "admin";

  const handleTabChange = (value: string) => {
    const tabIndex = value === "dash" ? 0 : value === "projects" ? 1 : 2;
    setActiveTabPanel(tabIndex);
    
    if (value === "admin") {
      navigate("/crud", { replace: true, state: { activeTab: tabIndex } });
    } else {
      navigate("/", { replace: true, state: { activeTab: tabIndex } });
    }
  };

  return (
    <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-transparent">
        <TabsTrigger 
          value="dash" 
          className={cn(
            "text-lg font-semibold data-[state=active]:font-bold data-[state=active]:bg-transparent",
            isDark ? "text-gray-500 data-[state=active]:text-gray-300" : "text-gray-400 data-[state=active]:text-gray-600"
          )}
        >
          <div className="flex items-center gap-2">
            Dash
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-sm text-white",
              isDark ? "bg-blue-600" : "bg-blue-500"
            )}>
              {(pendingEndorsementsDataLoading === false
                ? pendingEndorsementsData.aec.length
                : 0) +
                (pendingProjectDocumentDataLoading === false
                  ? pendingProjectDocumentData.all.length
                  : 0)}
            </div>
          </div>
        </TabsTrigger>

        <TabsTrigger 
          value="projects"
          className={cn(
            "text-lg font-semibold data-[state=active]:font-bold data-[state=active]:bg-transparent",
            isDark ? "text-gray-500 data-[state=active]:text-gray-300" : "text-gray-400 data-[state=active]:text-gray-600"
          )}
        >
          <div className="flex items-center gap-2">
            My Projects
            {projectData && (
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-sm text-white",
                isDark ? "bg-blue-600" : "bg-blue-500"
              )}>
                {projectData.length}
              </div>
            )}
          </div>
        </TabsTrigger>

        {userData.is_superuser && (
          <TabsTrigger 
            value="admin"
            className={cn(
              "text-lg font-semibold data-[state=active]:font-bold data-[state=active]:bg-transparent",
              isDark ? "text-gray-500 data-[state=active]:text-gray-300" : "text-gray-400 data-[state=active]:text-gray-600"
            )}
          >
            Admin Panel
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="dash" className="mt-4">
        <div className="mb-2">
          <Quote />
        </div>

        <div className="mt-1">
          {pendingEndorsementsDataLoading === false &&
          pendingProjectDocumentDataLoading === false ? (
            <MyTasksSection
              endorsementTaskData={pendingEndorsementsData}
              endorsementTaskDataLoading={pendingEndorsementsDataLoading}
              documentTaskData={pendingProjectDocumentData}
              documentTaskDataLoading={pendingProjectDocumentDataLoading}
            />
          ) : (
            <div className="flex w-full h-full">
              <div className="flex items-center justify-center w-full h-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="projects" className="mt-4">
        <MyProjectsSection data={projectData} loading={projectsLoading} />
      </TabsContent>

      {userData.is_superuser && (
        <TabsContent value="admin" className="mt-4">
          <Admin />
        </TabsContent>
      )}
    </Tabs>
  );
};
