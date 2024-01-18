import {
  AbsoluteCenter,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  Image,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { ISmallReport } from "../../../types";
import { ChangeReportPDFModal } from "../../Modals/ChangeReportPDFModal";

interface Props {
  report: ISmallReport;
  refetchFunction: () => void;
}

export const AnnualReportPDFGridItem = ({ report, refetchFunction }: Props) => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isChangePDFOpen,
    onOpen: onChangePDFOpen,
    onClose: onChangePDFClose,
  } = useDisclosure();
  const downloadPDF = (report) => {
    console.log(report);
    console.log(report.pdf.file);
    if (report.pdf.file) {
      console.log("downloading file");
      window.open(report.pdf.file, "_blank");
    }
  };
  return (
    <>
      <ChangeReportPDFModal
        isChangePDFOpen={isChangePDFOpen}
        onChangePDFClose={onChangePDFClose}
        report={report}
        refetchPDFs={refetchFunction}
      />

      <Flex
        border={"1px solid"}
        rounded={"lg"}
        borderColor={"gray.200"}
        minH={"200px"}
        minW={"150px"}
        px={3}
        pt={6}
        pb={3}
        flexDir={"column"}
      >
        <Center mb={8}>
          <Image
            src="pdf2.png"
            objectFit="contain"
            maxH={"200px"}
            userSelect={"none"}
            draggable={false}
          />
        </Center>
        <Box position="relative" px={0}>
          <Divider />
          <AbsoluteCenter
            bg={colorMode === "light" ? "white" : "gray.800"}
            px="4"
          >
            {report?.year}
          </AbsoluteCenter>
        </Box>
        <Grid
          mt={4}
          w={"100%"}
          gridTemplateColumns={"repeat(2, 1fr)"}
          gridGap={8}
        >
          <Button
            variant={"link"}
            userSelect={"none"}
            draggable={false}
            onClick={onChangePDFOpen}
            leftIcon={
              <Box color={"blue.500"} mt={"2px"}>
                <FaEdit size={"14px"} />
              </Box>
            }
          >
            Update
          </Button>
          <Button
            variant={"link"}
            userSelect={"none"}
            draggable={false}
            onClick={() => {
              downloadPDF(report);
            }}
            leftIcon={
              <Box color={"blue.500"} mt={"2px"}>
                <MdDownload size={"18px"} />
              </Box>
            }
          >
            Download
          </Button>
        </Grid>
      </Flex>
    </>
  );
};
