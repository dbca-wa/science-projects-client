import { remedyExternallyLedProjects } from "@/features/admin/services/admin.service";
import { sendBumpEmails } from "@/features/documents/services/documents.service";
import type { BumpEmailData, IProjectData } from "@/shared/types";
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

interface BumpModalProps {
  documentsRequiringAction: BumpEmailData[];
  refreshDataFn: () => void;
  onClose: () => void;
  isSingleDocument?: boolean; // New prop to differentiate between single and bulk
}

export const BumpEmailModalContent = ({
  documentsRequiringAction,
  refreshDataFn,
  onClose,
  isSingleDocument = false,
}: BumpModalProps) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const mutation = useMutation({
    mutationFn: sendBumpEmails,
    onMutate: () => {
      addToast({
        status: "loading",
        title: isSingleDocument
          ? "Sending bump email"
          : `Sending ${documentsRequiringAction.length} bump emails`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: isSingleDocument
            ? "Bump email sent successfully"
            : `${documentsRequiringAction.length} bump emails sent successfully`,
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
            ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
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
    });
  };

  return (
    <>
      <Box>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          {isSingleDocument
            ? "This will send an email to the person that needs to take action for this document. Are you sure?"
            : `This will send emails to ${documentsRequiringAction.length} people that need to take action. Are you sure?`}
        </Text>

        {/* Show summary of documents being bumped */}
        {!isSingleDocument && documentsRequiringAction.length > 1 && (
          <Box
            my={3}
            p={3}
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Documents to bump:
            </Text>
            <List spacing={1}>
              {documentsRequiringAction.slice(0, 5).map((doc) => (
                <ListItem key={doc.documentId} fontSize="sm">
                  • {doc.projectTitle} ({doc.documentKind})
                </ListItem>
              ))}
              {documentsRequiringAction.length > 5 && (
                <ListItem fontSize="sm" color="gray.500">
                  ... and {documentsRequiringAction.length - 5} more
                </ListItem>
              )}
            </List>
          </Box>
        )}

        <Flex justifyContent={"flex-end"} py={4}>
          <Box>
            <Button
              bg={"green.500"}
              color={"white"}
              _hover={{
                bg: "green.400",
              }}
              onClick={onSend}
              isLoading={mutation.isPending}
            >
              {isSingleDocument
                ? "Send Email"
                : `Send ${documentsRequiringAction.length} Emails`}
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
