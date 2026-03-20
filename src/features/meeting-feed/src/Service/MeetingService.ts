import axios from "axios";
import type { Method } from "axios";
import * as CryptoJS from "crypto-js";

interface UserInfo {
  access_token?: string;
  refresh_token?: string;
  csrf_token?: string;
  valid_until?: number;
  default_tenant_id?: string;
  [key: string]: any;
}

const IS_ENCRYPTION_FLOW = import.meta.env.VITE_IS_ENCRYPTION_FLOW === "true" ||
  import.meta.env.VITE_IS_ENCRYPTION_FLOW === true ||
  (window as any)['env']['IS_ENCRYPTION_FLOW'] === "true" ||
  (window as any)['env']['IS_ENCRYPTION_FLOW'] === true;

// const HTTP_ENCRYPT_KEY = (window as any)['env']['ENCRYPTION_KEY'];
const HTTP_ENCRYPT_KEY =  import.meta.env.VITE_HTTP_ENCRYPT_KEY || (window as any)?.env?.ENCRYPTION_KEY;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || (window as any)['env']['API_ENDPOINT'];
const url = new URL(window.location.href);

if (IS_ENCRYPTION_FLOW && !HTTP_ENCRYPT_KEY) {
  console.error("Encryption key is missing!");
}

const urlToken = url.searchParams.get("token");
const urlTenantId = url.searchParams.get("tenant_id");
const urlCsrfToken = url.searchParams.get("csrf_token");
const urlIdentifier = url.searchParams.get("url_identifier");
const userId = url.searchParams.get("user_id");
const urlRefreshToken = url.searchParams.get("refresh_token");
const urlValidUntil = url.searchParams.get("valid_until");
const Email = url.searchParams.get("Email");
const org_name = url.searchParams.get("org_name");

// const encrypted_userInfo = url.searchParams.get("data");

// Store in localStorage if found in URL
if (urlToken) localStorage.setItem("agent_token", urlToken);
if (urlTenantId) localStorage.setItem("tenant_id", urlTenantId);
if (urlCsrfToken) localStorage.setItem("csrf_token", urlCsrfToken);
if (Email) localStorage.setItem("Email", Email);
if (org_name) localStorage.setItem("org_name", org_name);


if(urlIdentifier) localStorage.setItem("url_identifier",urlIdentifier);
if(userId) localStorage.setItem("user_id",userId)
if(urlRefreshToken) localStorage.setItem("refresh_token", urlRefreshToken)
if(urlValidUntil) localStorage.setItem("valid_until",urlValidUntil)

// if (encrypted_userInfo) {
//   try {
//     localStorage.setItem("user_info", encrypted_userInfo);
//   } catch (err) {
//     console.error("Failed to params user info from URL:", err);
//   }
// }
// const userInfo = localStorage.getItem("user_info") || {}
// const userInfoRaw = localStorage.getItem("user_info");


let userInfo: UserInfo = getLocalStorageItem("user_info") || localStorage.getItem("user_info") || {};

console.log("userinof", userInfo);

// All service base URLs
const SERVICE_BASE_URLS: Record<string, string> = {
  authService: `${API_ENDPOINT}/auth-service/ai/api/v1`,
  accountService: `${API_ENDPOINT}/account-service/ai/api/v1`,
  chatService: `${API_ENDPOINT}/chat-service/chatai/api/v1`,
  slackService: `${API_ENDPOINT}/slack-service/slackai/v1`,
  intService: `${API_ENDPOINT}/int-service/thunai/v1`,
  intServiceV2: `${API_ENDPOINT}/int-service/thunai/v2`,
  workflowService: `${API_ENDPOINT}/workflow-service/agent-workflow/v1`,
  mcpService: `${API_ENDPOINT}/workflow-service/mcp/v1`,
  documentService: `${API_ENDPOINT}/document-service/ai/api/v1`,
  brainService: `${API_ENDPOINT}/brain-service`,
  CalendarService: `${API_ENDPOINT}/calendar-service/calendar/v1`,
};

export interface ApiRequestParams<T = any> {
  service?: string;
  endpoint: string;
  method?: string;
  data?: T | FormData | null;
  headers?: Record<string, string>;
}

function encryptData(data: any): string {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, HTTP_ENCRYPT_KEY).toString();
}

function decryptData(encrypted: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, HTTP_ENCRYPT_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return encrypted;
  }
}


// CSRF Token Management - Simple version
class CsrfService {
  private csrfRequest: Promise<string> | null = null;

  private isTokenValid(): boolean {
    // const csrfToken = localStorage.getItem("csrf_token");
    // const validUntil = localStorage.getItem("valid_until");
    const csrfToken = userInfo?.csrf_token || localStorage.getItem("csrf_token");
    const validUntil = userInfo?.valid_until || localStorage.getItem("valid_until");

    if (!csrfToken || !validUntil) {
      return false;
    }

    return Date.now() < Number(validUntil) * 1000;
  }

  async fetchNewToken(): Promise<string> {
    if (!this.csrfRequest) {
      this.csrfRequest = axios.get(`${SERVICE_BASE_URLS.accountService}/get-csrf-token/`)
        .then((response) => {
          const data = response.data;
          const token = data?.data?.csrfToken?.token || "";
          const validUntil = data?.data?.csrfToken?.valid_until;

          if (!token) {
            throw new Error("CSRF token is missing!");
          }

          // Store in localStorage
          localStorage.setItem("csrf_token", token);
          localStorage.setItem("valid_until", validUntil.toString() || "");
          
          // Get fresh user_info from localStorage and merge with CSRF data
          const existingUserInfo = getLocalStorageItem("user_info") || {};
          const updatedUserInfo = {
            ...existingUserInfo,
            csrf_token: token,
            csrf_valid_until: validUntil
          };
          
          // Update in-memory userInfo
          userInfo = updatedUserInfo;

          try {
            // Store without double-stringifying
            setLocalStorageItem("user_info", updatedUserInfo);
          } catch (e) {
            console.error("Failed to store user info:", e);
          }
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
      // return localStorage.getItem("csrf_token")!;
      return userInfo?.csrf_token|| localStorage.getItem("csrf_token") || "";
    }
    return this.fetchNewToken();
  }
}
// Create CSRF service instance
const csrfService = new CsrfService();
const REFRESH_URL = `${SERVICE_BASE_URLS.accountService}/account/refresh/token/`;

// Token helpers
function getAccessToken(): string | null {
  // return localStorage.getItem("user_info")?.access_token;
   return userInfo?.access_token || localStorage.getItem("agent_token");
}
function getRefreshToken(): string | null {
  // return localStorage.getItem("refresh_token")?.refresh_token;
  return userInfo?.refresh_token || localStorage.getItem("refresh_token");
}
function updateTokens(access: string, refresh: string) {
  userInfo.access_token = access;
  userInfo.refresh_token = refresh;
  
  localStorage.setItem("agent_token", access);
  localStorage.setItem("refresh_token", refresh);
  try {
    setLocalStorageItem("user_info", JSON.stringify(userInfo));
  } catch (e) {
    console.error("Failed to store user info:", e);
  }
}

export function getLocalStorageItem(key: string): any{

  if (key) {
    const keyData = localStorage.getItem(key);
    if (keyData) {
      console.log("http", HTTP_ENCRYPT_KEY);

      const decrypteDATA = CryptoJS.AES.decrypt(keyData.trim(), HTTP_ENCRYPT_KEY);
      if (decrypteDATA) {
        const decryptData = decrypteDATA.toString(CryptoJS.enc.Utf8);

        try {
          try {
            return JSON.parse(decryptData);
          } catch {
            return decryptData; // Return raw string if not valid JSON
          }
        } catch (e) {
          console.error('Failed to parse decrypted data:', e);
          return decryptData;
        }
      } else return null;
    } else return null;
  } else return null;
}

export function setLocalStorageItem(key: string, value: any) {
  if (value) {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, CryptoJS.AES.encrypt(valueToStore, HTTP_ENCRYPT_KEY).toString());

  } else {
    console.error('Invalid value to store in localStorage:', value);
  }
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
    const fallbackCsrf = userInfo?.csrf_token //localStorage.getItem("csrf_token");
    if (fallbackCsrf) {
      config.headers["x-csrftoken"] = fallbackCsrf;
    }
  }
  if (IS_ENCRYPTION_FLOW &&
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof FormData)) {
    try {
      config.data = { encrypted_payload: encryptData(config.data) };
    } catch (err) {
      console.error("Request encryption failed:", err);
    }
  }
  return config;
});

// Flag to prevent multiple refreshes at once
let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (response) => {
    if (IS_ENCRYPTION_FLOW && response?.data?.encrypted_response) {
      try {
        response.data = decryptData(response.data.encrypted_response);
      } catch (err) {
        console.error("Response decryption failed:", err);
      }
    }
    return response;
  },
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

          // Clear tokens to prevent further API calls
          localStorage.removeItem("agent_token");
          localStorage.removeItem("refresh_token");

          pendingRequests = [];

          throw {
            type: 'TOKEN_REFRESH_FAILED',
            message: 'Your session has expired. Please refresh the page',
            originalError: err
          };
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
}: ApiRequestParams<T>): Promise<T> => {
  if (!service) {
    throw new Error("Service is required");
  }
  try {
    const response = await api.request<T>({
      url: `${SERVICE_BASE_URLS[service]}/${endpoint}`,
      method: method as Method,
      data,
      headers,
    });
    return response.data as T;
  } catch (error: any) {
    console.error("API Error:", error);

    const errorData = error.response?.data || {
      message: error.message || 'Unknown error occurred',
      status: 'error'
    };
    throw errorData || error;
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
      Authorization: `Bearer ${getAccessToken()}`,
      "x-csrftoken": userInfo?.csrf_token || "",
    },
  });
};