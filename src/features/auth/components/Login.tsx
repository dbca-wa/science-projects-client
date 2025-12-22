// Route to handle Login of user - now working with

import { useUser } from "@/features/users/hooks/useUser";
import {
  logInOrdinary,
  type IUsernameLoginError,
  type IUsernameLoginSuccess,
  type IUsernameLoginVariables,
} from "@/features/auth/services/auth.service";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

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

  const toastIdRef = useRef<string | number | undefined>(undefined);

  const addToast = (title: string, description: string, type: 'loading' | 'success' | 'error') => {
    if (type === 'loading') {
      toastIdRef.current = toast.loading(title, { description });
    } else if (type === 'success') {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.success(title, { description });
    } else if (type === 'error') {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error(title, { description });
    }
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
        addToast("Logging in...", "One moment!", "loading");
      },
      onSuccess: async () => {
        // Refetch user data after a successful login
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.refetchQueries({ queryKey: ["me"] });

        // Show the toast
        addToast("Logged in", "Welcome back!", "success");

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
        addToast("Login failed", error.message, "error");
      },
    },
  );

  const onSubmit = ({ username, password }: IUsernameLoginVariables) => {
    mutation.mutate({ username, password });
  };

  const buildType = import.meta.env.MODE;

  const { userData, userLoading } = useUser();
  useEffect(() => {
    if (!userLoading && userData?.pk !== undefined) {
      // console.log(`User Present: `, userData)
      navigate("/");
      return;
    } else {
      // where user is loading and pk undefind
      if (!userLoading && userData?.pk === undefined) {
        if (buildType === "production") {
          console.log(
            `navigating to ${VITE_PRODUCTION_BASE_URL}sso/signedout?relogin`,
          );
          // window.location.href = `${VITE_PRODUCTION_BASE_URL}sso/signedout?relogin`;
          // window.location.reload();
        } else {
          // window.location.assign('https://login.microsoftonline.com/7b934664-cdcf-4e28-a3ee-1a5bcca0a1b6/oauth2/authorize?client_id=eb1cb17e-6c3f-4318-875d-a5e1ed733928&redirect_uri=https%3a%2f%2fdbcab2c.b2clogin.com%2fdbcab2c.onmicrosoft.com%2foauth2%2fauthresp&response_type=code&scope=openid+profile&response_mode=form_post&nonce=rE29cA2zb0Ll5nB0BSvZKg%3d%3d&state=StateProperties%3deyJTSUQiOiJ4LW1zLWNwaW0tcmM6NDgzM2E2YzEtZDg1OS00NGQyLWJkYTktZGNlOTZlZDhiODUzIiwiVElEIjoiYzAwNGYzYjMtNzc4YS00M2VkLWE2NjQtYzRiMjdmMDhkNjgwIiwiVE9JRCI6IjY5NzE2N2IyLTYzMTctNDJhZi1hMTRjLWM5NzA4NjlhNTAwNyJ9')
          console.log(
            `Would ordinarily navigate to ${VITE_PRODUCTION_BASE_URL}sso/signedout?relogin, but in dev mode`,
          );
        }
      }
    }
  }, [userLoading, userData, buildType]);

  const { theme } = useTheme();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 70, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-center min-h-screen w-full">
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
              <motion.div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <Input
                    className="pl-10 border border-gray-300"
                    placeholder="Username"
                    required
                    {...register("username", {
                      required: "Please provide a username",
                    })}
                  />
                </div>
              </motion.div>

              <motion.div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <Input
                    className="pl-10 border border-gray-300"
                    placeholder="Password"
                    required
                    type="password"
                    {...register("password", {
                      required: "Please provide a password",
                    })}
                  />
                </div>
              </motion.div>

              <Button
                className="w-full text-white bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
