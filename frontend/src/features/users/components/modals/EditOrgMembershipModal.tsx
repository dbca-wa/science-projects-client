import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMembership } from "../../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { useBranches } from "@/shared/hooks/queries/useBranches";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
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
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const membershipSchema = z.object({
  branch: z.number().nullable().optional(),
  business_area: z.number().nullable().optional(),
  affiliation: z.number().nullable().optional(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

interface EditOrgMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserData | IUserMe;
  onSuccess: () => void;
}

export const EditOrgMembershipModal = observer(
  ({ isOpen, onClose, user, onSuccess }: EditOrgMembershipModalProps) => {
    const queryClient = useQueryClient();
    const { data: branches, isLoading: branchesLoading } = useBranches();
    const { data: businessAreas, isLoading: businessAreasLoading } =
      useBusinessAreas();

    const form = useForm<MembershipFormData>({
      resolver: zodResolver(membershipSchema),
      defaultValues: {
        branch: user.branch?.id || null,
        business_area: user.business_area?.id || null,
        affiliation: user.affiliation?.id || null,
      },
    });

    const updateMutation = useMutation({
      mutationFn: (data: MembershipFormData) => updateMembership(user.id!, data),
      onSuccess: async () => {
        // Reset queries to force immediate refetch (ignores staleTime)
        await queryClient.resetQueries({ 
          queryKey: authKeys.user(),
          exact: true
        });
        
        toast.success("Membership updated successfully");
        onSuccess();
        onClose();
      },
      onError: (error: Error) => {
        const message = error.message || "Failed to update membership";
        toast.error(message);
      },
    });

    const handleSubmit = (data: MembershipFormData) => {
      updateMutation.mutate(data);
    };

    const handleClose = () => {
      form.reset();
      onClose();
    };

    const isLoading = branchesLoading || businessAreasLoading;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Membership</DialogTitle>
            <DialogDescription>
              Update your branch, business area, and affiliation. This
              information will be displayed in-app and on your public profile.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Organization (Read-only) */}
              <div className="space-y-2">
                <FormLabel>Organization</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {user.is_staff ? "DBCA" : "External"}
                </div>
              </div>

              {/* Branch (Staff only) */}
              {user.is_staff && (
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "0" ? null : Number(value))
                        }
                        defaultValue={field.value?.toString() || "0"}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {branches?.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id.toString()}
                            >
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Business Area (Staff only) */}
              {user.is_staff && (
                <FormField
                  control={form.control}
                  name="business_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Area</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "0" ? null : Number(value))
                        }
                        defaultValue={field.value?.toString() || "0"}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select business area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {businessAreas?.map((ba) => (
                            <SelectItem key={ba.id} value={ba.id?.toString() || "0"}>
                              {ba.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Affiliation */}
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation (Optional)</FormLabel>
                    <FormControl>
                      <AffiliationCombobox
                        value={field.value || undefined}
                        onChange={(value) => field.onChange(value || null)}
                        placeholder="Search for an affiliation..."
                        helperText="Start typing to search for affiliations"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || isLoading}
                >
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
