// Route for handling the dashboard

import { Head } from "@/shared/components/layout/base/Head";
import { ModernDashboard } from "@/features/dashboard/components/ModernDashboard";
import { TraditionalDashboard } from "@/features/dashboard/components/TraditionalDashboard";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { type IDashProps } from "@/shared/types";
import { Box } from "@chakra-ui/react";

export const Dashboard = ({ activeTab }: IDashProps) => {
  const { layout } = useLayoutSwitcher();

  return layout === "traditional" ? (
    <>
      <Head title="Home" />
      <Box h={"100%"}>
        <TraditionalDashboard />
      </Box>
    </>
  ) : (
    <>
      <Head title="Home" />
      <Box h={"100%"}>
        <ModernDashboard activeTab={activeTab} />
      </Box>
    </>
  );
};
