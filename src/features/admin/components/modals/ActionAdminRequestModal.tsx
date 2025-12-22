import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { actionAdminRequestCall } from "@/features/admin/services/admin.service";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { IActionAdminTask, IAdminTask } from "@/shared/types";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { formatDate } from "date-fns";

interface Props {
  action: "deleteproject" | "mergeuser" | "setcaretaker";
  projectPk?: number;
  task?: IAdminTask;
  taskPk: number;
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ActionAdminRequestModal = ({
  action,
  projectPk,
  task,
  taskPk,
  isOpen,
  onClose,
  refetch,
}: Props) => {
  useEffect(() => {
    console.log({ task });
  }, [task]);
  
  const [decision, setDecision] = useState("");
  const navigate = useNavigate();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const actionAdminRequestMutation = useMutation({
    mutationFn: actionAdminRequestCall,
    onMutate: () => {
      toast.loading("Actioning Request");
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: "Action successful",
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
        if (action === "deleteproject") {
          if (decision === "reject") {
            queryClient
              .invalidateQueries({ queryKey: ["project", projectPk] })
              .then(() => refetch?.())
              .then(() => onClose());
          } else if (decision === "approve") {
            queryClient
              .invalidateQueries({ queryKey: ["projects"] })
              .then(() => navigate("/"));
          }
        } else if (action === "mergeuser" || action === "setcaretaker") {
          queryClient
            .invalidateQueries({ queryKey: ["users"] })
            .then(() => refetch?.())
            .then(() => onClose());
        }
      }, 350);
    },
    onError: (error: AxiosError) => {
      toast.error("Could not action request", {
        description: `${error.response.data}`,
      });
    },
  });

  const handleTask = (formData: IActionAdminTask) => {
    console.log(formData);
    actionAdminRequestMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IActionAdminTask>();

  useEffect(() => {
    // Submit the form once decision is set
    if (decision === "approve") {
      handleTask({ action: "approve", taskPk });
    } else if (decision === "reject") {
      handleTask({ action: "reject", taskPk });
    }
  }, [decision, taskPk]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <form onSubmit={handleSubmit(handleTask)}>
        <DialogContent
          className={`md:max-w-md ${
            colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"
          }`}
        >
          <DialogHeader>
            <DialogTitle>Approve Request?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="hidden"
                {...register("taskPk", {
                  required: true,
                  value: taskPk,
                })}
                readOnly
              />
            </div>

            {action === "deleteproject" ? (
              <>
                <div className="flex justify-center">
                  <p className="font-semibold text-xl">
                    Are you sure you want to delete this project? There's no
                    turning back.
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      The Project team and area will be cleared
                    </li>
                    <li>The project photo will be deleted</li>
                    <li>Any related comments will be deleted</li>
                    <li>All related documents will be deleted</li>
                  </ul>
                </div>
                <div className="flex justify-center pt-5">
                  <p className="font-bold text-red-400 underline">
                    This is permanent.
                  </p>
                </div>
              </>
            ) : action === "mergeuser" ? (
              <>
                <div className="mb-3">
                  <ul className="list-disc ml-6 mt-2 space-y-2">
                    <li>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      projects belonging to the secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name})
                    </li>
                    <li>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      comments belonging to the secondary user/s
                    </li>
                    <li>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      documents and roles belonging to the secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name}) on projects,
                      where applicable (if primary user is already on the
                      project and has a higher role, they will maintain the
                      higher role)
                    </li>
                    <li
                      className={`underline ${
                        colorMode === "light" ? "text-red-500" : "text-red-400"
                      }`}
                    >
                      The secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name}) will be
                      deleted from the system. This is permanent.
                    </li>
                  </ul>
                </div>
              </>
            ) : action === "setcaretaker" ? (
              <>
                <div>
                  <p className="mt-4">
                    {task.primary_user.display_first_name}{" "}
                    {task.primary_user.display_last_name} requested that{" "}
                    {task.secondary_users[0].display_first_name}{" "}
                    {task.secondary_users[0].display_last_name} be their
                    caretaker while they are away.
                  </p>
                  <div className="mt-4">
                    <ul className="list-disc list-inside space-y-1">
                      {/* <li>From {formattedStart.split("@")[0]}</li> */}
                      {task.end_date && (
                        <li>
                          Until {formatDate(task.end_date, "dd/MM/yyyy")}
                        </li>
                      )}
                      <li>
                        {task.secondary_users[0].display_first_name} will be
                        able to perform actions on{" "}
                        {task.primary_user.display_first_name}{" "}
                        {task.primary_user.display_last_name}'s' behalf
                      </li>
                      <li>
                        If {task.primary_user.display_first_name}{" "}
                        {task.primary_user.display_last_name} is a business area
                        lead, {task.secondary_users[0].display_first_name} will
                        act in their stead
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          
          <DialogFooter>
            <div className="flex flex-col w-full">
              <div className="pb-5 flex flex-col w-full">
                <p className="font-semibold text-blue-500">
                  If you wish to proceed, click approve. Otherwise, click reject
                  and the request will be removed.
                </p>
                <p className="my-4 font-semibold text-blue-500 w-full">
                  To exit, press the close button or click away.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setDecision("reject")}
                >
                  Reject
                </Button>
                <Button
                  className={`text-white ml-3 ${
                    colorMode === "light" 
                      ? "bg-red-500 hover:bg-red-400" 
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                  disabled={
                    actionAdminRequestMutation.isPending ||
                    !taskPk ||
                    isSubmitting
                  }
                  onClick={() => setDecision("approve")}
                >
                  {actionAdminRequestMutation.isPending ? "Processing..." : "Approve"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
