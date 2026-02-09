import { createContext, useContext, useState, type ReactNode } from "react";
import type { BreadcrumbItem } from "@/shared/components/navigation/Breadcrumb";

interface BreadcrumbContextValue {
  overrideItems?: BreadcrumbItem[];
  setOverrideItems: (items?: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [overrideItems, setOverrideItems] = useState<BreadcrumbItem[] | undefined>();

  return (
    <BreadcrumbContext.Provider value={{ overrideItems, setOverrideItems }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbContext must be used within BreadcrumbProvider");
  }
  return context;
};

/**
 * Hook for pages to set custom breadcrumb items
 * This will override the automatic breadcrumbs from route config
 */
export const useSetBreadcrumbs = (items?: BreadcrumbItem[]) => {
  const { setOverrideItems } = useBreadcrumbContext();
  
  // Set breadcrumbs when component mounts or items change
  useState(() => {
    setOverrideItems(items);
    return () => setOverrideItems(undefined); // Clean up on unmount
  });
};