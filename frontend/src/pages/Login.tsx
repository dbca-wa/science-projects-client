import { useStore } from "@/app/stores/root.store";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";

const Login = () => {
	const { authStore } = useStore();
	const navigate = useNavigate();

	const handleTestLogin = () => {
		// Temporary test login - we'll replace this with real authentication later
		authStore.login(
			{
				id: "1",
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
			},
			"fake-token-123"
		);
		// Navigate to dashboard after login
		navigate("/");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
						Login
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Temporary test login for development
					</p>
				</div>
				<Button onClick={handleTestLogin} className="w-full" size="lg">
					Test Login
				</Button>
			</div>
		</div>
	);
};

export default Login;
