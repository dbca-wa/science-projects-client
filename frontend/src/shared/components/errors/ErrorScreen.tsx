import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { RefreshCw, Home, AlertCircle, FileQuestion } from "lucide-react";

type Props = {
	code?: number;
	message?: string;
	error?: unknown;
	stack?: string;
	showDetails?: boolean;
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

	const is404 = code === 404;
	const is403 = code === 403;

	const getTitle = () => {
		if (is404) return "Page Not Found";
		if (is403) return "Access Denied";
		return "Something Went Wrong";
	};

	const getDescription = () => {
		if (is404) return "The page you're looking for doesn't exist or has been moved.";
		if (is403) return "You don't have permission to access this page.";
		if (code) return `Error ${code}: ${message}`;
		return message;
	};

	const getIcon = () => {
		if (is404) return <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />;
		if (is403) return <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />;
		return <AlertCircle className="h-16 w-16 text-destructive mb-4" />;
	};

	return (
		<div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
			<Card className="w-full max-w-2xl border-2">
				<CardHeader className="text-center pb-4">
					<div className="flex justify-center">
						{getIcon()}
					</div>
					<CardTitle className="text-3xl font-bold">
						{getTitle()}
					</CardTitle>
					<CardDescription className="text-base mt-2">
						{getDescription()}
					</CardDescription>
				</CardHeader>

				{showDetails && (details || stack) && (
					<CardContent className="pt-0">
						<div className="overflow-hidden rounded-lg bg-slate-900 p-4 border border-slate-700">
							<p className="mb-2 text-sm font-semibold text-slate-300">
								Technical Details:
							</p>
							<pre className="overflow-auto text-xs text-slate-400 whitespace-pre-wrap font-mono max-h-64">
								{details}
								{stack ? `\n\n${stack}` : ""}
							</pre>
						</div>
					</CardContent>
				)}

				<CardFooter className="flex flex-wrap gap-3 justify-center pt-6">
					{onReload && (
						<Button
							onClick={onReload}
							className="gap-2 bg-blue-600 hover:bg-blue-700"
							size="lg"
						>
							<RefreshCw className="h-4 w-4" />
							Reload Page
						</Button>
					)}
					{onBack && (
						<Button
							variant="outline"
							onClick={onBack}
							className="gap-2"
							size="lg"
						>
							← Go Back
						</Button>
					)}
					{onHome && (
						<Button
							variant="outline"
							onClick={onHome}
							className="gap-2"
							size="lg"
						>
							<Home className="h-4 w-4" />
							Return Home
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};

export default ErrorScreen;
