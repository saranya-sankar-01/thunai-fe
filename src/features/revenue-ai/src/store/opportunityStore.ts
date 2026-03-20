import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi, requestApiFromData } from "@/services/authService";
import { Opportunity } from "../types/Opportunity";
import { OpportunityFunnelView } from "../types/OpportunityFunnelView";
import { OpportunityStageAnalysis } from "../types/OpportunityStageAnalysis";
import { create } from "zustand";

type LoadingState = {
    opportunityLoading: boolean;
    getStageAnalysisLoading: boolean;
    creatingOpportunity: boolean;
    opportunityStageUpdating: boolean;
    opportunityVerifying: boolean;
    manualOpportunityForActivityLoading: boolean;
    listviewOpportunitiesLoading: boolean;
    funnelviewOpportunitiesLoading: boolean;
    mergingOpportunities: boolean;
    downloadingTemplate: boolean;
    opportunitiesBulkUploading: boolean;
    deletingOpportunity: boolean;
    deletingOpportunitySource: boolean;
}

type LoadingKey = keyof LoadingState;

interface OpportunityStore {
    opportunities: Opportunity[];
    stageAnalysis: OpportunityStageAnalysis;
    manualOpportunityForActivity: Opportunity[];
    listviewOpportunities: Opportunity[];
    funnelviewOpportunities: OpportunityFunnelView[];
    currency: string;
    avgConfidence: string;
    totalValue: number;
    listviewTotalValue: number;
    listviewAvgConfidence: number;
    listviewCurrency: string;
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    listviewCurrentPage: number;
    listviewTotalPages: number;
    listviewTotalItems: number;
    listviewPageSize: number;
    resetPagination: () => void;
    resetListviewPagination: () => void;
    setCurrentPage: (page: number) => void;
    setListviewCurrentPage: (page: number) => void;
    loadOpportunity: (filter: Record<string, string>[], query?: string) => Promise<void>;
    getStageAnalysis: (stages: string) => Promise<void>;
    createOpportunity: (payload: Record<string, any>) => Promise<boolean>;
    updateOpportunityStage: (opportunityId: string, payload: Record<string, any>) => Promise<boolean>;
    verifyOpportunity: (isReal: boolean, opportunityId: string, notes: string) => Promise<void>;
    getManualOpportunityForActivity: (email: string) => Promise<void>;
    loadListviewOpportunites: (filter: Record<string, any>[], query: string) => Promise<void>;
    loadFunnelviewOpportunities: () => Promise<void>;
    mergeOpportunities: (payload: Record<string, any>) => Promise<boolean>;
    downloadBulkuploadTemplate: () => Promise<void>;
    bulkUploadOpportunities: (file: File) => Promise<boolean>;
    deleteOpportunity: (id: string) => Promise<void>;
    deletingOpportunitySource: (opportunityId: string, saleId: string) => Promise<void>;
}

export const useOpportunityStore = create<OpportunityStore>((set, get) => ({
    opportunities: [],
    manualOpportunityForActivity: [],
    listviewOpportunities: [],
    funnelviewOpportunities: [],
    stageAnalysis: {
        stage_summary: {
            average_confidence_score: 0,
            stage_name: "",
            total_deal_value: 0,
            total_deals: 0,
        },
        top_deals: [],
    },
    currency: "",
    avgConfidence: "",
    totalValue: 0,
    listviewTotalValue: 0,
    listviewAvgConfidence: 0,
    listviewCurrency: "",
    loading: {
        opportunityLoading: false,
        getStageAnalysisLoading: false,
        creatingOpportunity: false,
        opportunityStageUpdating: false,
        opportunityVerifying: false,
        manualOpportunityForActivityLoading: false,
        listviewOpportunitiesLoading: false,
        funnelviewOpportunitiesLoading: false,
        mergingOpportunities: false,
        downloadingTemplate: false,
        opportunitiesBulkUploading: false,
        deletingOpportunity: false,
        deletingOpportunitySource: false
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    listviewCurrentPage: 1,
    listviewTotalPages: 1,
    listviewTotalItems: 0,
    listviewPageSize: 10,

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        //   const { filter } = get();
        get().loadOpportunity([]);
    },

    setListviewCurrentPage: (page: number) => {
        set({ listviewCurrentPage: page });
        //   const { filter } = get();
        get().loadListviewOpportunites([], "");
    },

    resetPagination: () => set({ currentPage: 1 }),
    resetListviewPagination: () => set({ listviewCurrentPage: 1 }),

    loadOpportunity: async (filter: Record<string, string>[], query?: string) => {
        const { setLoading, tenantId, currentPage } = get();
        try {
            setLoading("opportunityLoading", true);
            const requestBody = {
                filter,
                page: {
                    size: 10,
                    page_number: currentPage
                },
                ...(query && { q: query }),
                sort: "desc",
                sortby: "created",
            }
            const response = await requestApi("POST", `${tenantId}/opportunity/filter/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const result = response.data.data;
            set({
                opportunities: result.data || [],
                currency: result.currency,
                avgConfidence: result.avg_confidence,
                totalValue: result.total_value,
                currentPage: result.page_number,
                totalPages: Math.ceil(result.total / 10),
                totalItems: result.total,
                pageSize: 10,
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("opportunityLoading", false);
        }
    },

    getStageAnalysis: async (stages: string) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("getStageAnalysisLoading", true);
            const response = await requestApi("POST", `${tenantId}/opportunity/funnel/view/`, { stages }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const result = response.data.data;
            set({
                stageAnalysis: result.analysis || {
                    stage_summary: {
                        average_confidence_score: 0,
                        stage_name: "",
                        total_deal_value: 0,
                        total_deals: 0,
                    },
                    top_deals: [],
                },
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("getStageAnalysisLoading", false);
        }
    },

    createOpportunity: async (payload: Record<string, any>) => {
        const { setLoading, tenantId, loadOpportunity } = get();
        try {
            setLoading("creatingOpportunity", true);
            const response = await requestApi("POST", `${tenantId}/contacts/opportunity/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "New opportunity created successfully." });
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("creatingOpportunity", false);
        }
    },

    updateOpportunityStage: async (opportunityId: string, payload: Record<string, any>) => {
        const { setLoading, tenantId, loadOpportunity, loadListviewOpportunites } = get();
        try {
            setLoading("opportunityStageUpdating", true);
            const response = await requestApi("POST", `${tenantId}/${opportunityId}/stages/update`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "Opportunity updated successfully" })
            loadOpportunity([]);
            loadListviewOpportunites([], "");
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("opportunityStageUpdating", false);
        }
    },

    verifyOpportunity: async (isReal: boolean, opportunityId: string, notes: string) => {
        const { setLoading, tenantId, loadOpportunity } = get();
        console.log(notes)
        try {
            setLoading("opportunityVerifying", true);
            const payload = {
                feedback: isReal,
                opportunity_id: opportunityId,
                opportunity_reason: isReal ? "" : notes
            }
            const response = await requestApi("POST", `${tenantId}/opportunity/feedback/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            loadOpportunity([]);
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("opportunityVerifying", false);
        }
    },

    getManualOpportunityForActivity: async (email: string) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("manualOpportunityForActivityLoading", true);
            const response = await requestApi("GET", `${tenantId}/activity/manual/link-opportunity/?contact_email=${email}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const result = response.data.data;
            set({
                manualOpportunityForActivity: result.data || [],
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("manualOpportunityForActivityLoading", false);
        }
    },

    loadListviewOpportunites: async (filter: Record<string, any>[], query: string) => {
        const { setLoading, tenantId, listviewCurrentPage } = get();
        try {
            setLoading("listviewOpportunitiesLoading", true);
            const requestBody = {
                filter,
                ...(query && { q: query }),
                page: {
                    size: 10,
                    page_number: listviewCurrentPage
                },
                sort: "desc",
                sortby: "created",
            }
            const response = await requestApi("POST", `${tenantId}/opportunity/filter/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const result = response.data.data;
            set({
                listviewOpportunities: result.data || [],
                listviewTotalValue: result.total_value,
                listviewAvgConfidence: result.avg_confidence.toFixed(2),
                listviewCurrency: result.currency,
                listviewCurrentPage: result.page_number,
                listviewTotalPages: Math.ceil(result.overall_total / 10),
                listviewTotalItems: result.overall_total,
                listviewPageSize: 10,
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("listviewOpportunitiesLoading", false);
        }
    },

    loadFunnelviewOpportunities: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("funnelviewOpportunitiesLoading", true);
            const response = await requestApi("GET", `${tenantId}/opportunity/funnel/list/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const result = response.data.opportunities;
            set({
                funnelviewOpportunities: result || {},
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("funnelviewOpportunitiesLoading", false);
        }
    },

    mergeOpportunities: async (payload: Record<string, any>) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("mergingOpportunities", true);
            const response = await requestApi("POST", `${tenantId}/manual/merge/opportunities/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "Opportunities merged successfully" })
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("mergingOpportunities", false);
        }
    },

    downloadBulkuploadTemplate: async () => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("downloadingTemplate", true);
            const response = await requestApi("GET", `${tenantId}/add/crm/opportunities/bulk-upload/`, {}, "revService");
            const result = response.data.data;
            const headers = result.columns.map((col: { key: string; description?: string }) =>
                col.description ? `${col.key} (${col.description})` : col.key
            );
            const csvContent = headers.join(",");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);
            link.setAttribute("download", "opportunities.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("downloadingTemplate", false);
        }
    },
    bulkUploadOpportunities: async (file: File) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("opportunitiesBulkUploading", true);
            const formData = new FormData();
            if (file) {
                console.log(file);
                formData.append("file", file);
                const response = await requestApiFromData("POST", `${tenantId}/add/crm/opportunities/bulk-upload/`, formData, "revService");
                if (response.data.status !== "success") {
                    throw new Error(response.data.message);
                }
                toast({ title: "Success", description: response.data.message || "Opportunities uploaded successfully" })
            }
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("opportunitiesBulkUploading", false);
        }
    },
    deleteOpportunity: async (id: string) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("deletingOpportunity", true);
            const response = await requestApi("DELETE", `${tenantId}/contacts/opportunity/?opportunity_id=${id}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            toast({ title: "Success", description: "Opportunity deleted successfully" })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("deletingOpportunity", false);
        }
    },
    deletingOpportunitySource: async (opportunityId: string, saleId: string) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("deletingOpportunitySource", true);
            const response = await requestApi("DELETE", `${tenantId}/opportunity/source/?opportunity_id=${opportunityId}&sale_id=${saleId}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            toast({ title: "Success", description: "Source of this opportunity deleted successfully" })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("deletingOpportunitySource", false);
        }
    }
}))