// Route for handling the dashboard

import { Box } from "@chakra-ui/react";
import { Head } from "../components/Base/Head";
import { useLayoutSwitcher } from "../lib/hooks/helper/LayoutSwitcherContext";
import { ModernDashboard } from "../components/Pages/Dashboard/ModernDashboard";
import { TraditionalDashboard } from "../components/Pages/Dashboard/TraditionalDashboard";
import { IDashProps } from "../types";

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
