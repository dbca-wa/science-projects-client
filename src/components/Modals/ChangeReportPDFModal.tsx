import {
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  ToastId,
  useColorMode,
  useDisclosure,
  useToast,
  FormHelperText,
  Box,
  Flex,
  Divider,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { MdOutlineTitle } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../../lib/hooks/useUser";
import {
  IAddPDF,
  addPDFToReport,
  deleteFinalAnnualReportPDF,
  updateReportPDF,
} from "../../lib/api";
import { useGetARARsWithoputPDF } from "../../lib/hooks/useGetARARsWithoputPDF";
import { SingleFileStateUpload } from "../SingleFileStateUpload";
import { report } from "process";
import { IReport, ISmallReport } from "../../types";

interface Props {
  isChangePDFOpen: boolean;
  report: ISmallReport;
  onChangePDFClose: () => void;
  refetchPDFs: () => void;
}

export const ChangeReportPDFModal = ({
  isChangePDFOpen,
  onChangePDFClose,
  refetchPDFs,
  report,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  // const { register, handleSubmit, reset, watch } = useForm<IAddPDF>();
  // const reportPk = watch('reportMediaId');

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportMediaId, setReportMediaId] = useState<number>();
  const [isError, setIsError] = useState(false);

  const { userData, userLoading } = useUser();
  // const { reportsWithoutPDFLoading, reportsWithoutPDFData, refetchReportsWithoutPDFs } = useGetARARsWithoputPDF();

  useEffect(() => {
    console.log(report);
    setReportMediaId(report && report?.pdf?.pk);
  }, [report]);

  // const downloadPDF = (report) => {
  //     console.log(report);
  //     console.log(report.pdf.file);
  //     if (report.pdf.file) {
  //         console.log('downloading file')
  //     }
  // }

  const ararPDFChangeMutation = useMutation(updateReportPDF, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating PDF",
        position: "top-right",
      });
    },
    onSuccess: (data) => {
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
      // reset()
      onChangePDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries(["ararsWithoutPDFs"]);
        queryClient.invalidateQueries(["ararsWithPDFs"]);
        refetchPDFs();
        // refetchReportsWithoutPDFs();
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

  const deletePDFMutation = useMutation(deleteFinalAnnualReportPDF, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Deleting PDF",
        position: "top-right",
      });
    },
    onSuccess: (data) => {
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
        queryClient.invalidateQueries(["ararsWithoutPDFs"]);
        queryClient.invalidateQueries(["ararsWithPDFs"]);
        refetchPDFs();
        // refetchReportsWithoutPDFs();
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
    console.log("delete btn clicked");
    deletePDFMutation.mutate(report?.pdf?.pk);
  };

  const onSubmitPDFUpdate = () => {
    console.log(reportMediaId);
    console.log(uploadedPDF);
    const formData = {
      // userId: userData?.pk ? userData.pk : userData.id,
      reportMediaId,
      pdfFile: uploadedPDF,
    };
    ararPDFChangeMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isChangePDFOpen}
      onClose={onChangePDFClose}
      size={"lg"}
      // scrollBehavior="inside"
      // isCentered={true}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Change PDF of {report?.year}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb={4}>
            Use this form to change the finalized pdf of the report.
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
            {/* <FormLabel>Delete Current PDF File</FormLabel> */}
            <Flex justifyContent={"flex-end"}>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                colorScheme={"red"}
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
          <Button
            // variant="ghost"
            mr={3}
            onClick={onChangePDFClose}
          >
            Cancel
          </Button>
          <Button
            // form="addpdf-form"
            // type="submit"
            isLoading={ararPDFChangeMutation.isLoading}
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
