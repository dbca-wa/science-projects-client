import { type IUpdateCustomTitle, updateCustomTitle } from "@/features/users/services/users.service";
import type { IUserMe } from "@/shared/types";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  type ToastId,
  Tooltip,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosSave } from "react-icons/io";
import { Switch } from "@chakra-ui/react";

const CustomTitleSection = ({ me }: { me: IUserMe }) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const [isEnabled, setIsEnabled] = useState(me?.custom_title_on || false);

  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<IUpdateCustomTitle>({
    mode: "onChange",
    defaultValues: {
      custom_title: me?.custom_title || "",
      custom_title_on: me?.custom_title_on,
      staff_profile_pk: me?.staff_profile_pk,
    },
  });

  const updateCustomTitleMutation = useMutation({
    mutationFn: updateCustomTitle,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Title",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: "Title Updated Successfully",
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["customTitle", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Could Not Update Title",
          description: error?.response?.data
            ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
            : "An error occurred while updating the title",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const toggleTitleMutation = useMutation({
    mutationFn: updateCustomTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customTitle", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      setIsEnabled(!isEnabled); // Revert toggle on error
      toast({
        title: "Could Not Update Title Status",
        description: error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "An error occurred while updating the title status",
        status: "error",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    toggleTitleMutation.mutate({
      custom_title: me?.custom_title || "",
      custom_title_on: checked,
      staff_profile_pk: me?.staff_profile_pk,
    });
  };

  const onSubmit = (formData: IUpdateCustomTitle) => {
    updateCustomTitleMutation.mutate({
      ...formData,
      custom_title_on: isEnabled,
    });
  };

  return (
    <Flex
      w="100%"
      className="grow flex-col gap-4"
      as="form"
      id="update-custom-title-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl>
        <Flex className="mb-2 w-full items-center justify-between gap-4">
          <FormLabel htmlFor="custom-title-input">
            Custom Position Title
          </FormLabel>
          <div className="flex items-center gap-2">
            <Switch
              //   checked={isEnabled}
              //   onCheckedChange={handleToggle}
              //   disabled={toggleTitleMutation.isPending}
              isChecked={isEnabled}
              onChange={(e) => handleToggle(e.target.checked)}
              isDisabled={toggleTitleMutation.isPending}
              disabled={toggleTitleMutation.isPending}
            />
            <FormLabel htmlFor="custom-title-toggle" className="mb-0">
              {isEnabled ? "Custom Title Enabled" : "Enable Custom Title"}
            </FormLabel>
          </div>
        </Flex>

        <InputGroup className="items-center">
          <Input
            id="custom-title-input"
            placeholder={me?.custom_title || "Enter custom title"}
            w="100%"
            autoComplete="off"
            type="text"
            isDisabled={!isEnabled}
            {...register("custom_title", {
              required: "Custom Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters long",
              },
              pattern: {
                value: /^(?=.*[a-zA-Z])[a-zA-Z\s]+$/,
                message: "Only letters and spaces are allowed",
              },
              maxLength: {
                value: 50,
                message: "Title cannot exceed 50 characters",
              },
            })}
            aria-describedby="custom-title-helper-text"
          />
          <Flex className="ml-4">
            <Tooltip
              label="Update how your title appears to the public"
              aria-label="Title update button tooltip"
            >
              <Button
                bg={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  bg: colorMode === "light" ? "green.600" : "green.700",
                }}
                color="white"
                leftIcon={<IoIosSave />}
                loadingText="Updating..."
                isDisabled={
                  updateCustomTitleMutation.isPending || !isValid || !isEnabled
                }
                type="submit"
                form="update-custom-title-form"
                isLoading={updateCustomTitleMutation.isPending}
              >
                Update Custom Title
              </Button>
            </Tooltip>
          </Flex>
        </InputGroup>
        <FormHelperText
          id="custom-title-helper-text"
          color={colorMode === "light" ? "gray.500" : "gray.500"}
          fontSize="sm"
        >
          A custom title displayed to the public. Enable this to overwrite the
          HR system title. Only letters and spaces are allowed. Alternatively,{" "}
          <a
            href="mailto:Establishment@dbca.wa.gov.au?subject=Update%20My%20Details"
            style={{ textDecoration: "underline" }}
            className="text-blue-500"
          >
            contact HR
          </a>{" "}
          to update your HR details (recommended). This process may take some
          time.
        </FormHelperText>
      </FormControl>
    </Flex>
  );
};

export default CustomTitleSection;
