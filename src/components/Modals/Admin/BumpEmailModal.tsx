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
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";

interface Props {
  documentsRequiringAction: [];
  refreshDataFn: () => void;
  onClose: () => void;
}

export const BumpEmailModalContent = ({
  documentsRequiringAction,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const mutation = useMutation({
    mutationFn: sendBumpEmails,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Sending bump email/s",
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

  const onSend = () => {
    mutation.mutate({ 
        documentsRequiringAction: documentsRequiringAction,
        // document id
        // document kind
        // project id
        // project title
        // user to take action
        // capacity they must take action
        // user requesting they take action
     });
  };

  return (
    <>
      <Box>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          This will send an email to the person that needs to take action for this document. Are you sure?
        </Text>
        <Flex justifyContent={"flex-end"} py={4}>
          <Box>
            <Button
              bg={"green.500"}
              color={"white"}
              _hover={{
                bg: "green.400",
              }}
              onClick={onSend}
            >
              Send
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
