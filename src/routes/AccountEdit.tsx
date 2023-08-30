// Route for handling Updating and Reviewing Account

import { Box, Flex, useColorMode } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { Head } from "../components/Base/Head";
import { SideMenuButton } from "../components/Pages/Account/SideMenuButton";
import { ProfilePage } from "../components/Pages/Account/ProfilePage";
import { AccountPageViewWrapper } from "../components/Wrappers/AccountPageViewWrapper";

export const AccountEdit = () => {

    const { colorMode } = useColorMode();

    const [selected, setSelected] = useState('profile');
    const [pageViewChildren, setPageViewChildren] = useState<React.ReactNode>(<>Test</>);
    const handleSidebarMenuClick = (page: string) => {
        setSelected(page);
    }

    useEffect(() => {
        let content = null;
        switch (selected) {
            case "profile":
                content = <ProfilePage />;
                break;
            // case "groups":
            //     content = <GroupsPage user={me} loading={loading} colorMode={colorMode} />;
            //     break;
            // case "settings":
            //     content = <SettingsPage user={me} loading={loading} colorMode={colorMode} />;
            //     break;

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
            >
                {/* Content */}
                <AccountPageViewWrapper children={pageViewChildren} />

                {/* Sidebar */}
                <Box
                    borderLeftWidth="1px"
                    borderLeftColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}
                    overflowY={"auto"}
                    flexShrink={0}
                    // maxH={"100vh"}
                    minH={"102%"}
                    minW={200}
                    maxW={200}
                    display={"flex"}
                    flexDirection={"column"}
                    py={1}
                    px={2}
                >
                    <SideMenuButton
                        pageName={'Profile'}
                        selectedString={selected}
                        onClick={() => handleSidebarMenuClick('profile')}
                    />
                </Box>
            </Flex>
        </>
    )
}