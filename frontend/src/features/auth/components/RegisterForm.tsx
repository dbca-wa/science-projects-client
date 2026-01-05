import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schema";
import { useRegister } from "../hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export const RegisterForm = () => {
	const navigate = useNavigate();
	const { mutate: register, isPending } = useRegister();

	const {
		register: registerField,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (data: RegisterFormData) => {
		// Remove confirmPassword before sending to API
		const { confirmPassword, ...userData } = data;
		register(userData, {
			onSuccess: () => {
				navigate("/", { replace: true });
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="username">Username</Label>
				<Input
					id="username"
					placeholder="Choose a username"
					{...registerField("username")}
					className={errors.username ? "border-red-500" : ""}
					disabled={isPending}
				/>
				{errors.username && (
					<p className="text-sm text-red-500">
						{errors.username.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="Enter your email"
					{...registerField("email")}
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
					placeholder="Create a password"
					{...registerField("password")}
					className={errors.password ? "border-red-500" : ""}
					disabled={isPending}
				/>
				{errors.password && (
					<p className="text-sm text-red-500">
						{errors.password.message}
					</p>
				)}
				<p className="text-xs text-gray-500">
					Must contain uppercase, lowercase, and number
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="Confirm your password"
					{...registerField("confirmPassword")}
					className={errors.confirmPassword ? "border-red-500" : ""}
					disabled={isPending}
				/>
				{errors.confirmPassword && (
					<p className="text-sm text-red-500">
						{errors.confirmPassword.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Creating account..." : "Create Account"}
			</Button>

			<div className="text-center text-sm text-gray-600 dark:text-gray-400">
				Already have an account?{" "}
				<button
					type="button"
					onClick={() => navigate("/login")}
					className="text-blue-600 hover:underline"
					disabled={isPending}
				>
					Login here
				</button>
			</div>
		</form>
	);
};
