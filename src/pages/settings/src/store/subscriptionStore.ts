import { create } from "zustand";
import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { SubscriptionItem } from "../types/Subscription";
import { SubscriptionPlan } from "../types/SubscriptionPlan";
import { toast } from "@/hooks/use-toast";
import { CommonWidget } from "../types/CommonWidget";

type LoadingState = {
  subscriptionLoading: boolean,
  planLoading: boolean,
  loadingCheckDowngrade: boolean,
  submittingTenants: boolean,
  loadingAgents: boolean,
  submittingAgents: boolean,
};

type SuccessState = {
  retainTenants: boolean,
  retainAgents: boolean,
  retainCalendar: boolean
}

type LoadingKey = keyof LoadingState;

type SuccessKey = keyof SuccessState;

interface SubscriptionStore {
  subscription: SubscriptionItem;
  loading: LoadingState;
  setLoading: (key: LoadingKey, loading: boolean) => void;
  retainSuccess: SuccessState;
  setRetainSuccess: (key: SuccessKey, success: boolean) => void;
  loadSubscription: () => Promise<void>;
  plans: SubscriptionPlan[];
  loadPlans: () => Promise<void>;
  checkDowngrade: (plan: SubscriptionPlan) => Promise<void>;
  submitSelectedTenants: (tenants: string[]) => Promise<void>;
  submitSelectedAgents: (agents: string[]) => Promise<void>;
  loadAgentsBySelectedTenant: (tenants: string[]) => Promise<void>;
  agents: CommonWidget[];
  matchedPlan: SubscriptionPlan | null;
  suggestedPlan: string[]
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: {
    credits_warning: 0,
    default_tenant: {
      details: {
        created: "",
        created_by: "",
        id: "",
        name: "",
        tenant_id: "",
        updated: "",
      },
      tenant_id: "",
    },
    feature_mapping: {},
    storage_percentage: 0,
    subscription: { credits: 0, last_payment_done: null, last_payment_link: null, last_payment_status: null, name: "", no_of_days: null, no_of_days_with_negative: null, storage: null, tenants: null, trial_active: false, trial_days: 0, trial_done: false },
    threshold: 0,
    trial_days_remaining: 0,
    usage: {
      credits: 0,
      storage: 0,
      tenants: 0,
    },
  },
  plans: [],
  agents: [],
  matchedPlan: null,
  suggestedPlan: [],
  loading: {
    subscriptionLoading: false,
    planLoading: false,
    loadingCheckDowngrade: false,
    submittingTenants: false,
    loadingAgents: false,
    submittingAgents: false,
  },
  retainSuccess: {
    retainTenants: false,
    retainAgents: false,
    retainCalendar: false
  },
  setLoading: (key, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    })),

  setRetainSuccess: (key, value) =>
    set((state) => ({
      retainSuccess: {
        ...state.retainSuccess,
        [key]: value,
      },
    })),

  loadSubscription: async () => {
    const { setLoading } = get();
    try {
      setLoading("subscriptionLoading", true);
      const response = await requestApi(
        "GET",
        "storage/analysis/",
        {},
        "accountService"
      );
      const result = response.data.data;

      set({
        subscription: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("subscriptionLoading", false);
    }
  },

  loadPlans: async () => {
    const { setLoading } = get();
    try {
      setLoading("planLoading", true);
      const response = await requestApi("GET", "plans", {}, "paymentService");
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      set({
        plans: response.data.data
      })
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("planLoading", false);
    }
  },

  checkDowngrade: async (plan: SubscriptionPlan) => {
    const { subscription, setLoading } = get();
    try {
      setLoading("loadingCheckDowngrade", true);
      const response = await requestApi("POST", "get/suggested/downgrade/plan", { current_plan: subscription.subscription.name, needed_plan: plan.name }, "paymentService");

      const match = response.data.data.plan_lists.find((p: SubscriptionPlan) => p.name === plan.name);

      set({
        matchedPlan: match,
        suggestedPlan: response.data.data.suggested_plan
      })

    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("loadingCheckDowngrade", false)
    }
  },

  submitSelectedTenants: async (tenants: string[]) => {
    const { setLoading, matchedPlan, setRetainSuccess } = get();
    try {
      setLoading("submittingTenants", true);
      const requestBody = {
        tenant_ids: tenants,
        plan_name: matchedPlan?.name
      }
      const response = await requestApi("POST", "downgrade/tenants/", requestBody, "authService");
      if (response.data.status !== "sucess") {
        throw new Error(response.data.message);
      }

      toast({
        title: "Success",
        variant: "success",
        description: "Tenants retained successfully",
      });
      setRetainSuccess("retainTenants", true);

    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("submittingTenants", false);
    }
  },

  loadAgentsBySelectedTenant: async (tenants: string[]) => {
    console.log(tenants)
    const { setLoading } = get();
    try {
      setLoading("loadingAgents", true);
      const requestBody = {
        tenant_ids: tenants,
        filter: [],
        page: {
          size: 100,
          page_number: 1,
        },
        sort: "asc",
      };
      const response = await requestApi("POST", "agents/list/", requestBody, "authService");
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      console.log(response.data.data)
      set({
        agents: response.data.data
      })
    } catch (error) {
      errorHandler(error)
    } finally {
      setLoading("loadingAgents", false)
    }
  },

  submitSelectedAgents: async (agents: string[]) => {
    const { setLoading, matchedPlan, setRetainSuccess } = get();
    try {
      setLoading("submittingAgents", true);
      const requestBody = {
        common_agent_ids: agents,
        plan_name: matchedPlan?.name
      }
      const response = await requestApi("POST", "downgrade/agents/", requestBody, "authService");
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }

      toast({
        title: "Success",
        variant: "success",
        description: "Agents retained successfully",
      });
      setRetainSuccess("retainAgents", true);
    } catch (error) {
      errorHandler(error)
    } finally {
      setLoading("submittingAgents", false)
    }
  }
}));
