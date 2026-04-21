import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: inject access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Lazy import to avoid circular dependency at module level
  // The auth store is always available after boot
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent token refresh on 401 ─────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 on non-auth endpoints and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
          // On failure, reject all queued
          setTimeout(
            () => reject(error instanceof Error ? error : new Error(String(error))),
            10000,
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { useAuthStore } = await import('src/stores/auth.store');
        const authStore = useAuthStore();
        const refreshed = await authStore.refreshTokens();

        if (refreshed && authStore.accessToken) {
          const newToken = authStore.accessToken;
          // Retry queued requests
          refreshQueue.forEach((cb) => cb(newToken));
          refreshQueue = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — clear session and redirect to login
        const { useAuthStore } = await import('src/stores/auth.store');
        await useAuthStore().logout();
      } finally {
        isRefreshing = false;
        refreshQueue = [];
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

// ── Access token getter (breaks circular dep) ─────────────────────────────────
function getAccessToken(): string | null {
  try {
    // Access Pinia store without importing the store module at the top level
    const piniaStores = (
      window as unknown as {
        __pinia?: { state: { value: Record<string, { accessToken?: string }> } };
      }
    ).__pinia;
    return piniaStores?.state?.value?.auth?.accessToken ?? null;
  } catch {
    return null;
  }
}

export default api;
