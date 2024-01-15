import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  Input,
  Switch,
  Tag,
  Text,
  ToastId,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IProjectPlan, IUserData, IUserMe } from "../../../types";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ISpecialEndorsement } from "../../../lib/api";
import { SeekEndorsementModal } from "../../Modals/SeekEndorsementModal";
import { SingleFileStateUpload } from "../../SingleFileStateUpload";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";

import { BsFilePdfFill } from "react-icons/bs";

interface IEndorsementProps {
  document: IProjectPlan;
  userData: IUserMe;
  userIsLeader: boolean;
  refetchDocument: () => void;
}

export const ProjectPlanEndorsements = ({
  document,
  userData,
  userIsLeader,
  refetchDocument,
}: IEndorsementProps) => {
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<ISpecialEndorsement>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const hcEndReqValue = watch("herbariumEndorsementRequired");
  const aecEndReqValue = watch("aecEndorsementRequired");
  const bmEndRequiredValue = watch("bmEndorsementRequired");

  const hcEndProvidedValue = watch("herbariumEndorsementProvided");
  const aecEndProvidedValue = watch("aecEndorsementProvided");
  const bmEndProvidedValue = watch("bmEndorsementProvided");

  const baseApi = useApiEndpoint();

  // useEffect(
  //   () =>
  //     console.log({
  //       bmEndRequiredValue: bmEndRequiredValue,
  //       bmEndProvidedValue: bmEndProvidedValue,
  //       hcEndReqValue: hcEndReqValue,
  //       hcEndProvidedValue: hcEndProvidedValue,
  //       aecEndReqValue: aecEndReqValue,
  //       aecEndProvidedValue: aecEndProvidedValue,
  //       document,
  //     }),
  //   [
  //     bmEndRequiredValue,
  //     bmEndProvidedValue,
  //     aecEndReqValue,
  //     aecEndProvidedValue,
  //     hcEndReqValue,
  //     hcEndProvidedValue,
  //     document,
  //   ]
  // );

  // const [involvesDataCollection, setInvolvesDataCollection] = useState(true);

  // useEffect(() => {
  //     console.log(involvesAnimals)
  //     if (involvesAnimals === false) {
  //         setValue("aecEndorsementRequired", false);
  //         setValue("aecEndorsementProvided", false);
  //     }
  // }, [involvesAnimals])

  const [aecEndRequired, setAecEndRequired] = useState<boolean>(
    document?.endorsements?.ae_endorsement_required
  );
  const [hcEndRequired, setHcEndRequired] = useState<boolean>(
    document?.endorsements?.hc_endorsement_required
  );

  const [hcEndProvided, setHcEndProvided] = useState<boolean>(
    document?.endorsements?.hc_endorsement_provided
  );
  const [aecEndProvided, setAecEndProvided] = useState<boolean>(
    document?.endorsements?.ae_endorsement_provided
  );

  const [bmEndProvided, setBmEndProvided] = useState<boolean>(
    document?.endorsements?.bm_endorsement_provided
  );
  const [bmEndRequired, setBmEndRequired] = useState<boolean>(
    document?.endorsements?.bm_endorsement_required
  );

  const [userCanEditHCEndorsement, setUserCanEditHCEndorsement] =
    useState(false);
  const [userCanEditBMEndorsement, setUserCanEditBMEndorsement] =
    useState(false);
  const [userCanEditAECEndorsement, setUserCanEditAECEndorsement] =
    useState(false);

  const { colorMode } = useColorMode();

  useEffect(() => {
    if (userData?.is_superuser || userData?.is_herbarium_curator) {
      setUserCanEditHCEndorsement(true);
    } else {
      setUserCanEditHCEndorsement(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.is_superuser || userData?.is_biometrician) {
      setUserCanEditBMEndorsement(true);
    } else {
      setUserCanEditBMEndorsement(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.is_superuser || userData?.is_aec) {
      setUserCanEditAECEndorsement(true);
    } else {
      setUserCanEditAECEndorsement(false);
    }
  }, [userData]);

  // const [herbCuratorInteractable, setHerbCuratorInteractable] = useState(false);
  // const [aecInteractable, setAecInteractable] = useState(false);
  // const [bmInteractable, setBmInteractable] = useState(false);

  // const handleTogglePlantsInvolved = () => {
  //     setInvolvesPlants((prev) => !prev);
  // }

  // const handleToggleAnimalsInvolved = () => {
  //     setInvolvesAnimals((prev) => !prev);
  // }

  // useEffect(() => {
  //     if (aecEndRequired === true) {
  //         setAecInteractable(true)
  //     }
  //     else {
  //         setAecInteractable(false)
  //     }
  // }, [aecEndRequired])

  // useEffect(() => {
  //     if (hcEndRequired === true) {
  //         setHerbCuratorInteractable(true);
  //     }
  //     else {
  //         setHerbCuratorInteractable(false);
  //     }
  // }, [hcEndRequired])

  // useEffect(() => {
  //     if (bmEndRequired === true) {
  //         setBmInteractable(true);
  //     }
  //     else {
  //         setBmInteractable(false);
  //     }
  // }, [bmEndRequired])

  const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  // const endorsementMutation = useMutation(setEndorsement,
  //     {
  //         onMutate: () => {
  //             addToast({
  //                 status: "loading",
  //                 title: "Creating Task",
  //                 position: "top-right"
  //             })
  //         },
  //         onSuccess: (data) => {

  //             if (toastIdRef.current) {
  //                 toast.update(toastIdRef.current, {
  //                     title: 'Success',
  //                     description: `Task Created`,
  //                     status: 'success',
  //                     position: "top-right",
  //                     duration: 3000,
  //                     isClosable: true,
  //                 })
  //             }
  //             reset()
  //             // onClose()

  //             setTimeout(() => {

  //                 queryClient.invalidateQueries(["projects"]);

  //             }, 350)
  //         },
  //         onError: (error) => {
  //             if (toastIdRef.current) {
  //                 toast.update(toastIdRef.current, {
  //                     title: 'Could Not Create Task',
  //                     description: `${error}`,
  //                     status: 'error',
  //                     position: "top-right",
  //                     duration: 3000,
  //                     isClosable: true,
  //                 })
  //             }
  //         }

  //     })

  // const onSubmitUpdateEndorsement = (formData: ISpecialEndorsement) => {
  //     endorsementMutation.mutate(formData);
  // }

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

  return (
    <>
      <SeekEndorsementModal
        projectPlanPk={document?.pk}
        bmEndorsementRequired={bmEndRequiredValue}
        bmEndorsementProvided={bmEndProvidedValue}
        herbariumEndorsementRequired={hcEndReqValue}
        herbariumEndorsementProvided={hcEndProvidedValue}
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
                Involvement & Endorsements
              </Text>
            </Box>

            {/* Biometrician */}
            <Grid
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

            {/* Plant Specimen Collection */}
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
              {/* <Flex
                                alignItems={"center"}
                                userSelect={"none"}
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                    >
                                        Plant Specimen Collection
                                    </Text>
                                </Box>

                                <Checkbox
                                    defaultChecked={
                                        involvesPlants === true
                                    }
                                    mr={3}
                                    // isDisabled
                                    {...register('involvesPlants', { value: involvesPlants })}

                                />

                            </Flex> */}

              <Flex>
                <Box flex={1}>
                  <Text fontWeight={"semibold"}>
                    Herbarium Curator's Endorsement Required?
                  </Text>
                </Box>
                <Checkbox
                  defaultChecked={hcEndRequired}
                  mr={3}
                  // onChange={handleTogglePlantsInvolved}
                  {...register("herbariumEndorsementRequired", {
                    value: hcEndRequired,
                  })}
                />
              </Flex>
              {/* 

                            )
                        } */}
              {/* {
                            hcEndReqValue === true && ( */}
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
              {/* )
                        } */}
            </Grid>

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
              roundedTop={0}
              borderTop={0}
              // roundedBottom={0}
            >
              {/* {involvesAnimalsValue === true &&
                            ( */}
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
                    defaultChecked={aecEndRequired}
                    mr={3}
                    // onChange={handleTogglePlantsInvolved}
                    {...register("aecEndorsementRequired", {
                      value: aecEndRequired,
                    })}
                  />
                </Box>
              </Flex>
              {/* 
                            )} */}

              {/* {
                            aecEndReqValue === true && ( */}
              <Flex
                alignItems={"center"}
                // mb={3}
                // w={"100%"}
                // ml={8}
                // mt={2}
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
                    // null
                    // <Switch
                    //     isDisabled={!aecEndReqValue}
                    //     defaultChecked={
                    //         (document?.endorsements?.ae_endorsement_provided === true || (uploadedPDF)) ? true : false
                    //     }
                    //     // defaultChecked={document?.endorsements?.ae_endorsement_provided === true || aecEndProvided}
                    //     {...register('aecEndorsementProvided', { value: aecEndProvided })}
                    // />
                    // <Input
                    //     {...register('aecEndorsementProvided', { value: shouldSwitchBeChecked })}
                    //     type="hidden"
                    // />

                    <Switch
                      isDisabled={true} // Disable direct toggling
                      defaultChecked={shouldSwitchBeChecked}
                      isChecked={shouldSwitchBeChecked}
                      {...register("aecEndorsementProvided", {
                        value: shouldSwitchBeChecked,
                      })}
                    />
                    // shouldSwitchBeChecked === true ?
                    //     (<Switch
                    //         // isDisabled={true} // Disable direct toggling
                    //         defaultChecked={true}
                    //         {...register('aecEndorsementProvided', { value: true })}
                    //     />) :
                    //     (<Switch
                    //         // isDisabled={true} // Disable direct toggling
                    //         defaultChecked={false}
                    //         {...register('aecEndorsementProvided', { value: false })}
                    //     />)
                  )}
                </Flex>
              </Flex>
              {document?.endorsements?.aec_pdf?.file ? (
                <Flex mb={3}>
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
                  <Flex>
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
                        <Center>
                          <Text
                            // variant={"link"}
                            color={
                              colorMode === "light" ? "blue.700" : "blue.400"
                            }
                          >
                            {document?.endorsements?.aec_pdf?.file
                              ? `${
                                  document.endorsements.aec_pdf.file
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

              {/* )
                        } */}
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
                  bmEndRequiredValue === undefined ||
                  bmEndProvidedValue === undefined ||
                  hcEndReqValue === undefined ||
                  hcEndProvidedValue === undefined ||
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
