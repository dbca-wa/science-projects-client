// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import {
  Text,
  Image,
  Button,
  Center,
  Flex,
  FormControl,
  Grid,
  Input,
  InputGroup,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UnorderedList,
  useToast,
  ToastId,
  useColorMode,
  Checkbox,
  Box,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  ISimplePkProp,
  ISpecialEndorsement,
  deleteProjectCall,
  seekEndorsementAndSave,
} from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";

interface Props {
  projectPlanPk: number;
  bmEndorsementRequired: boolean;
  bmEndorsementProvided: boolean;
  aecEndorsementRequired: boolean;
  herbariumEndorsementRequired: boolean;
  aecEndorsementProvided: boolean;
  herbariumEndorsementProvided: boolean;
  aecPDFFile: File;
  isOpen: boolean;
  onClose: () => void;
  refetchEndorsements: () => void;
}

export const SeekEndorsementModal = ({
  projectPlanPk,
  bmEndorsementRequired,
  bmEndorsementProvided,
  herbariumEndorsementRequired,
  herbariumEndorsementProvided,
  aecEndorsementRequired,
  aecEndorsementProvided,
  aecPDFFile,
  isOpen,
  onClose,
  refetchEndorsements,
}: Props) => {
  const navigate = useNavigate();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  const [shouldSendEmails, setShouldSendEmails] = useState(false);
  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const seekEndorsementAndSaveMutation = useMutation(seekEndorsementAndSave, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: shouldSendEmails ? `Sending Emails` : `Updating Endorsements`,
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: shouldSendEmails
            ? `Emails Sent`
            : `Updated Endorsements`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        refetchEndorsements();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: shouldSendEmails
            ? `Could Not Send Emails`
            : `Could Not Update Endorsements`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  // useEffect(() => console.log(errors));

  const seekEndorsementAndSaveFunc = (formData: ISpecialEndorsement) => {
    // console.log(formData);
    seekEndorsementAndSaveMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ISpecialEndorsement>();

  // const projPlanPk = watch('projectPlanPk');
  // const aecPDFFile = watch('aecPDFFile');

  // useEffect(() => {
  //     console.log({
  //         projPlanPk,
  //         bmEndorsementRequired, bmEndorsementProvided,
  //         herbariumEndorsementRequired, herbariumEndorsementProvided,
  //         aecEndorsementRequired, aecEndorsementProvided, aecPDFFile,
  //     });
  // })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <Flex
      // as={"form"}
      // onSubmit={handleSubmit(seekEndorsementAndSaveFunc)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Save Endorsements</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box mt={2}>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                {
                  // AEC not required or AEC required and given
                  (aecEndorsementRequired === false ||
                    (aecEndorsementRequired === true &&
                      aecEndorsementProvided === true)) &&
                  // Herb not required or herb required and given
                  (herbariumEndorsementRequired === false ||
                    (herbariumEndorsementRequired === true &&
                      herbariumEndorsementProvided === true)) &&
                  // Bio not required or bio required and given
                  (bmEndorsementRequired === false ||
                    (bmEndorsementRequired === true &&
                      bmEndorsementProvided === true))
                    ? "As all required endorsements have been provided, no emails are necessary. You may still save."
                    : "Also send notifications?"
                }
              </Text>
              <Flex>
                <Checkbox
                  mt={4}
                  isChecked={shouldSendEmails}
                  onChange={() => setShouldSendEmails(!shouldSendEmails)}
                  isDisabled={
                    (!aecEndorsementRequired ||
                      (aecEndorsementRequired && aecEndorsementProvided)) &&
                    (!herbariumEndorsementRequired ||
                      (herbariumEndorsementRequired &&
                        herbariumEndorsementProvided)) &&
                    (!bmEndorsementRequired ||
                      (bmEndorsementRequired && bmEndorsementProvided))
                  }
                >
                  Send Notifications
                </Checkbox>
              </Flex>
            </Box>
            {shouldSendEmails ? (
              <Center mt={8}>
                <UnorderedList>
                  {/* IF BM endorsement required and not provided */}
                  {bmEndorsementRequired === true &&
                    bmEndorsementProvided === false && (
                      <ListItem color={"blue.400"}>
                        As Biometrician endorsement is marked as required but it
                        has yet to be provided, an email will be sent to
                        Biometricians to approve or reject this plan
                      </ListItem>
                    )}
                  {/* ELSE where DME not required */}
                  {bmEndorsementRequired === false && (
                    <ListItem color={"gray.400"}>
                      As Biometrician endorsement is marked as not required, no
                      email will be sent to Biometricians.
                    </ListItem>
                  )}

                  {/* IF involves plants */}
                  {/* AND HC endorsement required */}
                  {herbariumEndorsementRequired === true &&
                    herbariumEndorsementProvided === false && (
                      <ListItem color={"blue.400"}>
                        As Herbarium Curator endorsement is required but it has
                        yet to be provided, an email will be sent to Herbarium
                        Curators to approve or reject this plan
                      </ListItem>
                    )}

                  {/* ELSE where HC endorsement not required */}
                  {herbariumEndorsementRequired === false && (
                    <ListItem color={"gray.400"}>
                      As Herbarium Curator endorsement is marked as not
                      required, no email will be sent to Herbarium Curators
                    </ListItem>
                  )}

                  {/* IF involves animals */}
                  {/* AND AEC endorsement required and not provided */}
                  {aecEndorsementRequired === true &&
                    aecEndorsementProvided === false && (
                      <ListItem color={"blue.400"}>
                        As Animal Ethics Committee endorsement is marked as
                        required but it has yet to be provided, an email will be
                        sent to Animal Ethics Committee approvers to approve or
                        reject this plan
                      </ListItem>
                    )}
                  {/* ELSE where AEC endorsement not required */}
                  {aecEndorsementRequired === false && (
                    <ListItem color={"gray.400"}>
                      As Animal Ethics Committee endorsement is marked as not
                      required, no email will be sent to Animal Ethics Committee
                      approvers
                    </ListItem>
                  )}
                </UnorderedList>
              </Center>
            ) : null}

            {/* <FormControl>
                            <InputGroup>
                                <Input type="hidden" {...register("projectPlanPk", { required: true, value: Number(projectPlanPk) })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("aecEndorsementRequired", { required: true, value: aecEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("aecEndorsementProvided", { required: true, value: aecEndorsementProvided })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("herbariumEndorsementRequired", { required: true, value: herbariumEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("herbariumEndorsementProvided", { required: true, value: herbariumEndorsementProvided })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("bmEndorsementRequired", { required: true, value: bmEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("bmEndorsementProvided", { required: true, value: bmEndorsementProvided })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("aecPDFFile", { required: false, value: uploadedPDF })} readOnly />
                            </InputGroup>
                        </FormControl> */}

            {aecPDFFile ? (
              <Box mt={8}>
                <Text color={"green.500"}>
                  You are uploading the following file to provide AEC approval:
                </Text>
                <Flex mt={6} minH={"40px"} alignItems="center">
                  <Box>
                    <Image maxH={"40px"} src={"/pdf2.png"} />
                  </Box>
                  <Box
                    ml={4}
                    display="flex"
                    flex={1}
                    minH={"40px"}
                    // bg={"blue"}
                    alignItems="center"
                  >
                    <Text
                      color={colorMode === "light" ? "gray.800" : "gray.300"}
                    >
                      {aecPDFFile.name}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ) : null}
            {/* {errors ?
                            <Box
                                mt={8}
                            >
                                <Text>Errors:</Text>
                                {Object.keys(errors).length > 0 && (
                                    <div>
                                        <p>Errors:</p>
                                        <ul>
                                            {Object.entries(errors).map(([fieldName, error]) => (
                                                <li key={fieldName}>
                                                    <strong>{fieldName}:</strong> {error?.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {errors.bmEndorsementRequired && (
                                    <FormErrorMessage>{errors.bmEndorsementRequired.message}</FormErrorMessage>
                                )}
                                {errors.bmEndorsementProvided && (
                                    <FormErrorMessage>{errors.bmEndorsementProvided.message}</FormErrorMessage>
                                )}
                                {errors.herbariumEndorsementRequired && (
                                    <FormErrorMessage>{errors.herbariumEndorsementRequired.message}</FormErrorMessage>
                                )}
                                {errors.herbariumEndorsementProvided && (
                                    <FormErrorMessage>{errors.herbariumEndorsementProvided.message}</FormErrorMessage>
                                )}
                                {errors.aecEndorsementRequired && (
                                    <FormErrorMessage>{errors.aecEndorsementRequired.message}</FormErrorMessage>
                                )}
                                {errors.aecEndorsementProvided && (
                                    <FormErrorMessage>{errors.aecEndorsementProvided.message}</FormErrorMessage>
                                )}
                                {errors.aecPDFFile && (
                                    <FormErrorMessage>{errors.aecPDFFile.message}</FormErrorMessage>
                                )}
                                {errors.projectPlanPk && (
                                    <FormErrorMessage>{errors.projectPlanPk.message}</FormErrorMessage>
                                )}
                                {errors.shouldSendEmails && (
                                    <FormErrorMessage>{errors.shouldSendEmails.message}</FormErrorMessage>
                                )}
                            </Box>
                            : null} */}
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>

              <Button
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                isLoading={seekEndorsementAndSaveMutation.isLoading}
                // type="submit"
                ml={3}
                isDisabled={
                  shouldSendEmails &&
                  (aecEndorsementRequired === false ||
                    (aecEndorsementRequired === true &&
                      aecEndorsementProvided === true)) &&
                  (herbariumEndorsementRequired === false ||
                    (herbariumEndorsementRequired === true &&
                      herbariumEndorsementProvided === true)) &&
                  (bmEndorsementRequired === false ||
                    (bmEndorsementRequired === true &&
                      bmEndorsementProvided === true))
                }
                onClick={() => {
                  aecPDFFile !== undefined
                    ? seekEndorsementAndSaveFunc({
                        aecEndorsementRequired,
                        aecEndorsementProvided,
                        aecPDFFile,
                        herbariumEndorsementRequired,
                        herbariumEndorsementProvided,
                        bmEndorsementRequired,
                        bmEndorsementProvided,
                        shouldSendEmails,
                        projectPlanPk,
                      })
                    : seekEndorsementAndSaveFunc({
                        aecEndorsementRequired,
                        aecEndorsementProvided,
                        herbariumEndorsementRequired,
                        herbariumEndorsementProvided,
                        bmEndorsementRequired,
                        bmEndorsementProvided,
                        shouldSendEmails,
                        projectPlanPk,
                      });
                }}
              >
                {shouldSendEmails ? `Save and Send Emails` : `Save`}
              </Button>
            </Grid>
            {}
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
