import { useState, type ReactNode } from "react";
import { useStaffProfileOverview } from "../../hooks/useStaffProfileOverview";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/shared/components/ui/tooltip";
import { RichTextDisplay } from "@/shared/components/editor/RichTextDisplay";
import { MdEdit } from "react-icons/md";
import EditOverviewFieldModal from "../modals/EditOverviewFieldModal";
import EditKeywordsModal from "../modals/EditKeywordsModal";

interface OverviewSectionProps {
	profilePk: number;
	canEdit: boolean;
}

/** Reusable subsection matching the original's layout */
const Subsection = ({
	title,
	button,
	children,
}: {
	title: string;
	button?: ReactNode;
	children: ReactNode;
}) => (
	<div className="w-full p-4">
		<div className="flex w-full min-w-[270px] items-center justify-between">
			<p className="text-lg font-semibold text-slate-900">{title}</p>
			{button}
		</div>
		<Separator className="mt-2 mb-3 bg-slate-200" />
		<div className="w-full">{children}</div>
	</div>
);

const OverviewSection = ({ profilePk, canEdit }: OverviewSectionProps) => {
	const { data, isLoading } = useStaffProfileOverview(profilePk);
	const [editField, setEditField] = useState<"about" | "expertise" | null>(
		null
	);
	const [keywordsOpen, setKeywordsOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6 p-4">
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	if (!data) return null;

	const editBtn = (field: "about" | "expertise") =>
		canEdit ? (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setEditField(field)}
						className="gap-1 text-slate-500 hover:text-slate-700"
					>
						<MdEdit className="size-4" />
						Edit
					</Button>
				</TooltipTrigger>
				<TooltipContent variant="light">
					<p>Edit {field}</p>
				</TooltipContent>
			</Tooltip>
		) : undefined;

	return (
		<div>
			{/* About */}
			<Subsection title="About" button={editBtn("about")}>
				{data.about ? (
					<RichTextDisplay
						content={data.about}
						className="pt-1"
						emptyMessage="No information recorded."
					/>
				) : (
					<p className="text-muted-foreground">No information recorded.</p>
				)}
			</Subsection>

			{/* Expertise */}
			<Subsection title="Expertise" button={editBtn("expertise")}>
				{data.expertise ? (
					<RichTextDisplay
						content={data.expertise}
						className="pt-1"
						emptyMessage="No information recorded."
					/>
				) : (
					<p className="text-muted-foreground">No information recorded.</p>
				)}
			</Subsection>

			{/* Key Interests */}
			<Subsection
				title="Key Interests"
				button={
					canEdit ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setKeywordsOpen(true)}
									className="gap-1 text-slate-500 hover:text-slate-700"
								>
									<MdEdit className="size-4" />
									Edit
								</Button>
							</TooltipTrigger>
							<TooltipContent variant="light">
								<p>Edit key interests</p>
							</TooltipContent>
						</Tooltip>
					) : undefined
				}
			>
				{data.keywords && data.keywords.length > 0 ? (
					<div className="flex flex-wrap gap-2 pt-1">
						{data.keywords
							.sort((a, b) => a.name.localeCompare(b.name))
							.map((tag) => (
								<span
									key={tag.id}
									className="inline-flex items-center rounded-md border border-[#2A6096]/20 bg-[#2A6096]/5 px-3 py-1.5 text-xs font-semibold text-[#2A6096]"
								>
									{tag.name.trim().replace(/\b\w/g, (l) => l.toUpperCase())}
								</span>
							))}
					</div>
				) : (
					<p className="text-muted-foreground">No information recorded.</p>
				)}
			</Subsection>

			{/* Edit modals */}
			{editField && (
				<EditOverviewFieldModal
					profilePk={profilePk}
					field={editField}
					title={editField === "about" ? "About" : "Expertise"}
					currentValue={editField === "about" ? data.about : data.expertise}
					open={!!editField}
					onOpenChange={(open) => !open && setEditField(null)}
				/>
			)}

			<EditKeywordsModal
				profilePk={profilePk}
				currentKeywords={data.keywords || []}
				open={keywordsOpen}
				onOpenChange={setKeywordsOpen}
			/>
		</div>
	);
};

export default OverviewSection;
