import { getDoesUserWithEmailExist } from "@/features/users/services/users.service";
import {
  type IEmailRecipientsString,
  sendSPMSLinkEmail,
} from "@/features/documents/services/documents.service";
import { useUser } from "@/features/users/hooks/useUser";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/shared/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSiteLinkModal = ({ isOpen, onClose }: Props) => {
  const [canSend, setCanSend] = useState(false);
  const [toUserEmail, setToUserEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    const checkEmailExists = async (email) => {
      const doesEmailExist = await getDoesUserWithEmailExist(email);
      if (doesEmailExist === true) {
        setEmailExists(true);
      } else {
        if (emailExists) {
          setEmailExists(false);
        }
      }
    };

    checkEmailExists(toUserEmail);
  }, [toUserEmail, emailExists]);

  // Destructure viewing users info
  const { userData, userLoading } = useUser();

  const {
    email: fromUserEmail,
    first_name,
    last_name,
    pk: fromUserPk,
  } = userData ?? {};

  const fromUserName = `${first_name} ${last_name}`;

  useEffect(() => {
    console.log({
      fromUserEmail,
      fromUserName,
      fromUserPk,
      toUserEmail,
    });
    if (
      !toUserEmail ||
      (toUserEmail &&
        (!toUserEmail?.endsWith("dbca.wa.gov.au") ||
          !toUserEmail?.includes("@"))) ||
      !fromUserPk ||
      !fromUserEmail ||
      !fromUserName ||
      emailExists
    ) {
      setCanSend(false);
    } else {
      const splitEmail = toUserEmail?.split("@");
      if (splitEmail?.length > 2) {
        setCanSend(false);
      } else {
        if (splitEmail[0].length >= 5) {
          setCanSend(true);
        } else {
          setCanSend(false);
        }
      }
      // setCanSend(true);
    }
  }, [fromUserEmail, fromUserName, fromUserPk, toUserEmail, emailExists]);

  const {
    register,
    // handleSubmit,
    reset,
  } = useForm<IEmailRecipientsString>();

  const resetData = () => {
    reset();
    setToUserEmail("");
    setCanSend(false);
  };

  const onClick = async (formData: IEmailRecipientsString) => {
    const dataForMutation = {
      fromUserEmail: formData.fromUserEmail,
      toUserEmail: formData.toUserEmail,
    };
    await sendLinkMutation.mutate({ ...dataForMutation });
  };

  const { colorMode } = useColorMode();
  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { title: string; description?: string }) => {
    ToastIdRef.current = toast(data.title, { description: data.description });
  };
  
  const sendLinkMutation = useMutation({
    mutationFn: sendSPMSLinkEmail,
    onMutate: () => {
      addToast({
        title: "Sending Email",
      });
    },
    onSuccess: () => {
      toast.success("Email Sent");
      onClose();
    },
    onError: (error) => {
      toast.error(`Could Not Send Email: ${error}`);
    },
  });

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          resetData();
          onClose();
        }
      }}
    >
      <DialogContent className={cn(
        "max-w-md p-4",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        {!userLoading ? (
          <>
            <DialogHeader className="mt-5">
              <DialogTitle>Send Link to SPMS</DialogTitle>
            </DialogHeader>
            
            <div className="mb-5 space-y-4">
              <input
                type="hidden"
                value={fromUserEmail}
                {...register("fromUserEmail", {
                  required: true,
                  value: fromUserEmail,
                })}
              />
              
              <div className="mb-2">
                <Label>Email (@dbca.wa.gov.au)</Label>
                <Input
                  placeholder="...@dbca.wa.gov.au"
                  value={toUserEmail}
                  onChange={(e) => setToUserEmail(e.target.value)}
                />
                <p className={cn(
                  "text-sm mt-1",
                  emailExists ? "text-red-500" : "text-gray-500"
                )}>
                  {emailExists
                    ? "That email is already registered"
                    : "Enter a DBCA email address which isn't already registered"}
                </p>
              </div>

              {canSend ? (
                <>
                  <div className="grid grid-cols-[2fr_10fr] px-1 mt-4 gap-2">
                    <span className="font-bold">From: </span>
                    <span className="text-right">{fromUserEmail}</span>
                  </div>
                  <p className="text-xs text-right text-gray-500">
                    The email will be sent by the system, but this email may
                    be listed
                  </p>
                  <div className="grid grid-cols-[2fr_10fr] px-1 gap-2">
                    <span className="font-bold">To:</span>
                    <span className="text-right">{toUserEmail}</span>
                  </div>
                </>
              ) : null}
              
              <p className="text-xs text-gray-500">
                Note: This will send an email with a link to access SPMS. Once
                the user logs in, you will be able to find their account and add
                them to projects
              </p>
            </div>
            
            <DialogFooter>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetData();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!canSend || sendLinkMutation.isPending}
                  onClick={() => {
                    onClick({
                      fromUserEmail: fromUserEmail,
                      toUserEmail: toUserEmail,
                    });
                  }}
                  className={cn(
                    "text-white",
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-400" 
                      : "bg-green-600 hover:bg-green-500"
                  )}
                >
                  {sendLinkMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
