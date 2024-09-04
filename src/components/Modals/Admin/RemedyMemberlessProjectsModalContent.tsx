import { remedyMemberlessProjects } from "@/lib/api";
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

export const RemedyMemberlessProjectsModalContent = ({
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
    mutationFn: remedyMemberlessProjects,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Attempting to remedy memberless to Projects",
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
          <ListItem>- All memberless projects will be affected</ListItem>
          <ListItem>
            - The function will check the creator of the first document (if one
            exists) and add them to the project as the leader
          </ListItem>
          <ListItem>
            - If the leader cannot be set because a document doesnt exist,
            membership will remain unchanged.
          </ListItem>
          <ListItem>
            - This will weed out the remaining memberless projects as they have
            no documents/data
          </ListItem>
        </List>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          Caution: This will update all projects without members.
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
