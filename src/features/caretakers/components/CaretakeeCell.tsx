import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { getImageUrl } from "@/shared/utils/image.utils";

interface CaretakeeCellProps {
	user: {
		id: number;
		display_first_name: string;
		display_last_name: string;
		email: string;
		image: string | null;
	};
}

/**
 * Cell component to display caretakee information in data tables
 * Shows avatar, name with "For:" prefix, and tooltip with full details
 */
export const CaretakeeCell = ({ user }: CaretakeeCellProps) => {
	const fullName = `${user.display_first_name} ${user.display_last_name}`;
	const initials = `${user.display_first_name[0]}${user.display_last_name[0]}`;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-2">
						<Avatar className="size-6">
							<AvatarImage src={getImageUrl(user.image)} alt={fullName} />
							<AvatarFallback className="text-xs">{initials}</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="text-sm font-medium truncate">
								<span className="text-muted-foreground">For: </span>
								{fullName}
							</p>
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="space-y-1">
						<p className="font-semibold">{fullName}</p>
						<p className="text-xs text-muted-foreground">{user.email}</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
