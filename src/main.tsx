import ReactDOM from "react-dom/client";
import { createContext } from "react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

// Custom Providers and theme
import { LayoutSwitcherProvider } from "./lib/hooks/helper/LayoutSwitcherContext";
import { UserSearchProvider } from "./lib/hooks/helper/UserSearchContext";
import { ProjectSearchProvider } from "./lib/hooks/helper/ProjectSearchContext";
import theme from "./theme";

export const CurrentPageContext = createContext<{
  currentPage: string;
  setCurrentPage: (newPage: string) => void;
}>({
  currentPage: "/",
  setCurrentPage: () => {
    // Placeholder
  },
});

// Router and Queries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents uneccessary refretching of API
      refetchOnWindowFocus: false, // default: true
    },
  },
});

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Rendering
const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

root.render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <LayoutSwitcherProvider>
        <UserSearchProvider>
          <ProjectSearchProvider>
            <RouterProvider router={router} />
          </ProjectSearchProvider>
        </UserSearchProvider>
      </LayoutSwitcherProvider>
    </ChakraProvider>
  </QueryClientProvider>
  // </React.StrictMode>
);
