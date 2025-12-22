import { UnboundStatefulEditor } from "@/shared/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { useGetDivisions } from "@/features/admin/hooks/useGetDivisions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createBusinessArea, getAllBusinessAreas } from "@/features/business-areas/services/business-areas.service";
import type { IBusinessArea, IBusinessAreaCreate } from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { BusinessAreaItemDisplay } from "@/features/admin/components/BusinessAreaItemDisplay";
import { StatefulMediaChanger } from "@/features/admin/components/StatefulMediaChanger";
import { Head } from "@/shared/components/layout/base/Head";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const BusinessAreasCRUD = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    // formState: { errors },
  } = useForm<IBusinessAreaCreate>();
  const [addIsOpen, setAddIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBusinessArea,
    onSuccess: () => {
      toast.success("Created", {
        description: "Business area created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
      clearFields();
      setAddIsOpen(false);
    },
    onError: () => {
      toast.error("Failed", {
        description: "Failed to create business area",
      });
    },
  });
  const onSubmit = (formData: IBusinessAreaCreate) => {
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IBusinessArea[]>({
    queryFn: getAllBusinessAreas,
    queryKey: ["businessAreas"],
  });

  // useEffect(() => {
  //   if (!isLoading) console.log(slices);
  // }, [isLoading, slices]);

  const [searchTerm, setSearchTerm] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const [filteredSlices, setFilteredSlices] = useState<IBusinessArea[]>([]);
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
      // console.log(filtered)

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

  const nameData = watch("name");
  // const slugData = watch("slug");
  // const focusData = watch("focus");
  const [focus, setFocus] = useState("");
  const [introduction, setIntroduction] = useState("");
  // const introductionData = watch("introduction");
  const imageData = watch("image");
  const [selectedLeader, setSelectedLeader] = useState<number>();
  const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
  const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
  const [division, setDivision] = useState<number>();

  const clearFields = () => {
    reset();
    setSelectedDataCustodian(undefined);
    setSelectedFinanceAdmin(undefined);
    setSelectedLeader(undefined);
    setSelectedFile(null);
    setSelectedImageUrl(null);
  };

  useEffect(() => {
    if (
      division &&
      introduction?.length >= 5 &&
      focus?.length >= 5 &&
      nameData?.length >= 5
    ) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [nameData, focus, introduction, division]);

  const onSubmitBusinessAreaCreation = (formData: IBusinessAreaCreate) => {
    const {
      // old_id,
      // slug,
      agency,
      is_active,
      name,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
    } = formData;
    const image = selectedFile;

    // Create an object to pass as a single argument to mutation.mutate
    const payload = {
      // old_id,
      // slug,
      agency,
      is_active,
      name,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
      image,
      division,
    };
    console.log(payload);
    mutation.mutate(payload);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>();

  const { divsData, divsLoading } = useGetDivisions();

  return (
    <>
      <Head title="Business Areas" />
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full">
            <div>
              <h2 className="text-lg font-semibold">
                Business Areas ({countOfItems})
              </h2>
            </div>
            <div className="flex w-full mt-4 gap-4">
              <Input
                type="text"
                placeholder="Search business area by name"
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
              className="grid grid-cols-[2fr_4fr_3fr_3fr_3fr_1fr] mt-4 w-full p-3 border border-b-0 last:border-b"
              style={{
                borderBottomWidth: filteredSlices.length === 0 ? "1px" : "0",
              }}
            >
              <div className="flex justify-start">
                <span className="font-bold">Image</span>
              </div>
              <div className="flex">
                <span className="font-bold">Business Area</span>
              </div>
              <div className="flex">
                <span className="font-bold">Leader</span>
              </div>
              <div className="flex">
                <span className="font-bold">Finance Admin</span>
              </div>
              <div className="flex">
                <span className="font-bold">Data Custodian</span>
              </div>
              <div className="flex justify-end mr-2">
                <span className="font-bold">Change</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {filteredSlices
                .sort((a, b) => {
                  const parserA = new DOMParser();
                  const docA = parserA.parseFromString(a.name, "text/html");
                  const contentA = docA.body.textContent;

                  const parserB = new DOMParser();
                  const docB = parserB.parseFromString(b.name, "text/html");
                  const contentB = docB.body.textContent;

                  return contentA.localeCompare(contentB);
                })
                .map((s) => (
                  <BusinessAreaItemDisplay
                    key={s.pk}
                    is_active={s.is_active}
                    pk={s.pk}
                    slug={s.slug}
                    name={s.name}
                    leader={s.leader}
                    finance_admin={s.finance_admin}
                    data_custodian={s.data_custodian}
                    focus={s.focus}
                    introduction={s.introduction}
                    image={s.image}
                    division={s.division}
                  />
                ))}
            </div>
          </div>

          <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Business Area</DialogTitle>
                <DialogDescription>
                  Create a new business area
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <form
                  className="space-y-6"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {!divsLoading && (
                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select
                        value={division?.toString()}
                        onValueChange={(value) => setDivision(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divsData?.map((divi) => (
                            <SelectItem key={divi.pk} value={divi.pk.toString()}>
                              [{divi.slug}] {divi.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      autoComplete="off"
                      autoFocus
                      {...register("name", { required: true })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Name of the Business Area
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Focus *</Label>
                    <UnboundStatefulEditor
                      title={"Focus"}
                      showTitle={false}
                      isRequired={false}
                      showToolbar={true}
                      setValueAsPlainText={false}
                      value={focus}
                      setValueFunction={setFocus}
                    />
                    <p className="text-sm text-muted-foreground">
                      Primary concerns of the Business Area
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Introduction *</Label>
                    <UnboundStatefulEditor
                      title={"Introduction"}
                      showTitle={false}
                      isRequired={false}
                      showToolbar={true}
                      setValueAsPlainText={false}
                      value={introduction}
                      setValueFunction={setIntroduction}
                    />
                    <p className="text-sm text-muted-foreground">
                      A description of the Business Area
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Image *</Label>
                    <StatefulMediaChanger
                      helperText={
                        "Upload an image that represents the Business Area."
                      }
                      selectedImageUrl={selectedImageUrl}
                      setSelectedImageUrl={setSelectedImageUrl}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  </div>

                  <div className="space-y-2">
                    <UserSearchDropdown
                      {...register("leader", { required: true })}
                      onlyInternal={false}
                      isRequired={false}
                      setUserFunction={setSelectedLeader}
                      label="Leader"
                      placeholder="Search for a user..."
                      helperText={"The leader of the Business Area"}
                    />
                  </div>

                  <div className="space-y-2">
                    <UserSearchDropdown
                      {...register("finance_admin", { required: true })}
                      onlyInternal={false}
                      isRequired={false}
                      setUserFunction={setSelectedFinanceAdmin}
                      label="Finance Admin"
                      placeholder="Search for a user..."
                      helperText={"The finance admin of the Business Area"}
                    />
                  </div>

                  <div className="space-y-2">
                    <UserSearchDropdown
                      {...register("data_custodian", { required: true })}
                      onlyInternal={false}
                      isRequired={false}
                      setUserFunction={setSelectedDataCustodian}
                      label="Data Custodian"
                      placeholder="Search for a user..."
                      helperText={"The data custodian of the Business Area"}
                    />
                  </div>

                  {mutation.isError ? (
                    <div className="mt-4">
                      {Object.keys(
                        (mutation.error as AxiosError)?.response?.data,
                      ).map((key) => (
                        <div key={key}>
                          {(
                            (mutation.error as AxiosError)?.response?.data[
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
              <DialogFooter>
                <Button
                  disabled={!canSubmit || mutation.isPending}
                  className="bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 text-white w-full"
                  size="lg"
                  onClick={() => {
                    onSubmitBusinessAreaCreation({
                      agency: 1,
                      is_active: true,
                      name: nameData,
                      focus: focus,
                      introduction: introduction,
                      image: imageData,
                      leader: selectedLeader,
                      data_custodian: selectedDataCustodian,
                      finance_admin: selectedFinanceAdmin,
                    });
                  }}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};
