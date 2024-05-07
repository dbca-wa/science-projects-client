// Simple hook for checking the page and updating the page Context.
// Allows things like the custom breadcrumb to interpret the route
// or conditionally rendering components/running a useEffect.

import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export const useUpdatePage = () => {
  const location = useRouterState().location;
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(location.pathname);
    }, 100);

    return () => clearTimeout(delay);
  }, [location.pathname]);

  const navigate = useNavigate();

  const updatePageContext = (page: string) => {
    if (page !== location.pathname) {
      navigate({
        to: page,
      });
    }
  };

  return { currentPage, updatePageContext };
};
