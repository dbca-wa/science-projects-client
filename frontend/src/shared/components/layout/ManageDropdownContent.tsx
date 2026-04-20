import { useRef, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { hasModifierKey } from "@/shared/utils/navigation.utils";
import { cn } from "@/shared/lib/utils";
import { useMenuKeyboardNavigation } from "@/shared/hooks/useMenuKeyboardNavigation";
import { useAuthStore } from "@/app/stores/store-context";
import {
	List,
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
	Mail,
} from "lucide-react";

interface ManageDropdownContentProps {
	onClose: () => void;
	isKeyStakeholder: boolean;
}

interface MenuSection {
	label: string;
	items: Array<{
		targetPath: string;
		icon: ReactNode;
		label: string;
	}>;
}

const MANAGE_SECTIONS: MenuSection[] = [
	{
		label: "Lists & Emails",
		items: [
			{
				targetPath: "/admin/data",
				icon: <Database className="size-4" aria-hidden="true" />,
				label: "Data Lists",
			},
			{
				targetPath: "/admin/emails",
				icon: <Mail className="size-4" aria-hidden="true" />,
				label: "Email",
			},
		],
	},
	{
		label: "CRUD",
		items: [
			{
				targetPath: "/admin/addresses",
				icon: <MapPin className="size-4" aria-hidden="true" />,
				label: "Addresses",
			},
			{
				targetPath: "/admin/affiliations",
				icon: <Building className="size-4" aria-hidden="true" />,
				label: "Affiliations",
			},
			{
				targetPath: "/admin/branches",
				icon: <GitBranch className="size-4" aria-hidden="true" />,
				label: "Branches",
			},
			{
				targetPath: "/admin/business-areas",
				icon: <Briefcase className="size-4" aria-hidden="true" />,
				label: "Business Areas",
			},
			{
				targetPath: "/admin/divisions",
				icon: <Settings className="size-4" aria-hidden="true" />,
				label: "Divisions",
			},
			{
				targetPath: "/admin/locations",
				icon: <Globe className="size-4" aria-hidden="true" />,
				label: "Locations",
			},
			{
				targetPath: "/admin/reports",
				icon: <FileText className="size-4" aria-hidden="true" />,
				label: "Report Info",
			},
			{
				targetPath: "/admin/services",
				icon: <List className="size-4" aria-hidden="true" />,
				label: "Services",
			},
		],
	},
	{
		label: "AR Actions",
		items: [
			{
				targetPath: "/admin/batch-approve-old",
				icon: <CheckSquare className="size-4" aria-hidden="true" />,
				label: "Batch Approve Old Reports",
			},
			{
				targetPath: "/admin/batch-approve",
				icon: <CheckSquare className="size-4" aria-hidden="true" />,
				label: "Batch Approve Reports",
			},
			{
				targetPath: "/admin/new-cycle",
				icon: <RefreshCw className="size-4" aria-hidden="true" />,
				label: "Open New Cycle",
			},
		],
	},
];

/**
 * Manage dropdown content with grouped sections for admin navigation.
 * Follows the same keyboard navigation pattern as NavigationDropdownMenuContent.
 * Conditionally shows AR Actions and Report Info based on user role.
 */
export function ManageDropdownContent({
	onClose,
	isKeyStakeholder,
}: ManageDropdownContentProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const menuRef = useRef<HTMLDivElement>(null);
	const authStore = useAuthStore();

	const canAccessAR = authStore.isSuperuser || isKeyStakeholder;

	// Filter sections based on user permissions
	const filteredSections = useMemo(() => {
		return MANAGE_SECTIONS.map((section) => {
			// AR Actions section: only visible to superusers or key stakeholders
			if (section.label === "AR Actions") {
				return canAccessAR ? section : null;
			}
			// CRUD section: hide Report Info unless superuser or key stakeholder
			if (section.label === "CRUD" && !canAccessAR) {
				return {
					...section,
					items: section.items.filter(
						(item) => item.targetPath !== "/admin/reports"
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

	// Pre-compute flat index for each item for keyboard navigation
	const itemIndexMap = new Map<string, number>();
	let idx = 0;
	for (const section of filteredSections) {
		for (const item of section.items) {
			itemIndexMap.set(item.targetPath, idx++);
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
					{/* Divider before AR Actions section */}
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
						const isActive = isPathActive(item.targetPath);
						const currentIndex = itemIndexMap.get(item.targetPath) ?? 0;

						return (
							<button
								key={item.targetPath}
								ref={registerMenuItem(currentIndex)}
								type="button"
								onClick={(e) => handleNavigate(item.targetPath, e)}
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
}
