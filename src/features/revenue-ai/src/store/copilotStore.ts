import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { SavedChat } from "../types/SavedChat";
import { create } from "zustand";

type LoadingState = {
    sendingMessage: boolean;
    loadingSavedChats: boolean;
    loadingConversation: boolean;
    savingChat: boolean;
    deletingChat: boolean;
}

type LoadingKey = keyof LoadingState;

type Message = {
    id: string;
    role: "user" | "agent";
    content: string;
    isStreaming?: boolean;
}

type ConnectionState = {
    showReconnectModal: boolean;
    reconnecting: boolean;
}

interface CopilotStore {
    socket: WebSocket | null;
    isConnected: boolean;
    connection: ConnectionState;
    setConnection: (key: keyof ConnectionState, value: boolean) => void;
    messages: Message[];
    savedChats: SavedChat;
    chatSessionId: string | null;
    activeResponseId: string | null;
    selectedConversation: string | null;
    connect: (url: string) => void;
    disconnect: () => void;
    reconnectSocket: (url: string) => void;
    sendUserMessage: (message: string) => void;
    startNewChat: () => void;
    loading: LoadingState;
    // savingHistory: boolean;
    tenantId: string;
    token: string;
    setLoading: (key: LoadingKey, value: boolean) => void;
    // setSavingHistory: (savingHistory: boolean) => void;
    saveChat: (title: string) => void;
    getSavedChats: () => Promise<void>;
    getSavedChatConversation: (uniqueId: string) => void;
    handleSelectConversation: (uniqueId: string) => void;
    deleteChat: (uniqueId: string) => void;
    // loadAnswer: (payload: string) => Promise<void>;
}

const streamTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useCopilotStore = create<CopilotStore>((set, get) => ({
    socket: null,
    isConnected: false,
    loading: {
        loadingConversation: false,
        loadingSavedChats: false,
        savingChat: false,
        sendingMessage: false,
        deletingChat: false
    },
    connection: {
        showReconnectModal: false,
        reconnecting: false
    },
    messages: [],
    savedChats: {
        sessions: [],
        count: 0,
        user_id: "",
        tenant_id: ""
    },
    chatSessionId: crypto.randomUUID(),
    activeResponseId: null,
    selectedConversation: null,
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
    token: getLocalStorageItem("user_info")?.access_token || "",
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    setConnection: (key, value) => set(state => ({
        connection: {
            ...state.connection,
            [key]: value
        }
    })),
    connect: (url: string) => {
        if (get().socket) return;
        const { tenantId, token, chatSessionId } = get();

        if (!tenantId || !token) {
            console.error("Missing tenantId or token");
            return;
        }

        const socket = new WebSocket(`${url}/${tenantId}/${token}/?unique_id=${chatSessionId}`);

        socket.onopen = () => {
            set(state => ({
                isConnected: true,
                connection: {
                    ...state.connection,
                    reconnecting: false,
                    showReconnectModal: false
                }
            }));
        };
        socket.onmessage = (event) => {
            // console.log("event", event);
            const data = JSON.parse(event.data);
            if (data.type !== "agent") return;
            const { activeResponseId } = get();
            if (!activeResponseId) return;

            const id = data.uniqueid;

            set((state) => {
                const existing = state.messages.find(m => m.id === activeResponseId);
                if (existing) {
                    return {
                        messages: state.messages.map(m => m.id === activeResponseId ? { ...m, content: m.content + data.data, isStreaming: true } : m),
                        loading: {
                            ...state.loading,
                            sendingMessage: false
                        }
                    }
                }

                return {
                    messages: [...state.messages, {
                        id: activeResponseId,
                        role: "agent",
                        content: data.data,
                        isStreaming: true
                    }],
                    loading: {
                        ...state.loading,
                        sendingMessage: false
                    }
                }
            });
            clearTimeout(streamTimers[activeResponseId]);

            streamTimers[activeResponseId] = setTimeout(() => {
                set((state) => ({
                    messages: state.messages.map(m => m.id === activeResponseId ? { ...m, isStreaming: false } : m),
                    activeResponseId: null,
                }))
            }, 800);

        };
        socket.onclose = () => {
            console.warn("Socket Closed!!!");
            set((state) => ({
                socket: null,
                isConnected: false,
                connection: {
                    ...state.connection,
                    showReconnectModal: true
                }
            }));
        };
        socket.onerror = (error) => {
            console.error("Socket Error!!!", error);
            set((state) => ({
                socket: null,
                isConnected: false,
                connection: {
                    ...state.connection,
                    showReconnectModal: true
                }
            }));
        };
        set({ socket });
    },
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
            set({ socket: null, isConnected: false });
        }
    },
    reconnectSocket: (url: string) => {
        const { connect, setConnection } = get();
        setConnection("reconnecting", true);
        setConnection("showReconnectModal", false);
        connect(url);
        setTimeout(() => {
            setConnection("reconnecting", true)
        }, 1000)
    },

    sendUserMessage: (message: string) => {
        const { socket } = get();
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn("Socket not ready. Current state:", socket?.readyState);
            return;
        }
        const responseId = crypto.randomUUID();
        set((state) => ({
            messages: [...state.messages, {
                id: crypto.randomUUID(),
                role: "user",
                content: message
            }],
            activeResponseId: responseId,
            loading: {
                ...state.loading,
                sendingMessage: true
            }
        }));

        socket.send(JSON.stringify({
            type: "text",
            text: message
        }))
    },

    startNewChat: () => {
        set({
            messages: [],
            chatSessionId: crypto.randomUUID(),
            activeResponseId: null,
            selectedConversation: null
        })
    },

    saveChat: async (title: string) => {
        const { socket, setLoading } = get();
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn("Socket not ready. Current state:", socket?.readyState);
            return;
        };
        setLoading("savingChat", true);
        socket.send(JSON.stringify({
            type: "save",
            title
        }))
        setTimeout(() => {
            setLoading("savingChat", false);
        }, 1000);
    },

    getSavedChats: async () => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("loadingSavedChats", true)
            const response = await requestApi("GET", `${tenantId}/rev/copilot/saved/sessions/`, {}, "revService");
            const result = response.data.data || {};
            // console.log(result, "RES")
            set({ savedChats: result });
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("loadingSavedChats", false)
        }
    },

    handleSelectConversation: (uniqueId: string) => {
        const { socket, disconnect, connect } = get();
        if (socket) {
            disconnect()
        }
        set({
            selectedConversation: uniqueId,
            chatSessionId: uniqueId,
            messages: [],
            activeResponseId: null,
        })
        const SOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || window.env?.['SOCKET_ENDPOINT'];
        connect(`wss://${SOCKET_ENDPOINT}/rev-service/ai/ws/rev-copilot-agent`);
    },

    getSavedChatConversation: async (uniqueId: string) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("loadingConversation", true)
            const response = await requestApi("GET", `${tenantId}/rev/copilot/histories/?unique_id=${uniqueId}`, {}, "revService");
            const result = response.data.data.histories || [];
            set({
                messages: result.flatMap(msg => [
                    {
                        id: crypto.randomUUID(),
                        role: "user",
                        content: msg.query
                    },
                    {
                        id: crypto.randomUUID(),
                        role: "agent",
                        content: msg.response
                    }
                ])
            });
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("loadingConversation", false)
        }
    },
    deleteChat: async (uniqueId: string) => {
        const { setLoading, tenantId, getSavedChats, startNewChat } = get();
        try {
            setLoading("deletingChat", true);
            const response = await requestApi("DELETE", `${tenantId}/rev/copilot/histories/?unique_id=${uniqueId}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            startNewChat();
            await getSavedChats();
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("deletingChat", false)
        }
    }
}));