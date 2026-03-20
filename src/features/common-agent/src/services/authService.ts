// const url = new URL(window.location.href); // or use your URL string
// // const token = url.searchParams.get("token");
// // const tenant_id = url.searchParams.get("tenant_id");
// const csrf_token = url.searchParams.get("csrf_token");

import { getTenantId, requestApi } from "./workflow";

// // console.log({ token, tenant_id, csrf_token });
const url = new URL(window.location.href);
const urlToken = url.searchParams.get("token");
const urlTenantId = url.searchParams.get("tenant_id");
const urlCsrfToken = url.searchParams.get("csrf_token");
const urlIdentifier = url.searchParams.get("url_identifier");
const userId = url.searchParams.get("user_id")
const urlRefreshToken = url.searchParams.get("refresh_token")
const urlValidUntil = url.searchParams.get("valid_until")

// Store in localStorage if found in URL
if (urlToken) localStorage.setItem("agent_token", urlToken);
if (urlTenantId) localStorage.setItem("tenant_id", urlTenantId);
if (urlCsrfToken) localStorage.setItem("csrf_token", urlCsrfToken);
if(urlIdentifier) localStorage.setItem("url_identifier",urlIdentifier);
if(userId) localStorage.setItem("user_id",userId)
if(urlRefreshToken) localStorage.setItem("refresh_token", urlRefreshToken)
if(urlValidUntil) localStorage.setItem("valid_until",urlValidUntil)

export async function updateTokens(newToken: string, newRefreshToken: string) {
  localStorage.setItem("agent_token", newToken);
  localStorage.setItem("refresh_token", newRefreshToken);
}
// NEW: CSRF Token Management
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
      this.csrfRequest = fetch(`https://api.thunai.hdsupply.com/account-service/ai/api/v1/get-csrf-token/`)
        .then(async (response) => {
          const data = await response.json();
          const token = data?.data?.csrfToken?.token || "";
          const validUntil = data?.data?.csrfToken?.valid_until;

          if (!token) {
            throw new Error("CSRF token is missing!");
          }

          localStorage.setItem("csrf_token", token);
          localStorage.setItem("valid_until", validUntil.toString());

          console.log("New CSRF Token Fetched:", token);
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

const csrfService = new CsrfService();

// Retrieve from localStorage
const getStoredToken = () => localStorage.getItem("agent_token");
const getStoredTenantId = () => localStorage.getItem("tenant_id");
const getStoredCsrfToken = () => localStorage.getItem("csrf_token");
const getRefreshToken =() => localStorage.getItem("refresh_token")

const token = getStoredToken();
// console.log("token",token)
// const tenant_id = getStoredTenantId() 
const csrf_token = getStoredCsrfToken();
const refresh_token = getRefreshToken();

// console.log("acces_token",token)
// console.log('refresh_token',refresh_token)
const API_ENDPOINT = window['env']['API_ENDPOINT'];

const API_BASE =
  `${API_ENDPOINT}/auth-service/ai/api/v1`;
export interface ApiOptions {
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall<T = any>({ url, method = "GET", body, headers = {} }: ApiOptions): Promise<T> {
  async function refreshAccessToken(refresh_token) {
  const refreshUrl = 
    `${API_ENDPOINT}/account-service/ai/api/v1/account/refresh/token/`;
  const payload = JSON.stringify({ token: refresh_token });
 const freshCsrf = await csrfService.getCsrfToken();
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRefreshToken()}`,
      "Content-Type": "application/json",
      "x-csrftoken": freshCsrf
    },
    body: payload,
  });

  if (response.status === 403) {
    console.error(
      "Refresh token expired or invalid. Clearing authentication data."
    );
    throw new Error("Authentication expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(
      "Refresh token request failed with status " + response.status
    );
  }
  const jsonResponse = await response.json();
  const newAccessToken = jsonResponse.data?.access_token;
  const newRefreshToken = jsonResponse.data?.refresh_token;
  if (!newAccessToken || !newRefreshToken) {
    throw new Error("New token(s) not received.");
  }
  return { access_token: newAccessToken, refresh_token: newRefreshToken };
}
  function extractErrors(obj: any, parentKey = ""): string[] {
    let messages: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(value)) {
        messages.push(`${fieldPath}: ${value.join(", ")}`);
      } else if (typeof value === "object" && value !== null) {
        messages = messages.concat(extractErrors(value, fieldPath));
      } else {
        messages.push(`${fieldPath}: ${value}`);
      }
    }

    return messages;
  }
  try {
    // const response = await fetch(url, {
    //   method,
    //   headers: {
    //     "Content-Type": "application/json",
    //     devicetype:"chromeplugin",
    //     ...headers, 
    //   },
    //   body: body ? JSON.stringify(body) : undefined,
    // });
        const freshCsrf = await csrfService.getCsrfToken();
async function doRequest(extraHeaders: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
   "x-csrftoken": freshCsrf,
      // ...headers,
        Authorization: `Bearer ${getStoredToken()}`,
      ...extraHeaders
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
let response = await doRequest();
let data:any = await response.json()
if (response.status === 403 && data.message?.toLowerCase().includes("csrf token verification failed")) {
  console.log("CSRF token invalid, fetching new one...");
  try {
    const newCsrf = await csrfService.fetchNewToken();
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": newCsrf, // Retry with new CSRF token
        Authorization: `Bearer ${getStoredToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    data = await response.json();
  } catch (csrfError) {
    console.error("Failed to refresh CSRF token:", csrfError);
    throw new Error("CSRF token refresh failed");
  }
}
  if (response.status === 403 || response.status === 401 || response.status === 400) {
      if (data.message?.toLowerCase().includes("token expired") || 
          data.message?.toLowerCase().includes("account info updated please get updated token")) {
        console.warn("Access token expired. Refreshing token...");
        const newTokens = await refreshAccessToken(getRefreshToken());
        await updateTokens(newTokens.access_token, newTokens.refresh_token);
        response = await doRequest({ Authorization: `Bearer ${newTokens.access_token}` });
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(`Request failed after token refresh: ${response.status}`);
        }
      } else {
        throw new Error(`Authentication error: ${data.message}`);
      }
    } else if (!response.ok) {
      throw new Error(`Request failed: ${data.message || response.status}`);
    }
 if (!response.ok) {
      let errorMessage = "Something went wrong";
      
      try {
       const errorData = data || await response.json();
       if (errorData.message && typeof errorData.message === "object") {
          const fieldErrors = extractErrors(errorData.message);
          errorMessage = fieldErrors.join("\n");
        }  else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
      } catch (parseError) {
        console.warn("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}
const tenant_id = getTenantId();
export const fetchVoicesData = async (method) => {
  try {
    const payload = {    
        "page": {
          "size": 10,
          "page_number": 1
        },
        "sort": "asc",
        "sortby": "created",
        "filter": []
    }
    // const voicesResponse = await apiCall({
    //   url: `${API_BASE}/get/voice/master/`,
    //   method:method,
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // },
    //   body: {
    //     "page": {
    //       "size": 10,
    //       "page_number": 1
    //     },
    //     "sort": "asc",
    //     "sortby": "created",
    //     "filter": []
    //   }
    // });
const voicesResponse = await requestApi(
      method,
      `get/voice/master/`,payload,
      "authService"
    );
    return voicesResponse.data;
  } catch (error) {
    console.error("Error fetching voices data:", error);
    throw error;
  }
};

export const fetchWidgetData = async (id: string) => {
  try {
    // const response = await apiCall({
    //   url: `${API_BASE}/${tenant_id}/common/widget/?id=${id}`,
    //   method: "GET",
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // }
    // });
const response = await requestApi(
      "GET",
      `${tenant_id}/common/widget/?id=${id}`,
      null,
      "authService"
    );
    return response;
  } catch (error) {
    console.error("Error fetching widget data:", error);
    throw error;
  }
};

export async function saveAgent(payload: any, agentId?: string,save_method?:string) {
 try {
    //  const url = `${API_BASE}/${tenant_id}/common/widget/`;
    // const method = save_method;
    // return apiCall({
    //   url,
    //   method,
    //   body: payload,
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // }
    // });
    const response = await requestApi(save_method,`${tenant_id}/common/widget/`,payload,"authService");
    return response
  }catch (error) {
    console.error("Error saving agent:", error);
    
    // Re-throw with better error message
    if (error?.response?.data?.message) {
      throw new Error(error?.response?.data?.message);
    } else if (error?.message) {
      throw new Error(error?.message);
    } else {
      throw new Error("Failed to save agent. Please try again.");
    }
  }
}

export const deleteAgent = async (agentId: string) => {
  try {
    // const response = await apiCall({
    //   url: `${API_BASE}/${tenant_id}/common/widget/`,
    //   method: "DELETE",
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // },
    //   body: {
    //     id: agentId
    //   }
    // });
    const payload = {
      id: agentId
    };
const response = await requestApi(
      "DELETE",
      `${tenant_id}/common/widget/`,
      payload,
      "authService"
    );
    return response;
  } catch (error) {
    console.error("Error deleting agent:", error);
    
    // Re-throw with better error message
    if (error?.response?.data?.message) {
      throw new Error(error?.response?.data?.message);
    } else if (error?.message) {
      throw new Error(error?.message);
    } else {
      throw new Error("Failed to delete agent. Please try again.");
    }
  }
};

// Add this to your authService.js file
export const fetchAgentsFilter = async (filterOptions = {}) => {
  try {
    const defaultPayload = {
      sort: "desc",
      sortby: "created",
      page: {
        size: 10,
        page_number: 1
      }
    };

    const payload = {
      ...defaultPayload,
      ...filterOptions
    };
console.log(payload);

    // const response = await apiCall({
    //   url: `${API_BASE}/${tenant_id}/common/widget/filter/`,
    //   method: "POST",
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // },
    //   body: payload
    // });
const response = await requestApi(
      "POST",
      `${tenant_id}/common/widget/filter/`,
      payload,
      "authService"
    );
    return response;
  } catch (error) {
    console.error("Error fetching agents filter:", error);
    throw error;
  }
};



export const fetchConversationHistory = async (METHOD: string, payload,widgetId: string) => {
  try {
//     const defaultPayload ={
//  widget_id: widgetId,
//     page: {
//         page_number: 1,
//         size: 20
//     }
//     }
    // const response = await apiCall({
    //   url: `${API_BASE}/${tenant_id}/common/widget/history/`,
    //   method: METHOD,
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // },
    //   body:payload
    // });
 const response = await requestApi(
     METHOD,
      `${tenant_id}/common/widget/history/`,
      payload,
      "authService"
    );
    return response;
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    throw error;
  }
};

export const manageCustomEmail = async (operation, emailAddress) => {
  try {
    // const response = await apiCall({
    //   url: `${API_BASE}/${tenant_id}/custom/email/`,
    //   method: "POST",
    //   // headers: {
    //   //   Authorization: `Bearer ${token}`
    //   // },
    //   body: {
    //     operation,
    //     email_address: emailAddress
    //   }
    // });
    const payload = {
      operation,
      email_address: emailAddress
    };
const response = await requestApi(
      "POST",
      `${tenant_id}/custom/email/`,
payload,
      "authService")
      console.log("Custom email response:", response);
    return response;
  } catch (error) {
    console.error(`Error ${operation} custom email:`, error);
    throw error;
  }
};
