/**
 * IndentButton Component
 *
 * Toolbar button for increasing indent level.
 */

import React from "react";
import { Indent } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { IndentButtonProps } from "@/shared/types/editor.types";

export const IndentButton: React.FC<IndentButtonProps> = ({
	disabled = false,
	onIndent,
	canIndent,
}) => {
	return (
		<BaseToolbarButton
			icon={Indent}
			label="Increase indent (Tab)"
			onClick={onIndent}
			disabled={disabled || !canIndent}
		/>
	);
};
