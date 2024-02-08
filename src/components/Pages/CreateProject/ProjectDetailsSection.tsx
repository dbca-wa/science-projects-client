// WIP project detail section for project creation

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  InputGroup,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import "react-calendar/dist/Calendar.css";
import "../../../styles/modalscrollbar.css";
import { IBusinessArea, IDepartmentalService } from "../../../types";
import { useBusinessAreas } from "../../../lib/hooks/useBusinessAreas";
import { useDepartmentalServices } from "../../../lib/hooks/useDepartmentalServices";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { StartAndEndDateSelector } from "./StartAndEndDateSelector";

interface IProjectDetailSectionProps {
  thisUser: number;
  projectDetailsFilled: boolean;
  setProjectDetailsFilled: (val: boolean) => void;
  nextClick: (data) => void;
  onClose: () => void;
  backClick: () => void;
  projectType: string;
  colorMode: string;
}

export const ProjectDetailsSection = ({
  backClick,
  nextClick,
  projectDetailsFilled,
  setProjectDetailsFilled,
  projectType,
  thisUser,
  // onClose,
  colorMode,
}: IProjectDetailSectionProps) => {
  const [selectedBusinessArea, setSelectedBusinessArea] = useState<number>(0);
  const [selectedDepartmentalService, setSelectedDepartmentalService] =
    useState<number>(0);

  const [selectedSupervisingScientist, setSelectedSupervisingScientist] =
    useState<number>();
  const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  // const [selectedDates, setSelectedDates] = useState();

  useEffect(() => {
    // Adjust to auto set, but allow for closing and re-setting data custodian.
    if (
      selectedBusinessArea &&
      // && selectedDepartmentalService
      selectedSupervisingScientist &&
      selectedDataCustodian &&
      startDate &&
      endDate &&
      startDate <= endDate
    ) {
      setProjectDetailsFilled(true);
    } else {
      setProjectDetailsFilled(false);
    }
  }, [
    startDate,
    endDate,
    selectedDataCustodian,
    selectedSupervisingScientist,
    selectedDepartmentalService,
    selectedBusinessArea,
    setProjectDetailsFilled,
  ]);

  const [businessAreaList, setBusinessAreaList] = useState<IBusinessArea[]>([]);
  const [servicesList, setServicesList] = useState<IDepartmentalService[]>([]);

  const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
  const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();

  useEffect(() => {
    if (!baLoading) {
      const alphabetisedBA = [...businessAreaDataFromAPI];
      alphabetisedBA.sort((a, b) => a.name.localeCompare(b.name));
      setBusinessAreaList(alphabetisedBA);
    }
  }, [baLoading, businessAreaDataFromAPI]);

  useEffect(() => {
    if (!dsLoading) {
      const alphabetisedDS = [...servicesDataFromAPI];
      alphabetisedDS.sort((a, b) => a.name.localeCompare(b.name));
      setServicesList(alphabetisedDS);
    }
  }, [dsLoading, servicesDataFromAPI]);

  return (
    <>
      <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={8} px={24}>
        <Box>
          <FormControl
            // isRequired
            mb={4}
          >
            <FormLabel>Departmental Service</FormLabel>
            <InputGroup>
              <Select
                variant="filled"
                placeholder="Select a Departmental Service"
                onChange={(event) =>
                  setSelectedDepartmentalService(parseInt(event.target.value))
                }
                value={selectedDepartmentalService}
              >
                {servicesList.map((service, index) => {
                  const checkIsHtml = (data: string) => {
                    // Regular expression to check for HTML tags
                    const htmlRegex = /<\/?[a-z][\s\S]*>/i;

                    // Check if the string contains any HTML tags
                    return htmlRegex.test(data);
                  };

                  const isHtml = checkIsHtml(service.name);
                  let serviceName = service.name;
                  if (isHtml === true) {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(
                      service.name,
                      "text/html"
                    );
                    const content = dom.body.textContent;
                    serviceName = content;
                  }

                  return (
                    <option key={index} value={service.pk}>
                      {serviceName}
                    </option>
                  );
                })}
              </Select>
            </InputGroup>
            <FormHelperText
            // color={colorMode === "light" ? "gray.500" : "gray.400"}
            >
              The DBCA service that this project delivers outputs to.
            </FormHelperText>
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Business Area</FormLabel>

            <InputGroup>
              <Select
                variant="filled"
                placeholder="Select a Business Area"
                onChange={(event) =>
                  setSelectedBusinessArea(parseInt(event.target.value))
                }
                value={selectedBusinessArea}
              >
                {businessAreaList.map((ba, index) => {
                  const checkIsHtml = (data: string) => {
                    // Regular expression to check for HTML tags
                    const htmlRegex = /<\/?[a-z][\s\S]*>/i;

                    // Check if the string contains any HTML tags

                    return htmlRegex.test(data);
                  };

                  const isHtml = checkIsHtml(ba.name);
                  let baName = ba.name;
                  if (isHtml === true) {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(ba.name, "text/html");
                    const content = dom.body.textContent;
                    baName = content;
                  }
                  if (ba?.is_active) {
                    return (
                      <option key={index} value={ba.pk}>
                        {baName}
                      </option>
                    );
                  }
                })}
              </Select>
            </InputGroup>
            <FormHelperText
            // color={colorMode === "light" ? "gray.500" : "gray.400"}
            >
              The Business Area / Program that this project belongs to.
            </FormHelperText>
          </FormControl>
        </Box>
        <Grid gridTemplateColumns={"repeat(1, 1fr)"}>
          <FormControl>
            <StartAndEndDateSelector
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              helperText="These dates can be tentative and adjusted from project settings later"
            />
          </FormControl>

          <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={8}>
            <Box mb={4}>
              <UserSearchDropdown
                isRequired={true}
                setUserFunction={setSelectedSupervisingScientist}
                preselectedUserPk={thisUser}
                label={
                  projectType !== "Student Project"
                    ? "Research Scientist"
                    : "Supervising Scientist"
                }
                placeholder={
                  projectType === "Student Project"
                    ? "Search for a Supervising Scientist"
                    : "Search for a Research Scientist"
                }
                helperText={
                  projectType === "Student Project"
                    ? "The supervising scientist."
                    : "Research Scientist (Project Leader)"
                }
              />
            </Box>

            <Box mb={4}>
              <UserSearchDropdown
                isRequired={true}
                setUserFunction={setSelectedDataCustodian}
                // preselectedUserPk={selectedDataCustodian}
                preselectedUserPk={thisUser}
                isEditable={true}
                label="Data Custodian"
                placeholder="Search for a data custodian"
                helperText={
                  "The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue"
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Flex w={"100%"} justifyContent={"flex-end"} pb={4}>
        <Button onClick={backClick}>Back</Button>
        <Button
          ml={3}
          // type="submit"
          //   colorScheme="blue"
          backgroundColor={colorMode === "light" ? "blue.500" : "blue.600"}
          color={"white"}
          _hover={{
            backgroundColor: colorMode === "light" ? "blue.600" : "blue.700",
          }}
          isDisabled={!projectDetailsFilled}
          onClick={() => {
            if (projectDetailsFilled) {
              nextClick({
                businessArea: selectedBusinessArea,
                departmentalService: selectedDepartmentalService,
                dataCustodian: selectedDataCustodian,
                supervisingScientist: selectedSupervisingScientist,
                startDate: startDate,
                endDate: endDate,
              });
            } else return;
          }}
        >
          Next &rarr;
        </Button>
      </Flex>
    </>
  );
};
