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
  ToastId,
  useColorMode,
  useToast
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BsMicrosoftTeams } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { createFeedbackItem, sendFeedbackReceivedEmail } from "../../lib/api";
import { IFeedback, IUserMe } from "../../types";

// interface IUserInterface {
//   userData: IUserMe;
//   isLoggedIn: boolean;
//   userLoading: boolean;
// }

interface Props {
  userData: IUserMe;
  isLoggedIn: boolean;
  userLoading: boolean;
  // user: IUserInterface;
  isFeedbackModalOpen: boolean;
  onCloseFeedbackModal: () => void;
}

export const UserFeedbackModal = ({
  userData,
  isLoggedIn,
  userLoading,
  isFeedbackModalOpen,
  onCloseFeedbackModal,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm<IFeedback>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const feedbackCreationMutation = useMutation({
    mutationFn: createFeedbackItem,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Sending Feedback",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Feedback Sent`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();
      sendFeedbackReceivedEmail({ recipients_list: [101073] });
      onCloseFeedbackModal();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["feedback"] });
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Create Task",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmitFeedbackCreation = (formData: IFeedback) => {
    feedbackCreationMutation.mutate(formData);
  };

  const [text, setText] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    // console.log(text);
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const content = doc.body.textContent;
    if (content.length > 0) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [text]);

  const kindValue = watch("kind");
  const statusValue = watch("status");
  const userValue = watch("user");

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      onClose={onCloseFeedbackModal}
      size={"3xl"}
    // scrollBehavior="inside"
    // isCentered={true}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Feedback | Help</ModalHeader>
        <ModalCloseButton />

        <ModalBody
          as="form"
          id="feedback-form"
          onSubmit={handleSubmit(onSubmitFeedbackCreation)}
        >

          <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}
            py={8}
          >
            <Button
              onClick={() => window.open("msteams:/l/chat/0/0?users=jarid.prince@dbca.wa.gov.au", "_blank")}
              leftIcon={<BsMicrosoftTeams />}
              backgroundColor={colorMode === "light" ? "purple.500" : "purple.600"}
              color={"white"}
              _hover={{
                backgroundColor: colorMode === "light" ? "purple.400" : "purple.500"
              }}            >
              Message on Teams
            </Button>
            <div className="flex items-center justify-center w-full py-5 px-40">
              {/* <hr className="flex-grow border-t-2 border-slate-300 dark:border-white mx-2" /> */}
              <Divider
                mx={2}
                flexGrow={1}
                borderTop={2}
                borderColor={colorMode === "light" ? "gray.300" : "white"}
              />
              {/* <span className="px-2  text-black dark:text-white"></span> */}
              <Text
                color={colorMode === "light" ? "black" : "whtie"}
              >
                OR
              </Text>
              {/* <hr className="flex-grow border-t-2 border-slate-300 dark:border-white mx-2" /> */}
              <Divider
                mx={2}
                flexGrow={1}
                borderTop={2}
                borderColor={colorMode === "light" ? "gray.300" : "white"}
              />
            </div>

            <Button
              onClick={() => window.open("mailto:jarid.prince@dbca.wa.gov.au&subject=SPMS%20Assistance", "_blank")}
              leftIcon={<MdEmail />}
              backgroundColor={colorMode === "light" ? "blue.500" : "blue.600"}
              color={"white"}
              _hover={{
                backgroundColor: colorMode === "light" ? "blue.400" : "blue.500"
              }}
            >
              Send an Email
            </Button>
          </Grid>

          {/* {userLoading === false && (
            <>
              <Input
                {...register("user", { required: true })}
                type="hidden"
                defaultValue={userData.pk}
              />
              <Input
                {...register("status", { required: true })}
                type="hidden"
                defaultValue={"new"}
              />
            </>
          )} */}

          {/* <FormControl pb={6}>
            <FormLabel>Kind</FormLabel>
            <InputGroup>
              <Select {...register("kind", { required: true })}>
                <option value={"feedback"}>Feedback</option>
                <option value={"request"}>Suggestion or Request</option>
              </Select>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FeedbackRichTextEditor
              userData={userData}
              setText={setText}
            />
          </FormControl> */}
        </ModalBody>
        {/* 
        <ModalFooter>
          <Button
            // variant="ghost"
            mr={3}
            onClick={onCloseFeedbackModal}
          >
            Cancel
          </Button>
          <Button

            isLoading={feedbackCreationMutation.isPending}
            isDisabled={!canSubmit}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
            onClick={() => {
              onSubmitFeedbackCreation({
                user: userValue,
                kind: kindValue,
                status: statusValue,
                text: text,
              });
            }}
          >
            Send Feedback
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};
