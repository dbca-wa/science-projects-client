// Simple hook to copy text to clipboard with a toast for the user.

import { useToast } from "@chakra-ui/react";

export const useCopyText = (textToCopy: string) => {
  const toast = useToast();

  const copy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast({
          position: "top-right",
          status: "success",
          title: "Email Copied!",
          description: "The email has been copied to the clipboard.",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          position: "top-right",
          status: "error",
          title: "Error!",
          description: "Unable to copy the email to the clipboard.",
          duration: 2000,
          isClosable: true,
        });
        console.error("Error copying email to clipboard:", error);
      });
  };

  return copy;
};
