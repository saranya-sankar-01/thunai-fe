import * as CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";

import { UserInfo } from "@/types/UserInfo";
import { SERVICE_BASE_URLS } from "@/services/authService";

export const getEncrypt = (key: string): string => {
    return CryptoJS.AES.encrypt(key, SERVICE_BASE_URLS.encryptKey).toString();
};

export const getDecrypt = (key: string): string | any => {
    try {
        if (typeof key === "string") {
            const decrypted = CryptoJS.AES.decrypt(key, SERVICE_BASE_URLS.encryptKey);
            if (decrypted) {
                const str = decrypted.toString(CryptoJS.enc.Utf8);
                return str || key;
            }
        }
        return key;
    } catch (e) {
        return key;
    }
};

export const setLocalStorage = (key: string, value: any): void => {
    if (!value) return;
    const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);
    try {
        const encryptedData = CryptoJS.AES.encrypt(
            valueToStore,
            SERVICE_BASE_URLS.appSecretKey
        ).toString();
        localStorage.setItem(key, encryptedData);
    } catch (e) {
        console.error(`Failed to encrypt and set key ${key}:`, e);
    }
};

export const getLocalStorage = (key: string): any | null => {
    const keyData = localStorage.getItem(key);
    if (!keyData) return null;

    try {
        const decryptedData = CryptoJS.AES.decrypt(keyData.trim(), SERVICE_BASE_URLS.appSecretKey);
        const decryptedString = decryptedData.toString(CryptoJS.enc.Utf8);
        if (decryptedString) {
            try {
                return JSON.parse(decryptedString);
            } catch {
                return decryptedString;
            }
        }
    } catch (e) {
        console.error(`Failed to decrypt and retrieve key ${key}:`, e);
        return null;
    }

    return null;
};

export const clearCookie = (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.thunai.ai; secure; SameSite=HttpOnly`;
    document.cookie = `${name}=; max-age=0; path=/;`;
};

export const setCookie = (value: UserInfo, expiresAt: string): void => {
    const csrfToken = localStorage.getItem("csrfToken");
    if (!value.access_token) return;

    const date = new Date(expiresAt);
    if (isNaN(date.getTime())) return;

    const expires = "expires=" + date.toUTCString();
    const pathDomainSecure =
        "path=/; domain=.thunai.ai; secure; SameSite=HttpOnly";

    const cookieData: { [key: string]: string | undefined } = {
        access_token: value.access_token,
        default_tenant_id: value.default_tenant_id,
        urlidentifier: value.urlidentifier,
        user_id: value.profile?.user_id,
        csrf_token: csrfToken,
    };

    Object.entries(cookieData).forEach(([key, val]) => {
        if (val) {
            document.cookie = `${key}=${val}; ${expires}; ${pathDomainSecure}`;
        }
    });
};

export const decodeToken = (token: string): any => {
    try {
        const decoded = jwtDecode(token);
        return decoded;
    } catch (error) {
        console.error("Invalid Token: ", error);
        return null;
    }
};

export const getAccessToken = (): string | false => {
    const userInfo = getLocalStorage("userInfo");
    return userInfo ? userInfo.access_token : false;
};
