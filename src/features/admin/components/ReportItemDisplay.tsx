import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteReport, updateReport } from "@/features/admin/services/admin.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IReport } from "@/shared/types";
import { UserProfile } from "@/features/users/components/UserProfile";
// import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { AxiosError } from "axios";
import { useGetFullReport } from "@/features/reports/hooks/useGetFullReport";
import { useGetReportMedia } from "@/features/reports/hooks/useGetReportMedia";
import { useUser } from "@/features/users/hooks/useUser";
import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { ReportMediaChanger } from "./ReportMediaChanger";
import { cn } from "@/shared/utils";

export const ReportItemDisplay = ({
  pk,
  year,
  // date_closed,
  // date_open,
  creator,
  modifier,
}: IReport) => {
  const { reportData, reportLoading } = useGetFullReport(pk);

  const { reportMediaData, refetchMedia } = useGetReportMedia(pk);
  // useEffect(() => {
  //   if (!reportMediaLoading) console.log(reportMediaData);
  // }, [reportMediaData, reportMediaLoading]);

  const { register } = useForm<IReport>();

  // State for all modals (replacing useDisclosure hooks)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateMediaModalOpen, setIsUpdateMediaModalOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isModifierOpen, setIsModifierOpen] = useState(false);

  // Modal control functions
  const onDeleteModalOpen = () => setIsDeleteModalOpen(true);
  const onDeleteModalClose = () => setIsDeleteModalOpen(false);
  const onUpdateModalOpen = () => setIsUpdateModalOpen(true);
  const onUpdateModalClose = () => setIsUpdateModalOpen(false);
  const onUpdateMediaModalOpen = () => setIsUpdateMediaModalOpen(true);
  const onUpdateMediaModalClose = () => setIsUpdateMediaModalOpen(false);
  const onCreatorOpen = () => setIsCreatorOpen(true);
  const onCreatorClose = () => setIsCreatorOpen(false);
  const onModifierOpen = () => setIsModifierOpen(true);
  const onModifierClose = () => setIsModifierOpen(false);

  const queryClient = useQueryClient();

  const { userLoading: modifierLoading, userData: modifierData } =
    useFullUserByPk(modifier);
  const { userLoading: creatorLoading, userData: creatorData } =
    useFullUserByPk(creator);

  const updateMutation = useMutation({
    mutationFn: updateReport,
    onSuccess: () => {
      toast.success("Updated");
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      toast.success("Deleted");
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["latestReport"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const creatorDrawerFunction = () => {
    onCreatorOpen();
  };
  const modifierDrawerFunction = () => {
    onModifierOpen();
  };

  const { colorMode } = useColorMode();

  const documentType = "annualreport";
  const editorKey = colorMode + documentType;

  const { userData } = useUser();

  const [deleteText, setDeleteText] = useState("");

  return !creatorLoading && creatorData ? (
    <>
      <Sheet open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <SheetContent side="right" className="w-96">
          <UserProfile pk={creator} />
        </SheetContent>
      </Sheet>
      {!modifierLoading && modifierData && (
        <Sheet open={isModifierOpen} onOpenChange={setIsModifierOpen}>
          <SheetContent side="right" className="w-96">
            <UserProfile pk={modifier} />
          </SheetContent>
        </Sheet>
      )}

      <div className="grid grid-cols-[2fr_3fr_3fr_1fr] w-full p-3 border border-border">
        <div className="flex justify-start items-center">
          <TextButtonFlex
            name={year ? `FY ${year - 1} - ${String(year).slice(2)}` : ""}
            onClick={onUpdateModalOpen}
          />
        </div>

        {/* <Grid alignItems={"center"}>
          <Box>
            <Text>{firstPartDateOpen}</Text>
          </Box>
        </Grid>
        <Grid alignItems={"center"}>
          <Box>
            <Text>{firstPartDateClosed}</Text>
          </Box>
        </Grid> */}
        <TextButtonFlex
          name={`${creatorData.first_name} ${creatorData.last_name}`}
          onClick={creatorDrawerFunction}
        />
        {!modifierLoading && modifierData ? (
          <TextButtonFlex
            name={`${modifierData.first_name} ${modifierData.last_name}`}
            onClick={modifierDrawerFunction}
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
              <DropdownMenuItem onClick={onUpdateMediaModalOpen}>Edit Media</DropdownMenuItem>
              {userData?.is_superuser ? (
                <DropdownMenuItem onClick={onDeleteModalOpen}>Delete</DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this report?
            </p>

            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{year}"
            </p>

            <div className="flex justify-center my-6">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  This will delete all progress reports and their related
                  document associated with the year
                </li>
                <li>
                  This will delete all images associated with the year
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-input">Type "delete" in the box to continue</Label>
              <Input 
                id="delete-input"
                onChange={(e) => setDeleteText(e.target.value)} 
                placeholder="Type 'delete' to confirm"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                disabled={deleteText !== "delete"}
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

      {reportMediaData ? (
        <Dialog open={isUpdateMediaModalOpen} onOpenChange={setIsUpdateMediaModalOpen}>
          <DialogContent className={`max-w-6xl ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-gray-100"} p-4 pb-16 relative`}>
            <DialogHeader>
              <DialogTitle>Update {reportData?.year} Report Media</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-4 gap-8 mx-6">
              {/* <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"cover"}
                reportPk={pk}
                refetchData={refetchMedia}
              /> */}

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"sdchart"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"service_delivery"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"research"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"partnerships"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"collaborations"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"student_projects"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"publications"}
                reportPk={pk}
                refetchData={refetchMedia}
              />

              {/* <ReportMediaChanger
                reportMediaData={reportMediaData}
                section={"rear_cover"}
                reportPk={pk}
                refetchData={refetchMedia}
              /> */}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className={`max-w-6xl ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"} p-4`}>
          <DialogHeader>
            <DialogTitle>Update {reportData?.year} Report</DialogTitle>
          </DialogHeader>

          {reportLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-6">
                <input
                  type="hidden"
                  {...register("pk")}
                  defaultValue={pk} // Prefill with the 'pk' prop
                />
                <Input
                  {...register("year", { required: true })}
                  disabled
                  required
                  type="hidden"
                  defaultValue={reportData.year} // Prefill with the 'name' prop
                />

                <div>
                  <RichTextEditor
                    canEdit={userData?.is_superuser}
                    isUpdate={true}
                    editorType="AnnualReport"
                    key={`dm${editorKey}`} // Change the key to force a re-render
                    data={reportData?.dm}
                    section={"dm"}
                    writeable_document_kind={"Annual Report"}
                    writeable_document_pk={reportData?.id}
                  />
                </div>

                <div>
                  <RichTextEditor
                    canEdit={userData?.is_superuser}
                    isUpdate={true}
                    editorType="AnnualReport"
                    key={`service_delivery_intro${editorKey}`} // Change the key to force a re-render
                    data={reportData?.service_delivery_intro}
                    section={"service_delivery_intro"}
                    writeable_document_kind={"Annual Report"}
                    writeable_document_pk={reportData?.id}
                  />
                </div>
                <div>
                  <RichTextEditor
                    canEdit={userData?.is_superuser}
                    isUpdate={true}
                    editorType="AnnualReport"
                    key={`research_intro${editorKey}`} // Change the key to force a re-render
                    data={reportData?.research_intro}
                    section={"research_intro"}
                    writeable_document_kind={"Annual Report"}
                    writeable_document_pk={reportData?.id}
                  />
                </div>

                <div>
                  <RichTextEditor
                    canEdit={userData?.is_superuser}
                    isUpdate={true}
                    editorType="AnnualReport"
                    key={`student_intro${editorKey}`} // Change the key to force a re-render
                    data={reportData?.student_intro}
                    section={"student_intro"}
                    writeable_document_kind={"Annual Report"}
                    writeable_document_pk={reportData?.id}
                  />
                </div>

                <div>
                  <RichTextEditor
                    canEdit={userData?.is_superuser}
                    isUpdate={true}
                    editorType="AnnualReport"
                    key={`publications${editorKey}`} // Change the key to force a re-render
                    data={reportData?.publications}
                    section={"publications"}
                    writeable_document_kind={"Annual Report"}
                    writeable_document_pk={reportData?.id}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                {updateMutation.isError ? (
                  <div className="mt-4">
                    {Object.keys(
                      (updateMutation.error as AxiosError).response.data,
                    ).map((key) => (
                      <div key={key}>
                        {(
                          (updateMutation.error as AxiosError).response.data[
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};
