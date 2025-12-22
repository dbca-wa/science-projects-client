import { useGetDivisions } from "@/features/admin/hooks/useGetDivisions";
import { Loader2 } from "lucide-react";
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
      <Loader2 className="h-6 w-6 animate-spin" />
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
