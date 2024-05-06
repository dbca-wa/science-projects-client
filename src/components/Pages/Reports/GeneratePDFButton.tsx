// A button to download the annual report based on the current data. Will be used to generate actual report.

import { GenerateARPDFModal } from "@/components/Modals/GenerateARPDFModal";
import { IReport } from "@/types";
import { Button, useColorMode, useDisclosure } from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";

interface IGenBtnProps {
  report: IReport;
}

export const GeneratePDFButton = ({ report }: IGenBtnProps) => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isGeneratePDFModalOpen,
    onClose: onGeneratePDFModalClose,
    onOpen: onGeneratePDFModalOpen,
  } = useDisclosure();

  return (
    <>
      <GenerateARPDFModal
        isOpen={isGeneratePDFModalOpen}
        onClose={onGeneratePDFModalClose}
        thisReport={report}
      />
      <Button
        leftIcon={<FaDownload />}
        variant={"solid"}
        // colorScheme="blue"
        onClick={onGeneratePDFModalOpen}
        bgColor={colorMode === "light" ? `green.500` : `green.600`}
        color={colorMode === "light" ? `white` : `whiteAlpha.900`}
        _hover={{
          bg: colorMode === "light" ? `green.600` : `green.400`,
          color: colorMode === "light" ? `white` : `white`,
        }}
      >
        Generate PDF
      </Button>
    </>
  );
};
