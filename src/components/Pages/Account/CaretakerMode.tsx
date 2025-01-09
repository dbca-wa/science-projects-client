import { CaretakerModeConfirmModal } from "@/components/Modals/CaretakerModeConfirmModal";
import { UserSearchDropdown } from "@/components/Navigation/UserSearchDropdown";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Avatar,
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
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { RemoveCaretakerModal } from "@/components/Modals/RemoveCaretakerModal";
import { checkIfDateExpired } from "@/lib/utils/checkIfDateExpired";
import { ExtendCaretakerModal } from "@/components/Modals/ExtendCaretakerModal";

const CaretakerModePage = () => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();
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

  const {
    isOpen: removeModalIsOpen,
    onOpen: onOpenRemoveModal,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  const {
    isOpen: extendModalIsOpen,
    onOpen: onOpenExtendModal,
    onClose: onExtendModalClose,
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
          <Text color={"red.500"} mt={4} fontSize={"md"}>
            You have an active caretaker request. Please wait for admin approval
            or cancel your request:
          </Text>
          <Flex justifyContent={"space-between"} mt={4} alignItems={"center"}>
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <Avatar
                size="md"
                name={`${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_first_name} ${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_last_name}`}
                src={
                  caretakerData?.caretaker_request_object?.secondary_users[0]
                    ?.image
                    ? caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file?.startsWith(
                        "http",
                      )
                      ? `${caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file}`
                      : `${baseAPI}${caretakerData?.caretaker_request_object?.secondary_users[0]?.image?.file}`
                    : caretakerData?.caretaker_request_object
                          ?.secondary_users[0]?.image?.old_file
                      ? caretakerData?.caretaker_request_object
                          ?.secondary_users[0]?.image?.old_file
                      : noImage
                }
              />
              <Box display={"flex"} flexDir={"column"}>
                <Text
                  fontSize={"md"}
                  fontWeight={"semibold"}
                  color={colorMode === "light" ? "gray.800" : "gray.200"}
                >
                  {`${
                    caretakerData?.caretaker_request_object?.secondary_users[0]
                      ?.display_first_name
                  } ${
                    caretakerData?.caretaker_request_object?.secondary_users[0]
                      ?.display_last_name
                  }`}
                </Text>
                <Text fontSize={"sm"} color={"gray.500"}>
                  Requested on $
                  {formatDate(
                    caretakerData?.caretaker_request_object?.created_at,
                    "dd/MM/yyyy",
                  )}
                </Text>
              </Box>
            </Box>

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
        <>
          <RemoveCaretakerModal
            isOpen={removeModalIsOpen}
            onClose={onRemoveModalClose}
            refetch={refetchCaretakerData}
            caretakerObject={caretakerData?.caretaker_object}
          />
          <div className="my-4">
            <Text color={"red.500"} fontSize={"md"}>
              You have an active caretaker.
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size="md"
                name={`${caretakerData?.caretaker_object?.caretaker?.display_first_name} ${caretakerData?.caretaker_object?.caretaker?.display_last_name}`}
                src={
                  caretakerData?.caretaker_object?.caretaker?.image
                    ? caretakerData?.caretaker_object?.caretaker?.image?.file?.startsWith(
                        "http",
                      )
                      ? `${caretakerData?.caretaker_object?.caretaker?.image?.file}`
                      : `${baseAPI}${caretakerData?.caretaker_object?.caretaker?.image?.file}`
                    : caretakerData?.caretaker_object?.caretaker?.image
                          ?.old_file
                      ? caretakerData?.caretaker_object?.caretaker?.image
                          ?.old_file
                      : noImage
                }
              />
              <Box display={"flex"} flexDir={"column"}>
                <Text
                  fontSize={"md"}
                  fontWeight={"semibold"}
                  color={colorMode === "light" ? "gray.800" : "gray.200"}
                >
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_first_name
                  }{" "}
                  {
                    caretakerData?.caretaker_object?.caretaker
                      ?.display_last_name
                  }
                </Text>
                {caretakerData?.caretaker_object?.end_date && (
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {`Ends ${formatDate(
                      caretakerData?.caretaker_object?.end_date,
                      "dd/MM/yyyy",
                    )}
                   `}
                  </Text>
                )}
              </Box>
            </div>
            <div>
              {/* Button to extend the end date of the caretaker, if the end date has passed */}
              {caretakerData?.caretaker_object?.end_date && (
                <>
                  <ExtendCaretakerModal
                    isOpen={extendModalIsOpen}
                    onClose={onExtendModalClose}
                    refetch={refetchCaretakerData}
                    caretakerObject={caretakerData?.caretaker_object}
                  />
                  <Button
                    isDisabled={checkIfDateExpired(
                      caretakerData?.caretaker_object?.end_date,
                    )}
                    color={"white"}
                    background={
                      colorMode === "light" ? "green.500" : "green.600"
                    }
                    _hover={{
                      background:
                        colorMode === "light" ? "green.400" : "green.500",
                    }}
                    // isLoading={removeCaretakerMutation.isPending}
                    ml={3}
                    onClick={() => {
                      onOpenExtendModal();
                    }}
                  >
                    Extend
                  </Button>
                </>
              )}

              {/* Button to remove the caretaker completely */}
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                // isLoading={removeCaretakerMutation.isPending}
                ml={3}
                onClick={() => {
                  onOpenRemoveModal();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  ) : null;
};
export default CaretakerModePage;
