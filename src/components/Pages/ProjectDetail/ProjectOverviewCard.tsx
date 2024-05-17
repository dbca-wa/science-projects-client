// Displayed when looking at the Project Details by selecting it on the projects page. Displays more data about the project and allows editing.

import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { AiFillCalendar, AiFillTag } from "react-icons/ai";
import {
  FaEdit,
  FaGraduationCap,
  FaLock,
  FaLockOpen,
  FaTrash,
  FaUserFriends,
} from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import {
  IExtendedProjectDetails,
  IExternalProjectDetails,
  IProjectAreas,
  IProjectData,
  IProjectDocuments,
  IProjectMember,
  IStudentProjectDetails,
} from "../../../types";
import { ProjectDetailEditModal } from "../../Modals/ProjectDetailEditModal";
// import { AiFillDollarCircle } from "react-icons/ai";

import { useEffect, useState } from "react";
import { BsCaretDownFill } from "react-icons/bs";
import { CgOrganisation } from "react-icons/cg";
import { FaSackDollar } from "react-icons/fa6";
import { GiMaterialsScience } from "react-icons/gi";
import { GrStatusInfo } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";
import { IoCreate } from "react-icons/io5";
import { MdBusinessCenter, MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { VscOrganization } from "react-icons/vsc";
import { useLayoutSwitcher } from "../../../lib/hooks/helper/LayoutSwitcherContext";
import { useCheckUserInTeam } from "../../../lib/hooks/helper/useCheckUserInTeam";
import { useCheckUserIsTeamLeader } from "../../../lib/hooks/helper/useCheckUserIsTeamLeader";
import { useNoImage } from "../../../lib/hooks/helper/useNoImage";
import useServerImageUrl from "../../../lib/hooks/helper/useServerImageUrl";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import { ExtractedHTMLTitle } from "../../ExtractedHTMLTitle";
import { CreateProgressReportModal } from "../../Modals/CreateProgressReportModal";
import { CreateStudentReportModal } from "../../Modals/CreateStudentReportModal";
import { DeleteProjectModal } from "../../Modals/DeleteProjectModal";
import { EditProjectModal } from "../../Modals/EditProjectModal";
import { ProjectClosureModal } from "../../Modals/ProjectClosureModal";
import { ProjectReopenModal } from "../../Modals/ProjectReopenModal";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";

interface IProjectOverviewCardProps {
  location: IProjectAreas;
  baseInformation: IProjectData;
  details: IExtendedProjectDetails | null | undefined;
  members: IProjectMember[];
  documents: IProjectDocuments;
  refetchData: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProjectOverviewCard = ({
  location,
  baseInformation,
  details,
  members,
  refetchData,
  documents,
  setToLastTab,
}: IProjectOverviewCardProps) => {
  // useEffect(() => {
  //   console.log(details);
  // }, [details]);
  const {
    isOpen: isEditProjectDetailModalOpen,
    onClose: onEditProjectDetailModalClose,
  } = useDisclosure();
  const { colorMode } = useColorMode();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isClosureModalOpen,
    onOpen: onOpenClosureModal,
    onClose: onCloseClosureModal,
  } = useDisclosure();
  const {
    isOpen: isReopenModalOpen,
    onOpen: onOpenReopenModal,
    onClose: onCloseReopenModal,
  } = useDisclosure();
  const {
    isOpen: isCreateStudentReportModalOpen,
    onOpen: onOpenCreateStudentReportModal,
    onClose: onCloseCreateStudentReportModal,
  } = useDisclosure();
  const {
    isOpen: isCreateProgressReportModalOpen,
    onOpen: onOpenCreateProgressReportModal,
    onClose: onCloseCreateProgressReportModal,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();

  const determineAuthors = (members: IProjectMember[]) => {
    // Filters members with non-null first and last names
    const filteredMembers = members?.filter((member) => {
      return (
        member.user.first_name !== null &&
        member.user.last_name !== null &&
        member.user.first_name !== undefined &&
        member.user.last_name !== undefined &&
        member.user.first_name !== "None" &&
        member.user.last_name !== "None"
      );
    });

    // Sorts the filteredMembers array alphabetically based on last_name
    filteredMembers.sort((a, b) => {
      const lastNameA = a.user.last_name!.toUpperCase();
      const lastNameB = b.user.last_name!.toUpperCase();
      if (lastNameA < lastNameB) return -1;
      if (lastNameA > lastNameB) return 1;
      return 0;
    });

    // Formats the names and create the 'authors' string
    const authorsArray = filteredMembers.map((member) => {
      const initials = `${member.user.first_name?.charAt(0)}.` || ""; // Use empty string as a default if first_name is null
      return `${initials} ${member.user.last_name || ""}`; // Use empty string as a default if last_name is null
    });

    const authorsDisplay = authorsArray.join(", ");

    return authorsDisplay;
  };

  const authorsDisplay = determineAuthors(members);

  const determineKeywords = () => {
    const info = baseInformation.keywords;
    if (info !== "" && info !== null)
      return baseInformation.keywords
        .split(", ")
        .map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
    else return ["None"];
  };

  const keywords = determineKeywords();

  const determineProjectLabel = () => {
    const year = baseInformation.year;
    const number = baseInformation.number;
    let stringified_number = "";
    if (number < 10) {
      stringified_number = "00" + String(number);
    } else if (number >= 10 && number < 100) {
      stringified_number = "0" + String(number);
    } else {
      stringified_number = String(number);
    }
    let type = baseInformation.kind;
    if (type === "student") {
      type = "STP";
    } else if (type === "external") {
      type = "EXT";
    } else if (type === "science") {
      type = "SP";
    } else {
      // Core Function
      type = "CF";
    }

    const label = `${type}-${year}-${stringified_number}`;
    return label;
  };

  const projectLabel = determineProjectLabel();

  const determineProjectYears = (baseInformation: IProjectData) => {
    const startDate = baseInformation.start_date || baseInformation.created_at;
    const endDate = baseInformation.end_date || null;

    let startYear, endYear;

    if (startDate instanceof Date) {
      startYear = startDate.getFullYear();
    } else {
      const parsedStartDate = new Date(startDate);
      startYear = parsedStartDate.getFullYear();
    }

    if (endDate instanceof Date) {
      endYear = endDate.getFullYear();
    } else if (endDate !== null) {
      const parsedEndDate = new Date(endDate);
      endYear = parsedEndDate.getFullYear();
    } else {
      endYear = null;
    }

    if (endYear !== null) {
      return `${startYear}-${endYear}`;
    } else {
      return `${startYear}-`;
    }
  };

  const projectYears = determineProjectYears(baseInformation);
  // division

  const noImage = useNoImage();
  const me = useUser();
  // const { leaderData, leaderLoading } = useTeamLead(baseInformation?.pk ? baseInformation.pk : baseInformation.id);

  const { layout } = useLayoutSwitcher();

  // const editorKey = selectedYear.toString() + colorMode;

  const kindDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
      { external: { label: "External", color: "gray.500" } },
      { science: { label: "Science", color: "green.500" } },
      { student: { label: "Student", color: "blue.500" } },
      { core_function: { label: "Core Function", color: "red.500" } },
    ];

  const getKindValue = (kind: string): { label: string; color: string } => {
    const matchedStatus = kindDictionary.find((item) => kind in item);
    return matchedStatus
      ? matchedStatus[kind]
      : { label: "Unknown Kind", color: "gray.500" };
  };

  const statusDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
      { new: { label: "New", color: "gray.500" } },
      { pending: { label: "Pending Project Plan", color: "yellow.500" } },
      { active: { label: "Active (Approved)", color: "green.500" } },
      { updating: { label: "Update Requested", color: "red.500" } },
      { closure_requested: { label: "Closure Requested", color: "red.500" } },
      { closing: { label: "Closure Pending Final Update", color: "red.500" } },
      { final_update: { label: "Final Update Requested", color: "red.500" } },
      { completed: { label: "Completed and Closed", color: "blue.500" } },
      { terminated: { label: "Terminated and Closed", color: "gray.800" } },
      { suspended: { label: "Suspended", color: "gray.500" } },
    ];

  const getStatusValue = (status: string): { label: string; color: string } => {
    const matchedStatus = statusDictionary.find((item) => status in item);
    return matchedStatus
      ? matchedStatus[status]
      : { label: "Unknown Status", color: "gray.500" };
  };

  const imageUrl = useServerImageUrl(baseInformation?.image?.file);

  const navigate = useNavigate();

  // const checkIfUserInTeam = (userPk: number | string, team: IProjectMember[]): boolean => {
  //     if (typeof userPk === 'string') {
  //         userPk = parseInt(userPk, 10);
  //     }

  //     // Use the some() method to check if userPk is equal to the pk of any member in the team
  //     return team.some(member => member.pk === userPk);
  // };
  // const [userInTeam, setUserInTeam] = useState(checkIfUserInTeam(me?.userData?.pk ? me?.userData?.pk : me?.userData?.id, members));

  const mePk = me?.userData?.pk
    ? Number(me?.userData?.pk)
    : Number(me?.userData?.id);
  const userInTeam = useCheckUserInTeam(mePk, members);
  const userIsLeader = useCheckUserIsTeamLeader(mePk, members);
  const userIsBaLead = mePk === baseInformation?.business_area?.leader;
  // useCheckUserIsBaLeader(mePk, baseInformation?.business_area?.pk ? baseInformation?.business_area?.pk : baseInformation?.business_area?.id );
  // useEffect(() => { console.log(mePk, userInTeam) })

  const [statusValue, setStatusValue] = useState<string>();
  const [statusColor, setStatusColor] = useState<string>();
  const [kindValue, setKindValue] = useState<string>();
  const [kindColor, setKindColor] = useState<string>();

  useEffect(() => {
    if (baseInformation) {
      const { label, color } = getStatusValue(baseInformation?.status);
      const { label: kindLabel, color: kindColor } = getKindValue(
        baseInformation?.kind
      );
      setStatusValue(label);
      setStatusColor(color);
      setKindValue(kindLabel);
      setKindColor(kindColor);
    }
  }, [baseInformation]);

  // useEffect(() => console.log(documents), [documents])

  const levelToString = (level: string) => {
    const levelDic = {
      pd: "Post-Doc",
      phd: "PhD",
      msc: "MSc",
      honours: "BSc Honours",
      fourth_year: "Fourth Year",
      third_year: "Third Year",
      undergrad: "Undergradate",
    };

    return levelDic[level];
  };

  return (
    <>
      {(me?.userData?.is_superuser ||
        userIsLeader ||
        userIsBaLead ||
        me?.userData?.business_area?.name === "Directorate") && (
          <>
            <EditProjectModal
              projectPk={
                baseInformation?.pk ? baseInformation.pk : baseInformation.id
              }
              details={details}
              currentImage={baseInformation?.image}
              currentBa={baseInformation?.business_area}
              currentService={details?.base?.service}
              currentDates={[
                baseInformation?.start_date,
                baseInformation?.end_date,
              ]}
              currentKeywords={[baseInformation?.keywords]}
              currentTitle={baseInformation?.title}
              currentAreas={location?.areas ? location.areas : []}
              currentDataCustodian={details?.base?.data_custodian?.id}
              isOpen={isEditModalOpen}
              onClose={onCloseEditModal}
              refetchData={refetchData}
            />
            <ProjectClosureModal
              projectPk={
                baseInformation?.pk ? baseInformation.pk : baseInformation.id
              }
              projectKind={baseInformation?.kind}
              isOpen={isClosureModalOpen}
              onClose={onCloseClosureModal}
              refetchData={refetchData}
              setToLastTab={setToLastTab}
            />
            <ProjectReopenModal
              projectPk={
                baseInformation?.pk ? baseInformation.pk : baseInformation.id
              }
              isOpen={isReopenModalOpen}
              onClose={onCloseReopenModal}
              refetchData={refetchData}
            />
            {baseInformation?.kind !== "external" &&
              baseInformation?.kind !== "student" && (
                <CreateProgressReportModal
                  projectPk={
                    baseInformation?.pk ? baseInformation.pk : baseInformation.id
                  }
                  documentKind={"progressreport"}
                  refetchData={refetchData}
                  isOpen={isCreateProgressReportModalOpen}
                  onClose={onCloseCreateProgressReportModal}
                />
              )}
            {baseInformation?.kind === "student" && (
              <CreateStudentReportModal
                projectPk={
                  baseInformation?.pk ? baseInformation.pk : baseInformation.id
                }
                documentKind={"studentreport"}
                refetchData={refetchData}
                isOpen={isCreateStudentReportModalOpen}
                onClose={onCloseCreateStudentReportModal}
              />
            )}
            <DeleteProjectModal
              projectPk={
                baseInformation?.pk ? baseInformation.pk : baseInformation.id
              }
              isOpen={isDeleteModalOpen}
              onClose={onCloseDeleteModal}
            />
          </>
        )}

      <Box
        minH={"100px"}
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
        color={colorMode === "light" ? "black" : "whiteAlpha.900"}
        rounded={"lg"}
        overflow={"hidden"}
      >
        {(me?.userData?.is_superuser ||
          userIsLeader ||
          userIsBaLead ||
          me?.userData?.business_area?.name === "Directorate") && (
            <Flex
              // justifyContent={"flex-end"}
              mt={6}
              width={"100%"}
              // right={10}
              pr={14}
              pl={6}
              zIndex={1}
              pos={"absolute"}
              flexDir={"column"}
            >
              {/* <Flex
                            // bg={"pink"}
                            justifyContent={"flex-end"}
                            right={0}
                        >
                            <Button
                                colorScheme="blue"
                                onClick={onOpenEditModal}
                                justifySelf={'flex-end'}
                            >
                                Edit
                            </Button>
                        </Flex>
                        <Flex
                            // bg={"pink"}
                            justifyContent={"flex-end"}
                            right={0}
                        >
                            <Button
                                colorScheme="red"
                                onClick={onOpenDeleteModal}
                            >
                                Delete
                            </Button>
                        </Flex> */}
            </Flex>
          )}
        <Grid
          p={4}
          pt={6}
          px={6}
          templateColumns={{
            base: "1fr", // Single column layout for small screens (mobile)
            lg: "minmax(300px, 4fr) 5fr", // Left column takes minimum 200px and can grow up to 4fr, right column takes 5fr
          }}
          gap={3}
        >
          <Box
            // bg={"red"}
            h={{
              // base: "250px",
              base: "380px",
              xl: "400px",
              "2xl": "600px",
            }}
            rounded={"xl"}
            overflow={"hidden"}
            position={"relative"}
          >
            <Box pos={"absolute"} right={3} top={3}>
              <Tag
                fontWeight={"bold"}
                color={"white"}
                ml={3}
                textAlign={"center"}
                justifyContent={"center"}
                p={"10px"}
                size={"lg"}
                bgColor={
                  baseInformation?.kind === "core_function"
                    ? "red.600"
                    : baseInformation?.kind === "science"
                      ? "green.500"
                      : baseInformation?.kind === "student"
                        ? "blue.400"
                        : "gray.400"
                }
              >
                {
                  baseInformation?.kind === "core_function"
                    ? "CF"
                    : baseInformation?.kind === "external"
                      ? "EXT"
                      : baseInformation?.kind === "science"
                        ? "SP"
                        : "STP" //Student
                }
                -{baseInformation?.year}-{baseInformation?.number}
              </Tag>
            </Box>
            <Image
              src={baseInformation?.image?.file ? imageUrl : noImage}
              objectFit={"cover"}
              w={"100%"}
              h={"100%"}
            />
            {/* <Box
                            pos={"absolute"}
                            right={0}
                            top={0}
                        >
                            <p>{baseInformation.status}</p>
                        </Box> */}
          </Box>

          <Box px={2} pos={"relative"}>
            <Box pb={3}>
              <Button
                fontSize="xl"
                fontWeight="bold"
                variant={"link"}
                color={colorMode === "light" ? "blue.500" : "blue.300"}
                whiteSpace={"normal"}
                textAlign={"left"}
                onClick={() =>
                  navigate(
                    `/projects/${baseInformation.pk !== undefined
                      ? baseInformation.pk
                      : baseInformation.id
                    }`
                  )
                }
              >
                {/* <Link
                                    to={
                                        `/projects/${baseInformation.pk !== undefined ?
                                            baseInformation.pk : baseInformation.id}`
                                    }
                                >
                                    {baseInformation.title}
                                </Link> */}
                {/* <SimpleDisplaySRTE

                                    data={baseInformation.title}
                                    displayData={baseInformation.title}
                                    displayArea="projectOverviewTitle"
                                /> */}

                <ExtractedHTMLTitle
                  htmlContent={`${baseInformation.title}`}
                  color={"#62a0f2"}
                  fontWeight={"bold"}
                  mb={"8px"}
                  fontSize={"22px"}
                  cursor={"pointer"}
                  _hover={{
                    textDecoration: "underline",
                  }}
                />
              </Button>

              <Text
                mt={2}
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                fontSize={"sm"}
              >
                {authorsDisplay}
              </Text>
            </Box>

            {/*  */}
            <Flex alignItems="center" pb={3}>
              <Box fontSize="22px" mr={3}>
                <GrStatusInfo />
              </Box>
              <Flex>
                <Tag
                  size={"sm"}
                  textAlign={"center"}
                  justifyContent={"center"}
                  p={"10px"}
                  bgColor={kindColor}
                  color={"white"}
                >
                  {kindValue}
                </Tag>
                <Tag
                  ml={3}
                  size={"sm"}
                  textAlign={"center"}
                  justifyContent={"center"}
                  p={"10px"}
                  bgColor={statusColor}
                  color={"white"}
                >
                  {statusValue}
                </Tag>
              </Flex>
            </Flex>

            {baseInformation?.business_area && (
              <Flex alignItems="center" pb={3}>
                <Box fontSize="22px" mr={3}>
                  <MdBusinessCenter />
                </Box>
                <Flex>
                  <Tag
                    size={"sm"}
                    textAlign={"center"}
                    justifyContent={"center"}
                    p={"10px"}
                    bgColor={colorMode === "light" ? "blue.500" : "blue.700"}
                    color={"white"}
                  >
                    {baseInformation?.business_area?.name}{" "}
                    {baseInformation?.business_area?.division?.slug
                      ? `(${baseInformation?.business_area?.division?.slug})`
                      : `(${baseInformation?.business_area?.division?.name})`}
                  </Tag>
                </Flex>
              </Flex>
            )}

            {baseInformation?.kind === "student" ? (
              <Grid
                w={"100%"}
                gridTemplateColumns={"repeat(1, 1fr)"}
                gridGap={4}
                pb={4}
              >
                <Flex alignItems="center">
                  <Box fontSize="22px">
                    <CgOrganisation />
                  </Box>
                  <Text ml={3}>
                    {(details?.student as IStudentProjectDetails)?.organisation
                      ? `${(
                        details?.student as IStudentProjectDetails
                      )?.organisation[0]?.toUpperCase()}${(
                        details?.student as IStudentProjectDetails
                      )?.organisation.slice(1)}`
                      : "No organisation listed"}
                  </Text>
                </Flex>
                <Flex alignItems="center">
                  <Box fontSize="22px">
                    <FaGraduationCap />
                  </Box>
                  <Text ml={3}>
                    {(details?.student as IStudentProjectDetails)?.level
                      ? levelToString(
                        (details?.student as IStudentProjectDetails)?.level
                      )
                      : "No level selected"}
                  </Text>
                </Flex>
              </Grid>
            ) : null}

            {baseInformation?.kind === "external" ? (
              <Grid
                w={"100%"}
                gridTemplateColumns={"repeat(1, 1fr)"}
                gridGap={4}
                pb={3}
              >
                <Flex alignItems="center">
                  <Box fontSize="22px">
                    <VscOrganization />
                  </Box>
                  <Text ml={3}>
                    {(details?.external as IExternalProjectDetails)
                      ?.collaboration_with
                      ? `${(details?.external as IExternalProjectDetails)
                        ?.collaboration_with
                      }`
                      : null}
                  </Text>
                </Flex>

                <Flex alignItems="center">
                  <Box fontSize="22px">
                    <FaSackDollar />
                  </Box>
                  <Text ml={3}>
                    {(details?.external as IExternalProjectDetails)?.budget
                      ? `${(details?.external as IExternalProjectDetails)?.budget
                      }`
                      : null}
                  </Text>
                </Flex>
              </Grid>
            ) : null}

            <Box pt={2} pb={5} display="flex" alignItems="center">
              <Box fontSize="22px">
                <AiFillCalendar />
              </Box>
              <Grid
                ml={3}
                templateColumns={{
                  base: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(1, 1fr)",
                  lg: "repeat(1, 1fr)",
                  xl: "repeat(1, 1fr)",
                }}
                gridTemplateRows={"28px"}
                gap={4}
              >
                <Tag
                  size={"sm"}
                  textAlign={"center"}
                  justifyContent={"center"}
                  p={"10px"}
                  bgColor={colorMode === "light" ? "gray.200" : "gray.800"}
                  color={colorMode === "light" ? "black" : "white"}
                >
                  {projectYears}
                </Tag>
              </Grid>
            </Box>

            {/* Rest of the project details */}

            <Box
              // pb={4}
              display="flex"
            // alignItems="center"
            >
              <Box fontSize="22px" pt={4}>
                <AiFillTag />
              </Box>

              <Grid
                ml={3}
                templateColumns={
                  layout === "traditional"
                    ? {
                      base: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(2, 1fr)",
                      "1200px": "repeat(3, 1fr)",
                      xl: "repeat(3, 1fr)",
                      "2xl": "repeat(4, 1fr)",
                    }
                    : {
                      base: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(5, 1fr)",
                    }
                }
                // gridTemplateRows={"28px"}
                gap={4}
              >
                {keywords?.map((tag, index) => (
                  <Tag
                    height={"100%"}
                    size={"sm"}
                    key={index}
                    textAlign={"center"}
                    justifyContent={"center"}
                    // p={"10px"}
                    minH={"50px"}
                    bgColor={colorMode === "light" ? "gray.200" : "gray.800"}
                    color={colorMode === "light" ? "black" : "white"}
                    style={{ flex: "1" }} // Make each tag expand to fill available space
                  >
                    {tag}
                  </Tag>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Flex
          // justifyContent={"flex-end"}
          right={0}
          zIndex={-1}
          px={6}
        //   gridTemplateColumns={"repeat(2, 1fr)"}
        >
          {me?.userData?.is_superuser ||
            userIsLeader ||
            userIsBaLead ||
            me?.userData?.business_area?.name === "Directorate" ? (
            <Flex
            //   justifyContent={"space-between"}
            // flex={1}
            >
              <Menu>
                <MenuButton
                  px={2}
                  py={2}
                  transition="all 0.2s"
                  rounded={4}
                  borderRadius="md"
                  borderWidth="1px"
                  _hover={{ bg: "blue.400" }}
                  _expanded={{ bg: "blue.400" }}
                  _focus={{ boxShadow: "outline" }}
                  // mr={4}
                  bg={"blue.500"}
                  color={"white"}
                  fontSize={"medium"}
                >
                  {/* <Flex alignItems={"center"} justifyContent={"center"}
                                            zIndex={
                                                -1}
                                        > */}


                  <Center>
                    <Box mr={2}>
                      <IoMdSettings />
                    </Box>
                    <Text>Edit Project</Text>
                    <Box ml={2}>
                      <BsCaretDownFill />
                    </Box>
                  </Center>


                  {/* <MdMoreVert /> */}
                  {/* </Flex> */}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={onOpenEditModal}>
                    <Flex
                      alignItems={"center"}
                    // color={"red"}
                    >
                      <Box mr={2}>
                        <FaEdit />
                      </Box>
                      <Box>
                        <Text>Edit</Text>
                      </Box>
                    </Flex>
                  </MenuItem>
                  {baseInformation?.kind === "student" && (
                    <MenuItem onClick={onOpenCreateStudentReportModal}>
                      <Flex
                        alignItems={"center"}
                      // color={"red"}
                      >
                        <Box mr={2}>
                          <FaLockOpen />
                        </Box>
                        <Box>
                          <Text>{"Create Student Report"}</Text>
                        </Box>
                      </Flex>
                    </MenuItem>
                  )}

                  {baseInformation?.kind !== "student" &&
                    baseInformation?.kind !== "external" && (
                      <MenuItem
                        onClick={onOpenCreateProgressReportModal}
                        isDisabled={
                          (documents.concept_plan && !documents?.concept_plan?.document
                            ?.directorate_approval_granted) ||
                          !documents?.project_plan?.document
                            ?.directorate_approval_granted
                        }
                      >
                        <Flex
                          alignItems={"center"}
                        // color={"red"}
                        >
                          <Box mr={2}>
                            <IoCreate />
                          </Box>
                          <Box>
                            <Text>{"Create Progress Report"}</Text>
                          </Box>
                        </Flex>
                      </MenuItem>
                    )}
                  <MenuItem
                    onClick={
                      documents?.project_closure?.document
                        ? onOpenReopenModal
                        : onOpenClosureModal
                    }
                  >
                    <Flex
                      alignItems={"center"}
                    // color={"red"}
                    >
                      <Box mr={2}>
                        {documents?.project_closure?.document ? (
                          <FaLockOpen />
                        ) : (
                          <FaLock />
                        )}
                      </Box>
                      <Box>
                        <Text>
                          {documents?.project_closure?.document
                            ? "Reopen Project"
                            : "Close Project"}
                          {/* Close Project */}
                        </Text>
                      </Box>
                    </Flex>
                  </MenuItem>
                  {me?.userData?.is_superuser ? (
                    <MenuItem onClick={onOpenDeleteModal}>
                      <Flex
                        alignItems={"center"}
                      // color={"red"}
                      >
                        <Box mr={2}>
                          <FaTrash />
                        </Box>
                        <Box>
                          <Text>Delete</Text>
                        </Box>
                      </Flex>
                    </MenuItem>
                  ) : null}
                </MenuList>
              </Menu>
            </Flex>
          ) : null}

          <Flex
            pb={0}
            alignItems={"center"}
            justifyContent={"flex-end"}
            flex={1}
          >
            <Text
              color={colorMode === "dark" ? "blue.200" : "blue.400"}
              fontWeight={"bold"}
              cursor={"pointer"}
              _hover={{
                color: colorMode === "dark" ? "blue.100" : "blue.300",
                textDecoration: "underline",
              }}
              onClick={() => {
                window.open("https://data.dbca.wa.gov.au/", "_blank");
              }}
            >
              Review datasets tagged with {projectLabel}
            </Text>
            <Box
              mt={1}
              ml={1.5}
              color={colorMode === "dark" ? "blue.200" : "blue.400"}
              alignItems={"center"}
              alignContent={"center"}
            >
              <HiOutlineExternalLink />
            </Box>
          </Flex>
        </Flex>

        {/* Description and Edit Project Details */}
        <Box p={6} pt={0}>
          {/* <Box
                        pb={2}
                    >
                        {baseInformation?.tagline
                            ? <Text><b>Tagline:</b> {baseInformation.tagline}</Text>
                            : <Text><b>Tagline:</b> This project has no tagline</Text>
                        }
                    </Box> */}
          <Box mt={4}>
            {/* {baseInformation?.description
                            ? <Text><b>Description:</b> {baseInformation.description}</Text>
                            : <Text><b>Description:</b> This project has no description</Text>} */}

            {/* <TestRichTextEditor

                        /> */}

            {(details?.external as IExternalProjectDetails)?.aims ? (
              <>
                <RichTextEditor
                  // wordLimit={500}
                  limitCanBePassed={false}
                  canEdit={userInTeam || userIsLeader || userIsBaLead || me?.userData?.is_superuser}
                  editorType="ProjectDetail"
                  data={
                    (details?.external as IExternalProjectDetails)?.description
                  }
                  project_pk={baseInformation.id}
                  details_pk={
                    (details?.external as IExternalProjectDetails)?.id
                  }
                  section={"externalDescription"}
                  isUpdate={true}
                  titleTextSize={"20px"}
                  key={`externalDescription${colorMode}`} // Change the key to force a re-render
                />
                <RichTextEditor
                  // wordLimit={500}
                  limitCanBePassed={false}
                  canEdit={userInTeam || userIsLeader || userIsBaLead || me?.userData?.is_superuser}
                  editorType="ProjectDetail"
                  data={(details?.external as IExternalProjectDetails)?.aims}
                  details_pk={
                    (details?.external as IExternalProjectDetails)?.id
                  }
                  project_pk={baseInformation.id}
                  section={"externalAims"}
                  isUpdate={true}
                  titleTextSize={"20px"}
                  key={`externalAims${colorMode}`} // Change the key to force a re-render
                />
              </>
            ) : (
              <RichTextEditor
                // wordLimit={500}
                limitCanBePassed={false}
                canEdit={userInTeam || userIsLeader || userIsBaLead || me?.userData?.is_superuser}
                editorType="ProjectDetail"
                data={baseInformation.description}
                project_pk={baseInformation.id}
                section={"description"}
                isUpdate={true}
                titleTextSize={"20px"}
                key={`description${colorMode}`} // Change the key to force a re-render
              />
            )}
          </Box>

          <Flex pt={6} justifyContent={"right"}>
            <ProjectDetailEditModal
              projectType={
                baseInformation.kind === "student"
                  ? "Student Project"
                  : baseInformation.kind === "external"
                    ? "External Project"
                    : baseInformation.kind === "science"
                      ? "Science Project"
                      : "Core Function"
              }
              isOpen={isEditProjectDetailModalOpen}
              onClose={onEditProjectDetailModalClose}
              icon={
                baseInformation.kind === "student"
                  ? RiBook3Fill
                  : baseInformation.kind === "external"
                    ? FaUserFriends
                    : baseInformation.kind === "science"
                      ? MdScience
                      : GiMaterialsScience
              }
              baseInformation={baseInformation}
              details={details}
            />

            {/* <ProjectDetailEditModal
                            onClose={onEditProjectDetailModalClose}
                            isOpen={isEditProjectDetailModalOpen}
                        /> */}
            {/* <Button
                            bg={
                                colorMode === "light" ? "green.500" : "green.600"
                            }
                            color={"white"}
                            _hover={

                                {
                                    bg: colorMode === "light" ? "green.400" : "green.500"
                                }
                            }
                            leftIcon={<AiFillEdit />}
                            onClick={onEditProjectDetailModalOpen}>
                            Edit Project Details
                        </Button> */}
          </Flex>
        </Box>
      </Box>
    </>
  );
};
