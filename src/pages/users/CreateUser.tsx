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
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GrMail } from "react-icons/gr";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

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
  const { colorMode } = useColorMode();
  const toast = useToast();
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

          toast({
            position: "top-right",
            title: "User Created",
            description: "The user has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
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
        toast({
          position: "top-right",
          title: "Error",
          description: "An error occurred while creating the user.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const [selectedAffiliation, setSelectedAffiliation] =
    useState<IAffiliation>();

  return (
    <>
      <Head title={"Add User"} />
      <Box>
        <Text mb={8} fontWeight={"bold"} fontSize={"2xl"}>
          Add External User
        </Text>
      </Box>

      {!isModal && (
        <Box
          bgColor={colorMode === "light" ? "gray.100" : "gray.700"}
          rounded={6}
          flexDir={"column"}
          p={6}
          pos={"relative"}
          mt={5}
          mb={7}
          color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
          userSelect={"none"}
        >
          <TypewriterText>
            <Text>
              This is for adding external users only. If you are trying to add a
              DBCA staff member, please send them a link to this website and an
              account will be created when they visit. All existing users can be
              found on the users page.
            </Text>
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
                  color={colorMode === "light" ? "blue.500" : "blue.300"}
                  cursor={"pointer"}
                  onClick={() => {
                    navigate(`/users`);
                  }}
                >{`${VITE_PRODUCTION_BASE_URL}users`}</Button>
              </motion.span>
            )}
          </TypewriterText>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid gridColumnGap={8} gridTemplateColumns={"repeat(2, 1fr)"}>
          {/* First Name */}
          <FormControl isRequired my={2} mb={4}>
            <FormLabel>First Name</FormLabel>
            <InputGroup>
              <InputLeftElement>
                {isCheckingName ? (
                  <Spinner size="sm" color="gray.500" />
                ) : (
                  <Icon as={RiNumber1} />
                )}
              </InputLeftElement>
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
                maxLength={30}
              />
            </InputGroup>
          </FormControl>

          {/* Last Name */}
          <FormControl isRequired my={2} mb={4}>
            <FormLabel>Last Name</FormLabel>
            <InputGroup>
              <InputLeftElement>
                {isCheckingName ? (
                  <Spinner size="sm" color="gray.500" />
                ) : (
                  <Icon as={RiNumber2} />
                )}
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={handleLastNameChange}
                maxLength={30}
              />
            </InputGroup>
            {isCheckingName && (
              <FormHelperText color="blue.500">Checking name...</FormHelperText>
            )}
            {nameExists && (
              <FormHelperText color="orange.500">
                Warning: User with this name already exists.
              </FormHelperText>
            )}
            {firstNameError && (
              <FormHelperText color="red.500">{firstNameError}</FormHelperText>
            )}
            {lastNameError && (
              <FormHelperText color="red.500">{lastNameError}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Email */}
        <Grid gridColumnGap={8} gridTemplateColumns={"repeat(2, 1fr)"}>
          <FormControl isRequired my={2} mb={4}>
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <InputLeftElement>
                {isCheckingEmail ? <Spinner size="sm" /> : <Icon as={GrMail} />}
              </InputLeftElement>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                maxLength={50}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired my={2} mb={4}>
            <FormLabel>Email Confirmation</FormLabel>
            <InputGroup>
              <InputLeftElement children={<Icon as={GrMail} />} />
              <Input
                type="email"
                placeholder="Confirm Email"
                value={confirmEmail}
                onChange={handleConfirmEmailChange}
                maxLength={50}
              />
            </InputGroup>
            {email.length > 0 && email.length < 5 && (
              <FormHelperText color="red.500">
                Email must be at least 5 characters long.
              </FormHelperText>
            )}
            {email.length >= 5 && !isValidEmail && (
              <FormHelperText color="red.500">
                {email.endsWith("@dbca.wa.gov.au")
                  ? "'@dbca.wa.gov.au' addresses are not valid for adding external users. Please enter a valid external email address."
                  : "Please enter a valid email address."}
              </FormHelperText>
            )}
            {email.length >= 5 && isValidEmail && !emailsMatch && (
              <FormHelperText color="red.500">
                Email and Confirm Email must match.
              </FormHelperText>
            )}
            {isCheckingEmail && (
              <FormHelperText color="blue.500">
                Checking email...
              </FormHelperText>
            )}
            {emailExists && (
              <FormHelperText color="red.500">
                User with this email already exists.
              </FormHelperText>
            )}
            {!emailExists &&
              email.length >= 5 &&
              isValidEmail &&
              emailsMatch &&
              firstName.length > 1 &&
              lastName.length > 1 && (
                // !nameExists && #enabling same name
                <FormHelperText color="green.500">
                  All fields complete. Press Add User.
                </FormHelperText>
              )}
          </FormControl>
        </Grid>

        <AffiliationSearchDropdown
          isRequired={false}
          setterFunction={setSelectedAffiliation}
          label={"Affiliation (Optional)"}
          placeholder={"Set an affiliation (optional)"}
          helperText={""}
        />

        {isModal && (
          <Box
            bgColor={colorMode === "light" ? "gray.100" : "gray.700"}
            rounded={6}
            flexDir={"column"}
            p={6}
            pos={"relative"}
            mt={5}
            mb={7}
            color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
            userSelect={"none"}
          >
            <TypewriterText>
              <Text>
                This is for adding external users only. If you are trying to add
                a DBCA staff member, please send them a link to this website and
                an account will be created when they visit. All existing users
                can be found on the users page.
              </Text>
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
                    color={colorMode === "light" ? "blue.500" : "blue.300"}
                    cursor={"pointer"}
                    onClick={() => {
                      navigate(`/users`);
                    }}
                  >{`${VITE_PRODUCTION_BASE_URL}users`}</Button>
                </motion.span>
              )}
            </TypewriterText>
          </Box>
        )}

        <Flex mt={5} justifyContent="end">
          <Button
            type="submit"
            bgColor={colorMode === "light" ? `green.500` : `green.600`}
            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
            _hover={{
              bg: colorMode === "light" ? `green.600` : `green.400`,
              color: colorMode === "light" ? `white` : `white`,
            }}
            ml={3}
            isDisabled={
              isCheckingEmail ||
              isCheckingName ||
              !isValidEmail ||
              !firstName ||
              !lastName ||
              !email ||
              !emailsMatch ||
              emailExists
              // ||
              // nameExists
            }
          >
            Add User
          </Button>
        </Flex>
      </form>
    </>
  );
};
