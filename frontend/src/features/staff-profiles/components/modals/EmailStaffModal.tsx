import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useEmailStaffMember } from "../../hooks/useStaffProfileMutations";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { SuccessAnimation } from "@/shared/components/SuccessAnimation";
import ResponsiveModal from "./ResponsiveModal";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;

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

	const handleOpenChange = (next: boolean) => {
		if (!next && (mutation.isPending || showSuccess)) return;
		onOpenChange(next);
	};

	const handleSuccessComplete = () => {
		setSenderEmail("");
		setMessage("");
		setShowSuccess(false);
		onOpenChange(false);
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
						<SuccessAnimation
							key="success"
							title="Email sent"
							subtitle={`${staffName} will receive your message shortly.`}
							onComplete={handleSuccessComplete}
						/>
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
