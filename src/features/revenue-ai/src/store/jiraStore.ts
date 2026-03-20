import { create } from "zustand";
// import axios from "axios";
import { errorHandler, getUserInfo } from "../lib/utils";
import { UserInfo } from "../types/UserInfo";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { JiraProject } from "../types/JiraProject";
import { toast } from "sonner";

interface JiraStore {
  projects: JiraProject[];
  loading: boolean;
  userInfo: UserInfo;
  loadProjects: (
    api_token: string,
    domainName: string,
    email: string
  ) => Promise<void>;
}

export const useJiraService = create<JiraStore>((set, get) => ({
  projects: [],
  loading: false,
  userInfo: getLocalStorageItem("user_info"),
  setLoading: (loading: boolean) => set({ loading }),

  loadProjects: async (apiToken: string, domainName: string, email: string) => {
    const { userInfo } = get();
    try {
      set({ loading: true });
      const payload = {
        apiToken,
        domainName,
        email,
        tenantId:
          userInfo?.default_tenant_id || localStorage.getItem("tenant_id"),
        userId: userInfo?.profile.user_id,
      };

      const response = await requestApi(
        "POST",
        "jira/get/sub/projects",
        payload,
        "intService"
      );

      if (response.data.status !== "success" || response.status === "error") {
        throw new Error(response.data.message || response.message);
      }

      const result = response.data.data || [];

      set({ projects: result });
      return result;
    } catch (error) {
      errorHandler(error?.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
