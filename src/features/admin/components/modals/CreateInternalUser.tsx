// Component/Route for handling user creation and the accomponying validation

import { Head } from "@/shared/components/layout/base/Head";
import { getAllBranches, getAllBusinessAreas } from "@/features/admin/services/admin.service";
import {
  type UserData,
  createUser,
  getDoesUserWithEmailExist,
  getDoesUserWithFullNameExist,
} from "@/features/users/services/users.service";
import type { IBranch, IBusinessArea, IDivision } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { GrMail } from "react-icons/gr";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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

export const CreateInternalUser = ({ onSuccess, isModal }: IProps) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  // Tracking input fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<number>();
  const [selectedBusinessArea, setSelectedBusinessArea] = useState<number>();

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
  }, [
    firstName,
    lastNameError,
    firstNameError,
    lastName,
    isFirstNameValid,
    isLastNameValid,
  ]);

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
    if (emailGood && !email.endsWith("@dbca.wa.gov.au")) {
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
            isStaff: true,
            branch: selectedBranch ?? null,
            businessArea: selectedBusinessArea ?? null,
            // affiliation: selectedAffiliation ?? null,
            email,
          };
          await createUser(userData);

          toast.success("User Created", {
            description: "The user has been successfully created.",
          });
          onSuccess?.();
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

  // Function to check if a string contains HTML tags
  const checkIsHtml = (data) => {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(data);
  };

  // Function to sanitize HTML content and extract text
  const sanitizeHtml = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };
  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);

  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const data = await getAllBusinessAreas();
        setBusinessAreas(data);
      } catch (error) {
        console.error("Error fetching business areas:", error);
      }
    };

    const fetchBranches = async () => {
      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
    fetchBusinessAreas();
  }, []);

  return (
    <>
      <Head title={"Add User"} />
      {!isModal && (
        <div>
          <p className="mb-8 font-bold text-2xl">
            Add Internal User
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className={colorMode === "light" ? "text-blue-500" : "text-blue-400"}>
          Ideally, users should visit the SPMS with their DBCA account for an
          account to be automatically created using OIM's data. In situations
          where this is not possible, please use this form to manually create
          users. To avoid data inconsistencies with OIM, please use this form
          sparingly.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-8">
          {/* First Name */}
          <div className="my-2 mb-4">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isCheckingName ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <RiNumber1 className="h-4 w-4" />
                )}
              </div>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
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
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <RiNumber2 className="h-4 w-4" />
                )}
              </div>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
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
              <p className="text-sm text-red-500 mt-1">
                User with this name already exists.
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GrMail className="h-4 w-4" />
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@dbca.wa.gov.au"
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
                <GrMail className="h-4 w-4" />
              </div>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="john.doe@dbca.wa.gov.au"
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
                {!email.endsWith("@dbca.wa.gov.au")
                  ? "Needs to be a DBCA address."
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
              lastName.length > 1 &&
              !nameExists && (
                <p className="text-sm text-green-500 mt-1">
                  All fields complete. Press Add User.
                </p>
              )}
          </div>
        </div>

        <div className="my-4">
          <p className={colorMode === "light" ? "text-red-500" : "text-red-400"}>
            NOTE: If the information provided above does not match OIM's data,
            the user will be unable to log in. Instead, when they visit the
            site, a fresh account will be created with OIM's data. That account
            will NOT be connected to the account created here. You will have to
            merge the users.
          </p>
        </div>

        {/* Branch Selection */}
        <div className="mt-2">
          <Label htmlFor="branch">Branch *</Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setSelectedBranch(Number(value));
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">---</SelectItem>
              {branches
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((branch, index) => (
                  <SelectItem key={`${branch.name}${index}`} value={branch.pk.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2">
          <Label htmlFor="businessArea">Business Area *</Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setSelectedBusinessArea(Number(value));
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a business area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">---</SelectItem>
              {orderedDivisionSlugs.flatMap((divSlug) => {
                // Filter business areas for the current division
                const divisionBusinessAreas = businessAreas
                  .filter((ba) => (ba.division as IDivision).slug === divSlug)
                  .sort((a, b) => a.name.localeCompare(b.name));

                return divisionBusinessAreas.map((ba, index) => (
                  <SelectItem key={`${ba.name}${index}`} value={ba.pk.toString()}>
                    {ba?.division
                      ? `[${(ba?.division as IDivision)?.slug}] `
                      : ""}
                    {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}{" "}
                    {ba.is_active ? "" : "(INACTIVE)"}
                  </SelectItem>
                ));
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex mt-5 justify-end">
          <Button
            type="submit"
            className={`ml-3 ${
              colorMode === "light" 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-green-600 hover:bg-green-400 text-white"
            }`}
            disabled={
              isCheckingEmail ||
              isCheckingName ||
              !isValidEmail ||
              !firstName ||
              !lastName ||
              !email ||
              !emailsMatch ||
              emailExists ||
              nameExists ||
              !selectedBranch ||
              !selectedBusinessArea
            }
          >
            Create
          </Button>
        </div>
      </form>
    </>
  );
};
