interface ProgressReportsTabProps {
	documents: Record<string, unknown>[];
}

export function ProgressReportsTab({ documents }: ProgressReportsTabProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-xl font-bold">Progress Reports</h2>
				<p className="mt-4 text-muted-foreground">
					{documents.length} progress report(s) available.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Progress reports will be listed here with options to view and manage
					them.
				</p>
			</div>
		</div>
	);
}
