import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { observer } from "mobx-react-lite";
import type { UserSearchFilters } from "../types/user.types";

interface FilterPanelProps {
  filters: UserSearchFilters;
  onFiltersChange: (filters: UserSearchFilters) => void;
}

/**
 * UserFilterPanel component
 * Business area dropdown and user type filters for the users list page
 */
export const UserFilterPanel = observer(({ 
  filters, 
  onFiltersChange,
}: FilterPanelProps) => {
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();

  const handleToggleFilter = (key: keyof UserSearchFilters) => {
    // Only one of staff/external/superuser/baLead can be active at a time
    // Clicking a checkbox will turn off the others automatically
    if (key === "onlyStaff" || key === "onlyExternal" || key === "onlySuperuser" || key === "onlyBALead") {
      onFiltersChange({
        ...filters,
        onlyStaff: key === "onlyStaff" ? !filters.onlyStaff : false,
        onlyExternal: key === "onlyExternal" ? !filters.onlyExternal : false,
        onlySuperuser: key === "onlySuperuser" ? !filters.onlySuperuser : false,
        onlyBALead: key === "onlyBALead" ? !filters.onlyBALead : false,
      });
    }
  };

  const handleBusinessAreaChange = (value: string) => {
    onFiltersChange({
      ...filters,
      businessArea: value === "All" ? undefined : Number(value),
    });
  };

  // Sort business areas by division
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
  const sortedBusinessAreas = businessAreas
    ?.slice()
    .sort((a, b) => {
      const aDivSlug = typeof a.division === 'object' && a.division?.slug ? a.division.slug : "";
      const bDivSlug = typeof b.division === 'object' && b.division?.slug ? b.division.slug : "";
      
      const aIndex = orderedDivisionSlugs.indexOf(aDivSlug);
      const bIndex = orderedDivisionSlugs.indexOf(bDivSlug);
      
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Business Area Dropdown - Full width on its own row */}
      <Select
        value={filters.businessArea?.toString() || "All"}
        onValueChange={handleBusinessAreaChange}
        disabled={isLoadingBusinessAreas}
      >
        <SelectTrigger className="w-full !h-10 text-sm rounded-md">
          <SelectValue placeholder="All Business Areas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Business Areas</SelectItem>
          {sortedBusinessAreas?.map((ba) => (
            <SelectItem key={ba.id} value={ba.id!.toString()}>
              {typeof ba.division === 'object' && ba.division?.slug ? `[${ba.division.slug}] ` : ""}
              {ba.name}
              {!ba.is_active ? " (INACTIVE)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter Checkboxes - Separate row with wrapping for mobile */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 w-full">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="external-filter"
            checked={filters.onlyExternal}
            onCheckedChange={() => handleToggleFilter("onlyExternal")}
          />
          <Label
            htmlFor="external-filter"
            className="text-sm font-normal cursor-pointer whitespace-nowrap"
          >
            Only External
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="staff-filter"
            checked={filters.onlyStaff}
            onCheckedChange={() => handleToggleFilter("onlyStaff")}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-500"
          />
          <Label
            htmlFor="staff-filter"
            className="text-sm font-normal cursor-pointer whitespace-nowrap"
          >
            Only Staff
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ba-lead-filter"
            checked={filters.onlyBALead}
            onCheckedChange={() => handleToggleFilter("onlyBALead")}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-500"
          />
          <Label
            htmlFor="ba-lead-filter"
            className="text-sm font-normal cursor-pointer whitespace-nowrap"
          >
            Only BA Lead
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="superuser-filter"
            checked={filters.onlySuperuser}
            onCheckedChange={() => handleToggleFilter("onlySuperuser")}
            className="data-[state=checked]:bg-blue-600 data-[state-checked]:border-blue-500"
          />
          <Label
            htmlFor="superuser-filter"
            className="text-sm font-normal cursor-pointer whitespace-nowrap"
          >
            Only Admin
          </Label>
        </div>
      </div>
    </div>
  );
});
