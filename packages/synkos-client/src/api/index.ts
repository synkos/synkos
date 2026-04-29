import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, awaitAuthReady } from './token-provider.js';

let _api: AxiosInstance | null = null;

export function createApiClient(baseURL: string): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // Wait for the auth store to finish rehydrating tokens from persistent
    // storage before attaching the bearer token. Without this, requests fired
    // from `onMounted` of a callback page (e.g. an OAuth redirect) race the
    // hydration and go out anonymous, even though the user is authenticated.
    await awaitAuthReady();
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  let isRefreshing = false;
  let refreshQueue: Array<(token: string) => void> = [];

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
            setTimeout(
              () => reject(error instanceof Error ? error : new Error(String(error))),
              10000
            );
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Dynamic import avoids circular dependency at module init time
          const { useAuthStore } = await import('../auth/store.js');
          const authStore = useAuthStore();
          const refreshed = await authStore.refreshTokens();

          if (refreshed && authStore.accessToken) {
            const newToken = authStore.accessToken;
            refreshQueue.forEach((cb) => cb(newToken));
            refreshQueue = [];
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch {
          const { useAuthStore } = await import('../auth/store.js');
          await useAuthStore().logout();
        } finally {
          isRefreshing = false;
          refreshQueue = [];
        }
      }

      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  _api = api;
  return api;
}

export function getApiClient(): AxiosInstance {
  if (!_api) {
    throw new Error('[synkos/client] API client not initialized. Did you call createAuthBoot()?');
  }
  return _api;
}
