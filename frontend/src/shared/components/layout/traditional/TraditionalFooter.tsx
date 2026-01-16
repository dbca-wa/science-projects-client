/**
 * TraditionalFooter component
 * Footer for the traditional layout
 * 
 * Features:
 * - SPMS version and copyright information
 * - Link to GitHub repository
 * - Dark background styling
 * - Centered content
 */
export const TraditionalFooter = () => {
  const currentYear = new Date().getFullYear();
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.0.0";

  return (
    <footer className="flex justify-center bottom-0 w-full text-white/60 bg-gray-900 py-4 select-none">
      <div 
        className="text-xs text-center cursor-pointer"
        onClick={() => console.log(VERSION)}
      >
        <a
          href="https://github.com/dbca-wa/science-projects-client"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
        >
          SPMS {VERSION}
        </a>
        {" "}
        <span>© 2012-{currentYear} DBCA. All rights reserved.</span>
      </div>
    </footer>
  );
};
