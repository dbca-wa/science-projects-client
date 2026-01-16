import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Debounce utility function
 */
function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * UserSearchBar component
 * Search input with debouncing for the users list page
 */
export const UserSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search Users..." 
}: SearchBarProps) => {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback (500ms to match original)
  const debouncedOnChange = useMemo(
    () => debounce(onChange, 500),
    [onChange]
  );

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
        className="pl-10 bg-transparent text-sm rounded-md !h-10"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
    </div>
  );
};
