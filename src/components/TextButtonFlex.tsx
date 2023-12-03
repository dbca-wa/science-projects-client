import { Flex, Text } from "@chakra-ui/react"

interface IProps {
    onClick?: () => void;
    name?: string;
}

export const TextButtonFlex = ({ onClick, name }: IProps) => {
    return (
        <Flex justifyContent="flex-start"
            // textOverflow="ellipsis"
            maxW="100%"
            pr={8}
            alignItems={"center"}
        >
            <Text
                variant={"link"}
                color={name ? "blue.500" : undefined}
                fontWeight={"semibold"}
                onClick={onClick && onClick}
                whiteSpace="normal"
                textOverflow="ellipsis"
                cursor={name && "pointer"}
                _hover={
                    name && {
                        textDecoration: "underline",
                    }
                }
            >
                {name ?? "-"}
            </Text>
        </Flex>

    )
}