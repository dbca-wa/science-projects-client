import { remedyMultipleLeaderProjects } from "@/lib/api/api";
import { IProjectData } from "@/types";
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

export const RemedyMultipleLeaderProjectsModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const mutation = useMutation({
    mutationFn: remedyMultipleLeaderProjects,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Attempting to remedy externally led Projects",
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
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
    mutation.mutate({ projects: projects?.map((p) => p.pk) });
  };

  return (
    <>
      <Box>
        <List>
          <ListItem>
            - All projects with multiple "Project Lead" roles will be affected
          </ListItem>
          <ListItem>
            - The function will check which member has the is_leader property
            set to true
          </ListItem>
          <ListItem>- This user will get the Project Lead tag</ListItem>
          <ListItem>
            - Other users will either get student, academic supervisor, science
            support or external collaborator roles, depending on the project
            type and whether they are staff
          </ListItem>
        </List>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          Caution: This will update all projects with multiple leader roles.
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
