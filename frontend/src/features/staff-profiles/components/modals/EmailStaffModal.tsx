import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useEmailStaffMember } from "../../hooks/useStaffProfileMutations";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import ResponsiveModal from "./ResponsiveModal";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;
// Time the success confirmation stays visible before the modal auto-closes.
// Long enough to read the message, short enough to stay responsive.
const SUCCESS_ANIMATION_DURATION_MS = 1500;

interface EmailStaffModalProps {
	userPk: number;
	staffName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EmailStaffModal = ({
	userPk,
	staffName,
	open,
	onOpenChange,
}: EmailStaffModalProps) => {
	const [senderEmail, setSenderEmail] = useState("");
	const [message, setMessage] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const mutation = useEmailStaffMember();

	const emailValid =
		senderEmail.length <= MAX_EMAIL_LENGTH &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail);
	const messageLength = message.trim().length;
	const canSubmit =
		emailValid &&
		messageLength > 0 &&
		messageLength <= MAX_MESSAGE_LENGTH &&
		!mutation.isPending &&
		!showSuccess;

	// Reset transient state whenever the modal opens so a re-open starts fresh.
	useEffect(() => {
		if (open) {
			setShowSuccess(false);
		}
	}, [open]);

	// After the success animation plays, close the modal and clear the form.
	useEffect(() => {
		if (!showSuccess) return;
		const timer = setTimeout(() => {
			setSenderEmail("");
			setMessage("");
			setShowSuccess(false);
			onOpenChange(false);
		}, SUCCESS_ANIMATION_DURATION_MS);
		return () => clearTimeout(timer);
	}, [showSuccess, onOpenChange]);

	// While showing success or sending, block closing via backdrop/escape so the
	// user sees confirmation. Allow closing otherwise.
	const handleOpenChange = (next: boolean) => {
		if (!next && (mutation.isPending || showSuccess)) return;
		onOpenChange(next);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		mutation.mutate(
			{
				userPk,
				data: {
					senderEmail: sanitizeInput(senderEmail),
					message: sanitizeInput(message),
				},
			},
			{
				onSuccess: () => {
					setShowSuccess(true);
				},
			}
		);
	};

	return (
		<ResponsiveModal
			title={`Email ${staffName}`}
			open={open}
			onOpenChange={handleOpenChange}
			maxWidth="sm:max-w-[425px]"
		>
			<div className="relative text-slate-800">
				<AnimatePresence mode="wait">
					{showSuccess ? (
						<motion.div
							key="success"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.25 }}
							className="flex flex-col items-center justify-center py-10"
							role="status"
							aria-live="polite"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									type: "spring",
									stiffness: 260,
									damping: 18,
									delay: 0.05,
								}}
								className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
							>
								<motion.div
									initial={{ scale: 0, rotate: -20 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 20,
										delay: 0.2,
									}}
								>
									<Check
										className="size-9 text-emerald-600 dark:text-emerald-400"
										strokeWidth={3}
										aria-hidden="true"
									/>
								</motion.div>
							</motion.div>
							<motion.p
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.25 }}
								className="mt-4 text-base font-semibold"
							>
								Email sent
							</motion.p>
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4, duration: 0.25 }}
								className="mt-1 text-sm text-muted-foreground"
							>
								{staffName} will receive your message shortly.
							</motion.p>
						</motion.div>
					) : (
						<motion.form
							key="form"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							onSubmit={handleSubmit}
						>
							<Label htmlFor="staff-sender-email">Your Email</Label>
							<Input
								type="email"
								id="staff-sender-email"
								placeholder="Enter your email address"
								className="text-md mt-1"
								maxLength={MAX_EMAIL_LENGTH}
								value={senderEmail}
								onChange={(e) => setSenderEmail(e.target.value)}
								autoComplete="email"
								disabled={mutation.isPending}
							/>
							{senderEmail && !emailValid && (
								<p className="p-1 text-xs text-red-500">
									Please enter a valid email address.
								</p>
							)}
							<p className="mb-2 p-1 text-xs text-muted-foreground">
								Ensure that you have entered a valid email before sending the
								message; otherwise, we will not be able to reply.
							</p>
							<div className="flex items-center justify-between">
								<Label>Your Message</Label>
								<span
									className={`text-xs ${
										messageLength > MAX_MESSAGE_LENGTH
											? "text-red-500 font-medium"
											: "text-muted-foreground"
									}`}
								>
									{messageLength}/{MAX_MESSAGE_LENGTH}
								</span>
							</div>
							<Textarea
								className="text-md mt-1 max-h-[180px] overflow-y-auto resize-none"
								placeholder="Type your message here."
								maxLength={MAX_MESSAGE_LENGTH}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								disabled={mutation.isPending}
							/>
							<p className="mb-2 p-1 text-xs text-muted-foreground">
								Your message will be emailed to {staffName}.
							</p>
							{mutation.isError && (
								<p
									className="mb-2 p-1 text-xs text-red-500"
									role="alert"
									aria-live="polite"
								>
									Failed to send. Please try again.
								</p>
							)}
							<div className="flex w-full justify-end">
								<Button type="submit" disabled={!canSubmit}>
									{mutation.isPending ? "Sending..." : "Send"}
								</Button>
							</div>
						</motion.form>
					)}
				</AnimatePresence>
			</div>
		</ResponsiveModal>
	);
};

export default EmailStaffModal;
