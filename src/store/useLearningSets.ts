// store/useLearningSets.ts
import { create } from "zustand";
import { toast } from "sonner";
import { requestApi } from "@/services/authService";
interface LearningSetDirectiveAPI {
  resolve?: string;
  detect?: string;
  ingest?: string;
}

export interface LearningSetAPI {
  id: string;
  title: string;
  summary: string;
  status: string;
  version: string;
  accuracy?: number;
  directives: LearningSetDirectiveAPI;
  icon_key?:string;
}

interface LearningSetStore {
  loading: boolean;
  deletingId: string | null;

  learningSets: LearningSetAPI[];
  selectedSet: LearningSetAPI | null;

  fetchLearningSets: (tenantID: string | null) => Promise<void>;
  fetchLearningSetById: (tenantID: string | null, setId: string) => Promise<LearningSetAPI | null>;
  deleteLearningSet: (tenantID: string | null, setId: string) => Promise<void>;
   saveLearningSet: (
    tenantID: string | null,
    setId: string | null,
    payload: Partial<LearningSetAPI> & { directives: Record<string, string[]>  }
  ) => Promise<{ ok: boolean }>;
}


export const useLearningSets = create<LearningSetStore>((set,get) => ({
  loading: false,
  learningSets: [],
  deletingId: null,
    selectedSet: null, 
  fetchLearningSets: async (tenantID) => {
    // if (!tenantID) return;

    set({ loading: true });

    try {
   const response = await requestApi('GET',`brain/learning-sets/${tenantID}/`,null,'brainService')

      const result = response

      set({
        learningSets: result?.data || [],
        loading: false,
      });
    } catch (e) {
      console.error("Failed:", e);
    toast.error(e?.response?.data?.message || e?.response?.message || "Failed to Load!");
      set({ loading: false });
    }
  },
  fetchLearningSetById: async (tenantID, setId) => {
  if (!tenantID || !setId) return null;

  try {
    const response = await requestApi(
      "GET",
      `brain/learning-sets/${tenantID}/${setId}/`,
      null,
      "brainService"
    );

    let data = response.data
    if (Array.isArray(data)) data = data[0];

    set({ selectedSet: data });

    return data;
  } catch (err) {
    console.error("Error fetching single learning-set:", err);
    return null;
  }
},
saveLearningSet: async (
  tenantID: string | null,
  setId: string | null,
  payload: any
) => {
  if (!tenantID) return { ok: false, message: "Tenant missing" };

  try {
    const response = await requestApi(
      setId ? "PUT" : "POST",
      setId
        ? `brain/learning-sets/${tenantID}/${setId}/`
        : `brain/learning-sets/${tenantID}/`,
      payload,
      "brainService"
    );

    toast.success(response?.data?.message || response?.message || "Saved successfully!");
    // await get().fetchLearningSets(tenantID);
    return { ok: true };
  } catch (err: any) {
    console.error("Save error:", err);
    toast.error(err?.response?.data?.message || err?.response?.message || "Failed to save!");
    return { ok: false };
  }
},

   deleteLearningSet: async (tenantID, setId) => {
    if (!tenantID) return;

    set({ deletingId: setId });

    try {
      const response = await requestApi(
        "DELETE",
        `brain/learning-sets/${tenantID}/${setId}/`,
        null,
        "brainService"
      );

      toast.success(response?.data?.message || response?.message || "Deleted successfully!");

      // refresh the list
      await get().fetchLearningSets(tenantID);

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || err?.response?.message || "Failed to delete!");
    } finally {
      set({ deletingId: null });
    }}
}));
