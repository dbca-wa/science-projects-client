interface StudentReportsTabProps {
	documents: Record<string, unknown>[];
}

export function StudentReportsTab({ documents }: StudentReportsTabProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-xl font-bold">Student Reports</h2>
				<p className="mt-4 text-muted-foreground">
					{documents.length} student report(s) available.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Student reports will be listed here with options to view and manage them.
				</p>
			</div>
		</div>
	);
}
