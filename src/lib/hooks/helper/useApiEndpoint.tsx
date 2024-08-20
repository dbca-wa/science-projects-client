import { useEffect, useState } from "react";

const useApiEndpoint = () => {
  const [apiEndpoint, setApiEndpoint] = useState<string>("");
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  let sanitised = VITE_PRODUCTION_BASE_URL;

  if (sanitised?.endsWith("/")) {
    sanitised = sanitised.slice(0, -1);
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      setApiEndpoint(sanitised);
    } else {
      setApiEndpoint("http://127.0.0.1:8000");
    }
  }, []);

  return apiEndpoint;
};

export default useApiEndpoint;
