import { Head } from "@/shared/components/layout/base/Head";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { ServiceItemDisplay } from "@/features/admin/components/ServiceItemDisplay";
import {
  createDepartmentalService,
  getAllDepartmentalServices,
} from "@/features/admin/services/admin.service";
import type { IDepartmentalService } from "@/shared/types";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const ServicesCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IDepartmentalService>();
  const [selectedDirector, setSelectedDirector] = useState<number>();
  const [addIsOpen, setAddIsOpen] = useState(false);
  const nameData = watch("name");

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createDepartmentalService,
    onSuccess: () => {
      toast.success("Created", {
        description: "Service created successfully",
      });
      setAddIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["departmentalServices"] });
    },
    onError: () => {
      console.log("error");
      toast.error("Failed", {
        description: "Failed to create service",
      });
    },
    onMutate: () => {
      console.log("mutation");
    },
  });
  const onSubmit = (formData: IDepartmentalService) => {
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IDepartmentalService[]>({
    queryFn: getAllDepartmentalServices,
    queryKey: ["departmentalServices"],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSlices, setFilteredSlices] = useState<IDepartmentalService[]>(
    [],
  );
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

  useEffect(() => {
    // Initialize filteredSlices with all items
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);
  return (
    <>
      <Head title="Services" />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <h2 className="text-lg font-semibold">
                Departmental Services ({countOfItems})
              </h2>
            </div>
            <div className="flex w-full mt-4 gap-4">
              <Input
                type="text"
                placeholder="Search service by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 max-w-[65%]"
              />

              <div className="flex justify-end flex-1">
                <Button
                  onClick={() => setAddIsOpen(true)}
                  className="bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <div
              className="grid grid-cols-[5fr_4fr_1fr] mt-4 w-full p-3 border border-b-0 last:border-b"
              style={{
                borderBottomWidth: filteredSlices.length === 0 ? "1px" : "0",
              }}
            >
              <div className="flex justify-start">
                <span className="font-bold">Service</span>
              </div>
              <div className="flex">
                <span className="font-bold">Executive Director</span>
              </div>
              <div className="flex justify-end mr-2">
                <span className="font-bold">Change</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <ServiceItemDisplay
                    key={s.pk}
                    pk={s.pk}
                    name={s.name}
                    director={s.director}
                  />
                ))}
            </div>
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add Service</SheetTitle>
                <SheetDescription>
                  Create a new departmental service
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <form
                  className="space-y-6"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoComplete="off"
                      autoFocus
                      {...register("name", { required: true })}
                      required
                      type="text"
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
                      isEditable
                      helperText={"The director of the Service"}
                    />
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
                  disabled={mutation.isPending}
                  className="bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 text-white w-full"
                  size="lg"
                  onClick={() => {
                    onSubmit({
                      old_id: 1,
                      name: nameData,
                      director: selectedDirector,
                    });
                  }}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
