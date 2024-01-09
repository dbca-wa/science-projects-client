import { useGetUserFeedback } from "@/lib/hooks/useGetUserFeedback";
import {
  Box,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { ChatUser } from "../Chat/ChatUser";
import { useBusinessAreas } from "@/lib/hooks/useBusinessAreas";
import { useBranches } from "@/lib/hooks/useBranches";

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

  return (
    <>
      <Flex mb={8}>
        <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>
          User Feedback
        </Text>
      </Flex>
      {feedbackData && baData && branchesData && !feedbackLoading ? (
        <Grid gridTemplateColumns={"repeat(4, 1fr)"}>
          {feedbackData?.map((item) => {
            return (
              <Box
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                minH={"125px"}
                rounded={"lg"}
              >
                <Box px={4}>
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
                </Box>
              </Box>
            );
          })}
        </Grid>
      ) : (
        <Center my={2}>
          <Spinner />
        </Center>
      )}
    </>
  );
};
