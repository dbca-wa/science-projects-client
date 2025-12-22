// Route for handling the dashboard

import { Head } from "@/shared/components/layout/base/Head";
import { ModernDashboard } from "@/features/dashboard/components/ModernDashboard";
import { TraditionalDashboard } from "@/features/dashboard/components/TraditionalDashboard";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { type IDashProps } from "@/shared/types";

export const Dashboard = ({ activeTab }: IDashProps) => {
  const { layout } = useLayoutSwitcher();

  return layout === "traditional" ? (
    <>
      <Head title="Home" />
      <div className="h-full">
        <TraditionalDashboard />
      </div>
    </>
  ) : (
    <>
      <Head title="Home" />
      <div className="h-full">
        <ModernDashboard activeTab={activeTab} />
      </div>
    </>
  );
};
