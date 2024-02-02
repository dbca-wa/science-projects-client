import { FeedbackDisplayRTE } from "@/components/RichTextEditor/Editors/FeedbackDisplayRTE";
import { useBranches } from "@/lib/hooks/useBranches";
import { useBusinessAreas } from "@/lib/hooks/useBusinessAreas";
import { useGetUserFeedback } from "@/lib/hooks/useGetUserFeedback";
import {
  Center,
  Flex,
  Grid,
  Spinner,
  Text
} from "@chakra-ui/react";
import { motion } from "framer-motion";

export const UserFeedbackPage = () => {
  const { feedbackData, feedbackLoading } = useGetUserFeedback();
  const { baData } = useBusinessAreas();
  const { branchesData } = useBranches();


  return (
    <>
      <Flex mb={8}>
        <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>
          User Feedback
        </Text>
      </Flex>
      {feedbackData && baData && branchesData && !feedbackLoading ? (
        feedbackData?.length > 0 ? (
          <Grid
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              xl: "repeat(2, 1fr)",
              "2xl": "repeat(4, 1fr)",
            }}
            gridGap={4}
          >
            {feedbackData?.map((item, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.3, delay: (idx + 0.25) / 7 }}
                  style={{ height: "100%" }}
                >
                  <FeedbackDisplayRTE
                    user={item?.user}
                    baData={baData}
                    branchesData={branchesData}
                    feedbackData={item}
                  />
                </motion.div>
              );
            })}
          </Grid>
        ) : (
          <Text fontWeight={"semibold"} fontSize={""}>
            There is no feedback.
          </Text>
        )
      ) : (
        <Center my={2}>
          <Spinner />
        </Center>
      )}
    </>
  );
};
