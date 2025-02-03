import { useUserPublications } from "@/lib/hooks/tanstack/useUserPublications";
import { Button } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface IPublicationsProps {
  employee_id: number;
  publicationData: any;
  refetch: () => void;
}

const LogPublicationsButton = ({
  employee_id,
  publicationData,
  refetch,
}: IPublicationsProps) => {
  useEffect(() => {
    console.log("LogPublicationsButton", publicationData);
  }, [publicationData]);

  return (
    <Button
      onClick={() => {
        console.log("Refetching pub data of employee_id", employee_id);
        refetch();
      }}
    >
      Log Publications
    </Button>
  );
};

export default LogPublicationsButton;
