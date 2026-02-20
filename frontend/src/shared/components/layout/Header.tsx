import { Link, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImUsers } from "react-icons/im";
import { FaUserPlus, FaMapMarkedAlt } from "react-icons/fa";
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { Navitar } from "./Navitar";
import { Button } from "@/shared/components/ui/button";
import { NavigationDropdownMenu } from "@/shared/components/navigation/NavigationDropdownMenu";
import { NavigationDropdownMenuContent } from "@/shared/components/navigation/NavigationDropdownMenuContent";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import { useUIStore, useAuthStore } from "@/app/stores/store-context";
import HeaderContent from "./HeaderContent";

/**
 * HamburgerMenuSheet - Mobile navigation menu
 * Uses Sheet component with MobX-compatible animations
 *
 * Uses observer() to react to MobX state changes for open/close
 */
const HamburgerMenuSheet = observer(
	({ handleNavigation }: { handleNavigation: (path: string) => void }) => {
		const uiStore = useUIStore();

		return (
			<>
				<Button
					variant="default"
					size="icon"
					className="bg-gray-600 hover:bg-white hover:text-black text-white"
					aria-label="Open navigation menu"
					onClick={() => uiStore.setHamburgerMenuOpen(true)}
				>
					<GiHamburgerMenu size={22} />
				</Button>

				<Sheet
					open={uiStore.hamburgerMenuOpen}
					onOpenChange={(open) => uiStore.setHamburgerMenuOpen(open)}
					modal={true}
				>
					<SheetContent
						side="right"
						className="bg-gray-900 text-white border-gray-700 w-3/4 sm:max-w-sm flex flex-col"
					>
						<HeaderContent
							handleNavigation={handleNavigation}
							onClose={() => uiStore.setHamburgerMenuOpen(false)}
						/>
					</SheetContent>
				</Sheet>
			</>
		);
	}
);

/**
 * Header component
 * Header with navigation menu, user avatar, and responsive hamburger menu
 */
export const Header = observer(() => {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const { width } = useWindowSize();

	// Controlled dropdown state
	const [projectsOpen, setProjectsOpen] = useState(false);
	const [usersOpen, setUsersOpen] = useState(false);
	const [navitarOpen, setNavitarOpen] = useState(false);

	// Close other menus when one opens
	useEffect(() => {
		if (projectsOpen) {
			setUsersOpen(false);
			setNavitarOpen(false);
		}
	}, [projectsOpen]);

	useEffect(() => {
		if (usersOpen) {
			setProjectsOpen(false);
			setNavitarOpen(false);
		}
	}, [usersOpen]);

	useEffect(() => {
		if (navitarOpen) {
			setProjectsOpen(false);
			setUsersOpen(false);
		}
	}, [navitarOpen]);

	// Show hamburger menu on screens smaller than lg breakpoint
	const shouldShowHamburger = width < BREAKPOINTS.lg;

	const handleNavigation = (path: string) => {
		// Don't update MobX directly - let the Sheet's animation complete
		// The Sheet will update MobX after animation
		navigate(path);
	};

	return (
		<header className="bg-gray-900 rounded-b py-0.5">
			{/* Skip to main content link for keyboard users */}
			<button
				onClick={(e) => {
					e.preventDefault();
					const mainContent = document.getElementById("main-content");
					if (mainContent) {
						mainContent.focus();
						mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
					}
				}}
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100000] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
			>
				Skip to main content
			</button>

			<div className="px-4 sm:px-6 md:px-[10%] lg:px-[15%] py-4 lg:py-1">
				<div className="flex items-center justify-between">
					{/* Left side - Logo */}
					<div className="flex items-center">
						{/* SPMS Logo/Title */}
						<Link
							to="/"
							className="px-5 text-white/70 hover:text-white/90 text-lg font-bold select-none no-underline transition-colors"
							aria-label="SPMS Home"
						>
							SPMS
						</Link>
					</div>

					{shouldShowHamburger ? (
						/* Mobile/Tablet - Hamburger Menu */
						<div className="flex items-center">
							<HamburgerMenuSheet handleNavigation={handleNavigation} />
						</div>
					) : (
						/* Desktop - Full Navigation */
						<nav
							aria-label="Main navigation"
							className="flex items-center justify-between flex-grow"
						>
							<div className="flex items-center gap-1">
								{/* Projects Menu */}
								<NavigationDropdownMenu
									label="Projects"
									open={projectsOpen}
									onOpenChange={setProjectsOpen}
								>
									<NavigationDropdownMenuContent
										label="Projects"
										items={[
											{
												targetPath: "/projects",
												icon: (
													<CgBrowse className="size-4" aria-hidden="true" />
												),
												label: "Browse Projects",
											},
											{
												targetPath: "/projects/map",
												icon: (
													<FaMapMarkedAlt
														className="size-4"
														aria-hidden="true"
													/>
												),
												label: "Project Map",
											},
											{
												targetPath: "/projects/create",
												icon: (
													<CgPlayListAdd
														className="size-4"
														aria-hidden="true"
													/>
												),
												label: "Create New Project",
											},
										]}
										onClose={() => setProjectsOpen(false)}
									/>
								</NavigationDropdownMenu>

								{/* Users Menu */}
								<NavigationDropdownMenu
									label="Users"
									open={usersOpen}
									onOpenChange={setUsersOpen}
								>
									<NavigationDropdownMenuContent
										label="Users"
										items={[
											{
												targetPath: "/users",
												icon: <ImUsers className="size-4" aria-hidden="true" />,
												label: "Browse Users",
											},
											{
												targetPath: "/users/create",
												icon: (
													<FaUserPlus className="size-4" aria-hidden="true" />
												),
												label: "Add User",
											},
											...(authStore.isSuperuser
												? [
														{
															targetPath: "/users/create-staff",
															icon: (
																<FaUserPlus
																	className="size-4"
																	aria-hidden="true"
																/>
															),
															label: "Add DBCA User (Admin)",
														},
													]
												: []),
										]}
										onClose={() => setUsersOpen(false)}
									/>
								</NavigationDropdownMenu>

								{/* Reports Menu - COMMENTED OUT: Not yet implemented */}
								{/*
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                    >
                      Reports
                      <IoCaretDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                    <DropdownMenuLabel className="text-center text-xs text-gray-500">
                      Annual Research Activity Report
                    </DropdownMenuLabel>
                    <NavigationDropdownMenuItem
                      targetPath="/reports"
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <CgViewList className="mr-2 size-4" />
                      Published Reports
                    </NavigationDropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                */}

								{/* Admin Menu - COMMENTED OUT: Not yet implemented */}
								{/*
                {isSuperuser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                      >
                        Admin
                        <IoCaretDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                      <DropdownMenuLabel className="text-center text-xs text-gray-500">
                        Manage
                      </DropdownMenuLabel>
                      <NavigationDropdownMenuItem
                        targetPath="/admin"
                        className="hover:bg-gray-100 cursor-pointer select-none"
                      >
                        <RiAdminFill className="mr-2 size-4" />
                        Admin Dashboard
                      </NavigationDropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}


                {/* Guide Button - COMMENTED OUT: Page not yet created */}
								{/*
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                  onClick={() => navigate("/guide")}
                >
                  Guide
                </Button>
                */}
							</div>

							{/* Right side - Navitar with name */}
							<div className="flex items-center px-3">
								<Navitar
									shouldShowName
									open={navitarOpen}
									onOpenChange={setNavitarOpen}
								/>
							</div>
						</nav>
					)}
				</div>
			</div>
		</header>
	);
});
