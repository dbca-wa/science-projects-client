import { Head } from "@/shared/components/Base/Head";
import { AllProblematicProjects } from "@/shared/components/Pages/Admin/Data/AllProblematicProjects";
import { EmailLists } from "@/shared/components/Pages/Admin/Data/EmailLists";
import StaffProfileEmails from "@/shared/components/Pages/Admin/Data/StaffProfileEmails";
import { StaffUsers } from "@/shared/components/Pages/Admin/Data/StaffUsers";
import UnapprovedProjectsThisFY from "@/shared/components/Pages/Admin/Data/UnapprovedProjectsThisFY";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useState } from "react";

export const AdminDataLists = () => {
  const [loadedTabs, setLoadedTabs] = useState<Set<number>>(new Set([0])); // Start with first tab loaded
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    // Mark this tab as loaded
    setLoadedTabs((prev) => new Set(prev).add(index));
  };

  return (
    <>
      <Head title="Data" />
      <Tabs
        isFitted
        variant={"enclosed"}
        index={activeTab}
        onChange={handleTabChange}
      >
        <TabList>
          <Tab>Unapproved Docs</Tab>
          <Tab>Problematic Projects</Tab>
          <Tab>Email List</Tab>
          <Tab>Staff Profile List</Tab>
          <Tab>Staff Users</Tab>
        </TabList>

        <TabPanels>
          {/* Unapproved projects this FY */}
          <TabPanel>
            {loadedTabs.has(0) && <UnapprovedProjectsThisFY />}
          </TabPanel>

          {/* Problematic Projects */}
          <TabPanel>{loadedTabs.has(1) && <AllProblematicProjects />}</TabPanel>

          {/* Emails */}
          <TabPanel>{loadedTabs.has(2) && <EmailLists />}</TabPanel>

          {/* Active Staff Profile Emails */}
          <TabPanel>{loadedTabs.has(3) && <StaffProfileEmails />}</TabPanel>

          {/* Staff */}
          <TabPanel>{loadedTabs.has(4) && <StaffUsers />}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
