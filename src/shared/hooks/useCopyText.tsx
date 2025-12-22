// Simple hook to copy text to clipboard with a toast for the user.

import { toast } from "sonner";

export const useCopyText = (textToCopy: string) => {
  const copy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Email Copied!", {
          description: "The email has been copied to your clipboard",
        });
      })
      .catch((error) => {
        toast.error("Error!", {
          description: "Unable to copy the email to the clipboard",
        });
        console.error("Error copying email to clipboard:", error);
      });
  };

  return copy;
};
