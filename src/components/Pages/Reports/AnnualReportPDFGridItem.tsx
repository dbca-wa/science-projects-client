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
import { ISmallReport, IUserMe } from "@/types";
import { ChangeReportPDFModal } from "../../Modals/ChangeReportPDFModal";

interface Props {
  report: ISmallReport;
  refetchFunction: () => void;
  userData: IUserMe;
  isLegacy: boolean;
}

export const AnnualReportPDFGridItem = ({
  report,
  refetchFunction,
  userData,
  isLegacy,
}: Props) => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isChangePDFOpen,
    onOpen: onChangePDFOpen,
    onClose: onChangePDFClose,
  } = useDisclosure();
  const downloadPDF = (report) => {
    console.log(report);
    console.log(report?.pdf?.file ? report.pdf.file : report.file);
    if (report?.pdf?.file || report?.file) {
      console.log("downloading file");
      window.open(report?.pdf?.file ? report.pdf.file : report.file, "_blank");
    }
  };

  return (
    <>
      <ChangeReportPDFModal
        isLegacy={isLegacy}
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
        pb={userData?.is_superuser ? 3 : 6}
        flexDir={"column"}
      >
        <Center
          mb={8}
          onClick={() => {
            downloadPDF(report);
          }}
          cursor={"pointer"}
        >
          <Image
            src="pdf2.png"
            objectFit="contain"
            maxH={"200px"}
            userSelect={"none"}
            draggable={false}
          />
        </Center>
        <Box position="relative" px={0} userSelect={"none"}>
          <Divider />
          <AbsoluteCenter
            bg={colorMode === "light" ? "white" : "gray.800"}
            px="4"
          >
            {report?.year &&
              (() => {
                const yearStr = String(report.year).slice(2); // Get the last two digits of the year
                const prevYearStr = String(report.year - 1).slice(2); // Get the last two digits of the previous year

                const formattedPrevYear =
                  prevYearStr.length === 1 ? `0${prevYearStr}` : prevYearStr;
                const formattedYear =
                  yearStr.length === 1 ? `0${yearStr}` : yearStr;

                return `FY ${formattedPrevYear}-${formattedYear}`;
              })()}
          </AbsoluteCenter>
        </Box>
        {userData?.is_superuser && (
          <Grid
            mt={4}
            w={"100%"}
            // gridTemplateColumns={"repeat(2, 1fr)"}
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
          </Grid>
        )}
      </Flex>
    </>
  );
};

{
  /* <Button
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
</Button> */
}
