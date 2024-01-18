import {
  Text,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  Flex,
  FormControl,
  Input,
  InputGroup,
  VStack,
  useDisclosure,
  Center,
  Spinner,
  Grid,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  FormLabel,
  useToast,
  FormHelperText,
  Switch,
  useColorMode,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createReport, getAllReports } from "../../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { IReport, IReportCreation } from "../../../types";
import { ReportItemDisplay } from "./ReportItemDisplay";
import { AxiosError } from "axios";
import { StartAndEndDateSelector } from "../CreateProject/StartAndEndDateSelector";

export const ReportsCRUD = () => {
  const { register, watch } = useForm<IReportCreation>();

  const yearData = watch("year");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const seekUpdateValue = watch("seek_update");

  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const mutation = useMutation(createReport, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      onAddClose();
      queryClient.invalidateQueries(["reports"]);
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
  const { isLoading, data: slices } = useQuery<IReport[]>({
    queryFn: getAllReports,
    queryKey: ["reports"],
  });

  const [countOfItems, setCountOfItems] = useState(0);

  useEffect(() => {
    if (slices) {
      setCountOfItems(slices.length);
    }
  }, [slices]);

  const { colorMode } = useColorMode();

  return (
    <>
      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"} w={"100%"}>
            <Flex width={"100%"} mt={4} justifyContent={"space-between"}>
              <Box alignItems={"center"} display={"flex"} flex={1} ml={1}>
                <Text fontWeight={"semibold"} fontSize={"lg"}>
                  Reports ({countOfItems})
                </Text>
              </Box>
              <Flex>
                <Button
                  onClick={onAddOpen}
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                >
                  Add
                </Button>
              </Flex>
            </Flex>
            <Grid
              gridTemplateColumns="1fr 2fr 2fr 3fr 3fr 1fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={slices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Year</Text>
              </Flex>
              <Flex>
                <Text as="b">Open Date</Text>
              </Flex>
              <Flex>
                <Text as="b">Closing Date</Text>
              </Flex>
              <Flex>
                <Text as="b">Creator</Text>
              </Flex>
              <Flex>
                <Text as="b">Modifier</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>
            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {slices &&
                slices
                  .sort((a, b) => b.year - a.year) // Sort in descending order based on the year
                  .map((s) => (
                    <ReportItemDisplay
                      key={s.pk}
                      pk={s.pk}
                      year={s.year}
                      date_open={s.date_open}
                      date_closed={s.date_closed}
                      created_at={s.created_at}
                      updated_at={s.updated_at}
                      creator={s.creator}
                      modifier={s.modifier}
                      dm={s.dm}
                      publications={s.publications}
                      research_intro={s.research_intro}
                      service_delivery_intro={s.service_delivery_intro}
                      student_intro={s.student_intro}
                    />
                  ))}
            </Grid>
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Report</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={10}
                // as="form" id="add-form" onSubmit={handleSubmit(onSubmit)}
                >
                  <FormControl isRequired>
                    <FormLabel>Year</FormLabel>
                    <InputGroup>
                      <Input
                        autoFocus
                        autoComplete="off"
                        {...register("year", { required: true })}
                        defaultValue={new Date().getFullYear()}
                        required
                        type="number"
                      />
                    </InputGroup>
                    <FormHelperText>
                      The year for the report. For example, if for FY 2022-2023,
                      type 2023.
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <StartAndEndDateSelector
                      startDate={startDate}
                      endDate={endDate}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                      helperText="Select the period in which entries for this annual report are allowed."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      Do you want to seek updates on projects now?
                    </FormLabel>

                    <Switch
                      defaultChecked={false}
                      {...register("seek_update")}
                    />
                    <FormHelperText
                      color={colorMode === "light" ? "red.700" : "red.500"}
                    >
                      This will set eligible projects to updating, create a
                      progress/student report for this report, and send an email
                      to users letting them know that an update is required.
                      Note: This is not recommended on creation. Instead, it is
                      suggested that a report is created without this on, and
                      the 'Seek Update' button (available on edit) is pressed
                      when the report is ready for submissions.
                    </FormHelperText>
                  </FormControl>

                  {mutation.isError ? (
                    <Box mt={4}>
                      {Object.keys(
                        (mutation.error as AxiosError).response.data
                      ).map((key) => (
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
                      ))}
                    </Box>
                  ) : null}
                </VStack>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  // form="add-form"
                  // type="submit"
                  isLoading={mutation.isLoading}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  size="lg"
                  width={"100%"}
                  isDisabled={
                    startDate === undefined ||
                    endDate === undefined ||
                    startDate > endDate
                  }
                  onClick={() => {
                    onSubmit({
                      old_id: 1,
                      year: yearData,
                      date_open: startDate,
                      date_closed: endDate,
                      dm: "<p></p>",
                      publications: "<p></p>",
                      research_intro: "<p></p>",
                      service_delivery_intro: "<p></p>",
                      student_intro: "<p></p>",
                      seek_update: seekUpdateValue,
                    });
                  }}
                >
                  Create
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
};
