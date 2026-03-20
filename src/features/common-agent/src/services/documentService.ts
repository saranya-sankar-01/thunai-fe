const getStoredToken = () => localStorage.getItem("agent_token");
const getStoredTenantId = () => localStorage.getItem("tenant_id");
const getStoredCsrfToken = () => localStorage.getItem("csrf_token");
const getRefreshToken =() => localStorage.getItem("refresh_token")

const token = getStoredToken();
const tenant_id = getStoredTenantId() 
const csrf_token = getStoredCsrfToken();
const refresh_token = getRefreshToken();

export async function updateTokens(newToken: string, newRefreshToken: string) {
  localStorage.setItem("agent_token", newToken);
  localStorage.setItem("refresh_token", newRefreshToken);
}
const API_ENDPOINT = window['env']['API_ENDPOINT'];
const API_BASE =
  `${API_ENDPOINT}/document-service/ai/api/v1`;
export interface ApiOptions {
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}
export async function apiCall<T = any>({
  url,
  method = "GET",
  body,
  headers = {},
}: ApiOptions): Promise<T> {
      async function refreshAccessToken(refresh_token) {
  const refreshUrl = 
    `${API_ENDPOINT}/account-service/ai/api/v1/account/refresh/token/`;
  const payload = JSON.stringify({ token: refresh_token });

  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRefreshToken()}`,
      "Content-Type": "application/json",
      "x-csrftoken": csrf_token
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
  try {
    const isFormData = body instanceof FormData;

    // const response = await fetch(url, {
    //   method,
    //   headers: {
    //     devicetype: "chromeplugin",
    //     ...(isFormData ? {} : { "Content-Type": "application/json" }),
    //     ...headers,
    //   },
      // body: body
      //   ? isFormData
      //     ? body // send FormData directly
      //     : JSON.stringify(body)
      //   : undefined,
    // });
async function doRequest(extraHeaders: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
     ...(isFormData ? {} : { "Content-Type": "application/json" }),
   "x-csrftoken": csrf_token,
      // ...headers,
        Authorization: `Bearer ${getStoredToken()}`,
      ...extraHeaders
    },
     body: body
        ? isFormData
          ? body // send FormData directly
          : JSON.stringify(body)
        : undefined,
  });
}
let response = await doRequest();
let data:any = await response.json()
  if (response.status === 403 || response.status === 401 || response.status === 400) {
      if (data.message?.toLowerCase().includes("token expired") || 
          data.message?.toLowerCase().includes("account info updated please get updated token")) {
        console.warn("Access token expired. Refreshing token...");
        
        // Get new tokens
        const newTokens = await refreshAccessToken(getRefreshToken());
        
        // Update token in storage
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
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
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


export const uploadFile = async (formData: FormData) => {
  return await apiCall({
    url: `${API_BASE}/${tenant_id}/file/upload/`,
    method: "POST",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
    body: formData,
  });
};
