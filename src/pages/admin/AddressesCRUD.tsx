import { Head } from "@/shared/components/layout/base/Head";
import { BranchSearchDropdown } from "@/features/admin/components/BranchSearchDropdown";
import { AddressItemDisplay } from "@/features/admin/components/AddressItemDisplay";
import { createAddress, getAllAddresses } from "@/features/admin/services/admin.service";
import type { IAddress, IBranch } from "@/shared/types";
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

export const AddressesCRUD = () => {
  const { register, handleSubmit, watch, reset } = useForm<IAddress>();
  const [addIsOpen, setAddIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      toast.success("Created", {
        description: "Address created successfully",
      });
      reset();
      setAddIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Failed to create address",
      });
    },
  });
  const onSubmitAddressCreation = (formData: IAddress) => {
    mutation.mutate(formData);
  };

  const { isLoading, data: slices } = useQuery<IAddress[]>({
    queryFn: getAllAddresses,
    queryKey: ["addresses"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IAddress[]>([]);
  const [countOfItems, setCountOfItems] = useState(0);

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  };

  useEffect(() => {
    if (slices) {
      const filtered = slices.filter((s) => {
        if (s.branch && typeof s.branch === "object") {
          const branch = s.branch as IBranch;
          const nameMatch = branch.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return nameMatch;
        }
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

  const [selectedBranch, setSelectedBranch] = useState<number>();

  const streetData = watch("street");
  const cityData = watch("city");
  const stateData = watch("state");
  const countryData = watch("country");
  const zipcodeData = watch("zipcode");
  const poboxData = watch("pobox");
  return (
    <>
      <Head title="Addresses" />
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <h2 className="text-lg font-semibold">
                Addresses ({countOfItems})
              </h2>
            </div>
            <div className="flex w-full mt-4 gap-4">
              <Input
                type="text"
                placeholder="Search address by branch"
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 max-w-[65%] z-0"
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
            {countOfItems === 0 ? (
              <div className="py-10 font-bold">
                <p>No results</p>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-[2fr_4fr_2fr_2fr_1fr_1fr] mt-4 w-full p-3 border border-b-0 last:border-b"
                  style={{
                    borderBottomWidth: filteredSlices.length === 0 ? "1px" : "0",
                  }}
                >
                  <div className="flex justify-start">
                    <span className="font-bold">Branch</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold">Street</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold">City</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold">Country</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold">PO Box</span>
                  </div>
                  <div className="flex justify-end mr-2">
                    <span className="font-bold">Change</span>
                  </div>
                </div>

                <div className="grid grid-cols-1">
                  {filteredSlices
                    .sort((a, b) => {
                      const nameA =
                        typeof a.branch === "object"
                          ? (a.branch as IBranch)?.name
                          : "";
                      const nameB =
                        typeof b.branch === "object"
                          ? (b.branch as IBranch)?.name
                          : "";
                      return nameA?.localeCompare(nameB);
                    })
                    .map((s) => (
                      <AddressItemDisplay
                        key={s.pk}
                        pk={s.pk}
                        street={s.street}
                        country={s.country}
                        city={s.city}
                        pobox={s.pobox}
                        branch={s.branch}
                        agency={s.agency}
                        suburb={s.suburb}
                        zipcode={s.zipcode}
                        state={s.state}
                      />
                    ))}
                </div>
              </>
            )}
          </div>

          <Sheet open={addIsOpen} onOpenChange={setAddIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add Address</SheetTitle>
                <SheetDescription>
                  Create a new address for a branch
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <form
                  className="space-y-4"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmitAddressCreation)}
                >
                  <div className="space-y-2">
                    <BranchSearchDropdown
                      {...register("branch", { required: true })}
                      autoFocus
                      isRequired={true}
                      setBranchFunction={setSelectedBranch}
                      isEditable
                      label="Branch"
                      placeholder="Search for a branch"
                      helperText={"The branch this address belongs to."}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      {...register("street", { required: true })}
                      required
                      type="text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zip Code</Label>
                    <Input
                      id="zipcode"
                      {...register("zipcode", { required: true })}
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register("state", { required: true })}
                      defaultValue="WA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register("country", { required: true })}
                      defaultValue="Australia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pobox">PO Box</Label>
                    <Input
                      id="pobox"
                      {...register("pobox", { required: false })}
                    />
                  </div>

                  {mutation.isError && (
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
                  )}
                </form>
              </div>
              <SheetFooter>
                <Button
                  disabled={mutation.isPending}
                  className="bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 text-white w-full"
                  size="lg"
                  onClick={() => {
                    console.log("clicked");
                    onSubmitAddressCreation({
                      // "agency": 1,
                      branch: selectedBranch,
                      street: streetData,
                      city: cityData,
                      zipcode: zipcodeData,
                      state: stateData,
                      country: countryData,
                      pobox: poboxData,
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
