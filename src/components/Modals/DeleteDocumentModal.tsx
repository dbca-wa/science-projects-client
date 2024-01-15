import {
  Text,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useToast,
  useColorMode,
  UnorderedList,
  ListItem,
  FormControl,
  InputGroup,
  Input,
  ModalFooter,
  Grid,
  Button,
} from "@chakra-ui/react";
import {
  IDeleteDocument,
  ISimplePkProp,
  deleteDocumentCall,
  deleteProjectCall,
} from "../../lib/api";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";
import { useGetStudentReportAvailableReportYears } from "../../lib/hooks/useGetStudentReportAvailableReportYears";
import { useGetProgressReportAvailableReportYears } from "../../lib/hooks/useGetProgressReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentPk: string | number;
  documentKind:
    | "conceptplan"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const DeleteDocumentModal = ({
  projectPk,
  documentPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
  setToLastTab,
}: Props) => {
  const navigate = useNavigate();
  const {
    availableProgressReportYearsLoading,
    availableProgressReportYearsData,
    refetchProgressYears,
  } = useGetProgressReportAvailableReportYears(Number(projectPk));
  const {
    availableStudentYearsLoading,
    availableStudentYearsData,
    refetchStudentYears,
  } = useGetStudentReportAvailableReportYears(Number(projectPk));

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteDocumentMutation = useMutation(deleteDocumentCall, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Deleting Document`,
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Document Deleted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        refetchStudentYears(() => {
          reset();
        });
        refetchProgressYears(() => {
          reset();
        });
        onDeleteSuccess && onDeleteSuccess();
      }
      // onClose();

      setTimeout(async () => {
        // if (setIsAnimating) {
        //     setIsAnimating(false)
        // }
        queryClient.invalidateQueries(["projects", projectPk]);
        await refetchData();
        onClose();
        console.log("deleting");
        setToLastTab();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not delete document`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const deleteDocument = (formData: IDeleteDocument) => {
    // console.log(formData);
    deleteDocumentMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit, reset, watch } = useForm<IDeleteDocument>();

  const projPk = watch("projectPk");
  // useEffect(() => console.log(projPk, projectPk), [projectPk, projPk]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(deleteDocument)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Delete Document?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"semibold"} fontSize={"xl"}>
                Are you sure you want to delete this document? There's no
                turning back.
              </Text>
            </Center>
            <Center mt={8}>
              <UnorderedList>
                <ListItem>
                  All fields for this document will be cleared
                </ListItem>
                <ListItem>The data will no longer be on the system</ListItem>
                <ListItem>
                  If you are recreating the document, you will need to go
                  through the approvals process again
                </ListItem>
              </UnorderedList>
            </Center>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("projectPk", {
                    required: true,
                    value: Number(projectPk),
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("documentPk", {
                    required: true,
                    value: Number(documentPk),
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("documentKind", {
                    required: true,
                    value: documentKind,
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <Center mt={2} p={5} pb={3}>
              <Text
                fontWeight={"bold"}
                color={"red.400"}
                textDecoration={"underline"}
              >
                This is irreversible.
              </Text>
            </Center>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                isLoading={deleteDocumentMutation.isLoading}
                type="submit"
                ml={3}
              >
                Delete
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
