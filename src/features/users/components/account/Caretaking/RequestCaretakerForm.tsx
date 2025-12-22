import type { IUserMe } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useColorMode } from "@/shared/utils/theme.utils";
import React, { useEffect, useState } from "react";
import { ShadcnDatePicker } from "../ShadcnDatePicker";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { FaRunning } from "react-icons/fa";
import { CaretakerModeConfirmModal } from "@/features/users/components/modals/CaretakerModeConfirmModal";
import useCaretakingChain from "@/features/users/hooks/useCaretakingChain";

const RequestCaretakerForm = ({
  userData,
  refetchCaretakerData,
}: {
  userData: IUserMe;
  refetchCaretakerData: () => void;
}) => {
  const { colorMode } = useColorMode();

  const [caretakerPk, setCaretakerPk] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<
    "leave" | "resignation" | "other" | null
  >(null);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const onOpenModal = () => setModalIsOpen(true);
  const onModalClose = () => setModalIsOpen(false);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenModal();
    // console.log({
    //   pk,
    //   userData,
    //   caretakerPk,
    //   startDate,
    //   endDate,
    //   reason,
    //   notes,
    // });
  };

  const ignoreArray = useCaretakingChain(userData);

  useEffect(() => {
    if (ignoreArray?.length > 0) {
      console.log(ignoreArray);
    }
  }, [ignoreArray]);

  return (
    <>
      {/* Form */}

      <form onSubmit={(e) => void onFormSubmit(e)}>
        <Input type="hidden" value={userData.pk} required={true} />
        <div className="my-2 mb-4 select-none">
          <Label>Reason</Label>
          <Select
            value={reason ?? undefined}
            onValueChange={(value) =>
              setReason(
                value as "leave" | "resignation" | "other" | null,
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select the reason for your absence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leave">On Leave</SelectItem>
              <SelectItem value="resignation">Leaving the Department</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(reason === "other" ||
          reason === "resignation" ||
          reason === "leave") && (
          <>
            {reason === "other" && (
              <div className="my-2 mb-4 select-none">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter the reason"
                  onChange={(e) => setNotes(e.target.value)}
                  value={notes}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Please provide a reason for your absence.
                </p>
              </div>
            )}

            {reason !== "resignation" && (
              <div className="flex flex-row gap-4">
                <div className="my-2 mb-4 select-none flex-1">
                  <Label>End Date</Label>
                  <div className="flex flex-col">
                    <ShadcnDatePicker
                      placeholder={"Enter end date"}
                      date={endDate}
                      setDate={setEndDate}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      When will you return to the office?
                    </p>
                  </div>
                </div>
              </div>
            )}

            <UserSearchDropdown
              isRequired={false}
              onlyInternal
              setUserFunction={setCaretakerPk}
              label={"Caretaker"}
              placeholder={"Enter a caretaker"}
              helperText={
                "Who will look after your projects while you are gone?"
              }
              ignoreArray={ignoreArray}
            />

            <div className="w-full flex justify-end mt-2">
              <Button
                disabled={
                  !userData?.pk ||
                  !caretakerPk ||
                  (reason !== "resignation" && !endDate) ||
                  !reason ||
                  (reason === "other" && !notes)
                }
                className={`${
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-600 hover:bg-green-500"
                } text-white`}
                type="submit"
              >
                <FaRunning className="mr-2 h-4 w-4" />
                Activate
              </Button>
            </div>
          </>
        )}
      </form>

      {/* Modal */}
      <CaretakerModeConfirmModal
        refetch={refetchCaretakerData}
        isOpen={modalIsOpen}
        onClose={onModalClose}
        userPk={userData.pk}
        caretakerPk={caretakerPk}
        // startDate={startDate}
        endDate={endDate}
        reason={reason}
        notes={notes}
      />
    </>
  );
};

export default RequestCaretakerForm;
