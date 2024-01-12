import { Flex, Text, useColorMode } from "@chakra-ui/react";

interface IProps {
  onClick?: () => void;
  name?: string;
}

export const TextButtonFlex = ({ onClick, name }: IProps) => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      justifyContent="flex-start"
      // textOverflow="ellipsis"
      maxW="100%"
      pr={8}
      alignItems={"center"}
    >
      <Text
        variant={"link"}
        color={
          name ? (colorMode === "light" ? "blue.500" : "blue.400") : undefined
        }
        _hover={
          name && {
            textDecoration: "underline",
            color: colorMode === "light" ? "blue.400" : "blue.300",
          }
        }
        fontWeight={"semibold"}
        onClick={onClick && onClick}
        whiteSpace="normal"
        textOverflow="ellipsis"
        cursor={name && "pointer"}
      >
        {name ?? "-"}
      </Text>
    </Flex>
  );
};
