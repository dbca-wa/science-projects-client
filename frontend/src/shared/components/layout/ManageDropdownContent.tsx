import { useRef, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { hasModifierKey } from "@/shared/utils/navigation.utils";
import { cn } from "@/shared/lib/utils";
import { useMenuKeyboardNavigation } from "@/shared/hooks/useMenuKeyboardNavigation";
import { useAuthStore } from "@/app/stores/store-context";
import {
	MapPin,
	Building,
	GitBranch,
	Globe,
	Briefcase,
	Settings,
	Database,
	CheckSquare,
	RefreshCw,
	FileText,
	CircleCheckBig,
} from "lucide-react";

export type ARActionId = "batch-approve" | "batch-approve-old";

interface ManageDropdownContentProps {
	onClose: () => void;
	isKeyStakeholder: boolean;
	onARAction?: (actionId: ARActionId) => void;
}

interface MenuSection {
	label: string;
	items: Array<{
		targetPath?: string;
		actionId?: ARActionId;
		icon: ReactNode;
		label: string;
	}>;
}

const MANAGE_SECTIONS: MenuSection[] = [
	{
		label: "Lists & Approvers",
		items: [
			{
				targetPath: "/manage/data",
				icon: <Database className="size-4" aria-hidden="true" />,
				label: "Data Lists",
			},
			{
				targetPath: "/manage/approvers",
				icon: <CircleCheckBig className="size-4" aria-hidden="true" />,
				label: "Approvers",
			},
		],
	},
	{
		label: "CRUD",
		items: [
			{
				targetPath: "/manage/addresses",
				icon: <MapPin className="size-4" aria-hidden="true" />,
				label: "Addresses",
			},
			{
				targetPath: "/manage/affiliations",
				icon: <Building className="size-4" aria-hidden="true" />,
				label: "Affiliations",
			},
			{
				targetPath: "/manage/branches",
				icon: <GitBranch className="size-4" aria-hidden="true" />,
				label: "Branches",
			},
			{
				targetPath: "/manage/business-areas",
				icon: <Briefcase className="size-4" aria-hidden="true" />,
				label: "Business Areas",
			},
			{
				targetPath: "/manage/divisions",
				icon: <Settings className="size-4" aria-hidden="true" />,
				label: "Divisions",
			},
			{
				targetPath: "/manage/locations",
				icon: <Globe className="size-4" aria-hidden="true" />,
				label: "Locations",
			},
			{
				targetPath: "/manage/reports",
				icon: <FileText className="size-4" aria-hidden="true" />,
				label: "Report Info",
			},
		],
	},
	{
		label: "AR Actions",
		items: [
			{
				actionId: "batch-approve",
				icon: <CheckSquare className="size-4" aria-hidden="true" />,
				label: "Batch Approve Reports",
			},
			{
				actionId: "batch-approve-old",
				icon: <CheckSquare className="size-4" aria-hidden="true" />,
				label: "Batch Approve Old Reports",
			},
			{
				targetPath: "/manage/new-cycle",
				icon: <RefreshCw className="size-4" aria-hidden="true" />,
				label: "Open New Cycle",
			},
		],
	},
];

/**
 * Manage dropdown content with grouped sections for admin navigation.
 * AR Actions fire the onARAction callback so the parent can open modals.
 */
export const ManageDropdownContent = ({
	onClose,
	isKeyStakeholder,
	onARAction,
}: ManageDropdownContentProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const menuRef = useRef<HTMLDivElement>(null);
	const authStore = useAuthStore();

	const canAccessAR = authStore.isSuperuser || isKeyStakeholder;

	const filteredSections = useMemo(() => {
		return MANAGE_SECTIONS.map((section) => {
			if (section.label === "AR Actions") {
				return canAccessAR ? section : null;
			}
			if (section.label === "CRUD" && !canAccessAR) {
				return {
					...section,
					items: section.items.filter(
						(item) => item.targetPath !== "/manage/reports"
					),
				};
			}
			return section;
		}).filter((s): s is MenuSection => s !== null);
	}, [canAccessAR]);

	const { handleKeyDown, registerMenuItem, focusFirstItem } =
		useMenuKeyboardNavigation(onClose);

	useEffect(() => {
		focusFirstItem();
	}, [focusFirstItem]);

	const getBasePath = (path: string) => path.split("?")[0].split("#")[0];

	const isPathActive = (targetPath: string) => {
		const currentBasePath = getBasePath(location.pathname);
		const targetBasePath = getBasePath(targetPath);
		return currentBasePath === targetBasePath;
	};

	const handleNavigate = (
		targetPath: string,
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		if (isPathActive(targetPath)) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		if (hasModifierKey(event.nativeEvent)) {
			window.open(targetPath, "_blank");
			onClose();
			return;
		}

		navigate(targetPath);
		onClose();
	};

	const handleAction = (actionId: ARActionId) => {
		onClose();
		onARAction?.(actionId);
	};

	// Pre-compute flat index for keyboard navigation
	let idx = 0;
	const itemIndexMap = new Map<string, number>();
	for (const section of filteredSections) {
		for (const item of section.items) {
			itemIndexMap.set(item.targetPath ?? item.actionId ?? "", idx++);
		}
	}

	return (
		<div
			ref={menuRef}
			className="flex flex-col max-h-[70vh] overflow-y-auto"
			onKeyDown={handleKeyDown}
		>
			{filteredSections.map((section, sectionIdx) => (
				<div key={section.label}>
					{sectionIdx === filteredSections.length - 1 &&
						filteredSections.length > 1 && (
							<div className="my-1 border-t border-gray-200 dark:border-gray-700" />
						)}

					<div className="px-4 py-2">
						<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
							{section.label}
						</span>
					</div>

					{section.items.map((item) => {
						const key = item.targetPath ?? item.actionId ?? "";
						const isNav = !!item.targetPath;
						const isActive = isNav && isPathActive(item.targetPath!);
						const currentIndex = itemIndexMap.get(key) ?? 0;

						return (
							<button
								key={key}
								ref={registerMenuItem(currentIndex)}
								type="button"
								onClick={(e) =>
									isNav
										? handleNavigate(item.targetPath!, e)
										: handleAction(item.actionId!)
								}
								disabled={isActive}
								className={cn(
									"w-full text-left p-2.5 px-4 text-sm rounded flex items-center gap-2",
									"select-none focus:outline-none",
									isActive
										? "bg-blue-100 dark:bg-blue-900/30 cursor-default focus:bg-blue-200 dark:focus:bg-blue-800/50 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
										: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
								)}
								role="menuitem"
								aria-current={isActive ? "page" : undefined}
							>
								{item.icon}
								<span>{item.label}</span>
							</button>
						);
					})}
				</div>
			))}
		</div>
	);
};
