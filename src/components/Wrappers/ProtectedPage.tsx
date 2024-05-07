// An auth wrapper for displaying content only to users who are logged in

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "../../lib/hooks/tanstack/useUser";

interface IProtectedPageProps {
  children: React.ReactNode;
}

export const ProtectedPage = ({ children }: IProtectedPageProps) => {
  const { isLoggedIn, userData, userLoading } = useUser();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (!isLoggedIn || userData?.pk === undefined) {
        console.log("No user. Navigating to login.");
        navigate({ to: "/login" });
      } else {
        setShowContent(true);
      }
    }
  }, [userLoading]);

  return <>{showContent ? children : null}</>;
};
