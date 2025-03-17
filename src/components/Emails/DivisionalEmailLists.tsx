import { useGetDivisions } from "@/lib/hooks/tanstack/useGetDivisions";
import { Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import DivisionalEmailListDataTable from "./DivisionalEmailListDataTable";

const DivisionalEmailLists = () => {
  const { divsData, divsLoading, refetch } = useGetDivisions();

  useEffect(() => {
    if (!divsLoading) {
      console.log(divsData);
    }
  }, [divsData, divsLoading]);

  return divsLoading ? (
    <div>
      <Spinner />
    </div>
  ) : (
    <div>
      <DivisionalEmailListDataTable
        data={divsData}
        defaultSorting={"name"}
        disabledColumns={{}}
        refetchData={refetch}
      />
    </div>
  );
};

export default DivisionalEmailLists;
