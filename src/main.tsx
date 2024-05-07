import { createContext } from "react";
import ReactDOM from "react-dom/client";

// Custom Providers and theme

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
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { LayoutSwitcherProvider } from "./lib/hooks/helper/LayoutSwitcherContext";
import { ProjectSearchProvider } from "./lib/hooks/helper/ProjectSearchContext";
import { UserSearchProvider } from "./lib/hooks/helper/UserSearchContext";
import { router } from "./router";
import theme from "./theme";
// import { RouterProvider, createRouter } from "react-router-dom";
// import { routeTree } from "./routeTree.gen";

// Tanstack query client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents uneccessary refretching of API
      retry: 2, retryDelay: 1000, refetchOnWindowFocus: false,     },
  },
});

// Tanstack router config and typing
// const router = createRouter({ routeTree });
// declare module "@tanstack/react-router" {
//   interface Register {
//     router: typeof router;
//   }
// }

// Rendering
const container = document.getElementById("app");
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
