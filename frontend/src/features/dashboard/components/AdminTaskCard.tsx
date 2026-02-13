import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { formatActionType, getActionColor } from "../utils/dashboard.utils";
import type { AdminTaskCardProps } from "../types/admin-tasks.types";
import { format } from "date-fns";

export const AdminTaskCard = ({ task }: AdminTaskCardProps) => {
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

	const actionColor = getActionColor(task.action);
	const colorClasses = {
		red: "text-red-600 dark:text-red-400",
		blue: "text-blue-600 dark:text-blue-400",
		green: "text-green-600 dark:text-green-400",
		gray: "text-gray-600 dark:text-gray-400",
	};

	const requesterName = task.requester
		? `${task.requester.display_first_name} ${task.requester.display_last_name}`
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
					<h3
						className={`font-semibold text-lg ${colorClasses[actionColor as keyof typeof colorClasses]}`}
					>
						{formatActionType(task.action)}
					</h3>
				</div>

				<div className="mb-2">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						<span className="font-medium">Requested by:</span> {requesterName}
					</p>
					{task.requester?.email && (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{task.requester.email}
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
