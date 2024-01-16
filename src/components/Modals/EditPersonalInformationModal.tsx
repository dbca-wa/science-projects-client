// Modal component for editing a user's personal information

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorMode,
  Grid,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Select,
  InputLeftAddon,
  useToast,
  FormErrorMessage,
  ToastId,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import { GrMail } from "react-icons/gr";
import { GiGraduateCap } from "react-icons/gi";
import { AiFillPhone } from "react-icons/ai";
import { MdFax } from "react-icons/md";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  IPIUpdateVariables,
  IPIUpdateError,
  updatePersonalInformation,
  IPIUpdateSuccess,
  getPersonalInformation,
} from "../../lib/api";
import { IPersonalInformation } from "../../types";

interface IEditPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const EditPersonalInformationModal = ({
  isOpen,
  onClose,
  userId,
}: IEditPIModalProps) => {
  const { isLoading, data } = useQuery<IPersonalInformation>(
    ["personalInfo", userId],
    getPersonalInformation
  );

  useEffect(() => {
    if (!isLoading)
      console.log(
        `Phone: ${data?.phone}\nFax: ${data?.fax}\nTitle: ${data?.title}\nFirst: ${data?.first_name}\nLast: ${data?.last_name}\nEmail: ${data?.email}\n`
      );
  }, [data, isLoading]);

  const { colorMode } = useColorMode();

  const [hoveredTitle, setHoveredTitle] = useState(false);
  const titleBorderColor = `${
    colorMode === "light"
      ? hoveredTitle
        ? "blackAlpha.300"
        : "blackAlpha.200"
      : hoveredTitle
      ? "whiteAlpha.400"
      : "whiteAlpha.300"
  }`;

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  // // Regex for validity of phone variable
  const phoneValidationPattern = /^(\+)?[\d\s]+$/;

  // React Hook Form
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IPIUpdateVariables>();

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IPIUpdateSuccess,
    IPIUpdateError,
    IPIUpdateVariables
  >(updatePersonalInformation, {
    // Start of mutation handling
    onMutate: () => {
      addToast({
        title: "Updating personal information...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        duration: 3000,
      });
    },
    // Success handling based on API-file-declared interface
    onSuccess: () => {
      queryClient.refetchQueries([`personalInfo`, userId]);
      queryClient.refetchQueries([`me`]);

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Information Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // Close the modal
      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API-file-declared interface
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Update failed",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  // When submitting form - starts the mutation
  const onSubmit = ({ userPk, title, phone, fax }: IPIUpdateVariables) => {
    mutation.mutate({ userPk, title, phone, fax });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        <ModalHeader>Edit Personal Information</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={"form"} onSubmit={handleSubmit(onSubmit)}>
          {!isLoading && (
            <Grid gridColumnGap={8} gridTemplateColumns={"repeat(2, 1fr)"}>
              {/* Title */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel
                  onMouseEnter={() => setHoveredTitle(true)}
                  onMouseLeave={() => setHoveredTitle(false)}
                >
                  Title
                </FormLabel>

                <InputGroup>
                  <InputLeftAddon
                    left={0}
                    bg="transparent"
                    pl={2}
                    zIndex={1}
                    borderColor={titleBorderColor}
                    borderTopRightRadius={"none"}
                    borderBottomRightRadius={"none"}
                    borderRight={"none"}
                  >
                    <Icon as={GiGraduateCap} />
                  </InputLeftAddon>
                  <Select
                    placeholder={"Select a title"}
                    borderLeft={"none"}
                    borderTopLeftRadius={"none"}
                    borderBottomLeftRadius={"none"}
                    pl={"0.5px"}
                    borderLeftColor={"transparent"}
                    onMouseEnter={() => setHoveredTitle(true)}
                    onMouseLeave={() => setHoveredTitle(false)}
                    {...register("title", {
                      value: data?.title,
                    })}
                  >
                    <option value="dr">Dr.</option>
                    <option value="mr">Mr.</option>
                    <option value="mrs">Mrs.</option>
                    <option value="ms">Ms.</option>
                    <option value="master">Master</option>
                  </Select>
                </InputGroup>
                {errors.title && (
                  <FormErrorMessage>{errors.title.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Phone */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={AiFillPhone} />
                  </InputLeftElement>
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={"Enter a phone number"}
                    {...register("phone", {
                      // placeHolder: "Enter a phone number",
                      pattern: {
                        value: phoneValidationPattern,
                        message: "Invalid phone number",
                      },
                      value: data?.phone,
                    })}
                  />
                </InputGroup>
                {errors.phone && (
                  <FormErrorMessage>{errors.phone.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Fax */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Fax</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={MdFax} />
                  </InputLeftElement>
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={"Enter a fax number"}
                    {...register("fax", {
                      // placeHolder: "Enter a phone number",
                      pattern: {
                        value: phoneValidationPattern,
                        message: "Invalid fax number",
                      },
                      value: data?.fax,
                    })}
                  />
                </InputGroup>
                {errors.fax && (
                  <FormErrorMessage>{errors.fax.message}</FormErrorMessage>
                )}
              </FormControl>

              {/* Email */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={GrMail} />
                  </InputLeftElement>
                  <Input
                    autoComplete="off"
                    type="email"
                    placeholder={data?.email}
                    value={data?.email}
                    isDisabled={true}
                  />
                </InputGroup>
              </FormControl>

              {/* First Name */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>First Name</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={RiNumber1} />
                  </InputLeftElement>
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={data?.first_name}
                    value={data?.first_name}
                    isDisabled={true}
                  />
                </InputGroup>
              </FormControl>

              {/* Last Name */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Last Name</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={RiNumber2} />
                  </InputLeftElement>
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={data?.last_name}
                    value={data?.last_name}
                    isDisabled={true}
                  />
                </InputGroup>
              </FormControl>
            </Grid>
          )}

          {/* UserPk */}
          {/* Prefilled and hidden */}
          <FormControl my={2} mb={4} userSelect={"none"}>
            <InputGroup>
              <Input
                type="hidden"
                {...register("userPk", {
                  required: true,
                  value: userId,
                })}
                readOnly // Setting the input as read-only
              />
            </InputGroup>
            {/* {errors.userPk && (
                            <FormErrorMessage>{errors.userPk.message}</FormErrorMessage>
                        )} */}
          </FormControl>

          <ModalFooter>
            {/* <Flex mt={5} justifyContent="end"> */}
            <Button
              isLoading={mutation.isLoading}
              type="submit"
              bgColor={colorMode === "light" ? `green.500` : `green.600`}
              color={colorMode === "light" ? `white` : `whiteAlpha.900`}
              _hover={{
                bg: colorMode === "light" ? `green.600` : `green.400`,
                color: colorMode === "light" ? `white` : `white`,
              }}
              ml={3}
            >
              Update
            </Button>
            {/* </Flex> */}
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
