// The quote that displays on the dashboard

import { useQuote } from "@/lib/hooks/tanstack/useQuote";
import { Box, Flex, Spinner, Text, useColorMode } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { BsChatQuoteFill } from "react-icons/bs";

export const Quote = () => {
  const { colorMode } = useColorMode();
  const { quote, quoteLoading } = useQuote();

  const textControls = useAnimation();
  const authorControls = useAnimation();

  useEffect(() => {
    if (!quoteLoading) {
      const textArray = quote ? quote.text.split(" ") : [];
      textControls.start((i) => ({
        opacity: 1,
        transition: { delay: i * 0.025 },
      }));
      authorControls.start({
        opacity: 1,
        y: 0,
        transition: { delay: textArray.length * 0.025 + 0.5, duration: 1 },
      });
    }
  }, [textControls, authorControls, quote, quoteLoading]);

  return (
    <Box
      rounded={22}
      bgColor={colorMode === "light" ? "gray.100" : "blackAlpha.500"}
      padding={8}
      py={6}
      userSelect="none"
    >
      <Flex alignItems="flex-start" mb={1}>
        <Box
          aria-label={""}
          mt={1}
          mr={4}
          bgColor={colorMode === "light" ? "blue.400" : "blue.600"}
          color="white"
          padding={2}
          rounded={10}
        >
          <BsChatQuoteFill size={30} />
        </Box>
        <Flex width="100%" flexDir="column">
          {!quoteLoading ? (
            <>
              <Text
                color={
                  colorMode === "light" ? "blackAlpha.900" : "whiteAlpha.900"
                }
                fontSize="md"
                mb={3}
                fontStyle={"italic"}
              >
                {quote
                  ? quote.text.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={textControls}
                        custom={i}
                      >
                        {word}{" "}
                      </motion.span>
                    ))
                  : "How wonderful that we have met with a paradox. Now we have some hope of making progress."}
              </Text>
            </>
          ) : (
            <Spinner />
          )}
        </Flex>
      </Flex>
      {quote && (
        <Flex justifyContent="flex-end">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={authorControls}>
            <Text
              fontWeight="medium"
              textAlign="right"
              color={
                colorMode === "light" ? "blackAlpha.900" : "whiteAlpha.900"
              }
            >
              {quote.author}
            </Text>
          </motion.div>
        </Flex>
      )}
    </Box>
  );
};
