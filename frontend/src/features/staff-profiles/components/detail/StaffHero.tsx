import { useState } from "react";
import { useNavigate } from "react-router";
import { useStaffProfileHero } from "../../hooks/useStaffProfileHero";
import { useToggleVisibility } from "../../hooks/useStaffProfileMutations";
import { useCurrentUser } from "@/features/auth";
import { getImageUrl } from "@/shared/utils/image.utils";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ChevronLeft, Mail } from "lucide-react";
import { useMediaQuery } from "@/shared/hooks/ui/useMediaQuery";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import EmailStaffModal from "../modals/EmailStaffModal";
import DeleteEntryModal from "../modals/DeleteEntryModal";

interface StaffHeroProps {
	profilePk: number;
	canEdit: boolean;
	userId: number;
	editButton?: React.ReactNode;
}

const StaffHero = ({
	profilePk,
	canEdit: _canEdit,
	userId,
	editButton,
}: StaffHeroProps) => {
	const navigate = useNavigate();
	const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
	const { data, isLoading } = useStaffProfileHero(profilePk);
	const { data: currentUser } = useCurrentUser();
	const toggleVisibility = useToggleVisibility(profilePk);

	const [emailOpen, setEmailOpen] = useState(false);
	const [toggleOpen, setToggleOpen] = useState(false);
	const [imgError, setImgError] = useState(false);

	const isOwner = !!currentUser && currentUser.id === userId;
	const showEmailButton = !isOwner;

	if (isLoading) {
		return (
			<div className="mb-6 px-4">
				<Skeleton className="h-5 w-24 mb-6" />
				<div className="flex gap-4">
					<Skeleton className="size-[150px] rounded-lg shrink-0" />
					<div className="flex-1 space-y-2 pt-1">
						<Skeleton className="h-7 w-48" />
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const displayName = `${data.user.first_name} ${data.user.last_name}`.trim();
	const avatarUrl =
		!imgError && data.avatar?.file ? getImageUrl(data.avatar.file) : null;

	const position = data.it_asset_data?.title || data.work?.role || null;
	const unit = data.it_asset_data?.unit;
	const division = data.it_asset_data?.division;
	const locationName = data.it_asset_data?.location
		? typeof data.it_asset_data.location === "string"
			? data.it_asset_data.location
			: (data.it_asset_data.location as { name: string })?.name
		: null;

	const modals = (
		<>
			<EmailStaffModal
				userPk={userId}
				staffName={displayName}
				open={emailOpen}
				onOpenChange={setEmailOpen}
			/>
			<DeleteEntryModal
				title="Toggle Profile Visibility"
				description="Are you sure you want to change this profile's visibility?"
				open={toggleOpen}
				onOpenChange={setToggleOpen}
				onConfirm={() =>
					toggleVisibility.mutate(undefined, {
						onSuccess: () => setToggleOpen(false),
					})
				}
				isPending={toggleVisibility.isPending}
			/>
		</>
	);

	if (!isDesktop) {
		return (
			<div className="mb-2">
				<div className="flex items-center justify-between px-4 py-3">
					<Button
						variant="link"
						className="text-slate-800 gap-1 p-0"
						onClick={() => navigate("/staff")}
					>
						<ChevronLeft className="size-4" />
						Back
					</Button>
					{editButton && <div>{editButton}</div>}
				</div>
				{avatarUrl && (
					<div className="flex justify-center mb-3">
						<img
							src={avatarUrl}
							alt={`Profile of ${displayName}`}
							className="size-40 rounded-lg object-cover pointer-events-none select-none"
							onError={() => setImgError(true)}
						/>
					</div>
				)}
				<div className="flex w-full flex-col items-center px-4 pb-2 text-center">
					<p className="text-2xl font-semibold text-slate-900">{displayName}</p>
					{position && (
						<p className="mt-3 font-semibold text-balance text-slate-600">
							{position}
						</p>
					)}
					{(unit || division) && (
						<p className="mt-1 text-sm font-medium text-balance text-slate-500">
							{unit}
							{division ? `, ${division}` : ""}
						</p>
					)}
					{locationName && (
						<p className="mt-1 text-sm font-medium text-slate-500">
							{locationName}
						</p>
					)}
				</div>
				{showEmailButton && (
					<div className="mt-2 flex justify-center">
						<Button
							variant="link"
							className="text-blue-600 gap-1"
							onClick={() => setEmailOpen(true)}
						>
							<Mail className="size-4" />
							Email {displayName}
						</Button>
					</div>
				)}
				{modals}
			</div>
		);
	}

	return (
		<div className="mb-2 px-4">
			<div className="mt-6 flex flex-col">
				<div className="flex items-center justify-between">
					<Button
						variant="link"
						className="-ml-2 text-slate-800 gap-1 w-fit"
						onClick={() => navigate("/staff")}
					>
						<ChevronLeft className="size-4" />
						Back to Search
					</Button>
					{editButton && <div>{editButton}</div>}
				</div>
				<div className="mt-4 flex">
					{avatarUrl && (
						<img
							src={avatarUrl}
							alt={`Profile of ${displayName}`}
							className="pointer-events-none mr-4 size-[180px] shrink-0 select-none rounded-lg object-cover"
							onError={() => setImgError(true)}
						/>
					)}
					<div className="flex w-full flex-col">
						<p className="text-2xl font-semibold text-slate-900">
							{displayName}
						</p>
						{position && (
							<p className="mt-2 text-balance font-semibold text-slate-600">
								{position}
							</p>
						)}
						{(unit || division) && (
							<p className="mt-1 text-balance text-sm font-medium text-slate-500">
								{unit}
								{division ? `, ${division}` : ""}
							</p>
						)}
						{locationName && (
							<p className="mt-1 text-balance text-sm font-medium text-slate-500">
								{locationName}
							</p>
						)}
						{showEmailButton && (
							<div className="mt-3">
								<Button
									variant="link"
									className="p-0 h-auto text-blue-600 gap-1 -ml-3"
									onClick={() => setEmailOpen(true)}
								>
									<Mail className="size-4" />
									Email {displayName}
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
			{modals}
		</div>
	);
};

export default StaffHero;
