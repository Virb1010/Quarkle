import axios from "axios";
import axiosRetry from "axios-retry";

export const plumeAPI = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ENV === "production" || process.env.NEXT_PUBLIC_ENV === "staging"
      ? `https://${process.env.NEXT_PUBLIC_BACKEND_HOST}`
      : `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}`,
  timeout: 20000,
});

axiosRetry(plumeAPI, { retries: 10, retryDelay: axiosRetry.exponentialDelay });
