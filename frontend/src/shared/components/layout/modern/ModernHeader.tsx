import { Link } from "react-router";
import { Navitar } from "../Navitar";

/**
 * ModernHeader - Header component for the modern layout
 * - Displays logo/brand
 * - Navitar component for user menu (profile, logout, theme toggle, layout toggle)
 */
const ModernHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Science Projects
          </Link>
        </div>

        {/* Right side - Navitar */}
        <div className="flex items-center">
          <Navitar isModern={true} shouldShowName={true} />
        </div>
      </div>
    </header>
  );
};

ModernHeader.displayName = "ModernHeader";

export default ModernHeader;
