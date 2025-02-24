import { IUpdatePublicEmail, updatePublicEmail } from "@/lib/api";
import { IUserMe } from "@/types";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  ToastId,
  Tooltip,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { IoIosSave } from "react-icons/io";

const PublicEmailSection = ({ me }: { me: IUserMe }) => {
  const { colorMode } = useColorMode();

  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const {
    register: updatePublicEmailRegister,
    handleSubmit: handleUpdatePublicEmailSubmit,
    watch: watchUpdatePublicEmail,
    formState: { isValid },
  } = useForm<IUpdatePublicEmail>({
    mode: "onChange", // Validate on change
    defaultValues: {
      public_email: "",
    },
  });

  const beginUpdatePublicEmail = (formData: IUpdatePublicEmail) => {
    console.log(formData);
    updatePublicEmailMutation.mutate(formData);
  };

  const updatePublicEmailMutation = useMutation({
    mutationFn: updatePublicEmail,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Email",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Email Updated Successfully`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["publicStaffEmail", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update Email",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <Flex
      w={"100%"}
      mb={8}
      className="flex-grow"
      as="form"
      id="update-public-email-form"
      onSubmit={handleUpdatePublicEmailSubmit(beginUpdatePublicEmail)}
    >
      <FormControl>
        <FormLabel>Public Email</FormLabel>
        <InputGroup className="-mt-3 items-center">
          <Input
            w={"100%"}
            autoComplete="off"
            type="hidden"
            {...updatePublicEmailRegister("staff_profile_pk", {
              required: true,
              value: me?.staff_profile_pk,
            })}
          />
          <Input
            placeholder={me?.public_email ?? me?.email ?? ""}
            w={"100%"}
            autoComplete="off"
            type="email"
            {...updatePublicEmailRegister("public_email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Basic email regex
                message: "Invalid email address",
              },
            })}
          />
          <Flex
            justifyContent={{ base: "end" }}
            alignItems={"center"}
            w={"100%"}
            py={4}
            flex={0}
            ml={4}
          >
            <Tooltip
              label="Update the address for receiving public emails"
              aria-label="A tooltip"
            >
              <Button
                bg={colorMode === "light" ? "green.500" : "green.500"}
                _hover={{
                  bg: colorMode === "light" ? "green.500" : "green.500",
                }}
                color={"white"}
                leftIcon={<IoIosSave />}
                // onClick={() => {}}
                loadingText={"Updating..."}
                isDisabled={updatePublicEmailMutation.isPending || !isValid}
                type="submit"
                form="update-public-email-form"
                isLoading={updatePublicEmailMutation.isPending}
              >
                Update Public Email
              </Button>
            </Tooltip>
          </Flex>
        </InputGroup>
        <FormHelperText
          className="-mt-1"
          color={colorMode === "light" ? "gray.500" : "gray.500"}
          fontSize={"sm"}
        >
          The email address used for receiving emails from the public. By
          default your DBCA email address is used.
        </FormHelperText>
      </FormControl>
    </Flex>
  );
};

export default PublicEmailSection;
