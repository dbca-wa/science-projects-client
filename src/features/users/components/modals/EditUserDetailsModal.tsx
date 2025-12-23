// Modal for editing user details

import { useUser } from "@/features/users/hooks/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AiFillPhone } from "react-icons/ai";
import { GiGraduateCap } from "react-icons/gi";
import { GrMail } from "react-icons/gr";
import { MdFax } from "react-icons/md";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import {
  IFullUserUpdateVariables,
  MutationError,
  MutationSuccess,
  adminUpdateUser,
  removeUserAvatar,
} from "@/features/users/services/users.service";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IAffiliation, IBranch, IBusinessArea, IUserData } from "@/shared/types";
import { AffiliationCreateSearchDropdown } from "@/features/admin/components/AffiliationCreateSearchDropdown";
import { StatefulMediaChanger } from "@/features/admin/components/StatefulMediaChanger";
import DatabaseRichTextEditor from "@/features/staff-profiles/components/Editor/DatabaseRichTextEditor";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";
import { cn } from "@/shared/utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserData;
  branches: IBranch[] | undefined;
  businessAreas: IBusinessArea[] | undefined;
}

export const EditUserDetailsModal = ({
  isOpen,
  onClose,
  user,
  branches,
  businessAreas,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    if (isToastOpen) {
      onClose(); // Close the modal when the toast is shown
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    setIsToastOpen(false);
    onClose(); // Close the modal when the toast is manually closed
  };

  const { userLoading, userData } = useFullUserByPk(user.pk);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    control,
    watch,
  } = useForm<IFullUserUpdateVariables>();

  // PI ====================================================
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const titleBorderColor = `${
    colorMode === "light"
      ? hoveredTitle
        ? "border-gray-300"
        : "border-gray-200"
      : hoveredTitle
        ? "border-gray-400"
        : "border-gray-300"
  }`;

  // // Regex for validity of phone variable
  const phoneValidationPattern = /^(\+)?[\d\s]+$/;

  // Profile ====================================================
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [aboutValue, setAboutValue] = useState(userData?.about || "");
  const [expertiseValue, setExpertiseValue] = useState(
    userData?.expertise || "",
  );
  const [activeOption, setActiveOption] = useState<"url" | "upload">(
    userData?.image?.old_file ? "url" : "upload",
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    userData?.image?.file || userData?.image?.old_file || null,
  );
  const isValidImageUrl =
    (selectedImageUrl !== null &&
      selectedImageUrl !== undefined &&
      selectedImageUrl?.startsWith("https") &&
      selectedImageUrl.trim() !== "" &&
      selectedImageUrl.match(/\.(jpg|jpeg|png)$/i)) ||
    selectedImageUrl?.startsWith("https://imagedelivery.net/");
  const handleImageLoadError = () => {
    setImageLoadFailed(true);
  };

  const handleImageLoadSuccess = () => {
    setImageLoadFailed(false);
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!userLoading) {
      setAboutValue(userData?.about || "");
      setExpertiseValue(userData?.expertise || "");
    }
  }, [userData, userLoading]);

  const { reFetch } = useUserSearchContext();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const fullMutation = useMutation<
    MutationSuccess,
    MutationError,
    IFullUserUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: adminUpdateUser,
    onMutate: () => {
      toast.loading("Updating membership...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`user`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`personalInfo`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`membership`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`profile`, user.pk] });
      reFetch();
      toast.success("Success", {
        description: `Information Updated`,
      });
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while updating"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      toast.error("Update failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async ({
    display_first_name,
    display_last_name,
    userPk,
    title,
    phone,
    fax,
    branch,
    business_area,
    about,
    expertise,
    affiliation,
  }: IFullUserUpdateVariables) => {
    const image = activeOption === "url" ? selectedImageUrl : selectedFile;
    // console.log(affiliation);
    await fullMutation.mutateAsync({
      display_first_name,
      display_last_name,
      userPk,
      title,
      phone,
      fax,
      branch,
      business_area,
      image,
      about,
      expertise,
      affiliation,
    });
  };

  // useEffect(() => {
  //   if (!isValid) {
  //     console.log("Form validation errors:", errors);
  //   }
  // }, [errors, isValid]);
  const me = useUser();
  // useEffect(() => console.log({ user, userData }), [user, userData]);

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent className={cn(
        "max-w-4xl",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <DialogHeader>
          <DialogTitle>Edit User?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} id="edit-details" className="flex flex-col">
          <div className="flex-1 px-6 py-4">
            {!userLoading && (
              <Tabs defaultValue="base" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="base">Base Information</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="organisation">Organisation</TabsTrigger>
                </TabsList>
                <TabsContent value="base" className="space-y-4">
                    {!userLoading && (
                      <>
                        <div className="my-2 mb-4 select-none">
                          <div className="w-full">
                            <Input
                              autoComplete="off"
                              type="hidden"
                              {...register("userPk", {
                                required: true,
                                value: user.pk,
                              })}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Title */}
                          <div className="my-2 mb-4 select-none">
                            <Label
                              onMouseEnter={() => setHoveredTitle(true)}
                              onMouseLeave={() => setHoveredTitle(false)}
                            >
                              Title
                            </Label>

                            <div className="flex">
                              <div className={cn(
                                "flex items-center justify-center px-3 bg-transparent border border-r-0 rounded-l-md",
                                titleBorderColor
                              )}>
                                <GiGraduateCap className="h-4 w-4" />
                              </div>
                              <Select
                                onValueChange={(value) => setValue("title", value)}
                                defaultValue={userData?.title}
                                onOpenChange={(open) => {
                                  if (open) setHoveredTitle(true);
                                  else setHoveredTitle(false);
                                }}
                              >
                                <SelectTrigger className="rounded-l-none border-l-0">
                                  <SelectValue placeholder="Select a title" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dr">Dr</SelectItem>
                                  <SelectItem value="mr">Mr</SelectItem>
                                  <SelectItem value="mrs">Mrs</SelectItem>
                                  <SelectItem value="ms">Ms</SelectItem>
                                  <SelectItem value="aprof">A/Prof</SelectItem>
                                  <SelectItem value="prof">Prof</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {errors.title && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.title.message}
                              </p>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="my-2 mb-4 select-none">
                            <Label>Phone</Label>
                            <div className="relative">
                              <AiFillPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder="Enter a phone number"
                                className="pl-10"
                                {...register("phone", {
                                  pattern: {
                                    value: phoneValidationPattern,
                                    message: "Invalid phone number",
                                  },
                                  value: userData?.phone,
                                })}
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>

                          {/* Fax */}
                          <div className="my-2 mb-4 select-none">
                            <Label>Fax</Label>
                            <div className="relative">
                              <MdFax className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder="Enter a fax number"
                                className="pl-10"
                                {...register("fax", {
                                  pattern: {
                                    value: phoneValidationPattern,
                                    message: "Invalid fax number",
                                  },
                                  value: userData?.fax,
                                })}
                              />
                            </div>
                            {errors.fax && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.fax.message}
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="my-2 mb-4 select-none">
                            <Label>Email</Label>
                            <div className="relative">
                              <GrMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="email"
                                placeholder={userData?.email}
                                value={userData?.email}
                                disabled={true}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          {/* First Name */}
                          <div className="my-2 mb-4 select-none">
                            <Label>First Name</Label>
                            <div className="relative">
                              <RiNumber1 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder={
                                  userData?.display_first_name ??
                                  userData?.first_name
                                }
                                className="pl-10"
                                {...register("display_first_name", {
                                  value:
                                    userData?.display_first_name ??
                                    userData?.first_name,
                                })}
                                disabled={!me?.userData?.is_superuser}
                              />
                            </div>
                          </div>

                          {/* Last Name */}
                          <div className="my-2 mb-4 select-none">
                            <Label>Last Name</Label>
                            <div className="relative">
                              <RiNumber2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="text"
                                disabled={!me?.userData?.is_superuser}
                                placeholder={
                                  userData?.display_last_name ??
                                  userData?.last_name
                                }
                                className="pl-10"
                                {...register("display_last_name", {
                                  value:
                                    userData?.display_last_name ??
                                    userData?.last_name,
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </TabsContent>
                <TabsContent value="profile" className="space-y-4">
                    {!userLoading && (
                      <div className="grid gap-4">
                        <div className="my-2">
                          <Controller
                            name="about"
                            control={control}
                            defaultValue={userData?.about || ""}
                            render={({ field }) => (
                              <DatabaseRichTextEditor
                                populationData={userData?.about || ""}
                                label="About"
                                // hideLabel
                                htmlFor="about"
                                isEdit
                                field={field}
                                registerFn={register}
                                // isMobile={!isDesktop}
                              />
                            )}
                          />
                        </div>
                        <div className="my-2">
                          <Controller
                            name="expertise"
                            control={control}
                            defaultValue={userData?.expertise || ""}
                            render={({ field }) => (
                              <DatabaseRichTextEditor
                                populationData={userData?.expertise || ""}
                                label="Expertise"
                                // hideLabel
                                htmlFor="expertise"
                                isEdit
                                field={field}
                                registerFn={register}
                                // isMobile={!isDesktop}
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label>Image</Label>
                          <StatefulMediaChanger
                            helperText={"Upload an image that represents you."}
                            selectedImageUrl={selectedImageUrl}
                            setSelectedImageUrl={setSelectedImageUrl}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            clearImageAddedFunctionality={async () => {
                              const data = await removeUserAvatar({
                                pk: Number(userData?.pk),
                              });
                              queryClient.refetchQueries({
                                queryKey: ["users", userData?.pk],
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
                </TabsContent>
                <TabsContent value="organisation" className="space-y-4">
                    {!userLoading && userData.is_staff && (
                      <div className="grid gap-4">
                        {/* Branch */}
                        <div className="my-2 mb-4 select-none">
                          <Label>Branch</Label>
                          <div className="w-full">
                            {branches && (
                              <Select
                                onValueChange={(value) => setValue("branch", value)}
                                defaultValue={userData?.branch?.pk?.toString() || ""}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {branches.map(
                                    (branch: IBranch, index: number) => {
                                      return (
                                        <SelectItem key={index} value={branch.pk.toString()}>
                                          {branch.name}
                                        </SelectItem>
                                      );
                                    },
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Business Area */}
                        <div className="my-2 mb-4 select-none">
                          <Label>Business Area</Label>
                          <div className="w-full">
                            {businessAreas && (
                              <Select
                                onValueChange={(value) => setValue("business_area", value)}
                                defaultValue={userData?.business_area?.pk?.toString() || ""}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Business Area" />
                                </SelectTrigger>
                                <SelectContent>
                                  {businessAreas
                                    .sort((a: IBusinessArea, b: IBusinessArea) =>
                                      a.name.localeCompare(b.name),
                                    )
                                    .map((ba: IBusinessArea, index: number) => {
                                      return (
                                        <SelectItem key={index} value={ba.pk.toString()}>
                                          {ba.name}
                                        </SelectItem>
                                      );
                                    })}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Affiliation */}
                        <div className="my-2 mb-4 select-none">
                          <AffiliationCreateSearchDropdown
                            // autoFocus
                            isRequired={false}
                            preselectedAffiliationPk={userData?.affiliation?.pk}
                            setterFunction={(
                              selectedAffiliation: IAffiliation | undefined,
                            ) => {
                              if (selectedAffiliation) {
                                setValue("affiliation", selectedAffiliation.pk);
                              } else {
                                setValue("affiliation", undefined); // Clear the affiliation in the form
                              }
                            }}
                            isEditable
                            hideTags
                            label="Affiliation"
                            placeholder="Search for or an affiliation"
                            helperText="The entity this user is affiliated with"
                          />
                        </div>
                      </div>
                    )}

                    {!userLoading && !userData.is_staff && (
                      <>
                        <p>
                          This user is external. You may only set their
                          affiliation.
                        </p>

                        <div className="my-2 mb-4 select-none">
                          <AffiliationCreateSearchDropdown
                            // autoFocus
                            isRequired={false}
                            preselectedAffiliationPk={userData?.affiliation?.pk}
                            setterFunction={(
                              selectedAffiliation: IAffiliation | undefined,
                            ) => {
                              if (selectedAffiliation) {
                                setValue("affiliation", selectedAffiliation.pk);
                              } else {
                                setValue("affiliation", undefined); // Clear the affiliation in the form
                              }
                            }}
                            isEditable
                            hideTags
                            label="Affiliation"
                            placeholder="Search for or an affiliation"
                            helperText="The entity this user is affiliated with"
                          />
                        </div>
                      </>
                    )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </form>

        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!isValid}
              form="edit-details"
              type="submit"
              className={cn(
                "text-white ml-3",
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-green-600 hover:bg-green-400"
              )}
            >
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
