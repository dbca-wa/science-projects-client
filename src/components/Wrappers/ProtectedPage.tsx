// An auth wrapper for displaying content only to users who are logged in

import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        navigate("/login");
      } else {
        setShowContent(true);
      }
    }
  }, [userLoading]);

  return <>{showContent ? children : null}</>;
};
