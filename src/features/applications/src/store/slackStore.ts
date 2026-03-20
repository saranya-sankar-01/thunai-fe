import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";
import { create } from "zustand";

export interface SlackChannel {
  channel_id: string;
  bot_mention?: { is_invite: boolean; chat_agent?: string };
  direct_message?: { is_invite: boolean; chat_agent?: string };
  metting_summary?: { channel_id?: string[]; is_invite?: boolean };
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
  tenantId: string;
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
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  slackAllData: null,
  formatPayload: (payload: any) => ({
    direct_message: { is_invite: payload.directMessage || false },
    mention_bot: {
      channel_id: payload.channel_id,
      widget_id: payload.widget_id,
    },
    brain_notes: { channel_id: payload.brain_channel_id || [] },
    notes: { channel_id: payload.notes_channel_id || [] },
    metting_summary: { channel_id: payload.mettingSummary },
    workflow_access: payload.workflow,
    is_mcp: payload.mcp || false,
  }),

  getSlackAllData: async () => {
    const { slackAllData, tenantId } = get();

    if (slackAllData) return slackAllData;

    const res = await requestApi(
      "GET",
      `${tenantId}/slack/channel`,
      {},
      "slackService"
    );
    const channels = res?.data?.data?.channel ?? [];

    set({ slackAllData: channels });
    return channels;
  },

  getSlackDirMsgData: async () => {
    const { tenantId } = get();

    const res = await requestApi(
      "GET",
      `${tenantId}/slack/channel`,
      {},
      "slackService"
    );
    return res.data?.data;
  },

  getSlackList: async () => {
    const data = await get().getSlackAllData();
    const value = data
      .filter((c) => c.metting_summary?.is_invite)
      .map((c) => c.channel_id);
    console.log(value, "VALUE");
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
    const { tenantId } = get();

    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenantId}/meeting/summary/channel`,
        { channel_id: added },
        "slackService"
      );

      toast.success(res.data?.message || "Success");
    }
    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenantId}/meeting/summary/channel`,
        { data: { channel_id: removed } },
        "slackService"
      );

      toast.success(res.data?.message || "Success");
    }

    set({ slackAllData: null });
    return get().getSlackAllData();
  },

  saveSlackDetails: async (payload) => {
    const { formatPayload } = get();
    const { tenantId } = get();
    const updatedPayload = formatPayload(payload);

    const res = await requestApi(
      "POST",
      `${tenantId}/slack/channel/configuration`,
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
    const { tenantId } = get();
    const payload = {
      page: { size: 50, page_number: 1 },
      sort: "dsc",
      sortby: "created",
      filter: [],
    };
    const res = await requestApi(
      "POST",
      `/${tenantId}/slack/chat/widget/filter/`,
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
    const { tenantId } = get();
    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenantId}/${url}`,
        {
          channel_id: added,
          notes_type,
        },
        "slackService"
      );
      toast.success(res.data?.message ?? "Success");
    }

    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenantId}/${url}`,
        { channel_id: removed, notes_type },
        "slackService"
      );

      toast.success(res.data?.message ?? "Success");
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
    const { tenantId } = get();

    if (added.length) {
      const res = await requestApi(
        "POST",
        `${tenantId}/mention/bot/channel`,
        {
          channel_id: added.length ? added : existingChannelIds,
          widget_id,
        },
        "slackService"
      );
      toast.success(res?.data?.message ?? "Success");
    }

    if (removed.length) {
      const res = await requestApi(
        "DELETE",
        `${tenantId}/mention/bot/channel`,
        { channel_id: removed },
        "slackService"
      );
      toast.success(res?.data?.message ?? "Success");
    }

    set({ slackAllData: null });
    return get().getSlackAllData();
  },
  changeDirectMessage: async (data: any) => {
    const { tenantId } = get();

    try {
      let res;
      if (data.directMessage) {
        res = await requestApi(
          "POST",
          `${tenantId}/direct/message/access`,
          {},
          "slackService"
        );
      } else {
        res = await requestApi(
          "DELETE",
          `${tenantId}/direct/message/access`,
          {},
          "slackService"
        );
      }

      toast.success(res?.data?.message ?? "Success");
      set({ slackAllData: null });
      await get().getSlackAllData();
    } catch (error) {
      console.error(error);
      toast.success("Error updating Direct Message setting");
    }
  },
}));
