import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";

interface CrudSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
}

export function CrudSearchInput({
	value,
	onChange,
	placeholder,
}: CrudSearchInputProps) {
	return (
		<div className="relative">
			<Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-9"
			/>
		</div>
	);
}
