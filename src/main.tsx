import { createContext } from "react";
import ReactDOM from "react-dom/client";
import "@/main.css";

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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { StoreProvider } from "@/app/providers/store.provider";
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

// Rendering
const container = document.getElementById("app");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

root.render(
  <StoreProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <RouterProvider
          router={router}
          // future={{
          //   v7_startTransition: true,
          //   v7_fetcherPersist: true,
          // }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  </StoreProvider>,
);
