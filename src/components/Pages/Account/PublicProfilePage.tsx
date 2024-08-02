// Handles Profile Page view

import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import EditableStaffOverview from "./Public Profile/EditableStaffOverview";
import EditableStaffProjects from "./Public Profile/EditableStaffProjects";
import EditableStaffCV from "./Public Profile/EditableStaffCV";
import EditableStaffPublications from "./Public Profile/EditableStaffPublications";

const StaffHeroEditable = () => {
  return (
    <div className="flex flex-col">
      {/* Name, Title and Tag */}
      <div className="flex w-full flex-col justify-center p-4 text-center">
        <p className="text-2xl font-bold">
          {/* {fullName} */}
          Jarid Prince
        </p>
        <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
          Web Developer, Kensington
          {/* {positionTitle}
        
        {branchName && `, ${branchName}`} */}
        </p>
        <p className="mt-4 text-balance text-muted-foreground">
          {/* {tags?.map((word: string) => word).join(" | ")} */}
          React | Django | Docker | Kubernetes | ETL
        </p>
      </div>
    </div>
  );
};

export const PublicProfilePage = () => {
  return (
    <Flex h={"100%"} minH={"88vh"} flexDir={"column"}>
      <StaffHeroEditable />
      <Tabs isLazy isFitted variant={"enclosed"}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Projects</Tab>
          <Tab>CV</Tab>
          <Tab>Publications</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <EditableStaffOverview />
          </TabPanel>
          <TabPanel>
            <EditableStaffProjects />
          </TabPanel>
          <TabPanel>
            <EditableStaffCV />
          </TabPanel>
          <TabPanel>
            <EditableStaffPublications />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
