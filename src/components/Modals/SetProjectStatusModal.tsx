import { ProjectStatus } from "@/types";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { IoIosCreate } from "react-icons/io";
import { ISetProjectStatusProps, setProjectStatus } from "../../lib/api";

interface Props {
  projectPk: string | number;
  refetchData?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onFunctionSuccess?: () => void;
}

export const SetProjectStatusModal = ({
  projectPk,
  refetchData,
  isOpen,
  onClose,
  onFunctionSuccess,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const setProjectStatusMutation = useMutation({
    mutationFn: setProjectStatus,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Setting Project Status`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project status updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        onFunctionSuccess?.();
      }

      setTimeout(async () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", projectPk],
        });
        queryClient.refetchQueries({ queryKey: ["projects", projectPk] });
        await refetchData?.();

        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not set project status`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSetProjectStatus = (formData: ISetProjectStatusProps) => {
    setProjectStatusMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const [statusData, setStatusData] = useState<ProjectStatus>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <Flex
        as={"form"}
        // onSubmit={handleSubmit(setAreas)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Set Project Areas</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  onChange={(e) =>
                    setStatusData(e.target.value as ProjectStatus)
                  }
                >
                  <option value={"new"}>New</option>
                  <option value={"pending"}>Pending</option>
                  <option value={"active"}>Active</option>
                  <option value={"updating"}>Update Requested</option>
                  <option value={"closure_requested"}>Closure Requested</option>
                  <option value={"completed"}>Completed</option>
                  <option value={"terminated"}>Terminated</option>
                  <option value={"suspended"}>Suspended</option>
                </Select>
              </FormControl>
              <Flex w={"100%"} justifyContent={"flex-end"} my={4}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  ml={3}
                  // type="submit"
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  rightIcon={<IoIosCreate />}
                  isDisabled={!projectPk || !statusData}
                  onClick={() =>
                    onSetProjectStatus({
                      projectId: Number(projectPk),
                      status: statusData,
                    })
                  }
                >
                  Set Status
                </Button>
              </Flex>
            </>
          </ModalBody>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
