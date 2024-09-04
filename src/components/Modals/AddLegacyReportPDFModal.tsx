import { ILegacyPDF } from "@/types";
import {
  Button,
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
import { useRef, useState } from "react";
import { addLegacyPDF } from "../../lib/api";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { SingleFileStateUpload } from "../SingleFileStateUpload";

interface Props {
  isAddLegacyPDFOpen: boolean;
  onAddLegacyPDFClose: () => void;
  refetchLegacyPDFs: () => void;
  legacyPDFData: ILegacyPDF[];
}

export const AddLegacyReportPDFModal = ({
  isAddLegacyPDFOpen,
  onAddLegacyPDFClose,
  legacyPDFData,
  refetchLegacyPDFs,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportYear, setReportYear] = useState<number>();
  //   const [reportId, setReportId] = useState<number>();
  const [isError, setIsError] = useState(false);

  const { userData } = useUser();

  const ararPDFAdditionMutation = useMutation({
    mutationFn: addLegacyPDF,
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

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchLegacyPDFs();
      }, 350);

      onAddLegacyPDFClose();
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
      reportYear,
      pdfFile: uploadedPDF,
    };
    ararPDFAdditionMutation.mutate(formData);
  };

  const availableYears = Array.from({ length: 9 }, (_, i) => 2005 + i).filter(
    (year) => !legacyPDFData.some((report) => report.year === year),
  );

  return (
    <Modal
      isOpen={isAddLegacyPDFOpen}
      onClose={onAddLegacyPDFClose}
      size={"sm"}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Add Legacy PDF</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb={4}>
            Use this form to add the finalised pdf of ancient reports.
          </Text>
          {legacyPDFData ? (
            <>
              <FormControl pb={6}>
                <FormLabel>Report Year</FormLabel>
                <Select onChange={(e) => setReportYear(Number(e.target.value))}>
                  {availableYears.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
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
          <Button mr={3} onClick={onAddLegacyPDFClose}>
            Cancel
          </Button>
          <Button
            isLoading={ararPDFAdditionMutation.isPending}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
            isDisabled={!uploadedPDF || !reportYear || isError}
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
