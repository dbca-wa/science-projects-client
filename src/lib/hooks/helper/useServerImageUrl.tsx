import { useEffect, useState } from "react";

const useServerImageUrl = (originalLink) => {
  const [apiEndpoint, setApiEndpoint] = useState<string>("");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      if (process.env.DEV === "True") {
        setApiEndpoint("https://scienceprojects-test.dbca.wa.gov.au");
      } else {
        setApiEndpoint("https://scienceprojects.dbca.wa.gov.au");
      }
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
