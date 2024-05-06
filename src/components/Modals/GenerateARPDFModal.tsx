import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { IBusinessArea, IReport } from "@/types";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
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
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilePdf } from "react-icons/fa";
import { IGeneratePDFProps, generateReportPDF } from "../../lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  thisReport: IReport;
}

export const GenerateARPDFModal = ({ isOpen, onClose, thisReport }: Props) => {
  console.log(thisReport);

  const [isGenerateReportButtonDisabled, setIsGenerateReportButtonDisabled] =
    useState(false);

  const toast = useToast();
  const [onMutateToastId, setOnMutateToastId] = useState<ToastId>();

  const generatePDFMutation = useMutation({
    mutationFn: generateReportPDF,
    onMutate: () => {
      setIsGenerateReportButtonDisabled(true);
      const toastId = toast({
        position: "top-right",
        status: "loading",
        title: "Generating",
        description: "Generating PDF...",
        duration: null,
      });
      setOnMutateToastId(toastId);
    },
    onSuccess: () => {
      toast({
        position: "top-right",
        status: "success",
        title: "Complete!",
        isClosable: true,
        description: "Generation Complete.",
      });
      setIsGenerateReportButtonDisabled(false);

      setTimeout(() => {
        onClose();
      }, 1000);
      if (onMutateToastId) {
        toast.close(onMutateToastId);
      }
    },
    onError: () => {
      toast({
        position: "top-right",
        status: "error",
        title: "Error!",
        isClosable: true,
        description: "Unable to generate PDF.",
      });
      setTimeout(() => {
        setIsGenerateReportButtonDisabled(false);
      }, 1000);
      if (onMutateToastId) {
        toast.close(onMutateToastId);
      }
    },
  });

  const generatePDF = (formData: IGeneratePDFProps) => {
    console.log("Generating...");
    console.log(formData);
    generatePDFMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  // useEffect(() => {
  //     let prefillText = "";
  //     let prefillHtml;
  //     if (outcomeValue === "completed") {
  //         prefillText = "The project has run its course and was completed";
  //     } else if (outcomeValue === "forcecompleted") {
  //         prefillText = "The project needed to be forcefully closed";
  //     } else if (outcomeValue === "suspended") {
  //         prefillText = "The project needs to be put on hold";
  //     } else if (outcomeValue === "terminated") {
  //         prefillText = "The project has not been completed, but is terminated.";
  //     }
  //     if (colorMode === "light") {
  //         prefillHtml = `<p class='editor-p-light'>${prefillText}</p>`;
  //     } else {
  //         prefillHtml = `<p class='editor-p-dark'>${prefillText}</p>`;
  //     }
  //     setClosureReason(prefillHtml);
  // }, [colorMode, outcomeValue]);

  const sectionDictionary = {
    cover: "Cover Page",
    dm: "Director's Message",
    contents: "Contents", // table of contents
    sds: "Service Delivery Structure",
    progress: "Progress Reports", // subsections for each business area
    external_summary: "External Partnerships", //table with title
    student_summary: "Student Projects", // table with title
    student_progress: "Student Reports",
    publications: "Publications and Reports",
    summary: "Summary of Research Projects", // table with title
  };

  const { baData, baLoading } = useBusinessAreas();

  const { register, handleSubmit, watch } = useForm<IGeneratePDFProps>();

  const selectedSection = watch("section");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <Flex
        as={"form"}
        onSubmit={handleSubmit(generatePDF)}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Generate PDF?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridGap={10}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <Center mt={8} display={"flex"} flexDir={"column"}>
                <Box px={4} mb={4}>
                  <Text fontWeight={"semibold"} fontSize={"xl"}>
                    You are about to generate a pdf
                    {thisReport?.year &&
                      ` for Annual Report FY ${thisReport.year}-${
                        thisReport.year - 1
                      }`}
                    .{" "}
                  </Text>
                </Box>

                <FormControl>
                  <InputGroup>
                    <Input
                      type="hidden"
                      {...register("reportId", {
                        required: true,
                        value: Number(thisReport?.id),
                      })}
                      readOnly
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired px={80} mt={8}>
                  <FormLabel>Section</FormLabel>
                  <Select
                    {...register("section", { required: true })}
                    variant="filled"
                    placeholder="Select a Section To Generate"
                  >
                    <option value={"full"}>0. Full Report</option>
                    {Object.entries(sectionDictionary).map(
                      ([key, value], index) => (
                        <option key={key} value={key}>
                          {index + 1}. {value}
                        </option>
                      )
                    )}
                  </Select>
                  <FormHelperText>
                    Select the section of the annual report you would like to
                    generate
                  </FormHelperText>
                </FormControl>

                {!baLoading && selectedSection === "progress" && (
                  <FormControl px={80} mt={8}>
                    <FormLabel>Business Area</FormLabel>
                    <Select
                      {...register("businessArea", { required: false })}
                      variant="filled"
                      placeholder="Select a Business Area"
                    >
                      <option value={0}>All</option>
                      {baData?.map((ba: IBusinessArea) => (
                        <option key={ba.name} value={Number(ba?.pk)}>
                          {ba.name}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      This is optional, but may save time. By default, all
                      business areas will be included.
                    </FormHelperText>
                  </FormControl>
                )}

                <Text
                  fontWeight={"semibold"}
                  color={"red.500"}
                  mt={8}
                  mb={12}
                  px={80}
                >
                  Note: Further PDF generations for this report will be disabled
                  until this operation has completed.
                </Text>
              </Center>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                isLoading={generatePDFMutation.isPending}
                type="submit"
                isDisabled={
                  generatePDFMutation.isPending ||
                  isGenerateReportButtonDisabled ||
                  !selectedSection
                }
                ml={3}
                leftIcon={<FaFilePdf />}
              >
                Generate PDF
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
