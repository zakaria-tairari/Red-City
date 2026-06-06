import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
});

api.interceptors.response.use((response) => {
  return response.data;
});

export default api;
