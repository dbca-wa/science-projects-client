// The content for the admin tab in the dashboard. Here admins can change a lot of things, but are
// still somewhat limited as not all functions have been created. Instead the other functions are
// accessible to developers via the django admin panel.

import { Center, Text, Flex, Grid, Icon, Divider, useColorMode } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { useState } from "react"
import { IconType } from "react-icons"
import { FaAddressCard, FaLocationArrow, FaUsers } from "react-icons/fa"
import { FcApproval, FcDataBackup } from "react-icons/fc"
import { GiArchiveResearch, GiBrainDump } from "react-icons/gi"
import { GoOrganization } from "react-icons/go"
import { ImBriefcase } from "react-icons/im"
import { MdManageHistory, MdOutlineSettingsSuggest } from "react-icons/md"
import { RiNewspaperFill, RiOrganizationChart } from "react-icons/ri"
import { useNavigate } from "react-router-dom"

export const Admin = () => {
    const { colorMode } = useColorMode();

    // Sort adminActions and crudAdminActions arrays alphabetically by name
    const sortedAdminActions = adminActions.slice().sort((a, b) => a.name.localeCompare(b.name));
    const sortedCrudAdminActions = crudAdminActions.slice().sort((a, b) => a.name.localeCompare(b.name));


    return (
        <>
            <Text
                my={3}
                fontWeight={"bold"}
                fontSize={"lg"}
                color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.700"}
            >
                CRUD
            </Text>
            <Divider my={4} />

            <Grid
                mt={6}
                gridTemplateColumns={
                    {
                        base: "repeat(1, 1fr)",
                        "740px": "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)",

                    }
                }
                gridGap={6}
            >
                {sortedCrudAdminActions.map((action, index) => (
                    <AdminOptionBox
                        key={index}
                        name={action.name}
                        description={action.description}
                        onClick={() => console.log(action.description)}
                        route={action.route}
                        reactIcon={action.reactIcon}
                    />
                ))}
            </Grid>



            <Text
                my={3}
                fontWeight={"bold"}
                fontSize={"lg"}
                color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.700"}
            >
                PROJECTS CRUD
            </Text>
            <Divider my={4} />

            <Grid
                mt={6}
                gridTemplateColumns={"repeat(3, 1fr)"}
                gridGap={6}
            >
                {projectAdminActions.map((action, index) => (
                    <AdminOptionBox
                        key={index}
                        name={action.name}
                        description={action.description}
                        onClick={() => console.log(action.description)}
                        route={action.route}
                        reactIcon={action.reactIcon}
                    />
                ))}
            </Grid>


            <Text
                my={3}
                fontWeight={"bold"}
                fontSize={"lg"}
                color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.700"}
            >
                BATCH
            </Text>
            <Divider my={4} />

            <Grid
                mt={6}
                gridTemplateColumns={"repeat(2, 1fr)"}
                gridGap={6}
            >
                {sortedAdminActions.map((action, index) => (
                    <AdminOptionBox
                        key={index}
                        name={action.name}
                        description={action.description}
                        onClick={action.onClick}
                        reactIcon={action.reactIcon}
                    />
                ))}
            </Grid>

        </>
    )
}


const handleDataDump = () => {
    console.log("Dumping data...");
}

const handleBatchApproveReports = () => {
    console.log("Batch approving...")
}


const adminActions = [
    {
        name: "Dump Data",
        description: "Dump db into zip file for migration",
        reactIcon: FcDataBackup,
        onClick: handleDataDump,
    },
    {
        name: "Batch Approve Progress Reports",
        description: "Approve all progress reports requesting approval",
        reactIcon: FcApproval,
        onClick: handleBatchApproveReports,
    },

]

const projectAdminActions = [

    {
        name: "Manage Project Memberships",
        description: "CRUD operations for Project Memberships",
        reactIcon: FaUsers,
        route: "/crud/memberships"
    },
    {
        name: "Manage Concept Plans",
        description: "CRUD operations for Concept Plans",
        reactIcon: RiNewspaperFill,
        route: "/crud/conceptplans"
    },
    {
        name: "Manage Project Plans",
        description: "CRUD operations for Project Plans",
        reactIcon: RiNewspaperFill,
        route: "/crud/projectplans"
    },
    {
        name: "Manage Progress Reports",
        description: "CRUD operations for Progress Reports",
        reactIcon: RiNewspaperFill,
        route: "/crud/progressreports"
    },
    {
        name: "Manage Student Reports",
        description: "CRUD operations for Student Reports",
        reactIcon: RiNewspaperFill,
        route: "/crud/studentreports"
    },
    {
        name: "Manage Project Closures",
        description: "CRUD operations for Project Closures",
        reactIcon: RiNewspaperFill,
        route: "/crud/closures"
    },
]


const crudAdminActions = [
    {
        name: "Manage Annual Reports",
        description: "CRUD operations for Annaul Reports",
        reactIcon: MdManageHistory,
        route: "/crud/reports"
    },
    {
        name: "Manage Business Areas",
        description: "CRUD operations for Business Areas",
        reactIcon: ImBriefcase,
        route: "/crud/businessareas"
    },

    {
        name: "Manage Research Functions",
        description: "CRUD operations for Research Functions",
        reactIcon: GiArchiveResearch,
        route: "/crud/researchfunctions"
    },
    {
        name: "Manage Services",
        description: "CRUD operations for Services",
        reactIcon: MdOutlineSettingsSuggest,
        route: "/crud/services"
    },
    {
        name: "Manage Divisions",
        description: "CRUD operations for Divisions",
        reactIcon: GoOrganization,
        route: "/crud/divisions"
    },
    {
        name: "Manage Locations",
        description: "CRUD operations for Areas",
        reactIcon: FaLocationArrow,
        route: "/crud/locations"
    },
    {
        name: "Manage Addresses",
        description: "CRUD operations for Addresses",
        reactIcon: FaAddressCard,
        route: "/crud/addresses"
    },
    {
        name: "Manage Branches",
        description: "CRUD operations for Branches",
        reactIcon: RiOrganizationChart,
        route: "/crud/branches"
    },
]

interface IAdminOptionBox {
    name: string;
    description: string;
    reactIcon?: IconType;
    onClick: () => void;
    route?: string;
}


const AdminOptionBox = ({ name, description, onClick, reactIcon, route }: IAdminOptionBox) => {
    const { colorMode } = useColorMode();

    const cardVariants = {
        rest: { scale: 1, rotateX: 0 },
        hover: {
            scale: 1.03,
            transition: {
                scale: { duration: 0.2 },
            },
        },
    };



    const [hovered, setHovered] = useState(false);

    const IconComponent = reactIcon;

    const navigate = useNavigate();
    const handleOnClick = () => {
        // console.log(route)
        if (route !== undefined && route !== null) {
            navigate(route);
        } else if (!route) {
            console.log("No route")
            onClick();
        } else {
            console.log("No route or onclick set")
        }
    }

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
            style={{ perspective: 1000 }}
        >
            <Center
                onMouseOver={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                rounded={"2xl"}
                pos={"relative"}
                overflow={"hidden"}
                style={{ transformStyle: "preserve-3d" }}
                boxShadow="
                0px 10px 20px 0px rgba(0, 0, 0, 0.1), 
                0px 2px 3px -1px rgba(0, 0, 0, 0.04), 
                -2px 0px 5px -1px rgba(0, 0, 0, 0.05), 
                2px -1px 5px -1px rgba(0, 0, 0, 0.05)
                "
                padding={8}
                bg={colorMode === "light" ? "white" : "blackAlpha.500"}
                color={colorMode === "light" ? "gray.500" : "gray.400"}
                _hover={
                    {
                        color: colorMode === "light" ? "gray.600" : "gray.200"
                    }
                }
                cursor={"pointer"}
                onClick={handleOnClick}

            >

                <Icon as={IconComponent} boxSize={20}

                />
            </Center>
            <Flex left={0} bottom={0} p={4} flexDir={"column"}
                cursor={"pointer"}
                onClick={handleOnClick}
            >
                <Center zIndex={3}>
                    <Text
                        fontWeight={"semibold"}
                        color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.700"}
                        noOfLines={2}
                        // textShadow="2px 2px 4px rgba(0, 0, 0, 0.3)"
                        userSelect={"none"}
                    >
                        {name}
                    </Text>
                </Center>
            </Flex>

        </motion.div>
    );
};