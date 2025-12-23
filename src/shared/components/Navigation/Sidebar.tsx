// Sidebar for modern version

import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import { useUser } from "@/features/users/hooks/useUser";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AiOutlineFundProjectionScreen, AiOutlineLeft } from "react-icons/ai";
import { FaBookBookmark, FaUsers } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";
import { HiDocumentDuplicate } from "react-icons/hi";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { ImUsers } from "react-icons/im";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { PiBookOpenTextFill } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { SiReadthedocs } from "react-icons/si";
import { TbLayoutGridAdd } from "react-icons/tb";
import { useUpdatePage } from "@/shared/hooks/useUpdatePage";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";
import { AnimatedToggleButton } from "./AnimatedToggleButton";
import { cn } from "@/shared/utils";

const buttonWidthVariants = {
  open: {
    width: "100%",
    transition: { duration: 0.5 },
  },
  closed: {
    width: "100%",
    transition: { duration: 0.5 },
  },
};

const textVariants = {
  open: {
    opacity: 1,
    width: "auto",
    marginLeft: "2.75rem",
    // alignSelf: "center",
    transition: {
      duration: 0.3,
      delay: 0.2,
    },
  },
  closed: {
    opacity: 0,
    width: 0,
    // marginLeft: "3rem",
    transition: {
      duration: 0,
    },
    display: "none",
  },
};

const sidebarVariants = {
  // open: { width: "15rem", transition: { duration: 0.5 } },
  open: { width: "12.5rem", transition: { duration: 0.5 } },
  closed: { width: "5rem", transition: { duration: 0.5 } },
};

export const Sidebar = () => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const [buttonTransition, setButtonTransition] = useState("closed");

  const { updatePageContext, currentPage } = useUpdatePage();
  const [open, setOpen] = useState(true);

  const { colorMode } = useColorMode();

  const [activeMenu, setActiveMenu] = useState<string>("");

  // Sets the initial value of activeMenu based on the current page
  const getMenuTitleByRoute = (route: string) => {
    const menu = Menus.find((menu) => menu.route === route);
    return menu ? menu.title : "";
  };

  useEffect(() => {
    setActiveMenu(getMenuTitleByRoute(currentPage));
  }, [currentPage]);

  const { userData } = useUser();

  const Menus = userData?.is_superuser
    ? [
        {
          title: "Projects",
          img: HiMiniSquares2X2,
          route: "/projects",
          section: "Projects",
        },
        { title: "Add Project", img: TbLayoutGridAdd, route: "/projects/add" },
        { title: "Users", img: FaUsers, route: "/users", section: "Users" },
        { title: "Add user", img: FiUserPlus, route: "/users/add" },
        {
          title: `Latest Report`,
          img: MdOutlineAccessTimeFilled,
          route: "/reports/current",
          section: "ARAR",
        },

        { title: "Reports", img: PiBookOpenTextFill, route: "/reports" },
        {
          title: "Quick Guide",
          img: FaBookBookmark,
          route: "/guide",
          section: "Guide",
        },
        {
          title: "Admin",
          img: RiAdminFill,
          route: "/crud",
          section: "Admin",
        },
      ]
    : [
        {
          title: "Projects",
          img: AiOutlineFundProjectionScreen,
          route: "/projects",
          section: "Projects",
        },
        { title: "Add Project", img: TbLayoutGridAdd, route: "/projects/add" },
        { title: "Users", img: ImUsers, route: "/users", section: "Users" },
        { title: "Add user", img: FiUserPlus, route: "/users/add" },
        // {
        //   title: `Latest Report`,
        //   img: MdOutlineAccessTimeFilled,
        //   route: "/reports/current",
        //   section: "ARAR",
        // },

        {
          title: "Reports",
          img: HiDocumentDuplicate,
          route: "/reports",
          section: "ARAR",
        },
        {
          title: "Quick Guide",
          img: SiReadthedocs,
          route: "/guide",
          section: "Guide",
        },
      ];

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  const handleTextAnimationComplete = () => {
    if (!open) {
      setButtonTransition("open");
    }
  };

  return (
    <motion.div
      initial={false}
      variants={sidebarVariants}
      animate={open ? "open" : "closed"}
      className={cn(
        "relative p-6 pt-2 min-h-screen flex flex-col border-r",
        open ? "px-5" : "px-4",
        colorMode === "light" 
          ? "border-gray-300 bg-white" 
          : "border-white/40 bg-black/40"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 absolute cursor-pointer rounded-full top-3 -right-8 z-[2] transition-transform duration-500 border flex items-center justify-center",
          !open ? "rotate-180" : "",
          colorMode === "light" 
            ? "text-black border-gray-400" 
            : "text-white/90 border-white/60"
        )}
        onClick={handleToggleSidebar}
      >
        <AiOutlineLeft className="w-2 h-2 -ml-0.5 -mt-px" />
      </div>

      <div
        className={cn(
          "transition-all duration-500 w-full flex items-center",
          open ? "flex-row" : "flex-col"
        )}
      >
        <Button
          className={cn(
            "flex-1 font-medium text-xl transition-all duration-300 text-center",
            colorMode === "light" ? "text-black/90" : "text-white/90"
          )}
          variant="ghost"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              window.open(`/`, "_blank");
            } else {
              setActiveMenu("Home");
              updatePageContext("/");
            }
          }}
        >
          SPMS
        </Button>
      </div>

      <div className="pt-2 flex flex-col items-center transition-all duration-500">
        {Menus.map((menu, index) => (
          <div key={index} className="w-full">
            {menu.section && (
              <Separator className="mt-4 mb-4" />
            )}
            <Button
              asChild
              className={cn(
                "relative block overflow-hidden text-sm leading-5 rounded-md cursor-pointer mt-2 p-2 w-full justify-start",
                colorMode === "light"
                  ? activeMenu === menu.title
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "text-black/80 hover:text-black hover:bg-gray-100"
                  : activeMenu === menu.title
                    ? "bg-blue-500 text-white/80 hover:bg-blue-400 hover:text-white/80"
                    : "text-white/80 hover:text-white/80 hover:bg-blue-400"
              )}
            >
              <motion.div
                variants={buttonWidthVariants}
                initial={false}
                animate={buttonTransition}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    window.open(`${menu.route}`, "_blank");
                  } else {
                    setActiveMenu(menu.title);
                    updatePageContext(menu.route);
                  }
                }}
              >
                <menu.img
                  className={cn(
                    "w-5 h-5 absolute",
                    open ? "left-4" : "left-1/2 -translate-x-1/2",
                    colorMode === "light"
                      ? activeMenu === menu.title
                        ? "text-white/90"
                        : "text-black/70"
                      : "text-white/80"
                  )}
                />
                <motion.span
                  variants={textVariants}
                  initial={false}
                  animate={open ? "open" : "closed"}
                  className="inline-block whitespace-nowrap overflow-hidden"
                  style={{
                    marginLeft: open ? "1rem" : 0,
                  }}
                  onAnimationComplete={handleTextAnimationComplete}
                >
                  {menu.title}
                </motion.span>
              </motion.div>
            </Button>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-auto self-end justify-end w-full gap-4 flex items-center justify-center",
          open ? "grid grid-cols-2" : "grid grid-cols-1 gap-0"
        )}
      >
        <ToggleLayout />
        <AnimatedToggleButton
          open={open}
          buttonComponent={<ToggleDarkMode />}
          delay={200}
        />
      </div>
    </motion.div>
  );
};
