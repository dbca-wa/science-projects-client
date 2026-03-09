/**
 * OutdentButton Component
 *
 * Toolbar button for decreasing indent level.
 */

import React from "react";
import { Outdent } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { OutdentButtonProps } from "@/shared/types/editor.types";

export const OutdentButton: React.FC<OutdentButtonProps> = ({
	disabled = false,
	onOutdent,
	canOutdent,
}) => {
	return (
		<BaseToolbarButton
			icon={Outdent}
			label="Decrease indent (Shift+Tab)"
			onClick={onOutdent}
			disabled={disabled || !canOutdent}
		/>
	);
};
