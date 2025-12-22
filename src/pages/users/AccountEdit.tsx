// Route for handling Updating and Reviewing Account

import { Head } from "@/shared/components/layout/base/Head";
import CaretakerModePage from "@/features/users/components/account/Caretaking/CaretakerMode";
import { ProfilePage } from "@/features/users/components/account/ProfilePage";
import { SideMenuButton } from "@/features/users/components/account/SideMenuButton";
import { AccountPageViewWrapper } from "@/shared/components/layout/wrappers/AccountPageViewWrapper";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const AccountEdit = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selected, setSelected] = useState("spmsprofile");
  const [pageViewChildren, setPageViewChildren] = useState<React.ReactNode>(
    <>Test</>,
  );
  const handleSidebarMenuClick = (page: string) => {
    setSelected(page);
  };

  useEffect(() => {
    let content = null;
    switch (selected) {
      case "spmsprofile":
        content = <ProfilePage />;
        break;
      case "caretakermode":
        content = <CaretakerModePage />;
        break;
      default:
        content = null;
        break;
    }
    setPageViewChildren(content);
  }, [selected]);

  return (
    <>
      <Head title="My Account" />
      <div className="flex h-full w-full">
        {/* Content */}
        <AccountPageViewWrapper children={pageViewChildren} />

        {/* Sidebar */}
        <div
          className={`border-l px-2 min-w-[174px] ${
            isDark ? "border-white/40" : "border-gray-300"
          }`}
        >
          <SideMenuButton
            pageName={"SPMS Profile"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("spmsprofile")}
          />
          <SideMenuButton
            pageName={"Caretaker Mode"}
            selectedString={selected}
            onClick={() => handleSidebarMenuClick("caretakermode")}
          />
        </div>
      </div>
    </>
  );
};
