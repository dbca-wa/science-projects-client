import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export const LoginForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { mutate: login, isPending } = useLogin();

	// Get the page they were trying to visit before being redirected to login
	const from = (location.state as any)?.from?.pathname || "/";

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		login(data, {
			onSuccess: () => {
				// Redirect to the page they were trying to visit, or home
				navigate(from, { replace: true });
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="Enter your email"
					{...register("email")}
					className={errors.email ? "border-red-500" : ""}
					disabled={isPending}
				/>
				{errors.email && (
					<p className="text-sm text-red-500">
						{errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					placeholder="Enter your password"
					{...register("password")}
					className={errors.password ? "border-red-500" : ""}
					disabled={isPending}
				/>
				{errors.password && (
					<p className="text-sm text-red-500">
						{errors.password.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Logging in..." : "Login"}
			</Button>

			<div className="text-center text-sm text-gray-600 dark:text-gray-400">
				Don't have an account?{" "}
				<button
					type="button"
					onClick={() => navigate("/register")}
					className="text-blue-600 hover:underline"
					disabled={isPending}
				>
					Register here
				</button>
			</div>
		</form>
	);
};
