import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FaLock, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { logger } from "@/shared/services/logger.service";
import { sanitiseFormData } from "@/shared/utils";
import type { LoginFormData } from "../types";

/**
 * LoginForm component with validation
 * - Uses React Hook Form with Zod resolver
 * - Connects to useLogin hook for authentication
 * - Displays validation errors inline
 * - Shows loading state during submission
 * - API errors are handled by the useLogin hook via toast notifications
 */
export const LoginForm = () => {
	const { mutate: login, isPending } = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		logger.info("Login form submitted", { username: data.username });

		// Sanitise form data before submission
		const sanitisedData = sanitiseFormData(data, []);

		// The useLogin hook handles:
		// - API call
		// - Auth store updates
		// - Navigation to dashboard
		// - Toast notifications for errors
		login(sanitisedData, {
			onSuccess: () => {
				logger.info("Login successful");
				reset();
			},
			onError: (error) => {
				logger.error("Login failed", {
					errorMessage: error instanceof Error ? error.message : String(error),
				});
			},
		});
	};

	// Check if SSO is configured
	const ssoUrl = import.meta.env.VITE_SSO_URL;
	const hasSso = !!ssoUrl;

	const handleSsoLogin = () => {
		if (ssoUrl) {
			logger.info("Redirecting to SSO provider");
			window.location.href = ssoUrl;
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			{/* Username Input */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3 }}
				className="space-y-2"
			>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<FaUser className="w-4 h-4 text-gray-400" />
					</div>
					<Input
						id="username"
						type="email"
						placeholder="Email"
						{...register("username")}
						className={`pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 ${
							errors.username ? "border-red-500" : ""
						}`}
						disabled={isPending}
					/>
				</div>
				{errors.username && (
					<p className="text-sm text-red-500">{errors.username.message}</p>
				)}
			</motion.div>

			{/* Password Input */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4 }}
				className="space-y-2"
			>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<FaLock className="w-4 h-4 text-gray-400" />
					</div>
					<Input
						id="password"
						type="password"
						placeholder="Password"
						{...register("password")}
						className={`pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 ${
							errors.password ? "border-red-500" : ""
						}`}
						disabled={isPending}
					/>
				</div>
				{errors.password && (
					<p className="text-sm text-red-500">{errors.password.message}</p>
				)}
			</motion.div>

			{/* Submit Button */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
			>
				<Button
					type="submit"
					className="w-full text-white bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
					disabled={isPending}
				>
					{isPending ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Logging in...
						</>
					) : (
						"Login"
					)}
				</Button>
			</motion.div>

			{/* SSO Button (if configured) */}
			{hasSso && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-300 dark:border-gray-700" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
								Or
							</span>
						</div>
					</div>
					<Button
						type="button"
						variant="outline"
						className="w-full mt-4"
						onClick={handleSsoLogin}
						disabled={isPending}
					>
						Login with SSO
					</Button>
				</motion.div>
			)}
		</form>
	);
};
