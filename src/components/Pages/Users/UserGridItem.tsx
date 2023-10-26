// Display for a single user on the Users page (mapped over for each user on a grid). Also with drawer for more details.

import { Grid, Flex, Box, Button, Text, BoxProps, useBreakpointValue, useDisclosure, Avatar, useColorMode, Drawer, DrawerContent, DrawerOverlay, DrawerBody, DrawerFooter } from "@chakra-ui/react";
import { IUserData } from "../../../types";
import { UserProfile } from "./UserProfile";
import { useEffect } from "react";


interface BoxContainerProps extends BoxProps {
    children: React.ReactNode;
}

export const BoxContainer: React.FC<BoxContainerProps> = ({ children, ...props }) => {
    return (
        <Grid

            whiteSpace="normal"
            maxWidth="100%"
            {...props}

        >
            {children}
        </Grid>
    );
};


export const UserGridItem = ({
    pk, username, email, first_name, last_name, is_staff, is_superuser,
    business_area, role, branch, image, affiliation, branches, businessAreas
}: IUserData) => {

    const fullName = (first_name !== null && last_name !== null) ? `${first_name} ${last_name}` : `No Name (${username})`;
    const isLgOrLarger = useBreakpointValue({ base: false, sm: false, md: false, lg: true, xlg: true })
    const isOver690 = useBreakpointValue({ false: true, sm: false, md: false, 'over690': true, 'mdlg': true, lg: true, xlg: true })

    const { colorMode } = useColorMode();

    const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();


    const drawerFunction = () => {
        console.log(`${first_name} clicked`);
        onUserOpen();
    }

    useEffect(() => {
        console.log(business_area?.name)
    }, [business_area])

    return (
        <>
            <Drawer
                isOpen={isUserOpen}
                placement='right'
                onClose={onUserClose}
                size={"sm"} //by default is xs
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerBody>
                        <UserProfile
                            pk={pk}
                            branches={branches}
                            businessAreas={businessAreas}
                        />
                    </DrawerBody>

                    <DrawerFooter>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>


            <Grid
                templateColumns={{
                    base: "4fr 4fr 2.5fr",
                    lg: "4fr 4fr 2.5fr",
                }}
                alignItems="center"
                p={4}
                borderWidth={1}
                width="100%"
                key={pk}
                userSelect={"none"}
                cursor={"pointer"}
                onClick={drawerFunction}
                _hover={{
                    scale: 1.1,
                    boxShadow:
                        colorMode === "light"
                            ? "0px 7.5px 15px -3.75px rgba(0, 0, 0, 0.15), -0.75px 1.5px 3px -0.75px rgba(0, 0, 0, 0.03), -2.25px 0px 3.75px -0.75px rgba(0, 0, 0, 0.0375), 0.75px 0px 3.75px -0.75px rgba(0, 0, 0, 0.0375)"
                            : "0px 1.5px 2.25px -0.75px rgba(255, 255, 255, 0.0375), -0.75px 0.75px 1.5px -0.75px rgba(255, 255, 255, 0.0225)",
                }}


            >
                {
                    // isLgOrLarger ?
                    (
                        <Flex
                            ml={2}
                        // bg={"red"}
                        >
                            <Box
                                minW={55}
                                mr={4}
                            >
                                <Avatar
                                    src={image?.file ? image.file : image?.old_file ? image.old_file : ""}
                                    draggable={false}
                                    userSelect={"none"}
                                    h={55}
                                    w={55}
                                    objectFit="cover"
                                    cursor={"pointer"}
                                    onClick={drawerFunction}
                                />
                            </Box>

                            {/* Full Name */}
                            <BoxContainer
                                ml={isLgOrLarger ? 4 : 2}
                                w="100%"
                                overflow="hidden"
                                textOverflow={"ellipsis"}
                                justifyContent={"start"}
                                gridTemplateColumns={"repeat(1, 1fr)"}
                            >
                                <Button
                                    fontWeight="bold"
                                    variant={"link"}
                                    as={"a"}
                                    cursor={"pointer"}
                                    onClick={drawerFunction}
                                    justifyContent={"start"}
                                >
                                    {
                                        is_staff ?
                                            isLgOrLarger ? fullName :

                                                fullName.length > 16 ? `${fullName.substring(0, 10)}...` : fullName
                                            : isLgOrLarger ?
                                                fullName.startsWith("None") ? username :
                                                    `${fullName}` : username
                                    }
                                </Button>
                                <Text
                                    fontSize={"sm"}
                                    color={
                                        is_superuser ? role == "Executive" ? "orange.500" : "blue.500" :
                                            is_staff ? "green.500" :
                                                // External user
                                                "gray.500"
                                    }
                                >
                                    {

                                        // If no role set
                                        is_superuser ? role == "Executive" ? "Executive" : "Admin" :
                                            is_staff ? "Staff" :
                                                "External User"
                                    }
                                </Text>
                                {
                                    (is_staff) ?
                                        (<Text
                                            // fontWeight={"medium"}
                                            fontSize={"xs"}
                                            color={colorMode === "light" ? "gray.600" : "gray.300"}
                                        >
                                            {branch ? branch.name : `Branch Not Set`}
                                        </Text>) : (
                                            <Text
                                                fontSize={"xs"}
                                                color={colorMode === "light" ? "gray.600" : "gray.300"}
                                            >
                                                {affiliation ? affiliation : "No Affiliations"}
                                            </Text>
                                        )
                                }

                            </BoxContainer>

                        </Flex>
                    )
                    // :null
                }



                {/* Email Address */}
                {
                    isLgOrLarger ?
                        <Box
                            // bg={"green"}

                            ml={4}
                            w="100%"
                            overflow="hidden"
                            textOverflow={"ellipsis"}
                            draggable={false}
                        >
                            <Text>
                                {
                                    email ?
                                        email.endsWith(("email.com")) ? "-"
                                            : email
                                        : email
                                }
                            </Text>
                        </Box>
                        :
                        !isOver690 ?
                            <Box
                                ml={4}
                                w="100%"
                                overflow="hidden"
                                textOverflow={"ellipsis"}
                                draggable={false}
                            >
                                <Text>
                                    {
                                        email ? email.endsWith(("email.com")) ? "(Not Provided)" :
                                            email.length >= 15 ? `${email.substring(0, 13)}...` : email :
                                            "-"
                                    }
                                </Text>
                            </Box>
                            :
                            <Box
                                ml={4}
                                w="100%"
                                overflow="hidden"
                                textOverflow={"ellipsis"}
                                draggable={false}
                            >
                                <Text>
                                    {
                                        email ? email.endsWith(("email.com")) ? "(Not Provided)" :
                                            email.length >= 25 ? `${email.substring(0, 20)}...` : email :
                                            "-"
                                    }
                                </Text>
                            </Box>
                }

                {/* Business Area */}

                <BoxContainer
                    ml={4}
                    w="100%"
                    overflow="hidden"
                    textOverflow={"ellipsis"}
                >
                    <Text>
                        {business_area ? business_area.name : "-"}
                    </Text>
                </BoxContainer>


            </Grid >
        </>
    )
}