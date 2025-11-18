import type { IUserMe } from "@/shared/types/index.d";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  Select,
  Textarea,
  useColorMode,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ShadcnDatePicker } from "../ShadcnDatePicker";
import { UserSearchDropdown } from "@/shared/components/Navigation/UserSearchDropdown";
import { FaRunning } from "react-icons/fa";
import { CaretakerModeConfirmModal } from "@/shared/components/Modals/Caretakers/CaretakerModeConfirmModal";
import useCaretakingChain from "@/features/users/hooks/useCaretakingChain";

const RequestCaretakerForm = ({
  userData,
  refetchCaretakerData,
}: {
  userData: IUserMe;
  refetchCaretakerData: () => void;
}) => {
  const { colorMode } = useColorMode();

  // const [pk, setPk] = useState<number | undefined>(undefined);
  const [caretakerPk, setCaretakerPk] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<
    "leave" | "resignation" | "other" | null
  >(null);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const {
    isOpen: modalIsOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
  } = useDisclosure();

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
        <FormControl my={2} mb={4} userSelect={"none"}>
          <FormLabel>Reason</FormLabel>
          <Select
            variant="filled"
            placeholder="Select the reason for your absence"
            isDisabled={false}
            onChange={(e) =>
              setReason(
                e.target.value as "leave" | "resignation" | "other" | null,
              )
            }
            value={reason ?? undefined}
          >
            <option value="leave">On Leave</option>
            <option value="resignation">Leaving the Department</option>
            <option value="other">Other</option>
          </Select>
        </FormControl>

        {(reason === "other" ||
          reason === "resignation" ||
          reason === "leave") && (
          <>
            {reason === "other" && (
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Enter the reason"
                  onChange={(e) => setNotes(e.target.value)}
                  value={notes}
                />
                <FormHelperText>
                  Please provide a reason for your absence.
                </FormHelperText>
              </FormControl>
            )}

            {reason !== "resignation" && (
              <Flex flexDir={"row"} gap={4}>
                <FormControl my={2} mb={4} userSelect={"none"}>
                  <FormLabel>End Date</FormLabel>
                  <InputGroup flexDir={"column"}>
                    <ShadcnDatePicker
                      placeholder={"Enter end date"}
                      date={endDate}
                      setDate={setEndDate}
                    />
                    <FormHelperText>
                      When will you return to the office?
                    </FormHelperText>
                  </InputGroup>
                </FormControl>
              </Flex>
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

            <Flex w={"100%"} justifyContent={"flex-end"} mt={2}>
              <Button
                disabled={
                  !userData?.pk ||
                  !caretakerPk ||
                  (reason !== "resignation" && !endDate) ||
                  !reason ||
                  (reason === "other" && !notes)
                }
                variant={"solid"}
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }}
                type="submit"
                leftIcon={<FaRunning />}
              >
                Activate
              </Button>
            </Flex>
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
