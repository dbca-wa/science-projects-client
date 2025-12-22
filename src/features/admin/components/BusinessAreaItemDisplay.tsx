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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcOk } from "react-icons/fc";
import { ImCross } from "react-icons/im";
import { MdMoreVert } from "react-icons/md";
import {
  activateBusinessArea,
  deleteBusinessArea,
  updateBusinessArea,
} from "@/features/admin/services/admin.service";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import useDistilledHtml from "@/shared/hooks/useDistilledHtml";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import {
  BusinessAreaImage,
  IBusinessArea,
  IBusinessAreaUpdate,
  IDivision,
} from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { UserProfile } from "@/features/users/components/UserProfile";
import { StatefulMediaChanger } from "./StatefulMediaChanger";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useColorMode } from "@/shared/utils/theme.utils";

export const BusinessAreaItemDisplay = ({
  pk,
  slug,
  name,
  division,
  leader,
  is_active,
  finance_admin,
  data_custodian,
  focus,
  introduction,
  image,
}: IBusinessArea) => {
  const { register, handleSubmit } = useForm<IBusinessAreaUpdate>();
  
  // State for all modals (replacing useDisclosure hooks)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isActiveModalOpen, setIsActiveModalOpen] = useState(false);

  // Modal control functions
  const onDeleteModalOpen = () => setIsDeleteModalOpen(true);
  const onDeleteModalClose = () => setIsDeleteModalOpen(false);
  const onUpdateModalOpen = () => setIsUpdateModalOpen(true);
  const onUpdateModalClose = () => setIsUpdateModalOpen(false);
  const onActiveModalOpen = () => setIsActiveModalOpen(true);
  const onActiveModalClose = () => setIsActiveModalOpen(false);

  const queryClient = useQueryClient();

  const { userLoading: leaderLoading, userData: leaderData } =
    useFullUserByPk(leader);
  const { userLoading: financeAdminLoading, userData: financeAdminData } =
    useFullUserByPk(finance_admin);
  const { userLoading: dataCustodianLoading, userData: dataCustodianData } =
    useFullUserByPk(data_custodian);

  const NoImageFile = useNoImage();
  const apiEndpoint = useApiEndpoint();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    (image as BusinessAreaImage)?.file
      ? `${(image as BusinessAreaImage).file}`
      : null,
  );

  const distlledTitle = useDistilledHtml(name);

  // console.log(image.file)
  const updateMutation = useMutation({
    mutationFn: updateBusinessArea,
    onSuccess: () => {
      // console.log("success")
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
      onUpdateModalClose();
    },
    onError: () => {
      // console.log("error")
      toast.error("Failed");
    },
    onMutate: () => {
      // console.log("attempting update private")
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBusinessArea,
    onSuccess: () => {
      // console.log("success")
      toast.success("Deleted");
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
    },
    onError: () => {
      // console.log("error")
    },
    onMutate: () => {
      // console.log("mutation")
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const activateMutation = useMutation({
    mutationFn: activateBusinessArea,
    onSuccess: () => {
      // console.log("success")
      toast.success(is_active ? "Deactivated" : "Activated");
      onActiveModalClose();
      queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
    },
    onError: () => {
      // console.log("error")
    },
    onMutate: () => {
      // console.log("mutation")
    },
  });

  const activateButtonClicked = () => {
    activateMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IBusinessAreaUpdate) => {
    // console.log(formData);

    const {
      pk,
      agency,
      is_active,
      old_id,
      name,
      slug,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
    } = formData;
    const image = selectedFile;

    // console.log(baDivision)

    const payload = {
      pk,
      agency,
      is_active,
      old_id,
      name,
      slug,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
      image,
      selectedImageUrl,
      division: baDivision,
    };
    // console.log(payload)
    // Create an object to pass as a single argument to mutation.mutate
    if (!selectedFile) {
      console.log("WITHOUT IMAGE:", payload);
    } else {
      console.log("WITH IMAGE:", payload);
    }
    // console.log(selectedImageUrl);

    updateMutation.mutate(payload);
  };

  // State for drawer modals (replacing useDisclosure hooks)
  const [isLeaderOpen, setIsLeaderOpen] = useState(false);
  const [isDataCustodianOpen, setIsDataCustodianOpen] = useState(false);
  const [isFinanceAdminOpen, setIsFinanceAdminOpen] = useState(false);

  // Drawer control functions
  const onLeaderOpen = () => setIsLeaderOpen(true);
  const onLeaderClose = () => setIsLeaderOpen(false);
  const onDataCustodianOpen = () => setIsDataCustodianOpen(true);
  const onDataCustodianClose = () => setIsDataCustodianOpen(false);
  const onFinanceAdminOpen = () => setIsFinanceAdminOpen(true);
  const onFinanceAdminClose = () => setIsFinanceAdminOpen(false);

  const leaderDrawerFunction = () => {
    // console.log(`${leaderData?.first_name} clicked`);
    onLeaderOpen();
  };
  const financeAdminDrawerFunction = () => {
    // console.log(`${financeAdminData?.first_name} clicked`);
    onFinanceAdminOpen();
  };
  const dataCustodianDrawerFunction = () => {
    // console.log(`${dataCustodianData?.first_name} clicked`);
    onDataCustodianOpen();
  };

  const [selectedLeader, setSelectedLeader] = useState<number>();
  const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
  const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
  // const nameData = watch("name");
  // const slugData = watch('slug');
  // const focusData = watch("focus");
  // const introductionData = watch("introduction");
  // const imageData = watch("image");

  const { colorMode } = useColorMode();

  const [nameData, setNameData] = useState(name);
  const [focusData, setFocusData] = useState(focus);
  const [introductionData, setIntroductionData] = useState(introduction);

  const { divsLoading, divsData } = useGetDivisions();

  const [baDivision, setBaDivision] = useState<number>(
    (division as IDivision).pk,
  );

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      {!leaderLoading && leaderData ? (
        <Sheet open={isLeaderOpen} onOpenChange={setIsLeaderOpen}>
          <SheetContent side="right" className="w-96">
            <UserProfile pk={leader} />
          </SheetContent>
        </Sheet>
      ) : null}

      {!dataCustodianLoading &&
        dataCustodianData !== null &&
        dataCustodianData !== undefined && (
          <Sheet open={isDataCustodianOpen} onOpenChange={setIsDataCustodianOpen}>
            <SheetContent side="right" className="w-96">
              <UserProfile pk={data_custodian} />
            </SheetContent>
          </Sheet>
        )}

      {!financeAdminLoading &&
        financeAdminData !== null &&
        financeAdminData !== undefined && (
          <Sheet open={isFinanceAdminOpen} onOpenChange={setIsFinanceAdminOpen}>
            <SheetContent side="right" className="w-96">
              <UserProfile pk={finance_admin} />
            </SheetContent>
          </Sheet>
        )}

      <div className="grid grid-cols-[2fr_4fr_3fr_3fr_3fr_1fr] w-full p-3 border border-border">
        <div className="flex justify-start items-center relative">
          {name ? (
            <Skeleton className={`rounded-lg w-20 h-[69px] relative cursor-pointer ${imageLoaded ? '' : 'animate-pulse'} shadow-lg ${colorMode === "dark" ? "border border-gray-700" : ""}`}>
              <div className="rounded-lg w-20 h-[69px] relative">
                <img
                  onLoad={() => setImageLoaded(true)}
                  src={
                    image instanceof File
                      ? `${apiEndpoint}${image.name}` // Use the image directly for File
                      : image?.file
                        ? `${apiEndpoint}${image.file}`
                        : NoImageFile
                  }
                  className={`rounded-lg w-full h-full object-cover ${!is_active ? "grayscale" : ""}`}
                  alt={name}
                />
                <div className="absolute -bottom-1 -right-1 text-red-500">
                  {is_active ? (
                    <FcOk size={24} />
                  ) : (
                    <ImCross size={18} />
                  )}
                </div>
              </div>
            </Skeleton>
          ) : (
            <Skeleton className="rounded-lg w-20 h-[69px]" />
          )}
        </div>
        {/* <Box>{is_active ? "Active" : "Inactive"}</Box> */}
        <TextButtonFlex
          // name={name}
          name={`${distlledTitle} ${!is_active ? "(Inactive)" : ""}`}
          onClick={onUpdateModalOpen}
        />
        <TextButtonFlex
          name={
            leaderData
              ? `${leaderData.first_name} ${leaderData.last_name}`
              : "-"
          }
          onClick={leaderDrawerFunction}
        />

        {!financeAdminLoading && financeAdminData ? (
          <TextButtonFlex
            name={
              financeAdminData
                ? `${financeAdminData.first_name} ${financeAdminData.last_name}`
                : "-"
            }
            onClick={financeAdminDrawerFunction}
          />
        ) : (
          <TextButtonFlex />
        )}

        {!dataCustodianLoading && dataCustodianData ? (
          <TextButtonFlex
            name={
              dataCustodianData
                ? `${dataCustodianData.first_name} ${dataCustodianData.last_name}`
                : "-"
            }
            onClick={dataCustodianDrawerFunction}
          />
        ) : (
          <TextButtonFlex />
        )}

        <div className="flex justify-end mr-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-2 transition-all duration-200 rounded border hover:bg-gray-400 focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center">
                  <MdMoreVert />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onUpdateModalOpen}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onActiveModalOpen}>
                Change Active Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteModalOpen}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* </Button> */}
        </div>
      </div>
      <Dialog open={isActiveModalOpen} onOpenChange={setIsActiveModalOpen}>
        <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
          <DialogHeader>
            <DialogTitle>
              {is_active ? "Deactivate Business Area?" : "Activate Business Area"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to {is_active ? "deactivate" : "activate"}{" "}
              this business area?
            </p>

            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{name}"
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button onClick={() => setIsActiveModalOpen(false)} variant="outline">
                No
              </Button>
              <Button
                onClick={activateButtonClicked}
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-600 hover:bg-green-500"
                }`}
              >
                Yes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
          <DialogHeader>
            <DialogTitle>Delete Business Area</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this business area?
            </p>

            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{name}"
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Yes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className={`max-w-4xl ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"} p-4 px-6 max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>Update Business Area</DialogTitle>
          </DialogHeader>

          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />
          </div>
          <div>
            {/* Hidden input to capture the slug */}
            <input
              type="hidden"
              {...register("slug")}
              defaultValue={slug} // Prefill with the 'pk' prop
            />
          </div>
          <div
            className="space-y-3"
            onSubmit={handleSubmit(onUpdateSubmit)}
          >
            <div className="mb-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoFocus
                autoComplete="off"
                value={nameData}
                onChange={(e) => setNameData(e.target.value)}
                tabIndex={-1}
                // trapFocus={false}
                // restoreFocus={false}
                // {...register("name", { required: true })}
              />
            </div>

            {!divsLoading && divsData && baDivision ? (
              <div className="mb-2">
                <Label htmlFor="division">Division</Label>
                <Select
                  value={baDivision.toString()}
                  onValueChange={(value) => {
                    setBaDivision(Number(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divsData?.map((div) => (
                      <SelectItem key={div.pk} value={div.pk.toString()}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  The division the business area belongs to
                </p>
              </div>
            ) : null}

            {/* <UnboundStatefulEditor
              title="Business Area Name"
              helperText={"Name of Business Area"}
              showToolbar={false}
              showTitle={true}
              isRequired={true}
              value={nameData}
              setValueFunction={setNameData}
              setValueAsPlainText={false}
            /> */}
            <UnboundStatefulEditor
              title="Introduction"
              helperText={"A description of the Business Area"}
              showToolbar={true}
              showTitle={true}
              isRequired={true}
              value={introductionData}
              setValueFunction={setIntroductionData}
              setValueAsPlainText={false}
              tabbable={false}
            />

            <UnboundStatefulEditor
              title="Focus"
              helperText={"Primary concerns of the Business Area"}
              showToolbar={true}
              showTitle={true}
              isRequired={true}
              value={focusData}
              setValueFunction={setFocusData}
              setValueAsPlainText={false}
              tabbable={false}
            />

            <div className="pb-4">
              <Label className="ml-2">Image</Label>
              <StatefulMediaChanger
                helperText="Drag and drop an image for the Business Area"
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                selectedImageUrl={selectedImageUrl}
                setSelectedImageUrl={setSelectedImageUrl}
              />
            </div>

            <div className="mt-3 ml-2">
              <UserSearchDropdown
                {...register("leader", { required: true })}
                onlyInternal={true}
                isRequired={false}
                setUserFunction={setSelectedLeader}
                preselectedUserPk={leader}
                isEditable
                label="Leader"
                placeholder="Search for a user"
                helperText={"The Leader of the business area."}
              />
            </div>

            <div className="ml-2">
              <UserSearchDropdown
                {...register("finance_admin", {
                  required: true,
                })}
                onlyInternal={true}
                isRequired={false}
                setUserFunction={setSelectedFinanceAdmin}
                preselectedUserPk={finance_admin}
                isEditable
                label="Finance Admin"
                placeholder="Search for a user"
                helperText={"The Finance Admin of the business area."}
              />
            </div>
            <div className="ml-2">
              <UserSearchDropdown
                {...register("data_custodian", {
                  required: true,
                })}
                onlyInternal={true}
                isRequired={false}
                setUserFunction={setSelectedDataCustodian}
                preselectedUserPk={data_custodian}
                isEditable
                label="Data Custodian"
                placeholder="Search for a user"
                helperText={"The Data Custodian of the business area."}
              />
            </div>
            {updateMutation.isError ? (
              <p className="text-red-500">Something went wrong</p>
            ) : null}
          </div>
          <div className="mt-10 w-full flex justify-end gap-4">
            <Button onClick={() => setIsUpdateModalOpen(false)} size="lg">
              Cancel
            </Button>
            <Button
              // form="update-form"
              // type="submit"
              disabled={updateMutation.isPending}
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              size="lg"
              onClick={() => {
                onUpdateSubmit({
                  pk: pk,
                  agency: 1,
                  is_active: is_active,
                  old_id: 1,
                  name: nameData,
                  slug: slug,
                  leader: selectedLeader,
                  data_custodian: selectedDataCustodian,
                  finance_admin: selectedFinanceAdmin,
                  focus: focusData,
                  introduction: introductionData,
                  image: selectedFile,
                });
              }}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
