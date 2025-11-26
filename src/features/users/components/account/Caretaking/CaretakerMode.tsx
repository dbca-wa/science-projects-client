import { useCheckExistingCaretaker } from "@/features/users/hooks/useCheckExistingCaretaker";
import { useUser } from "@/features/users/hooks/useUser";
import { Box, Spinner, Text, useColorMode } from "@chakra-ui/react";
import CaretakersAndRequestsSection from "./CaretakersAndRequestsSection";
import { MemoizedCaretakeeSection } from "./MemoizedCaretakeeSection";

const CaretakerModePage = () => {
  const { colorMode } = useColorMode();
  const { userData, userLoading, refetchUser } = useUser();
  const { caretakerData, caretakerDataLoading, refetchCaretakerData } =
    useCheckExistingCaretaker();

  return userLoading || caretakerDataLoading ? (
    <Box
      w={"100%"}
      alignItems={"center"}
      justifyContent={"center"}
      display={"flex"}
      my={4}
    >
      <Spinner />
    </Box>
  ) : userData?.pk ? (
    <div className="h-full min-h-full">
      {/* Descriptor */}
      <Box mb={3}>
        <Text
          color={colorMode === "light" ? "gray.500" : "gray.500"}
          fontSize={"sm"}
        >
          This feature allows you to view your caretakees and assign a caretaker
          to manage your projects in your absence. Caretaker requests are
          subject to admin approval.{" "}
        </Text>
      </Box>

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
