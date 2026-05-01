import { ImUsers } from "react-icons/im";
import { FaUserPlus, FaMapMarkedAlt } from "react-icons/fa";
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import {
	User,
	Globe,
	LogOut,
	BookOpen,
	FileText,
	Archive,
	Database,
	MapPin,
	Building,
	GitBranch,
	Briefcase,
	Settings,
	List,
	Mail,
	FlaskConical,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ToggleDarkMode } from "./ToggleDarkMode";
import { useAuthStore } from "@/app/stores/store-context";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useMyBusinessAreas } from "@/shared/hooks/queries/useMyBusinessAreas";
import { useDivisions } from "@/shared/hooks/queries/useDivisions";
import { useCurrentUser } from "@/features/auth";

interface HeaderContentProps {
	handleNavigation: (path: string) => void;
	onClose: () => void;
}

/**
 * HeaderContent
 * Navigation menu content for hamburger menu with navigation items and quick links
 */
const HeaderContent = ({ handleNavigation, onClose }: HeaderContentProps) => {
	const authStore = useAuthStore();
	const { mutate: logout } = useLogout();
	const { data: myBusinessAreas } = useMyBusinessAreas();
	const { data: currentUser } = useCurrentUser();
	const { data: divisions } = useDivisions();

	const isKeyStakeholder = !!(
		currentUser &&
		divisions?.some((d) => d.key_stakeholder?.id === currentUser.id)
	);

	const navigateAndClose = (path: string) => {
		onClose(); // Trigger close animation
		handleNavigation(path); // Navigate
	};

	const handleLogout = () => {
		onClose();
		logout(undefined, {
			onSuccess: () => {
				handleNavigation("/login");
			},
		});
	};

	return (
		<nav aria-label="Mobile navigation" className="flex flex-col h-full">
			{/* Top Section - My Profile & Dark Mode Toggle */}
			<div className="border-b border-gray-700 py-3">
				<div className="flex items-center gap-2 px-3">
					<Button
						variant="ghost"
						className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base flex-1 pl-6"
						onClick={() => navigateAndClose("/users/me")}
					>
						<span className="flex items-center gap-3">
							<User className="text-xl" aria-hidden="true" />
							<span>My SPMS Profile</span>
						</span>
					</Button>
					<ToggleDarkMode
						showText={false}
						onAfterToggle={onClose}
						withBackground
					/>
				</div>
				{authStore.user?.staff_profile_id && (
					<div className="px-3 mt-1">
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base w-full pl-6"
							onClick={() =>
								navigateAndClose(`/staff/${authStore.user!.staff_profile_id}`)
							}
						>
							<span className="flex items-center gap-3">
								<Globe className="text-xl" aria-hidden="true" />
								<span>My Public Profile</span>
							</span>
						</Button>
					</div>
				)}
			</div>

			{/* Main Navigation - Scrollable */}
			<div className="flex-1 overflow-y-auto py-4">
				<div className="flex flex-col gap-1">
					{/* Projects Section */}
					<div className="flex flex-col gap-1">
						<h2 className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
							Projects
						</h2>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/projects")}
						>
							<span className="flex items-center gap-3">
								<CgBrowse className="text-xl" aria-hidden="true" />
								<span>Browse Projects</span>
							</span>
						</Button>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/projects/map")}
						>
							<span className="flex items-center gap-3">
								<FaMapMarkedAlt className="text-xl" aria-hidden="true" />
								<span>Project Map</span>
							</span>
						</Button>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/projects/create")}
						>
							<span className="flex items-center gap-3">
								<CgPlayListAdd className="text-xl" aria-hidden="true" />
								<span>Create New Project</span>
							</span>
						</Button>
					</div>

					{/* Users Section */}
					<div className="flex flex-col gap-1">
						<h2 className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
							Users
						</h2>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/users")}
						>
							<span className="flex items-center gap-3">
								<ImUsers className="text-xl" aria-hidden="true" />
								<span>Browse Users</span>
							</span>
						</Button>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/users/create")}
						>
							<span className="flex items-center gap-3">
								<FaUserPlus className="text-xl" aria-hidden="true" />
								<span>Add User</span>
							</span>
						</Button>
						{authStore.isSuperuser && (
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/create-staff")}
							>
								<span className="flex items-center gap-3">
									<FaUserPlus className="text-xl" aria-hidden="true" />
									<span>Add DBCA User (Admin)</span>
								</span>
							</Button>
						)}
					</div>

					{/* Reports Section */}
					<div className="flex flex-col gap-1">
						<h2 className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
							Reports
						</h2>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/reports/details")}
						>
							<span className="flex items-center gap-3">
								<FileText className="text-xl" aria-hidden="true" />
								<span>Report Details</span>
							</span>
						</Button>
						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/reports")}
						>
							<span className="flex items-center gap-3">
								<Archive className="text-xl" aria-hidden="true" />
								<span>Published Reports</span>
							</span>
						</Button>
						{((myBusinessAreas && myBusinessAreas.length > 0) ||
							authStore.isSuperuser) && (
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/reports/business-area")}
							>
								<span className="flex items-center gap-3">
									<Briefcase className="text-xl" aria-hidden="true" />
									<span>My Business Area</span>
								</span>
							</Button>
						)}
						{(authStore.isSuperuser || isKeyStakeholder) && (
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/reports/my-division")}
							>
								<span className="flex items-center gap-3">
									<Building className="text-xl" aria-hidden="true" />
									<span>My Division</span>
								</span>
							</Button>
						)}
					</div>

					{/* Manage Section — superuser only */}
					{authStore.isSuperuser && (
						<div className="flex flex-col gap-1">
							<h2 className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
								Manage
							</h2>

							{/* Lists & Emails */}
							<p className="px-6 pt-2 pb-1 text-xs font-medium text-gray-500">
								Lists & Emails
							</p>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/data")}
							>
								<span className="flex items-center gap-3">
									<Database className="text-xl" aria-hidden="true" />
									<span>Data Lists</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/emails")}
							>
								<span className="flex items-center gap-3">
									<Mail className="text-xl" aria-hidden="true" />
									<span>Email</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/email-testing")}
							>
								<span className="flex items-center gap-3">
									<FlaskConical className="text-xl" aria-hidden="true" />
									<span>Email Testing</span>
								</span>
							</Button>

							{/* CRUD */}
							<p className="px-6 pt-2 pb-1 text-xs font-medium text-gray-500">
								CRUD
							</p>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/addresses")}
							>
								<span className="flex items-center gap-3">
									<MapPin className="text-xl" aria-hidden="true" />
									<span>Addresses</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/affiliations")}
							>
								<span className="flex items-center gap-3">
									<Building className="text-xl" aria-hidden="true" />
									<span>Affiliations</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/branches")}
							>
								<span className="flex items-center gap-3">
									<GitBranch className="text-xl" aria-hidden="true" />
									<span>Branches</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/business-areas")}
							>
								<span className="flex items-center gap-3">
									<Briefcase className="text-xl" aria-hidden="true" />
									<span>Business Areas</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/divisions")}
							>
								<span className="flex items-center gap-3">
									<Settings className="text-xl" aria-hidden="true" />
									<span>Divisions</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/locations")}
							>
								<span className="flex items-center gap-3">
									<Globe className="text-xl" aria-hidden="true" />
									<span>Locations</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/reports")}
							>
								<span className="flex items-center gap-3">
									<FileText className="text-xl" aria-hidden="true" />
									<span>Report Info</span>
								</span>
							</Button>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/manage/services")}
							>
								<span className="flex items-center gap-3">
									<List className="text-xl" aria-hidden="true" />
									<span>Services</span>
								</span>
							</Button>

							{/* AR Actions */}
							<p className="px-6 pt-2 pb-1 text-xs font-medium text-gray-500">
								AR Actions
							</p>
							<Button
								variant="ghost"
								className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
								onClick={() => navigateAndClose("/reports/my-division")}
							>
								<span className="flex items-center gap-3">
									<Settings className="text-xl" aria-hidden="true" />
									<span>Division Actions</span>
								</span>
							</Button>
						</div>
					)}

					{/* Quick Links Section */}
					<div className="flex flex-col gap-1">
						<h2 className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
							Quick Links
						</h2>

						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => navigateAndClose("/guide")}
						>
							<span className="flex items-center gap-3">
								<BookOpen className="text-xl" aria-hidden="true" />
								<span>Knowledge Base</span>
							</span>
						</Button>

						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => {
								window.open("https://data.bio.wa.gov.au/", "_blank");
								onClose();
							}}
							aria-label="Data Catalogue (opens in new tab)"
						>
							<span className="flex items-center gap-3">
								<BookOpen className="text-xl" aria-hidden="true" />
								<span>Data Catalogue</span>
							</span>
						</Button>

						<Button
							variant="ghost"
							className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
							onClick={() => {
								window.open(
									"https://scientificsites.dpaw.wa.gov.au/",
									"_blank"
								);
								onClose();
							}}
							aria-label="Scientific Sites Register (opens in new tab)"
						>
							<span className="flex items-center gap-3">
								<BookOpen className="text-xl" aria-hidden="true" />
								<span>Scientific Sites Register</span>
							</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Logout Section - Fixed at bottom */}
			<div className="border-t border-gray-700 py-2">
				<Button
					variant="ghost"
					className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 h-12 text-base pl-6"
					onClick={handleLogout}
				>
					<span className="flex items-center gap-3">
						<LogOut className="text-xl" aria-hidden="true" />
						<span>Logout</span>
					</span>
				</Button>
			</div>
		</nav>
	);
};

export default HeaderContent;
