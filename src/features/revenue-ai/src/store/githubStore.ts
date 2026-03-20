// useAsanaService.js
import { create } from "zustand";
// import axios from "axios";
import { errorHandler, getUserInfo } from "../lib/utils";
import { GithubProjectItem } from "../types/GithubProjectItem";
import { UserInfo } from "../types/UserInfo";
import { getLocalStorageItem, requestApi } from "@/services/authService";

interface GithubStore {
  projects: GithubProjectItem[];
  loading: boolean;
  userInfo: UserInfo;
  loadProjects: (
    asana_token: string,
    tenantId: string,
    userId: string,
    workplaceId: string
  ) => Promise<void>;
}

export const useGithubService = create<GithubStore>((set, get) => ({
  projects: [],
  loading: false,
  userInfo: getLocalStorageItem("user_info"),
  setLoading: (loading: boolean) => set({ loading }),

  loadProjects: async (apiToken: string, owner: string, repo: string) => {
    const { userInfo } = get();
    try {
      set({ loading: true });
      const payload = {
        tenantId:
          userInfo?.default_tenant_id || localStorage.getItem("tenant_id"),
        userId: userInfo?.profile.user_id,
        owner,
        repo,
        api_token: apiToken,
      };

      const response = await requestApi(
        "POST",
        `gateway/v1/thunai/github_issues/get/projects`,
        payload,
        "gatewayService"
      );

      if (response.data.status !== "success" || response.status === "error") {
        throw new Error(response.data.message || response.message);
      }

      const result = response.data.data.data || [];
      set({ projects: result });
      return result;
    } catch (error) {
      console.error("Load Content Error:", error);
      errorHandler(error?.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
