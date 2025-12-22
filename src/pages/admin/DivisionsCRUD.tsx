import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createDivision, getAllDivisions } from "@/features/admin/services/admin.service";
import _ from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import type { IDivision } from "@/shared/types";
import { DivisionItemDisplay } from "@/features/admin/components/DivisionItemDisplay";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { Head } from "@/shared/components/layout/base/Head";

export const DivisionsCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IDivision>();

  const [selectedDirector, setSelectedDirector] = useState<number>();
  const [selectedApprover, setSelectedApprover] = useState<number>();
  const nameData = watch("name");
  const slugData = watch("slug");

  const [addIsOpen, setAddIsOpen] = useState(false);
  const onAddOpen = () => setAddIsOpen(true);
  const onAddClose = () => setAddIsOpen(false);
  
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createDivision,
    onSuccess: (data: IDivision) => {
      // console.log("success")
      toast.success("Created");
      console.log(data);
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
    onError: () => {
      console.log("error");
      toast.error("Failed");
    },
    onMutate: () => {
      console.log("mutation");
    },
  });

  const onSubmit = (formData: IDivision) => {
    console.log(formData);
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IDivision[]>({
    queryFn: getAllDivisions,
    queryKey: ["divisions"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IDivision[]>([]);
  const [countOfItems, setCountOfItems] = useState(0);

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

  useEffect(() => {
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);

  const debouncedHandleSearchChange = useRef(
    _.debounce((searchTerm: string, slices: IDivision[]) => {
      let filteredSlices: IDivision[] = [];

      if (searchTerm) {
        for (const slice in slices) {
          filteredSlices = filteredSlices.concat(
            slices.filter((sl) =>
              sl.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          );
        }
      } else {
        for (const slice in slices) {
          filteredSlices = filteredSlices.concat(slices);
        }
      }

      setFilteredSlices(filteredSlices);
      setSearchLoading(false);
    }, 100),
  ).current;

  // const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
  //     setSearchTerm(e.currentTarget.value);
  // };

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newSearchTerm = e.currentTarget.value;
    setSearchTerm(newSearchTerm);
    setSearchLoading(true);

    if (slices) {
      debouncedHandleSearchChange(newSearchTerm, slices);
    }
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Head title="Divisions" />
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <p className="font-semibold text-lg">
                Divisions ({countOfItems})
              </p>
            </div>
            <div className="flex w-full mt-4">
              <Input
                type="text"
                placeholder="Search division by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-[65%]"
              />

              <div className="flex justify-end w-full">
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
                  className="grid mt-4 w-full p-3 border border-b-0"
                  style={{ gridTemplateColumns: "4fr 2fr 2fr 2fr 1fr" }}
                >
                  <div className="flex justify-start">
                    <p className="font-bold">Division</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">Slug</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">Director</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">Approver</p>
                  </div>
                  <div className="flex justify-end mr-2">
                    <p className="font-bold">Change</p>
                  </div>
                </div>

                {searchLoading ? (
                  <div className="flex justify-center w-full min-h-[100px] pt-10">
                    <Loader2 className="h-12 w-12 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1">
                    {filteredSlices
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((s) => (
                        <DivisionItemDisplay
                          key={s.pk}
                          pk={s.pk}
                          name={s.name}
                          director={s.director}
                          approver={s.approver}
                          slug={s.slug}
                          old_id={s.old_id}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add Division</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div
                  className="space-y-6"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoComplete="off"
                      autoFocus
                      {...register("name", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...register("slug", { required: true })}
                      required
                      type="text"
                      placeholder="eg. BCS"
                    />
                  </div>

                  <div className="space-y-2">
                    <UserSearchDropdown
                      {...register("director", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedDirector}
                      label="Director"
                      placeholder="Search for a user..."
                      helperText={"The director of the Division"}
                    />
                  </div>
                  <div className="space-y-2">
                    <UserSearchDropdown
                      {...register("approver", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedApprover}
                      label="Approver"
                      placeholder="Search for a user..."
                      helperText={"The approver of the Division"}
                    />
                  </div>
                  {mutation.isError ? (
                    <p className="text-red-500">Something went wrong</p>
                  ) : null}
                </div>
              </div>
              <SheetFooter>
                <Button
                  disabled={mutation.isPending}
                  className={`text-white w-full ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-400" 
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                  onClick={() => {
                    console.log("clicked");
                    onSubmit({
                      old_id: 1,
                      name: nameData,
                      slug: slugData,
                      approver: selectedApprover,
                      director: selectedDirector,
                    });
                  }}
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
