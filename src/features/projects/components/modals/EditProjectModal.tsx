import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowLeft } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import { type IEditProject, updateProjectDetails } from "@/features/projects/services/projects.service";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { useDepartmentalServices } from "@/features/admin/hooks/useDepartmentalServices";
import { useGetLocations } from "@/features/admin/hooks/useGetLocations";
import {
  IAffiliation,
  IBusinessArea,
  IDepartmentalService,
  IDivision,
  IExtendedProjectDetails,
  IExternalProjectDetails,
  ISimpleLocationData,
  ISmallService,
  IStudentProjectDetails,
  IUserData,
  ProjectImage,
} from "@/shared/types";
import { AffiliationCreateSearchDropdown } from "@/features/admin/components/AffiliationCreateSearchDropdown";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { StatefulMediaChanger } from "@/features/admin/components/StatefulMediaChanger";
import { AreaCheckAndMaps } from "@/features/projects/components/forms/AreaCheckAndMaps";
import { StartAndEndDateSelector } from "@/features/projects/components/forms/StartAndEndDateSelector";
import TagInput from "@/features/projects/components/forms/TagInput";
import { UnboundStatefulEditor } from "@/shared/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import { StatefulMediaChangerProject } from "@/features/admin/components/StatefulMediaChangerProject";
import { cn } from "@/shared/utils";

interface Props {
  projectPk: string | number;
  currentTitle: string;
  currentKeywords: string[];
  currentDates: Date[];
  currentBa: IBusinessArea;
  currentService: ISmallService;
  currentDataCustodian: number;
  details: IExtendedProjectDetails | null | undefined;

  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;

  currentAreas: ISimpleLocationData[];
  currentImage: ProjectImage;
}

export const EditProjectModal = ({
  projectPk,
  currentTitle,
  currentKeywords,
  currentDates,
  currentBa,
  currentService,
  currentAreas,
  currentImage,
  currentDataCustodian,
  details,
  isOpen,
  onClose,
  refetchData,
}: Props) => {
  const { colorMode } = useColorMode();
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
  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocations();
  const [locationData, setLocationData] = useState<number[]>(
    currentAreas.map((area) => area.pk),
  );

  const { openEditorsCount, closeEditor } = useEditorContext();

  useEffect(() => {
    if (locationData.length === 0) {
      setLocationData(currentAreas.map((area) => area.pk));
    }
  }, []);

  const [businessAreaList, setBusinessAreaList] = useState<IBusinessArea[]>([]);
  const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
  const [baSet, setBaSet] = useState(false);

  useEffect(() => {
    if (!baLoading && baSet === false) {
      const alphabetisedBA = [...businessAreaDataFromAPI];
      alphabetisedBA.sort((a, b) => a.name.localeCompare(b.name));
      setBusinessAreaList(alphabetisedBA);
      setBaSet(true);
    }
  }, [baLoading, businessAreaDataFromAPI, baSet]);

  const [servicesList, setServicesList] = useState<IDepartmentalService[]>([]);
  const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();
  const [dsSet, setDsSet] = useState(false);
  useEffect(() => {
    if (!dsLoading && dsSet === false) {
      const alphabetisedDS = [...servicesDataFromAPI];
      alphabetisedDS.sort((a, b) => a.name.localeCompare(b.name));
      setServicesList(alphabetisedDS);
      setDsSet(true);
    }
  }, [dsLoading, servicesDataFromAPI, dsSet]);

  // id/pk
  const [projectTitle, setProjectTitle] = useState(currentTitle);

  const [aims, setAims] = useState(
    (details?.external as IExternalProjectDetails)?.aims,
  );
  const [externalDescription, setExternalDescription] = useState(
    (details?.external as IExternalProjectDetails)?.description,
  );
  const [budget, setBudget] = useState<string>(
    (details?.external as IExternalProjectDetails)?.budget,
  );

  // useEffect(() => console.log(details), [details]);

  const [organisation, setOrganisation] = useState(
    (details?.student as IStudentProjectDetails)?.organisation,
  );

  const [collaborationWith, setCollaborationWith] = useState(
    (details?.external as IExternalProjectDetails)?.collaboration_with,
  );

  // const [collaborationWith, setCollaborationWith] = useState<string>("");

  const [collaboratingPartnersArray, setCollaboratingPartnersArray] = useState<
    IAffiliation[] | null
  >([]);

  const addCollaboratingPartnersPkToArray = (affiliation: IAffiliation) => {
    if (collaborationWith !== undefined) {
      setCollaborationWith((prevString) => {
        let updatedString = prevString.trim(); // Remove any leading or trailing spaces

        // Add a comma and a space if not already present
        if (updatedString && !/,\s*$/.test(updatedString)) {
          updatedString += ", ";
        }

        // Append affiliation name
        updatedString += affiliation.name.trim();

        return updatedString;
      });
    }
    if (organisation !== undefined) {
      setOrganisation((prevString) => {
        let updatedString = prevString.trim(); // Remove any leading or trailing spaces

        // Add a comma and a space if not already present
        if (updatedString && !/,\s*$/.test(updatedString)) {
          updatedString += ", ";
        }

        // Append affiliation name
        updatedString += affiliation.name.trim();

        return updatedString;
      });
    }

    setCollaboratingPartnersArray((prev) => [...prev, affiliation]);
  };

  const removeCollaboratingPartnersPkFromArray = (
    affiliation: IAffiliation,
  ) => {
    // console.log()
    if (collaborationWith !== undefined) {
      setCollaborationWith((prevString) => {
        // Remove affiliation name along with optional preceding characters
        const regex = new RegExp(`.{0,2}${affiliation.name.trim()}\\s*`, "g");
        let modifiedString = prevString.replace(regex, "");

        // Check if the first two characters are a space and comma, remove them
        if (modifiedString?.startsWith(", ")) {
          modifiedString = modifiedString.substring(2);
        }
        // console.log("MOD:", modifiedString);
        return modifiedString;
      });
    }

    if (organisation !== undefined) {
      setOrganisation((prevString) => {
        // const regex = new RegExp(`.{0,2}${affiliation.name}\\s*`, 'g');
        // return prevString.replace(regex, '');
        // Remove affiliation name along with optional preceding characters
        const regex = new RegExp(`.{0,2}${affiliation.name.trim()}\\s*`, "g");
        let modifiedString = prevString.replace(regex, "");

        // Check if the first two characters are a space and comma, remove them
        if (modifiedString?.startsWith(", ")) {
          modifiedString = modifiedString.substring(2);
        }
        return modifiedString;
      });
    }
  };

  const clearCollaboratingPartnersPkArray = () => {
    setCollaborationWith("");
    setOrganisation("");
    setCollaboratingPartnersArray([]);
  };

  const [level, setLevel] = useState(
    (details?.student as IStudentProjectDetails)?.level,
  );
  const [hoveredTitle, setHoveredTitle] = useState(false);

  const [keywords, setKeywords] = useState(currentKeywords);
  const [startDate, setStartDate] = useState(currentDates[0]);
  const [endDate, setEndDate] = useState(currentDates[1]);
  const [businessArea, setBusinessArea] = useState(currentBa);
  const [service, setService] = useState<ISmallService | IDepartmentalService>(
    currentService,
  );
  const [dataCustodian, setDataCustodian] = useState(currentDataCustodian);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImage?.file,
  );

  const [canUpdate, setCanUpdate] = useState(false);

  const getPlainTextFromHTML = (htmlString) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlString;

    // Find the first 'p' or 'span' tag and get its text content
    const tag = wrapper.querySelector("p, span");
    return tag ? tag.textContent : "";
  };

  useEffect(() => {
    const plainTitle = getPlainTextFromHTML(projectTitle);
    if (
      plainTitle === "" ||
      plainTitle.length === 0 ||
      startDate === null ||
      endDate === null ||
      startDate === undefined ||
      endDate === undefined ||
      startDate > endDate ||
      !businessArea ||
      businessArea === null ||
      businessArea === undefined ||
      dataCustodian === null ||
      dataCustodian === 0 ||
      dataCustodian === undefined ||
      keywords.length === 0
    ) {
      setCanUpdate(false);
    } else {
      if ((details?.student as IStudentProjectDetails)?.level) {
        // HANDLE STUDENT FIELDS
        const parser = new DOMParser();
        const organisationDoc = parser.parseFromString(
          organisation,
          "text/html",
        );
        const organisationContent = organisationDoc.body.textContent;
        if (level && organisationContent.length > 0) {
          setCanUpdate(true);
        } else {
          setCanUpdate(false);
        }
      } else {
        setCanUpdate(true);
      }
    }
  }, [
    aims,
    budget,
    collaborationWith,
    organisation,
    level,
    externalDescription,
    details,
    projectTitle,
    keywords,
    startDate,
    endDate,
    businessArea,
    service,
    dataCustodian,
    locationData,
    selectedFile,
    currentImage,
  ]);

  const { register } = useForm<IEditProject>();
  const queryClient = useQueryClient();
  const meData = queryClient.getQueryData<IUserData>(["me"]);

  const [isUpdating, setIsUpdating] = useState(false);
  const closeAllEditors = useCallback(() => {
    if (openEditorsCount > 0) {
      closeEditor();
      setTimeout(closeAllEditors, 0); // Schedule the next call after a short delay
    }
  }, [openEditorsCount, closeEditor]);
  const updateProject = async (formData: IEditProject) => {
    setIsUpdating(true);
    // console.log(formData);
    await updateProjectMutation.mutate(formData);
    setIsUpdating(false);
  };

  useEffect(() => {
    if (isUpdating) {
      closeAllEditors();
    }
  }, [isUpdating, closeAllEditors]);

  const updateProjectMutation = useMutation({
    mutationFn: updateProjectDetails,
    onMutate: () => {
      toast.loading("Updating Project...");
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Project Updated");

      // Enhanced cache invalidation for Safari
      setTimeout(async () => {
        // Invalidate all related queries
        await queryClient.invalidateQueries({
          queryKey: ["projects", projectPk],
        });
        await queryClient.invalidateQueries({
          queryKey: ["project", projectPk],
        });

        // Force remove from cache and refetch
        queryClient.removeQueries({
          queryKey: ["project", projectPk],
        });

        // Refetch with a small delay to ensure cache is cleared
        setTimeout(() => {
          refetchData();
        }, 100);

        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Could not update project: ${error}`);
    },
  });
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(
          "max-w-full w-full h-full overflow-hidden",
          colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
        )}>
          <DialogHeader>
            <div className="flex items-center w-full justify-start">
              <div className="flex items-center cursor-pointer pr-4" onClick={onClose}>
                <div className="mr-3">
                  <FaArrowLeft />
                </div>
                <span>Go Back</span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 max-w-full px-6 py-4">
            <input
              type="text"
              placeholder="pk"
              value={projectPk}
              readOnly
              className="sr-only"
            />
            <div className="grid grid-cols-2 gap-8 max-w-full">
              <div>
                <UnboundStatefulEditor
                  buttonSize="sm"
                  title="Project Title"
                  placeholder="Enter the project's title..."
                  // helperText={"The academic organisation of the student"}
                  showToolbar={true}
                  showTitle={true}
                  isRequired={true}
                  value={projectTitle}
                  setValueFunction={setProjectTitle}
                  setValueAsPlainText={false}
                  hideBold={!meData?.is_superuser}
                  hideUnderline={!meData?.is_superuser}
                />
                {(details?.external as IExternalProjectDetails)?.project ? (
                  <div className="grid grid-cols-1 gap-2 mt-2 pb-2">
                    <UnboundStatefulEditor
                      buttonSize="sm"
                      title="External Description"
                      isRequired={false}
                      helperText={
                        "Description specific to this external project."
                      }
                      showToolbar={true}
                      showTitle={true}
                      value={externalDescription}
                      setValueFunction={setExternalDescription}
                      setValueAsPlainText={false}
                    />

                    <AffiliationCreateSearchDropdown
                      autoFocus
                      isRequired={false}
                      isEditable
                      hideTags
                      array={collaboratingPartnersArray}
                      arrayAddFunction={addCollaboratingPartnersPkToArray}
                      arrayRemoveFunction={
                        removeCollaboratingPartnersPkFromArray
                      }
                      arrayClearFunction={clearCollaboratingPartnersPkArray}
                      label="Collaboration With"
                      placeholder="Search for or add a collaboration partner"
                      helperText="The entity/s this project is in collaboration with"
                    />

                    <div className="flex flex-wrap gap-2 pt-0 pb-2">
                      {collaborationWith?.length > 0 &&
                        collaborationWith
                          .split(", ")
                          .map((item) => item.trim())
                          ?.map((aff, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={cn(
                                "text-white rounded-full cursor-pointer",
                                colorMode === "light" 
                                  ? "bg-blue-500 hover:bg-blue-400" 
                                  : "bg-blue-600 hover:bg-blue-500"
                              )}
                            >
                              <span className="pl-1">{aff}</span>
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  setCollaboratingPartnersArray([]);
                                  setCollaborationWith((prevString) => {
                                    // Remove affiliation name along with optional preceding characters
                                    const regex = new RegExp(
                                      `.{0,2}${aff}\\s*`,
                                      "g",
                                    );
                                    let modifiedString = prevString.replace(
                                      regex,
                                      "",
                                    );

                                    // Check if the first two characters are a space and comma, remove them
                                    if (modifiedString?.startsWith(", ")) {
                                      modifiedString =
                                        modifiedString.substring(2);
                                    }
                                    // console.log("MOD:", modifiedString)
                                    return modifiedString;
                                  });
                                }}
                              />
                            </Badge>
                          ))}
                    </div>
                  </div>
                ) : (details?.student as IStudentProjectDetails)
                    ?.organisation ? (
                  <div className="grid grid-cols-1 gap-2 mt-2 pb-2">
                    <AffiliationCreateSearchDropdown
                      autoFocus
                      isRequired
                      isEditable
                      hideTags
                      array={collaboratingPartnersArray}
                      arrayAddFunction={addCollaboratingPartnersPkToArray}
                      arrayRemoveFunction={
                        removeCollaboratingPartnersPkFromArray
                      }
                      arrayClearFunction={clearCollaboratingPartnersPkArray}
                      label="Collaboration With"
                      placeholder="Search for or add a collaboration partner"
                      helperText="The entity/s this project is in collaboration with"
                    />

                    <div className="flex flex-wrap gap-2 pt-0 pb-2">
                      {organisation?.length > 0 &&
                        organisation
                          .split(", ")
                          .map((item) => item.trim())
                          ?.map((aff, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={cn(
                                "text-white rounded-full cursor-pointer",
                                colorMode === "light" 
                                  ? "bg-blue-500 hover:bg-blue-400" 
                                  : "bg-blue-600 hover:bg-blue-500"
                              )}
                            >
                              <span className="pl-1">{aff}</span>
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  setCollaboratingPartnersArray([]);
                                  if (collaborationWith !== undefined) {
                                    setCollaborationWith((prevString) => {
                                      // Remove affiliation name along with optional preceding characters
                                      const regex = new RegExp(
                                        `.{0,2}${aff}\\s*`,
                                        "g",
                                      );
                                      let modifiedString = prevString.replace(
                                        regex,
                                        "",
                                      );

                                      // Check if the first two characters are a space and comma, remove them
                                      if (modifiedString?.startsWith(", ")) {
                                        modifiedString =
                                          modifiedString.substring(2);
                                      }
                                      return modifiedString;
                                    });
                                  }

                                  if (organisation !== undefined) {
                                    setOrganisation((prevString) => {
                                      // Remove affiliation name along with optional preceding characters
                                      const regex = new RegExp(
                                        `.{0,2}${aff}\\s*`,
                                        "g",
                                      );
                                      let modifiedString = prevString.replace(
                                        regex,
                                        "",
                                      );

                                      // Check if the first two characters are a space and comma, remove them
                                      if (modifiedString?.startsWith(", ")) {
                                        modifiedString =
                                          modifiedString.substring(2);
                                      }
                                      // console.log("MOD:", modifiedString)
                                      return modifiedString;
                                    });
                                  }
                                }}
                              />
                            </Badge>
                          ))}
                    </div>
                  </div>
                ) : null}

                <div className="w-full h-full mt-2 mx-2">
                  <StartAndEndDateSelector
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    helperText={"These can be changed at any time"}
                  />

                  {/* <StatefulMediaChanger
                    helperText={"Upload an image that represents the project."}
                    selectedImageUrl={selectedImageUrl}
                    setSelectedImageUrl={setSelectedImageUrl}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                  /> */}

                  <StatefulMediaChangerProject
                    helperText={"Upload an image that represents the project."}
                    selectedImageUrl={selectedImageUrl}
                    setSelectedImageUrl={setSelectedImageUrl}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    projectTitle={projectTitle} // Optional: for better alt text
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <TagInput
                  setTagFunction={setKeywords}
                  preExistingTags={keywords}
                />

                {(details?.external as IExternalProjectDetails).project ? (
                  <div className="grid grid-cols-1 gap-2 mt-2 pb-2">
                    <UnboundStatefulEditor
                      buttonSize="sm"
                      title="External Aims"
                      value={aims}
                      allowInsertButton
                      helperText={"List out the aims of your project."}
                      showToolbar={true}
                      showTitle={true}
                      isRequired={false}
                      setValueFunction={setAims}
                      setValueAsPlainText={false}
                    />
                    <UnboundStatefulEditor
                      buttonSize="sm"
                      title="Budget"
                      value={budget}
                      placeholder="The estimated operating budget in dollars..."
                      helperText={
                        "The estimated budget for the project in dollars"
                      }
                      showToolbar={false}
                      showTitle={true}
                      isRequired={false}
                      setValueFunction={setBudget}
                      setValueAsPlainText={true}
                    />
                  </div>
                ) : (details?.student as IStudentProjectDetails)?.level ? (
                  <div className="grid grid-cols-1 gap-2 mt-6 pb-6">
                    <div className="space-y-2 select-none">
                      <Label 
                        className="required"
                        onMouseEnter={() => setHoveredTitle(true)}
                        onMouseLeave={() => setHoveredTitle(false)}
                      >
                        Level
                      </Label>
                      <div className="flex">
                        <div className={cn(
                          "flex items-center justify-center px-4 border border-r-0 rounded-l-md z-10",
                          colorMode === "light"
                            ? "bg-gray-100 border-gray-300"
                            : "bg-gray-700 border-gray-600"
                        )}>
                          <HiAcademicCap className="h-5 w-5" />
                        </div>

                        <Select
                          onValueChange={(value) => setLevel(value)}
                          value={level}
                        >
                          <SelectTrigger 
                            className="rounded-l-none border-l-0"
                            onMouseEnter={() => setHoveredTitle(true)}
                            onMouseLeave={() => setHoveredTitle(false)}
                          >
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="msc">MSc</SelectItem>
                            <SelectItem value="honours">BSc Honours</SelectItem>
                            <SelectItem value="fourth_year">Fourth Year</SelectItem>
                            <SelectItem value="third_year">Third Year</SelectItem>
                            <SelectItem value="undergrad">Undergradate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <p className="text-sm text-gray-500">
                        The level of the student and the project
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="py-2">
                  <UserSearchDropdown
                    {...register("dataCustodian", {
                      required: true,
                    })}
                    onlyInternal={false}
                    isRequired={true}
                    setUserFunction={setDataCustodian}
                    isEditable
                    preselectedUserPk={currentDataCustodian}
                    label="Data Custodian"
                    placeholder="Search for a user"
                    helperText={"The user you would like to handle data."}
                  />
                </div>

                {!baLoading && baSet && (
                  <div>
                    <div className="space-y-2 pt-4">
                      <Label className="required">Business Area</Label>

                      <div className="w-full">
                        <Select
                          onValueChange={(value) => {
                            const pkVal = value;
                            const relatedBa = businessAreaList.find(
                              (ba) => Number(ba.pk) === Number(pkVal),
                            );
                            if (relatedBa !== undefined) {
                              setBusinessArea(relatedBa);
                            }
                          }}
                          value={businessArea?.pk?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Business Area" />
                          </SelectTrigger>
                          <SelectContent>
                            {orderedDivisionSlugs.flatMap((divSlug) => {
                              // Filter business areas for the current division
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
                                  {checkIsHtml(ba.name)
                                    ? sanitizeHtml(ba.name)
                                    : ba.name}{" "}
                                  {ba.is_active ? "" : "(INACTIVE)"}
                                </SelectItem>
                              ));
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-gray-500">
                        The Business Area / Program that this project belongs
                        to. Only active Business Areas are selectable.
                      </p>
                      {!businessArea && (
                        <p className="text-red-500 font-semibold mb-4">
                          No Business Area has been selected!
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 pt-4">
                      <Label>Departmental Service</Label>
                      <div className="w-full">
                        <Select
                          onValueChange={(value) => {
                            const pkVal = value;
                            const depService = servicesList.find(
                              (serv) => Number(serv.pk) === Number(pkVal),
                            );
                            if (depService !== undefined) {
                              setService(depService);
                            }
                          }}
                          value={service?.pk?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Departmental Service" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicesList.map((service, index) => {
                              const checkIsHtml = (data: string) => {
                                // Regular expression to check for HTML tags
                                const htmlRegex = /<\/?[a-z][\s\S]*>/i;

                                // Check if the string contains any HTML tags
                                return htmlRegex.test(data);
                              };

                              const isHtml = checkIsHtml(service.name);
                              let serviceName = service?.name;
                              if (isHtml === true) {
                                const parser = new DOMParser();
                                const dom = parser.parseFromString(
                                  service.name,
                                  "text/html",
                                );
                                const content = dom.body.textContent;
                                serviceName = content;
                              }

                              return (
                                <SelectItem key={index} value={service.pk.toString()}>
                                  {serviceName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-gray-500">
                        The DBCA service that this project delivers outputs to.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {!locationsLoading && (
                <>
                  <div className="grid grid-cols-2 gap-4 px-4 w-full">
                    {dbcaDistricts && dbcaDistricts.length > 0 && (
                      <AreaCheckAndMaps
                        title="DBCA Districts"
                        areas={dbcaDistricts}
                        area_type="dbcadistrict"
                        // required={false}
                        selectedAreas={locationData}
                        setSelectedAreas={setLocationData}
                      />
                    )}

                    {imcra && imcra.length > 0 && (
                      <AreaCheckAndMaps
                        title="IMCRAs"
                        areas={imcra}
                        area_type="imcra"
                        // required={false}
                        selectedAreas={locationData}
                        setSelectedAreas={setLocationData}
                      />
                    )}
                    {dbcaRegions && dbcaRegions.length > 0 && (
                      <AreaCheckAndMaps
                        title="DBCA Regions"
                        areas={dbcaRegions}
                        area_type="dbcaregion"
                        // required={false}
                        selectedAreas={locationData}
                        setSelectedAreas={setLocationData}
                      />
                    )}
                    {nrm && nrm.length > 0 && (
                      <AreaCheckAndMaps
                        title="Natural Resource Management Regions"
                        areas={nrm}
                        area_type="nrm"
                        // required={false}
                        selectedAreas={locationData}
                        setSelectedAreas={setLocationData}
                      />
                    )}
                    {ibra && ibra.length > 0 && (
                      <AreaCheckAndMaps
                        title="IBRAs"
                        areas={ibra}
                        area_type="ibra"
                        // required={false}
                        selectedAreas={locationData}
                        setSelectedAreas={setLocationData}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                // ref={updateButtonRef}
                className={cn(
                  "text-white ml-3",
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-600 hover:bg-green-500"
                )}
                disabled={!canUpdate}
                onClick={async () => {
                  updateProject({
                    projectPk: projectPk,
                    title: projectTitle,
                    image: selectedFile,
                    dataCustodian: dataCustodian,
                    keywords: keywords,
                    startDate: startDate,
                    endDate: endDate,
                    departmentalService: service?.pk,
                    businessArea: businessArea?.pk,
                    locations: locationData,
                    selectedImageUrl: selectedImageUrl,
                    externalDescription: externalDescription,
                    aims: aims,
                    budget: budget,
                    collaborationWith: collaborationWith,
                    level: level,
                    organisation: organisation,
                  });
                }}
              >
                Update
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
