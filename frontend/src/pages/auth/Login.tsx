import { LoginForm } from "@/features/auth/components/LoginForm";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/app/stores/useStore";
import { Navigate } from "react-router";
import { observer } from "mobx-react-lite";

const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

const Login = observer(() => {
	const authStore = useAuthStore();
	const buildType = import.meta.env.MODE;

	// Redirect to dashboard if already authenticated
	if (authStore.state.initialised && authStore.isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ y: -70, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 70, opacity: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
			>
				<div className="w-full max-w-md px-8">
					<LoginForm />

					{/* Environment Info */}
					{buildType !== "production" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
							className="mt-6 text-center space-y-1"
						>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Environment: {buildType.toUpperCase()}
							</p>
							<p className="text-xs text-gray-400 dark:text-gray-500">
								SSO: {VITE_PRODUCTION_BASE_URL}
								sso/signedout?relogin
							</p>
						</motion.div>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
});

export default Login;
