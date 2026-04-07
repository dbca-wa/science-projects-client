import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";

const DesktopHeader = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
	const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

	return (
		<div className="flex h-16.25 w-full flex-row items-center justify-between gap-2 bg-[#2d2f32] p-2 text-white dark:bg-slate-950">
			<div className="flex justify-start px-8">
				<img
					src={"/logo.svg"}
					className="w-60 p-6"
					alt="Department of Biodiversity, Conservation and Attractions"
				/>
			</div>
			{isLoggedIn && (
				<div className="flex justify-end pr-4">
					<a
						href={VITE_PRODUCTION_BASE_URL ?? "/"}
						className="text-lg text-white hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d2f32] rounded px-2 py-1"
					>
						SPMS
					</a>
				</div>
			)}
		</div>
	);
};

const MobileHeader = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
	const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

	return (
		<div className="flex h-16.25 w-full items-center justify-between gap-2 bg-[#2d2f32] p-2 px-5 text-white dark:bg-slate-950">
			<img
				src={"/logo.svg"}
				className="w-47.5 select-none"
				alt="Department of Biodiversity, Conservation and Attractions"
			/>
			{isLoggedIn && (
				<a
					href={VITE_PRODUCTION_BASE_URL ?? "/"}
					className="text-lg text-white hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d2f32] rounded px-2 py-1"
				>
					SPMS
				</a>
			)}
		</div>
	);
};

const StaffProfileHeader = observer(({ isDesktop }: { isDesktop: boolean }) => {
	const authStore = useAuthStore();

	return (
		<>
			{isDesktop ? (
				<DesktopHeader isLoggedIn={authStore.isAuthenticated} />
			) : (
				<MobileHeader isLoggedIn={authStore.isAuthenticated} />
			)}
		</>
	);
});

StaffProfileHeader.displayName = "StaffProfileHeader";

export default StaffProfileHeader;
