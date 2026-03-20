import { getLocalStorageItem, requestApi } from "@/services/authService";
import { UserInfo } from "../types/UserInfo";
import { errorHandler, getUserInfo } from "../lib/utils";
import { toast } from "@/hooks/use-toast";
import { create } from "zustand";

export interface SlackChannel {
  channel_id: string;
  bot_mention?: { is_invite: boolean; chat_agent?: string };
  direct_message?: { is_invite: boolean; chat_agent?: string };
  meeting_summary?: { channel_id?: string[]; is_invite?: boolean };
  workflow_access?: string[];
  is_mcp?: boolean;
  is_brain_notes?: boolean;
  is_notes?: boolean;
}

interface SlackStore {
  slackAllData: SlackChannel[] | null;

  // === FUNCTIONS from Angular (names preserved) ===
  getSlackAllData: () => Promise<SlackChannel[]>;
  getSlackList: () => Promise<{ options: SlackChannel[]; value: string[] }>;
  saveMeetingList: (data: any) => Promise<void>;
  getDirectMessage: () => Promise<{ value: any }>;
  getMcpStatus: () => Promise<{ value: boolean }>;
  enableWorkflow: () => Promise<{ value: string[] }>;
  getTagBotList: () => Promise<{ options: SlackChannel[]; value: string[] }>;
  getSlackDirMsgData: () => Promise<any>;
  saveSlackDetails: (payload: any) => Promise<any>;
  saveTagBot: (data: any) => Promise<void>;
  getBotWidget: () => Promise<{ options: any; value: string }>;
  getDirectMsgDetial: () => Promise<{ options: any; value: string }>;
  getWidgets: () => Promise<any[]>;
  getBrainNotesList: () => Promise<{
    options: SlackChannel[];
    value: string[];
  }>;
  getNotesList: () => Promise<{ options: SlackChannel[]; value: string[] }>;
  SaveBrainNotes: (data: any) => Promise<void>;
  SaveNotes: (data: any) => Promise<void>;

  // utils
  userInfo: UserInfo;
  formatPayload: (payload: any) => any;
  processSlackUpdates: (added: string[], removed: string[]) => Promise<any>;
  processSlackBot: (
    added: string[],
    removed: string[],
    widget_id: string,
    existingChannelIds: string[]
  ) => Promise<any>;
  processBrainNotes: (
    url: string,
    added: string[],
    removed: string[],
    notes_type: any
  ) => Promise<any>;

  changeDirectMessage: (data: any) => Promise<void>;
}

export const useSlackStore = create<SlackStore>((set, get) => ({
  userInfo: getLocalStorageItem("user_info"),
  slackAllData: null,
  formatPayload: (payload: any) => ({
    direct_message: { is_invite: payload.directMessage || false },
    mention_bot: {
      channel_id: payload.channel_id,
      widget_id: payload.widget_id,
    },
    brain_notes: { channel_id: payload.brain_channel_id || [] },
    notes: { channel_id: payload.notes_channel_id || [] },
    meeting_summary: { channel_id: payload.meetingSummary },
    workflow_access: payload.workflow,
    is_mcp: payload.mcp || false,
  }),

  getSlackAllData: async () => {
    const { slackAllData, userInfo } = get();

    const tenant = userInfo?.default_tenant_id || "";

    if (slackAllData) return slackAllData;

    const res = await requestApi(
      "GET",
      `${tenant}/slack/channel`,
      {},
      "slackService"
    );
    const channels = res?.data?.data?.channel ?? [];

    set({ slackAllData: channels });
    return channels;
  },

  getSlackDirMsgData: async () => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";

    const res = await requestApi(
      "GET",
      `${tenant}/slack/channel`,
      {},
      "slackService"
    );
    return res.data?.data;
  },

  getSlackList: async () => {
    const data = await get().getSlackAllData();
    const value = data
      .filter((c) => c.meeting_summary?.is_invite)
      .map((c) => c.channel_id);
    return { options: data, value };
  },

  saveMeetingList: async (data: any) => {
    const newChannels = data.meetingSummary;
    const existing = await get().getSlackList();
    const added = newChannels.filter((id) => !existing.value.includes(id));
    const removed = existing.value.filter((id) => !newChannels.includes(id));
    await get().processSlackUpdates(added, removed);
  },

  processSlackUpdates: async (added, removed) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";

    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenant}/meeting/summary/channel`,
        { channel_id: added },
        "slackService"
      );

      toast({ description: res.data?.message || "Success" });
    }
    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenant}/meeting/summary/channel`,
        { data: { channel_id: removed } },
        "slackService"
      );

      toast({ description: res.data?.message || "Success" });
    }

    set({ slackAllData: null });
    return get().getSlackAllData();
  },

  saveSlackDetails: async (payload) => {
    const { formatPayload, userInfo } = get();
    const tenant = userInfo?.default_tenant_id;
    const updatedPayload = formatPayload(payload);

    const res = await requestApi(
      "POST",
      `${tenant}/slack/channel/configuration`,
      updatedPayload,
      "slackService"
    );
    set({ slackAllData: null });
    return res.data;
  },

  getDirectMessage: async () => {
    const res = await get().getSlackDirMsgData();
    return { value: res?.direct_message?.is_invite };
  },

  getMcpStatus: async () => {
    const res = await get().getSlackDirMsgData();
    return { value: res?.is_mcp };
  },

  enableWorkflow: async () => {
    const res = await get().getSlackDirMsgData();
    return { value: res?.workflow_access };
  },

  getWidgets: async () => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    const payload = {
      page: { size: 50, page_number: 1 },
      sort: "dsc",
      sortby: "created",
      filter: [],
    };
    const res = await requestApi(
      "POST",
      `/${tenant}/slack/chat/widget/filter/`,
      payload,
      "authService"
    );

    return res?.data?.data?.data ?? [];
  },

  getTagBotList: async () => {
    const data = await get().getSlackAllData();
    const value = data
      .filter((c) => c.bot_mention?.is_invite)
      .map((c) => c.channel_id);
    return { options: data, value };
  },

  getBrainNotesList: async () => {
    const data = await get().getSlackAllData();
    const value = data.filter((c) => c.is_brain_notes).map((c) => c.channel_id);
    return { options: data, value };
  },

  getNotesList: async () => {
    const data = await get().getSlackAllData();
    const value = data.filter((c) => c.is_notes).map((c) => c.channel_id);
    return { options: data, value };
  },

  getBotWidget: async () => {
    const slackData = await get().getSlackAllData();
    const widgets = await get().getWidgets();
    let chatAgent = "";
    slackData?.forEach((item) => {
      if (item.bot_mention?.is_invite) {
        chatAgent = item.bot_mention.chat_agent ?? "";
      }
    });
    return { options: widgets, value: chatAgent };
  },

  getDirectMsgDetial: async () => {
    const slackData = await get().getSlackAllData();
    const widgets = await get().getWidgets();
    let chatAgent = "";

    slackData?.forEach((item) => {
      if (item.direct_message?.is_invite) {
        chatAgent = item.direct_message.chat_agent ?? "";
      }
    });

    return { options: widgets, value: chatAgent };
  },
  processBrainNotes: async (
    url: string,
    added: string[],
    removed: string[],
    notes_type: any
  ) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";
    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenant}/${url}`,
        {
          channel_id: added,
          notes_type,
        },
        "slackService"
      );
      toast({ description: res.data?.message ?? "Success" });
    }

    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenant}/${url}`,
        { channel_id: removed, notes_type },
        "slackService"
      );

      toast({ description: res.data?.message ?? "Success" });
    }

    set({ slackAllData: null });
    return get().getSlackAllData();
  },
  SaveBrainNotes: async (data: any) => {
    const url = "/brain/notes/channel";

    const existing = await get().getBrainNotesList();
    const added = data.channel_id.filter(
      (id: string) => !existing.value.includes(id)
    );
    const removed = existing.value.filter(
      (id: string) => !data.channel_id.includes(id)
    );

    await get().processBrainNotes(url, added, removed, "brain_notes");
  },
  SaveNotes: async (data: any) => {
    const url = "/notes/channel";

    const existing = await get().getNotesList();
    const added = data.channel_id.filter(
      (id: string) => !existing.value.includes(id)
    );
    const removed = existing.value.filter(
      (id: string) => !data.channel_id.includes(id)
    );

    await get().processBrainNotes(url, added, removed, "notes");
  },
  saveTagBot: async (data: any) => {
    const slackData = await get().getSlackAllData();
    const current = slackData
      .filter((c) => c.bot_mention?.is_invite)
      .map((c) => c.channel_id);

    const added = data.channel_id.filter((id: string) => !current.includes(id));
    const removed = current.filter(
      (id: string) => !data.channel_id.includes(id)
    );

    await get().processSlackBot(added, removed, data.widget_id, current);
  },
  processSlackBot: async (added, removed, widget_id, existingChannelIds) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";

    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenant}/mention/bot/channel`,
        {
          channel_id: added.length ? added : existingChannelIds,
          widget_id,
        },
        "slackService"
      );
      toast({ description: res?.data?.message ?? "Success" });
    }

    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenant}/mention/bot/channel`,
        { channel_id: removed },
        "slackService"
      );
      toast({ description: res?.data?.message ?? "Success" });
    }

    set({ slackAllData: null });
    return get().getSlackAllData();
  },
  changeDirectMessage: async (data: any) => {
    const { userInfo } = get();
    const tenant = userInfo?.default_tenant_id || "";

    try {
      let res;
      if (data.directMessage) {
        res = await requestApi(
          "POST",
          `${tenant}/direct/message/access`,
          {},
          "slackService"
        );
      } else {
        res = await requestApi(
          "DELETE",
          `${tenant}/direct/message/access`,
          {},
          "slackService"
        );
      }

      toast({ description: res?.data?.message ?? "Success" });
      set({ slackAllData: null });
      await get().getSlackAllData();
    } catch (error) {
      errorHandler("Error updating Direct Message setting");
    }
  },
}));
