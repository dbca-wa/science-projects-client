import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Building2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/services/api/client.service";
import { toTitleCase } from "@/shared/utils";
import type { IAffiliation } from "@/shared/types/org.types";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

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
}

/**
 * AffiliationCombobox component
 * Searchable dropdown for selecting affiliations (single or multi-select)
 * Based on BaseUserSearch design patterns
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
export const AffiliationCombobox = forwardRef<AffiliationComboboxRef, AffiliationComboboxProps>(
	(
		{
			value,
			onChange,
			multiple = false,
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
		ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const [searchTerm, setSearchTerm] = useState("");
		const [filteredItems, setFilteredItems] = useState<IAffiliation[]>([]);
		const [isMenuOpen, setIsMenuOpen] = useState(false);
		const [selectedAffiliation, setSelectedAffiliation] = useState<IAffiliation | null>(null);
		const [isLoadingAffiliation, setIsLoadingAffiliation] = useState(false);
		const [isCreating, setIsCreating] = useState(false);

		// Debounce search term (300ms)
		const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

		// Load selected affiliation by ID (single-select mode)
		useEffect(() => {
			if (!multiple && value && value > 0) {
				setIsLoadingAffiliation(true);
				apiClient
					.get<IAffiliation>(`agencies/affiliations/${value}`)
					.then((affiliation) => {
						setSelectedAffiliation(affiliation);
						setIsMenuOpen(false);
					})
					.catch((error) => {
						console.error("Error loading affiliation:", error);
					})
					.finally(() => {
						setIsLoadingAffiliation(false);
					});
			} else if (!multiple) {
				setSelectedAffiliation(null);
			}
		}, [value, multiple]);

		// Search affiliations based on debounced search term
		useEffect(() => {
			if (debouncedSearchTerm.trim() !== "") {
				apiClient
					.get<{ affiliations: IAffiliation[]; total_results: number; total_pages: number }>(
						"agencies/affiliations",
						{
							params: { searchTerm: debouncedSearchTerm, page: 1 },
						}
					)
					.then((data) => {
						setFilteredItems(data.affiliations || []);
					})
					.catch((error) => {
						console.error("Error fetching affiliations:", error);
						setFilteredItems([]);
					});
			} else {
				setFilteredItems([]);
			}
		}, [debouncedSearchTerm]);

		const handleSelectAffiliation = (affiliation: IAffiliation) => {
			if (multiple) {
				// Multi-select mode
				if (values.some(a => a.id === affiliation.id)) {
					return; // Already selected
				}
				onChangeMultiple?.([...values, affiliation]);
				setSearchTerm("");
				// Refocus for adding more
				setTimeout(() => inputRef.current?.focus(), 0);
			} else {
				// Single-select mode
				setSelectedAffiliation(affiliation);
				onChange?.(affiliation.id);
				setIsMenuOpen(false);
				setSearchTerm("");
			}
		};

		const handleClearAffiliation = () => {
			if (!isEditable) return;
			setSelectedAffiliation(null);
			onChange?.(undefined);
			setIsMenuOpen(true);
			setSearchTerm("");
		};

		const handleRemoveAffiliation = (affiliation: IAffiliation) => {
			if (!isEditable || !multiple) return;
			onChangeMultiple?.(values.filter(a => a.id !== affiliation.id));
		};

		const handleCreateAffiliation = async () => {
			if (!searchTerm.trim() || isCreating) return;

			setIsCreating(true);
			try {
				const titleCasedName = toTitleCase(searchTerm.trim());
				const newAffiliation = await apiClient.post<IAffiliation>("agencies/affiliations", {
					name: titleCasedName,
				});
				
				handleSelectAffiliation(newAffiliation);
			} catch (error) {
				console.error("Error creating affiliation:", error);
			} finally {
				setIsCreating(false);
			}
		};

		useImperativeHandle(ref, () => ({
			focusInput: () => {
				if (inputRef.current) {
					inputRef.current.focus();
				}
			},
		}));

		const showCreateOption = searchTerm.trim() !== "" && 
			filteredItems.length === 0 && 
			!isCreating;

		if (isLoadingAffiliation) {
			return <div className="text-sm text-muted-foreground">Loading...</div>;
		}

		return (
			<div className={cn("w-full", isRequired && "required", wrapperClassName)}>
				{label && (
					<Label className="mb-2">
						{label} {isRequired && <span className="text-destructive">*</span>}
					</Label>
				)}
				
				{/* Multi-select: Show selected chips */}
				{multiple && values.length > 0 && (
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

				{/* Single-select: Show selected affiliation */}
				{!multiple && selectedAffiliation ? (
					<div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2">
						<span className="text-green-500 dark:text-green-400 flex-1">
							{selectedAffiliation.name}
						</span>
						{isEditable && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleClearAffiliation}
								disabled={disabled}
								className="h-6 w-6 p-0"
							>
								<X className="size-4" />
							</Button>
						)}
					</div>
				) : (
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
							onFocus={() => setIsMenuOpen(true)}
							disabled={disabled}
							autoFocus={autoFocus}
							className={cn(
								showIcon && "pl-10",
								className
							)}
						/>
					</div>
				)}

				{/* Search Results Portal */}
				<SearchResultsPortal
					isOpen={(filteredItems.length > 0 || showCreateOption) && isMenuOpen && (!selectedAffiliation || multiple)}
					inputRef={inputRef}
					affiliations={filteredItems}
					onSelect={handleSelectAffiliation}
					showCreateOption={showCreateOption}
					searchTerm={searchTerm}
					onCreateNew={handleCreateAffiliation}
					isCreating={isCreating}
				/>

				{helperText && (
					<p className="text-sm text-muted-foreground mt-2">{helperText}</p>
				)}
			</div>
		);
	}
);

AffiliationCombobox.displayName = "AffiliationCombobox";


// =========================================== INTERNAL COMPONENTS ====================================================

interface SearchResultsPortalProps {
	isOpen: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	affiliations: IAffiliation[];
	onSelect: (affiliation: IAffiliation) => void;
	showCreateOption: boolean;
	searchTerm: string;
	onCreateNew: () => void;
	isCreating: boolean;
}

const SearchResultsPortal = ({
	isOpen,
	inputRef,
	affiliations,
	onSelect,
	showCreateOption,
	searchTerm,
	onCreateNew,
	isCreating,
}: SearchResultsPortalProps) => {
	const portalElement = useState<HTMLElement>(() => {
		const el = document.createElement("div");
		el.style.position = "fixed";
		el.style.zIndex = "9999";
		return el;
	})[0];
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

	// Append/remove portal element
	useEffect(() => {
		if (portalElement) {
			document.body.appendChild(portalElement);
			return () => {
				if (document.body.contains(portalElement)) {
					document.body.removeChild(portalElement);
				}
			};
		}
	}, [portalElement]);

	// Update position when inputRef changes or when isOpen changes
	useEffect(() => {
		if (inputRef.current && isOpen) {
			const updatePosition = () => {
				if (!inputRef.current) return;
				const rect = inputRef.current.getBoundingClientRect();
				setPosition({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
				});
			};

			updatePosition();

			window.addEventListener("scroll", updatePosition);
			window.addEventListener("resize", updatePosition);

			return () => {
				window.removeEventListener("scroll", updatePosition);
				window.removeEventListener("resize", updatePosition);
			};
		}
	}, [inputRef, isOpen]);

	if (!isOpen || !portalElement) return null;

	return createPortal(
		<div
			className="fixed min-w-[200px] shadow-md z-[9999] rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
			}}
		>
			<div className="relative w-full max-h-60 overflow-auto">
				{affiliations.map((affiliation) => (
					<AffiliationMenuItem
						key={affiliation.id}
						affiliation={affiliation}
						onSelect={onSelect}
					/>
				))}
				
				{/* Create new affiliation option */}
				{showCreateOption && (
					<button
						type="button"
						onClick={onCreateNew}
						disabled={isCreating}
						className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-t border-gray-200 dark:border-gray-600"
					>
						<span className="text-green-600 dark:text-green-400 flex items-center gap-2 text-sm">
							{isCreating ? (
								<>Creating...</>
							) : (
								<>
									<Building2 className="h-4 w-4" />
									Click to add "{toTitleCase(searchTerm)}" as an organisation/affiliation
								</>
							)}
						</span>
					</button>
				)}
			</div>
		</div>,
		portalElement
	);
};

const AffiliationMenuItem = ({
	affiliation,
	onSelect,
}: {
	affiliation: IAffiliation;
	onSelect: (affiliation: IAffiliation) => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<button
			type="button"
			className={cn(
				"w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
				isHovered ? "bg-gray-200 dark:bg-gray-600" : "transparent"
			)}
			onClick={() => onSelect(affiliation)}
			onMouseOver={() => setIsHovered(true)}
			onMouseOut={() => setIsHovered(false)}
		>
			<Building2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
			<span className="text-sm text-green-600 dark:text-green-400 truncate">
				{affiliation.name}
			</span>
		</button>
	);
};
