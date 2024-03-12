import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  Icon,
  Switch,
  Tag,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { IProjectPlan, IUserMe } from "../../../types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ISpecialEndorsement } from "../../../lib/api";
import { SeekEndorsementModal } from "../../Modals/SeekEndorsementModal";
import { SingleFileStateUpload } from "../../SingleFileStateUpload";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";

import { BsFilePdfFill } from "react-icons/bs";
// import { MdDeleteForever } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { DeletePDFEndorsementModal } from "@/components/Modals/DeletePDFEndorsementModal";


interface IEndorsementProps {
  document: IProjectPlan;
  userData: IUserMe;
  userIsLeader: boolean;
  refetchDocument: () => void;
}

export const ProjectPlanEndorsements = ({
  document,
  userData,
  refetchDocument,
}: IEndorsementProps) => {


  const { register, watch, setValue } = useForm<ISpecialEndorsement>();

  const setToggleFalseAndRemoveFileVisual = () => {
    setValue("aecEndorsementProvided", false);
    setUploadedPDF(null);
    setShouldSwitchBeChecked(false);
  }
  const { isOpen, onOpen, onClose } = useDisclosure();

  const aecEndReqValue = watch("aecEndorsementRequired");


  const aecEndProvidedValue = watch("aecEndorsementProvided");

  // const hcEndReqValue = watch("herbariumEndorsementRequired");
  // const bmEndRequiredValue = watch("bmEndorsementRequired");
  // const hcEndProvidedValue = watch("herbariumEndorsementProvided");
  // const bmEndProvidedValue = watch("bmEndorsementProvided");

  const baseApi = useApiEndpoint();

  const aecEndRequired: boolean =
    document?.endorsements?.ae_endorsement_required;

  const aecEndProvided: boolean =
    document?.endorsements?.ae_endorsement_provided;

  // const hcEndRequired: boolean =
  //   document?.endorsements?.hc_endorsement_required;

  // const hcEndProvided: boolean =
  //   document?.endorsements?.hc_endorsement_provided;

  // const bmEndProvided: boolean =
  //   document?.endorsements?.bm_endorsement_provided;
  // const bmEndRequired: boolean =
  //   document?.endorsements?.bm_endorsement_required;

  // const [userCanEditHCEndorsement, setUserCanEditHCEndorsement] =
  //   useState(false);
  // const [userCanEditBMEndorsement, setUserCanEditBMEndorsement] =
  //   useState(false);
  const [userCanEditAECEndorsement, setUserCanEditAECEndorsement] =
    useState(false);

  const { colorMode } = useColorMode();

  // useEffect(() => {
  //   if (userData?.is_superuser || userData?.is_herbarium_curator) {
  //     setUserCanEditHCEndorsement(true);
  //   } else {
  //     setUserCanEditHCEndorsement(false);
  //   }
  // }, [userData]);

  // useEffect(() => {
  //   if (userData?.is_superuser || userData?.is_biometrician) {
  //     setUserCanEditBMEndorsement(true);
  //   } else {
  //     setUserCanEditBMEndorsement(false);
  //   }
  // }, [userData]);

  useEffect(() => {
    if (userData?.is_superuser || userData?.is_aec) {
      setUserCanEditAECEndorsement(true);
    } else {
      setUserCanEditAECEndorsement(false);
    }
  }, [userData]);

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [isError, setIsError] = useState(false);

  const [shouldSwitchBeChecked, setShouldSwitchBeChecked] = useState<boolean>(
    (uploadedPDF && uploadedPDF.type === "application/pdf") ||
      document?.endorsements?.ae_endorsement_provided === true
      ? true
      : false
  );

  useEffect(() => {
    // console.log(uploadedPDF);
    if (uploadedPDF && uploadedPDF.type === "application/pdf") {
      setShouldSwitchBeChecked(true);
    }
  }, [uploadedPDF]);

  const [pdfAreaHovered, setPdfAreaHovered] = useState(false);

  const { isOpen: isDeletePDFEndorsementModalOpen, onOpen: onOpenDeletePDFEndorsementModal, onClose: onCloseDeletePDFEndorsementModal } = useDisclosure();

  return (
    <>
      <DeletePDFEndorsementModal
        projectPlanPk={document?.pk}
        isOpen={isDeletePDFEndorsementModalOpen}
        onClose={onCloseDeletePDFEndorsementModal}
        setToggle={setToggleFalseAndRemoveFileVisual}
        refetchEndorsements={refetchDocument}

      />
      <SeekEndorsementModal
        projectPlanPk={document?.pk}
        // bmEndorsementRequired={bmEndRequiredValue}
        // bmEndorsementProvided={bmEndProvidedValue}
        // herbariumEndorsementRequired={hcEndReqValue}
        // herbariumEndorsementProvided={hcEndProvidedValue}
        aecEndorsementRequired={aecEndReqValue}
        aecEndorsementProvided={shouldSwitchBeChecked}
        isOpen={isOpen}
        onClose={onClose}
        refetchEndorsements={refetchDocument}
        aecPDFFile={uploadedPDF}
      />
      <Box
        background={colorMode === "light" ? "gray.50" : "gray.700"}
        rounded={"lg"}
        p={4}
        w={"100%"}
        mb={6}
      >
        <Flex flexDir={"column"}>
          {/* Contents */}
          <Grid
            background={colorMode === "light" ? "gray.100" : "gray.700"}
            rounded={"lg"}
            p={6}
            w={"100%"}
          // gridRowGap={2}
          >
            {/* Title */}
            <Box mb={4}>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Endorsements
              </Text>
            </Box>

            {/* <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridRowGap={4}
              alignItems={"center"}
              userSelect={"none"}
              border={"1px solid"}
              borderColor={"gray.300"}
              p={4}
              rounded={"xl"}
              roundedTop={"xl"}
              // borderTop={0}
              roundedBottom={0}
            >
              <Flex alignItems={"center"} userSelect={"none"}>
                <Box flex={1}>
                  <Text fontWeight={"semibold"}>
                    Biometrician Endorsement Required?
                  </Text>
                </Box>
                <Checkbox
                  borderColor={"blue.500"}

                  defaultChecked={bmEndRequired}
                  mr={3}
                  {...register("bmEndorsementRequired", {
                    value: bmEndRequired,
                  })}
                />
              </Flex>

              <Flex alignItems={"center"} w={"100%"}>
                <Box flex={1}>
                  <Text
                    color={
                      bmEndRequiredValue
                        ? colorMode === "light"
                          ? "black"
                          : "white"
                        : "gray.500"
                    }
                  >
                    Biometrician's Endorsement
                  </Text>
                </Box>

                <Flex>
                  {!userCanEditBMEndorsement ? (
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        document?.endorsements?.bm_endorsement_provided === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {document?.endorsements?.bm_endorsement_provided === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  ) : (
                    <Switch
                      defaultChecked={
                        document?.endorsements?.bm_endorsement_provided === true
                      }
                      {...register("bmEndorsementProvided", {
                        value: bmEndProvided,
                      })}
                      isDisabled={!bmEndRequiredValue}
                    />
                  )}
                </Flex>
              </Flex>
            </Grid>

            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridRowGap={4}
              alignItems={"center"}
              userSelect={"none"}
              border={"1px solid"}
              borderColor={"gray.300"}
              p={4}
              rounded={"xl"}
              roundedTop={0}
              borderTop={0}
              roundedBottom={0}
            >
              <Flex>
                <Box flex={1}>
                  <Text fontWeight={"semibold"}>
                    Herbarium Curator's Endorsement Required?
                  </Text>
                </Box>
                <Checkbox
                  borderColor={"blue.500"}
                  defaultChecked={hcEndRequired}
                  mr={3}
                  // onChange={handleTogglePlantsInvolved}
                  {...register("herbariumEndorsementRequired", {
                    value: hcEndRequired,
                  })}
                />
              </Flex>
          
              <Flex alignItems={"center"}>
                <Box>
                  <Text
                    color={
                      hcEndReqValue
                        ? colorMode === "light"
                          ? "black"
                          : "white"
                        : "gray.500"
                    }
                  >
                    Herbarium Curator's Endorsement
                  </Text>
                </Box>
                <Flex flex={1} justifyContent={"flex-end"}>
                  {!userCanEditHCEndorsement ? (
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        document?.endorsements?.hc_endorsement_provided === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {document?.endorsements?.hc_endorsement_provided === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  ) : (
                    <Switch
                      defaultChecked={
                        document?.endorsements?.hc_endorsement_provided === true
                      }
                      {...register("herbariumEndorsementProvided", {
                        value: hcEndProvided,
                      })}
                      isDisabled={!hcEndReqValue}
                    />
                  )}
                </Flex>
              </Flex>
            </Grid> */}

            {/* Interaction with Animals */}
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridRowGap={4}
              alignItems={"center"}
              userSelect={"none"}
              border={"1px solid"}
              borderColor={"gray.300"}
              p={4}
              rounded={"xl"}
            // roundedTop={0}
            // borderTop={0}
            // roundedBottom={0}
            >
              <Flex
                // ml={8}
                // mt={2}
                w={"100%"}
              >
                <Box flex={1}>
                  <Text
                    fontWeight={"semibold"}

                  // color={involvesAnimalsValue ? "black" : "gray.500"}
                  >
                    Animal Ethics Committee Endorsement Required?
                  </Text>
                </Box>
                <Box
                  justifySelf={"flex-end"}
                  // flex={1}
                  alignItems={"center"}
                >
                  <Checkbox
                    borderColor={"blue.500"}

                    defaultChecked={aecEndRequired}
                    mr={3}
                    // onChange={handleTogglePlantsInvolved}
                    {...register("aecEndorsementRequired", {
                      value: aecEndRequired,
                    })}
                  />
                </Box>
              </Flex>
              <Flex
                alignItems={"center"}
              >
                <Box flex={1}>
                  <Text
                    color={
                      colorMode === "light"
                        ? aecEndReqValue
                          ? "black"
                          : "gray.500"
                        : aecEndReqValue
                          ? "white"
                          : "gray.500"
                    }
                  >
                    Animal Ethics Committee's Endorsement
                  </Text>
                </Box>
                <Flex>
                  {!userCanEditAECEndorsement ? (
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        document?.endorsements?.ae_endorsement_provided === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {document?.endorsements?.ae_endorsement_provided === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  ) : (
                    <Switch
                      isDisabled={true} // Disable direct toggling
                      defaultChecked={shouldSwitchBeChecked}
                      isChecked={shouldSwitchBeChecked}
                      {...register("aecEndorsementProvided", {
                        value: shouldSwitchBeChecked,
                      })}
                    />
                  )}
                </Flex>
              </Flex>
              {document?.endorsements?.aec_pdf?.file ? (
                <Flex mb={3}
                  onMouseOver={() => setPdfAreaHovered(true)}
                  onMouseLeave={() => setPdfAreaHovered(false)}>
                  <Box flex={1}>
                    <Text
                      color={
                        colorMode === "light"
                          ? aecEndReqValue
                            ? "black"
                            : "gray.500"
                          : aecEndReqValue
                            ? "white"
                            : "gray.500"
                      }
                    >
                      Current Approval PDF
                    </Text>
                  </Box>
                  <Flex
                    onMouseOver={() => setPdfAreaHovered(true)}
                    onMouseLeave={() => setPdfAreaHovered(false)}
                  >
                    {document?.endorsements?.aec_pdf?.file ? (
                      <Flex
                        justifyContent={"flex-end"}
                        onClick={() => {
                          window.open(
                            `${baseApi}${document?.endorsements?.aec_pdf?.file}`,
                            "_blank"
                          );
                        }}
                        _hover={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}

                      >
                        <Center
                          color={"red.500"}
                          // bg={"blue"}
                          mr={1}
                        >
                          <BsFilePdfFill />
                        </Center>
                        <Center

                        >
                          <Text
                            // variant={"link"}
                            color={
                              colorMode === "light" ? "blue.700" : "blue.400"
                            }
                          >
                            {document?.endorsements?.aec_pdf?.file
                              ? `${document.endorsements.aec_pdf.file
                                .split("/")
                                .pop()
                                .split(".")[0]
                              }.pdf`
                              : "No File"}
                            {/* {baseApi}{document?.endorsements?.aec_pdf?.file} */}
                          </Text>


                        </Center>

                      </Flex>
                    ) : null}
                  </Flex>
                  {document?.endorsements?.aec_pdf?.file && pdfAreaHovered && (
                    <Center
                      ml={6}
                      mr={4}
                      onClick={() => {
                        console.log("HI");
                        onOpenDeletePDFEndorsementModal();

                      }}

                    >
                      <Icon
                        _hover={{ boxSize: 10 }}
                        pos={"absolute"}
                        color={"red"}
                        as={TiDelete}
                        cursor={"pointer"}
                        boxSize={8}

                      />
                    </Center>
                  )}
                </Flex>
              ) : null}

              {userCanEditAECEndorsement && aecEndReqValue ? (
                <SingleFileStateUpload
                  fileType={"pdf"}
                  uploadedFile={uploadedPDF}
                  setUploadedFile={setUploadedPDF}
                  isError={isError}
                  setIsError={setIsError}
                  extraText={" to provide your endorsement or update the file"}
                />
              ) : null}

            </Grid>

            <Flex pt={4} justifyContent={"flex-end"}>
              <Button
                mx={1}
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }}
                onClick={onOpen}
                isDisabled={
                  // bmEndRequiredValue === undefined ||
                  // bmEndProvidedValue === undefined ||
                  // hcEndReqValue === undefined ||
                  // hcEndProvidedValue === undefined ||
                  aecEndReqValue === undefined ||
                  (aecEndProvided !== true && aecEndProvidedValue === undefined)
                }
              >
                Save
              </Button>
            </Flex>
          </Grid>
        </Flex>
      </Box>
    </>
  );
};
