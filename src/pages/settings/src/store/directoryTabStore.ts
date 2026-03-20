import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { AppIntegration } from "../types/AppIntegration";
import { PolicyPayload } from "../types/PolicyPayload";
import { SchedulerPayload } from "../types/SchedulerPayload";
import { UserMappingPayload } from "../types/UserMappingPayload";
import { create } from "zustand";

type LoadingState = {
    userMappingLoading: boolean;
    integrationAppLoading: boolean;
    testConfigurationLoading: boolean;
    syncDirectoryLoading: boolean;
}

type LoadingKey = keyof LoadingState;

interface DirectoryTabStore {
    integratedApps: AppIntegration[];
    activeIntegrationApps: ActiveIntegrationApp[];
    loading: LoadingState;
    filter: Record<string, string>[];
    setLoading: (key: LoadingKey, value: boolean) => void;
    setFilter: (filter: Record<string, string>[]) => void;
    loadIntegratedApps: (filter: Record<string, string>[]) => Promise<void>;
    loadActiveIntegrationApps: () => Promise<void>;
    setCurrentPage: (page: number) => void;
    currentPage: number;
    totalItems: number;
    totalPages: number;
    pageSize: number;

    // Add Directory Wizard State
    selectedApp: ActiveIntegrationApp | null;
    selectedStep: number;
    steps: {
        step: number;
        isActive: boolean;
        isCompleted: boolean;
        label: string;
        isEnabled: boolean;
    }[];
    setSelectedApp: (app: ActiveIntegrationApp | null) => void;
    setSelectedStep: (step: number) => void;
    updateStepCompletion: (step: number, isCompleted: boolean) => void;
    resetWizard: () => void;

    // API Actions
    fetchGroups: (payload: any) => Promise<any>;
    testConfiguration: (appName: string, payload: any) => Promise<any>;
    saveUserMapping: (appName: string, payload: UserMappingPayload) => Promise<any>;
    fetchIntegrationDetails: (id: string, urlIdentifier: string, orgId?: string) => Promise<any>;
    savePolicies: (payload: PolicyPayload) => Promise<any>;
    saveScheduler: (payload: SchedulerPayload) => Promise<any>;
    applySchedulerRules: (payload: any) => Promise<any>;
    fetchUserAttributes: (appName: string, clientId: string, urlIdentifier: string, orgId: string, privateVPC?: boolean) => Promise<any>;
    fetchSyncJobs: (payload: any) => Promise<any>;
    triggerSync: (appName: string, payload: any) => Promise<any>;
    addIntegration: (payload: any) => Promise<any>;
    deleteIntegration: (id: string, payload: any) => Promise<any>;

    // Button states for Wizard
    buttonStatus: string;
    setButtonStatus: (status: string) => void;
    isCancel: boolean;
    setIsCancel: (isCancel: boolean) => void;
}

export const useDirectoryTabStore = create<DirectoryTabStore>((set, get) => ({
    integratedApps: [],
    activeIntegrationApps: [],
    loading: {
        userMappingLoading: false,
        integrationAppLoading: false,
        testConfigurationLoading: false,
        syncDirectoryLoading: false,
    },
    filter: [],
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    setFilter: (filter: Record<string, string>[]) => set({ filter }),
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
    pageSize: 10,
    buttonStatus: 'Next',
    setButtonStatus: (status) => set({ buttonStatus: status }),
    isCancel: false,
    setIsCancel: (isCancel) => set({ isCancel }),
    setCurrentPage: (currentPage: number) => {
        set({ currentPage });
        const { filter } = get();
        get().loadIntegratedApps(filter);
    },
    loadIntegratedApps: async (filter: []) => {
        const { currentPage, setLoading } = get();
        const tenantId = localStorage.getItem("tenant__id");
        set({ filter });
        try {
            setLoading("integrationAppLoading", true);
            const requestBody = {
                filter,
                page: {
                    size: 50,
                    page_number: currentPage,
                },
                infisigntenantId: tenantId,
                tenantUniqueIdentifier: "entrans",
                urlIdentifier: "entrans",
            };

            const response = await requestApi(
                "POST",
                "directory/sync/filter/",
                requestBody,
                "authService"
            );
            const result = response.data.data;

            set({
                integratedApps: result.data,
                totalItems: result.overall_total,
                totalPages: Math.ceil((result.overall_total ?? 0) / 10),
                pageSize: 10,
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("integrationAppLoading", false);
        }
    },
    loadActiveIntegrationApps: async () => {
        const { setLoading } = get();
        try {
            setLoading("integrationAppLoading", true);
            const response = await requestApi(
                "GET",
                "master/integrationApp/list/",
                {},
                "directoryService"
            );
            set({
                activeIntegrationApps: response.data.data,
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("integrationAppLoading", false);
        }
    },

    // Wizard State Implementation
    selectedApp: null,
    selectedStep: 0, // 0 for initial app selection list (step 1 is technically basic info, but we use 0 for list)
    steps: [
        {
            step: 1,
            isActive: true, // Step 1 is Basic Info (after selection)
            isCompleted: false,
            label: 'Add Details',
            isEnabled: true,
        },
        {
            step: 2,
            isActive: false,
            isCompleted: false,
            label: 'User Mapping',
            isEnabled: false,
        },
        {
            step: 3,
            isActive: false,
            isCompleted: false,
            label: 'Policies',
            isEnabled: false,
        },
        {
            step: 4,
            isActive: false,
            isCompleted: false,
            label: 'Scheduler',
            isEnabled: false,
        },
        {
            step: 5,
            isActive: false,
            isCompleted: false,
            label: 'Job Details',
            isEnabled: false,
        },
    ],
    setSelectedApp: (app) => set({ selectedApp: app }),
    setSelectedStep: (step) => set({ selectedStep: step }),
    updateStepCompletion: (step, isCompleted) => set((state) => ({
        steps: state.steps.map((s) => s.step === step ? { ...s, isCompleted, isEnabled: true } : s)
    })),
    resetWizard: () => set({
        selectedApp: null,
        selectedStep: 0,
        steps: [
            { step: 1, isActive: true, isCompleted: false, label: 'Add Details', isEnabled: true },
            { step: 2, isActive: false, isCompleted: false, label: 'User Mapping', isEnabled: false },
            { step: 3, isActive: false, isCompleted: false, label: 'Policies', isEnabled: false },
            { step: 4, isActive: false, isCompleted: false, label: 'Scheduler', isEnabled: false },
            { step: 5, isActive: false, isCompleted: false, label: 'Job Details', isEnabled: false },
        ]
    }),

    // API Actions Implementation
    fetchGroups: async (payload: any) => {
        try {
            const response = await requestApi("POST", "directory/sync/groups/filter/", payload, "authService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return null;
        }
    },
    testConfiguration: async (appName: string, payload: any) => {
        const { setLoading } = get();
        try {
            setLoading("testConfigurationLoading", true);
            // Assuming endpoint follows pattern: {appName}/test/configuration/ or similar
            // Azure uses: azure/test/configuration/
            // AWS Cognito might use something else.
            // For now, let's assume the caller passes the correct path suffix or we construct it.
            // AzureBasicInformation used "azure/test/configuration/"
            // Let's rely on appName being "azure" or similar lowercased.
            const endpoint = `${appName.toLowerCase()}/test/configuration/`;
            const response = await requestApi("POST", endpoint, payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("testConfigurationLoading", false);
        }
    },
    saveUserMapping: async (appName: string, payload: UserMappingPayload) => {
        const { setLoading } = get();
        try {
            setLoading("userMappingLoading", true);
            const endpoint = `${appName.toLowerCase().replace(/ /g, '')}/users/mapattributes/add`;
            const response = await requestApi("POST", endpoint, payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error", message: error };
        } finally {
            setLoading("userMappingLoading", false);
        }
    },
    fetchIntegrationDetails: async (id: string, urlIdentifier: string, orgId: string = '') => {
        try {
            const response = await requestApi(
                "GET",
                `master/integration/get?id=${id}&urlIdentifier=${urlIdentifier}&orgId=${orgId}`,
                {},
                "directoryService"
            );
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return null;
        }
    },
    savePolicies: async (payload: PolicyPayload) => {
        try {
            const response = await requestApi("POST", "master/directory/policy/add", payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error", message: error };
        }
    },
    saveScheduler: async (payload: SchedulerPayload) => {
        try {
            const response = await requestApi("POST", "master/scheduler/add", payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error", message: error };
        }
    },
    applySchedulerRules: async (payload: any) => {
        try {
            const response = await requestApi("POST", "master/integration/apply/rules", payload, "directoryService");
            console.log(response);
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error", message: error };
        }
    },
    fetchUserAttributes: async (appName: string, clientId: string, urlIdentifier: string, orgId: string, privateVPC?: boolean) => {
        const { setLoading } = get();
        try {
            setLoading("syncDirectoryLoading", true);
            let keyId = 'client_id';
            if (appName.toLowerCase().replace(/ /g, '') === 'awscognito') {
                keyId = 'access_key_id';
            }

            let endpoint = `${appName.toLowerCase().replace(/ /g, '')}/users/attribute/?${keyId}=${clientId}&urlIdentifier=${urlIdentifier}&orgId=${orgId}`;
            if (privateVPC !== undefined) {
                endpoint += `&privateVPC=${privateVPC}`;
            }
            const response = await requestApi("GET", endpoint, {}, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("syncDirectoryLoading", false);
        }
    },
    fetchSyncJobs: async (payload: any) => {
        try {
            const response = await requestApi("POST", "directory/sync/jobs/filter/", payload, "authService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return null;
        }
    },
    triggerSync: async (appName: string, payload: any) => {
        const { setLoading } = get();
        try {
            setLoading("syncDirectoryLoading", true);
            const endpoint = `${appName.toLowerCase().replace(/ /g, '')}/users/sync/`;
            const response = await requestApi("POST", endpoint, payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("syncDirectoryLoading", false);
        }
    },
    addIntegration: async (payload: any) => {
        const { setLoading } = get();
        try {
            setLoading("syncDirectoryLoading", true);
            const response = await requestApi("POST", "master/integration/add", payload, "directoryService");
            return response?.data;
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("syncDirectoryLoading", false);
        }
    },
    deleteIntegration: async (id: string, payload: any) => {
        try {
            const response = await requestApi(
                "DELETE",
                `master/directoryIntegrations/${id}/`,
                payload,
                "directoryService"
                // Actually Angular uses environment.NodeDirectoryServiceUri.
                // In this codebase, "directoryService" usually maps to NodeDirectoryServiceUri. 
                // "authService" maps to AuthServiceUri.
                // Let's assume directoryService base on usage pattern for "master/..." endpoints unless specified.
                // Wait, Angular component uses `environment.NodeDirectoryServiceUri` for delete.
                // So it should be "directoryService".
            );
            // Angular code says: `this.apiService.deleteMethod(environment.NodeDirectoryServiceUri + ...)`
            return response?.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error", message: error };
        }
    }
}));
