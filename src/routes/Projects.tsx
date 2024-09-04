// Route for displaying paginated projects

import { SearchProjects } from "@/components/Navigation/SearchProjects";
import { downloadProjectsCSV } from "@/lib/api";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  Select,
  Spinner,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useRef } from "react";
import { FaDownload } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Head } from "../components/Base/Head";
import { PaginatorProject } from "../components/Pages/Projects/PaginatorProject";
import { useProjectSearchContext } from "../lib/hooks/helper/ProjectSearchContext";
import { BreadCrumb } from "@/components/Base/BreadCrumb";
import { useLayoutSwitcher } from "@/lib/hooks/helper/LayoutSwitcherContext";

export const Projects = () => {
  const { colorMode } = useColorMode();

  const {
    filteredItems,
    loading,
    totalPages,
    currentProjectResultsPage,
    setCurrentProjectResultsPage,
    onlyInactive,
    onlyActive,
    filterBA,
    filterProjectKind,
    filterProjectStatus,
    filterYear,
    totalResults,
    setSearchFilters,
  } = useProjectSearchContext();

  const handleOnlyActiveProjectsChange = () => {
    if (!onlyActive) {
      setSearchFilters({
        onlyActive: true,
        onlyInactive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
      });
    } else {
      setSearchFilters({
        onlyActive: false,
        onlyInactive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
      });
    }
  };

  const handleOnlyInactiveProjectsChange = () => {
    if (!onlyInactive) {
      setSearchFilters({
        onlyActive: false,
        onlyInactive: true,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
      });
    } else {
      setSearchFilters({
        onlyInactive: false,
        onlyActive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
      });
    }
  };

  const handleOnlySelectedStatusChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const statusValue = event.target.value;
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectKind,
      filterProjectStatus: statusValue,
      filterYear,
    });
  };

  const handleOnlySelectedProjectKindChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const projectKindValue = event.target.value;
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectStatus,
      filterProjectKind: projectKindValue,
      filterYear,
    });
  };

  const navigate = useNavigate();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const downloadProjectCSVMutation = useMutation({
    mutationFn: downloadProjectsCSV,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Generating Projects CSV",
        position: "top-right",
      });
    },
    onSuccess: (response: { res: AxiosResponse<any, any> } | Blob) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Projects CSV Downloaded`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        const downloadUrl = window.URL.createObjectURL(response as Blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "projects.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Generate Projects CSV",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const runDownloadCSVMutation = () => {
    downloadProjectCSVMutation.mutate();
  };
  const { layout } = useLayoutSwitcher();

  return (
    <>
      {layout === "traditional" && (
        <BreadCrumb
          subDirOne={{
            title: "Projects",
            link: "/users",
          }}
        />
      )}
      <Head title="Projects" />

      <Flex width={"100%"} mt={2} mb={6} flexDir={"row"}>
        <Flex flex={1} width={"100%"} flexDir={"column"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            Projects ({totalResults})
          </Text>
          <Text
            fontSize={"sm"}
            color={colorMode === "dark" ? "gray.200" : "gray.600"}
          >
            Use the filters below to fine-tune. You can ctrl click to open the
            projects in another tab.
          </Text>
        </Flex>

        <Flex
          flex={1}
          w={"100%"}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <Button
            mr={4}
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "green.500" : "green.600"}
            _hover={{
              background: colorMode === "light" ? "green.400" : "green.500",
            }}
            onClick={runDownloadCSVMutation}
            leftIcon={<FaDownload />}
          >
            CSV
          </Button>

          <Button
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "green.500" : "green.600"}
            _hover={{
              background: colorMode === "light" ? "green.400" : "green.500",
            }}
            onClick={() => navigate("/projects/add")}
            leftIcon={<IoMdAdd />}
          >
            New Project
          </Button>
        </Flex>
      </Flex>

      <Box
        alignItems="center"
        borderWidth={1}
        width="100%"
        userSelect="none"
        p={4}
      >
        <Grid
          w={"100%"}
          flex={1}
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            lg: "repeat(2, 1fr)",
          }}
          gridRowGap={4}
          gridColumnGap={4}
          justifyContent="space-between"
        >
          <Grid gridRowGap={4}>
            <Grid
              gridGap={4}
              gridTemplateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
              }}
            >
              <Checkbox
                size="md"
                colorScheme="green"
                onChange={handleOnlyActiveProjectsChange}
                isChecked={onlyActive}
                isDisabled={onlyInactive}
              >
                Only Active
              </Checkbox>
              <Checkbox
                size="md"
                colorScheme="gray"
                onChange={handleOnlyInactiveProjectsChange}
                isChecked={onlyInactive}
                isDisabled={onlyActive}
              >
                Only Inactive
              </Checkbox>
            </Grid>

            <Grid
              gridGap={4}
              gridTemplateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
              }}
              w={"100%"}
            >
              <Select
                onChange={handleOnlySelectedProjectKindChange}
                size={"sm"}
                rounded={"5px"}
                style={
                  colorMode === "light"
                    ? {
                        color: "black",
                        borderColor: "gray.100",
                        caretColor: "black !important",
                      }
                    : {
                        color: "white",
                        borderColor: "white",
                        caretColor: "black !important",
                      }
                }
              >
                <option value={"All"}>All Kinds</option>
                <option value={"core_function"}>Core Function</option>
                <option value={"science"}>Science Project</option>
                <option value={"student"}>Student Project</option>
                <option value={"external"}>External Project</option>
              </Select>
              <Select
                onChange={handleOnlySelectedStatusChange}
                size={"sm"}
                rounded={"5px"}
                style={
                  colorMode === "light"
                    ? {
                        color: "black",
                        borderColor: "gray.100",
                        caretColor: "black !important",
                      }
                    : {
                        color: "white",
                        borderColor: "white",
                        caretColor: "black !important",
                      }
                }
              >
                <option value={"All"}>All Statuses</option>
                <option value={"new"}>New</option>
                <option value={"pending"}>Pending Project Plan</option>
                <option value={"active"}>Active (Approved)</option>
                <option value={"updating"}>Update Requested</option>
                <option value={"closure_requested"}>Closure Requested</option>
                <option value={"completed"}>Completed and Closed</option>
                <option value={"terminated"}>Terminated</option>
                <option value={"suspended"}>Suspended</option>
              </Select>
            </Grid>
          </Grid>

          <Flex>
            <SearchProjects orientation={"vertical"} />
          </Flex>
        </Grid>
      </Box>

      {loading ? (
        <Center w={"100%"} minH="100px" pt={10}>
          <Spinner size={"xl"} />
        </Center>
      ) : (
        <PaginatorProject
          loading={loading}
          data={filteredItems}
          currentProjectResultsPage={currentProjectResultsPage}
          setCurrentProjectResultsPage={setCurrentProjectResultsPage}
          totalPages={totalPages}
        />
      )}
    </>
  );
};
