import { CaretakerModeConfirmModal } from "@/components/Modals/CaretakerModeConfirmModal";
import { UserSearchDropdown } from "@/components/Navigation/UserSearchDropdown";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  Select,
  Spinner,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaRunning } from "react-icons/fa";
import { ShadcnDatePicker } from "./ShadcnDatePicker";
import { useCheckExistingCaretaker } from "@/lib/hooks/tanstack/useCheckExistingCaretaker";
import { formatDate } from "date-fns";
import { CancelCaretakerRequestModal } from "@/components/Modals/CancelCaretakerRequestModal";

const CaretakerModePage = () => {
  const { colorMode } = useColorMode();
  const { userData, userLoading } = useUser();
  const { caretakerData, caretakerDataLoading, refetchCaretakerData } =
    useCheckExistingCaretaker();

  const [pk, setPk] = useState<number | undefined>(undefined);
  const [caretakerPk, setCaretakerPk] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<
    "leave" | "resignation" | "other" | null
  >(null);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log({
      pk,
      userData,
      caretakerPk,
      endDate,
      reason,
      notes,
    });
  }, [pk, userData, caretakerPk, endDate, reason, notes]);

  useEffect(() => {
    console.log({
      caretakerData,
      caretakerDataLoading,
    });
  }, [caretakerData, caretakerDataLoading]);

  const {
    isOpen: modalIsOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
  } = useDisclosure();

  const {
    isOpen: cancelModalIsOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
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
      <Box mb={2}>
        <Text
          color={colorMode === "light" ? "gray.500" : "gray.500"}
          fontSize={"sm"}
        >
          This feature allows you to assign a caretaker to manage your projects
          in your absence. Caretaker requests are subject to admin approval.{" "}
        </Text>
      </Box>

      {caretakerData?.caretaker_object === null &&
      caretakerData?.caretaker_request_object === null ? (
        <div>
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
                value={reason}
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

                <UserSearchDropdown
                  isRequired={false}
                  onlyInternal
                  setUserFunction={setCaretakerPk}
                  label={"Caretaker"}
                  placeholder={"Enter a caretaker"}
                  helperText={
                    "Who will look after your projects while you are gone?"
                  }
                />

                <Flex w={"100%"} justifyContent={"flex-end"} mt={2}>
                  <Button
                    disabled={
                      !userData?.pk ||
                      !caretakerPk ||
                      !endDate ||
                      !reason ||
                      (reason === "other" && !notes)
                    }
                    variant={"solid"}
                    color={"white"}
                    background={
                      colorMode === "light" ? "green.500" : "green.600"
                    }
                    _hover={{
                      background:
                        colorMode === "light" ? "green.400" : "green.500",
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
        </div>
      ) : caretakerData?.caretaker_request_object !== null ? (
        <div>
          <Text>
            You already have an active caretaker request. Please wait for admin
            approval or cancel your request:
          </Text>
          <Flex justifyContent={"space-between"} mt={8} alignItems={"center"}>
            <Text>
              {`Set ${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_first_name
              } ${
                caretakerData?.caretaker_request_object?.secondary_users[0]
                  ?.display_last_name
              } as caretaker - Requested on ${formatDate(caretakerData?.caretaker_request_object?.created_at, "dd/MM/yyyy")}`}
            </Text>
            <Flex>
              <Button onClick={onCancelModalOpen}>Cancel</Button>
            </Flex>
          </Flex>
          <CancelCaretakerRequestModal
            isOpen={cancelModalIsOpen}
            onClose={onCancelModalClose}
            refresh={refetchCaretakerData}
            taskPk={caretakerData?.caretaker_request_object?.id}
          />
        </div>
      ) : caretakerData?.caretaker_object !== null ? (
        <Text>You have a current caretaker - remove?</Text>
      ) : null}
    </div>
  ) : null;
};
export default CaretakerModePage;
