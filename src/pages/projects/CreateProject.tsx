// Route for handling Project Creation

import { TypewriterText } from "@/shared/components/Animations/TypewriterText";
import { Head } from "@/shared/components/Base/Head";
import { NewProjectCard } from "@/shared/components/Pages/CreateProject/NewProjectCard";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Text,
  useColorMode
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";

export const CreateProject = () => {
  // #1E5456 Dark Green
  // #FFC530
  // #01A7B2
  // #2A6096 Blue
  const creationData = [
    {
      title: "Science Project",
      description:
        "A discrete body of DBCA-led scientific work with a defined period of activity or an externally led science project with DBCA involvement.",
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
        "Requires prior approval by Executive Director",
        "Requires annual progress reporting",
        "Immediate closure without closure form",
      ],
      colorScheme: "red",
      buttonIcon: GiMaterialsScience,
      color: "#01A7B2",
    },

    {
      title: "Student Project",
      description:
        "A project being undertaken by a student to attain a higher degree for which a DBCA staff member is a co-supervisor.",
      bulletPoints: [
        "Requires prior approval by Executive Director",
        "Requires annual progress reporting",
        "Immediate closure without closure form",
      ],
      colorScheme: "blue",
      buttonIcon: RiBook3Fill,
      color: "#FFC530",
    },
    {
      title: "External Partnership",
      description:
        "A formal collaborative scientific partnership with an external organisation or organisations.",
      bulletPoints: [
        "Requires prior approval by Executive Director",
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
          p={6}
          mt={5}
          mb={7}
          color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
          // userSelect={"none"}
          // display={"inline"}
          pos={"relative"}
        >
          <TypewriterText>
            <Text as="span" display="inline">
              Projects differ by documentation structure, approval process, and
              reporting requirements. Make sure you choose the correct project
              type as you will not be able to change this after creation. If you
              need to change the project type, you will need to request that the
              project be deleted by an administrator and create a new project of
              the desired type. For further guidance on project types, refer to
            </Text>
            {/* Button appears after text is animated */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 2.1,
                duration: 0.1,
              }}
              style={{ display: "inline", marginLeft: "0.2em" }}
            >
              <Button
                variant={"link"}
                color={colorMode === "light" ? "blue.500" : "blue.300"}
                cursor={"pointer"}
                onClick={() =>
                  window.open(
                    "https://dpaw.sharepoint.com/Key%20documents/Forms/AllItems.aspx?FilterField1=Category&FilterValue1=Corporate%20guideline&FilterType1=Choice&FilterDisplay1=Corporate%20guideline&id=%2FKey%20documents%2FCorporate%20Guideline%2048%20%2D%20Science%20Implementation%2Epdf&viewid=f605923d%2D172f%2D4d35%2Db8ee%2D3f0d60db0ef7&parent=%2FKey%20documents",
                    "_blank",
                  )
                }
              >
                Corporate Guideline 48 - Science Implementation.
              </Button>
            </motion.span>
          </TypewriterText>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 4.1,
              duration: 0.1,
            }}
            style={{ display: "inline" }}
          ></motion.div> */}
        </Box>
      }

      <AnimatePresence>
        <Grid
          my={5}
          templateColumns={{
            base: "repeat(1, 1fr)",
            "768px": "repeat(2, 1fr)",
            "1240px": layout === "modern" ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
            "2xl": "repeat(4, 1fr)",
          }}
          gap={12}
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
