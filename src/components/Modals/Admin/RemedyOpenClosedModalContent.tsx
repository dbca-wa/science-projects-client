import { remedyOpenClosedProjects } from "@/lib/api";
import { IProjectData } from "@/types";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  List,
  ListItem,
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef, useState } from "react";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

type StatusOption = "active" | "suspended" | "completed" | "terminated";

const statusOptions: Array<{ value: StatusOption; label: string }> = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
  { value: "terminated", label: "Terminated" },
];

export const RemedyOpenClosedModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>("active");

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const mutation = useMutation({
    mutationFn: remedyOpenClosedProjects,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Attempting to remedy open closed projects to ${selectedStatus} status`,
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Successfully updated ${data.successful} project(s) to ${selectedStatus} status`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      refreshDataFn?.();
      onClose();
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Encountered an error",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onRemedy = () => {
    mutation.mutate({
      projects: projects?.map((p) => p.pk),
      status: selectedStatus,
    });
  };

  // Get description text based on selected status
  const getActionDescription = () => {
    if (selectedStatus === "active" || selectedStatus === "suspended") {
      return "The project closure documents will be deleted and projects will be set to the selected status";
    } else {
      return "The project closure documents will be kept and their intended outcome will be updated to match the selected status";
    }
  };

  const getClosureAction = () => {
    if (selectedStatus === "active" || selectedStatus === "suspended") {
      return "delete the project closures";
    } else {
      return "update the project closure intended outcomes";
    }
  };

  return (
    <>
      <Box>
        <FormControl mb={4}>
          <FormLabel>Target Status</FormLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StatusOption)}
            placeholder="Select status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <Box
          p={3}
          mb={4}
          bg={colorMode === "light" ? "blue.50" : "blue.900"}
          borderRadius="md"
          border="1px solid"
          borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
        >
          <Text
            fontSize="sm"
            color={colorMode === "light" ? "blue.700" : "blue.200"}
          >
            <strong>
              Action for{" "}
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label}{" "}
              status:
            </strong>
            <br />
            {getActionDescription()}
          </Text>
        </Box>

        <Text color={colorMode === "light" ? "red.500" : "red.300"} my={2}>
          Caution: All projects with an approved project closure that are in the
          open update requested state will be affected. This will set the
          project status to{" "}
          {statusOptions.find((opt) => opt.value === selectedStatus)?.label}{" "}
          status
        </Text>

        <Flex justifyContent={"flex-end"} py={4}>
          <Box>
            <Button
              bg={"green.500"}
              color={"white"}
              _hover={{
                bg: "green.400",
              }}
              onClick={onRemedy}
              isDisabled={!selectedStatus}
            >
              Remedy to{" "}
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label}
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
