import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { create } from "zustand";

interface Payload {
    is_enabled?: boolean;
    provider?: string;
    from?: string;
    cc?: string[];
    bcc?: string[];
    smtp_host?: string;
    smtp_api_host?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string;
    smtp_use_tls?: boolean;
    smtp_use_ssl?: boolean;
    smtp_auth_required?: boolean;
    api_host?: string;
    api_port?: string;
    api_username?: string;
    api_password?: string;
    api_use_tls?: boolean;
    api_use_ssl?: boolean;
    api_auth_required?: boolean;
}

interface SmtpStore {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    saveSMTPSettings: (payload: Payload) => Promise<void>;
}

export const useSmtpStore = create<SmtpStore>((set) => ({
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
    saveSMTPSettings: async (payload: Payload) => {
        try {
            set({ loading: true });
            const response = await requestApi("POST", "smtp/config/", payload, "authService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
        } catch (error) {
            errorHandler(error);
        } finally {
            set({ loading: false });
        }
    },
}));
