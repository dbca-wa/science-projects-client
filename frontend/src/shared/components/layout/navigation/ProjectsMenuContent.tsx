import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { FaMapMarkedAlt } from "react-icons/fa";

/**
 * ProjectsMenuContent
 * Reusable content for Projects dropdown menu
 * Used in TraditionalHeader, ModernSidebar, and HamburgerMenu
 */

interface ProjectsMenuContentProps {
  onNavigate: (path: string) => void;
  variant?: "dropdown" | "sidebar";
}

export const ProjectsMenuContent = ({ onNavigate, variant = "dropdown" }: ProjectsMenuContentProps) => {
  const menuItems = [
    {
      path: "/projects",
      label: "Browse Projects",
      icon: CgBrowse,
    },
    {
      path: "/projects/map",
      label: "Project Map",
      icon: FaMapMarkedAlt,
    },
    {
      path: "/projects/create",
      label: "Create New Project",
      icon: CgPlayListAdd,
    },
  ];

  if (variant === "dropdown") {
    return menuItems;
  }

  // For sidebar variant, return JSX
  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.path} onClick={() => onNavigate(item.path)}>
            <Icon className="mr-2 size-4" />
            {item.label}
          </div>
        );
      })}
    </>
  );
};

// Export menu items for use in different contexts
export const projectsMenuItems = [
  {
    path: "/projects",
    label: "Browse Projects",
    icon: CgBrowse,
  },
  {
    path: "/projects/map",
    label: "Project Map",
    icon: FaMapMarkedAlt,
  },
  {
    path: "/projects/create",
    label: "Create New Project",
    icon: CgPlayListAdd,
  },
];
