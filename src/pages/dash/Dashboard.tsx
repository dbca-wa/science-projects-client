// Route for handling the dashboard

import { Head } from "@/shared/components/Base/Head";
import { ModernDashboard } from "@/shared/components/Pages/Dashboard/ModernDashboard";
import { TraditionalDashboard } from "@/shared/components/Pages/Dashboard/TraditionalDashboard";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { type IDashProps } from "@/shared/types/index.d";
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
