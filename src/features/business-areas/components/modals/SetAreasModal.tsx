import { useGetLocations } from "@/features/admin/hooks/useGetLocations";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoIosCreate } from "react-icons/io";
import { type ISetProjectAreas, setProjectAreas } from "@/features/projects/services/projects.service";
import { AreaCheckAndMaps } from "@/features/projects/components/forms/AreaCheckAndMaps";

interface Props {
  projectPk: string | number;
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const SetAreasModal = ({
  projectPk,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
  setToLastTab,
}: Props) => {
  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const setAreasMutation = useMutation({
    mutationFn: setProjectAreas,
    onMutate: () => {
      toast.loading("Updating Areas");
    },
    onSuccess: async () => {
      toast.success("Areas updated");
      onDeleteSuccess?.();

      setTimeout(async () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", "areas", projectPk],
        });
        await refetchData();
        onClose();
        setToLastTab();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could not set areas: ${error}`);
    },
  });

  const setAreas = (formData: ISetProjectAreas) => {
    setAreasMutation.mutate(formData);
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocations();

  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedIbras, setSelectedIbras] = useState<number[]>([]);
  const [selectedImcras, setSelectedImcras] = useState<number[]>([]);
  const [selectedNrms, setSelectedNrms] = useState<number[]>([]);

  const [locationData, setLocationData] = useState<number[]>([]);
  useEffect(() => {
    setLocationData([
      ...selectedRegions,
      ...selectedDistricts,
      ...selectedIbras,
      ...selectedImcras,
      ...selectedNrms,
    ]);
  }, [
    selectedRegions,
    selectedIbras,
    selectedDistricts,
    selectedImcras,
    selectedNrms,
    setLocationData,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl ${isDark ? "text-gray-400 bg-gray-800" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle>Set Project Areas</DialogTitle>
        </DialogHeader>

        <div>
          {!locationsLoading && (
            <div className="grid grid-cols-2 gap-4 px-4">
              <div className="flex w-full">
                {dbcaDistricts && (
                  <AreaCheckAndMaps
                    title="DBCA Districts"
                    areas={dbcaDistricts}
                    area_type="dbcadistrict"
                    selectedAreas={selectedDistricts}
                    setSelectedAreas={setSelectedDistricts}
                  />
                )}
              </div>
              <div className="flex w-full">
                {imcra && (
                  <AreaCheckAndMaps
                    title="IMCRAs"
                    areas={imcra}
                    area_type="imcra"
                    selectedAreas={selectedImcras}
                    setSelectedAreas={setSelectedImcras}
                  />
                )}
              </div>
              <div className="flex w-full mt-2">
                {dbcaRegions && (
                  <AreaCheckAndMaps
                    title="DBCA Regions"
                    areas={dbcaRegions}
                    area_type="dbcaregion"
                    selectedAreas={selectedRegions}
                    setSelectedAreas={setSelectedRegions}
                  />
                )}
              </div>

              <div className="flex flex-col mt-2 w-full">
                {nrm && (
                  <AreaCheckAndMaps
                    title="Natural Resource Management Regions"
                    areas={nrm}
                    area_type="nrm"
                    selectedAreas={selectedNrms}
                    setSelectedAreas={setSelectedNrms}
                  />
                )}
              </div>
              <div className="flex w-full">
                {ibra && (
                  <AreaCheckAndMaps
                    title="IBRAs"
                    areas={ibra}
                    area_type="ibra"
                    selectedAreas={selectedIbras}
                    setSelectedAreas={setSelectedIbras}
                  />
                )}
              </div>
              <div className="flex w-full justify-end mt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  className={`ml-3 text-white ${
                    isDark 
                      ? "bg-blue-600 hover:bg-blue-500" 
                      : "bg-blue-500 hover:bg-blue-400"
                  }`}
                  disabled={!projectPk || locationData.length < 1}
                  onClick={() =>
                    setAreas({
                      projectPk: Number(projectPk),
                      areas: locationData,
                    })
                  }
                >
                  <IoIosCreate className="mr-2" />
                  Set Areas
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
