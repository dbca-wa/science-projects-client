// An auth wrapper for displaying content only to users who are logged in

import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProtectedPageProps {
  children: React.ReactNode;
}

export const ProtectedPage = ({ children }: IProtectedPageProps) => {
  const { isLoggedIn, userData, userLoading } = useUser();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const location = useLocation();
  const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env.VITE_PRODUCTION_BACKEND_BASE_URL

  useEffect(() => {
    if (!userLoading) {
      // console.log(location.pathname)
      if (!isLoggedIn || userData?.pk === undefined) {
        if (location.pathname !== "/login"
          // && location.pathname !== "/science"
        ) {
          console.log("No user and not on login page. Navigating to login.");
          if (process.env.NODE_ENV === "production") {
            // Originally sso/signedout?relogin=/
            window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}sso/signedout?relogin`;
          } else {
            navigate("/login");
          }
        }
      }
      else {
        setShowContent(true);
      }
    }
  }, [userLoading, location, isLoggedIn,]);

  return <>{showContent ? children : null}</>;
};
