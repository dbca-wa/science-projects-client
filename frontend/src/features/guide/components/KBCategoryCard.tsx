import { useMemo, createElement } from "react";
import { useNavigate } from "react-router";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { getIconComponent } from "../utils/icon.utils";
import type { IGuideSection, GuideSectionRole } from "../types/guide.types";

const ROLE_LABELS: Partial<Record<GuideSectionRole, string>> = {
	admin: "Admin",
	business_area_lead: "BA Leads",
	key_stakeholder: "Key Stakeholders",
};

interface KBCategoryCardProps {
	section: IGuideSection;
}

export const KBCategoryCard = ({ section }: KBCategoryCardProps) => {
	const navigate = useNavigate();
	const iconElement = useMemo(
		() =>
			createElement(getIconComponent(section.icon), { className: "h-5 w-5" }),
		[section.icon]
	);
	const articleCount = section.content_fields.length;
	const roleLabel = ROLE_LABELS[section.required_role];

	return (
		<Card
			role="link"
			tabIndex={0}
			aria-label={`${section.title} — ${articleCount} article${articleCount !== 1 ? "s" : ""}`}
			className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onClick={() => navigate(`/guide/${section.id}`)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					navigate(`/guide/${section.id}`);
				}
			}}
		>
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-900">
						{iconElement}
					</div>
					<div className="flex items-center gap-1.5">
						{roleLabel && (
							<Badge
								variant="outline"
								className="text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30"
							>
								{roleLabel}
							</Badge>
						)}
						{articleCount > 0 && (
							<Badge variant="secondary" className="text-xs">
								{articleCount} article{articleCount !== 1 ? "s" : ""}
							</Badge>
						)}
					</div>
				</div>
				<div>
					<CardTitle className="text-base">{section.title}</CardTitle>
					{section.description && (
						<CardDescription className="mt-1 line-clamp-2">
							{section.description}
						</CardDescription>
					)}
				</div>
			</CardHeader>
		</Card>
	);
};
