// Modal for submission of user feedback

import {
  Button,
  Divider,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { BsMicrosoftTeams } from "react-icons/bs";
import { MdEmail } from "react-icons/md";

interface Props {
  isFeedbackModalOpen: boolean;
  onCloseFeedbackModal: () => void;
}

export const UserFeedbackModal = ({
  isFeedbackModalOpen,
  onCloseFeedbackModal,
}: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      onClose={onCloseFeedbackModal}
      size={"3xl"}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Feedback | Help</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4} py={8}>
            <Button
              onClick={() =>
                window.open(
                  "msteams:/l/chat/0/0?users=jarid.prince@dbca.wa.gov.au",
                  "_blank",
                )
              }
              leftIcon={<BsMicrosoftTeams />}
              backgroundColor={
                colorMode === "light" ? "purple.500" : "purple.600"
              }
              color={"white"}
              _hover={{
                backgroundColor:
                  colorMode === "light" ? "purple.400" : "purple.500",
              }}
            >
              Message on Teams
            </Button>
            <div className="flex w-full items-center justify-center px-40 py-5">
              <Divider
                mx={2}
                flexGrow={1}
                borderTop={2}
                borderColor={colorMode === "light" ? "gray.300" : "white"}
              />
              <Text color={colorMode === "light" ? "black" : "whtie"}>OR</Text>
              <Divider
                mx={2}
                flexGrow={1}
                borderTop={2}
                borderColor={colorMode === "light" ? "gray.300" : "white"}
              />
            </div>

            <Button
              onClick={() =>
                window.open(
                  "mailto:jarid.prince@dbca.wa.gov.au&subject=SPMS%20Assistance",
                  "_blank",
                )
              }
              leftIcon={<MdEmail />}
              backgroundColor={colorMode === "light" ? "blue.500" : "blue.600"}
              color={"white"}
              _hover={{
                backgroundColor:
                  colorMode === "light" ? "blue.400" : "blue.500",
              }}
            >
              Send an Email
            </Button>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
