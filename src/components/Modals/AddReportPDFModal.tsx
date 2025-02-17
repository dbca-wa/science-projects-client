import {
  Button,
  Text,
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
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { addPDFToReport } from "../../lib/api";
import { useGetARARsWithoputPDF } from "../../lib/hooks/tanstack/useGetARARsWithoputPDF";
import { SingleFileStateUpload } from "../SingleFileStateUpload";

interface Props {
  isAddPDFOpen: boolean;
  onAddPDFClose: () => void;
  refetchPDFs: () => void;
}

export const AddReportPDFModal = ({
  isAddPDFOpen,
  onAddPDFClose,
  refetchPDFs,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportId, setReportId] = useState<number>();
  const [isError, setIsError] = useState(false);

  const { userData } = useUser();
  const {
    reportsWithoutPDFLoading,
    reportsWithoutPDFData,
    refetchReportsWithoutPDFs,
  } = useGetARARsWithoputPDF();

  useEffect(() => {
    if (!reportsWithoutPDFLoading && reportsWithoutPDFData) {
      setReportId(
        reportsWithoutPDFData.length > 0 ? reportsWithoutPDFData[0]?.pk : 0,
      );
    }
  }, [reportsWithoutPDFLoading, reportsWithoutPDFData]);

  const ararPDFAdditionMutation = useMutation({
    mutationFn: addPDFToReport,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Adding PDF",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `PDF Added`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      onAddPDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        refetchPDFs();
        refetchReportsWithoutPDFs();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Add PDF",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmitPDFAdd = () => {
    const formData = {
      userId: userData?.pk ? userData.pk : userData.id,
      reportId,
      pdfFile: uploadedPDF,
    };
    ararPDFAdditionMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isAddPDFOpen} onClose={onAddPDFClose} size={"sm"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Add PDF to Report</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb={4}>
            Use this form to add the finalised pdf to the report.
          </Text>
          {!reportsWithoutPDFLoading && reportsWithoutPDFData ? (
            <>
              <FormControl pb={6}>
                <FormLabel>Selected Report</FormLabel>
                <Select onChange={(e) => setReportId(Number(e.target.value))}>
                  {!reportsWithoutPDFLoading &&
                    reportsWithoutPDFData.map((report, index) => (
                      <option key={index} value={report?.pk}>
                        {report?.year}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </>
          ) : null}

          <FormControl>
            <FormLabel>PDF File</FormLabel>
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
          <Button mr={3} onClick={onAddPDFClose}>
            Cancel
          </Button>
          <Button
            isLoading={ararPDFAdditionMutation.isPending}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
            isDisabled={!uploadedPDF || !reportId || reportId === 0 || isError}
            onClick={() => {
              onSubmitPDFAdd();
            }}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
