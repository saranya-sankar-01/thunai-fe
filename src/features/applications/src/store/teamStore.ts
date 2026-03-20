import { create } from "zustand";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";

export interface TeamsChannel {
  channel_id: string;
  direct_message?: { is_invite: boolean; chat_agent?: string };
  bot_mention?: { is_invite: boolean; chat_agent?: string };
  metting_summary?: { channel_id?: string[]; is_invite?: boolean };
  workflow_access?: string[];
  is_mcp?: boolean;
  is_brain_notes?: boolean;
  is_notes?: boolean;
  // any other fields returned by the backend
}

type WidgetItem = any;

interface TeamsStore {
  teamsAllDataCache: TeamsChannel[] | null;
  tenantId: string;
  getDirectMessage: () => Promise<{ value: boolean | undefined }>;
  getTeamsBrainNotesList: () => Promise<{
    options: TeamsChannel[];
    value: string[];
  }>;
  fetchTeamsAllData: () => Promise<any>;
  getTeamsDirMsgData: () => Promise<any>;
  getTeamsAllData: () => Promise<TeamsChannel[]>;
  getTeamsList: () => Promise<{ options: TeamsChannel[]; value: string[] }>;
  getTeamsChannelList: () => Promise<{
    options: TeamsChannel[];
    value: string[];
  }>;
  getTagBotList: () => Promise<{ options: TeamsChannel[]; value: string[] }>;
  getBotWidget: () => Promise<{ options: WidgetItem[]; value: string }>;
  formatPayload: (payload: any) => any;
  saveTeamsDetails: (payload: any) => Promise<any>;
  saveTeamsDetail: (data: any) => Promise<any>;
  changeDirectMessage: (data: any) => Promise<void>;
  getDirectMsgDetial: () => Promise<{ options: WidgetItem[]; value: string }>;
  getWidgets: () => Promise<WidgetItem[]>;
}

export const useTeamsStore = create<TeamsStore>((set, get) => ({
  teamsAllDataCache: null,
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  fetchTeamsAllData: async () => {
    const { tenantId } = get();
    const url = `${tenantId}/teams/channel`;

    const response = await requestApi("GET", url, {}, "teamsService");
    const teamsAllDataPromise = response?.data?.data?.channel ?? [];

    return teamsAllDataPromise;
  },

  getTeamsDirMsgData: async () => {
    const { tenantId } = get();
    const url = `${tenantId}/teams/channel`;
    const res = await requestApi("GET", url, {}, "teamsService");
    console.log(res, "TEAMS_DIR_MSG_DATA");
    return res?.data?.data;
  },

  getDirectMessage: async () => {
    const res = await get().getTeamsDirMsgData();
    const value = res?.direct_message?.is_invite;
    return { value };
  },

  getMcpStatus: async () => {
    const res = await get().getTeamsDirMsgData();
    return { value: res?.is_mcp };
  },

  getTeamsAllData: async () => {
    const data = await get().fetchTeamsAllData();
    set({ teamsAllDataCache: data });
    return data;
  },

  getTeamsBrainNotesList: async () => {
    const res = await get().getTeamsAllData();
    const value = res
      .filter((c: any) => c.is_brain_notes)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  getTeamsList: async () => {
    const res = await get().getTeamsAllData();
    const value = res
      .filter((c: any) => c.metting_summary)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  getTeamsChannelList: async () => {
    const res = await get().getTeamsAllData();
    const value = res
      .filter((c: any) => c.metting_summary?.is_invite)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  getTagBotList: async () => {
    const data = await get().getTeamsAllData();
    const value = data
      .filter((c: any) => c.bot_mention?.is_invite)
      .map((c: any) => c.channel_id);

    return { options: data, value };
  },

  getBotWidget: async () => {
    const [teamsData, widgets] = await Promise.all([
      get().getTeamsAllData(),
      get().getWidgets(),
    ]);
    let chatAgent = "";
    if (Array.isArray(teamsData)) {
      for (const item of teamsData) {
        if (item.bot_mention?.is_invite) {
          chatAgent = item.bot_mention.chat_agent ?? "";
          break;
        }
      }
    }

    return { options: widgets, value: chatAgent };
  },

  formatPayload: (payload: any) => {
    return {
      direct_message: { is_invite: payload.directMessage || false },
      mention_bot: {
        channel_id: payload.bot_channel_id,
        widget_id: payload.widget_id,
      },
      brain_notes: { channel_id: payload.brain_channel_id || [] },
      notes: { channel_id: payload.notes_channel_id || [] },
      metting_summary: { channel_id: payload.mettingSummary },
      is_mcp: payload.mcp || false,
    };
  },

  saveTeamsDetails: async (payload: any) => {
    const { tenantId } = get();
    const updatedPayload = get().formatPayload(payload);
    const url = `${tenantId}/teams/channel/configuration`;
    const res = await requestApi("POST", url, updatedPayload, "teamsService");
    set({ teamsAllDataCache: null });
    return res?.data;
  },

  saveTeamsDetail: async (data: any) => {
    const { tenantId } = get();
    const url = `${tenantId}/direct/message/access`;
    if (data.directMessage) {
      return requestApi("POST", url, {}, "teamsService");
    } else {
      return requestApi("DELETE", url, {}, "teamsService");
    }
  },

  changeDirectMessage: async (data: any) => {
    const { tenantId } = get();
    const url = `${tenantId}/direct/message/access`;
    try {
      let res: any;
      if (data.directMessage) {
        res = await requestApi("POST", url, {}, "teamsService");
      } else {
        res = await requestApi("DELETE", url, {}, "teamsService");
      }
      toast.success(res?.data?.message ?? res?.message ?? "Success");
      set({ teamsAllDataCache: null });
    } catch (error) {
      console.error(error);
    }
  },

  getDirectMsgDetial: async () => {
    const teamsData = await get().getTeamsAllData();
    const widgets = await get().getWidgets();

    let chatAgent = "";
    if (Array.isArray(teamsData)) {
      for (const item of teamsData) {
        if (item.direct_message?.is_invite) {
          chatAgent = item.direct_message.chat_agent ?? "";
          break;
        }
      }
    }

    return { options: widgets, value: chatAgent };
  },

  getWidgets: async () => {
    const { tenantId } = get();
    const payload = {
      page: { size: 50, page_number: 1 },
      sort: "dsc",
      sortby: "created",
      filter: [
        {
          key_name: "interface",
          key_value: "chatbox",
          operator: "==",
        },
      ],
    };
    const url = `${tenantId}/common/widget/filter/`;
    const res = await requestApi("POST", url, payload, "authService");
    const widgets = res?.data?.data?.data ?? [];
    return widgets;
  },
}));
