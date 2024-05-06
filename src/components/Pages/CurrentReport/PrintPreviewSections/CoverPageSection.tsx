import dbcaBCSLogo from "@/images/BCSTransparent.png";
import { Box, Center, Flex, Image, Text } from "@chakra-ui/react";

interface ICoverPage {
  year: number;
}

export const CoverPageSection = ({ year }: ICoverPage) => {
  const determineFinancialYear = (year: number) => {
    const fyString = `FY ${year}-${year + 1}`;
    return fyString;
  };

  return (
    <Box
      justifyContent={"center"}
      alignItems={"center"}
      pt={48}
      w={"100%"}
      h={"100%"}
    >
      <Flex
        flexDir={"column"}
        pos={"relative"}
        height={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Text fontSize={"xl"} fontWeight={"bold"}>
          Department of
        </Text>
        <Text fontSize={"3xl"} fontWeight={"bold"}>
          Biodiversity, Conservation and Attractions
        </Text>
        <Text fontSize={"xl"}>Biodiversity and Conservation Science</Text>
        <Flex
          justifyContent={"center"}
          w={"100%"}
          alignItems={"center"}
          mt={4}
          flexDir={"column"}
        >
          <Text fontSize={"xl"} fontWeight={"semibold"}>
            Annual Report
          </Text>
          <Text fontSize={"xl"} fontWeight={"bold"}>
            {determineFinancialYear(year)}
          </Text>
        </Flex>
        {/* Logo section */}
        <Center
          bottom={0}
          // pos={"absolute"}
          mt={96}
          py={16}
          maxW={"100%"}
        >
          <Image src={dbcaBCSLogo} />
        </Center>
      </Flex>
    </Box>
  );
};
