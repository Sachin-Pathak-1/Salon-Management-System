import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const code = error?.response?.data?.code;

    if (status === 401) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      const targetPath = currentUser?.role === "customer" ? "/customer-login" : "/login";

      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("activeSalon");

      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath;
      }
    }

    if (status === 401 && message === "Invalid token") {
      console.warn("Session expired or token is invalid. Please log in again.");
    }

    if (status === 403 && code === "TRIAL_EXPIRED") {
      const alertKey = "trial_expired_alert_shown";
      if (sessionStorage.getItem(alertKey) !== "1") {
        window.alert(message || "Your free demo has expired. Please purchase a plan to continue.");
        sessionStorage.setItem(alertKey, "1");
      }

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (currentUser?.role === "admin") {
        if (window.location.pathname !== "/plans") {
          window.location.href = "/plans";
        }
      } else {
        const currentUserRole = currentUser?.role;
        const targetPath = currentUserRole === "customer" ? "/customer-login" : "/login";
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("activeSalon");
        if (window.location.pathname !== targetPath) {
          window.location.href = targetPath;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
