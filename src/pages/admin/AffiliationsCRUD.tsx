import { Head } from "@/shared/components/layout/base/Head";
import { AffiliationSearchDropdown } from "@/features/admin/components/AffiliationSearchDropdown";
import { AffiliationItemDisplay } from "@/features/admin/components/AffiliationItemDisplay";
import {
  cleanOrphanedAffiliations,
  createAffiliation,
  getAllAffiliations,
  mergeAffiliations,
} from "@/features/admin/services/admin.service";
import type { IAffiliation, IMergeAffiliation } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useColorMode } from "@/shared/utils/theme.utils";

export const AffiliationsCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IAffiliation>();
  const [primaryAffiliation, setPrimaryAffiliation] =
    useState<IAffiliation | null>(null);
  const [secondaryAffiliations, setSecondaryAffiliations] = useState<
    IAffiliation[] | null
  >([]);

  const addSecondaryAffiliationPkToArray = (affiliation: IAffiliation) => {
    setSecondaryAffiliations((prev) => [...prev, affiliation]);
  };

  const removeSecondaryAffiliationPkFromArray = (affiliation: IAffiliation) => {
    setSecondaryAffiliations((prev) =>
      prev.filter((item) => item !== affiliation),
    );
  };

  const clearSecondaryAffiliationArray = () => {
    setSecondaryAffiliations([]);
  };

  // useEffect(() => {
  //   console.log({
  //     primaryAffiliation,
  //     secondaryAffiliations,
  //   });
  // }, [primaryAffiliation, secondaryAffiliations]);

  const [addIsOpen, setAddIsOpen] = useState(false);
  const [mergeIsOpen, setMergeIsOpen] = useState(false);
  const [cleanIsOpen, setCleanIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const creationMutation = useMutation({
    mutationFn: createAffiliation,
    onMutate: () => {
      toast.loading("Creating Affiliation...");
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Created",
      });
      setAddIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
    },
  });

  const mergeMutation = useMutation({
    mutationFn: mergeAffiliations,
    onMutate: () => {
      toast.loading("Merging...");
    },
    onSuccess: () => {
      toast.success("Merged!", {
        description: "The affiliations are now one!",
      });
      clearSecondaryAffiliationArray();
      setPrimaryAffiliation(null);
      setMergeIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
    },
  });

  const cleanMutation = useMutation({
    mutationFn: cleanOrphanedAffiliations,
    onMutate: () => {
      toast.loading("Cleaning orphaned affiliations...");
    },
    onSuccess: (data) => {
      toast.success("Cleanup Complete!", {
        description: data.message,
      });
      setCleanIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
    },
  });

  const onSubmitMerge = (formData: IMergeAffiliation) => {
    // console.log("SUBMISSION DATA:", formData);
    mergeMutation.mutate(formData);
  };

  const onSubmitCreate = (formData: IAffiliation) => {
    creationMutation.mutate(formData);
  };

  const { isLoading, data: slices } = useQuery<IAffiliation[]>({
    queryFn: getAllAffiliations,
    queryKey: ["affiliations"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IAffiliation[]>([]);
  const [countOfItems, setCountOfItems] = useState(0);

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  };

  useEffect(() => {
    if (slices) {
      const filtered = slices.filter((s) => {
        const nameMatch = s.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch;
      });

      setFilteredSlices(filtered);
      setCountOfItems(filtered.length);
    }
  }, [slices, searchTerm]);

  const [createIsDisabled, setCreateIsDisabled] = useState(false);
  const nameValue = watch("name");
  const [alreadyPresentNames, setAlreadyPresentNames] = useState([]);

  useEffect(() => {
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
      if (slices && alreadyPresentNames.length === 0) {
        setAlreadyPresentNames(
          Array.from(slices).map((slice) => slice.name.toLowerCase()),
        );
      }
    }
  }, [searchTerm, slices, alreadyPresentNames]);

  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!nameValue) {
      setCreateIsDisabled(true);
    } else {
      // console.log(nameValue);
      // console.log(alreadyPresentNames);
      if (
        nameValue.includes(",") ||
        alreadyPresentNames.includes(nameValue.toLowerCase())
      ) {
        setCreateIsDisabled(true);
      } else {
        setCreateIsDisabled(false);
      }
    }
  }, [nameValue, alreadyPresentNames]);

  return (
    <>
      <Head title="Affiliations" />

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <h2 className="font-semibold text-lg">
                Affiliations ({countOfItems})
              </h2>
            </div>
            <div className="flex w-full mt-4">
              <Input
                type="text"
                placeholder="Search affiliation by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-2/3"
              />

              <div className="flex justify-end w-full gap-4">
                <Button
                  onClick={() => setCleanIsOpen(true)}
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-400" 
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  Clean
                </Button>
                <Button
                  onClick={() => setMergeIsOpen(true)}
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-orange-500 hover:bg-orange-400" 
                      : "bg-orange-600 hover:bg-orange-500"
                  }`}
                >
                  Merge
                </Button>
                <Button
                  onClick={() => setAddIsOpen(true)}
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
            <div
              className={`grid grid-cols-[9fr_3fr] mt-4 w-full p-3 border ${
                filteredSlices.length === 0 ? "border-b" : "border-b-0"
              }`}
            >
              <div className="flex justify-start">
                <span className="font-bold">Affiliation</span>
              </div>
              <div className="flex justify-end mr-2">
                <span className="font-bold">Change</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <AffiliationItemDisplay key={s.pk} pk={s.pk} name={s.name} />
                ))}
            </div>
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Add Affiliation</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div
                  className="space-y-10"
                  onSubmit={handleSubmit(onSubmitCreate)}
                >
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoFocus
                      autoComplete="off"
                      {...register("name", { required: true })}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Note: Exclude "The" from the start of any names. For
                      example, "The University of Western Australia" should be
                      "University of Western Australia"
                    </p>
                  </div>
                  {creationMutation.isError ? (
                    <p className="text-red-500">Something went wrong</p>
                  ) : null}
                </div>
              </div>
              <SheetFooter>
                <Button
                  onClick={handleSubmit(onSubmitCreate)}
                  disabled={creationMutation.isPending || createIsDisabled}
                  className={`text-white w-full ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-400" 
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                  size="lg"
                >
                  Create
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Dialog open={mergeIsOpen} onOpenChange={setMergeIsOpen}>
            <DialogContent className={`${
              colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
            } p-4 px-6`}>
              <DialogHeader>
                <DialogTitle>Merge Affiliations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="w-full text-left">
                  <p>Combine similar affiliations into one!</p>
                </div>
                <div>
                  <AffiliationSearchDropdown
                    autoFocus
                    isRequired
                    isEditable
                    setterFunction={setPrimaryAffiliation}
                    label="Primary Affiliation"
                    placeholder="Search for an affiliation"
                    helperText="The affiliation you would like to merge other affiliations into"
                  />
                </div>
                <div>
                  <AffiliationSearchDropdown
                    isRequired
                    isEditable
                    array={secondaryAffiliations}
                    arrayAddFunction={addSecondaryAffiliationPkToArray}
                    arrayRemoveFunction={removeSecondaryAffiliationPkFromArray}
                    arrayClearFunction={clearSecondaryAffiliationArray}
                    label="Secondary Affiliation/s"
                    placeholder="Search for an affiliation"
                    helperText="The affiliation/s you would like to merge into the primary affiliation"
                  />
                </div>

                {mergeMutation.isError ? (
                  <p className="text-red-500">Something went wrong</p>
                ) : null}
              </div>

              {secondaryAffiliations?.length >= 1 && (
                <div className="py-2">
                  <p className="text-red-500">
                    Note: Users affiliated with the secondary affiliation/s,
                    will now become affiliated with the primary affiliation.
                    Each secondary affiliation you selected will also be
                    deleted.
                  </p>
                </div>
              )}

              <DialogFooter className="grid grid-cols-2 gap-4">
                <Button onClick={() => setMergeIsOpen(false)} size="lg">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSubmitMerge({
                      primaryAffiliation,
                      secondaryAffiliations,
                    });
                  }}
                  disabled={
                    mergeMutation.isPending ||
                    secondaryAffiliations?.length < 1 ||
                    !primaryAffiliation
                  }
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-orange-500 hover:bg-orange-400" 
                      : "bg-orange-600 hover:bg-orange-500"
                  }`}
                  size="lg"
                >
                  Merge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={cleanIsOpen} onOpenChange={setCleanIsOpen}>
            <DialogContent className={`${
              colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
            } p-4 px-6`}>
              <DialogHeader>
                <DialogTitle>Clean Orphaned Affiliations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="w-full text-left">
                  <p>
                    This will remove all affiliations that have no links to any projects or users.
                  </p>
                  <p className="mt-2 text-orange-500">
                    Warning: This action cannot be undone. Orphaned affiliations will be permanently deleted.
                  </p>
                </div>

                {cleanMutation.isError ? (
                  <p className="text-red-500">Something went wrong</p>
                ) : null}
              </div>

              <DialogFooter className="grid grid-cols-2 gap-4">
                <Button onClick={() => setCleanIsOpen(false)} size="lg">
                  Cancel
                </Button>
                <Button
                  onClick={() => cleanMutation.mutate()}
                  disabled={cleanMutation.isPending}
                  className={`text-white ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-400" 
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                  size="lg"
                >
                  Clean
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};
