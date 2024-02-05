// Route for handling Project Creation

import { Box, Grid, GridItem, useColorMode } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { NewProjectCard } from "../components/Pages/CreateProject/NewProjectCard";
import { Head } from "../components/Base/Head";
import { useLayoutSwitcher } from "../lib/hooks/LayoutSwitcherContext";
import { TypewriterText } from "../components/Animations/TypewriterText";
import { MdScience } from "react-icons/md";
import { GiMaterialsScience } from "react-icons/gi";
import { RiBook3Fill } from "react-icons/ri";
import { FaUserFriends } from "react-icons/fa";

export const CreateProject = () => {
  // #1E5456 Dark Green
  // #FFC530
  // #01A7B2
  // #2A6096 Blue
  const creationData = [
    {
      title: "Science Project",
      description: "A discrete body of DBCA-led scientific work with a defined period of activity.",
      bulletPoints: [
        "Requires approval through SPMS.",
        "Requires annual progress reporting",
        "Requires closure form to close",
      ],
      colorScheme: "green",
      buttonIcon: MdScience,
      color: "#2A6096",
    },
    {
      title: "Core Function",
      description:
        "An ongoing body of scientific work that supports biodiversity science, conservation and other business functions.",
      bulletPoints: [
        "Requires prior approval by Executive Director or delegate",
        "Requires annual progress reporting",
        "Immediate closure without closure form",
      ],
      colorScheme: "red",
      buttonIcon: GiMaterialsScience,
      color: "#01A7B2",
    },

    {
      title: "Student Project",
      description: "A project being undertaken by a student to attain a higher degree for which a DBCA staff member is a co-supervisor.",
      bulletPoints: [
        "Requires prior approval by Executive Director or delegate",
        "Requires annual progress reporting",
        "Immediate closure without closure form",
      ],
      colorScheme: "blue",
      buttonIcon: RiBook3Fill,
      color: "#FFC530",
    },
    {
      title: "External Partnership",
      description: "A formal collaborative scientific partnership with an external organisation or organisations.",
      bulletPoints: [
        "Requires prior approval by Executive Director or delegate",
        "Project details automatically included in annual reporting",
        "Immediate closure without closure form",
      ],
      colorScheme: "gray",
      buttonIcon: FaUserFriends,
      color: "#1E5456",
    },
  ];
  const { colorMode } = useColorMode();
  const { layout } = useLayoutSwitcher();

  return (
    <>
      <Head title={"Add Project"} />

      {
        <Box
          bgColor={colorMode === "light" ? "gray.100" : "gray.700"}
          rounded={6}
          flexDir={"column"}
          p={6}
          pos={"relative"}
          mt={5}
          mb={7}
          color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
          userSelect={"none"}
        >
          <TypewriterText
            text={
              "Projects differ by documentation structure, approval process, and reporting requirements. Make sure you choose the correct project type as you will not be able to change this after creation. If you need to change the project type, you will need to request that the project be deleted by an administrator and create a new project of the desired type. For further guidance on project types, refer to Corporate Guideline XX Science Implementation."
            }
          />
        </Box>
      }

      <AnimatePresence>
        <Grid
          my={5}
          templateColumns={{
            base: "repeat(1, 1fr)",
            "768px": "repeat(2, 1fr)",
            "1240px": layout === "modern" ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            // "1500px": "repeat(4, 1fr)",
            // "2xl": "repeat(4, 1fr)",
          }}
          gap={8}
          userSelect={"none"}
        >
          {creationData.map((item, index) => {
            return (
              <GridItem alignSelf="stretch" key={index}>
                <motion.div
                  key={index}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 + (index + 1) / 5 }}
                  style={{
                    height: "100%",
                    animation: "oscillate 8s ease-in-out infinite",
                  }}
                >
                  <NewProjectCard
                    title={item.title}
                    description={item.description}
                    buttonIcon={item.buttonIcon}
                    bulletPoints={item.bulletPoints}
                    colorScheme={item.colorScheme}
                    color={item.color}
                  />
                </motion.div>
              </GridItem>
            );
          })}
        </Grid>
      </AnimatePresence>
    </>
  );
};
