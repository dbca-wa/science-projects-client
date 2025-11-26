import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { IProgressReportDisplayData } from "@/shared/components/RichTextEditor/Editors/ARProgressReportHandler";
import { IStudentReportDisplayData } from "@/shared/components/RichTextEditor/Editors/ARStudentReportHandler";
import {
  IApproveProgressReport,
  approveProgressReport,
} from "@/features/users/services/users.service";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";

interface Props {
  report: IProgressReportDisplayData | IStudentReportDisplayData;
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
  isAnimating?: boolean;
  setIsAnimating?: (state: boolean) => void;
}

export const ApproveProgressReportModal = ({
  report,
  isActive,
  setIsAnimating,
  isOpen,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IApproveProgressReport>();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const approveProgressReportMutation = useMutation({
    mutationFn: approveProgressReport,
    onMutate: () => {
      addToast({
        status: "loading",
        title: isActive
          ? `Setting Progress Report to Pending`
          : `Approving Progress Report`,
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (setIsAnimating) {
        setIsAnimating(true);
      }

      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: isActive ? `Set to Pending` : `Approved`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });
      onClose();

      setTimeout(() => {
        if (setIsAnimating) {
          setIsAnimating(false);
        }
      }, 350);
    },
    onError: (error) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: isActive ? `Could Not Set to Pending` : `Could Not Approve`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onBeginApprovalMutation = (formData: IApproveProgressReport) => {
    approveProgressReportMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>
          {isActive ? "Return" : "Approve"} Progress Report?
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          as="form"
          id="progressreportapprove-form"
          onSubmit={handleSubmit(onBeginApprovalMutation)}
        >
          <FormControl pb={6}>
            <InputGroup>
              <Input
                {...register("kind", { required: true })}
                type="hidden"
                defaultValue={report.document.kind}
              />
              <Input
                {...register("reportPk", { required: true })}
                type="hidden"
                defaultValue={report.pk}
              />
              <Input
                {...register("documentPk", { required: true })}
                type="hidden"
                defaultValue={report.document.pk}
              />
              <Input
                {...register("isActive", { required: true })}
                type="hidden"
                defaultValue={isActive ? 1 : 0}
              />
            </InputGroup>
          </FormControl>

          <Box>
            <Text fontWeight={"bold"}>
              {isActive
                ? "Set this progress report to pending"
                : "Provide final sign off for this progress report"}
              ?
            </Text>
            <Text>
              {isActive
                ? "Note: this will set the project back to update requested and set the document's directorate approval to Required"
                : "Note: If not already approved by project lead and business area lead, the report will be fast-tracked and provided with all approvals"}
            </Text>
            <Grid gridTemplateColumns={"repeat(1, 1fr)"} mt={2}>
              <Flex mb={4} mt={2}>
                <Box>
                  <ExtractedHTMLTitle
                    htmlContent={report?.document?.project?.title}
                    color={"green.400"}
                  />
                </Box>
              </Flex>
              <Box
                justifyContent={"center"}
                textAlign={"center"}
                display={"flex"}
                ml={"-10%"}
              >
                <Flex w={"50%"}>
                  {" "}
                  <Box
                    flex={1}
                    justifyContent={"flex-end"}
                    textAlign={"end"}
                    mr={4}
                  >
                    <Text fontWeight={"bold"}>Kind:</Text>
                  </Box>
                  <Box minW={"120px"} textAlign={"start"}>
                    <Text>{report?.document?.kind}</Text>
                  </Box>
                </Flex>
              </Box>

              <Box
                justifyContent={"center"}
                textAlign={"center"}
                display={"flex"}
                ml={"-10%"}
              >
                <Flex w={"50%"}>
                  {" "}
                  <Box
                    flex={1}
                    justifyContent={"flex-end"}
                    textAlign={"end"}
                    mr={4}
                  >
                    <Text fontWeight={"bold"}>Year:</Text>
                  </Box>
                  <Box minW={"120px"} textAlign={"start"}>
                    <Text>{report?.year}</Text>
                  </Box>
                </Flex>
              </Box>

              <Box
                justifyContent={"center"}
                textAlign={"center"}
                display={"flex"}
                ml={"-10%"}
              >
                <Flex w={"50%"}>
                  {" "}
                  <Box
                    flex={1}
                    justifyContent={"flex-end"}
                    textAlign={"end"}
                    mr={4}
                  >
                    <Text fontWeight={"bold"}>Report PK:</Text>
                  </Box>
                  <Box minW={"120px"} textAlign={"start"}>
                    <Text>{report?.pk}</Text>
                  </Box>
                </Flex>
              </Box>

              <Box
                justifyContent={"center"}
                textAlign={"center"}
                display={"flex"}
                ml={"-10%"}
              >
                <Flex w={"50%"}>
                  {" "}
                  <Box
                    flex={1}
                    justifyContent={"flex-end"}
                    textAlign={"end"}
                    mr={4}
                  >
                    <Text fontWeight={"bold"}>Document PK:</Text>
                  </Box>
                  <Box minW={"120px"} textAlign={"start"}>
                    <Text>{report?.document?.pk}</Text>
                  </Box>
                </Flex>
              </Box>

              <Box
                justifyContent={"center"}
                textAlign={"center"}
                display={"flex"}
                ml={"-10%"}
              >
                <Flex w={"50%"}>
                  {" "}
                  <Box
                    flex={1}
                    justifyContent={"flex-end"}
                    textAlign={"end"}
                    mr={4}
                  >
                    <Text fontWeight={"bold"}>Action:</Text>
                  </Box>
                  <Box minW={"120px"} textAlign={"start"}>
                    <Text>{isActive ? "Set to Pending" : "Approve"}</Text>
                  </Box>
                </Flex>
              </Box>
            </Grid>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            // variant="ghost"
            mr={3}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            form="progressreportapprove-form"
            type="submit"
            isLoading={approveProgressReportMutation.isPending}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
          >
            {isActive ? "Set to Pending" : "Approve"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
