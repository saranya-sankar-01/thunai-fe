import CryptoJS from 'crypto-js';

/** 
 * ############################################################################
 * ENVIRONMENT CONFIGURATION
 * ############################################################################
 */
const API_ENDPOINT = "https://api.thunai.ai";
const HTTP_ENCRYPT_KEY = 'ThUn@I@18935C^RCEntra';

export const environment = {
  python_auth_service: `https://unifed-api.infisign.net/unifed-auth-service/unifed/`,
  AccountServiceUri: `${API_ENDPOINT}/account-service/ai/api/v1/`,
  reCaptchaSiteKey: '6LcQ6QQrAAAAAMPzqC5LEMbboS_8O2_dff34rvSC',
  encryptKey: 'ThUn@I@18935C^RCEntra',
  httpencryptKey: 'ThUn@I@18935C^RCEntra',
  passwordToken: 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnlZWGRmZEdWNGRDSTZJalkyWkdGbU1XVXlNVFpqTkdVek16TTJZekppTnpnMk1GOHhJaXdpZFhKc2FXUmxiblJwWm1sbGNpSTZJblJvZFc1aGFTSjkubnB0YXo0OVBQeThuNFNvWU04NTdnT05TZWJVbXIwTTlJLUcwcW5WcERKNDpNeWNoU1pUc1Nidm00RlkjdyNTMnd2WEZ5V25LajA3VQ==',
  redirectid: '66db021504bcf0854bd9a66c',
  logout_redirect_id: '66db021504bcf0854bd9a66c',
  isShowSignUp: true,
};

/** 
 * ############################################################################
 * STORAGE SERVICE WITH CRYPTOJS AES ENCRYPTION
 * ############################################################################
 */

/**
 * Store item in localStorage with AES encryption
 * @param key - Storage key
 * @param value - Value to store (will be stringified if not a string)
 */
export function setLocalStorageItem(key: string, value: any) {
  if (value) {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, CryptoJS.AES.encrypt(valueToStore, HTTP_ENCRYPT_KEY).toString());
  } else {
    console.error('Invalid value to store in localStorage:', value);
  }
}

/**
 * Get item from localStorage with AES decryption
 * @param key - Storage key
 * @returns Decrypted value (parsed as JSON if possible, otherwise raw string)
 */
export function getLocalStorageItem(key: string): any {
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

/** 
 * ############################################################################
 * CSRF TOKEN MANAGEMENT
 * ############################################################################
 */
class CsrfService {
  private csrfRequest: Promise<string> | null = null;

  /**
   * Check if the current CSRF token is valid
   * @returns true if token exists and hasn't expired
   */
  private isTokenValid(): boolean {
    const userInfo = getLocalStorageItem("user_info");
    const csrfToken = userInfo?.csrf_token || localStorage.getItem("csrf_token");
    const validUntil = userInfo?.csrf_valid_until || localStorage.getItem("valid_until");

    if (!csrfToken || !validUntil) {
      return false;
    }

    return Date.now() < Number(validUntil) * 1000;
  }

  /**
   * Fetch a new CSRF token from the API
   * @returns Promise resolving to the new CSRF token
   */
  async fetchNewToken(): Promise<string> {
    if (!this.csrfRequest) {
      this.csrfRequest = fetch(`${environment.AccountServiceUri}get-csrf-token/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(async (response) => {
          const data = await response.json();
          const token = data?.data?.csrfToken?.token || "";
          const validUntil = data?.data?.csrfToken?.valid_until;

          if (!token) {
            throw new Error("CSRF token is missing!");
          }

          // Update localStorage
          localStorage.setItem("csrf_token", token);
          localStorage.setItem("valid_until", validUntil?.toString() || "");

          // Update user_info with new CSRF token
          const userInfo = getLocalStorageItem("user_info") || {};
          userInfo.csrf_token = token;
          userInfo.csrf_valid_until = validUntil;

          try {
            setLocalStorageItem("user_info", userInfo);
          } catch (e) {
            console.error("Failed to store user info with CSRF:", e);
          }

          console.log("New CSRF Token Fetched:", token);
          this.csrfRequest = null;
          return token;
        })
        .catch((error) => {
          this.csrfRequest = null;
          console.error("Failed to fetch CSRF token:", error);
          throw error;
        });
    }

    return this.csrfRequest;
  }

  /**
   * Get a valid CSRF token (from cache or fetch new one)
   * @returns Promise resolving to a valid CSRF token
   */
  async getCsrfToken(): Promise<string> {
    if (this.isTokenValid()) {
      const userInfo = getLocalStorageItem("user_info");
      return userInfo?.csrf_token || localStorage.getItem("csrf_token") || "";
    }
    return this.fetchNewToken();
  }
}

// Create CSRF service instance
const csrfServiceInstance = new CsrfService();

/**
 * Get a valid CSRF token
 * Checks localStorage user_info first, fetches new token if expired or missing
 * @returns Promise resolving to CSRF token string
 */
export async function getCsrfToken(): Promise<string> {
  return csrfServiceInstance.getCsrfToken();
}

/**
 * Force refresh the CSRF token
 * @returns Promise resolving to new CSRF token string
 */
export async function refreshCsrfToken(): Promise<string> {
  return csrfServiceInstance.fetchNewToken();
}

/** 
 * ############################################################################
 * AUTHENTICATION SERVICE
 * ############################################################################
 */
export const authService = {
  /**
   * Get list of tenants for a given email
   * @param email - User's email address
   * @returns Array of tenants
   */
  getTenants: async (email: string) => {
    const response = await fetch(`${environment.python_auth_service}api/v1/get/tenants/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId: email, urlidentifier: 'thunai' })
    });
    const res = await response.json();
    return res.data;
  },

  /**
   * Login user with email and password
   * @param method - HTTP method (POST or PUT)
   * @param payload - Login credentials
   * @param tenantId - Selected tenant ID
   * @returns Login response data
   */
  login: async (method: string, payload: any, tenantId: string) => {
    const url = `${environment.python_auth_service}${tenantId}/magic/auth/login/password/`;
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Basic ${environment.passwordToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const res = await response.json();
    return res.data;
  },

  /**
   * Handle callback after login
   * @param code - Authorization code
   * @param tenantId - Tenant ID
   * @param authType - Authentication type (default: 'password')
   * @returns Callback data
   */
  callback: async (code: string, tenantId: string, authType = 'password') => {
    const params = new URLSearchParams({
      code,
      auth_type: authType,
      tenant_id: tenantId
    });
    const response = await fetch(`${environment.AccountServiceUri}account/callback/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  },

  /**
   * Manage password operations (forgot, reset, update)
   * @param action - Action type (FORGET, RESET, UPDATE)
   * @param tenantId - Tenant ID
   * @param body - Request body
   * @returns Response data
   */
  managePassword: async (action: string, tenantId: string, body: any) => {
    const url = `${environment.AccountServiceUri}${action.toLowerCase()}/password/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${environment.passwordToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...body, unifed_tenant_id: tenantId })
    });
    return response.json();
  }
};
