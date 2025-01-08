import { createReport } from "@/lib/api/api";
import { IReportCreation } from "@/types";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddReportModal = ({ isOpen, onClose }: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, watch, reset } = useForm<IReportCreation>();
  const toast = useToast();

  const [thisYear, setThisYear] = useState(new Date().getFullYear());

  const yearData = watch("year");

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["latestReport"] });
      reset();
      onClose();
    },
    onError: (e: AxiosError) => {
      let errorDescription = "";

      // Check if e.response.data is an object
      if (typeof e.response.data === "object" && e.response.data !== null) {
        // Iterate over the properties of the object
        Object.keys(e.response.data).forEach((key) => {
          // Assert the type of e.response.data[key] as string
          errorDescription += `${key}: ${String(e.response.data[key])}\n`;
        });
      } else {
        // If not an object, use the original data
        errorDescription = String(e.response.data);
      }

      console.log("error");
      toast({
        status: "error",
        title: "Failed",
        description: `${errorDescription}`,
        position: "top-right",
      });
    },
    onMutate: () => {
      console.log("mutation");
    },
  });

  const onSubmit = (formData: IReportCreation) => {
    console.log(formData);
    mutation.mutate(formData);
  };

  return thisYear ? (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Create Annual Report Info</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={10}>
            <FormControl isRequired>
              <FormLabel>Year</FormLabel>
              <InputGroup>
                <Input
                  autoFocus
                  autoComplete="off"
                  defaultValue={thisYear}
                  onChange={(e) => setThisYear(Number(e.target.value))}
                  {...register("year", { required: true, value: thisYear })}
                  required
                  type="number"
                />
              </InputGroup>
              <FormHelperText>
                The year for the report. e.g. Type 2023 for financial year
                2022-23.
              </FormHelperText>
            </FormControl>

            {mutation.isError ? (
              <Box mt={4}>
                {Object.keys((mutation.error as AxiosError).response.data).map(
                  (key) => (
                    <Box key={key}>
                      {(
                        (mutation.error as AxiosError).response.data[
                          key
                        ] as string[]
                      ).map((errorMessage, index) => (
                        <Text key={`${key}-${index}`} color="red.500">
                          {`${key}: ${errorMessage}`}
                        </Text>
                      ))}
                    </Box>
                  ),
                )}
              </Box>
            ) : null}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Grid gridTemplateColumns={"repeat(2, 1fr)"}>
            <Button
              // variant="ghost"
              mr={3}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              // form="add-form"
              // type="submit"
              isLoading={mutation.isPending}
              color={"white"}
              background={colorMode === "light" ? "blue.500" : "blue.600"}
              _hover={{
                background: colorMode === "light" ? "blue.400" : "blue.500",
              }}
              // size="lg"
              width={"100%"}
              onClick={() => {
                onSubmit({
                  old_id: 1,
                  year: yearData,
                  //   date_open: new Date,
                  //   date_closed: endDate,
                  dm: "<p></p>",
                  publications: "<p></p>",
                  research_intro: "<p></p>",
                  service_delivery_intro: "<p></p>",
                  student_intro: "<p></p>",
                  seek_update: false,
                });
              }}
              isDisabled={!yearData}
            >
              Create
            </Button>
          </Grid>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ) : null;
};
