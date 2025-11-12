// Route for handling Updating and Reviewing Account

import { Head } from "@/shared/components/Base/Head";
import CaretakerModePage from "@/shared/components/Pages/Account/Caretaking/CaretakerMode";
import { ProfilePage } from "@/shared/components/Pages/Account/ProfilePage";
import { SideMenuButton } from "@/shared/components/Pages/Account/SideMenuButton";
import { AccountPageViewWrapper } from "@/shared/components/Wrappers/AccountPageViewWrapper";
import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const AccountEdit = () => {
  const { colorMode } = useColorMode();

  const [selected, setSelected] = useState("spmsprofile");
  const [pageViewChildren, setPageViewChildren] = useState<React.ReactNode>(
    <>Test</>,
  );
  const handleSidebarMenuClick = (page: string) => {
    setSelected(page);
  };

  useEffect(() => {
    let content = null;
    switch (selected) {
      case "spmsprofile":
        content = <ProfilePage />;
        break;
      case "caretakermode":
        content = <CaretakerModePage />;
        break;
      default:
        content = null;
        break;
    }
    setPageViewChildren(content);
  }, [selected]);

  return (
    <>
      <Head title="My Account" />
      <Flex
        h={"100%"}
        w={"100%"}
        //
        // bg={"yellow"}
      >
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
        >
          <SideMenuButton
            pageName={"SPMS Profile"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("spmsprofile")}
          />
          <SideMenuButton
            pageName={"Caretaker Mode"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("caretakermode")}
          />
          {/* <SideMenuButton
            pageName={"Public Profile"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("publicprofile")}
          /> */}
        </Box>
      </Flex>
    </>
  );
};
