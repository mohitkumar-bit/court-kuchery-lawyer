import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const BASE_URL = 'http://192.168.29.99:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach Access Token Automatically
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// singleton to hold pending refresh promise
let refreshPromise: Promise<string> | null = null;

// 🔁 Auto Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, wait for it
      if (refreshPromise) {
        try {
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // Create the singleton refresh promise
        refreshPromise = (async () => {
          const res = await axios.post(`${BASE_URL}/lawyer/refresh`, {
            refreshToken,
          });
          const newAccessToken = res.data.accessToken;
          await tokenStorage.setTokens(newAccessToken, refreshToken);
          return newAccessToken;
        })();

        const newAccessToken = await refreshPromise;
        refreshPromise = null; // Clear after success

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err: any) {
        refreshPromise = null; // Clear on failure

        // 🚨 CRITICAL: Only clear tokens if the refresh itself fails with 400/401/403
        // If it's a network error (no response), keep the tokens!
        if (err.response?.status === 401 || err.response?.status === 400 || err.response?.status === 403) {
          console.log("REFRESH TOKEN INVALID - CLEARING STORAGE");
          await tokenStorage.clear();
        } else {
          console.log("REFRESH FAILED DUE TO NETWORK/SERVER ERROR - KEEPING TOKENS");
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
