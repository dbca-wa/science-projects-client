import { useMemo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import {
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useBranches } from "@/shared/hooks/queries/useBranches";
import { useAffiliations } from "@/shared/hooks/queries/useAffiliations";

// Type constraint for forms that have membership fields
type MembershipFieldsType = {
  branch?: number;
  businessArea?: number;
  affiliation?: number;
  isStaff?: boolean;
};

interface MembershipFieldsProps<T extends FieldValues & MembershipFieldsType> {
  control: Control<T>;
  mode?: "create" | "edit";
  disabled?: boolean;
}

/**
 * MembershipFields component
 * Form fields for membership information (branch, business area, affiliation, staff status)
 * 
 * @param control - React Hook Form control
 * @param mode - Form mode (create or edit)
 * @param disabled - Whether fields should be disabled
 */
export const MembershipFields = <T extends FieldValues & MembershipFieldsType>({ control, mode = "create", disabled }: MembershipFieldsProps<T>) => {
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: affiliations, isLoading: isLoadingAffiliations } = useAffiliations();

  // Memoize sorted data to prevent re-sorting on every render
  const sortedBranches = useMemo(() => {
    if (!branches) return [];
    return [...branches].sort((a, b) => a.name.localeCompare(b.name));
  }, [branches]);

  const sortedBusinessAreas = useMemo(() => {
    if (!businessAreas) return [];
    return [...businessAreas].sort((a, b) => {
      // Sort: active first (alphabetically), then inactive (alphabetically)
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [businessAreas]);

  const sortedAffiliations = useMemo(() => {
    if (!affiliations) return [];
    return [...affiliations].sort((a, b) => a.name.localeCompare(b.name));
  }, [affiliations]);

  return (
    <div className="space-y-4">
      {/* Staff Status - Only show in create mode */}
      {mode === "create" && (
        <FormField
          control={control}
          name={"isStaff" as Path<T>}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Staff Member</Label>
                <p className="text-sm text-muted-foreground">
                  Mark this user as a staff member
                </p>
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Branch */}
      <FormField
        control={control}
        name={"branch" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch</FormLabel>
            <Select
              value={field.value?.toString() || "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
              disabled={isLoadingBranches || disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sortedBranches.map((branch) => (
                  <SelectItem key={branch.pk} value={branch.pk!.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Business Area */}
      <FormField
        control={control}
        name={"businessArea" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Area</FormLabel>
            <Select
              value={field.value?.toString() || "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
              disabled={isLoadingBusinessAreas || disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a business area" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sortedBusinessAreas.map((ba) => (
                  <SelectItem key={ba.pk} value={ba.pk!.toString()}>
                    {ba.is_active ? ba.name : `[INACTIVE] ${ba.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Affiliation */}
      <FormField
        control={control}
        name={"affiliation" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Affiliation</FormLabel>
            <Select
              value={field.value?.toString() || "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
              disabled={isLoadingAffiliations || disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an affiliation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sortedAffiliations.map((affiliation) => (
                  <SelectItem key={affiliation.pk} value={affiliation.pk!.toString()}>
                    {affiliation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
