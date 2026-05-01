import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
	error?: string;
}

/**
 * FieldError — Inline validation error message for a form field.
 *
 * Renders a small icon + message below the field when an error string is provided.
 */
export const FieldError = ({ error }: FieldErrorProps) => {
	if (!error) return null;
	return (
		<div className="flex items-center gap-1 text-xs text-destructive mt-1">
			<AlertCircle className="h-3 w-3" />
			<span>{error}</span>
		</div>
	);
};
