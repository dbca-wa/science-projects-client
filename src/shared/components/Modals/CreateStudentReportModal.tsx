// Modal for handling creation of student reports

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
import { useGetStudentReportAvailableReportYears } from "@/shared/hooks/tanstack/useGetStudentReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentKind: "studentreport";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStudentReportModal = ({
  projectPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
}: Props) => {
  const {
    availableStudentYearsLoading,
    availableStudentYearsData,
    refetchStudentYears,
  } = useGetStudentReportAvailableReportYears(Number(projectPk));

  const { register, handleSubmit, reset, watch } = useForm<ISpawnDocument>();

  const yearValue = watch("year");

  const projPk = watch("projectPk");

  const [selectedReportId, setSelectedReportId] = useState<number>();
  const reportValue = watch("report_id");

  useEffect(() => {
    if (
      !availableStudentYearsLoading &&
      availableStudentYearsData &&
      yearValue
    ) {
      const obj = availableStudentYearsData.find(
        (item) => Number(item.year) === Number(yearValue),
      );
      setSelectedReportId(obj.pk);
    }
  }, [
    yearValue,
    reportValue,
    availableStudentYearsData,
    availableStudentYearsLoading,
  ]);

  useEffect(() => {
    refetchStudentYears();
  }, [selectedReportId]);

  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const createStudentReportMutation = useMutation({
    mutationFn: spawnNewEmptyDocument,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Creating Student Report`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Student Report Created`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        refetchStudentYears(() => {
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
          title: `Could not create student report`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const createStudentReportFunc = (formData: ISpawnDocument) => {
    const newFormData = {
      report_id: selectedReportId,
      year: formData.year,
      kind: formData.kind,
      projectPk: formData.projectPk,
    };

    createStudentReportMutation.mutate(newFormData);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(createStudentReportFunc)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Create Student Report?</ModalHeader>
          <ModalCloseButton />
          {!availableStudentYearsLoading ? (
            <>
              <ModalBody>
                {availableStudentYearsData.length < 1 ? (
                  <Box mt={6}>
                    <Text>
                      A student report cannot be created for this project as it
                      already has reports for each available year
                      {/* since its creation - potentially adjust hook and api to only get available reports since its creation*/}
                    </Text>
                  </Box>
                ) : (
                  <>
                    <Center mt={8}>
                      <UnorderedList>
                        <ListItem>
                          This will create a student report for the selected
                          year.
                        </ListItem>
                        <ListItem>
                          Years will only appear based on whether an annual
                          report exists for that year
                        </ListItem>
                        <ListItem>
                          Years which already have student reports for this
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
                        {availableStudentYearsData
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
                {availableStudentYearsData.length >= 1 && (
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
                      isLoading={createStudentReportMutation.isPending}
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
