import { ICaretakerSubsections } from "@/types";
import { Text } from "@chakra-ui/react";
import ActiveCaretakerDisplay from "./ActiveCaretakerDisplay";
import CaretakerRequestDisplay from "./CaretakerRequestDisplay";
import RequestCaretakerForm from "./RequestCaretakerForm";
import BecomeCaretakerRequestDisplay from "./BecomeCaretakerRequestDisplay";

const CaretakersAndRequestsSection = ({
  userData,
  refetchCaretakerData,
  caretakerData,
}: ICaretakerSubsections) => {
  return (
    <div className="rounded-md border p-4">
      <div className="">
        <Text fontSize="lg" fontWeight="semibold">
          Caretaker
        </Text>
        <Text fontSize="sm" color="gray.500">
          {caretakerData?.caretaker_object === null &&
          caretakerData?.caretaker_request_object === null
            ? "You have no caretaker set. Apply for one below."
            : "Your caretaker is shown below."}
        </Text>
      </div>

      {/* Caretaker Request Form (if neither request or caretaker) */}
      {caretakerData?.caretaker_object === null &&
        caretakerData?.caretaker_request_object === null && (
          <RequestCaretakerForm
            userData={userData}
            refetchCaretakerData={refetchCaretakerData}
          />
        )}

      <div className="mt-4 border-t border-gray-200">
        <div className="mt-4">
          <Text fontSize="lg" fontWeight="semibold">
            Requests
          </Text>

          {caretakerData?.caretaker_request_object === null &&
            caretakerData?.become_caretaker_request_object === null &&
            caretakerData?.caretaker_object === null && (
              <Text fontSize="sm" color="gray.500">
                {caretakerData?.caretaker_object === null &&
                caretakerData?.caretaker_request_object === null
                  ? "You have made no caretaker requests."
                  : "Your requests are shown below."}
              </Text>
            )}
        </div>

        {/* Caretaker Request Object (if exists) */}
        {caretakerData?.caretaker_request_object !== null && (
          <CaretakerRequestDisplay
            userData={userData}
            caretakerData={caretakerData}
            refetchCaretakerData={refetchCaretakerData}
          />
        )}

        {/* Become Caretaker Request Object (if exists) */}

        {caretakerData?.become_caretaker_request_object !== null &&
          caretakerData?.become_caretaker_request_object?.status ===
            "pending" && (
            <BecomeCaretakerRequestDisplay
              userData={userData}
              caretakerData={caretakerData}
              refetchCaretakerData={refetchCaretakerData}
            />
          )}
      </div>

      {/* Actual Caretaker (if exists) */}
      {caretakerData?.caretaker_object !== null && (
        <ActiveCaretakerDisplay
          userData={userData}
          caretakerData={caretakerData}
          refetchCaretakerData={refetchCaretakerData}
        />
      )}
    </div>
  );
};

export default CaretakersAndRequestsSection;
