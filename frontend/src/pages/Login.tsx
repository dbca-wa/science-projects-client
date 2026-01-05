import { PageHead } from "@/shared/components/layout/PageHead";
import { LoginForm } from "@/features/auth/components/LoginForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";

const Login = () => {
	return (
		<>
			<PageHead />
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">
							Welcome Back
						</CardTitle>
						<CardDescription className="text-center">
							Login to your account to continue playing
						</CardDescription>
					</CardHeader>
					<CardContent>
						<LoginForm />
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default Login;
