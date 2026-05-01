import { useRef, useState, useEffect, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useITAssetsSearch } from "../hooks/useITAssetsSearch";
import type { ITAssetUser } from "../services/user.service";

interface ITAssetsSearchDropdownProps {
	onSelect: (user: ITAssetUser) => void;
	label?: string;
	placeholder?: string;
	helperText?: string;
	disabled?: boolean;
}

/**
 * IT Assets search dropdown for finding and inviting DBCA users.
 *
 * Similar to BaseUserSearch but without avatars, and with
 * status annotations (already in SPMS, already invited).
 */
export const ITAssetsSearchDropdown = ({
	onSelect,
	label = "Search IT Assets",
	placeholder = "Search by name or email...",
	helperText,
	disabled = false,
}: ITAssetsSearchDropdownProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const portalRef = useRef<HTMLDivElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	const { searchTerm, setSearchTerm, results, isLoading } =
		useITAssetsSearch(300);

	// Only show selectable results (not already in SPMS)
	const selectableResults = results.filter((u) => !u.in_spms);
	const allResults = results;

	// Click-away detection — must also check the portal element
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const isInsideWrapper =
				wrapperRef.current && wrapperRef.current.contains(target);
			const isInsidePortal =
				portalRef.current && portalRef.current.contains(target);

			if (!isInsideWrapper && !isInsidePortal) {
				setIsMenuOpen(false);
				setHighlightedIndex(-1);
			}
		};

		if (isMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isMenuOpen]);

	const handleSelect = (user: ITAssetUser) => {
		setIsMenuOpen(false);
		setHighlightedIndex(-1);
		setSearchTerm("");
		onSelect(user);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const { key } = event;
		// Only navigate through selectable items
		const navigableItems = allResults;
		const count = navigableItems.length;

		if (count === 0) return;

		switch (key) {
			case "ArrowDown":
				event.preventDefault();
				setHighlightedIndex((prev) => (prev < count - 1 ? prev + 1 : prev));
				break;
			case "ArrowUp":
				event.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				event.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < count) {
					const item = navigableItems[highlightedIndex];
					if (!item.in_spms && !item.already_invited) {
						handleSelect(item);
					}
				}
				break;
			case "Escape":
				event.preventDefault();
				setIsMenuOpen(false);
				setHighlightedIndex(-1);
				break;
		}
	};

	return (
		<div ref={wrapperRef} className="w-full">
			{label && (
				<Label className="mb-2" htmlFor="it-assets-search">
					{label}
				</Label>
			)}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
				)}
				<Input
					ref={inputRef}
					id="it-assets-search"
					type="text"
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setHighlightedIndex(-1);
						if (e.target.value.trim().length > 0 && !isMenuOpen) {
							setIsMenuOpen(true);
						}
					}}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (searchTerm.trim().length > 0) setIsMenuOpen(true);
					}}
					placeholder={placeholder}
					className="pl-10"
					autoComplete="off"
					disabled={disabled}
				/>
			</div>

			<ITAssetsResultsPortal
				isOpen={isMenuOpen && allResults.length > 0}
				inputRef={inputRef}
				portalRef={portalRef}
				results={allResults}
				onSelect={handleSelect}
				highlightedIndex={highlightedIndex}
				onHighlightChange={setHighlightedIndex}
			/>

			{/* No results message */}
			{isMenuOpen &&
				!isLoading &&
				searchTerm.length >= 2 &&
				allResults.length === 0 && (
					<p className="text-sm text-muted-foreground mt-2">
						No users found matching &ldquo;{searchTerm}&rdquo;
					</p>
				)}

			{/* All results are existing SPMS users */}
			{isMenuOpen &&
				!isLoading &&
				allResults.length > 0 &&
				selectableResults.length === 0 && (
					<p className="text-sm text-muted-foreground mt-2">
						All matching users are already in SPMS or have been invited.
					</p>
				)}

			{helperText && (
				<p className="text-sm text-muted-foreground mt-2">{helperText}</p>
			)}
		</div>
	);
};

// =========================================== INTERNAL COMPONENTS ====================================================

interface ITAssetsResultsPortalProps {
	isOpen: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	portalRef: RefObject<HTMLDivElement | null>;
	results: ITAssetUser[];
	onSelect: (user: ITAssetUser) => void;
	highlightedIndex: number;
	onHighlightChange: (index: number) => void;
}

const ITAssetsResultsPortal = ({
	isOpen,
	inputRef,
	portalRef,
	results,
	onSelect,
	highlightedIndex,
	onHighlightChange,
}: ITAssetsResultsPortalProps) => {
	const portalElement = useState<HTMLElement>(() => {
		const el = document.createElement("div");
		el.style.position = "fixed";
		el.style.zIndex = "9999";
		return el;
	})[0];
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

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
			ref={portalRef}
			className="fixed min-w-[200px] shadow-md z-[9999] rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[300px] overflow-y-auto"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
			}}
		>
			{results.map((user, index) => (
				<ITAssetMenuItem
					key={user.employee_id || user.email}
					user={user}
					onSelect={onSelect}
					isHighlighted={index === highlightedIndex}
					onHover={() => onHighlightChange(index)}
				/>
			))}
		</div>,
		portalElement
	);
};

interface ITAssetMenuItemProps {
	user: ITAssetUser;
	onSelect: (user: ITAssetUser) => void;
	isHighlighted: boolean;
	onHover: () => void;
}

const ITAssetMenuItem = ({
	user,
	onSelect,
	isHighlighted,
	onHover,
}: ITAssetMenuItemProps) => {
	const isDisabled = user.in_spms || user.already_invited;

	return (
		<button
			type="button"
			className={cn(
				"w-full text-left px-3 py-2.5 transition-colors",
				isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
				isHighlighted && !isDisabled && "bg-gray-100 dark:bg-gray-700"
			)}
			onClick={(e) => {
				e.stopPropagation();
				if (!isDisabled) onSelect(user);
			}}
			onMouseEnter={onHover}
			disabled={isDisabled}
			aria-disabled={isDisabled}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium truncate">{user.name}</p>
					<p className="text-xs text-muted-foreground truncate">
						{user.email}
						{user.title && ` · ${user.title}`}
					</p>
				</div>
				{user.in_spms && (
					<span className="text-xs text-muted-foreground whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
						Already in SPMS
					</span>
				)}
				{user.already_invited && !user.in_spms && (
					<span className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
						Already invited
					</span>
				)}
			</div>
		</button>
	);
};
