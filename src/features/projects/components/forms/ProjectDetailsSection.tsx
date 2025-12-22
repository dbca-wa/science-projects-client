import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useCallback, useEffect, useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { useDepartmentalServices } from "@/features/admin/hooks/useDepartmentalServices";
import "@/styles/modalscrollbar.css";
import type { IBusinessArea, IDepartmentalService, IDivision } from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { StartAndEndDateSelector } from "./StartAndEndDateSelector";
import { cn } from "@/shared/utils/component.utils";

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
      <div className="grid grid-cols-1 gap-8 px-24">
        <div>
          <div className="mb-4">
            <Label>Departmental Service</Label>
            <Select
              value={formState.departmentalService.toString()}
              onValueChange={handleDepartmentalServiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Departmental Service" />
              </SelectTrigger>
              <SelectContent>
                {servicesList.map((service, index) => {
                  const serviceName = checkIsHtml(service.name)
                    ? sanitizeHtml(service.name)
                    : service.name;
                  return (
                    <SelectItem key={index} value={service.pk.toString()}>
                      {serviceName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              The DBCA service that this project delivers outputs to.
            </p>
          </div>

          <div className="mb-4">
            <Label>Business Area *</Label>
            <Select
              value={formState.businessArea.toString()}
              onValueChange={handleBusinessAreaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Business Area" />
              </SelectTrigger>
              <SelectContent>
                {orderedDivisionSlugs.flatMap((divSlug) => {
                  const divisionBusinessAreas = businessAreaList
                    .filter(
                      (ba) =>
                        (ba.division as IDivision).slug === divSlug &&
                        ba.is_active,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name));

                  return divisionBusinessAreas.map((ba, index) => (
                    <SelectItem key={`${ba.name}${index}`} value={ba.pk.toString()}>
                      {ba?.division
                        ? `[${(ba?.division as IDivision)?.slug}] `
                        : ""}
                      {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}
                      {ba.is_active ? "" : "(INACTIVE)"}
                    </SelectItem>
                  ));
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              The Business Area / Program that this project belongs to. Only
              active Business Areas are selectable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div>
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
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="mb-4">
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
            </div>

            <div className="mb-4">
              <UserSearchDropdown
                isRequired={true}
                setUserFunction={handleDataCustodianChange}
                preselectedUserPk={formState.dataCustodian}
                isEditable={true}
                label="Data Custodian"
                placeholder="Search for a data custodian"
                helperText="The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end pb-4">
        <Button variant="outline" onClick={backClick}>Back</Button>
        <Button
          className={cn(
            "ml-3 text-white",
            colorMode === "light" 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-blue-600 hover:bg-blue-700"
          )}
          disabled={
            !formState.businessArea ||
            !formState.startDate ||
            !formState.endDate
          }
          onClick={handleNext}
        >
          Next &rarr;
        </Button>
      </div>
    </>
  );
};
