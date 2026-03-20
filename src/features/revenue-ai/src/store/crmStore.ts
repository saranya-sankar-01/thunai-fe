import { toast } from "@/hooks/use-toast";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { customAppConfig } from "../lib/customAppConfig";
import { errorHandler, isFieldsEmpty } from "../lib/utils";
import { integrationServiceMap } from "../services/integrationServiceMap";
import { Application } from "../types/Application";
import { create } from "zustand";

type LoadingState = {
    applicationsLoading: boolean;
    connecting: boolean;
    disconnecting: boolean;
    manualSyncing: boolean;
    saving: boolean;
}
type LoadingKey = keyof LoadingState;

interface CrmStore {
    applications: Application[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    connectClick: boolean;
    setConnectClick: (connectClick: boolean) => void
    loadCrmApplications: () => Promise<void>;
    enableCRM: (payload: Record<string, string | boolean>) => Promise<void>;
    manualSync: (payload: Record<string, string>) => Promise<void>;
    connectApplication: (application: Application) => Promise<void>;
    disconnectApp: (app: Application, action?: string, index?: number, appType?: string) => Promise<boolean>;
    saveApplicationKeys: (application: Application, appType: string, values: Record<string, any>) => Promise<boolean>;
}

export const useCrmStore = create<CrmStore>((set, get) => ({
    applications: [],
    loading: {
        applicationsLoading: false,
        connecting: false,
        disconnecting: false,
        manualSyncing: false,
        saving: false
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    connectClick: false,
    setConnectClick: (connectClick: boolean) => set({ connectClick }),
    loadCrmApplications: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("applicationsLoading", true);
            const requestBody = {
                filter: [{ key_name: "categories", key_value: "CRM", operator: "==" }],
                page: { size: 50, page_number: 1 },
                sort: "asc",
                sortby: "name"
            }
            const response = await requestApi("POST", `${tenantId}/revenue/crm/enabledfilter/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                applications: response.data.data.data || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("applicationsLoading", false);
        }
    },

    enableCRM: async (payload: Record<string, string | boolean>) => {
        const { tenantId, loadCrmApplications } = get();
        try {
            const response = await requestApi("POST", `${tenantId}/contact/settings/crm/`, payload, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "User preferences updated successfully" });
            await loadCrmApplications()
        } catch (error) {
            errorHandler(error)
        }
    },

    manualSync: async (payload: Record<string, string>) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("manualSyncing", true)
            const response = await requestApi("POST", `${tenantId}/crm/thunai/manualsync/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to sync manually.")
            }
            toast({ title: "Success", description: "Manual sync completed successfully." })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("manualSyncing", false)
        }
    },

    connectApplication: async (application: Application) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("connecting", false);
            const { oauth_flow, is_connected, is_oauth_connected, admin_configure_enable, name, fields } = application;

            const connectUrl = `https://api.thunai.ai/oauth-service/oauth/v1/${application.name
                }${admin_configure_enable
                    ? `/${tenantId}`
                    : ""
                }/auth/login`;

            if (oauth_flow && !is_connected && !is_oauth_connected) {
                if (admin_configure_enable && !isFieldsEmpty(fields)) {
                    set({ connectClick: true })
                } else {
                    window.location.href = connectUrl;
                }
            } else if (oauth_flow && is_connected && !is_oauth_connected) {
                window.location.href = connectUrl
            } else {
                set({ connectClick: true })
            }

        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("connecting", false)
        }
    },

    disconnectApp: async (app: Application, action?: string, index?: number, appType?: string,) => {
        const { tenantId, setLoading, loadCrmApplications } = get();
        try {
            console.log(app, action);
            setLoading("disconnecting", true);
            const {
                oauth_flow,
                admin_configure_enable,
                application_id,
                action_application_id,
                name,
                oauth_application_id,
                multiple_account,
                application_ids
            } = app;

            const oauth2 = `${tenantId}/oauth2/app/configure/?id=${admin_configure_enable ? application_id : action_application_id
                }`;

            const delink = `${tenantId}/${name}/delink/account?id=${multiple_account ? application_ids[index] : oauth_application_id
                }`;

            let method: any | null;

            if (name === "salesforce" && action === "DISCONNECT_OAUTH") {
                // method = axios.get(delink);
                method = await requestApi("GET", delink, {}, "oauthServiceUri");
                toast({ title: "Success", description: "Disconnected Salesforce OAuth successfully" })
                await loadCrmApplications();
                return true;
            }

            if (oauth_flow && action !== "DELINK_PARTICULAR_ACC") {
                if (multiple_account) {
                    method = await requestApi("DELETE", oauth2, {}, "authService");
                } else {
                    if (name !== "salesforce") {
                        method = await requestApi("GET", delink, {}, "oauthServiceUri");
                    }
                }
            } else if (action === "DELINK_PARTICULAR_ACC") {
                method = await requestApi("GET", delink, {}, "oauthServiceUri");
            } else {
                method = await requestApi("DELETE", oauth2, {}, "authService");
            }
            if (method?.data?.status === "success") {
                toast({ title: "Success", description: "Application disconnected successfully" })
                await loadCrmApplications();
            }

            if (oauth_flow && !multiple_account && appType === "DYNAMIC_APP") {
                const appId = admin_configure_enable
                    ? application_id
                    : action_application_id;

                if (appId) {
                    // await axios.delete(oauth2, {});
                    await requestApi("DELETE", oauth2, {}, "authService");
                }
            }

            return true
        } catch (error) {
            errorHandler(error)
            return false;
        } finally {
            setLoading("disconnecting", false)
        }
    },

    saveApplicationKeys: async (application: Application, appType: string, values: Record<string, any>) => {
        const { setLoading, tenantId, loadCrmApplications } = get();
        try {
            setLoading("saving", true)
            if (appType === "DYNAMIC_APP") {
                let id: string | null;
                if (application.is_connected) {
                    if (application.oauth_flow && !application.is_oauth_connected) {
                        id = application.application_id;
                    } else if (isFieldsEmpty(application?.action_fields)) {
                        id = application.application_id;
                    } else {
                        id = application.action_application_id;
                    }
                } else {
                    id = application.action_application_id || null;
                }
                try {
                    // POST (Create) or PATCH (Update) based on appId presence
                    let response: any;
                    if (id) {
                        const payload = {
                            id,
                            name: application.name,
                            ...values,
                        };
                        response = await requestApi(
                            "PATCH",
                            "oauth2/app/configure/",
                            payload,
                            "authService"
                        );
                    } else {
                        const payload = {
                            id: application.id,
                            name: application.name,
                            ...values,
                        };
                        response = await requestApi(
                            "POST",
                            "oauth2/app/configure/",
                            payload,
                            "authService"
                        );
                    }
                    if (response.data.status === "success") {
                        toast({ title: "Success", description: "Configuration saved successfully!" });
                        await loadCrmApplications();
                        return true;
                    }
                } catch (error) {
                    errorHandler("Configuration failed!");
                    return false;
                }
            }
            if (appType === "CUSTOM_APP") {
                const getService = integrationServiceMap[application.name];
                const service = getService?.getState();
                try {
                    const appConfig = customAppConfig.find(
                        (app) => app.name == application.name
                    );
                    const saveFunctionName = service[appConfig.saveFunction];
                    saveFunctionName(values);
                    await loadCrmApplications();
                    return true;
                } catch (error: any) {
                    errorHandler("Configuration failed!");
                    return false;
                }
            }
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("saving", false)
        }
    }
}))