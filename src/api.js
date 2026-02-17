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

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("activeSalon");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 401 && message === "Invalid token") {
      console.warn("Session expired or token is invalid. Please log in again.");
    }

    return Promise.reject(error);
  }
);

export default api;
