// Route to handle Login of user - now working with

import {
  Box,
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  useToast,
  ToastId,
  useColorMode,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { FaLock, FaUser } from "react-icons/fa";
import {
  IUsernameLoginError,
  IUsernameLoginSuccess,
  IUsernameLoginVariables,
  logInOrdinary,
} from "../lib/api";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/hooks/tanstack/useUser";

interface ILoginData {
  username: string;
  password: string;
}

interface IIsModal {
  onClose?: () => void;
}

export const Login = ({ onClose }: IIsModal) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ILoginData>();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const mutation = useMutation<
    IUsernameLoginSuccess,
    IUsernameLoginError,
    IUsernameLoginVariables
  >(
    // getJWT,

    {
      mutationFn: logInOrdinary,
      onMutate: () => {
        // console.log("Mutation starting")
        addToast({
          title: "Logging in...",
          description: "One moment!",
          status: "loading",
          position: "bottom-right",
          duration: 3000,
        });
      },
      onSuccess: async () => {
        // Refetch user data after a successful login
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.refetchQueries({ queryKey: ["me"] });

        // Show the toast
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: "Logged in",
            description: "Welcome back!",
            status: "success",
            position: "bottom-right",
            duration: 1000,
          });
        }

        // Reset and close the modal
        reset();
        if (onClose) {
          onClose();
        }

        // Navigate to the home page after a delay - for tanstack to update queries
        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate("/dashboard");
      },

      onError: (error) => {
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: "Login failed",
            description: error.message,
            status: "error",
            position: "bottom-right",
            duration: 3000,
          });
        }
      },
    },
  );

  const onSubmit = ({ username, password }: IUsernameLoginVariables) => {
    mutation.mutate({ username, password });
  };

  const buildType = process.env.NODE_ENV;
  // useEffect(() => console.log(process.env.NODE_ENV))
  const { userData, userLoading } = useUser();
  useEffect(() => {
    if (!userLoading) {
      // User exists
      if (userData?.pk !== undefined) {
        // console.log(`User Present: `, userData)
        navigate("/");
        // return;
      }
      // No user
      else {
        if (buildType === "production") {
          console.log("test");
          console.log(userData);

          // console.log(`navigating to ${VITE_PRODUCTION_BACKEND_BASE_URL}/sso/signedout`)
          // window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}/sso/signedout`;
          // window.location.reload()
        } else {
          // window.location.assign('https://login.microsoftonline.com/7b934664-cdcf-4e28-a3ee-1a5bcca0a1b6/oauth2/authorize?client_id=eb1cb17e-6c3f-4318-875d-a5e1ed733928&redirect_uri=https%3a%2f%2fdbcab2c.b2clogin.com%2fdbcab2c.onmicrosoft.com%2foauth2%2fauthresp&response_type=code&scope=openid+profile&response_mode=form_post&nonce=rE29cA2zb0Ll5nB0BSvZKg%3d%3d&state=StateProperties%3deyJTSUQiOiJ4LW1zLWNwaW0tcmM6NDgzM2E2YzEtZDg1OS00NGQyLWJkYTktZGNlOTZlZDhiODUzIiwiVElEIjoiYzAwNGYzYjMtNzc4YS00M2VkLWE2NjQtYzRiMjdmMDhkNjgwIiwiVE9JRCI6IjY5NzE2N2IyLTYzMTctNDJhZi1hMTRjLWM5NzA4NjlhNTAwNyJ9')
          console.log(`Would ordinarily navigate to auth but in test`);
        }
      }
    }
  }, [userLoading, userData, buildType]);

  const { colorMode } = useColorMode();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 70, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Center
          height={"100vh"}
          // height={"100%"}
          width="100%"
        >
          <Box>
            <VStack as={"form"} onSubmit={handleSubmit(onSubmit)}>
              <motion.div>
                <InputGroup>
                  <InputLeftElement
                    children={
                      <Box color="gray.400">
                        <FaUser />
                      </Box>
                    }
                  />

                  <Input
                    isInvalid={Boolean(errors.username?.message)}
                    variant={"filled"}
                    placeholder={"Username"}
                    required
                    {...register("username", {
                      required: "Please provide a username",
                    })}
                  />
                </InputGroup>
              </motion.div>

              <motion.div>
                <InputGroup>
                  <InputLeftElement
                    children={
                      <Box color="gray.400">
                        <FaLock />
                      </Box>
                    }
                  />
                  <Input
                    isInvalid={Boolean(errors.password?.message)}
                    variant={"filled"}
                    placeholder={"Password"}
                    required
                    type="password"
                    {...register("password", {
                      required: "Please provide a password",
                    })}
                  />
                </InputGroup>
              </motion.div>

              <Button
                width={"100%"}
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                type="submit"
                isLoading={mutation.isPending}
              >
                Login
              </Button>
            </VStack>
          </Box>
        </Center>
      </motion.div>
    </AnimatePresence>
  );
};
