import { useParams, useNavigate } from "react-router";
import { useStaffProfileHero } from "@/features/staff-profiles/hooks/useStaffProfileHero";
import { useCurrentUser } from "@/features/auth";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Loader2, ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/shared/components/ui/tooltip";
import { useState, useEffect } from "react";
import StaffHero from "@/features/staff-profiles/components/detail/StaffHero";
import StaffContentTabs from "@/features/staff-profiles/components/detail/StaffContentTabs";

const StaffProfileDetailPage = () => {
	const { staffProfilePk } = useParams<{ staffProfilePk: string }>();
	const navigate = useNavigate();
	const pk = Number(staffProfilePk);
	const { data: user } = useCurrentUser();
	const { data: heroData, isLoading, isError } = useStaffProfileHero(pk);
	const [buttonsVisible, setButtonsVisible] = useState(false);

	// Dynamic title based on staff member name
	const staffName = heroData?.user
		? `${heroData.user.first_name || ""} ${heroData.user.last_name || ""}`.trim()
		: "";
	useDocumentTitle(staffName || "Staff Profile");

	const canEdit =
		!!user &&
		!!heroData?.user &&
		(user.id === heroData.user.id || user.is_superuser === true);

	// Inject Person schema JSON-LD for search engine structured data
	useEffect(() => {
		if (!heroData?.user) return;

		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "Person",
			name: `${heroData.user.first_name} ${heroData.user.last_name}`.trim(),
			jobTitle: heroData.it_asset_data?.title ?? undefined,
			description: heroData.about ?? undefined,
			worksFor: {
				"@type": "Organization",
				name: "Department of Biodiversity, Conservation and Attractions",
				url: "https://www.dbca.wa.gov.au/",
			},
			url: window.location.href,
		});
		document.head.appendChild(script);
		return () => {
			document.head.removeChild(script);
		};
	}, [heroData]);

	if (isLoading) {
		return (
			<main
				id="main-content"
				className="flex items-center justify-center min-h-[400px]"
				aria-label="Loading staff profile"
			>
				<Loader2
					className="size-32 animate-spin text-slate-400"
					aria-hidden="true"
				/>
				<span className="sr-only">Loading staff profile...</span>
			</main>
		);
	}

	if (isError || !heroData) {
		return (
			<main
				id="main-content"
				className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
			>
				<div className="size-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-10 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-slate-800 mb-2" role="alert">
					Profile not found
				</h1>
				<p className="text-slate-500 max-w-sm mb-8">
					This staff profile doesn't exist, may be hidden from public view, or
					the person is no longer active.
				</p>
				<Button
					variant="outline"
					className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
					onClick={() => navigate("/staff")}
				>
					<ChevronLeft className="size-4" aria-hidden="true" />
					Back to Staff Directory
				</Button>
			</main>
		);
	}

	return (
		<main
			id="main-content"
			className="relative flex h-full w-full justify-center"
		>
			{/* Centred content — matches original max-width */}
			<div className="w-full max-w-[600px] px-0 sm:px-12 md:max-w-[800px]">
				<div className="flex flex-col">
					<StaffHero
						profilePk={pk}
						canEdit={canEdit && buttonsVisible}
						userId={heroData.user.id}
						editButton={
							canEdit ? (
								<div className="flex items-center gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setButtonsVisible((v) => !v)}
												className={`gap-1 ${buttonsVisible ? "bg-green-50 border-green-300 text-green-700" : ""}`}
												aria-pressed={buttonsVisible}
											>
												<Pencil className="size-4" />
												{buttonsVisible ? "Editing" : "Edit"}
											</Button>
										</TooltipTrigger>
										<TooltipContent variant="light">
											<p>
												{buttonsVisible
													? "Exit edit mode"
													: "Toggle to make changes"}
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							) : undefined
						}
					/>
					<StaffContentTabs
						profilePk={pk}
						userId={heroData.user.id}
						canEdit={canEdit && buttonsVisible}
						employeeId={heroData.employee_id ?? null}
					/>
				</div>
			</div>
		</main>
	);
};

export default StaffProfileDetailPage;
