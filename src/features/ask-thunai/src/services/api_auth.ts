import { toast } from "@/hooks/use-toast";
import axios, { Method } from "axios";
import CryptoJS from "crypto-js";

const IS_ENCRYPTION_FLOW = import.meta.env.VITE_IS_ENCRYPTION_FLOW === "true" ||
  import.meta.env.VITE_IS_ENCRYPTION_FLOW === true ||
  window['env']['IS_ENCRYPTION_FLOW'] === "true" ||
  window['env']['IS_ENCRYPTION_FLOW'] === true;

const HTTP_ENCRYPT_KEY = import.meta.env.VITE_HTTP_ENCRYPT_KEY || window['env']['ENCRYPTION_KEY'];
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || window['env']['API_ENDPOINT'];
const DOMAIN = import.meta.env.VITE_DOMAIN || window['env']['DOMAIN'];
// --- Parse URL Parameters ---
const url = new URL(window.location.href);
const urlToken = url.searchParams.get("token");
const urlTenantId = url.searchParams.get("tenant_id");
const urlCsrfToken = url.searchParams.get("csrf_token");
const urlIdentifier = url.searchParams.get("url_identifier");
const userId = url.searchParams.get("user_id");
const urlRefreshToken = url.searchParams.get("refresh_token");
const urlValidUntil = url.searchParams.get("valid_until");
const encrypted_userInfo = url.searchParams.get("data");

// Store values if found
if(encrypted_userInfo) {
  try {
    localStorage.setItem("user_info", encrypted_userInfo);
} catch (err) {
    console.error("Failed to parse user info from URL:", err);
  }
}
if (urlToken) localStorage.setItem("agent_token", urlToken);
if (urlTenantId) localStorage.setItem("tenant_id", urlTenantId);
if (urlCsrfToken) localStorage.setItem("csrf_token", urlCsrfToken);
if (urlIdentifier) localStorage.setItem("url_identifier", urlIdentifier);
if (userId) localStorage.setItem("user_id", userId);
if (urlRefreshToken) localStorage.setItem("refresh_token", urlRefreshToken);
if (urlValidUntil) localStorage.setItem("valid_until", urlValidUntil);

const userInfo = getLocalStorageItem("user_info") || {};
// --- Service Base URLs ---
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
   omniMcp:`${API_ENDPOINT}/mcp-service/thunai/service/mcp`,
   teamService:`${API_ENDPOINT}/slack-service/teamsai/v1`,
getewayService:`${API_ENDPOINT}/gateway-service/gateway/v1`,

geteway2Service:`${API_ENDPOINT}/gateway-service/application/v1`,
};

// --- Encryption Helpers ---
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

// --- CSRF Service ---
class CsrfService {
  private csrfRequest: Promise<string> | null = null;

  private isTokenValid(): boolean {
    console.log("env", IS_ENCRYPTION_FLOW, HTTP_ENCRYPT_KEY);
    
    const csrfToken = userInfo?.csrf_token || localStorage.getItem("csrf_token");
    const validUntil = userInfo?.csrf_valid_until || localStorage.getItem("valid_until");
    if (!csrfToken || !validUntil) return false;
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

          if (!token) throw new Error("CSRF token missing!");
          localStorage.setItem("csrf_token", token);
          localStorage.setItem("valid_until", validUntil.toString());
          userInfo.csrf_token = token;
          userInfo.csrf_valid_until = validUntil;
          setLocalStorageItem("user_info", JSON.stringify(userInfo));
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
      return userInfo?.csrf_token! || localStorage.getItem("csrf_token")!;
    }
    return this.fetchNewToken();
  }
}

const csrfService = new CsrfService();

// --- Token Management ---
export const getAccessToken = () => {
  return getLocalStorageItem("user_info")?.access_token || localStorage.getItem("agent_token") || null;
}
export const getRefreshToken = () => {
  return getLocalStorageItem("user_info")?.refresh_token || localStorage.getItem("refresh_token") || null;
}
export const getTenantId = () => {
  return userInfo?.default_tenant_id || localStorage.getItem("tenant_id") || null;
};
export const getUserId = () => {
  return userInfo?.profile?.user_id || localStorage.getItem("user_id") || null;
};
export const getUrlIdentifier = () => {
  return userInfo?.urlidentifier || localStorage.getItem("url_identifier") || null;
};
function updateTokens(access: string, refresh: string) {
  localStorage.setItem("agent_token", access);
  localStorage.setItem("refresh_token", refresh);
  const userInfo = getLocalStorageItem("user_info") || {};
  userInfo.access_token = access;
  userInfo.refresh_token = refresh;
  setLocalStorageItem("user_info", JSON.stringify(userInfo));
}
export function getLocalStorageItem(key: any) {
  
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

export function setLocalStorageItem(key: any, value: any) {
    if (value) {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value); 
      if(value.access_token){
        this.setCookie(value, value.expires_in);
      }
      localStorage.setItem(key, CryptoJS.AES.encrypt(valueToStore, HTTP_ENCRYPT_KEY).toString());
 
    } else {
      console.error('Invalid value to store in localStorage:', value);
    }
  }
// --- Axios Setup ---
const api = axios.create();

api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  try {
    const csrf = await csrfService.getCsrfToken();
    if (csrf) config.headers["x-csrftoken"] = csrf;
  } catch (err) {
    const fallbackCsrf = userInfo?.csrf_token || localStorage.getItem("csrf_token");;
    if (fallbackCsrf) config.headers["x-csrftoken"] = fallbackCsrf;
  }

  // 🔒 Encrypt payload if encryption flow is enabled
  if (IS_ENCRYPTION_FLOW && config.data && typeof config.data === "object") {
    try {
      config.data = { encrypted_payload: encryptData(config.data) };
    } catch (err) {
      console.error("Request encryption failed:", err);
    }
  }

  return config;
});

// --- Token Refresh Handling ---
let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];
const REFRESH_URL = `${SERVICE_BASE_URLS.accountService}/account/refresh/token/`;

api.interceptors.response.use(
  (response) => {
    // Decrypt encrypted_response if enabled
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
    const shouldRefreshToken =
      (status === 401 || status === 403 || status === 400) &&
      (message.includes("token expired") ||
        message.includes("account info updated") ||
        message.includes("invalid token") || // ✅ Added
        message.includes("token") || // ✅ Added (catches any token-related message)
        status === 401); // ✅ Always try on 401
    // Handle access token refresh
    // if (
    //   shouldRefreshToken
    // ) {
    //   if (!isRefreshing) {
    //     isRefreshing = true;
    //     try {
    //       const refresh_token = getRefreshToken();
    //       if (!refresh_token) throw new Error("No refresh token available");
    //       const oldRefreshToken = getRefreshToken();
    //       const res = await axios.post(
    //         REFRESH_URL,
    //         { token: refresh_token },
    //         {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${oldRefreshToken}`,
    //           },
    //         }
    //       );

    //       const { access_token, refresh_token: newRefresh } = res.data.data;
    //       updateTokens(access_token, newRefresh);

    //       // Retry all queued requests
    //       pendingRequests.forEach((cb) => cb(access_token));
    //       pendingRequests = [];
    //     } catch (err) {
    //       console.error("Token refresh failed:", err);
    //       n
    //       pendingRequests = [];
    //       throw err;
    //     } finally {
    //       isRefreshing = false;
    //     }
    //   }

    //   // Queue this request until refresh completes
    //   return new Promise((resolve) => {
    //     pendingRequests.push((newToken: string) => {
    //       error.config.headers.Authorization = `Bearer ${newToken}`;
    //       resolve(api(error.config));
    //     });
    //   });
    // }
    if (shouldRefreshToken) {
      const originalRequest = error.config;

      // Prevent infinite loops
      if (originalRequest._retry) {
        console.error(
          "Token refresh already attempted, redirecting to login..."
        );
        localStorage.removeItem("agent_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("emailencoded");
        localStorage.removeItem("csrf_token");
         localStorage.removeItem("user_info");
         window.location.href = `${DOMAIN}`;
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refresh_token = getRefreshToken();

          if (!refresh_token) {
            throw new Error("No refresh token available");
          }

          console.log("🔄 Refreshing token...");

          const res = await axios.post(
            REFRESH_URL,
            { token: refresh_token },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refresh_token}`,
              },
            }
          );

          const { access_token, refresh_token: newRefresh } = res.data.data;

          if (!access_token) {
            throw new Error("No access token received from refresh");
          }

          updateTokens(access_token, newRefresh);
          console.log("✅ Token refreshed successfully");

          // Update the original request with new token
          const emailEncoded = localStorage.getItem("emailencoded");
          if (emailEncoded) {
            originalRequest.headers["authorization"] = emailEncoded;
          } else {
            originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          }

          // Retry all queued requests
          pendingRequests.forEach((cb) => cb(access_token));
          pendingRequests = [];

          // Retry the original request
          return api(originalRequest);
        } catch (err: any) {
          console.error("❌ Token refresh failed:", err);

          const errorMessage =
            err?.response?.data?.message?.toLowerCase() || "";

          // Check if it's an invalid/expired refresh token
          if (
            errorMessage.includes("invalid refresh token") ||
            errorMessage.includes("token expired") ||
            errorMessage.includes("refresh token") ||
            err?.response?.status === 401 ||
            err?.response?.status === 403
          ) {
            console.log(
              "🚪 Invalid/Expired refresh token, redirecting to login..."
            );

            // Clear all tokens
            localStorage.removeItem("agent_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("emailencoded");
            localStorage.removeItem("csrf_token");
            localStorage.removeItem("tenant_id");
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
            localStorage.removeItem("user_email");
             localStorage.removeItem("user_info");

            // Clear pending requests
            pendingRequests = [];

            //         // Show error toast
            toast({
              title: "Waring",
              description: "Session expired. Redirecting to login...",
              // variant: "warning",
            });
            // toast.error("Session expired. Redirecting to login...");

            // Redirect to login
            setTimeout(() => {
              window.top.location.href = `${DOMAIN}`;
            }, 1000);

            return Promise.reject(new Error("Session expired"));
          }

          // For other errors, just reject
          pendingRequests = [];
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken: string) => {
          const emailEncoded = localStorage.getItem("emailencoded");
          if (emailEncoded) {
            originalRequest.headers["authorization"] = emailEncoded;
          } else {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }
          resolve(api(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
  // async (error) => {
  //   const status = error?.response?.status;
  //   const message = error?.response?.data?.message?.toLowerCase() || "";

  //   // Handle CSRF token errors
  //   if (status === 403 && message.includes("csrf token verification failed")) {
  //     try {
  //       await csrfService.fetchNewToken();
  //       return api(error.config);
  //     } catch (csrfErr) {
  //       console.error("CSRF refresh failed:", csrfErr);
  //       return Promise.reject(error);
  //     }
  //   }

  //   // Handle expired tokens
  //   if (
  //     (status === 401 || status === 403 || status === 400) &&
  //     (message.includes("token expired") ||
  //       message.includes("account info updated"))
  //   ) {
  //     if (!isRefreshing) {
  //       isRefreshing = true;
  //       try {
  //         const refresh_token = getRefreshToken();
  //         if (!refresh_token) throw new Error("No refresh token available");

  //         const res = await axios.post(
  //           REFRESH_URL,
  //           { token: refresh_token },
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${refresh_token}`,
  //             },
  //           }
  //         );

  //         const { access_token, refresh_token: newRefresh } = res.data.data;
  //         updateTokens(access_token, newRefresh);

  //         pendingRequests.forEach((cb) => cb(access_token));
  //         pendingRequests = [];
  //       } catch (err) {
  //         console.error("Token refresh failed:", err);
  //         pendingRequests = [];
  //         throw err;
  //       } finally {
  //         isRefreshing = false;
  //       }
  //     }

  //     return new Promise((resolve) => {
  //       pendingRequests.push((newToken: string) => {
  //         error.config.headers.Authorization = `Bearer ${newToken}`;
  //         resolve(api(error.config));
  //       });
  //     });
  //   }

  //   return Promise.reject(error);
  // }
);

// --- Generic API Request ---
export interface ApiRequestParams<T = any> {
  service: keyof typeof SERVICE_BASE_URLS;
  endpoint: string;
  method?: Method;
  data?: T | FormData;
  headers?: Record<string, string>;
}

export const apiRequest = async <T = any>({
  service,
  endpoint,
  method = "GET",
  data = null,
  headers = {},
}: ApiRequestParams<T>): Promise<T> => {
  try {
    const response = await api.request<T>({
      url: `${SERVICE_BASE_URLS[service]}/${endpoint}`,
      method,
      data,
      headers,
    });
    return response.data as T;
  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};

// --- Helper wrappers ---
export const requestApiFromData = async (
  method: string,
  endpoint: string,
  formData?: any,
  service?: keyof typeof SERVICE_BASE_URLS
) => {
  return apiRequest({
    service,
    endpoint,
    method: method as Method,
    data: formData,
  });
};

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
    data,
    headers: { "Content-Type": "application/json" },
  });
};
