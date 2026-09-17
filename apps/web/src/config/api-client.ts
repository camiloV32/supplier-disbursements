import axios from 'axios';
import { env } from './env';

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export const onUnauthorized = (handler: UnauthorizedHandler): void => {
  unauthorizedHandler = handler;
};

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
