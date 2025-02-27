// Route for displaying paginated projects

import { BreadCrumb } from "@/components/Base/BreadCrumb";
import { SearchProjects } from "@/components/Navigation/SearchProjects";
import { downloadProjectsCSV, getAllBusinessAreas } from "@/lib/api";
import { useLayoutSwitcher } from "@/lib/hooks/helper/LayoutSwitcherContext";
import { IBusinessArea } from "@/types";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Select,
  Spinner,
  Text,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";
import { FaDownload, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Head } from "../components/Base/Head";
import { PaginatorProject } from "../components/Pages/Projects/PaginatorProject";
import { useProjectSearchContext } from "../lib/hooks/helper/ProjectSearchContext";

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
    filterUser,
    setSearchFilters,
  } = useProjectSearchContext();

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
      filterUser,
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
      filterUser,
    });
  };

  const navigate = useNavigate();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
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

  const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const businessAreaValue = event.target.value;
    // console.log(businessAreaValue);
    setSearchFilters({
      onlyActive: onlyActive,
      onlyInactive: onlyInactive,
      filterBA: businessAreaValue,
      filterProjectKind: filterProjectKind,
      filterProjectStatus: filterProjectStatus,
      filterYear: filterYear,
      filterUser,
    });
  };

  // Function to check if a string contains HTML tags
  const checkIsHtml = (data) => {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(data);
  };

  // Function to sanitize HTML content and extract text
  const sanitizeHtml = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const data = await getAllBusinessAreas();
        setBusinessAreas(data);
      } catch (error) {
        console.error("Error fetching business areas:", error);
      }
    };

    fetchBusinessAreas();
  }, []);

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
            Ctrl + Click to open projects in another tab and keep filters.
          </Text>
        </Flex>

        <Flex
          flex={1}
          w={"100%"}
          justifyContent={"flex-end"}
          alignItems={"center"}
          gap={2}
        >
          <Button
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

          <Button
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "blue.500" : "blue.600"}
            _hover={{
              background: colorMode === "light" ? "blue.400" : "blue.500",
            }}
            onClick={() => navigate("/projects/map")}
            leftIcon={<FaMapMarkerAlt />}
          >
            Map
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
          gridGap={4}
          justifyContent="space-between"
        >
          <Grid
            gridGap={3}
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(1, 1fr)",
            }}
            w={"100%"}
          >
            {/* Filter BA */}
            <Select
              onChange={handleOnlySelectedBusinessAreaChange}
              size={"sm"}
              // mx={4}
              rounded={"5px"}
              style={
                colorMode === "light"
                  ? {
                      color: "black",
                      backgroundColor: "white",
                      borderColor: "gray.200",
                      caretColor: "black !important",
                    }
                  : {
                      color: "white",
                      borderColor: "white",
                      caretColor: "black !important",
                    }
              }
            >
              <option key={"All"} value={"All"} color={"black"}>
                All Business Areas
              </option>
              {orderedDivisionSlugs.flatMap((divSlug) => {
                // Filter business areas for the current division
                const divisionBusinessAreas = businessAreas
                  .filter((ba) => ba.division.slug === divSlug)
                  .sort((a, b) => a.name.localeCompare(b.name));

                return divisionBusinessAreas.map((ba, index) => (
                  <option key={`${ba.name}${index}`} value={ba.pk}>
                    {ba?.division ? `[${ba?.division?.slug}] ` : ""}
                    {checkIsHtml(ba.name)
                      ? sanitizeHtml(ba.name)
                      : ba.name}{" "}
                    {ba.is_active ? "" : "(INACTIVE)"}
                  </option>
                ));
              })}
            </Select>

            {/* Filter Project Kind */}
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

            {/* Filter Status */}
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

          <Flex
            flexDir={"column"}
            w={"100%"}
            justifyContent={"space-between"}
            gridGap={4}
          >
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
