// Route for displaying users.

import { BreadCrumb } from "@/shared/components/layout/base/BreadCrumb";
import { Head } from "@/shared/components/layout/base/Head";
import { CreateUserModal } from "@/features/users/components/modals/CreateUserModal";
import { SearchUsers } from "@/features/users/components/SearchUsers";
import { PaginatorUser } from "@/features/users/components/PaginatorUser";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { useUserSearchContext } from "@/features/users/hooks/UserSearchContext";
import { type IUserData } from "@/shared/types";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const Users = () => {
  const {
    filteredItems,
    loading,
    totalPages,
    currentUserResultsPage,
    setCurrentUserResultsPage,
    onlyExternal,
    onlySuperuser,
    businessArea,
    onlyStaff,
    setSearchFilters,
    totalResults,
  } = useUserSearchContext();

  const { colorMode } = useColorMode();
  const {
    isOpen: isCreateUserModalOpen,
    onOpen: onCreateUserOpen,
    onClose: onCreateUserClose,
  } = useDisclosure();
  const [filtered, setFiltered] = useState<IUserData[]>([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (!isInitialRender && !loading) {
      const filteredData = filteredItems.filter((user: IUserData) => {
        let match = true;

        if (onlyStaff && !user.is_staff) {
          match = false;
        }
        if (onlySuperuser && !user.is_superuser) {
          match = false;
        }

        if (onlyExternal && user.is_staff) {
          match = false;
        }
        return match;
      });

      setFiltered([...filteredData]); // Update to spread the filteredData array
    }
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [
    filteredItems,
    onlyExternal,
    onlySuperuser,
    onlyStaff,
    loading,
    isInitialRender,
  ]);

  const handleOnlyExternalChange = () => {
    if (!onlyExternal) {
      setSearchFilters({
        onlyExternal: true,
        onlySuperuser: false,
        onlyStaff: false,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser,
        onlyStaff,
        businessArea: businessArea,
      });
    }
  };

  const handleOnlyStaffChange = () => {
    if (!onlyStaff) {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser: false,
        onlyStaff: true,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal,
        onlySuperuser,
        onlyStaff: false,
        businessArea: businessArea,
      });
    }
  };

  const handleOnlySuperChange = () => {
    if (!onlySuperuser) {
      setSearchFilters({
        onlyExternal: false,
        onlySuperuser: true,
        onlyStaff: false,
        businessArea: businessArea,
      });
    } else {
      setSearchFilters({
        onlyExternal,
        onlySuperuser: false,
        onlyStaff,
        businessArea: businessArea,
      });
    }
  };

  const isXlOrLarger = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: false,
    xl: true,
  });
  const isLargerOrLarger = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  });
  const isOver690 = useBreakpointValue({
    false: true,
    sm: false,
    md: false,
    over690: true,
    mdlg: true,
    lg: true,
    xlg: true,
  });

  const { layout } = useLayoutSwitcher();

  return (
    <>
      {layout === "traditional" && (
        <BreadCrumb
          subDirOne={{
            title: "Manage Users",
            link: "/users",
          }}
        />
      )}
      <Head title="Users" />
      <Flex width={"100%"} mt={2} mb={6} flexDir={"row"}>
        <Flex flex={1} width={"100%"} flexDir={"column"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Users ({totalResults})
          </Text>
          <Text
            fontSize={"sm"}
            color={colorMode === "dark" ? "gray.200" : "gray.600"}
          >
            Search a user above. You can also use the filters below.
          </Text>
        </Flex>

        <Flex
          flex={1}
          w={"100%"}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <Button
            onClick={onCreateUserOpen}
            bgColor={colorMode === "light" ? `green.500` : `green.600`}
            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
            _hover={{
              bg: colorMode === "light" ? `green.600` : `green.400`,
              color: colorMode === "light" ? `white` : `white`,
            }}
            ml={4}
          >
            Add User
          </Button>
        </Flex>
      </Flex>
      <>
        <CreateUserModal
          isOpen={isCreateUserModalOpen}
          onClose={onCreateUserClose}
        />
        <Grid
          templateColumns="1fr"
          alignItems="center"
          borderWidth={1}
          width="100%"
          userSelect="none"
        >
          <Box gridColumn="1 / -1" pb={4}>
            <Grid
              p={4}
              borderWidth={0}
              borderBottomWidth={1}
              alignItems="center"
              width={{
                base: "100%",
              }}
              gridTemplateColumns={{
                base: "repeat(2, 1fr)",
              }}
              gridColumnGap={4}
            >
              <Flex flex={1} w={"100%"}>
                <Stack
                  w={"100%"}
                  flex={1}
                  spacing={[1, 5]}
                  direction={["column", "row"]}
                >
                  <Checkbox
                    size="md"
                    colorScheme="gray"
                    onChange={handleOnlyExternalChange}
                    isChecked={onlyExternal}
                    isDisabled={onlyStaff || onlySuperuser}
                  >
                    Only External
                  </Checkbox>
                  <Checkbox
                    size="md"
                    colorScheme="green"
                    onChange={handleOnlyStaffChange}
                    isChecked={onlyStaff}
                    isDisabled={onlyExternal || onlySuperuser}
                  >
                    Only Staff
                  </Checkbox>
                  <Checkbox
                    size="md"
                    colorScheme="blue"
                    onChange={handleOnlySuperChange}
                    isChecked={onlySuperuser}
                    isDisabled={onlyExternal || onlyStaff}
                  >
                    Only Admin
                    {/* Only superuser */}
                  </Checkbox>
                </Stack>
              </Flex>
              <Stack>
                <SearchUsers />
              </Stack>
            </Grid>
          </Box>

          <Grid
            templateColumns={{
              base: "1fr",
              lg: "8fr 4fr",
              xl: "4fr 4fr 2.5fr",
            }}
            pt={0}
            pb={4}
            pl={6}
          >
            <Box w="100%" overflow="hidden" textOverflow={"ellipsis"}>
              <Text as={"b"}>User</Text>
            </Box>
            {isXlOrLarger ? (
              <>
                <Box w="100%" overflow="hidden" textOverflow={"ellipsis"}>
                  <Text as={"b"}>Email</Text>
                </Box>

                <Box w="100%" overflow="hidden" textOverflow={"ellipsis"}>
                  <Text as={"b"}>Business Area</Text>
                </Box>
              </>
            ) : isLargerOrLarger ? (
              <>
                <Box w="100%" overflow="hidden" textOverflow={"ellipsis"}>
                  <Text as={"b"}>Email</Text>
                </Box>
              </>
            ) : !isOver690 ? (
              <Box w="100%" overflow="hidden" textOverflow={"ellipsis"}>
                <Text as={"b"}>Email</Text>
              </Box>
            ) : null}
          </Grid>
        </Grid>

        {loading ? (
          <Center w={"100%"} minH="100px" pt={10}>
            <Spinner size={"xl"} />
          </Center>
        ) : (
          <PaginatorUser
            loading={loading}
            data={filtered}
            currentUserResultsPage={currentUserResultsPage}
            setCurrentUserResultsPage={setCurrentUserResultsPage}
            totalPages={totalPages}
          />
        )}
      </>
    </>
  );
};
