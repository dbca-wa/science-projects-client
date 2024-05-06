import { useEffect, useState } from "react";

const useApiEndpoint = () => {
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

  return apiEndpoint;
};

export default useApiEndpoint;
