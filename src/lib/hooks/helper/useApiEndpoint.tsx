import { useEffect, useState } from "react";

const useApiEndpoint = () => {
  const [apiEndpoint, setApiEndpoint] = useState<string>("");
  const PRODUCTION_BACKEND_BASE_URL = import.meta.env.PRODUCTION_BACKEND_BASE_URL

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      setApiEndpoint(PRODUCTION_BACKEND_BASE_URL);
    } else {
      setApiEndpoint("http://127.0.0.1:8000");
    }
  }, []);

  return apiEndpoint;
};

export default useApiEndpoint;
