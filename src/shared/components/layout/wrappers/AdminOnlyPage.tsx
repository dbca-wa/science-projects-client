// An auth wrapper for components meant only for Admins

import { useNavigate } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { useUser } from "@/features/users/hooks/useUser";

interface IAdminOnlyPageProps {
  children: ReactNode;
}

export const AdminOnlyPage = ({ children }: IAdminOnlyPageProps) => {
  const { userData, userLoading } = useUser();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (userData?.is_superuser) {
        setShowContent(true);
      } else {
        navigate("/");
      }
    }
  }, [userLoading, userData]);

  return <>{showContent ? children : null}</>;
};
