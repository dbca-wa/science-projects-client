// Route to handle Login of user - now working with 

import { Box, Button, Center, Input, InputGroup, InputLeftElement, VStack, useToast, ToastId } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { useRef } from "react";
import { FaLock, FaUser } from "react-icons/fa"
import {
    IUsernameLoginError, IUsernameLoginSuccess, IUsernameLoginVariables, logInOrdinary
} from "../lib/api";
import { useForm, } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ILoginData>();

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();

    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const mutation = useMutation<
        IUsernameLoginSuccess, IUsernameLoginError, IUsernameLoginVariables>
        (
            // getJWT, 
            logInOrdinary,
            {
                onMutate: () => {
                    // console.log("Mutation starting")
                    addToast({
                        title: 'Logging in...',
                        description: "One moment!",
                        status: 'loading',
                        position: "bottom-right",
                        duration: 3000
                    }
                    );
                },
                onSuccess: async (data) => {
                    // Refetch user data after a successful login
                    queryClient.invalidateQueries(['me']);
                    queryClient.refetchQueries(['me']);

                    // Show the toast
                    if (toastIdRef.current) {
                        toast.update(toastIdRef.current, {
                            title: 'Logged in',
                            description: "Welcome back!",
                            status: 'success',
                            position: "bottom-right",
                            duration: 1000
                        })
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
                            title: 'Login failed',
                            description: error.message,
                            status: 'error',
                            position: "bottom-right",
                            duration: 3000
                        })
                    }
                    console.log("mut error")

                    console.log(error)
                },
            }
        );


    const onSubmit = ({ username, password }: IUsernameLoginVariables) => {
        mutation.mutate(
            { username, password }
        );
    }

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
                                    <InputLeftElement children={
                                        <Box color="gray.400">
                                            <FaUser />
                                        </Box>
                                    } />

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
                                    <InputLeftElement children={
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
                                colorScheme={"blue"}
                                type='submit'
                                isLoading={mutation.isLoading}
                            >
                                Login
                            </Button>
                        </VStack>

                    </Box>
                </Center>
            </motion.div>

        </AnimatePresence>

    )
}