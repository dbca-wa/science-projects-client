// Component for Traditional version footer

import { useCurrentYear } from "@/shared/hooks/useCurrentYear";

export const Footer = () => {
  const currentYear = useCurrentYear();
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.0.0";

  return (
    <div
      className="flex justify-center bottom-0 w-full text-white/60 bg-black/90 py-4 select-none"
    >
      <div
        className="text-xs text-center cursor-pointer"
        onClick={() => console.log(VERSION)}
      >
        <a
          className="text-white/80 hover:text-white"
          href="https://github.com/dbca-wa/science-projects-client"
        >
          {`SPMS ${VERSION}`}
        </a>
        &nbsp;
        <span>© 2012-{currentYear} DBCA. All rights reserved.</span>
      </div>
    </div>
  );
};
