// Modal for updating a report's pdf
import { ISmallReport } from "@/types";
import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  deleteFinalAnnualReportPDF,
  deleteLegacyFinalAnnualReportPDF,
  updateLegacyReportPDF,
  updateReportPDF,
} from "../../lib/api/api";
import { SingleFileStateUpload } from "../SingleFileStateUpload";

interface Props {
  isChangePDFOpen: boolean;
  report: ISmallReport;
  onChangePDFClose: () => void;
  refetchPDFs: () => void;
  isLegacy: boolean;
}

export const ChangeReportPDFModal = ({
  isChangePDFOpen,
  onChangePDFClose,
  refetchPDFs,
  isLegacy,
  report,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportMediaId, setReportMediaId] = useState<number>();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // console.log(report);
    setReportMediaId(report && (!isLegacy ? report?.pdf?.pk : report?.pk));
  }, [report, isLegacy]);

  const ararPDFChangeMutation = useMutation({
    mutationFn: isLegacy ? updateLegacyReportPDF : updateReportPDF,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating PDF",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `PDF Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      onChangePDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchPDFs();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update PDF",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const deletePDFMutation = useMutation({
    mutationFn: isLegacy
      ? deleteLegacyFinalAnnualReportPDF
      : deleteFinalAnnualReportPDF,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Deleting PDF",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `PDF Deleted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // reset()
      onChangePDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchPDFs();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Delete PDF",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const deleteFile = () => {
    deletePDFMutation.mutate(!isLegacy ? report?.pdf?.pk : report?.pk);
  };

  const onSubmitPDFUpdate = () => {
    const formData = {
      reportMediaId,
      pdfFile: uploadedPDF,
    };
    ararPDFChangeMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isChangePDFOpen} onClose={onChangePDFClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Change PDF of {report?.year}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb={4}>
            Use this form to change the finalised pdf of the report.
          </Text>

          {report ? (
            <>
              <FormControl pb={6}>
                <FormLabel>Selected Report</FormLabel>
                <Select
                  value={report?.pdf?.pk}
                  onChange={(e) => setReportMediaId(Number(e.target.value))}
                  isDisabled
                >
                  <option value={report?.pdf?.pk}>{report?.year}</option>
                </Select>
              </FormControl>
            </>
          ) : null}
          <FormControl>
            <Flex justifyContent={"flex-end"}>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                onClick={deleteFile}
              >
                Remove Current PDF
              </Button>
            </Flex>
          </FormControl>
          <Box position="relative" padding="10">
            <Divider />
            <AbsoluteCenter
              bg={colorMode === "light" ? "white" : "gray.800"}
              px="4"
            >
              OR
            </AbsoluteCenter>
          </Box>
          <FormControl>
            <FormLabel>Replace PDF File</FormLabel>
            <SingleFileStateUpload
              fileType={"pdf"}
              uploadedFile={uploadedPDF}
              setUploadedFile={setUploadedPDF}
              isError={isError}
              setIsError={setIsError}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onChangePDFClose}>
            Cancel
          </Button>
          <Button
            isLoading={ararPDFChangeMutation.isPending}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
            isDisabled={
              !uploadedPDF || !reportMediaId || reportMediaId === 0 || isError
            }
            onClick={() => {
              onSubmitPDFUpdate();
            }}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
