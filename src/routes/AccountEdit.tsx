// Route for handling Updating and Reviewing Account

import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Head } from "../components/Base/Head";
import { SideMenuButton } from "../components/Pages/Account/SideMenuButton";
import { ProfilePage } from "../components/Pages/Account/ProfilePage";
import { AccountPageViewWrapper } from "../components/Wrappers/AccountPageViewWrapper";
import CaretakerModePage from "@/components/Pages/Account/CaretakerMode";
// import { PublicProfilePage } from "@/components/Pages/Account/PublicProfilePage";

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
      // case "publicprofile":
      //   content = <PublicProfilePage />;
      //   break;
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
