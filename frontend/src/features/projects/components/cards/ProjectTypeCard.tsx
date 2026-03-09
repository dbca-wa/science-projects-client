import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

export interface ProjectTypeCardProps {
	title: string;
	description: string;
	requirements: string[];
	icon: LucideIcon;
	color: string;
	onClick: () => void;
}

export const ProjectTypeCard = ({
	title,
	description,
	requirements,
	icon: Icon,
	color,
	onClick,
}: ProjectTypeCardProps) => {
	return (
		<Card
			className={cn(
				"group relative h-full cursor-pointer overflow-hidden py-0 transition-all duration-300",
				"hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10",
				"active:scale-[0.98]",
				"border-2 hover:border-primary/20"
			)}
			onClick={onClick}
		>
			{/* Colored Header */}
			<CardHeader
				className="relative rounded-t-lg px-6 pb-6 pt-8 text-white"
				style={{ backgroundColor: color }}
			>
				{/* Subtle gradient overlay for depth */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<CardTitle className="relative flex items-center gap-3 text-xl">
					<Icon className="h-10 w-10 drop-shadow-md" />
					<span className="drop-shadow-md">{title}</span>
				</CardTitle>
			</CardHeader>

			{/* Content Area */}
			<CardContent className="space-y-5 px-6 py-6">
				{/* Description */}
				<p className="text-sm leading-relaxed text-muted-foreground">
					{description}
				</p>

				{/* Requirements List */}
				<div className="space-y-3">
					<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Requirements
					</h4>
					<ul className="space-y-2.5">
						{requirements.map((requirement, index) => (
							<li key={index} className="flex items-start gap-2.5">
								<CheckCircle2
									className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
									style={{ color }}
								/>
								<span className="text-sm leading-snug">{requirement}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Hover indicator */}
				<div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<div className="flex items-center gap-1 text-xs font-medium text-primary">
						<span>Select</span>
						<span className="text-lg">→</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
