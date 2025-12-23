import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { type IStaffPublicEmail, publicEmailStaffMember } from "@/features/staff-profiles/services/staff-profiles.service";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

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
  const mutation = useMutation({
    mutationFn: publicEmailStaffMember,
    onSuccess: async () => {
      toast.success("Email Sent");
      onClose();
    },
    onError: (e) => {
      console.log("error", e);
      toast.error("Failed");
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
    <ScrollArea className="overflow-y-scroll">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <Input
          type="hidden"
          {...register("pk", {
            required: true,
            value: pk,
          })}
          className="text-md"
          readOnly
        />
        <Label htmlFor="email">Your Email</Label>
        <Input
          type="email"
          id="email"
          placeholder="Enter your email addresss"
          className="text-md mt-1"
          {...register("senderEmail", {
            required: true,
            validate: validateEmail,
          })}
        />
        <p className="text-muted-foreground mb-2 p-1 text-xs">
          Ensure that you have entered a valid email before sending the message;
          otherwise, we will not be able to reply.
        </p>
        <Label>Your Message</Label>
        <Textarea
          className="text-md mt-1"
          placeholder="Type your message here."
          {...register("message", {
            required: true,
          })}
        />
        <p className="text-muted-foreground mb-2 p-1 text-xs">
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
    </ScrollArea>
  );
};
export default EmailStaffMemberContent;
