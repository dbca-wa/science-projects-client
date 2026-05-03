import { useState } from "react";
import { useNavigate } from "react-router";
import { Building, MapPin, User, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/shared/components/ui/tooltip";
import { getImageUrl } from "@/shared/utils/image.utils";
import EmailStaffModal from "../modals/EmailStaffModal";
import type { IStaffProfileCard } from "../../types/staff-profile.types";

interface StaffProfileCardProps {
	profile: IStaffProfileCard;
}

const StaffProfileCard = ({ profile }: StaffProfileCardProps) => {
	const navigate = useNavigate();
	const [emailOpen, setEmailOpen] = useState(false);
	const displayName =
		`${profile.user.first_name} ${profile.user.last_name}`.trim();
	const initials =
		`${profile.user.first_name?.[0] ?? ""}${profile.user.last_name?.[0] ?? ""}`.toUpperCase();
	const [imgError, setImgError] = useState(false);
	const avatarUrl =
		!imgError && profile.image ? getImageUrl(profile.image) : undefined;

	const displayPosition =
		profile.custom_title_on && profile.custom_title
			? `${profile.custom_title[0].toUpperCase()}${profile.custom_title.slice(1)}`
			: profile.position;

	return (
		<motion.div
			whileHover={{ y: -3 }}
			transition={{ duration: 0.15, ease: "easeOut" }}
			className="relative flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
		>
			{/* Hidden badge */}
			{profile.is_hidden && (
				<div className="absolute right-0 top-0 rounded-bl-lg bg-red-500 px-2 py-0.5 text-xs text-white z-10">
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="select-none cursor-default">HIDDEN</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>This staff profile is hidden from the public</p>
						</TooltipContent>
					</Tooltip>
				</div>
			)}

			{/* Card body — clickable link to profile */}
			<a
				href={`/staff/${profile.id}`}
				onClick={(e) => {
					e.preventDefault();
					navigate(`/staff/${profile.id}`);
				}}
				className="p-5 flex-1 cursor-pointer"
				draggable={false}
			>
				{/* Avatar + name row */}
				<div className="flex items-center gap-3 mb-4">
					{avatarUrl ? (
						<div className="size-[70px] rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100">
							<img
								src={avatarUrl}
								alt={displayName}
								width={70}
								height={70}
								className="w-full h-full object-cover"
								onError={() => setImgError(true)}
							/>
						</div>
					) : (
						<div className="size-[70px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold shrink-0 select-none ring-2 ring-slate-100">
							{initials}
						</div>
					)}
					<h2 className="text-base font-semibold text-slate-900 leading-snug flex-1">
						<span className="group-hover:text-blue-600 transition-colors">
							{displayName}
						</span>
					</h2>
					{/* Hover arrow indicator */}
					<ChevronRight
						className="size-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0"
						aria-hidden="true"
					/>
				</div>

				{/* Details */}
				<div className="space-y-1.5 text-sm text-slate-500">
					{displayPosition && (
						<div className="flex items-start gap-2">
							<User className="mt-[2px] shrink-0 text-slate-400" size={13} />
							<span className="text-balance leading-snug">
								{displayPosition}
							</span>
						</div>
					)}
					{profile.division && (
						<div className="flex items-start gap-2">
							<Building
								className="mt-[2px] shrink-0 text-slate-400"
								size={13}
							/>
							<span className="text-balance leading-snug">
								{profile.division}. {profile.unit}
							</span>
						</div>
					)}
					{profile.location && (
						<div className="flex items-start gap-2">
							<MapPin className="mt-[2px] shrink-0 text-slate-400" size={13} />
							<span className="leading-snug">
								{typeof profile.location === "string"
									? profile.location
									: profile.location.name?.trim()}
							</span>
						</div>
					)}
				</div>
			</a>

			{/* Email CTA footer */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setEmailOpen(true);
				}}
				onMouseDown={(e) => e.stopPropagation()}
				aria-label={`Send email to ${displayName}`}
				className="relative z-10 flex items-center justify-center gap-2 w-full border-t border-slate-100 py-3 text-sm font-medium text-blue-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
			>
				<Mail className="size-3.5" aria-hidden="true" />
				Email {displayName}
			</button>

			<EmailStaffModal
				userPk={profile.user.id}
				staffName={displayName}
				open={emailOpen}
				onOpenChange={setEmailOpen}
			/>
		</motion.div>
	);
};

export default StaffProfileCard;
