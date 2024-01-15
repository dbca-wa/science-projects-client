import { useGetUserFeedback } from "@/lib/hooks/useGetUserFeedback";
import {
  Box,
  Center,
  Flex,
  Grid,
  ResponsiveValue,
  Select,
  Spinner,
  Tag,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { ChatUser } from "../Chat/ChatUser";
import { useBusinessAreas } from "@/lib/hooks/useBusinessAreas";
import { useBranches } from "@/lib/hooks/useBranches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateFeedbackStatus, updateUserFeedbackStatus } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Transition, motion } from "framer-motion";

export const UserFeedbackPage = () => {
  const { colorMode } = useColorMode();
  const { feedbackData, feedbackLoading } = useGetUserFeedback();
  const { baLoading, baData } = useBusinessAreas();
  const { branchesData, branchesLoading } = useBranches();

  useEffect(() => {
    if (!feedbackLoading) {
      console.log(feedbackData);
    }
  }, [feedbackData, feedbackLoading]);


  const statusDict = {
    "new": "New",
    "inprogress": "In Progress",
    "logged": "Logged",
    "fixed": "Fixed",
  }


  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.08,
      //   scaleX: 1,
      //   scaleY: 1,
      // rotateX: 7,
      transition: {
        scale: { duration: 0.35 },
        // rotateX: { delay: 0.15, duration: 0.1 },
      },
    },
  };


  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IUpdateFeedbackStatus>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data)
  }

  const feedbackUpdateMutation = useMutation(updateUserFeedbackStatus,
    {
      onMutate: () => {
        addToast({
          status: "loading",
          title: "Updating Status",
          position: "top-right"
        })
      },
      onSuccess: (data) => {
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: 'Success',
            description: `Status Updated`,
            status: 'success',
            position: "top-right",
            duration: 3000,
            isClosable: true,
          })
        }
        reset()

        setTimeout(() => {
          queryClient.invalidateQueries(["userfeedback"]);
          queryClient.refetchQueries([`userfeedback`]);
        }, 350)
      },
      onError: (error) => {
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: 'Could Not Update Status',
            description: `${error}`,
            status: 'error',
            position: "top-right",
            duration: 3000,
            isClosable: true,
          })
        }
      }


    })



  const onChangeStatus = (formData: IUpdateFeedbackStatus) => {
    feedbackUpdateMutation.mutate(formData);
  }




  return (
    <>
      <Flex mb={8}>
        <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>
          User Feedback
        </Text>
      </Flex>
      {feedbackData && baData && branchesData && !feedbackLoading ? (
        feedbackData?.length > 0 ?
          <Grid
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              xl: "repeat(2, 1fr)",
              '2xl': "repeat(4, 1fr)",

            }}

            gridGap={4}>
            {feedbackData?.map((item, idx) => {
              return (
                <motion.div
                  // as={motion.div}
                  key={idx}

                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.3, delay: (idx + 0.25) / 7 }}
                  style={{ height: "100%" }}

                // variants={cardVariants}
                // whileHover="hover"
                // initial="rest"
                >
                  <Box px={4} bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    minH={"125px"}
                    h={"100%"}
                    rounded={"lg"}
                    pb={20}
                    pt={2}
                    pos={"relative"}
                  >
                    <ChatUser
                      branches={branchesData}
                      businessAreas={baData}
                      user={item.user}
                      avatarSrc={item?.user?.image}
                      displayName={`${item.user?.first_name} ${item.user?.last_name}`}
                      nameCentered={true}
                      otherUser={true}
                    />
                    <Box mt={4}>
                      <Text>{item.text} -</Text>
                    </Box>
                    <Flex justifyContent={'flex-end'} pos={"absolute"}
                      right={6}
                      top={7}
                    >
                      <Tag background={item.status === 'new' ? "red.600" : item.status === 'fixed' ? "green.600" : item.status === 'logged' ? 'blue.600' : 'orange.600'} color={'white'}>
                        {statusDict[item.status]}
                      </Tag>
                    </Flex>
                    <Flex justifyContent={'flex-end'} pos={"absolute"}
                      right={5}
                      bottom={5}
                      w={"50%"}
                    >
                      <Select
                        onChange={(e) => onChangeStatus({ pk: item.id, status: e.target.value })}
                        value={item.status}

                      >
                        {Object.entries(statusDict).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}

                      </Select>
                    </Flex>

                  </Box>
                </motion.div>
              );
            })}
          </Grid> :
          <Text fontWeight={"semibold"} fontSize={""}>There is no feedback.</Text>
      ) : (
        <Center my={2}>
          <Spinner />
        </Center>
      )}
    </>
  );
};
