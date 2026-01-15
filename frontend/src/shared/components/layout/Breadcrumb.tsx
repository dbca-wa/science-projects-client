// Component for displaying and quickly navigating related routes

import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface BreadcrumbItem {
	title: string;
	link: string;
}

interface BreadCrumbProps {
	subDirOne: BreadcrumbItem;
	subDirTwo?: BreadcrumbItem;
	subDirThree?: BreadcrumbItem;
	rightSideElement?: ReactNode;
}

export const BreadCrumb = ({
	subDirOne,
	subDirTwo,
	subDirThree,
	rightSideElement,
}: BreadCrumbProps) => {
	const navigate = useNavigate();

	const handleUnderscores = (text: string) => {
		return text.replaceAll("_", " ");
	};

	const items = [
		{ title: "Home", link: "/" },
		subDirOne,
		subDirTwo,
		subDirThree,
	].filter(Boolean) as BreadcrumbItem[];

	return (
		<div className="flex items-center justify-between rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 select-none">
			<nav className="flex items-center gap-1">
				{items.map((item, index) => (
					<div key={item.link} className="flex items-center gap-1">
						<Button
							onClick={() => navigate(item.link)}
							variant="link"
							className="h-auto p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							{handleUnderscores(item.title)}
						</Button>
						{index < items.length - 1 && (
							<ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
						)}
					</div>
				))}
			</nav>
			{rightSideElement && (
				<div className="flex items-center">{rightSideElement}</div>
			)}
		</div>
	);
};
