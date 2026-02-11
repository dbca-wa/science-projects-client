import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import type { CaretakerTaskCardProps } from "@/features/dashboard/types/admin-tasks.types";
import { format } from "date-fns";

export const CaretakerTaskCard = ({ task }: CaretakerTaskCardProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const navigate = useNavigate();

	const handleClick = (e: React.MouseEvent) => {
		if (!task?.id) {
			console.error("Task ID is undefined", task);
			return;
		}

		if (e.ctrlKey || e.metaKey) {
			window.open("/admin", "_blank");
		} else {
			navigate("/admin");
		}
	};

	const primaryUserName = task.primary_user
		? `${task.primary_user.display_first_name} ${task.primary_user.display_last_name}`
		: "Unknown";

	const caretakerName =
		task.secondary_users && task.secondary_users.length > 0
			? `${task.secondary_users[0].display_first_name} ${task.secondary_users[0].display_last_name}`
			: "Unknown";

	const formattedDate = task.created_at
		? format(new Date(task.created_at), "MMM d, yyyy")
		: "";

	return (
		<motion.div
			initial={{ scale: 1, opacity: 1 }}
			animate={{
				scale: isHovered ? 1.05 : 1,
				opacity: 1,
			}}
			transition={{ duration: 0.2 }}
		>
			<div
				className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 min-h-[230px] shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col relative select-none"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleClick}
			>
				<div className="mb-2">
					<h3 className="font-semibold text-lg text-green-600 dark:text-green-400">
						Caretaker Request
					</h3>
				</div>

				<div className="mb-2">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						<span className="font-medium">For:</span> {primaryUserName}
					</p>
					{task.primary_user?.email && (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{task.primary_user.email}
						</p>
					)}
				</div>

				<div className="mb-2">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						<span className="font-medium">Proposed Caretaker:</span>{" "}
						{caretakerName}
					</p>
					{task.secondary_users &&
						task.secondary_users.length > 0 &&
						task.secondary_users[0].email && (
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{task.secondary_users[0].email}
							</p>
						)}
				</div>

				{task.reason && (
					<div className="mb-2 flex-grow">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							<span className="font-medium">Reason:</span>{" "}
							{task.reason.length > 100
								? `${task.reason.substring(0, 100)}...`
								: task.reason}
						</p>
					</div>
				)}

				<div className="absolute bottom-2 right-2">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{formattedDate}
					</p>
				</div>
			</div>
		</motion.div>
	);
};
