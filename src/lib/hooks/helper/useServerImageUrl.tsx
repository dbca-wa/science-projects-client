import { useEffect, useState } from "react";

const useServerImageUrl = (originalLink) => {
  const [apiEndpoint, setApiEndpoint] = useState<string>("");
  const PRODUCTION_BACKEND_BASE_URL = import.meta.env.PRODUCTION_BACKEND_BASE_URL
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      setApiEndpoint(PRODUCTION_BACKEND_BASE_URL);
    } else {
      setApiEndpoint("http://127.0.0.1:8000");
    }
  }, []);

  const getModifiedLink = () => {
    if (!originalLink) {
      return "";
    }

    try {
      new URL(originalLink);
      return originalLink; // If it's a valid URL, return it as-is
    } catch (error) {
      // If it's not a valid URL, construct the modified link using apiEndpoint
      if (originalLink.startsWith("/")) {
        return `${apiEndpoint}${originalLink}`;
      } else {
        return `${apiEndpoint}/${originalLink}`;
      }
    }
  };

  return getModifiedLink();
};

export default useServerImageUrl;