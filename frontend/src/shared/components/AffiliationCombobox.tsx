import { forwardRef, useEffect, useRef, useState } from "react";
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
 * Multi-select mode uses custom implementation (will be refactored separately).
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
// NOTE: Multi-select support will be refactored to use BaseCombobox

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
		const containerRef = useRef<HTMLDivElement>(null);
		const [searchTerm, setSearchTerm] = useState("");
		const [isOpen, setIsOpen] = useState(false);
		const [highlightedIndex, setHighlightedIndex] = useState(-1);
		const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
		const [debouncedTerm, setDebouncedTerm] = useState("");

		// Debounce search input
		useEffect(() => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			debounceTimerRef.current = setTimeout(() => {
				setDebouncedTerm(searchTerm);
			}, 300);
			return () => {
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
				}
			};
		}, [searchTerm]);

		// Fetch affiliations based on debounced search term
		const { data: searchResults = [] } = useQuery({
			queryKey: ["affiliations", "search", debouncedTerm],
			queryFn: async () => {
				const result = await apiClient.get<{
					affiliations: IAffiliation[];
					total_results: number;
					total_pages: number;
				}>("agencies/affiliations", {
					params: { searchTerm: debouncedTerm, page: 1 },
				});
				return result.affiliations || [];
			},
			enabled: debouncedTerm.trim().length >= 1,
			staleTime: 10 * 60_000,
		});

		// Filter out already-selected affiliations
		const filteredResults = searchResults.filter(
			(result) => !values.some((v) => v.id === result.id)
		);

		// Check if the current search term matches an existing result (for "create new")
		const exactMatch = searchResults.some(
			(r) => r.name.toLowerCase() === searchTerm.trim().toLowerCase()
		);
		const alreadySelected = values.some(
			(v) => v.name.toLowerCase() === searchTerm.trim().toLowerCase()
		);
		const showCreateOption =
			searchTerm.trim().length > 0 && !exactMatch && !alreadySelected;

		// Total items in dropdown (filtered results + optional create option)
		const totalItems = filteredResults.length + (showCreateOption ? 1 : 0);

		// Close dropdown when clicking outside
		useEffect(() => {
			const handleClickOutside = (e: MouseEvent) => {
				if (
					containerRef.current &&
					!containerRef.current.contains(e.target as Node)
				) {
					setIsOpen(false);
				}
			};
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		const handleSelectAffiliation = (affiliation: IAffiliation) => {
			onChangeMultiple?.([...values, affiliation]);
			setSearchTerm("");
			setIsOpen(false);
			setHighlightedIndex(-1);
			inputRef.current?.focus();
		};

		const handleCreateNew = async () => {
			try {
				const titleCasedName = toTitleCase(searchTerm.trim());
				const newAffiliation = await apiClient.post<IAffiliation>(
					"agencies/affiliations",
					{ name: titleCasedName }
				);
				handleSelectAffiliation(newAffiliation);
			} catch {
				// Silently fail — the user can retry
			}
		};

		const handleRemoveAffiliation = (affiliation: IAffiliation) => {
			if (!isEditable) return;
			onChangeMultiple?.(values.filter((a) => a.id !== affiliation.id));
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!isOpen || totalItems === 0) return;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
			} else if (e.key === "Enter" && highlightedIndex >= 0) {
				e.preventDefault();
				if (highlightedIndex < filteredResults.length) {
					handleSelectAffiliation(filteredResults[highlightedIndex]);
				} else if (showCreateOption) {
					handleCreateNew();
				}
			} else if (e.key === "Escape") {
				setIsOpen(false);
				setHighlightedIndex(-1);
			}
		};

		return (
			<div
				ref={containerRef}
				className={cn(
					"w-full relative",
					isRequired && "required",
					wrapperClassName
				)}
			>
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
						onChange={(e) => {
							setSearchTerm(e.target.value);
							if (e.target.value.trim().length > 0) {
								setIsOpen(true);
							}
							setHighlightedIndex(-1);
						}}
						onFocus={() => {
							if (searchTerm.trim().length > 0) {
								setIsOpen(true);
							}
						}}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						autoComplete="off"
						disabled={disabled}
						autoFocus={autoFocus}
						className={cn(showIcon && "pl-10", className)}
						role="combobox"
						aria-expanded={isOpen}
						aria-haspopup="listbox"
					/>
				</div>

				{/* Dropdown results */}
				{isOpen && totalItems > 0 && (
					<div
						className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto"
						role="listbox"
					>
						{filteredResults.map((affiliation, index) => (
							<button
								key={affiliation.id}
								type="button"
								role="option"
								aria-selected={highlightedIndex === index}
								className={cn(
									"w-full text-left px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer",
									highlightedIndex === index && "bg-accent"
								)}
								onMouseEnter={() => setHighlightedIndex(index)}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => handleSelectAffiliation(affiliation)}
							>
								<Building2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
								<span className="text-sm truncate">{affiliation.name}</span>
							</button>
						))}
						{showCreateOption && (
							<button
								type="button"
								role="option"
								aria-selected={highlightedIndex === filteredResults.length}
								className={cn(
									"w-full text-left px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer border-t",
									highlightedIndex === filteredResults.length && "bg-accent"
								)}
								onMouseEnter={() => setHighlightedIndex(filteredResults.length)}
								onMouseDown={(e) => e.preventDefault()}
								onClick={handleCreateNew}
							>
								<Building2 className="h-4 w-4 text-primary flex-shrink-0" />
								<span className="text-sm">
									Add &ldquo;{toTitleCase(searchTerm.trim())}&rdquo; as an
									organisation
								</span>
							</button>
						)}
					</div>
				)}

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
