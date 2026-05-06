import { useState, useCallback, useMemo, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
	RefreshCw,
	Loader2,
	Copy,
	Check,
	X,
	Info,
	Save,
	Download,
	RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { FormPreviewToggle } from "@/shared/components/layout/FormPreviewToggle";
import { DivisionYearSafeguard } from "@/features/admin/components/actions/DivisionYearSafeguard";
import {
	useOpenNewCycle,
	useNewCycleDraft,
} from "@/features/admin/hooks/useAdminActions";
import { useNewCyclePreview } from "@/shared/hooks/queries/useBumpEmails";
import { RecipientSection } from "@/features/admin/components/shared/RecipientSection";
import { NewCycleCustomMessage } from "@/features/admin/components/new-cycle/NewCycleCustomMessage";
import { NewCycleEmailPreview } from "@/features/admin/components/new-cycle/NewCycleEmailPreview";
import { NewCycleStore } from "@/app/stores/derived/new-cycle.store";

/** Green checkbox styling — overrides default primary colour */
const GREEN_CHECKBOX =
	"data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-gray-400 dark:border-gray-500 shadow-sm";

/** Green radio styling — overrides default primary colour */
const GREEN_RADIO =
	"border-gray-400 dark:border-gray-500 shadow-sm [&[data-state=checked]]:border-emerald-600 [&_svg]:fill-emerald-600";

const NewCyclePage = () => {
	useDocumentTitle("Open New Cycle");
	const [store] = useState(() => new NewCycleStore());
	const [showPreview, setShowPreview] = useState(false);

	// Clean up the auto-save reaction on unmount
	useEffect(() => {
		return () => {
			void store.dispose();
		};
	}, [store]);

	return (
		<div className="w-full">
			<AutoBreadcrumb />
			<div className="mx-auto p-6 pb-28">
				<DivisionYearSafeguard
					title="Open New Cycle"
					headerRight={
						<FormPreviewToggle
							showPreview={showPreview}
							onShowForm={() => setShowPreview(false)}
							onShowPreview={() => setShowPreview(true)}
						/>
					}
				>
					{({ divisionSlug, divisionName }) => (
						<NewCyclePageContent
							store={store}
							divisionSlug={divisionSlug}
							divisionName={divisionName}
							showPreview={showPreview}
						/>
					)}
				</DivisionYearSafeguard>
			</div>
		</div>
	);
};

interface NewCyclePageContentProps {
	store: NewCycleStore;
	divisionSlug: string;
	divisionName: string;
	showPreview: boolean;
}

const NewCyclePageContent = observer(function NewCyclePageContent({
	store,
	divisionSlug,
	divisionName,
	showPreview,
}: NewCyclePageContentProps) {
	const { mutate, isPending } = useOpenNewCycle();
	const { data: draftData } = useNewCycleDraft();

	const hasSavedDraft =
		!!draftData?.draft && Object.keys(draftData.draft).length > 0;

	const handleSaveDraft = () => {
		toast.info("Draft saving is not currently available");
	};

	const handleLoadDraft = () => {
		if (draftData?.draft) {
			store.importDraft(draftData.draft);
			toast.success("Draft loaded from database");
		}
	};

	const handleReset = () => {
		store.reset();
		toast.success("Form reset to defaults");
	};

	// Debounced custom message for email preview (300ms)
	// Initialise with store values so restored drafts show immediately
	const [debouncedMessage, setDebouncedMessage] = useState(
		store.state.customMessage
	);
	const [debouncedMessages, setDebouncedMessages] = useState(
		store.state.customMessages
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedMessage(store.state.customMessage);
			setDebouncedMessages({ ...store.state.customMessages });
		}, 300);
		return () => clearTimeout(timer);
	}, [store.state.customMessage, store.state.customMessages]);

	const { data: recipientPreview } = useNewCyclePreview(
		store.anySendGroup,
		divisionSlug
	);

	const handleExcludeUser = useCallback(
		(userId: number) => store.excludeUser(userId),
		[store]
	);
	const handleRestoreUser = useCallback(
		(userId: number) => store.restoreUser(userId),
		[store]
	);
	const handleExcludeAll = useCallback(
		(userIds: number[]) => store.excludeUsers(userIds),
		[store]
	);
	const handleRestoreAll = useCallback(
		(userIds: number[]) => store.restoreUsers(userIds),
		[store]
	);

	const allValidEmails = useMemo(() => {
		if (!recipientPreview) return [];
		const excludedSet = new Set(store.state.excludedUserIds);
		const seen = new Set<string>();
		const emails: string[] = [];
		for (const group of [
			store.state.sendBaLeads ? recipientPreview.recipients.ba_leads : [],
			store.state.sendProjectLeads
				? recipientPreview.recipients.project_leads
				: [],
			store.state.sendTeamMembers
				? recipientPreview.recipients.team_members
				: [],
		]) {
			for (const u of group) {
				if (!excludedSet.has(u.pk) && !seen.has(u.email)) {
					seen.add(u.email);
					emails.push(u.email);
				}
			}
		}
		return emails.sort();
	}, [
		recipientPreview,
		store.state.excludedUserIds,
		store.state.sendBaLeads,
		store.state.sendProjectLeads,
		store.state.sendTeamMembers,
	]);

	const filteredNotInITAssets = useMemo(() => {
		const nia = recipientPreview?.not_in_it_assets;
		if (!nia) return [];
		return [
			...(store.state.sendBaLeads ? nia.ba_leads : []),
			...(store.state.sendProjectLeads ? nia.project_leads : []),
			...(store.state.sendTeamMembers ? nia.team_members : []),
		].sort((a, b) => a.name.localeCompare(b.name));
	}, [
		recipientPreview?.not_in_it_assets,
		store.state.sendBaLeads,
		store.state.sendProjectLeads,
		store.state.sendTeamMembers,
	]);

	const itAssetsAvailable = recipientPreview?.it_assets_available ?? true;

	const handleSubmit = () => {
		const messagePayload: Record<string, unknown> = {};
		if (store.state.customMessageEnabled) {
			if (store.state.perGroupEnabled) {
				// Only include messages for groups that have custom enabled
				const msgs: Record<string, string> = {};
				for (const g of [
					"ba_leads",
					"project_leads",
					"team_members",
				] as const) {
					if (store.state.groupCustomEnabled[g]) {
						msgs[g] = store.state.customMessages[g];
					}
				}
				if (Object.keys(msgs).length > 0) {
					messagePayload.custom_messages = msgs;
				}
			} else {
				messagePayload.custom_message = store.state.customMessage;
			}
		}
		mutate(
			{
				division: divisionSlug,
				update: store.backendUpdate,
				prepopulate: store.backendPrepopulate,
				send_emails: store.anySendGroup,
				recipient_groups: store.anySendGroup ? store.selectedGroups : undefined,
				excluded_user_ids:
					store.state.excludedUserIds.length > 0
						? store.state.excludedUserIds
						: undefined,
				...messagePayload,
			},
			{
				onSuccess: () => store.reset(),
			}
		);
	};

	// Determine which message to preview based on active tab
	const previewMessage = store.state.perGroupEnabled
		? store.state.groupCustomEnabled[store.state.activePreviewGroup]
			? debouncedMessages[store.state.activePreviewGroup]
			: ""
		: debouncedMessage;

	const formPanel = (
		<div className="space-y-5">
			{/* Header */}
			<div className="rounded-lg border shadow-sm p-6">
				<div className="flex items-start gap-4">
					<RefreshCw className="size-7 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
					<div className="space-y-1">
						<h2 className="text-lg font-semibold">Open New Cycle</h2>
						<p className="text-sm text-muted-foreground">
							Open a new annual reporting cycle for{" "}
							<span className="font-medium text-foreground">
								{divisionName}
							</span>
							.
						</p>
					</div>
				</div>
			</div>

			{/* Prepopulate box */}
			<div className="rounded-lg border shadow-sm p-6 transition-colors bg-emerald-50/50 dark:bg-emerald-950/20">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-base font-semibold">Prepopulate Reports</h3>
					<div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
						<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</div>
				</div>
				<RadioGroup
					value={store.state.prepopulateMode}
					onValueChange={(v) =>
						store.setPrepopulateMode(v as "all" | "partial")
					}
					className="space-y-3"
				>
					<div className="flex items-start gap-2">
						<RadioGroupItem
							value="all"
							id="prepop-all"
							className={`mt-0.5 ${GREEN_RADIO}`}
						/>
						<div>
							<Label htmlFor="prepop-all" className="text-sm cursor-pointer">
								Prepopulate all fields from prior year
							</Label>
							<p className="text-xs text-muted-foreground mt-0.5">
								Context, Aims, Implications, Progress, and Future Directions are
								all carried forward.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<RadioGroupItem
							value="partial"
							id="prepop-partial"
							className={`mt-0.5 ${GREEN_RADIO}`}
						/>
						<div>
							<Label
								htmlFor="prepop-partial"
								className="text-sm cursor-pointer"
							>
								Exclude Progress and Future Directions
							</Label>
							<p className="text-xs text-muted-foreground mt-0.5">
								Only Context, Aims, and Implications are carried forward.
								Progress and Future Directions will be blank.
							</p>
						</div>
					</div>
				</RadioGroup>
			</div>

			{/* Project Inclusion box */}
			<div className="rounded-lg border shadow-sm p-6 transition-colors bg-emerald-50/50 dark:bg-emerald-950/20">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-base font-semibold">Project Inclusion</h3>
					<div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
						<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</div>
				</div>
				<RadioGroup
					value={store.state.inclusionMode}
					onValueChange={(v) =>
						store.setInclusionMode(v as "include" | "active-only")
					}
					className="space-y-3"
				>
					<div className="flex items-start gap-2">
						<RadioGroupItem
							value="include"
							id="incl-all"
							className={`mt-0.5 ${GREEN_RADIO}`}
						/>
						<div>
							<Label htmlFor="incl-all" className="text-sm cursor-pointer">
								Include Updating and Suspended projects
							</Label>
							<p className="text-xs text-muted-foreground mt-0.5">
								New reports will be created for active, updating, and suspended
								projects.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<RadioGroupItem
							value="active-only"
							id="incl-active"
							className={`mt-0.5 ${GREEN_RADIO}`}
						/>
						<div>
							<Label htmlFor="incl-active" className="text-sm cursor-pointer">
								Active projects only
							</Label>
							<p className="text-xs text-muted-foreground mt-0.5">
								Only projects with &quot;Active&quot; status will receive new
								reports. Updating and Suspended projects are excluded.
							</p>
						</div>
					</div>
				</RadioGroup>
			</div>

			{/* Email Recipients */}
			<div
				className={`rounded-lg border shadow-sm p-6 transition-colors ${store.anySendGroup ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-base font-semibold">
						Send Announcement Emails To
					</h3>
					{store.anySendGroup && (
						<div className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
							<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
						</div>
					)}
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<div className="flex items-center gap-2">
						<Checkbox
							id="send-ba"
							className={GREEN_CHECKBOX}
							checked={store.state.sendBaLeads}
							onCheckedChange={(c) => store.setSendBaLeads(c === true)}
						/>
						<Label htmlFor="send-ba" className="text-sm cursor-pointer">
							Business Area Leads
						</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="send-pl"
							className={GREEN_CHECKBOX}
							checked={store.state.sendProjectLeads}
							onCheckedChange={(c) => store.setSendProjectLeads(c === true)}
						/>
						<Label htmlFor="send-pl" className="text-sm cursor-pointer">
							Project Leads
						</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="send-tm"
							className={GREEN_CHECKBOX}
							checked={store.state.sendTeamMembers}
							onCheckedChange={(c) => store.setSendTeamMembers(c === true)}
						/>
						<Label htmlFor="send-tm" className="text-sm cursor-pointer">
							Project Team
						</Label>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					Deduplicated by highest role (BA Lead &gt; Project Lead &gt; Team
					Member).
				</p>
			</div>

			{/* Recipient Lists */}
			{store.anySendGroup && recipientPreview && (
				<>
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">
							{allValidEmails.length} unique recipient
							{allValidEmails.length !== 1 ? "s" : ""}
						</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 gap-1.5 text-xs"
							onClick={() => {
								navigator.clipboard
									.writeText(allValidEmails.join("; "))
									.then(() =>
										toast.success(
											`${allValidEmails.length} email${allValidEmails.length !== 1 ? "s" : ""} copied`
										)
									);
							}}
						>
							<Copy className="size-3" aria-hidden="true" />
							Copy All
						</Button>
					</div>
					<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{store.state.sendBaLeads && (
							<RecipientSection
								title="Business Area Leads"
								users={recipientPreview.recipients.ba_leads}
								excludedUserIds={store.state.excludedUserIds}
								onExcludeUser={handleExcludeUser}
								onRestoreUser={handleRestoreUser}
								onExcludeAll={handleExcludeAll}
								onRestoreAll={handleRestoreAll}
							/>
						)}
						{store.state.sendProjectLeads && (
							<RecipientSection
								title="Project Leads"
								users={recipientPreview.recipients.project_leads}
								excludedUserIds={store.state.excludedUserIds}
								onExcludeUser={handleExcludeUser}
								onRestoreUser={handleRestoreUser}
								onExcludeAll={handleExcludeAll}
								onRestoreAll={handleRestoreAll}
							/>
						)}
						{store.state.sendTeamMembers && (
							<RecipientSection
								title="Team Members"
								users={recipientPreview.recipients.team_members}
								excludedUserIds={store.state.excludedUserIds}
								onExcludeUser={handleExcludeUser}
								onRestoreUser={handleRestoreUser}
								onExcludeAll={handleExcludeAll}
								onRestoreAll={handleRestoreAll}
							/>
						)}
					</div>

					{/* Not in IT Assets */}
					{itAssetsAvailable && filteredNotInITAssets.length > 0 && (
						<div className="rounded-lg border shadow-sm p-6 bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-700">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40">
										<X className="h-4 w-4 text-red-600 dark:text-red-400" />
									</div>
									<h3 className="text-base font-semibold">
										Not Found in IT Assets ({filteredNotInITAssets.length})
									</h3>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-7 gap-1.5 text-xs text-red-700 dark:text-red-300"
									onClick={() => {
										navigator.clipboard
											.writeText(
												filteredNotInITAssets.map((u) => u.email).join("; ")
											)
											.then(() =>
												toast.success(
													`${filteredNotInITAssets.length} email${filteredNotInITAssets.length !== 1 ? "s" : ""} copied`
												)
											);
									}}
								>
									<Copy className="size-3" aria-hidden="true" />
									Copy
								</Button>
							</div>
							<p className="text-xs text-red-600 dark:text-red-400 mb-3">
								These users won't receive the announcement email.
							</p>
							<ul
								className="space-y-1 max-h-48 overflow-y-auto text-sm"
								role="list"
							>
								{filteredNotInITAssets.map((u) => (
									<li key={u.pk} className="flex items-center gap-2 py-0.5">
										<span className="truncate text-red-800 dark:text-red-200">
											{u.name}
										</span>
										<span className="truncate text-xs text-red-600 dark:text-red-400">
											{u.email}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
					{!itAssetsAvailable && (
						<div className="rounded-lg border shadow-sm p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
							<div className="flex items-start gap-3">
								<Info className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
								<p className="text-sm text-amber-700 dark:text-amber-300">
									IT Assets directory could not be reached. All recipients are
									shown as valid. Some users may not receive emails if their
									accounts are no longer active in the DBCA directory.
								</p>
							</div>
						</div>
					)}
				</>
			)}

			{/* Info: how recipients are determined */}
			{store.anySendGroup && (
				<div className="rounded-lg border shadow-sm p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
					<div className="flex items-start gap-3">
						<Info className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
						<div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
							<p className="font-medium text-sm">
								How recipients are determined
							</p>
							<ul className="list-disc pl-4 space-y-0.5">
								<li>
									Only <span className="font-medium">is_active=True</span> users
									with <span className="font-medium">@dbca.wa.gov.au</span>{" "}
									emails
								</li>
								<li>
									BA leads from{" "}
									<span className="font-medium">active business areas</span>{" "}
									only
								</li>
								<li>
									Project members from projects{" "}
									<span className="font-medium">
										not terminated, completed, or closed
									</span>
								</li>
								<li>Deduplicated by highest role</li>
								<li>
									Cross-referenced against{" "}
									<span className="font-medium">IT Assets</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Custom Message Editor */}
			{store.anySendGroup && <NewCycleCustomMessage store={store} />}
		</div>
	);

	const GROUP_LABEL_MAP: Record<string, string> = {
		ba_leads: "BA Leads",
		project_leads: "Project Leads",
		team_members: "Team Members",
	};

	const showGroupTabs =
		store.state.perGroupEnabled &&
		store.state.customMessageEnabled &&
		store.sendGroupCount > 1;

	const previewPanel = (
		<div className="sticky top-6">
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold">Email Preview</h3>
					<p className="text-sm text-muted-foreground">
						See how the announcement email will appear
					</p>
				</div>

				{store.anySendGroup ? (
					showGroupTabs ? (
						<Tabs
							value={store.state.activePreviewGroup}
							onValueChange={(v) =>
								store.setActivePreviewGroup(
									v as "ba_leads" | "project_leads" | "team_members"
								)
							}
						>
							<TabsList className="w-full">
								{store.checkedGroupKeys.map((key) => (
									<TabsTrigger
										key={key}
										value={key}
										className="flex-1 text-base"
									>
										{GROUP_LABEL_MAP[key]}
									</TabsTrigger>
								))}
							</TabsList>
							{store.checkedGroupKeys.map((key) => (
								<TabsContent key={key} value={key}>
									<NewCycleEmailPreview
										customMessage={
											store.state.groupCustomEnabled[key]
												? debouncedMessages[key] || undefined
												: undefined
										}
										divisionName={divisionName}
									/>
								</TabsContent>
							))}
						</Tabs>
					) : (
						<NewCycleEmailPreview
							customMessage={previewMessage || undefined}
							divisionName={divisionName}
						/>
					)
				) : (
					<div className="flex items-center justify-center py-12 text-muted-foreground">
						<p className="text-sm">
							Select recipient groups to see the email preview
						</p>
					</div>
				)}
			</div>
		</div>
	);

	return (
		<>
			{/* Widescreen: Side-by-side 2/3 form + 1/3 sticky preview */}
			<div className="hidden 3xl:grid 3xl:grid-cols-3 3xl:gap-6">
				<div className="col-span-2">{formPanel}</div>
				<div className="pl-4 border-l">{previewPanel}</div>
			</div>

			{/* Standard: Toggle between form and preview */}
			<div className="3xl:hidden">
				<div className={cn(showPreview ? "hidden" : "block")}>{formPanel}</div>
				<div className={cn(showPreview ? "block" : "hidden")}>
					{previewPanel}
				</div>
			</div>

			{/* Sticky action bar */}
			<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-6 py-4">
				<div className="container mx-auto flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleSaveDraft}
							className="gap-1.5"
						>
							<Save className="size-4" />
							Save Draft
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleLoadDraft}
							disabled={!hasSavedDraft}
							className="gap-1.5"
						>
							<Download className="size-4" />
							Load Draft
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
							className="gap-1.5 text-destructive hover:text-destructive"
						>
							<RotateCcw className="size-4" />
							Reset
						</Button>
					</div>
					<div className="flex items-center gap-4">
						<p className="text-sm text-muted-foreground hidden sm:block">
							{!store.canSubmit
								? "Fix validation errors to proceed"
								: store.anySendGroup
									? "Ready to open cycle and send announcements"
									: "Ready to open new cycle"}
						</p>
						<Button
							onClick={handleSubmit}
							disabled={!store.canSubmit || isPending}
							size="lg"
						>
							{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
							{store.anySendGroup
								? "Open Cycle & Send Announcement"
								: "Open New Cycle"}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
});

export default NewCyclePage;
