import { Button } from "@/shared/components/ui/button";
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
				<div className="flex justify-end">
					<div className="flex w-25 items-center justify-between">
						<Button
							variant="link"
							className="bg-transparent text-lg text-white"
							asChild
						>
							<a href={`${VITE_PRODUCTION_BASE_URL ?? "/"}`}>
								SPMS
							</a>
						</Button>
					</div>
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
				<Button
					variant="link"
					className="bg-transparent text-lg text-white"
					asChild
				>
					<a href={`${VITE_PRODUCTION_BASE_URL ?? "/"}`}>SPMS</a>
				</Button>
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
