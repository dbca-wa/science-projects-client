import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Check, X } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { RichTextEditor } from "@/shared/components/editor";
import type { NewCycleStore } from "@/app/stores/derived/new-cycle.store";

interface NewCycleCustomMessageProps {
	store: NewCycleStore;
}

const EDITOR_CLASS = "editor-standalone";

const GROUP_LABELS: Record<string, string> = {
	ba_leads: "Business Area Leads",
	project_leads: "Project Leads",
	team_members: "Team Members",
};

export const NewCycleCustomMessage = observer(function NewCycleCustomMessage({
	store,
}: NewCycleCustomMessageProps) {
	const { isCustomMessageValid, checkedGroupKeys, sendGroupCount } = store;
	const { customMessageEnabled, perGroupEnabled } = store.state;

	const handleMessageChange = useCallback(
		(html: string) => store.setCustomMessage(html),
		[store]
	);

	const handleGroupChange = useCallback(
		(group: "ba_leads" | "project_leads" | "team_members") => (html: string) =>
			store.setGroupMessage(group, html),
		[store]
	);

	const isInvalid = customMessageEnabled && !isCustomMessageValid;
	const canEnablePerGroup = sendGroupCount > 1;

	return (
		<div
			className={`rounded-lg border shadow-sm p-6 transition-colors ${
				isInvalid
					? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-700"
					: customMessageEnabled && isCustomMessageValid
						? "bg-emerald-50/50 dark:bg-emerald-950/20"
						: ""
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<h3 className="text-base font-semibold">Custom Message</h3>
					{isInvalid && (
						<div className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40">
							<X className="h-4 w-4 text-red-600 dark:text-red-400" />
						</div>
					)}
					{customMessageEnabled && isCustomMessageValid && (
						<div className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
							<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
						</div>
					)}
				</div>
				<div className="flex items-center gap-4">
					{customMessageEnabled && canEnablePerGroup && (
						<div className="flex items-center gap-2">
							<Switch
								id="per-group-toggle"
								checked={perGroupEnabled}
								onCheckedChange={(checked) => store.setPerGroupEnabled(checked)}
								className="data-[state=checked]:bg-emerald-600"
							/>
							<Label
								htmlFor="per-group-toggle"
								className="text-sm cursor-pointer whitespace-nowrap"
							>
								Per group
							</Label>
						</div>
					)}
					<div className="flex items-center gap-2">
						<Switch
							id="custom-message-toggle"
							checked={customMessageEnabled}
							onCheckedChange={(checked) =>
								store.setCustomMessageEnabled(checked)
							}
							className="data-[state=checked]:bg-emerald-600"
						/>
						<Label
							htmlFor="custom-message-toggle"
							className="text-sm cursor-pointer whitespace-nowrap"
						>
							Custom message
						</Label>
					</div>
				</div>
			</div>

			{!customMessageEnabled && (
				<p className="text-sm text-muted-foreground">
					The default email text will be used. Enable to write a custom message
					replacing the default paragraph.
				</p>
			)}

			{customMessageEnabled && !perGroupEnabled && (
				<RichTextEditor
					value={store.state.customMessage}
					onChange={handleMessageChange}
					toolbar="newCycle"
					placeholder="Custom message for all recipients..."
					aria-label="Custom message for all recipients"
					className={EDITOR_CLASS}
					minHeight="150px"
				/>
			)}

			{customMessageEnabled && perGroupEnabled && (
				<div className="space-y-4">
					{checkedGroupKeys.map((group) => (
						<div key={group} className="rounded-lg border p-4">
							<div className="flex items-center justify-between mb-2">
								<Label className="text-sm font-medium">
									{GROUP_LABELS[group]}
								</Label>
								<div className="flex items-center gap-2">
									<Switch
										id={`group-custom-${group}`}
										checked={store.state.groupCustomEnabled[group]}
										onCheckedChange={(checked) =>
											store.setGroupCustomEnabled(group, checked)
										}
										className="data-[state=checked]:bg-emerald-600"
									/>
									<Label
										htmlFor={`group-custom-${group}`}
										className="text-xs cursor-pointer whitespace-nowrap"
									>
										Custom
									</Label>
								</div>
							</div>
							{store.state.groupCustomEnabled[group] ? (
								<RichTextEditor
									value={store.state.customMessages[group]}
									onChange={handleGroupChange(group)}
									toolbar="newCycle"
									placeholder={`Custom message for ${GROUP_LABELS[group].toLowerCase()}...`}
									aria-label={`Custom message for ${GROUP_LABELS[group]}`}
									className={EDITOR_CLASS}
									minHeight="120px"
								/>
							) : (
								<p className="text-xs text-muted-foreground italic py-2">
									Default email text will be used for this group.
								</p>
							)}
						</div>
					))}
				</div>
			)}

			{isInvalid && (
				<p className="text-xs text-red-600 dark:text-red-400 mt-2">
					Custom message cannot be empty. Add content or disable the toggle.
				</p>
			)}
		</div>
	);
});
