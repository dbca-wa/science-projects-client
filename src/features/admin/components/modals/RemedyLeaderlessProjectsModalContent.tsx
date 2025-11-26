import { remedyLeaderlessProjects } from "@/features/admin/services/admin.service";
import type { IProjectData } from "@/shared/types";
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Text,
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

export const RemedyLeaderlessProjectsModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const mutation = useMutation({
    mutationFn: remedyLeaderlessProjects,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Attempting to remedy leaderless Projects",
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Complete`,
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
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
    mutation.mutate({ projects: projects?.map((p) => p.pk) });
  };

  return (
    <>
      <Box>
        <List>
          <ListItem>- All leaderless projects will be affected</ListItem>
          <ListItem>
            - The function will check which member has the is_leader property
            set to true
          </ListItem>
          <ListItem>- This user will get the Project Lead tag</ListItem>
          <ListItem>
            - This will weed out the remaining leaderless projects as they will
            not have the is_leader property anywhere
          </ListItem>
        </List>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          Caution: This will update all projects with members but no leader tag.
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
            >
              Remedy
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
