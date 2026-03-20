// useAsanaService.js
import { create } from "zustand";
// import axios from "axios";
import { errorHandler, getUserInfo } from "../lib/utils";
import { WorkplaceItem } from "../types/WorkplaceItem";
import { AsanaProjectItem } from "../types/AsanaProjectItem";
import { UserInfo } from "../types/UserInfo";
import { getLocalStorageItem, requestApi } from "../services/authService";
import { toast } from "@/hooks/use-toast";

interface AsanaStore {
    workspaces: WorkplaceItem[];
    projects: AsanaProjectItem[];
    workspacesLoading: boolean;
    projectsLoading: boolean;
    userInfo: UserInfo;
    loadWorkplaces: (
        asana_token: string,
        tenantId: string,
        userId: string
    ) => Promise<WorkplaceItem[]>;
    loadProjects: (
        asana_token: string,
        tenantId: string,
        userId: string,
        workplaceId: string
    ) => Promise<AsanaProjectItem[]>;
}

export const useAsanaService = create<AsanaStore>((set, get) => ({
    workspaces: [],
    projects: [],
    workspacesLoading: false,
    projectsLoading: false,
    userInfo: getLocalStorageItem("user_info"),
    setWorkspacesLoading: (workspacesLoading: boolean) =>
        set({ workspacesLoading }),
    setProjectsLoading: (projectsLoading: boolean) => set({ projectsLoading }),

    loadWorkplaces: async (asana_token: string) => {
        const { userInfo } = get();
        try {
            set({ workspacesLoading: true });
            const requestBody = {
                tenantId:
                    userInfo?.default_tenant_id || localStorage.getItem("tenant_id"),
                userId: userInfo?.profile.user_id,
                asana_token,
            };
            const response = await requestApi(
                "POST",
                `asana/get/workspaces`,
                requestBody,
                "intService"
            );

            if (response.status === "error") {
                throw new Error(response.message);
            }

            const result: WorkplaceItem[] = response.data.data || [];
            set({ workspaces: result });
            return result;
        } catch (error) {
            errorHandler(error)
        } finally {
            set({ workspacesLoading: false });
        }
    },

    loadProjects: async (asana_token, workspaceId) => {
        const { userInfo } = get();
        try {
            set({ projectsLoading: true });
            const payload = {
                tenantId:
                    userInfo?.default_tenant_id || localStorage.getItem("tenant_id"),
                userId: userInfo?.profile.user_id,
                asana_token,
                workspaceId,
            };

            const response = await requestApi(
                "POST",
                "asana/list/projects",
                payload,
                "intService"
            );

            if (response.status === "error") {
                throw new Error(response.message)
            }

            const result = response.data.data || [];

            set({ projects: result });
            return result;
        } catch (error) {
            errorHandler(error?.message || error || "Failed to load");
        } finally {
            set({ projectsLoading: false });
        }
    },
}));
