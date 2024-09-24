// Handles Profile Page view

import { RichTextEditor } from "@/components/RichTextEditor/Editors/RichTextEditor";
import { useStaffProfile } from "@/lib/hooks/tanstack/useStaffProfile";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Text,
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import EditableStaffCV from "./Public Profile/EditableStaffCV";
import EditableStaffProjects from "./Public Profile/EditableStaffProjects";
import EditableStaffPublications from "./Public Profile/EditableStaffPublications";
import { useEffect } from "react";
import Subsection from "@/components/StaffProfiles/Staff/Detail/Subsection";
import { useITAssetsUser } from "@/lib/hooks/tanstack/useITAssetsUser";

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
  const { userData, userLoading } = useUser();
  const { staffProfileData, staffProfileLoading } = useStaffProfile(
    userData?.pk,
  );
  const { colorMode } = useColorMode();
  useEffect(() => console.log(staffProfileData));

  const { userITData, userITLoading } = useITAssetsUser(userData?.pk);
  useEffect(() => {
    console.log(userITData);
  }, [userITData, userITLoading]);

  return (
    <Flex h={"100%"} minH={"88vh"} flexDir={"column"}>
      {staffProfileData ? (
        <>
          <StaffHeroEditable />
          <Tabs isLazy isFitted variant={"enclosed"}>
            <TabList>
              <Tab>Overview</Tab>
              {/* <Tab>Projects</Tab>
          <Tab>CV</Tab>
          <Tab>Publications</Tab> */}
            </TabList>
            <TabPanels>
              <TabPanel>
                <Subsection title="About">
                  {!staffProfileLoading &&
                    staffProfileData?.overview?.about && (
                      <RichTextEditor
                        key={`aboutMe${colorMode}`} // Change the key to force a re-render
                        editorType="PublicProfile"
                        section={"About Me"}
                        canEdit={true}
                        isUpdate={true}
                        data={staffProfileData?.overview?.about}
                        writeable_document_kind={"Public Profile"}
                        writeable_document_pk={staffProfileData?.pk}
                      />
                    )}
                </Subsection>
                <Subsection title="Expertise">
                  {!staffProfileLoading &&
                    staffProfileData?.overview?.expertise && (
                      <RichTextEditor
                        key={`aboutMe${colorMode}`} // Change the key to force a re-render
                        editorType="PublicProfile"
                        section={"Expertise"}
                        canEdit={true}
                        isUpdate={true}
                        data={staffProfileData?.overview?.expertise}
                        writeable_document_kind={"Public Profile"}
                        writeable_document_pk={staffProfileData?.pk}
                      />
                    )}
                </Subsection>
              </TabPanel>
              {/* <TabPanel>
            <EditableStaffProjects
              staffProfileData={staffProfileData}
              staffProfileLoading={staffProfileLoading}
            />
          </TabPanel>
          <TabPanel>
            <EditableStaffCV
              staffProfileData={staffProfileData}
              staffProfileLoading={staffProfileLoading}
            />
          </TabPanel>
          <TabPanel>
            <EditableStaffPublications
              staffProfileData={staffProfileData}
              staffProfileLoading={staffProfileLoading}
            />
          </TabPanel> */}
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <>
          <Box>
            <Text>You have not set up a public staff profile yet.</Text>
          </Box>
        </>
      )}
    </Flex>
  );
};
