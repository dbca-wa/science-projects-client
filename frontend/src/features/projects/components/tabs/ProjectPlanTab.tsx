interface ProjectPlanTabProps {
	document: Record<string, unknown>;
}

export function ProjectPlanTab({ document: _document }: ProjectPlanTabProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-xl font-bold">Project Plan</h2>
				<p className="mt-4 text-muted-foreground">
					Project plan document content will be displayed here.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					This will include the project plan details, timeline, milestones, and
					deliverables.
				</p>
			</div>
		</div>
	);
}
