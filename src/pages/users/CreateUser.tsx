// Component/Route for handling user creation and the accomponying validation

import { TypewriterText } from "@/shared/components/Animations/TypewriterText";
import { Head } from "@/shared/components/layout/base/Head";
import { AffiliationSearchDropdown } from "@/features/admin/components/AffiliationSearchDropdown";
import {
  type UserData,
  createUser,
  getDoesUserWithEmailExist,
  getDoesUserWithFullNameExist,
} from "@/features/users/services/users.service";
import { type IAffiliation } from "@/shared/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GrMail } from "react-icons/gr";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/shared/utils";
import { toast } from "sonner";

// interface UserData {
// 	username: string;
// 	firstName: string;
// 	lastName: string;
// 	email: string;
// }

const capitalizeAfterSpaceOrHyphen = (name: string) => {
  return name.replace(/(?:^|\s|-)(\w)/g, function (match) {
    return match.toUpperCase();
  });
};

interface IProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CreateUser = ({ onSuccess, isModal, onClose }: IProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  // Tracking input fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  // Validation states for conditionally rendering messages
  const [emailsMatch, setEmailsMatch] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isFirstNameValid, setIsFirstNameValid] = useState(false);
  const [isLastNameValid, setIsLastNameValid] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const location = useLocation();
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  useEffect(() => {
    if (
      isFirstNameValid &&
      isLastNameValid &&
      !lastNameError &&
      !firstNameError
    ) {
      setIsCheckingName(true);

      const debounceTimer = setTimeout(() => {
        delayedNameCheck(firstName, lastName);
      }, 500);

      return () => {
        clearTimeout(debounceTimer);
      };
    } else {
      setIsCheckingName(false);
      setNameExists(false);
    }
  }, [firstName, lastName, isFirstNameValid, isLastNameValid]);

  const handleFirstNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFirstName = event.target.value;
    const isAlphabetic = /^[A-Za-z\- ]+$/.test(newFirstName);
    setFirstName(newFirstName);
    setIsFirstNameValid(newFirstName.length >= 2 && isAlphabetic);

    if (newFirstName.length > 14) {
      setFirstNameError("First name is too long");
    } else if (!isAlphabetic) {
      setFirstNameError("First name should only contain alphabetic characters");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLastName = event.target.value;
    const isAlphabetic = /^[A-Za-z\- ]+$/.test(newLastName);
    setLastName(newLastName);
    setIsLastNameValid(newLastName.length >= 2 && isAlphabetic);

    if (newLastName.length > 14) {
      setLastNameError("Last name is too long");
    } else if (!isAlphabetic) {
      setLastNameError("Last name should only contain alphabetic characters");
    } else {
      setLastNameError("");
    }
  };

  const delayedNameCheck = async (firstName: string, lastName: string) => {
    try {
      const doesNameExist = await getDoesUserWithFullNameExist({
        firstName,
        lastName,
      });
      setNameExists(doesNameExist);
    } catch (error) {
      console.error("Error checking name:", error);
    } finally {
      setIsCheckingName(false);
    }
  };

  useEffect(() => {
    if (email.length >= 2 && emailsMatch && isValidEmail) {
      setIsCheckingEmail(true);

      const debounceTimer = setTimeout(() => {
        delayedEmailCheck(email);
      }, 500);

      return () => {
        clearTimeout(debounceTimer);
      };
    } else {
      setIsCheckingEmail(false);
      setEmailExists(false);
    }
  }, [email, emailsMatch]);

  const delayedEmailCheck = async (email: string) => {
    setIsCheckingEmail(true);
    const doesEmailExist = await getDoesUserWithEmailExist(email);
    setIsCheckingEmail(false);
    setEmailExists(doesEmailExist);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setEmailsMatch(newEmail === confirmEmail);
    setEmailExists(false);
    setIsValidEmail(validateEmail(newEmail));
  };

  const validateEmail = (email: string) => {
    // Simple email validation regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailGood = emailRegex.test(email);
    if (emailGood && email.endsWith("@dbca.wa.gov.au")) {
      return false;
    }
    return emailRegex.test(email);
  };

  const handleConfirmEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newConfirmEmail = event.target.value;
    setConfirmEmail(newConfirmEmail);
    setEmailsMatch(newConfirmEmail === email);
    setEmailExists(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.length >= 5 && isValidEmail && emailsMatch) {
      setIsCheckingEmail(true);
      try {
        const doesEmailExist = await getDoesUserWithEmailExist(email);
        setIsCheckingEmail(false);
        setEmailExists(doesEmailExist);
        if (!doesEmailExist) {
          const currentYear = new Date().getFullYear();
          const generatedUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}${currentYear}`;
          const capitalisedFirstName = capitalizeAfterSpaceOrHyphen(
            firstName.charAt(0).toUpperCase() + firstName.slice(1),
          );
          const capitalisedLastName = capitalizeAfterSpaceOrHyphen(
            lastName.charAt(0).toUpperCase() + lastName.slice(1),
          );

          const userData: UserData = {
            username: generatedUsername,
            firstName: capitalisedFirstName,
            lastName: capitalisedLastName,
            affiliation: selectedAffiliation?.pk ?? null,
            email,
          };
          await createUser(userData);

          toast.success("User Created", {
            description: "The user has been successfully created.",
          });
          if (onSuccess) {
            onSuccess();
            if (isModal) {
              onClose?.();
            }
          }
          if (location.pathname === "/users") {
            window.location.reload(); // Manually trigger a reload if already on the /users route - potentially change to be less jarring
          } else {
            navigate("/users");
          }
        }
      } catch (error) {
        console.error("Error checking email:", error);
        setIsCheckingEmail(false);
        toast.error("Error", {
          description: "An error occurred while creating the user.",
        });
      }
    }
  };

  const [selectedAffiliation, setSelectedAffiliation] =
    useState<IAffiliation>();

  return (
    <>
      <Head title={"Add User"} />
      <div>
        <h1 className="mb-8 font-bold text-2xl">
          Add External User
        </h1>
      </div>

      {!isModal && (
        <div
          className={cn(
            "rounded-md flex-col p-6 relative mt-5 mb-7 select-none",
            isDark ? "bg-gray-700 text-white/80" : "bg-gray-100 text-black/80"
          )}
        >
          <TypewriterText>
            <p>
              This is for adding external users only. If you are trying to add a
              DBCA staff member, please send them a link to this website and an
              account will be created when they visit. All existing users can be
              found on the users page.
            </p>
            {location.pathname !== "/users" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1.5,
                  duration: 0.1,
                }}
                style={{ display: "inline", marginLeft: "0.2em" }}
              >
                <Button
                  variant={"link"}
                  className={cn(
                    "cursor-pointer p-0 h-auto",
                    isDark ? "text-blue-300" : "text-blue-500"
                  )}
                  onClick={() => {
                    navigate(`/users`);
                  }}
                >{`${VITE_PRODUCTION_BASE_URL}users`}</Button>
              </motion.span>
            )}
          </TypewriterText>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-8">
          {/* First Name */}
          <div className="my-2 mb-4">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isCheckingName ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-500"></div>
                ) : (
                  <RiNumber1 className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Input
                id="firstName"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
                maxLength={30}
                className="pl-10"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="my-2 mb-4">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isCheckingName ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-500"></div>
                ) : (
                  <RiNumber2 className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Input
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={handleLastNameChange}
                maxLength={30}
                className="pl-10"
              />
            </div>
            {isCheckingName && (
              <p className="text-sm text-blue-500 mt-1">Checking name...</p>
            )}
            {nameExists && (
              <p className="text-sm text-orange-500 mt-1">
                Warning: User with this name already exists.
              </p>
            )}
            {firstNameError && (
              <p className="text-sm text-red-500 mt-1">{firstNameError}</p>
            )}
            {lastNameError && (
              <p className="text-sm text-red-500 mt-1">{lastNameError}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-2 gap-8">
          <div className="my-2 mb-4">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-500"></div>
                ) : (
                  <GrMail className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                maxLength={50}
                className="pl-10"
              />
            </div>
          </div>

          <div className="my-2 mb-4">
            <Label htmlFor="confirmEmail">Email Confirmation *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <GrMail className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="Confirm Email"
                value={confirmEmail}
                onChange={handleConfirmEmailChange}
                maxLength={50}
                className="pl-10"
              />
            </div>
            {email.length > 0 && email.length < 5 && (
              <p className="text-sm text-red-500 mt-1">
                Email must be at least 5 characters long.
              </p>
            )}
            {email.length >= 5 && !isValidEmail && (
              <p className="text-sm text-red-500 mt-1">
                {email.endsWith("@dbca.wa.gov.au")
                  ? "'@dbca.wa.gov.au' addresses are not valid for adding external users. Please enter a valid external email address."
                  : "Please enter a valid email address."}
              </p>
            )}
            {email.length >= 5 && isValidEmail && !emailsMatch && (
              <p className="text-sm text-red-500 mt-1">
                Email and Confirm Email must match.
              </p>
            )}
            {isCheckingEmail && (
              <p className="text-sm text-blue-500 mt-1">
                Checking email...
              </p>
            )}
            {emailExists && (
              <p className="text-sm text-red-500 mt-1">
                User with this email already exists.
              </p>
            )}
            {!emailExists &&
              email.length >= 5 &&
              isValidEmail &&
              emailsMatch &&
              firstName.length > 1 &&
              lastName.length > 1 && (
                <p className="text-sm text-green-500 mt-1">
                  All fields complete. Press Add User.
                </p>
              )}
          </div>
        </div>

        <AffiliationSearchDropdown
          isRequired={false}
          setterFunction={setSelectedAffiliation}
          label={"Affiliation (Optional)"}
          placeholder={"Set an affiliation (optional)"}
          helperText={""}
        />

        {isModal && (
          <div
            className={cn(
              "rounded-md flex-col p-6 relative mt-5 mb-7 select-none",
              isDark ? "bg-gray-700 text-white/80" : "bg-gray-100 text-black/80"
            )}
          >
            <TypewriterText>
              <p>
                This is for adding external users only. If you are trying to add
                a DBCA staff member, please send them a link to this website and
                an account will be created when they visit. All existing users
                can be found on the users page.
              </p>
              {location.pathname !== "/users" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 1.5,
                    duration: 0.1,
                  }}
                  style={{ display: "inline", marginLeft: "0.2em" }}
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      "cursor-pointer p-0 h-auto",
                      isDark ? "text-blue-300" : "text-blue-500"
                    )}
                    onClick={() => {
                      navigate(`/users`);
                    }}
                  >{`${VITE_PRODUCTION_BASE_URL}users`}</Button>
                </motion.span>
              )}
            </TypewriterText>
          </div>
        )}

        <div className="flex mt-5 justify-end">
          <Button
            type="submit"
            className={cn(
              "ml-3 text-white",
              isDark 
                ? "bg-green-600 hover:bg-green-400" 
                : "bg-green-500 hover:bg-green-600"
            )}
            disabled={
              isCheckingEmail ||
              isCheckingName ||
              !isValidEmail ||
              !firstName ||
              !lastName ||
              !email ||
              !emailsMatch ||
              emailExists
            }
          >
            Add User
          </Button>
        </div>
      </form>
    </>
  );
};
