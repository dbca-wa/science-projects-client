import { useCheckExistingCaretaker } from "@/features/users/hooks/useCheckExistingCaretaker";
import { useUser } from "@/features/users/hooks/useUser";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Loader2 } from "lucide-react";
import CaretakersAndRequestsSection from "./CaretakersAndRequestsSection";
import { MemoizedCaretakeeSection } from "./MemoizedCaretakeeSection";

const CaretakerModePage = () => {
  const { colorMode } = useColorMode();
  const { userData, userLoading, refetchUser } = useUser();
  const { caretakerData, caretakerDataLoading, refetchCaretakerData } =
    useCheckExistingCaretaker();

  return userLoading || caretakerDataLoading ? (
    <div className="w-full flex items-center justify-center my-4">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : userData?.pk ? (
    <div className="h-full min-h-full">
      {/* Descriptor */}
      <div className="mb-3">
        <p className={`text-sm ${colorMode === "light" ? "text-gray-500" : "text-gray-500"}`}>
          This feature allows you to view your caretakees and assign a caretaker
          to manage your projects in your absence. Caretaker requests are
          subject to admin approval.{" "}
        </p>
      </div>

      {/* Request Caretaker Form & Pending  */}

      <CaretakersAndRequestsSection
        userData={userData}
        refetchCaretakerData={() => {
          refetchUser();
          refetchCaretakerData();
        }}
        caretakerData={caretakerData}
      />

      <hr className="my-4" />

      {/* Caretakee User Display */}
      <MemoizedCaretakeeSection
        userData={userData}
        refetchCaretakerData={() => {
          refetchUser();
          refetchCaretakerData();
        }}
      />
    </div>
  ) : null;
};
export default CaretakerModePage;
