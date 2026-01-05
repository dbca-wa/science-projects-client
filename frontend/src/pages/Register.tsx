import { PageHead } from "@/shared/components/layout/PageHead";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";

const Register = () => {
	return (
		<>
			<PageHead />
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">
							Create Account
						</CardTitle>
						<CardDescription className="text-center">
							Join us and start competing on the leaderboard!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RegisterForm />
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default Register;
