import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

type Props = {
	code?: number; // e.g., 404, 500
	message?: string;
	error?: unknown;
	stack?: string;
	showDetails?: boolean; // show technical details for superusers
	onReload?: () => void;
	onHome?: () => void;
	onBack?: () => void;
};

const ErrorScreen = ({
	code,
	message = "We encountered an unexpected error while loading this page.",
	error,
	stack,
	showDetails = false,
	onReload,
	onHome,
	onBack,
}: Props) => {
	const details =
		typeof error === "string"
			? error
			: error instanceof Error
			? error.toString()
			: undefined;

	return (
		<div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl">
						{code === 404
							? "Page not found"
							: "Something went wrong"}
					</CardTitle>
					<CardDescription>
						{code ? `Error ${code}: ${message}` : message}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{showDetails && (details || stack) && (
						<div className="mt-0 overflow-hidden rounded-lg bg-slate-800 p-4">
							<p className="mb-2 text-sm text-slate-400">
								Error details:
							</p>
							<pre className="overflow-auto text-sm text-white whitespace-pre-wrap">
								{details}
								{stack ? `\n\n${stack}` : ""}
							</pre>
						</div>
					)}
				</CardContent>

				<CardFooter className="flex gap-4">
					{onReload && (
						<Button
							onClick={onReload}
							className="gap-2 bg-blue-600 hover:bg-blue-700"
						>
							<RefreshCw className="h-4 w-4" />
							Reload
						</Button>
					)}
					{onBack && (
						<Button
							variant="outline"
							onClick={onBack}
							className="gap-2"
						>
							← Back
						</Button>
					)}
					{onHome && (
						<Button
							variant="outline"
							onClick={onHome}
							className="gap-2"
						>
							<Home className="h-4 w-4" />
							Home
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};

export default ErrorScreen;
