import { remedyExternallyLedProjects } from "@/lib/api";
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

export const RemedyExternallyLedProjectsModalContent = ({
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
    mutationFn: remedyExternallyLedProjects,
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
          <ListItem>- All externally led projects will be affected</ListItem>
          <ListItem>
            - The function will check memberships where an external leader is
            set
          </ListItem>
          <ListItem>
            - The dbca staff member who created the first document will get the
            leader status (if a staff member exists/if they belong to the
            project/if a document exists)
          </ListItem>
          <ListItem>
            - This will weed out the remaining external projects as they will
            have only external members of their documents created by a member
            outside of the project
          </ListItem>
        </List>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          Caution: This will update all externally led projects.
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
