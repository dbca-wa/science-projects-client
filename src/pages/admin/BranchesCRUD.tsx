import { Head } from "@/shared/components/layout/base/Head";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { BranchItemDisplay } from "@/features/admin/components/BranchItemDisplay";
import { createBranch, getAllBranches } from "@/features/admin/services/admin.service";
import type { IBranch } from "@/shared/types";
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
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

export const BranchesCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IBranch>();
  const [addIsOpen, setAddIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number>();

  const nameData = watch("name");

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast.success("Created");
      setAddIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const onSubmitBranchCreation = (formData: IBranch) => {
    mutation.mutate(formData);
  };

  const onSubmit = (formData: IBranch) => {
    formData.manager = selectedUser;
    mutation.mutate(formData);
  };

  const { isLoading, data: slices } = useQuery<IBranch[]>({
    queryFn: getAllBranches,
    queryKey: ["branches"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IBranch[]>([]);
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
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);

  const { colorMode } = useColorMode();
  return (
    <>
      <Head title="Branches" />
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <h2 className="font-semibold text-lg">
                Branches ({countOfItems})
              </h2>
            </div>
            <div className="flex w-full mt-4">
              <Input
                type="text"
                placeholder="Search branch by name"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-2/3"
              />

              <div className="flex justify-end w-full">
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
              className={`grid grid-cols-[6fr_3fr_3fr] mt-4 w-full p-3 border ${
                filteredSlices.length === 0 ? "border-b" : "border-b-0"
              }`}
            >
              <div className="flex justify-start">
                <span className="font-bold">Branch</span>
              </div>
              <div className="flex">
                <span className="font-bold">Manager</span>
              </div>
              <div className="flex justify-end mr-2">
                <span className="font-bold">Change</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <BranchItemDisplay
                    key={s.pk}
                    pk={s.pk}
                    name={s.name}
                    manager={s.manager}
                    agency={s.agency}
                    old_id={s.old_id}
                  />
                ))}
            </div>
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Add Branch</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div
                  className="space-y-10"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <input
                    {...register("agency", { required: true })}
                    value={1}
                    required
                    type="hidden"
                  />
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoFocus
                      autoComplete="off"
                      {...register("name", { required: true })}
                    />
                  </div>
                  <div>
                    <UserSearchDropdown
                      {...register("manager", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedUser}
                      label="Manager"
                      placeholder="Search for a user"
                      helperText={"The manager of the branch."}
                    />
                  </div>
                  {mutation.isError ? (
                    <p className="text-red-500">Something went wrong</p>
                  ) : null}
                </div>
              </div>
              <SheetFooter>
                <Button
                  onClick={() => {
                    console.log("clicked");
                    onSubmitBranchCreation({
                      old_id: 1, //default
                      agency: 1, // dbca
                      name: nameData,
                      manager: selectedUser,
                    });
                  }}
                  disabled={mutation.isPending}
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
        </>
      )}
    </>
  );
};
