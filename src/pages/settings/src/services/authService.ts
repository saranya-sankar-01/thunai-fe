import axios, { Method, ResponseType } from "axios";
const url = new URL(window.location.href);
const urlToken = url.searchParams.get("token");
const urlTenantId = url.searchParams.get("tenant_id");
const urlCsrfToken = url.searchParams.get("csrf_token");
const urlIdentifier = url.searchParams.get("url_identifier");
const userId = url.searchParams.get("user_id");
const urlRefreshToken = url.searchParams.get("refresh_token");
const urlValidUntil = url.searchParams.get("valid_until");

// Store in localStorage if found in URL
if (urlToken) localStorage.setItem("agent_token", urlToken);
if (urlTenantId) localStorage.setItem("tenant_id", urlTenantId);
if (urlCsrfToken) localStorage.setItem("csrf_token", urlCsrfToken);
if (urlIdentifier) localStorage.setItem("url_identifier", urlIdentifier);
if (userId) localStorage.setItem("user_id", userId);
if (urlRefreshToken) localStorage.setItem("refresh_token", urlRefreshToken);
if (urlValidUntil) localStorage.setItem("valid_until", urlValidUntil);
// All service base URLs
export const SERVICE_BASE_URLS: Record<string, string> = {
  encryptKey: 'entrutient!@123',
  httpencryptKey: 'ent!2#$45%&*',
  authService: "https://api.thunai.ai/auth-service/ai/api/v1",
  accountService: `https://api.thunai.ai/account-service/ai/api/v1`,
  chatService: "https://api.thunai.ai/chat-service/chatai/api/v1",
  slackService: "https://api.thunai.ai/slack-service/slackai/v1",
  intService: "https://api.thunai.ai/int-service/thunai/v1",
  intServiceV2: "https://api.thunai.ai/int-service/thunai/v2",
  workflowService: "https://api.thunai.ai/workflow-service/agent-workflow/v1",
  mcpService: "https://api.thunai.ai/workflow-service/mcp/v1",
  documentService: "https://api.thunai.ai/document-service/ai/api/v1",
  brainService: "https://api.thunai.ai/brain-service",
  samlService: "https://api.thunai.ai/saml-service",
  paymentService: "https://api.thunai.ai/payment-service/payment/v1",
  directoryService: "https://api.thunai.ai/directory-service/thunai/v1",
};

export interface ApiRequestParams<T = any> {
  service: string;
  endpoint: string;
  method?: Method;
  data?: T | FormData;
  headers?: Record<string, string>;
}

// CSRF Token Management - Simple version
class CsrfService {
  private csrfRequest: Promise<string> | null = null;

  private isTokenValid(): boolean {
    const csrfToken = localStorage.getItem("csrf_token");
    const validUntil = localStorage.getItem("valid_until");

    if (!csrfToken || !validUntil) {
      return false;
    }

    return Date.now() < Number(validUntil) * 1000;
  }

  async fetchNewToken(): Promise<string> {
    if (!this.csrfRequest) {
      this.csrfRequest = axios
        .get(`${SERVICE_BASE_URLS.accountService}/get-csrf-token/`)
        .then((response) => {
          const data = response.data;
          const token = data?.data?.csrfToken?.token || "";
          const validUntil = data?.data?.csrfToken?.valid_until;

          if (!token) {
            throw new Error("CSRF token is missing!");
          }

          // Store in localStorage
          localStorage.setItem("csrf_token", token);
          localStorage.setItem("valid_until", validUntil.toString());

          // console.log("New CSRF Token Fetched:", token);
          this.csrfRequest = null;
          return token;
        })
        .catch((error) => {
          this.csrfRequest = null;
          throw error;
        });
    }

    return this.csrfRequest;
  }

  async getCsrfToken(): Promise<string> {
    if (this.isTokenValid()) {
      return localStorage.getItem("csrf_token")!;
    }
    return this.fetchNewToken();
  }
}
// Create CSRF service instance
const csrfService = new CsrfService();
const REFRESH_URL = `${SERVICE_BASE_URLS.accountService}/account/refresh/token/`;

// Token helpers
function getAccessToken() {
  return localStorage.getItem("agent_token");
}
function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}
function updateTokens(access: string, refresh: string) {
  localStorage.setItem("agent_token", access);
  localStorage.setItem("refresh_token", refresh);
}
const api = axios.create({
  //   timeout: 15000,
});
api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Use CSRF service instead of direct localStorage access
  try {
    const csrf = await csrfService.getCsrfToken();
    if (csrf) {
      config.headers["x-csrftoken"] = csrf;
    }
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    const fallbackCsrf = localStorage.getItem("csrf_token");
    if (fallbackCsrf) {
      config.headers["x-csrftoken"] = fallbackCsrf;
    }
  }

  return config;
});

// Flag to prevent multiple refreshes at once
let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message?.toLowerCase() || "";

    // Handle CSRF token errors
    if (status === 403 && message.includes("csrf token verification failed")) {
      // console.log("CSRF token invalid, fetching new one...");
      try {
        await csrfService.fetchNewToken();
        // Retry the original request
        return api(error.config);
      } catch (csrfError) {
        console.error("Failed to refresh CSRF token:", csrfError);
        return Promise.reject(error);
      }
    }

    // Handle access token refresh
    if (
      (status === 401 || status === 403 || status === 400) &&
      (message.includes("token expired") ||
        message.includes("account info updated"))
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refresh_token = getRefreshToken();
          if (!refresh_token) throw new Error("No refresh token available");
          const oldRefreshToken = getRefreshToken();
          const res = await axios.post(
            REFRESH_URL,
            { token: refresh_token },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${oldRefreshToken}`,
              },
            }
          );

          const { access_token, refresh_token: newRefresh } = res.data.data;
          updateTokens(access_token, newRefresh);

          // Retry all queued requests
          pendingRequests.forEach((cb) => cb(access_token));
          pendingRequests = [];
        } catch (err) {
          console.error("Token refresh failed:", err);
          pendingRequests = [];
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Queue this request until refresh completes
      return new Promise((resolve) => {
        pendingRequests.push((newToken: string) => {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(error.config));
        });
      });
    }

    return Promise.reject(error);
  }
);
export const apiRequest = async <T = any>({
  service,
  endpoint,
  method = "GET",
  data = null,
  headers = {},
  responseType,
}: ApiRequestParams<T> & { responseType?: ResponseType }): Promise<T> => {
  try {
    const response = await api.request<T>({
      url: `${SERVICE_BASE_URLS[service]}/${endpoint}`,
      method,
      data,
      headers,
      responseType,
    });
    return response as T;
  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};

// formdata

export const requestApiFromData = async (
  method: string,
  endpoint: string,
  formData?: any,
  service?: keyof typeof SERVICE_BASE_URLS
) => {
  return apiRequest({
    service,
    endpoint: `${endpoint}`,
    method: method as Method,
    data: formData,
  });
};

// json data

export const requestApi = async (
  method: string,
  endpoint: string,
  data?: any,
  service?: keyof typeof SERVICE_BASE_URLS
) => {
  return apiRequest({
    service,
    endpoint,
    method: method as Method,
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const requestApiBlob = async (
  method: string,
  endpoint: string,
  service?: keyof typeof SERVICE_BASE_URLS
) => {
  return apiRequest({
    service,
    endpoint,
    method: method as Method,
    responseType: "blob",
  });
};
