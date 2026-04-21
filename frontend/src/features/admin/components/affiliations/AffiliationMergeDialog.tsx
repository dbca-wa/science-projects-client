import { useState } from "react";
import { Loader2, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
	useAffiliations,
	useAffiliationMerge,
} from "../../hooks/useAffiliations";
import type { IAffiliation } from "../../types/admin.types";

interface AffiliationMergeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AffiliationMergeDialog({
	open,
	onOpenChange,
}: AffiliationMergeDialogProps) {
	const { data: affiliations = [] } = useAffiliations();
	const mergeMutation = useAffiliationMerge();

	const [primaryAffiliation, setPrimaryAffiliation] =
		useState<IAffiliation | null>(null);
	const [secondaryAffiliations, setSecondaryAffiliations] = useState<
		IAffiliation[]
	>([]);
	const [primarySearch, setPrimarySearch] = useState("");
	const [secondarySearch, setSecondarySearch] = useState("");
	const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);
	const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);

	// IDs already selected (primary + secondaries) to exclude from dropdowns
	const selectedIds = new Set([
		...(primaryAffiliation ? [primaryAffiliation.id] : []),
		...secondaryAffiliations.map((a) => a.id),
	]);

	const filteredPrimaryOptions = affiliations
		.filter(
			(a) =>
				!selectedIds.has(a.id) &&
				a.name.toLowerCase().includes(primarySearch.toLowerCase())
		)
		.slice(0, 20);

	const filteredSecondaryOptions = affiliations
		.filter(
			(a) =>
				!selectedIds.has(a.id) &&
				a.name.toLowerCase().includes(secondarySearch.toLowerCase())
		)
		.slice(0, 20);

	const handleSelectPrimary = (affiliation: IAffiliation) => {
		setPrimaryAffiliation(affiliation);
		setPrimarySearch("");
		setShowPrimaryDropdown(false);
	};

	const handleSelectSecondary = (affiliation: IAffiliation) => {
		setSecondaryAffiliations((prev) => [...prev, affiliation]);
		setSecondarySearch("");
		setShowSecondaryDropdown(false);
	};

	const handleRemoveSecondary = (affiliation: IAffiliation) => {
		setSecondaryAffiliations((prev) =>
			prev.filter((a) => a.id !== affiliation.id)
		);
	};

	const resetState = () => {
		setPrimaryAffiliation(null);
		setSecondaryAffiliations([]);
		setPrimarySearch("");
		setSecondarySearch("");
	};

	const handleMerge = () => {
		if (!primaryAffiliation || secondaryAffiliations.length === 0) return;

		mergeMutation.mutate(
			{
				primaryAffiliation: { pk: primaryAffiliation.id },
				secondaryAffiliations: secondaryAffiliations.map((a) => ({
					pk: a.id,
				})),
			},
			{
				onSuccess: () => {
					resetState();
					onOpenChange(false);
				},
			}
		);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			resetState();
		}
		onOpenChange(nextOpen);
	};

	const canMerge =
		primaryAffiliation !== null &&
		secondaryAffiliations.length > 0 &&
		!mergeMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Merge Affiliations</DialogTitle>
					<DialogDescription>
						Combine similar affiliations into one.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Primary affiliation search */}
					<div className="space-y-2">
						<Label>Primary Affiliation</Label>
						{primaryAffiliation ? (
							<div className="flex items-center gap-2 rounded-md border px-3 py-2">
								<span className="flex-1 text-sm">
									{primaryAffiliation.name}
								</span>
								<button
									type="button"
									onClick={() => setPrimaryAffiliation(null)}
									className="text-muted-foreground hover:text-foreground"
									aria-label="Remove primary affiliation"
								>
									<X className="size-4" />
								</button>
							</div>
						) : (
							<div className="relative">
								<Input
									placeholder="Search for an affiliation"
									value={primarySearch}
									onChange={(e) => {
										setPrimarySearch(e.target.value);
										setShowPrimaryDropdown(true);
									}}
									onFocus={() => setShowPrimaryDropdown(true)}
									onBlur={() =>
										setTimeout(() => setShowPrimaryDropdown(false), 200)
									}
									autoComplete="off"
								/>
								{showPrimaryDropdown && primarySearch && (
									<div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-gray-800">
										{filteredPrimaryOptions.length === 0 ? (
											<div className="px-3 py-2 text-sm text-muted-foreground">
												No affiliations found
											</div>
										) : (
											filteredPrimaryOptions.map((a) => (
												<button
													key={a.id}
													type="button"
													className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => handleSelectPrimary(a)}
												>
													{a.name}
												</button>
											))
										)}
									</div>
								)}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							The affiliation you would like to merge other affiliations into
						</p>
					</div>

					{/* Secondary affiliations multi-select */}
					<div className="space-y-2">
						<Label>Secondary Affiliation(s)</Label>
						{secondaryAffiliations.length > 0 && (
							<div className="flex flex-wrap gap-1.5 rounded-md border p-2">
								{secondaryAffiliations.map((a) => (
									<span
										key={a.id}
										className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
									>
										{a.name}
										<button
											type="button"
											onClick={() => handleRemoveSecondary(a)}
											className="text-muted-foreground hover:text-foreground"
											aria-label={`Remove ${a.name}`}
										>
											<X className="size-3" />
										</button>
									</span>
								))}
							</div>
						)}
						<div className="relative">
							<Input
								placeholder="Search for an affiliation"
								value={secondarySearch}
								onChange={(e) => {
									setSecondarySearch(e.target.value);
									setShowSecondaryDropdown(true);
								}}
								onFocus={() => setShowSecondaryDropdown(true)}
								onBlur={() =>
									setTimeout(() => setShowSecondaryDropdown(false), 200)
								}
								autoComplete="off"
							/>
							{showSecondaryDropdown && secondarySearch && (
								<div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-gray-800">
									{filteredSecondaryOptions.length === 0 ? (
										<div className="px-3 py-2 text-sm text-muted-foreground">
											No affiliations found
										</div>
									) : (
										filteredSecondaryOptions.map((a) => (
											<button
												key={a.id}
												type="button"
												className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
												onMouseDown={(e) => e.preventDefault()}
												onClick={() => handleSelectSecondary(a)}
											>
												{a.name}
											</button>
										))
									)}
								</div>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							The affiliation(s) you would like to merge into the primary
							affiliation
						</p>
					</div>

					{/* Warning text */}
					{secondaryAffiliations.length > 0 && (
						<p className="text-sm text-destructive">
							Note: Users affiliated with the secondary affiliation(s) will now
							become affiliated with the primary affiliation. Each secondary
							affiliation you selected will also be deleted.
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={mergeMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleMerge}
						disabled={!canMerge}
						className="bg-orange-600 hover:bg-orange-700"
					>
						{mergeMutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Merge
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
