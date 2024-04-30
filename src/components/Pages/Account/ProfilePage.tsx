// Handles Profile Page view

import {
  Image,
  Box,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import { useUser } from "../../../lib/hooks/useUser";
import { FcApproval } from "react-icons/fc";
import { AiFillCloseCircle } from "react-icons/ai";
import { UserGridItem } from "../Users/UserGridItem";
import { EditPersonalInformationModal } from "../../Modals/EditPersonalInformationModal";
import { EditMembershipModal } from "../../Modals/EditMembershipModal";
import { EditProfileModal } from "../../Modals/EditProfileModal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";
import useServerImageUrl from "../../../lib/hooks/useServerImageUrl";

const AnimatedClickToEdit = () => {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: "100%",
        animation: "ease-in-out infinite",
      }}
    >
      <Text color={"blue.500"}>Click to edit</Text>
    </motion.div>
  );
};

export const ProfilePage = () => {
  const baseAPI = useApiEndpoint();

  const { userLoading: loading, userData: me } = useUser();
  useEffect(() => {
    if (!loading) {
      console.log(me);
    }
  }, [me, loading]);
  const NoDataText = "--";

  const { colorMode } = useColorMode();
  const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
  const sectionTitleColor = colorMode === "light" ? "gray.800" : "gray.300";
  const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500";

  const {
    isOpen: isEditPersonalInformationModalOpen,
    onOpen: onOpenEditPersonalInformationModal,
    onClose: onCloseEditPersonalInformationModal,
  } = useDisclosure();

  const {
    isOpen: isEditProfileModalOpen,
    onOpen: onOpenEditProfileModal,
    onClose: onCloseEditProfileModal,
  } = useDisclosure();

  const {
    isOpen: isEditMembershipModalOpen,
    onOpen: onOpenEditMembershipModal,
    onClose: onCloseEditMembershipModal,
  } = useDisclosure();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMouseEnter = (itemName: string) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const imageUrl = useServerImageUrl(me?.image?.file);

  return (
    <Box h={"100%"}>
      {loading || me.pk === undefined ? (
        <Spinner />
      ) : (
        <>
          <EditPersonalInformationModal
            userId={`${me.pk}`}
            isOpen={isEditPersonalInformationModalOpen}
            onClose={onCloseEditPersonalInformationModal}
          />

          <EditProfileModal
            userId={`${me.pk}`}
            isOpen={isEditProfileModalOpen}
            onClose={onCloseEditProfileModal}
            currentImage={`${baseAPI}${me.image?.file}`}
          />

          <EditMembershipModal
            currentOrganisationData={`${me?.agency?.pk}`}
            currentBranchData={me?.branch}
            currentBaData={me?.business_area}
            currentAffiliationData={me?.affiliation}
            userId={me.pk}
            isOpen={isEditMembershipModalOpen}
            onClose={onCloseEditMembershipModal}
          />

          {/* APPEARANCE */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
          >
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"lg"}
                mb={4}
                color={sectionTitleColor}
              >
                Search Appearance
              </Text>
            </Flex>

            <Flex>
              <Flex w={"100%"} p={2}>
                <UserGridItem
                  pk={me.pk}
                  username={me.username}
                  email={me.email}
                  first_name={me.first_name}
                  last_name={me.last_name}
                  is_staff={me.is_staff}
                  is_superuser={me.is_superuser}
                  image={me.image}
                  business_area={me.business_area}
                  role={me.role}
                  branch={me.branch}
                  is_active={me.is_active}
                  affiliation={me.affiliation}
                />
              </Flex>
            </Flex>
          </Flex>

          {/* PERSONAL INFORMATION */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            onClick={onOpenEditPersonalInformationModal}
            cursor={"pointer"}
            onMouseEnter={() => handleMouseEnter("personal information")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={4}
                  color={sectionTitleColor}
                >
                  Personal Information
                </Text>
              </Flex>
              {hoveredItem === "personal information" && (
                <Flex
                  flex={1}
                  // bg={"pink"}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  First Name
                </Text>
                <Text>{me.first_name}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Last Name
                </Text>
                <Text>{me.last_name}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Phone
                </Text>
                <Text>{me.phone ? me.phone : "--"}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Fax
                </Text>
                <Text>{me.fax ? me.fax : "--"}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Title
                </Text>
                <Text>
                  {me.title
                    ? me.title === "mr"
                      ? "Mr."
                      : me.title === "mrs"
                      ? "Mrs."
                      : me.title === "ms"
                      ? "Ms."
                      : me.title === "master"
                      ? "Master"
                      : me.title === "dr"
                      ? "Dr."
                      : "Bad Title"
                    : "--"}
                </Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Email Address
                </Text>
                <Text>{me.email}</Text>
              </Flex>
            </Grid>
          </Flex>

          {/* PROFILE */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            cursor={"pointer"}
            onClick={onOpenEditProfileModal}
            onMouseEnter={() => handleMouseEnter("profile")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={4}
                  color={sectionTitleColor}
                >
                  Profile
                </Text>
              </Flex>
              {hoveredItem === "profile" && (
                <Flex
                  flex={1}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={8}>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Image
                </Text>
                <Center
                  width={"100%"}
                  maxH={"300px"}
                  bg={"gray.50"}
                  mt={1}
                  rounded={"lg"}
                  overflow={"hidden"}
                >
                  <Image
                    objectFit={"cover"}
                    src={
                      imageUrl
                      // me?.image ? `${baseAPI}${me.image.file}` : "/sad-face.png"
                    }
                    top={0}
                    left={0}
                    userSelect={"none"}
                  />
                </Center>
              </Flex>
              <Flex flexDir={"column"}>
                <Box>
                  <Text color={subsectionTitleColor} fontSize={"sm"}>
                    About
                  </Text>
                  <Box mt={1}>
                    <Text>
                      {me?.about
                        ? me?.about
                        : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis pulvinar lectus. Nam vitae volutpat ante. Duis convallis odio at ornare interdum. Fusce faucibus, velit id ullamcorper egestas, dui elit fermentum leo, eget aliquam leo felis quis arcu. Donec vitae ornare eros. Nam lobortis hendrerit diam, ac molestie ipsum tempus sit amet. In ac nulla tellus. (Not Provided)"}
                    </Text>
                  </Box>
                </Box>
                <Box mt={8}>
                  <Text color={subsectionTitleColor} fontSize={"sm"}>
                    Expertise
                  </Text>
                  <Box mt={1}>
                    <Text>
                      {me?.expertise
                        ? me?.expertise
                        : "Sed vitae semper tellus, vel rutrum purus. Fusce lobortis eleifend fringilla.  (Not Provided)"}
                    </Text>
                  </Box>
                </Box>
              </Flex>
            </Grid>
          </Flex>

          {/* ORGANISATION */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            cursor={"pointer"}
            onClick={onOpenEditMembershipModal}
            onMouseEnter={() => handleMouseEnter("membership")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={4}
                  color={sectionTitleColor}
                >
                  Membership
                </Text>
              </Flex>
              {hoveredItem === "membership" && (
                <Flex
                  flex={1}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Organisation Name
                </Text>
                <Text>
                  {!me.is_staff
                    ? "External"
                    : me?.agency?.name
                    ? me.agency.name
                    : NoDataText}
                </Text>
              </Flex>
              {me.is_staff && (
                <>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Branch
                    </Text>
                    <Text>
                      {me?.branch?.name ? me?.branch?.name : NoDataText}
                    </Text>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Business Area
                    </Text>
                    <Text>
                      {me?.business_area?.name
                        ? me?.business_area?.name
                        : NoDataText}
                    </Text>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Affiliation
                    </Text>
                    <Text>
                      {me?.affiliation ? me.affiliation?.name : NoDataText}
                    </Text>
                  </Flex>
                </>
              )}
            </Grid>
          </Flex>

          {/* STATUS */}
          <Grid
            mb={4}
            gridTemplateColumns={"repeat(3, 1fr)"}
            rounded={"xl"}
            gap={3}
            flex={1}
            p={4}
            bg={colorMode === "light" ? "gray.50" : "gray.900"} //BUGGY for some reason
          >
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text mb="8px" fontWeight={"bold"}>
                Active?
              </Text>
              {me?.is_active ? (
                <Box color={colorMode === "light" ? "green.500" : "green.600"}>
                  <FcApproval />
                </Box>
              ) : (
                <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                  <AiFillCloseCircle />
                </Box>
              )}
            </Grid>

            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text mb="8px" fontWeight={"bold"}>
                Staff?
              </Text>
              {me?.is_staff ? (
                <FcApproval />
              ) : (
                <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                  <AiFillCloseCircle />
                </Box>
              )}
            </Grid>

            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text mb="8px" fontWeight={"bold"}>
                Admin?
              </Text>
              {me?.is_superuser ? (
                <FcApproval />
              ) : (
                <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                  <AiFillCloseCircle />
                </Box>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
