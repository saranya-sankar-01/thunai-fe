import { create } from "zustand";
import { toast } from "sonner";
import { OdooUid } from "@/types/OdooUid";
import { getLocalStorageItem, requestApi } from "@/services/authService";

interface OdooStore {
  uid: OdooUid;
  tenantId: string;
  loading: boolean;
  loadOdooUid: (
    api_token: string,
    db_name: string,
    email: string,
    tenant_id: string,
    your_odoo_url: string
  ) => Promise<void>;
}

export const useAsanaService = create<OdooStore>((set, get) => ({
  uid: null,
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  loadOdooUid: async (
    api_token: string,
    db_name: string,
    email: string,
    odooUrl: string
  ) => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const requestBody = {
        api_token,
        db_name,
        email,
        tenantId,
        your_odoo_url: odooUrl,
      };
      const response = await requestApi(
        "POST",
        `gateway/v1/odoo/get/uid`,
        requestBody,
        "gatewayService"
      );
      const result: OdooUid = response.data.data || [];
      set({ uid: result });
    } catch (error) {
      console.error("Load Content Error:", error);
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
