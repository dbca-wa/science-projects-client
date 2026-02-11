import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { debounce } from "@/shared/utils/common.utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

/**
 * UserSearchBar component
 * Search input with debouncing for the users list page
 */
export const UserSearchBar = ({
	value,
	onChange,
	placeholder = "Search Users...",
}: SearchBarProps) => {
	// Local state for immediate UI updates
	const [localValue, setLocalValue] = useState(value);

	// Sync local value when prop changes
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Debounce the onChange callback (500ms to match original)
	const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		debouncedOnChange(newValue);
	};

	return (
		<div className="relative w-full">
			<Input
				type="text"
				placeholder={placeholder}
				value={localValue}
				onChange={handleChange}
				variant="search"
				className="pl-10 text-sm rounded-md !h-10"
			/>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
		</div>
	);
};
