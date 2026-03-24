import { create } from "zustand";
import { requestApi } from "@/services/authService";

interface Tenant {
  name: string;
  tenant_id: string;
  created: string;
  updated: string;
  created_by: string;
  id: string;
  email: string;
  is_default: boolean;
}

interface TenantStore {
  TenantData: Tenant[] | null;
  Error: string | null;
  FetchTenantData: () => Promise<void>;
}

const FetchTenant = create<TenantStore>((set) => ({
  TenantData: null,
  Error: null,

  FetchTenantData: async () => {
    set({ Error: null });

    const payload = {
      filter: [],
      page: { size: 100, page_number: 1 },
      page_number: 1,
      size: 100,
      sort: "asc",
    };

    try {
      const response = await requestApi(
        "POST",
        `/tenant/filter/`,
        payload,
        "accountService"
      );

      set({
        TenantData: response?.data || [],
      });
    } catch (err: any) {
      set({
        Error: err?.message || "Failed to fetch TenantData",
      });
    }
  },
}));

export default FetchTenant;