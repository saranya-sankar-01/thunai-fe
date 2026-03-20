import { create } from "zustand";
import { GithubProjectItem } from "@/types/GithubProjectItem";
import { UserInfo } from "@/types/UserInfo";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";

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
        tenantId: userInfo?.default_tenant_id || "",
        userId: userInfo?.profile.user_id || "",
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

      if (response.status === "error") {
        throw new Error(response.message);
      }

      const result = response.data.data.data || [];
      set({ projects: result });
      return result;
    } catch (error) {
      console.error("Load Content Error:", error);
      toast.error(error?.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
