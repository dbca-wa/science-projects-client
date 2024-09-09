import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IStaffPublicEmail, publicEmailStaffMember } from "@/lib/api";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const EmailStaffMemberContent = ({
  kind,
  pk,
  name,
  onClose,
}: {
  kind: "drawer" | "dialog";
  name: string;
  pk: number;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<IStaffPublicEmail>({
    mode: "onChange", // or "onBlur"
  });
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: publicEmailStaffMember,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Email Sent",
        position: "top-right",
      });
      onClose();
    },
    onError: (e) => {
      console.log("error", e);
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });
  const onSubmit = (formData: IStaffPublicEmail) => {
    mutation.mutate(formData);
  };

  const validateEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value) || "Please enter a valid email address.";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
      <Input
        type="hidden"
        {...register("pk", {
          required: true,
          value: pk,
        })}
        readOnly
      />
      <Label htmlFor="email">Your Email</Label>
      <Input
        type="email"
        id="email"
        placeholder="Enter your email addresss"
        className="mt-1"
        {...register("senderEmail", {
          required: true,
          validate: validateEmail,
        })}
      />
      <p className="mb-2 p-1 text-xs text-muted-foreground">
        Ensure that you have entered a valid email before sending the message;
        otherwise, we will not be able to reply.
      </p>
      <Label>Your Message</Label>
      <Textarea
        className="mt-1"
        placeholder="Type your message here."
        {...register("message", {
          required: true,
        })}
      />
      <p className="mb-2 p-1 text-xs text-muted-foreground">
        {`Your message will be emailed to ${name}.`}
      </p>
      <div className="flex w-full justify-end">
        {kind === "drawer" && (
          <DrawerClose asChild className="mr-3">
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        )}

        <Button type="submit" disabled={!isValid || mutation.isPending}>
          Send
        </Button>
      </div>
    </form>
  );
};
export default EmailStaffMemberContent;
