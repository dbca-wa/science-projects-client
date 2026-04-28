import { useEffect, useState } from "react";
import { checkEmailExists, checkNameExists } from "../services/user.service";

interface UseUserExistenceCheckOptions {
	firstName: string;
	lastName: string;
	email: string;
	confirmEmail: string;
	/** Additional email validation (e.g. must be @dbca.wa.gov.au for staff) */
	emailValidator?: (email: string) => boolean;
}

interface UseUserExistenceCheckResult {
	isCheckingName: boolean;
	nameExists: boolean;
	isCheckingEmail: boolean;
	emailExists: boolean;
}

/**
 * Debounced user existence checks for name and email.
 * Used by both StaffUserForm and ExternalUserForm to avoid duplicate users.
 */
export function useUserExistenceCheck({
	firstName,
	lastName,
	email,
	confirmEmail,
	emailValidator,
}: UseUserExistenceCheckOptions): UseUserExistenceCheckResult {
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [emailExists, setEmailExists] = useState(false);
	const [isCheckingName, setIsCheckingName] = useState(false);
	const [nameExists, setNameExists] = useState(false);

	// Debounced name checking
	useEffect(() => {
		const isFirstNameValid =
			firstName.length >= 2 && /^[A-Za-z\- ]+$/.test(firstName);
		const isLastNameValid =
			lastName.length >= 2 && /^[A-Za-z\- ]+$/.test(lastName);

		if (isFirstNameValid && isLastNameValid) {
			const timer = setTimeout(async () => {
				setIsCheckingName(true);
				try {
					const exists = await checkNameExists(firstName, lastName);
					setNameExists(exists);
				} catch (error) {
					console.error("Error checking name:", error);
				} finally {
					setIsCheckingName(false);
				}
			}, 500);

			return () => clearTimeout(timer);
		}

		// Reset when inputs are invalid (use timeout to avoid synchronous setState in effect)
		const resetTimer = setTimeout(() => {
			setIsCheckingName(false);
			setNameExists(false);
		}, 0);
		return () => clearTimeout(resetTimer);
	}, [firstName, lastName]);

	// Debounced email checking
	useEffect(() => {
		const emailsMatch = email === confirmEmail;
		const isValidEmail =
			email.length >= 5 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		const passesCustomValidation = emailValidator
			? emailValidator(email)
			: true;

		if (emailsMatch && isValidEmail && passesCustomValidation) {
			const timer = setTimeout(async () => {
				setIsCheckingEmail(true);
				try {
					const exists = await checkEmailExists(email);
					setEmailExists(exists);
				} catch (error) {
					console.error("Error checking email:", error);
				} finally {
					setIsCheckingEmail(false);
				}
			}, 500);

			return () => clearTimeout(timer);
		}

		// Reset when inputs are invalid
		const resetTimer = setTimeout(() => {
			setIsCheckingEmail(false);
			setEmailExists(false);
		}, 0);
		return () => clearTimeout(resetTimer);
	}, [email, confirmEmail, emailValidator]);

	return { isCheckingName, nameExists, isCheckingEmail, emailExists };
}
