interface ConceptPlanTabProps {
	document: Record<string, unknown>;
}

export function ConceptPlanTab({ document: _document }: ConceptPlanTabProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-xl font-bold">Concept Plan</h2>
				<p className="mt-4 text-muted-foreground">
					Concept plan document content will be displayed here.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					This will include the concept plan details, methodology, and other relevant information.
				</p>
			</div>
		</div>
	);
}
