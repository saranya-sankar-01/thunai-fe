import { create } from "zustand";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { getUserInfo } from "../lib/utils";
import { toast } from "@/hooks/use-toast";
import { UserInfo } from "../types/UserInfo";

export interface TeamsChannel {
  channel_id: string;
  direct_message?: { is_invite: boolean; chat_agent?: string };
  bot_mention?: { is_invite: boolean; chat_agent?: string };
  meeting_summary?: { channel_id?: string[]; is_invite?: boolean };
  workflow_access?: string[];
  is_mcp?: boolean;
  is_brain_notes?: boolean;
  is_notes?: boolean;
  // any other fields returned by the backend
}

type WidgetItem = any;

interface TeamsStore {
  userInfo: UserInfo;
  // cache similar to slackAllData$ (shareReplay)
  teamsAllDataCache: TeamsChannel[] | null;

  // Methods (names preserved)
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
  userInfo: getLocalStorageItem("user_info"),

  // internal cache variable (mimics shareReplay(1))
  teamsAllDataCache: null,

  fetchTeamsAllData: async () => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const url = `${tenant}/teams/channel`;

    const response = await requestApi("GET", url, {}, "teamsService");
    const teamsAllDataPromise = response?.data?.data?.channel ?? [];

    return teamsAllDataPromise;
  },

  /* getTeamsDirMsgData * hits endpoint and returns res.data*/
  getTeamsDirMsgData: async () => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const url = `${tenant}/teams/channel`;
    const res = await requestApi("GET", url, {}, "teamsService");
    console.log(res, "TEAMS_DIR_MSG_DATA")
    return res?.data?.data;
  },

  /* getDirectMessage * returns { value } */
  getDirectMessage: async () => {
    const res = await get().getTeamsDirMsgData();
    console.log(res, "RES_DATA")
    const value = res?.direct_message;
    return { value };
  },

  getMcpStatus: async () => {
    const res = await get().getTeamsDirMsgData();
    return { value: res?.is_mcp };
  },

  /* getTeamsAllData * cached list of channels (mimics shareReplay) */
  getTeamsAllData: async () => {
    const data = await get().fetchTeamsAllData();
    // also sync to store state for visibility if needed
    set({ teamsAllDataCache: data });
    return data;
  },

  /* getTeamsBrainNotesList * returns { options, value } */
  getTeamsBrainNotesList: async () => {
    const res = await get().getTeamsAllData();
    const value = res
      .filter((c: any) => c.is_brain_notes)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  /* getTeamsList * { options, value } where value are channel_ids with meeting_summary */
  getTeamsList: async () => {
    const res = await get().getTeamsAllData();
    const value = res
      .filter((c: any) => c.meeting_summary)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  /* getTeamsChannelList * Similar to getTeamsList but uses .metting_summary?.is_invite (keeps original logic) */
  getTeamsChannelList: async () => {
    const res = await get().getTeamsAllData();
    // keep original (typo metting_summary preserved in logic)
    const value = res
      .filter((c: any) => c.metting_summary?.is_invite)
      .map((c: any) => c.channel_id);
    return { options: res, value };
  },

  /* getTagBotList */
  getTagBotList: async () => {
    const data = await get().getTeamsAllData();
    const value = data
      .filter((c: any) => c.bot_mention?.is_invite)
      .map((c: any) => c.channel_id);

    return { options: data, value };
  },

  /* getBotWidget * combines teamsAllData + widgets (forkJoin)*/
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

  /* formatPayload */
  formatPayload: (payload: any) => {
    return {
      direct_message: { is_invite: payload.directMessage || false },
      mention_bot: {
        channel_id: payload.bot_channel_id,
        widget_id: payload.widget_id,
      },
      brain_notes: { channel_id: payload.brain_channel_id || [] },
      notes: { channel_id: payload.notes_channel_id || [] },
      meeting_summary: { channel_id: payload.meetingSummary },
      is_mcp: payload.mcp || false
    };
  },

  /*saveTeamsDetails * POST -> invalidate cache (tap) */
  saveTeamsDetails: async (payload: any) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const updatedPayload = get().formatPayload(payload);
    const url = `${tenant}/teams/channel/configuration`;
    const res = await requestApi("POST", url, updatedPayload, "teamsService");
    set({ teamsAllDataCache: null });
    return res?.data;
  },

  /* saveTeamsDetail * here we return Promise */
  saveTeamsDetail: async (data: any) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const url = `${tenant}/direct/message/access`;
    if (data.directMessage) {
      return requestApi("POST", url, {}, "teamsService");
    } else {
      return requestApi("DELETE", url, {}, "teamsService");
    }
  },

  /* changeDirectMessage * keeps original subscribe side-effects (toasts) */
  changeDirectMessage: async (data: any) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const url = `${tenant}/direct/message/access`;
    try {
      let res: any;
      if (data.directMessage) {
        res = await requestApi("POST", url, {}, "teamsService");
      } else {
        res = await requestApi("DELETE", url, {}, "teamsService");
      }
      toast({ description: res?.data?.message ?? res?.message ?? "Success" });
      set({ teamsAllDataCache: null });
    } catch (error) {
      console.error(error);
    }
  },

  /* getDirectMsgDetial */
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

  /*getWidgets*/
  getWidgets: async () => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
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
    const url = `${tenant}/common/widget/filter/`;
    const res = await requestApi("POST", url, payload, "authService");
    const widgets = res?.data?.data?.data ?? [];
    return widgets;
  },
}));
