import { createContext } from "react";
import ReactDOM from "react-dom/client";
import "@/main.css";
import * as Sentry from "@sentry/browser";

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
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Tanstack router config and typing
// const router = createRouter({ routeTree });
// declare module "@tanstack/react-router" {
//   interface Register {
//     router: typeof router;
//   }
// }

Sentry.init({
  dsn: "https://8dd0517876955893e7c6c13dda43ae8b@o4506736817405952.ingest.us.sentry.io/4507297807663104",
  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

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
  </QueryClientProvider>,
  // </React.StrictMode>
);
