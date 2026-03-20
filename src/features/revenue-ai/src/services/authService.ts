import axios, { Method, ResponseType } from "axios";
const url = new URL(window.location.href);
import CryptoJS from "crypto-js";

// const urlToken = url.searchParams.get("token");
// const urlTenantId = url.searchParams.get("tenant_id");
// const urlCsrfToken = url.searchParams.get("csrf_token");
// const urlIdentifier = url.searchParams.get("url_identifier");
// const userId = url.searchParams.get("user_id");
// const urlRefreshToken = url.searchParams.get("refresh_token");
// const urlValidUntil = url.searchParams.get("valid_until");

// // Store in localStorage if found in URL
// if (urlToken) localStorage.setItem("agent_token", urlToken);
// if (urlTenantId) localStorage.setItem("tenant_id", urlTenantId);
// if (urlCsrfToken) localStorage.setItem("csrf_token", urlCsrfToken);
// if (urlIdentifier) localStorage.setItem("url_identifier", urlIdentifier);
// if (userId) localStorage.setItem("user_id", userId);
// if (urlRefreshToken) localStorage.setItem("refresh_token", urlRefreshToken);
// if (urlValidUntil) localStorage.setItem("valid_until", urlValidUntil);
const encrypted_userInfo = url.searchParams.get("data");
// console.log(encrypted_userInfo, "encr_user");

const IS_ENCRYPTION_FLOW = import.meta.env.VITE_IS_ENCRYPTION_FLOW === "true" ||
    window.env?.['IS_ENCRYPTION_FLOW'] === "true" ||
    window.env?.['IS_ENCRYPTION_FLOW'] === true;

const HTTP_ENCRYPT_KEY = import.meta.env.VITE_HTTP_ENCRYPT_KEY || window.env?.['ENCRYPTION_KEY'];
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || window.env?.['API_ENDPOINT'];

// console.log(IS_ENCRYPTION_FLOW, HTTP_ENCRYPT_KEY, API_ENDPOINT);

if (encrypted_userInfo) {
    try {
        localStorage.setItem("user_info", encrypted_userInfo);
    } catch (err) {
        console.error("Failed to parse user info from URL:", err);
    }
}
const userInfo = getLocalStorageItem("user_info") || {};
// console.log("userifo", userInfo);

// function to get and decrypt value from localStorage
export function getLocalStorageItem(key: any) {

    if (key) {
        const keyData = localStorage.getItem(key);
        if (keyData) {
            // console.log("http", HTTP_ENCRYPT_KEY);
            // console.log("key_data", keyData);

            const decrypteDATA = CryptoJS.AES.decrypt(keyData.trim(), HTTP_ENCRYPT_KEY);
            if (decrypteDATA) {
                const decryptData = decrypteDATA.toString(CryptoJS.enc.Utf8);
                // console.log(decryptData, "DECDATA")

                try {
                    try {
                        return JSON.parse(decryptData);
                    } catch (e) {
                        // console.log(decryptData, "DECRYPT")
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

// Function to set encrypted value in localStorage
export function setLocalStorageItem(key: any, value: any) {
    if (value) {
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);

        localStorage.setItem(key, CryptoJS.AES.encrypt(valueToStore, HTTP_ENCRYPT_KEY).toString());

    } else {
        console.error('Invalid value to store in localStorage:', value);
    }
}

// All service base URLs
export const SERVICE_BASE_URLS: Record<string, string> = {
    encryptKey: 'entrutient!@123',
    httpencryptKey: 'ent!2#$45%&*',
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
    samlService: `${API_ENDPOINT}/saml-service`,
    paymentService: `${API_ENDPOINT}/payment-service/payment/v1`,
    directoryService: `${API_ENDPOINT}/directory-service/thunai/v1`,
    revService: `${API_ENDPOINT}/rev-service/ai/api/v1`,

    // devUserManagementService: "https://dev-api.thunai.ai/rev-service/ai/api/v1",
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
        const csrfToken = userInfo?.csrf_token;
        const validUntil = userInfo?.csrf_valid_until;

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
                    userInfo.csrf_token = token;
                    userInfo.csrf_valid_until = validUntil;
                    // Store in localStorage
                    // localStorage.setItem("csrf_token", token);
                    // localStorage.setItem("csrf_valid_until", validUntil.toString());

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
            return userInfo?.csrf_token!;
        }
        return this.fetchNewToken();
    }
}
// Create CSRF service instance
const csrfService = new CsrfService();
const REFRESH_URL = `${SERVICE_BASE_URLS.accountService}/account/refresh/token/`;

// Token helpers
function getAccessToken() {
    return getLocalStorageItem("user_info")?.access_token;
}
function getRefreshToken() {
    return getLocalStorageItem("user_info")?.refresh_token;
}
function updateTokens(access: string, refresh: string) {
    userInfo.access_token = access;
    userInfo.refresh_token = refresh;
    setLocalStorageItem("user_info", userInfo);
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
        const fallbackCsrf = userInfo.csrf_token;
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
