import { Head } from "@/shared/components/layout/base/Head";
import { SideMenuButton } from "@/features/users/components/account/SideMenuButton";
import { SideMenuSectionDivider } from "@/features/dashboard/components/guide/SidebarSectionDivider";
import { GuideRichTextEditor } from "@/shared/components/RichTextEditor/Editors/GuideRichTextEditor";
import { AccountPageViewWrapper } from "@/shared/components/layout/wrappers/AccountPageViewWrapper";
import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import { useAdminOptions } from "@/features/admin/hooks/useAdminOptions";
import { useUser } from "@/features/users/hooks/useUser";
import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ISectionProps {
  isSuperUser: boolean;
  sectionData?: string;
  sectionDataA?: string;
  sectionDataB?: string;
  adminOptionsPk: number;
  refetch: () => void;
}

const GuideAboutSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_about";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`guide_about${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={"guide_about"}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideLoginSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_login";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`guide_login${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={"guide_login"}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideUserProfileSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_profile";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`guide_profile${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={"guide_profile"}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideCreateProjectSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_project_creation";
  const editorKey = colorMode + documentType;

  return (
    <GuideRichTextEditor
      key={`${documentType}${editorKey}`} // Change the key to force a re-render
      canEdit={isSuperUser}
      data={sectionData ?? ""}
      section={`${documentType}`}
      adminOptionsPk={adminOptionsPk}
      isUpdate={true}
      refetch={refetch}
    />
  );
};

const GuideViewProjectSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_project_view";
  const editorKey = colorMode + documentType;

  return (
    <>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </>
  );
};

const GuideProjectsSection = ({
  isSuperUser,
  adminOptionsPk,
  sectionDataA,
  sectionDataB,
  refetch,
}: ISectionProps) => {
  return (
    <Box pr={4}>
      <GuideCreateProjectSection
        adminOptionsPk={adminOptionsPk}
        isSuperUser={isSuperUser}
        sectionData={sectionDataA}
        refetch={refetch}
      />
      <GuideViewProjectSection
        adminOptionsPk={adminOptionsPk}
        isSuperUser={isSuperUser}
        sectionData={sectionDataB}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideCreateUsersSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_user_creation";
  const editorKey = colorMode + documentType;

  return (
    <>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </>
  );
};

const GuideViewUsersSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_user_view";
  const editorKey = colorMode + documentType;

  return (
    <>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </>
  );
};

const GuideUsersSection = ({
  isSuperUser,
  sectionDataA,
  sectionDataB,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  return (
    <Box pr={4}>
      <GuideCreateUsersSection
        adminOptionsPk={adminOptionsPk}
        isSuperUser={isSuperUser}
        sectionData={sectionDataA}
        refetch={refetch}
      />

      <GuideViewUsersSection
        adminOptionsPk={adminOptionsPk}
        isSuperUser={isSuperUser}
        sectionData={sectionDataB}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideTeamsSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_project_team";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideDocumentsSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_documents";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideAdminSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_admin";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

const GuideAnnualReportSection = ({
  isSuperUser,
  sectionData,
  adminOptionsPk,
  refetch,
}: ISectionProps) => {
  const { colorMode } = useColorMode();
  const documentType = "guide_report";
  const editorKey = colorMode + documentType;

  return (
    <Box pr={4}>
      <GuideRichTextEditor
        key={`${documentType}${editorKey}`} // Change the key to force a re-render
        canEdit={isSuperUser}
        data={sectionData ?? ""}
        section={`${documentType}`}
        adminOptionsPk={adminOptionsPk}
        isUpdate={true}
        refetch={refetch}
      />
    </Box>
  );
};

// ==========================================================================

export const UserGuide = () => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const { colorMode } = useColorMode();
  const { userData, userLoading } = useUser();
  const { adminOptionsData, adminOptionsLoading, refetch } = useAdminOptions(1);
  //   softRefetch

  const [selected, setSelected] = useState("about");
  const [pageViewChildren, setPageViewChildren] = useState<React.ReactNode>();
  const handleSidebarMenuClick = (page: string) => {
    manuallyCheckAndToggleDialog(() => {
      setSelected(page);
    });
  };

  useEffect(() => {
    if (!userLoading && userData && !adminOptionsLoading && adminOptionsData) {
      let content = null;

      switch (selected) {
        case "about":
          content = (
            <GuideAboutSection
              isSuperUser={userData?.is_superuser}
              // Changed from adminOptionsData?.guide_about to:
              sectionData={
                adminOptionsData?.guide_content?.guide_about ||
                adminOptionsData?.guide_about
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;
        case "admin":
          content = (
            <GuideAdminSection
              isSuperUser={userData?.is_superuser}
              // Changed from adminOptionsData?.guide_admin to:
              sectionData={
                adminOptionsData?.guide_content?.guide_admin ||
                adminOptionsData?.guide_admin
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;

        case "login":
          content = (
            <GuideLoginSection
              isSuperUser={userData?.is_superuser}
              // Changed from adminOptionsData?.guide_login to:
              sectionData={
                adminOptionsData?.guide_content?.guide_login ||
                adminOptionsData?.guide_login
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;

        case "profile":
          content = (
            <GuideUserProfileSection
              isSuperUser={userData?.is_superuser}
              // Changed from adminOptionsData?.guide_profile to:
              sectionData={
                adminOptionsData?.guide_content?.guide_profile ||
                adminOptionsData?.guide_profile
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;
        case "users":
          content = (
            <GuideUsersSection
              isSuperUser={userData?.is_superuser}
              adminOptionsPk={adminOptionsData.pk}
              // Changed these too:
              sectionDataA={
                adminOptionsData?.guide_content?.guide_user_creation ||
                adminOptionsData?.guide_user_creation
              }
              sectionDataB={
                adminOptionsData?.guide_content?.guide_user_view ||
                adminOptionsData?.guide_user_view
              }
              refetch={refetch}
            />
          );
          break;
        case "projects":
          content = (
            <GuideProjectsSection
              isSuperUser={userData?.is_superuser}
              adminOptionsPk={adminOptionsData.pk}
              // Changed these too:
              sectionDataA={
                adminOptionsData?.guide_content?.guide_project_creation ||
                adminOptionsData?.guide_project_creation
              }
              sectionDataB={
                adminOptionsData?.guide_content?.guide_project_view ||
                adminOptionsData?.guide_project_view
              }
              refetch={refetch}
            />
          );
          break;
        case "teams":
          content = (
            <GuideTeamsSection
              isSuperUser={userData?.is_superuser}
              // Changed:
              sectionData={
                adminOptionsData?.guide_content?.guide_project_team ||
                adminOptionsData?.guide_project_team
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;
        case "documents":
          content = (
            <GuideDocumentsSection
              isSuperUser={userData?.is_superuser}
              // Changed:
              sectionData={
                adminOptionsData?.guide_content?.guide_documents ||
                adminOptionsData?.guide_documents
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;
        case "report":
          content = (
            <GuideAnnualReportSection
              isSuperUser={userData?.is_superuser}
              // Changed:
              sectionData={
                adminOptionsData?.guide_content?.guide_report ||
                adminOptionsData?.guide_report
              }
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
            />
          );
          break;
        default:
          content = null;
          break;
      }
      setPageViewChildren(content);
    }
  }, [selected, userData, userLoading, adminOptionsData, adminOptionsLoading]);

  return (
    <>
      <Head title="Guide" />
      <Flex h={"100%"} w={"100%"}>
        {/* Content */}
        <AccountPageViewWrapper children={pageViewChildren} />

        {/* Sidebar */}
        <Box
          borderLeftWidth="1px"
          borderLeftColor={
            colorMode === "light" ? "gray.300" : "whiteAlpha.400"
          }
          px={2}
          minW={174}
          minH={"100%"}
          h={"100%"}
        >
          <SideMenuButton
            pageName={"About"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("about")}
          />
          <SideMenuButton
            pageName={"Login"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("login")}
          />
          <SideMenuButton
            pageName={"Profile"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("profile")}
          />
          {/* <SideMenuSectionDivider /> */}
          <SideMenuButton
            pageName={"Projects"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("projects")}
          />
          {/* <SideMenuButton
            pageName={"Users"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("users")}
          /> */}
          <SideMenuSectionDivider />
          <SideMenuButton
            pageName={"Teams"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("teams")}
          />
          <SideMenuButton
            pageName={"Documents"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("documents")}
          />
          <SideMenuSectionDivider />
          {/* <SideMenuButton
            pageName={"Report"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("report")}
          />
          <SideMenuButton
            pageName={"Admin"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("admin")}
          /> */}
        </Box>
      </Flex>
    </>
  );
};
