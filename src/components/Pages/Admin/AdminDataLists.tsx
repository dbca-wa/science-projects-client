import { Head } from "@/components/Base/Head";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { AllProblematicProjects } from "./Data/AllProblematicProjects";
import { EmailLists } from "./Data/EmailLists";
import { StaffUsers } from "./Data/StaffUsers";

export const AdminDataLists = () => {
  return (
    <>
      <Head title="Data" />
      <Tabs isFitted variant={"enclosed"}>
        <TabList>
          <Tab>Problematic Projects</Tab>
          <Tab>Email List</Tab>
          <Tab>Staff Users</Tab>
        </TabList>

        <TabPanels>
          {/* Problematic Projects */}
          <TabPanel>
            <AllProblematicProjects />
          </TabPanel>

          {/* Emails */}
          <TabPanel>
            <EmailLists />
          </TabPanel>

          {/* Staff */}
          <TabPanel>
            <StaffUsers />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
