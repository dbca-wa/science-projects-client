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
import { useCallback, useEffect, useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";
import { useBusinessAreas } from "../../../lib/hooks/tanstack/useBusinessAreas";
import { useDepartmentalServices } from "../../../lib/hooks/tanstack/useDepartmentalServices";
import "../../../styles/modalscrollbar.css";
import { IBusinessArea, IDepartmentalService, IDivision } from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { StartAndEndDateSelector } from "./StartAndEndDateSelector";

interface IProjectDetailSectionProps {
  thisUser: number;
  projectDetailsFilled: boolean;
  setProjectDetailsFilled: (val: boolean) => void;
  nextClick: (data: any) => void;
  onClose: () => void;
  backClick: () => void;
  projectType: string;
  colorMode: string;
}

export const ProjectDetailsSection = ({
  backClick,
  nextClick,
  setProjectDetailsFilled,
  projectType,
  thisUser,
  colorMode,
}: IProjectDetailSectionProps) => {
  // Consolidated form state
  const [formState, setFormState] = useState({
    businessArea: 0,
    departmentalService: 0,
    leader: thisUser,
    dataCustodian: thisUser,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  // Memoized handler functions
  const handleBusinessAreaChange = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      businessArea: parseInt(value),
    }));
  }, []);

  const handleDepartmentalServiceChange = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      departmentalService: parseInt(value),
    }));
  }, []);

  const handleLeaderChange = useCallback((value: number) => {
    setFormState((prev) => ({
      ...prev,
      leader: value,
    }));
  }, []);

  const handleDataCustodianChange = useCallback((value: number) => {
    setFormState((prev) => ({
      ...prev,
      dataCustodian: value,
    }));
  }, []);

  const handleDateChange = useCallback(
    (startDate: Date | undefined, endDate: Date | undefined) => {
      setFormState((prev) => ({
        ...prev,
        startDate,
        endDate,
      }));
    },
    [],
  );

  // Data fetching and processing
  const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
  const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();

  const businessAreaList = useMemo(() => {
    if (!baLoading && businessAreaDataFromAPI) {
      return [...businessAreaDataFromAPI].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
    return [];
  }, [baLoading, businessAreaDataFromAPI]);

  const servicesList = useMemo(() => {
    if (!dsLoading && servicesDataFromAPI) {
      return [...servicesDataFromAPI].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
    return [];
  }, [dsLoading, servicesDataFromAPI]);

  // Form validation
  useEffect(() => {
    const isValid =
      formState.businessArea !== 0 &&
      formState.leader !== undefined &&
      formState.dataCustodian !== undefined &&
      formState.startDate !== undefined &&
      formState.endDate !== undefined &&
      formState.startDate <= formState.endDate;

    setProjectDetailsFilled(isValid);
  }, [formState, setProjectDetailsFilled]);

  // Utility functions
  const sanitizeHtml = useCallback((htmlString: string) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  }, []);

  const checkIsHtml = useCallback((data: string) => {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(data);
  }, []);

  const handleNext = useCallback(() => {
    nextClick({
      businessArea: formState.businessArea,
      departmentalService: formState.departmentalService,
      dataCustodian: formState.dataCustodian,
      projectLead: formState.leader,
      startDate: formState.startDate,
      endDate: formState.endDate,
    });
  }, [formState, nextClick]);

  const orderedDivisionSlugs = useMemo(() => ["BCS", "CEM", "RFMS"], []);

  return (
    <>
      <Grid gridTemplateColumns="repeat(1, 1fr)" gridGap={8} px={24}>
        <Box>
          <FormControl mb={4}>
            <FormLabel>Departmental Service</FormLabel>
            <InputGroup>
              <Select
                variant="filled"
                placeholder="Select a Departmental Service"
                onChange={(e) =>
                  handleDepartmentalServiceChange(e.target.value)
                }
                value={formState.departmentalService}
              >
                {servicesList.map((service, index) => {
                  const serviceName = checkIsHtml(service.name)
                    ? sanitizeHtml(service.name)
                    : service.name;
                  return (
                    <option key={index} value={service.pk}>
                      {serviceName}
                    </option>
                  );
                })}
              </Select>
            </InputGroup>
            <FormHelperText>
              The DBCA service that this project delivers outputs to.
            </FormHelperText>
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Business Area</FormLabel>
            <InputGroup>
              <Select
                variant="filled"
                placeholder="Select a Business Area"
                onChange={(e) => handleBusinessAreaChange(e.target.value)}
                value={formState.businessArea}
              >
                {orderedDivisionSlugs.flatMap((divSlug) => {
                  const divisionBusinessAreas = businessAreaList
                    .filter(
                      (ba) =>
                        (ba.division as IDivision).slug === divSlug &&
                        ba.is_active,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name));

                  return divisionBusinessAreas.map((ba, index) => (
                    <option key={`${ba.name}${index}`} value={ba.pk}>
                      {ba?.division
                        ? `[${(ba?.division as IDivision)?.slug}] `
                        : ""}
                      {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}
                      {ba.is_active ? "" : "(INACTIVE)"}
                    </option>
                  ));
                })}
              </Select>
            </InputGroup>
            <FormHelperText>
              The Business Area / Program that this project belongs to. Only
              active Business Areas are selectable.
            </FormHelperText>
          </FormControl>
        </Box>

        <Grid gridTemplateColumns="repeat(1, 1fr)">
          <FormControl>
            <StartAndEndDateSelector
              startDate={formState.startDate}
              endDate={formState.endDate}
              setStartDate={(date: Date | undefined) =>
                handleDateChange(date, formState.endDate)
              }
              setEndDate={(date: Date | undefined) =>
                handleDateChange(formState.startDate, date)
              }
              helperText="These dates can be tentative and adjusted from project settings later"
            />
          </FormControl>

          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap={8}>
            <Box mb={4}>
              <UserSearchDropdown
                isRequired={true}
                setUserFunction={handleLeaderChange}
                preselectedUserPk={formState.leader}
                label={
                  projectType !== "Student Project"
                    ? "Project Leader"
                    : "Project Leader"
                }
                placeholder="Search for a Project Leader"
                helperText="The Project Leader."
              />
            </Box>

            <Box mb={4}>
              <UserSearchDropdown
                isRequired={true}
                setUserFunction={handleDataCustodianChange}
                preselectedUserPk={formState.dataCustodian}
                isEditable={true}
                label="Data Custodian"
                placeholder="Search for a data custodian"
                helperText="The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue"
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Flex w="100%" justifyContent="flex-end" pb={4}>
        <Button onClick={backClick}>Back</Button>
        <Button
          ml={3}
          backgroundColor={colorMode === "light" ? "blue.500" : "blue.600"}
          color="white"
          _hover={{
            backgroundColor: colorMode === "light" ? "blue.600" : "blue.700",
          }}
          isDisabled={
            !formState.businessArea ||
            !formState.startDate ||
            !formState.endDate
          }
          onClick={handleNext}
        >
          Next &rarr;
        </Button>
      </Flex>
    </>
  );
};
