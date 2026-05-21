import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
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