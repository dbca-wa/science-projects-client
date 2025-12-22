import { Head } from "@/shared/components/layout/base/Head";
import { LocationItemDisplay } from "@/features/admin/components/LocationItemDisplay";
import { createLocation, getAllLocations } from "@/features/admin/services/admin.service";
import type {
  IAddLocationForm,
  ISimpleLocationData,
  OrganisedLocationData,
} from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import _ from "lodash";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export const LocationsCRUD = () => {
  const { register, handleSubmit } = useForm<IAddLocationForm>();
  const { isLoading, data: slices } = useQuery<OrganisedLocationData>({
    queryFn: getAllLocations,
    queryKey: ["locations"],
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      toast.success("Created");
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });
  const onSubmit = (formData: IAddLocationForm) => {
    mutation.mutate(formData);
  };

  const [addIsOpen, setAddIsOpen] = useState(false);
  const onAddOpen = () => setAddIsOpen(true);
  const onAddClose = () => setAddIsOpen(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSlices, setFilteredSlices] = useState<ISimpleLocationData[]>(
    [],
  );
  const [selectedAreaTypes, setSelectedAreaTypes] = useState<string[]>([]);
  const [countOfItems, setCountOfItems] = useState(0);

  useEffect(() => {
    if (slices) {
      let newFilteredSlices: ISimpleLocationData[] = [];

      if (selectedAreaTypes.length > 0) {
        // Loop through the area types and append the slices to newFilteredSlices
        for (const areaType of selectedAreaTypes) {
          if (slices[areaType]) {
            newFilteredSlices = newFilteredSlices.concat(slices[areaType]);
          }
        }
      } else {
        // If no area types are selected, show all slices
        for (const areaType in slices) {
          newFilteredSlices = newFilteredSlices.concat(slices[areaType]);
        }
      }

      setFilteredSlices(newFilteredSlices);
    }
  }, [selectedAreaTypes, slices]);

  useEffect(() => {
    if (slices) {
      let count = 0;
      if (selectedAreaTypes.length > 0 || searchTerm !== "") {
        count = filteredSlices.length;
      } else {
        count = Object.values(slices).flat().length;
      }
      setCountOfItems(count);
    }
  }, [selectedAreaTypes, searchTerm, slices, filteredSlices]);

  const debouncedHandleSearchChange = useRef(
    _.debounce((searchTerm: string, slices: OrganisedLocationData) => {
      let filteredSlices: ISimpleLocationData[] = [];

      if (searchTerm) {
        for (const area_type in slices) {
          filteredSlices = filteredSlices.concat(
            slices[area_type].filter((sl) =>
              sl.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          );
        }
      } else {
        for (const area_type in slices) {
          filteredSlices = filteredSlices.concat(slices[area_type]);
        }
      }

      setFilteredSlices(filteredSlices);
      setSearchLoading(false);
    }, 100),
  ).current;

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newSearchTerm = e.currentTarget.value;
    setSearchTerm(newSearchTerm);
    setSearchLoading(true);

    if (slices) {
      debouncedHandleSearchChange(newSearchTerm, slices);
    }
  };

  useEffect(() => {
    if (slices) {
      if (selectedAreaTypes.length > 0 || searchTerm !== "") {
        let filteredSlices: ISimpleLocationData[] = [];

        // Apply search filter
        let slicesHere = slices;
        if (searchTerm) {
          slicesHere = Object.keys(slicesHere).reduce((acc, areaType) => {
            const filteredAreaType = slicesHere[areaType].filter((sl) =>
              sl.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            if (filteredAreaType.length > 0) {
              acc[areaType] = filteredAreaType;
            }
            return acc;
          }, {} as OrganisedLocationData);
        }

        // Apply area type filter
        if (selectedAreaTypes.length > 0) {
          for (const areaType of selectedAreaTypes) {
            if (slicesHere[areaType]) {
              filteredSlices.push(...slicesHere[areaType]);
            }
          }
        } else {
          // If no checkboxes are selected, show all slices
          for (const areaType in slicesHere) {
            filteredSlices = filteredSlices.concat(slicesHere[areaType]);
          }
        }

        setFilteredSlices(filteredSlices);
      } else {
        // If no checkboxes are selected and no search term, reset to show all slices
        setFilteredSlices(filteredSlices);
      }
    }
  }, [selectedAreaTypes, searchTerm, slices, filteredSlices]);

  const handleAreaTypeCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedAreaTypes([value]); // Set only the clicked checkbox as selected
    } else {
      setSelectedAreaTypes([]); // Uncheck the clicked checkbox
    }
  };

  const areaTypeMap: {
    [key: string]: {
      val: string;
      name: string;
    };
  } = {
    dbcaregion: {
      val: "dbcaregion",
      name: "DBCA Region",
    },
    dbcadistrict: {
      val: "dbcadistrict",
      name: "DBCA District",
    },
    ibra: {
      val: "ibra",
      name: "IBRA",
    },
    imcra: {
      val: "imcra",
      name: "IMCRA",
    },
    nrm: {
      val: "nrm",
      name: "NRM",
    },
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Head title="Locations" />

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <p className="font-semibold text-lg">
                Locations ({countOfItems})
              </p>
            </div>
            <div className="flex w-full mt-4">
              <Input
                type="text"
                placeholder="Search locations by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-[65%]"
              />
              <div className="flex justify-between px-4 w-full">
                {Object.keys(areaTypeMap).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={selectedAreaTypes.includes(key)}
                      onCheckedChange={(checked) => {
                        const event = {
                          target: {
                            value: key,
                            checked: checked as boolean,
                          },
                        } as ChangeEvent<HTMLInputElement>;
                        handleAreaTypeCheckboxChange(event);
                      }}
                    />
                    <Label htmlFor={key} className="text-sm font-medium">
                      {areaTypeMap[key].name}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pl-10">
                <Button
                  onClick={onAddOpen}
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-400" 
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                >
                  Add
                </Button>
              </div>
            </div>
            {countOfItems === 0 ? (
              <div className="py-10 font-bold">
                <p>No results</p>
              </div>
            ) : (
              <>
                <div
                  className="grid mt-4 w-full p-3 border"
                  style={{ 
                    gridTemplateColumns: "1fr 3fr",
                    borderBottomWidth: filteredSlices.length === 0 ? "1px" : "0"
                  }}
                >
                  <div className="flex">
                    <p className="font-bold">Location Name</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-bold">Location Type</p>
                    <p className="font-bold">Change</p>
                  </div>
                </div>
              </>
            )}

            {searchLoading ? (
              <div className="flex justify-center w-full min-h-[100px] pt-10">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1">
                {searchTerm !== "" || selectedAreaTypes.length !== 0
                  ? filteredSlices.map((s) => {
                      if (
                        selectedAreaTypes.length === 0 ||
                        selectedAreaTypes.includes(s.area_type)
                      ) {
                        return (
                          <LocationItemDisplay
                            key={s.pk}
                            pk={s.pk}
                            name={s.name}
                            area_type={s.area_type}
                          />
                        );
                      }
                      return null; // Return null for slices that don't match the filter
                    })
                  : slices &&
                    Object.keys(slices)
                      .sort()
                      .map((areaTypeKey) =>
                        slices[areaTypeKey].map((s) => (
                          <LocationItemDisplay
                            key={s.pk}
                            pk={s.pk}
                            name={s.name}
                            area_type={s.area_type}
                          />
                        )),
                      )}
              </div>
            )}
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add Location</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <form
                  className="space-y-10"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoFocus
                      autoComplete="off"
                      {...register("name", { required: true })}
                      required
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area_type">Area Type</Label>
                    <Select {...register("area_type", { required: true })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dbcaregion">DBCA Region</SelectItem>
                        <SelectItem value="dbcadistrict">DBCA District</SelectItem>
                        <SelectItem value="ibra">
                          Interim Biogeographic Regionalisation of Australia
                        </SelectItem>
                        <SelectItem value="imcra">
                          Integrated Marine and Coastal Regionisation of Australia
                        </SelectItem>
                        <SelectItem value="nrm">
                          Natural Resource Management Region
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {mutation.isError ? (
                    <div className="mt-4">
                      {Object.keys(
                        (mutation.error as AxiosError).response.data,
                      ).map((key) => (
                        <div key={key}>
                          {(
                            (mutation.error as AxiosError).response.data[
                              key
                            ] as string[]
                          ).map((errorMessage, index) => (
                            <p key={`${key}-${index}`} className="text-red-500">
                              {`${key}: ${errorMessage}`}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </form>
              </div>
              <SheetFooter>
                <Button
                  form="add-form"
                  type="submit"
                  disabled={mutation.isPending}
                  className={`text-white w-full ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-400" 
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  );
};
