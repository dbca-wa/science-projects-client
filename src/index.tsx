import { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import { RouterProvider } from "react-router-dom"
import theme from './theme'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LayoutSwitcherProvider } from './lib/hooks/LayoutSwitcherContext'
import { UserSearchProvider } from './lib/hooks/UserSearchContext'
import { ProjectSearchProvider } from './lib/hooks/ProjectSearchContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents uneccessary refretching of API
      refetchOnWindowFocus: false, // default: true
    },
  },

})
const container = document.getElementById("root")
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(container)


export const CurrentPageContext = createContext<{ currentPage: string; setCurrentPage: (newPage: string) => void }>({
  currentPage: '/',
  setCurrentPage: () => {
    // Placeholder
  },
});

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