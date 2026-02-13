import { forwardRef, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Building2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { BaseCombobox } from "@/shared/components/combobox";
import { apiClient } from "@/shared/services/api/client.service";
import { toTitleCase } from "@/shared/utils";
import type { IAffiliation } from "@/shared/types/org.types";

interface AffiliationComboboxProps {
	// Single-select mode
	value?: number;
	onChange?: (affiliationId?: number) => void;

	// Multi-select mode
	multiple?: boolean;
	values?: IAffiliation[];
	onChangeMultiple?: (affiliations: IAffiliation[]) => void;

	// UI customization
	label?: string;
	placeholder?: string;
	helperText?: string;
	isRequired?: boolean;
	isEditable?: boolean;
	disabled?: boolean;
	autoFocus?: boolean;
	showIcon?: boolean;
	className?: string;
	wrapperClassName?: string;
}

export interface AffiliationComboboxRef {
	focusInput: () => void;
	clearSelection: () => void;
}

/**
 * AffiliationCombobox component
 * Searchable dropdown for selecting affiliations (single or multi-select)
 *
 * Single-select mode uses BaseCombobox for consistency.
 * Multi-select mode uses custom implementation (will be refactored in separate spec).
 *
 * @example Single-select
 * ```tsx
 * <AffiliationCombobox
 *   value={affiliationId}
 *   onChange={(id) => setAffiliationId(id)}
 *   label="Organisation"
 * />
 * ```
 *
 * @example Multi-select
 * ```tsx
 * <AffiliationCombobox
 *   multiple
 *   values={affiliations}
 *   onChangeMultiple={(affs) => setAffiliations(affs)}
 *   label="Collaboration With"
 * />
 * ```
 */
export const AffiliationCombobox = forwardRef<
	AffiliationComboboxRef,
	AffiliationComboboxProps
>((props, ref) => {
	const { multiple = false } = props;

	// Route to appropriate implementation
	if (multiple) {
		return <MultiSelectAffiliationCombobox {...props} ref={ref} />;
	} else {
		return <SingleSelectAffiliationCombobox {...props} ref={ref} />;
	}
});

AffiliationCombobox.displayName = "AffiliationCombobox";

// =========================================== SINGLE-SELECT IMPLEMENTATION ====================================================

const SingleSelectAffiliationCombobox = forwardRef<
	AffiliationComboboxRef,
	AffiliationComboboxProps
>(
	(
		{
			value,
			onChange,
			placeholder = "Search for or add an affiliation",
			showIcon = true,
			...props
		},
		ref
	) => {
		// Load selected affiliation if value provided
		const { data: selectedAffiliation } = useQuery({
			queryKey: ["affiliations", "detail", value],
			queryFn: () =>
				apiClient.get<IAffiliation>(`agencies/affiliations/${value}`),
			enabled: !!value && value > 0,
			staleTime: 10 * 60_000, // 10 minutes
		});

		// Search function wrapper
		const searchAffiliations = async (
			searchTerm: string
		): Promise<IAffiliation[]> => {
			const result = await apiClient.get<{
				affiliations: IAffiliation[];
				total_results: number;
				total_pages: number;
			}>("agencies/affiliations", {
				params: { searchTerm, page: 1 },
			});
			return result.affiliations || [];
		};

		// Create new affiliation
		const createAffiliation = async (
			searchTerm: string
		): Promise<IAffiliation> => {
			const titleCasedName = toTitleCase(searchTerm.trim());
			return await apiClient.post<IAffiliation>("agencies/affiliations", {
				name: titleCasedName,
			});
		};

		return (
			<BaseCombobox<IAffiliation>
				searchFn={searchAffiliations}
				value={selectedAffiliation ?? null}
				onChange={(affiliation: IAffiliation | null) =>
					onChange?.(affiliation?.id)
				}
				getItemKey={(affiliation: IAffiliation) => affiliation.id}
				renderSelected={(affiliation: IAffiliation, onClear: () => void) => (
					<SelectedAffiliationDisplay
						affiliation={affiliation}
						onClear={onClear}
					/>
				)}
				renderMenuItem={(
					affiliation: IAffiliation,
					onSelect: (affiliation: IAffiliation) => void,
					isHighlighted: boolean
				) => (
					<AffiliationMenuItem
						affiliation={affiliation}
						onSelect={onSelect}
						isHighlighted={isHighlighted}
					/>
				)}
				onCreateNew={createAffiliation}
				createNewLabel={(term: string) =>
					`Click to add "${toTitleCase(term)}" as an organisation/affiliation`
				}
				icon={
					showIcon ? (
						<Building2 className="size-4 text-gray-500 dark:text-gray-400" />
					) : undefined
				}
				showIcon={showIcon}
				placeholder={placeholder}
				{...props}
				ref={ref}
			/>
		);
	}
);

SingleSelectAffiliationCombobox.displayName = "SingleSelectAffiliationCombobox";

// =========================================== MULTI-SELECT IMPLEMENTATION ====================================================
// NOTE: This will be refactored in a separate spec to use BaseCombobox with multi-select support

const MultiSelectAffiliationCombobox = forwardRef<
	AffiliationComboboxRef,
	AffiliationComboboxProps
>(
	(
		{
			values = [],
			onChangeMultiple,
			label,
			placeholder = "Search for or add an affiliation",
			helperText,
			isRequired = false,
			isEditable = true,
			disabled = false,
			autoFocus = false,
			showIcon = true,
			className,
			wrapperClassName,
		},
		_ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const [searchTerm, setSearchTerm] = useState("");
		const [_filteredItems, _setFilteredItems] = useState<IAffiliation[]>([]);
		const [_isMenuOpen, _setIsMenuOpen] = useState(false);
		const [_isCreating, _setIsCreating] = useState(false);

		// Debounce search term (300ms)
		// const _debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

		// Search affiliations based on debounced search term
		// TODO: Implement search for multi-select mode
		// This will be refactored in separate spec

		// const _handleSelectAffiliation = (_affiliation: IAffiliation) => {
		// 	// TODO: Implement for multi-select mode
		// 	// This will be refactored in separate spec
		// };

		const handleRemoveAffiliation = (affiliation: IAffiliation) => {
			if (!isEditable) return;
			onChangeMultiple?.(values.filter((a) => a.id !== affiliation.id));
		};

		// const _handleCreateAffiliation = async () => {
		// 	// TODO: Implement for multi-select mode
		// 	// This will be refactored in separate spec
		// };

		// const _showCreateOption = false; // TODO: Implement for multi-select mode

		return (
			<div className={cn("w-full", isRequired && "required", wrapperClassName)}>
				{label && (
					<Label className="mb-2">
						{label} {isRequired && <span className="text-destructive">*</span>}
					</Label>
				)}

				{/* Show selected chips */}
				{values.length > 0 && (
					<div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border mb-2">
						{values.map((affiliation) => (
							<Badge
								key={affiliation.id}
								variant="secondary"
								className="gap-1 pr-1 text-sm"
							>
								<Building2 className="h-3 w-3" />
								{affiliation.name}
								{isEditable && (
									<button
										type="button"
										onClick={() => handleRemoveAffiliation(affiliation)}
										className="ml-1 rounded-full hover:bg-muted p-0.5"
									>
										<X className="h-3 w-3" />
									</button>
								)}
							</Badge>
						))}
					</div>
				)}

				<div className="relative">
					{showIcon && (
						<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
					)}
					<Input
						ref={inputRef}
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder={placeholder}
						autoComplete="off"
						onFocus={() => {
							// TODO: Implement dropdown for multi-select mode
						}}
						disabled={disabled}
						autoFocus={autoFocus}
						className={cn(showIcon && "pl-10", className)}
					/>
				</div>

				{/* TODO: Implement portal dropdown for multi-select */}
				{/* This will be refactored in separate spec */}

				{helperText && (
					<p className="text-sm text-muted-foreground mt-2">{helperText}</p>
				)}
			</div>
		);
	}
);

MultiSelectAffiliationCombobox.displayName = "MultiSelectAffiliationCombobox";

// =========================================== CUSTOM RENDERING COMPONENTS ====================================================

interface SelectedAffiliationDisplayProps {
	affiliation: IAffiliation;
	onClear: () => void;
}

const SelectedAffiliationDisplay = ({
	affiliation,
	onClear,
}: SelectedAffiliationDisplayProps) => {
	return (
		<div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 h-11">
			<Building2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mr-2" />
			<span className="text-green-500 dark:text-green-400 flex-1 text-sm truncate">
				{affiliation.name}
			</span>
			<button
				type="button"
				onClick={onClear}
				className="ml-2 h-6 w-6 p-0 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
			>
				<X className="size-4" />
			</button>
		</div>
	);
};

interface AffiliationMenuItemProps {
	affiliation: IAffiliation;
	onSelect: (affiliation: IAffiliation) => void;
	isHighlighted: boolean;
}

const AffiliationMenuItem = ({
	affiliation,
	onSelect,
	isHighlighted,
}: AffiliationMenuItemProps) => {
	return (
		<button
			type="button"
			className={cn(
				"w-full text-left px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer",
				isHighlighted && "bg-gray-200 dark:bg-gray-600"
			)}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onSelect(affiliation);
			}}
		>
			<Building2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
			<span className="text-sm text-green-600 dark:text-green-400 truncate">
				{affiliation.name}
			</span>
		</button>
	);
};
