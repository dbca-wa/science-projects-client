import Cookie from "js-cookie";
import axios from "axios";

const VITE_PRODUCTION_BACKEND_API_URL = import.meta.env
  .VITE_PRODUCTION_BACKEND_API_URL;

const baseBackendUrl =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/api/v1/"
    : VITE_PRODUCTION_BACKEND_API_URL;

const instance = axios.create({
  baseURL: baseBackendUrl,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const csrfToken = Cookie.get("spmscsrf") || "POTATOES";
  if (csrfToken !== "POTATOES") {
    config.headers["X-CSRFToken"] = csrfToken;
  } else {
    // Forces a login and removes old cookie by its older name
    Cookie.remove("csrf");
    Cookie.remove("sessionid");
  }
  return config;
});

export default instance;
