/**
 * Dynamic Lucide Icon Mapping
 *
 * Maps icon name strings (stored in the database) to Lucide icon components.
 * Only includes icons used by the knowledge base categories.
 */
import {
	BookOpen,
	Rocket,
	Folder,
	FileText,
	CheckCircle,
	BarChart2,
	Users,
	Settings,
	User,
	HelpCircle,
	LayoutDashboard,
	Briefcase,
	type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
	"book-open": BookOpen,
	rocket: Rocket,
	folder: Folder,
	"file-text": FileText,
	"check-circle": CheckCircle,
	"bar-chart-2": BarChart2,
	users: Users,
	settings: Settings,
	user: User,
	"help-circle": HelpCircle,
	"layout-dashboard": LayoutDashboard,
	briefcase: Briefcase,
};

/** Resolve a Lucide icon name string to a component. Falls back to BookOpen. */
export const getIconComponent = (iconName: string): LucideIcon => {
	return ICON_MAP[iconName] ?? BookOpen;
};
