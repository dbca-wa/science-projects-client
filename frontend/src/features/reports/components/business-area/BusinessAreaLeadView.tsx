import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { useMyBusinessAreas } from "../../hooks/useBusinessAreaLead";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useDivisions } from "@/shared/hooks/queries/useDivisions";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, AlertCircle, Briefcase } from "lucide-react";
import type { IBusinessArea } from "@/shared/types/org.types";
import { BusinessAreaSelectItems } from "@/shared/components/BusinessAreaSelectItems";
import { sortBusinessAreasByDisplayName } from "@/shared/utils/business-area.utils";
import { BusinessAreaPreview } from "./BusinessAreaPreview";
import { ProblematicProjectsTab } from "./ProblematicProjectsTab";
import { UnapprovedDocumentsTab } from "./UnapprovedDocumentsTab";

/**
 * Sub-tabs rendered for the user's single business area.
 * Uses route-based tab selection via selectedTab prop and useNavigate.
 * Tracks which tabs have been activated for lazy data loading.
 * Only BA leaders and superusers see the Problematic Projects and Unapproved Documents tabs.
 */
// eslint-disable-next-line react-refresh/only-export-components
const BusinessAreaSubTabs = ({
	area,
	selectedTab = "appearance",
	hasFullAccess,
}: {
	area: IBusinessArea;
	selectedTab?: string;
	hasFullAccess: boolean;
}) => {
	const navigate = useNavigate();
	const [activatedTabs, setActivatedTabs] = useState<Set<string>>(
		new Set(["appearance", selectedTab])
	);

	const handleSubTabChange = (value: string) => {
		setActivatedTabs((prev) => new Set(prev).add(value));
		const suffix = value === "appearance" ? "" : `/${value}`;
		// Preserve the ?ba= query param when switching tabs
		const params = new URLSearchParams(window.location.search);
		const baParam = params.get("ba");
		const qs = baParam ? `?ba=${baParam}` : "";
		navigate(`/reports/business-area${suffix}${qs}`);
	};

	const baId = area.id!;

	const tabs = [
		{ value: "appearance", label: "Appearance", restricted: false },
		{ value: "problematic", label: "Problematic Projects", restricted: true },
		{
			value: "unapproved",
			label: "Unapproved Project Documents",
			restricted: true,
		},
	];

	const availableTabs = tabs.filter((t) => !t.restricted || hasFullAccess);

	return (
		<Tabs value={selectedTab} onValueChange={handleSubTabChange}>
			{/* Desktop tabs */}
			<TabsList className="hidden w-full justify-start sm:inline-flex">
				{availableTabs.map((tab) => (
					<TabsTrigger key={tab.value} value={tab.value}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>

			{/* Mobile select */}
			<div className="sm:hidden">
				<Select value={selectedTab} onValueChange={handleSubTabChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a tab" />
					</SelectTrigger>
					<SelectContent>
						{availableTabs.map((tab) => (
							<SelectItem key={tab.value} value={tab.value}>
								{tab.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<TabsContent value="appearance">
				<BusinessAreaPreview area={area} />
			</TabsContent>

			{hasFullAccess && (
				<TabsContent value="problematic">
					<ProblematicProjectsTab
						baId={baId}
						enabled={activatedTabs.has("problematic")}
					/>
				</TabsContent>
			)}

			{hasFullAccess && (
				<TabsContent value="unapproved">
					<UnapprovedDocumentsTab
						baId={baId}
						enabled={activatedTabs.has("unapproved")}
					/>
				</TabsContent>
			)}
		</Tabs>
	);
};

/**
 * Displays the business area the current user leads.
 *
 * Each user leads at most one BA, so the component renders sub-tabs
 * directly without a top-level BA selection strip.
 *
 * BA leaders and superusers see all three tabs. Ordinary users see
 * only the Appearance tab and are redirected away from restricted routes.
 */
export const BusinessAreaLeadView = observer(function BusinessAreaLeadView({
	selectedTab = "appearance",
}: {
	selectedTab?: string;
}) {
	const {
		data: myBusinessAreas,
		isLoading: myLoading,
		error,
	} = useMyBusinessAreas();
	const { data: allBusinessAreas, isLoading: allLoading } = useBusinessAreas();
	const { data: divisions } = useDivisions();
	const authStore = useAuthStore();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// Persist selected BA in URL query param so it survives tab navigation
	const selectedBAId = searchParams.get("ba")
		? Number(searchParams.get("ba"))
		: null;

	const setSelectedBAId = (id: number) => {
		setSearchParams({ ba: id.toString() }, { replace: true });
	};

	const isLoading = myLoading || (authStore.isSuperuser && allLoading);

	// Superusers see all BAs; non-superusers see only their led BAs
	const businessAreas = useMemo(
		() =>
			authStore.isSuperuser
				? (allBusinessAreas ?? myBusinessAreas ?? [])
				: (myBusinessAreas ?? []),
		[authStore.isSuperuser, allBusinessAreas, myBusinessAreas]
	);

	const isBALeader = !!myBusinessAreas && myBusinessAreas.length > 0;
	const hasFullAccess = isBALeader || authStore.isSuperuser;

	// Show dropdown: superusers always, non-superusers only if leading 2+ BAs
	const showDropdown = authStore.isSuperuser || businessAreas.length > 1;

	// Auto-select first BA (sorted by display name) when data loads and none selected
	useEffect(() => {
		if (businessAreas && businessAreas.length > 0 && selectedBAId === null) {
			const sorted = sortBusinessAreasByDisplayName(
				businessAreas.filter((ba) => ba.is_active)
			);
			if (sorted.length > 0 && sorted[0].id) {
				setSelectedBAId(sorted[0].id);
			} else {
				setSelectedBAId(businessAreas[0].id!);
			}
		}
	}, [businessAreas, selectedBAId]);

	const selectedArea =
		selectedBAId !== null
			? (businessAreas?.find((ba) => ba.id === selectedBAId) ?? null)
			: null;

	// Redirect ordinary users away from restricted tabs
	useEffect(() => {
		if (isLoading) return;
		if (
			!hasFullAccess &&
			(selectedTab === "problematic" || selectedTab === "unapproved")
		) {
			navigate("/reports/business-area", { replace: true });
		}
	}, [hasFullAccess, selectedTab, navigate, isLoading]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<p className="text-muted-foreground">Loading business area...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load business area. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	if (!businessAreas || businessAreas.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-center">
				<Briefcase className="size-12 text-muted-foreground mb-4" />
				<h2 className="text-xl font-semibold mb-2">No Business Area</h2>
				<p className="text-muted-foreground">
					You are not currently leading any business areas.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">My Business Area</h1>
					<p className="text-muted-foreground mt-1">
						Manage your business area appearance, problematic projects, and
						unapproved documents
					</p>
				</div>
				{showDropdown && (
					<Select
						value={selectedBAId?.toString() ?? ""}
						onValueChange={(v) => {
							setSelectedBAId(Number(v));
						}}
					>
						<SelectTrigger className="w-full sm:w-[250px]">
							<SelectValue placeholder="Select business area" />
						</SelectTrigger>
						<SelectContent>
							<BusinessAreaSelectItems
								businessAreas={businessAreas}
								filterByApprovers
								divisions={divisions}
							/>
						</SelectContent>
					</Select>
				)}
			</div>
			{selectedArea && (
				<BusinessAreaSubTabs
					area={selectedArea}
					selectedTab={selectedTab}
					hasFullAccess={hasFullAccess}
				/>
			)}
		</div>
	);
});
