// Modal for creating progress reports

import {
  Text,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  type ToastId,
  useToast,
  useColorMode,
  UnorderedList,
  ListItem,
  FormControl,
  InputGroup,
  Input,
  ModalFooter,
  Grid,
  Button,
  Select,
  FormHelperText,
  Spinner,
  Box,
  type UseToastOptions,
} from "@chakra-ui/react";
import { type ISpawnDocument, spawnNewEmptyDocument } from "@/shared/lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useGetProgressReportAvailableReportYears } from "@/shared/hooks/tanstack/useGetProgressReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentKind: "progressreport";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProgressReportModal = ({
  projectPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
}: Props) => {
  const {
    availableProgressReportYearsLoading,
    availableProgressReportYearsData,
    refetchProgressYears,
  } = useGetProgressReportAvailableReportYears(Number(projectPk));

  const { register, handleSubmit, reset, watch } = useForm<ISpawnDocument>();

  const yearValue = watch("year");
  const projPk = watch("projectPk");

  const [selectedReportId, setSelectedReportId] = useState<number>();
  const reportValue = watch("report_id");

  useEffect(() => {
    if (
      !availableProgressReportYearsLoading &&
      availableProgressReportYearsData &&
      yearValue
    ) {
      const obj = availableProgressReportYearsData.find(
        (item) => Number(item.year) === Number(yearValue),
      );
      setSelectedReportId(obj.pk);
    }
  }, [
    yearValue,
    reportValue,
    availableProgressReportYearsData,
    availableProgressReportYearsLoading,
  ]);

  useEffect(() => {
    refetchProgressYears();
  }, [selectedReportId]);

  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const createProgressReportMutation = useMutation({
    mutationFn: spawnNewEmptyDocument,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Creating Progress Report`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Progress Report Created`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        refetchProgressYears(() => {
          reset();
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: `Could not create progress report`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const createProgressReportFunc = (formData: ISpawnDocument) => {
    const newFormData = {
      report_id: selectedReportId,
      year: formData.year,
      kind: formData.kind,
      projectPk: formData.projectPk,
    };

    console.log(newFormData);

    createProgressReportMutation.mutate(newFormData);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(createProgressReportFunc)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Create Progress Report?</ModalHeader>
          <ModalCloseButton />
          {!availableProgressReportYearsLoading ? (
            <>
              <ModalBody>
                {availableProgressReportYearsData.length < 1 ? (
                  <Box mt={6}>
                    <Text>
                      A progress report cannot be created for this project as it
                      already has reports for each available year. Please either
                      create a new annual report for the year you wish to create
                      a progress report or delete the current one occupying the
                      year you wish to create for.
                    </Text>
                    <Text mt={8} color={"red.500"}>
                      Note: Creating a new progress report will send out updates
                      and spawn progress/student reports for the year
                      automatically.
                    </Text>
                  </Box>
                ) : (
                  <>
                    <Center mt={8}>
                      <UnorderedList>
                        <ListItem>
                          This will create a progress report for the selected
                          year.
                        </ListItem>
                        <ListItem>
                          Years will only appear based on whether an annual
                          report exists for that year
                        </ListItem>
                        <ListItem>
                          Years which already have progress reports for this
                          project will not be selectable
                        </ListItem>
                      </UnorderedList>
                    </Center>
                    <FormControl>
                      <InputGroup>
                        <Input
                          type="hidden"
                          {...register("projectPk", {
                            required: true,
                            value: Number(projectPk),
                          })}
                          readOnly
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl mt={6}>
                      <Select
                        placeholder={"Select a report year"}
                        {...register("year", { required: true })}
                      >
                        {availableProgressReportYearsData
                          ?.sort((a, b) => b.year - a.year) // Sort years in descending order
                          .map((freeReportYear, index: number) => {
                            return (
                              <option key={index} value={freeReportYear.year}>
                                {`FY ${freeReportYear.year - 1} - ${String(
                                  freeReportYear.year,
                                ).slice(2)}`}
                              </option>
                            );
                          })}
                      </Select>
                      <FormHelperText>
                        Select an annual report for this progress report
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <InputGroup>
                        <Input
                          type="hidden"
                          {...register("kind", {
                            required: true,
                            value: documentKind,
                          })}
                          readOnly
                        />
                      </InputGroup>
                    </FormControl>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {availableProgressReportYearsData.length >= 1 && (
                  <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                    <Button colorScheme="gray" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      color={"white"}
                      background={
                        colorMode === "light" ? "green.500" : "green.600"
                      }
                      _hover={{
                        background:
                          colorMode === "light" ? "green.400" : "green.500",
                      }}
                      isLoading={createProgressReportMutation.isPending}
                      isDisabled={!yearValue || !selectedReportId || !projPk}
                      type="submit"
                      ml={3}
                    >
                      Create
                    </Button>
                  </Grid>
                )}
              </ModalFooter>
            </>
          ) : (
            <Spinner />
          )}
        </ModalContent>
      </Flex>
    </Modal>
  );
};
