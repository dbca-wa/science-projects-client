import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePersonalInformation } from "../../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import { sanitizeFormData } from "@/shared/utils";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { Loader2, User, Phone, Printer, Mail, Award } from "lucide-react";

const personalInfoSchema = z.object({
  display_first_name: z.string().min(1, "First name is required"),
  display_last_name: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface EditPersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserData | IUserMe;
  onSuccess: () => void;
}

export const EditPersonalInformationModal = observer(
  ({ isOpen, onClose, user, onSuccess }: EditPersonalInformationModalProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<PersonalInfoFormData>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: {
        display_first_name: user.display_first_name || user.first_name || "",
        display_last_name: user.display_last_name || user.last_name || "",
        title: user.title || "",
        phone: user.phone || "",
        fax: user.fax || "",
      },
    });

    const updateMutation = useMutation({
      mutationFn: (data: PersonalInfoFormData) =>
        updatePersonalInformation(user.id!, data),
      onSuccess: async () => {
        // Reset queries to force immediate refetch (ignores staleTime)
        await queryClient.resetQueries({ 
          queryKey: authKeys.user(),
          exact: true
        });
        
        toast.success("Personal information updated successfully");
        onSuccess();
        onClose();
      },
      onError: (error: Error) => {
        const message = error.message || "Failed to update personal information";
        toast.error(message);
      },
    });

    const handleSubmit = (data: PersonalInfoFormData) => {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(data, []);
      updateMutation.mutate(sanitizedData);
    };

    const handleClose = () => {
      form.reset();
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your display name, title, and contact information. Your
              email cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Display First Name */}
              <FormField
                control={form.control}
                name="display_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input {...field} placeholder="Enter first name" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display Last Name */}
              <FormField
                control={form.control}
                name="display_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input {...field} placeholder="Enter last name" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full pl-10">
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="dr">Dr</SelectItem>
                          <SelectItem value="prof">Prof</SelectItem>
                          <SelectItem value="aprof">A/Prof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input {...field} placeholder="Enter phone number" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fax */}
              <FormField
                control={form.control}
                name="fax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Printer className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input {...field} placeholder="Enter fax number" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={user.email} disabled className="bg-muted pl-10" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);
