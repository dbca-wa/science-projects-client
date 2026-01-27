interface ProjectClosureTabProps {
	document: Record<string, unknown>;
}

export function ProjectClosureTab({ document: _document }: ProjectClosureTabProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-xl font-bold">Project Closure</h2>
				<p className="mt-4 text-muted-foreground">
					Project closure document content will be displayed here.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					This will include the project closure details, outcomes, and final reports.
				</p>
			</div>
		</div>
	);
}
