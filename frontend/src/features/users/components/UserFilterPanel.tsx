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
import type { RoleFilter } from "@/app/stores/derived/user-search.store";

interface FilterPanelProps {
	filters: UserSearchFilters;
	onFiltersChange: (filters: UserSearchFilters) => void;
}

/**
 * UserFilterPanel component
 * Business area dropdown and role filter dropdown for the users list page
 */
export const UserFilterPanel = observer(
	({ filters, onFiltersChange }: FilterPanelProps) => {
		const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
			useBusinessAreas();

		const handleRoleFilterChange = (value: string) => {
			onFiltersChange({
				...filters,
				roleFilter: value as RoleFilter,
			});
		};

		const handleBusinessAreaChange = (value: string) => {
			onFiltersChange({
				...filters,
				businessArea: value === "All" ? undefined : Number(value),
			});
		};

		// Sort business areas by division
		const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
		const sortedBusinessAreas = businessAreas?.slice().sort((a, b) => {
			const aDivSlug =
				typeof a.division === "object" && a.division?.slug
					? a.division.slug
					: "";
			const bDivSlug =
				typeof b.division === "object" && b.division?.slug
					? b.division.slug
					: "";

			const aIndex = orderedDivisionSlugs.indexOf(aDivSlug);
			const bIndex = orderedDivisionSlugs.indexOf(bDivSlug);

			if (aIndex !== bIndex) {
				return aIndex - bIndex;
			}

			return a.name.localeCompare(b.name);
		});

		return (
			<div className="flex flex-col gap-3 w-full">
				{/* Business Area Dropdown */}
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
								{typeof ba.division === "object" && ba.division?.slug
									? `[${ba.division.slug}] `
									: ""}
								{ba.name}
								{!ba.is_active ? " (INACTIVE)" : ""}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Role Filter Dropdown */}
				<Select
					value={filters.roleFilter || "all"}
					onValueChange={handleRoleFilterChange}
				>
					<SelectTrigger
						className="w-full !h-10 text-sm rounded-md"
						aria-label="Filter by user role"
					>
						<SelectValue placeholder="All Users" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Users</SelectItem>
						<SelectItem value="external">Only External</SelectItem>
						<SelectItem value="staff">Only Staff</SelectItem>
						<SelectItem value="ba_lead">Only BA Lead</SelectItem>
						<SelectItem value="approver">Only Approver</SelectItem>
						<SelectItem value="key_stakeholder">
							Only Key Stakeholder
						</SelectItem>
						<SelectItem value="admin">Only Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>
		);
	}
);
