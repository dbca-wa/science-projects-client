// WIP settings page. Will add functionality as/if needed.

import type { IUserData } from "@/shared/types";
import { Box, Button, Flex, Text, useColorMode } from "@chakra-ui/react";

interface Props {
  user: IUserData;
  loading: boolean;
}

export const SettingsPage = ({ user }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <Box>Settings</Box>
      {/* PASSWORD (RENDERED ONLY IF NOT STAFF) */}
      {user?.is_staff && (
        <Flex
          border={"1px solid"}
          rounded={"xl"}
          borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
          padding={4}
          flexDir={"column"}
          mb={4}
        >
          <Flex>
            <Flex w={"100%"}>
              <Flex
                flex={1}
                alignItems={"center"}
                justifyContent={"flex-start"}
              >
                <Text fontWeight={"bold"} fontSize={"lg"}>
                  Password
                </Text>
              </Flex>

              <Flex flex={1} alignItems={"center"} justifyContent={"flex-end"}>
                <Button>Set New Password</Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};
