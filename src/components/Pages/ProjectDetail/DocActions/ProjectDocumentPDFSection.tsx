import {
  IDocGen,
  cancelProjectDocumentGeneration,
  generateProjectDocument,
} from "@/lib/api/api";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import {
  IConceptPlan,
  IProgressReport,
  IProjectClosure,
  IProjectPlan,
  IStudentReport,
} from "@/types";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { BsStars } from "react-icons/bs";
import { FaFileDownload } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";

interface IPDFSectionProps {
  data_document:
    | IConceptPlan
    | IProjectPlan
    | IProgressReport
    | IStudentReport
    | IProjectClosure;
  refetchData: () => void;
}

export const ProjectDocumentPDFSection = ({
  data_document,
  refetchData,
}: IPDFSectionProps) => {
  const { register: genRegister, handleSubmit: handleGenSubmit } =
    useForm<IDocGen>();
  const { register: cancelGenRegister, handleSubmit: handleCancelGenSubmit } =
    useForm<IDocGen>();
  // const docPk = genWatch("document_pk");
  // const cancelDocPk = cancelGenWatch("document_pk");
  const apiEndpoint = useApiEndpoint();
  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const projectDocPDFGenerationMutation = useMutation({
    mutationFn: generateProjectDocument,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Generating PDF",
        position: "top-right",
      });
    },
    onSuccess: (response: { res: AxiosResponse<any, any> }) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `PDF Generated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // console.log(response);
      // console.log(response.res)
      const fileUrl = `${apiEndpoint}${response?.res?.data?.file}`;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
      }

      // console.log(data_document);
      queryClient.invalidateQueries({
        queryKey: ["projects", data_document?.document?.project?.pk],
      });
      setTimeout(() => {
        refetchData();
      }, 1000);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Generate PDF",
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

  const cancelDocGenerationMutation = useMutation({
    mutationFn: cancelProjectDocumentGeneration,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Canceling Generation",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Canceled`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["projects", data_document.document.project.pk],
      });
      setTimeout(() => {
        refetchData();
      }, 1000);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Cancel",
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

  const beginCancelDocGen = (formData: IDocGen) => {
    // console.log(formData);
    cancelDocGenerationMutation.mutate(formData);
  };

  const beginProjectDocPDFGeneration = (formData: IDocGen) => {
    // console.log(formData);
    projectDocPDFGenerationMutation.mutate(formData);
  };

  // useEffect(() => console.log(data_document), [data_document])

  const downloadPDF = () => {
    {
      let file = data_document?.document?.pdf?.file;

      try {
        if (file?.startsWith("http")) {
          const parts = file.split("/");
          // Join the parts from the fourth element onwards, including the leading slash
          const extractedText = "/" + parts.slice(3).join("/");
          file = extractedText;
        }
        window.open(`${apiEndpoint}${file}`, "_blank");
      } catch (error) {
        if (error instanceof DOMException) {
          window.open(`${data_document?.document?.pdf?.file}`, "_blank");
        } else {
          // Handle other exceptions
          console.error("An error occurred while opening the window:", error);
        }
      }
    }
  };

  const { colorMode } = useColorMode();

  return (
    <>
      {/* <Flex> */}
      <Box
        as="form"
        id="cancel-pdf-generation-form"
        onSubmit={handleCancelGenSubmit(beginCancelDocGen)}
      >
        <Input
          type="hidden"
          {...cancelGenRegister("document_pk", {
            required: true,
            value: data_document.document.pk,
          })}
        />
      </Box>

      <Box
        as="form"
        id="pdf-generation-form"
        onSubmit={handleGenSubmit(beginProjectDocPDFGeneration)}
      >
        <Input
          type="hidden"
          {...genRegister("document_pk", {
            required: true,
            value: data_document.document.pk,
          })}
        />
      </Box>
      <Flex
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
        rounded={"2xl"}
        p={4}
        w={"100%"}
        // justifyContent={"flex-end"}
        border={"1px solid"}
        borderColor={"gray.300"}
        my={2}
      >
        <Box
          alignSelf={"center"}
          // bg={"red"}
          // justifyContent={""}
        >
          <Text fontWeight={"semibold"}>PDF</Text>
        </Box>

        <Flex flex={1} justifyContent={"flex-end"} w={"100%"}>
          {data_document?.document?.pdf?.file &&
          !projectDocPDFGenerationMutation.isPending &&
          !data_document?.document?.pdf_generation_in_progress ? (
            <Button
              as={motion.div}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              sx={{ transitionDuration: 0.7, animationDelay: 1 }}
              size={"sm"}
              ml={2}
              variant={"solid"}
              color={"white"}
              background={colorMode === "light" ? "blue.500" : "blue.600"}
              _hover={{
                cursor: "pointer",
                background: colorMode === "light" ? "blue.400" : "blue.500",
              }}
              onClick={() => downloadPDF()}
            >
              <Box mr={2}>
                <FaFileDownload />
              </Box>
              Download PDF
            </Button>
          ) : projectDocPDFGenerationMutation.isPending ||
            data_document?.document?.pdf_generation_in_progress ? (
            <Button
              size={"sm"}
              ml={2}
              variant={"solid"}
              color={"white"}
              background={colorMode === "light" ? "gray.400" : "gray.500"}
              _hover={{
                background: colorMode === "light" ? "gray.300" : "gray.400",
              }}
              loadingText={"Canceling"}
              isDisabled={cancelDocGenerationMutation.isPending}
              type="submit"
              form="cancel-pdf-generation-form"
              isLoading={cancelDocGenerationMutation.isPending}
            >
              <Box mr={2}>
                <FcCancel />
              </Box>
              Cancel
            </Button>
          ) : null}

          <Button
            size={"sm"}
            ml={2}
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "green.500" : "green.600"}
            _hover={{
              background: colorMode === "light" ? "green.400" : "green.500",
            }}
            loadingText={"Generation In Progress"}
            isDisabled={
              projectDocPDFGenerationMutation.isPending ||
              data_document?.document?.pdf_generation_in_progress
            }
            type="submit"
            form="pdf-generation-form"
            isLoading={
              projectDocPDFGenerationMutation.isPending ||
              data_document?.document?.pdf_generation_in_progress
            }
          >
            <Box mr={2}>
              <BsStars />
            </Box>
            {data_document?.document?.pdf?.file
              ? "Generate New"
              : "Generate PDF"}
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
