import { useState } from "react";
import { useNavigate } from "react-router";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { useReopenProject } from "@/features/projects/hooks/useReopenProject";

interface ReopenProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

/**
 * Minimum character length for the reason (stripped of HTML tags)
 */
const MIN_REASON_LENGTH = 10;

/**
 * Strip HTML tags and get plain text length
 */
const getPlainTextLength = (html: string): number => {
	const text = html.replace(/<[^>]*>/g, "").trim();
	return text.length;
};

export const ReopenProjectModal = ({
	isOpen,
	onClose,
	projectId,
}: ReopenProjectModalProps) => {
	const [confirmed, setConfirmed] = useState(false);
	const [reasonHTML, setReasonHTML] = useState("");

	const reopenMutation = useReopenProject();
	const navigate = useNavigate();

	const reasonLength = getPlainTextLength(reasonHTML);
	const canSubmit = confirmed && reasonLength >= MIN_REASON_LENGTH;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		reopenMutation.mutate(
			{ projectId, reason: reasonHTML },
			{
				onSuccess: () => {
					onClose();
					navigate(`/projects/${projectId}`);
				},
			}
		);
	};

	const handleClose = () => {
		setConfirmed(false);
		setReasonHTML("");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to reopen this project?
					</DialogTitle>
					<DialogDescription>
						The following will occur when you reopen this project:
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="rounded-lg bg-muted p-4">
						<h4 className="mb-3 text-lg font-semibold">Info</h4>
						<ul className="ml-6 list-disc space-y-2 text-sm">
							<li>
								The project will become active, with the status set to
								&apos;updating&apos;
							</li>
							<li>The project closure document will be deleted</li>
							<li>Progress Reports can be created again</li>
						</ul>
						<p className="mt-4 text-center text-sm font-bold text-blue-600 underline">
							You can close the project again at any time.
						</p>
					</div>

					{/* Confirmation Checkbox */}
					<div className="flex items-start space-x-2">
						<Checkbox
							id="confirmed"
							checked={confirmed}
							onCheckedChange={(checked) => setConfirmed(checked as boolean)}
							aria-label="Are you sure you want to reopen this project?"
						/>
						<Label
							htmlFor="confirmed"
							className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Are you sure you want to reopen this project?
						</Label>
					</div>

					{/* Reason Rich Text Editor — only active after checkbox is ticked */}
					<div
						className={`space-y-2 ${!confirmed ? "opacity-50 pointer-events-none" : ""}`}
					>
						<label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
							Reason for reopening <span className="text-destructive">*</span>
						</label>
						<FormRichTextEditor
							value={reasonHTML}
							onChange={setReasonHTML}
							toolbar="simple"
							placeholder="Please provide a reason for reopening this project..."
							wordLimit={500}
						/>
						{confirmed &&
							reasonLength > 0 &&
							reasonLength < MIN_REASON_LENGTH && (
								<p className="text-sm text-destructive">
									Reason must be at least {MIN_REASON_LENGTH} characters
								</p>
							)}
					</div>

					<DialogFooter className="gap-2">
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="default"
							disabled={!canSubmit || reopenMutation.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							{reopenMutation.isPending ? "Reopening..." : "Open Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
