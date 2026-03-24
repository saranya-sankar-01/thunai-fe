import { useState,useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { ConversationHistory } from "./ConversationHistory";
import { ChatBubble } from "./ChatBubble";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { SettingsPanel } from "./SettingsPanel";
import { DocumentEditor } from "../../components/document/DocumentEditor";
import { useDocument } from "../../hooks/useDocument";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ToastContainer } from "react-toastify";
import {
  PanelLeftClose,
  PanelLeft,
  Menu,
  Loader2,
} from "lucide-react";
import thunaiLogoFull from "@/assets/thunai-logo-full.png";
import thunaiLogoIcon from "@/assets/thunai-logo-icon.png";
import {
  loadChatConversations,
  fetchChatHistory,
} from "../../services/chatHistoryFilter";
import "react-loading-skeleton/dist/skeleton.css";
import { ChatSkeleton } from "./chatSkeleton";
import { useSocketConnection } from "./socketService";
import { useDrivePermissions } from "./DrivePermissionsProvider";
import { WarningPopup } from "./WarningPopup";
import { format, set } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { getTenantId, requestApi } from "@/services/authService";
import { useSidebarContext } from "../../pages/Index";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string | null;
  reasoning?: string;
  in_response_to?: string;
  sources?: any[];
  images?: any[];
  tabType?: string;
  isStreaming?: boolean;
  isFeedbackResponse?: boolean; // ✅ NEW - Added for feedback tracking
  file_return?: any[];
  toolType?: string[];
  referredSources?: any[] | null;
  imageSources?: any[] | null;
  messageTime?: string;
  canvas_content?: string;
  responseId?: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  chatBotType?: string;
  unique_id?: string;
  object_id?: string;
}

export const ChatLayout = () => {
  const {
    currentDocument,
    isDocumentVisible,
    allDocuments,
    createDocument,
    updateDocument,
    updateDocumentTitle,
    closeDocument,
    showDocument,
    selectDocument,
  } = useDocument();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Chat",
      lastMessage: "start a conversation",
      isActive: true,
      timestamp: "Just now",
    },
  ]);
  const mcpSocketRef = useRef<WebSocket | null>(null);
  const websearchSocketRef = useRef<WebSocket | null>(null);
  const [activeTool, setActiveTool] = useState<
    null | "canvas" | "analytics" | "websearch" | "mcp"
  >(null);

  const [generalMessages, setGeneralMessages] = useState<Message[]>([]);
  const [meetingsMessages, setMeetingsMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [showConversations, setShowConversations] = useState(true);
  const [
    wasConversationsVisibleBeforeCanvas,
    setWasConversationsVisibleBeforeCanvas,
  ] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const [chatInitiated, setChatInitiated] = useState(false);
  let reasoningMessage = "";
  const { driveEnabled, driveConnections, isDriveLoading } =
    useDrivePermissions();
  const lastSentMessageTabRef = useRef<string>("general");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tenantID = getTenantId(); // Replace with your actual tenant ID or get from env/config
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCanvasMode, setIsCanvasMode] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);
  const [isMcpLoading, setIsMcpLoading] = useState(false);
  const [isWebsearchLoading, setIsWebsearchLoading] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState("");
  const [canvasContent, setCanvasContent] = useState("");
  const [canvasProgress, setCanvasProgress] = useState(0);
  const [canvasStatusMessage, setCanvasStatusMessage] = useState("");
  const [canvasDocuments, setCanvasDocuments] = useState<
    Record<string, { id: string; title: string; content: string }>
  >({});
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [contentAgentConnected, setContentAgentConnected] = useState(false);
  const canvasContentRef = useRef("");
  const canvasMessageRef = useRef("");
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [analyticsAgentConnected, setAnalyticsAgentConnected] = useState(false);
  const [mcpAgentConnected, setmcpAgentConnected] = useState(false);
  const [webSearchAgentConnected, setwebSearchAgentConnected] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  // ✅ NEW: Feedback tracking state
  const [awaitingFeedbackResponse, setAwaitingFeedbackResponse] =
    useState(false);

  const [warningPopup, setWarningPopup] = useState({
    isOpen: false,
    message: "",
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const {
    isConnected,
    socketRef,
    sendMessage,
    generateUniqueId,
    setupMessageHandler,
    connectSocket,
    messageHandlerSetRef,
    sendContentAgentFeedback,
    contentAgentSocketRef,
    // analyticsSocketRef,
    // sendAnalyticsMessage,
    connectToolSocket,
    sendToolMessage,
    sendRawMessageToActiveSocket,
  } = useSocketConnection(tenantID);
  const [currentChatUniqueId, setCurrentChatUniqueId] = useState<string | null>(
    null
  );
  const [searchParams] = useSearchParams();

  // Use shared sidebar context from Index
  const { sidebarVisible, toggleSidebar } = useSidebarContext();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Use this ref to track first render
  const isFirstRender = useRef(true);
  const isCreatingNewChatRef = useRef(false);
  const canvasSocketRef = useRef<WebSocket | null>(null);
  const handleRefreshConversations = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const fetchChats = useCallback(async (pageNumber = 1, isInitial = false) => {
    if (isInitial) {
      setIsLoadingChat(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Call the service
      const response = await loadChatConversations(pageNumber);

      // ✅ FIX 3: Ensure these match the object keys returned from the service above
      const newConvs = response?.conversations || [];
      const moreAvailable = response?.hasMore || false;

      setHasMore(moreAvailable);

      if (isInitial) {
        const tempChatId = generateUniqueId();
        const newChat = {
          id: tempChatId,
          title: "New Chat",
          lastMessage: "Start a new conversation",
          isActive: true,
        };
        connectSocket();
        setIsUserTyping(false);
        setConversations([newChat, ...newConvs]);
        setPage(1);
      } else {
        setConversations((prev) => {
          // Use a Set to prevent duplicate IDs
          const existingIds = new Set(prev.map((c) => c.object_id));
          const filteredNew = newConvs.filter((c) => !existingIds.has(c.object_id));
          return [...prev, ...filteredNew];
        });
      }
    } catch (error) {
      console.error("Pagination Error:", error);
    } finally {
      setIsLoadingChat(false);
      setIsLoadingMore(false);
    }
  }, [tenantID]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchChats(nextPage, false);
        return nextPage;
      });
    }
  }, [isLoadingMore, hasMore, fetchChats]);

  useEffect(() => {
    fetchChats(1, true);
  }, [refreshTrigger, fetchChats]);


  const handleUpdateConversations = (updatedConversations) => {
    setConversations(updatedConversations);
  };
  const getAllMessages = () => {
    const combinedMessages = [...generalMessages, ...meetingsMessages]
      .filter((msg) => msg.id) // Filter out any undefined messages
      .sort((a, b) => {
        // console.log("filter id");
        return 0;
      });

    return combinedMessages;
  };
  const getCurrentMessages = () => {
    // Use combined messages instead of tab-specific ones
    return getAllMessages();
  };
  const accumulatedTurnRef = useRef(""); // buffer for current turn
  const reasoningRef = useRef("");
  const currentResponseIdRef = useRef<string | null>(null);
  const handleSocketMessage = (response) => {
    console.log("response frm ", response);
    // console.log("currentResponseIdRef=====>",currentResponseIdRef)

    // which was Off the loader when the keepaLive response comes also so i command this line..!
    setIsFeedbackLoading(false);

    if (response?.response_id) {
      currentResponseIdRef.current = response.response_id;
      // console.log(" Captured response_id from top level:", response.response_id);
    }
    // Also check in nested data structures
    else if (response?.data?.response_id) {
      currentResponseIdRef.current = response.data.response_id;
      // console.log(" Captured response_id from data:", response.data.response_id);
    }
    else if (response?.data?.data?.response_id) {
      currentResponseIdRef.current = response.data.data.response_id;
      // console.log("Captured response_id from data.data:", response.data.data.response_id);
      currentResponseIdRef.current = response?.response_id;
    }


    // If we just captured a response_id and there are AI messages without it, update them
    if (currentResponseIdRef.current) {
      setGeneralMessages((prev) => {
        let updated = false;
        const newMessages = prev.map((msg) => {
          // Update AI messages that don't have a responseId yet
          if (!msg.isUser && !msg.responseId && !msg.isFeedbackResponse) {
            updated = true;
            return {
              ...msg,
              responseId: currentResponseIdRef.current || undefined,
            };
          }
          return msg;
        });
        return updated ? newMessages : prev;
      });
    }

    // ✅ Handle session ID updates
    if (response?.session_id) {
      console.log("✅ session_id from server:", response.session_id);
      if (
        !currentChatUniqueId ||
        currentChatUniqueId === "1" ||
        currentChatUniqueId.length < 10
      ) {
        setCurrentChatUniqueId(response.session_id);
        setActiveConversationId(response.session_id);
        setConversations((prev) =>
          prev?.map((conv) =>
            conv.isActive
              ? {
                ...conv,
                id: response.session_id,
                object_id: response.session_id,
              }
              : conv
          )
        );
      }
    }
    if (response.message_type === "model_initialization_status") {
      setIsUserTyping(response.session_initialized)
      return;
    }
    if (response.message_type === "reasoning") {
      const content = response.message || "";

      reasoningRef.current += content + (response.turn_complete ? "[SEP]" : "");

      setCurrentReasoning(reasoningRef.current);
      return;
    }

    // Handle feedback response from thumbs up/down
    if (response.type === "chat_message" && response.data &&
      // response.data?.feedback === true &&
      response.data.status === "done") {
      // console.log(" Feedback response received:", {
      //   result: response.data.result?.substring(0, 100),
      //   status: response.data.status,
      //   feedback: response.data.feedback
      // });

      setGeneralMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          content: response?.data?.result || "Thank you for your feedback!",
          isUser: false,
          tabType: activeTab,
          responseId: currentResponseIdRef.current || undefined,
          timestamp: new Date().toISOString(),
          sources: [],
          isFeedbackResponse: true,
        },
      ]);
      setAwaitingFeedbackResponse(false);
      setIsFeedbackLoading(false);
      setIsLoading(false);
      return;
    }

    // ✅ Handle turn_complete messages
    if (
      response.message_type === "chat" ||
      typeof response.turn_complete !== "undefined"
    ) {
      console.log(
        "Processing turn_complete:",
        response.turn_complete,
        "Feedback mode:",
        awaitingFeedbackResponse
      );
      setIsStreaming(true);
      // setCurrentReasoning("")
      if (response.turn_complete === false) {
        const partialText = response.message || "";

        if (partialText) {
          accumulatedTurnRef.current += partialText;
        }

        if (
          !partialText &&
          accumulatedTurnRef.current.length === 0 &&
          !response.image_source
        ) {
          // ✅ Nothing to show yet, skip creating empty message
          return;
        }
        let imageSources = [];
        if (typeof response.image_source === "string") {
          imageSources = response.image_source
            .split(/[, ]+/) // split by comma or space
            .filter((item) => item.trim() !== ""); // remove empty
        } else if (Array.isArray(response.image_source)) {
          imageSources = response.image_source;
        }

        if (imageSources.length > 0) {
          console.log("🖼️ Image sources (array):", imageSources);
        }
        setGeneralMessages((prev) => {
          // ✅ If we're awaiting feedback response, always create/update feedback message
          if (awaitingFeedbackResponse) {
            const lastMessage = prev[prev.length - 1];

            // Check if last message is a feedback response in progress
            if (
              lastMessage &&
              !lastMessage.isUser &&
              lastMessage.isFeedbackResponse &&
              lastMessage.isStreaming
            ) {
              const updated = [...prev];
              updated[prev.length - 1] = {
                ...lastMessage,
                content: accumulatedTurnRef.current,
                isStreaming: true,
                // reasoning: reasoningRef.current || lastMessage.reasoning, // ✅ always latest reasoning
              };
              return updated;
            } else {
              // Create new feedback response message
              return [
                ...prev,
                {
                  id: generateUniqueId(),
                  content: accumulatedTurnRef.current,
                  isUser: false,
                  tabType: activeTab,
                  isStreaming: true,
                  isFeedbackResponse: true, // ✅ Mark as feedback response
                  sources: response.source || [],
                  images: response.image_source ? [response.image_source] : [],
                  reasoning: currentReasoning,
                  responseId: currentResponseIdRef.current || undefined,
                },
              ];
            }
          }

          // ✅ Regular message handling (non-feedback)
          if (
            prev.length > 0 &&
            !prev[prev.length - 1].isUser &&
            prev[prev.length - 1].isStreaming &&
            !prev[prev.length - 1].isFeedbackResponse
          ) {
            const updated = [...prev];
            updated[prev.length - 1] = {
              ...updated[prev.length - 1],
              content: accumulatedTurnRef.current,
              isStreaming: true,
              sources:
                response.source || updated[prev.length - 1].sources || [],
              images: response.image_source
                ? [
                  ...(updated[prev.length - 1].images || []),
                  response.image_source,
                ]
                : updated[prev.length - 1].images || [],
              responseId: currentResponseIdRef.current || updated[prev.length - 1].responseId || undefined,
            };
            return updated;
          }

          return [
            ...prev,
            {
              id: generateUniqueId(),
              content: accumulatedTurnRef.current,
              isUser: false,
              tabType: activeTab,
              isStreaming: true,
              sources: response.source || [],
              reasoning:reasoningRef.current,
              images: response.image_source ? [response.image_source] : [],
              responseId: currentResponseIdRef.current || undefined,
            },
          ];
        });
        setIsLoading(false);
        return;
      }

      if (response.turn_complete === true) {
        const partialText = response.message || "";
        const fullMessage = (accumulatedTurnRef.current + partialText).trim();

        console.log(
          "Final complete message:",
          fullMessage,
          "Feedback mode:",
          awaitingFeedbackResponse,
          "Current responseId ref:",
          currentResponseIdRef.current
        );

        if (fullMessage || response.source || response.image_source) {
          setGeneralMessages((prev) => {
            // ✅ If we're awaiting feedback response, handle feedback completion
            if (awaitingFeedbackResponse) {
              const lastMessage = prev[prev.length - 1];

              if (
                lastMessage &&
                !lastMessage.isUser &&
                lastMessage.isFeedbackResponse
              ) {
                const updated = [...prev];
                updated[prev.length - 1] = {
                  ...lastMessage,
                  content: fullMessage || lastMessage.content,
                  isStreaming: false,
                  sources: response.source || lastMessage.sources || [],
                  images: response.image_source
                    ? [...(lastMessage.images || []), response.image_source]
                    : lastMessage.images || [],
                };
                return updated;
              } else {
                // Create new feedback response message
                return [
                  ...prev,
                  {
                    id: generateUniqueId(),
                    content: fullMessage,
                    isUser: false,
                    tabType: activeTab,
                    isStreaming: false,
                    isFeedbackResponse: true, // ✅ Mark as feedback response
                    sources: response.source || [],
                    reasoning:reasoningRef.current,
                    images: response.image_source
                      ? [response.image_source]
                      : [],
                    responseId: currentResponseIdRef.current || undefined,
                  },
                ];
              }
            }

            // ✅ Regular message completion (non-feedback)
            if (
              prev.length > 0 &&
              prev[prev.length - 1].isStreaming &&
              !prev[prev.length - 1].isFeedbackResponse
            ) {
              const updated = [...prev];
              const lastMsg = updated[prev.length - 1];

              updated[prev.length - 1] = {
                ...lastMsg,
                content: fullMessage || lastMsg.content,
                isStreaming: false,
                sources: response.source || lastMsg.sources || [],
                images: response.image_source
                  ? [...(lastMsg.images || []), response.image_source]
                  : lastMsg.images || [],
                responseId: currentResponseIdRef.current || lastMsg.responseId || undefined,
              };
              return updated;
            }

            return [
              ...prev,
              {
                id: generateUniqueId(),
                content: fullMessage,
                isUser: false,
                tabType: activeTab,
                isStreaming: false,
                reasoning: reasoningRef.current,
                sources: response.source || [],
                images: response.image_source ? [response.image_source] : [],
                responseId: currentResponseIdRef.current || undefined,
              },
            ];
          });
        }

        // ✅ Handle conversation title updates (only for non-feedback)
        if (!awaitingFeedbackResponse && fullMessage.trim() !== "") {
          setConversations((prev) => {
            return prev?.map((conv) => {
              // Check if this is the active conversation that should be updated
              const isActiveConv =
                conv.isActive ||
                conv.id === activeConversationId ||
                conv.id === currentChatUniqueId ||
                (conv.title === "New Chat" && conv.isActive);

              if (isActiveConv && conv.title === "New Chat") {
                const shortTitle =
                  fullMessage.substring(0, 50) +
                  (fullMessage.length > 50 ? "..." : "");
                console.log("Updating conversation title to:", shortTitle);

                // ✅ Determine the new session ID to use, prioritizing response.session_id
                const newSessionId = response?.session_id;

                // Create the base updated conversation object
                const updatedConv = {
                  ...conv,
                  title: shortTitle,
                  lastMessage: "",
                };

                // ✅ Conditionally update id, object_id, unique_id only if newSessionId is valid
                if (newSessionId != null && newSessionId !== "undefined") {
                  updatedConv.id = newSessionId;
                  updatedConv.object_id = newSessionId;
                  updatedConv.unique_id = newSessionId;
                  console.log(
                    "Updated conversation IDs with new session_id:",
                    newSessionId
                  );
                } else {
                  console.log(
                    "No valid session_id from response to update conversation IDs. Keeping existing."
                  );
                }

                return updatedConv;
              }
              return conv;
            });
          });
        }

        // ✅ Reset states
        accumulatedTurnRef.current = "";
        setIsLoading(false);
        // reasoningRef.current = ""; // ✅ clear ref safely after final response
        // setCurrentReasoning("");
        // // ✅ Reset feedback mode when complete
        // return;
        if (response.message_type === "chat" || fullMessage.trim() !== "") {
          reasoningRef.current = "";
          setCurrentReasoning("");
        }

        // ✅ Reset feedback mode when complete
        if (awaitingFeedbackResponse) {
          setAwaitingFeedbackResponse(false);
          console.log("Feedback response completed, resetting feedback mode");
        }

        return;
      }
    }
    // if (response.turn_complete === true) {
    //   setTimeout(() => {
    //     reasoningRef.current = ""; // ✅ clear ref safely after final response
    //     setCurrentReasoning("");
    //   }, 500);
    // }
    // ✅ Handle errors
    if (response.type === "error") {
      setWarningPopup({ isOpen: true, message: response?.message || response?.data?.message || "An error occurred." });
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: response.message || response?.data?.message || "An error occurred.",
        isUser: false,
        tabType: activeTab,
      };
      setGeneralMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      return;
    }

    // ✅ Validate and extract inner data
    if (
      response.type !== "query" ||
      !response.data ||
      response.data.type !== "query"
    )
      return;

    const innerData = response.data.data;
    if (!innerData) return;
    console.log(innerData);

    // ✅ Inner turn_complete
    if (typeof innerData.turn_complete !== "undefined") {
      console.log("Processing inner turn_complete:", innerData.turn_complete);

      if (innerData.turn_complete === false) {
        accumulatedTurnRef.current += innerData.message || "";
        console.log("Inner accumulated so far:", accumulatedTurnRef.current);
        return;
      }

      if (innerData.turn_complete === true) {
        const partial = innerData.message || "";
        const fullMessage = accumulatedTurnRef.current + partial;
        console.log("Inner final complete message:", fullMessage);

        setGeneralMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            content: fullMessage.trim(),
            isUser: false,
            tabType: activeTab,
            responseId: currentResponseIdRef.current || undefined,
          },
        ]);

        accumulatedTurnRef.current = "";
        setIsLoading(false);
        return;
      }
    }

    // ✅ Session updates
    if (innerData.session_id) {
      setConversations((prev) =>
        prev?.map((conv) =>
          conv.id === activeConversationId ||
            (typeof conv.id === "string" &&
              conv.id.endsWith(activeConversationId))
            ? { ...conv, object_id: innerData.obj_id }
            : conv
        )
      );
      console.log("Received and stored session_id:", innerData.session_id);
    }

    // ✅ Feedback case - DON'T replace messages
    if (innerData.feedback === true) {
      console.log("Inner feedback response:", innerData.result);

      // Only add a new message if there's meaningful content
      if (
        innerData.result &&
        innerData.result.trim() &&
        !innerData.result.includes("Feedback received") &&
        !innerData.result.includes("Thank you")
      ) {
        const uniqueId = generateUniqueId();
        setGeneralMessages((prev) => [
          ...prev,
          {
            id: uniqueId,
            content: innerData.result,
            isUser: false,
            isFeedbackResponse: true,
            responseId: currentResponseIdRef.current || undefined,
          },
        ]);
      }

      setIsFeedbackMode(true);
      return; // ✅ Stop processing here for feedback
    }

    const tabType = lastSentMessageTabRef.current;

    // ✅ Object ID updates
    if (
      innerData.obj_id &&
      conversations.find(
        (conv) =>
          (conv.id === activeConversationId ||
            (typeof conv.id === "string" &&
              conv.id.endsWith(activeConversationId))) &&
          !conv.object_id
      )
    ) {
      setConversations((prev) =>
        prev?.map((conv) =>
          conv.id === activeConversationId ||
            (typeof conv.id === "string" &&
              conv.id.endsWith(activeConversationId))
            ? { ...conv, object_id: innerData.obj_id }
            : conv
        )
      );
    }

    // ✅ Message handling helper
    const responseToId = innerData.in_response_to || null;
    const image =
      innerData.image_source && innerData.image_source.length > 0
        ? innerData.image_source
        : null;

    const updateMessages = (setMessagesFn, content, isStreaming = false) => {
      setGeneralMessages((prev) => {
        if (!responseToId) {
          return [
            ...prev,
            {
              id: generateUniqueId(),
              content,
              isUser: false,
              tabType,
              in_response_to: null,
              reasoning: reasoningMessage,
              images: image ? [image] : [],
              isStreaming,
              responseId: currentResponseIdRef.current || undefined,
            },
          ];
        }

        const existingIndex = prev.findIndex(
          (msg) => !msg.isUser && msg.in_response_to === responseToId
        );

        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          const existingMessage = updatedMessages[existingIndex];
          let updatedImages = existingMessage.images || [];
          if (image && !updatedImages.includes(image)) {
            updatedImages = [...updatedImages, image];
          }

          updatedMessages[existingIndex] = {
            ...existingMessage,
            content: existingMessage.content + content,
            reasoning: reasoningMessage || existingMessage.reasoning,
            images: updatedImages,
            isStreaming,
          };
          return updatedMessages;
        } else {
          return [
            ...prev,
            {
              id: generateUniqueId(),
              content,
              isUser: false,
              tabType,
              in_response_to: responseToId,
              reasoning: reasoningMessage,
              images: image ? [image] : [],
              isStreaming,
              responseId: currentResponseIdRef.current || undefined,
            },
          ];
        }
      });
    };

    // ✅ Handle statuses
    if (innerData.status === "inprogress" && responseToId) {
      const content = innerData.result || "";
      setIsStreaming(true);
      setCurrentReasoning("");
      updateMessages(setGeneralMessages, content, true);
    } else if (innerData.status === "reasoning") {
      reasoningMessage = innerData.result || "Thinking...";
      if (!isStreaming) setCurrentReasoning(reasoningMessage);
    } else if (innerData.status === "done") {
      setIsStreaming(false);
      const content = innerData.result || "";
      setCurrentReasoning("");

      if (innerData.is_first_message && innerData.first_message_title) {
        updateConversationTitle(
          activeConversationId,
          innerData.first_message_title
        );
      }

      updateMessages(setGeneralMessages, content, false);

      const conversation = conversations.find(
        (conv) => conv.id === activeConversationId
      );
      const isNewChat = conversation && conversation.title === "New Chat";

      if (isNewChat && content.trim() !== "") {
        const shortContent =
          content.substring(0, 50) + (content.length > 50 ? "..." : "");
        setConversations((prev) =>
          prev?.map((conv) =>
            conv.id === activeConversationId ||
              (typeof conv.id === "string" &&
                conv.id.endsWith(activeConversationId))
              ? { ...conv, title: shortContent, lastMessage: "" }
              : conv
          )
        );
      } else {
        setConversations((prev) =>
          prev?.map((conv) =>
            conv.id === activeConversationId
              ? { ...conv, lastMessage: "" }
              : conv
          )
        );
      }

      setIsLoading(false);
      setTimeout(() => {
        reasoningMessage = "";
      }, 3000);
    }
  };

  const handleFeedbackStart = () => {
    setIsFeedbackLoading(true);
    setAwaitingFeedbackResponse(true);
  };

  useEffect(() => {
    if (!socketRef.current) return;
    setupMessageHandler(handleSocketMessage);
  }, [socketRef.current]); // ✅ Remove the extra brackets
  // Add state to track auto-scroll behavior
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);




  // useEffect(() => {
  //     // Scroll to bottom whenever messages change or when loading completes
  //     const scrollToBottom = () => {
  //       if (messagesEndRef.current) {
  //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //       }
  //     };
  //     scrollToBottom();
  //     const timeoutId = setTimeout(scrollToBottom, 500);
  //     return () => clearTimeout(timeoutId);
  //   }, [generalMessages, isLoading]);
  const updateConversationTitle = (id, newTitle) => {
    setConversations((prev) =>
      prev?.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  // useEffect(() => {
  //   const currentMessages = getCurrentMessages();
  //   if (currentMessages.length > 0) {
  //     setTimeout(() => {
  //       latestMessageRef.current?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start",
  //       });
  //     }, 100);
  //   }
  // }, [generalMessages]);

  // Auto-hide conversations when document becomes visible
  // useEffect(() => {
  //   if (isDocumentVisible && showConversations) {
  //     setWasConversationsVisibleBeforeCanvas(true);
  //     setShowConversations(false);
  //   } else if (
  //     !isDocumentVisible &&
  //     !showConversations &&
  //     wasConversationsVisibleBeforeCanvas
  //   ) {
  //     setShowConversations(true);
  //     setWasConversationsVisibleBeforeCanvas(false);
  //   }
  // }, [
  //   isDocumentVisible,
  //   showConversations,
  //   wasConversationsVisibleBeforeCanvas,
  // ]);
  useEffect(() => {
    if (window.innerWidth < 768) {
      // Don't automatically change sidebar on mobile - let user control it
      return;
    }
    if (isDocumentVisible && showConversations) {
      setWasConversationsVisibleBeforeCanvas(true);
    } else if (!isDocumentVisible && wasConversationsVisibleBeforeCanvas) {
      setWasConversationsVisibleBeforeCanvas(false);
    }
  }, [
    isDocumentVisible,
    showConversations,
    wasConversationsVisibleBeforeCanvas,
  ]);

  useEffect(() => {
    // Send message to parent window when document visibility changes
    window.parent.postMessage({ popupOpen: isDocumentVisible }, "*");
    console.log(isDocumentVisible);
  }, [isDocumentVisible]);

  const handleSendMessage = async (content: string, imagePayloads?: any[]) => {
    canvasMessageRef.current = "";
    setCanvasStatusMessage("");
    reasoningRef.current = "";
    setCurrentReasoning("");
    firstMessageRef.current = null;
    currentResponseIdRef.current = null;
    console.log("imagePayloads", imagePayloads);
    try {
      console.log("handleSendMessage called", {
        // analytics: !!analyticsSocketRef?.current,
        canvas: !!canvasSocketRef?.current,
        mcp: !!mcpSocketRef?.current,
        websearch: !!websearchSocketRef?.current,
      });

      // // 1) Analytics socket
      // if (
      //   analyticsSocketRef?.current &&
      //   analyticsSocketRef.current.readyState === WebSocket.OPEN
      // ) {
      //   const newUserMessage: Message = {
      //     id: generateUniqueId(),
      //     content,
      //     isUser: true,
      //     images: imagePayloads || [],
      //     tabType: activeTab,
      //   };

      //   setGeneralMessages((prev) => [...prev, newUserMessage]);
      //   setIsLoading(true);

      //   const ok = sendAnalyticsMessage(content);
      //   console.log("sendAnalyticsMessage ->", ok);
      //   if (!ok) {
      //     console.error("Failed to send analytics message");
      //     setIsLoading(false);
      //   }
      //   return;
      // }

      // 2) Canvas tool
      if (
        canvasSocketRef?.current &&
        canvasSocketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log("Sending message to canvas tool:", content);
        const newUserMessage: Message = {
          id: generateUniqueId(),
          content,
          isUser: true,
          tabType: activeTab,
          images: imagePayloads || [],
        };
        setGeneralMessages((prev) => [...prev, newUserMessage]);
        setIsLoading(true);

        let ok = false;
        try {
          ok = sendToolMessage("canvas", content);
        } catch (err) {
          console.error("Error sending Canvas message:", err);
        }
        console.log("sendToolMessage(canvas) ->", ok);
        if (!ok) {
          setIsLoading(false);
        }
        return;
      }

      // 3) MCP tool
      if (
        mcpSocketRef?.current &&
        mcpSocketRef.current.readyState === WebSocket.OPEN
      ) {
        const newUserMessage: Message = {
          id: generateUniqueId(),
          content,
          isUser: true,
          tabType: activeTab,
          images: imagePayloads || [],
        };
        setGeneralMessages((prev) => [...prev, newUserMessage]);
        setIsLoading(true);

        let ok = false;
        try {
          ok = sendToolMessage("mcp", content);
        } catch (err) {
          console.error("Error sending MCP message:", err);
        }
        console.log("sendToolMessage(mcp) ->", ok);
        if (!ok) {
          setIsLoading(false);
        }
        return;
      }

      // 4) Websearch tool
      if (
        websearchSocketRef?.current &&
        websearchSocketRef.current.readyState === WebSocket.OPEN
      ) {
        const newUserMessage: Message = {
          id: generateUniqueId(),
          content,
          isUser: true,
          tabType: activeTab,
          images: imagePayloads || [],
        };
        setGeneralMessages((prev) => [...prev, newUserMessage]);
        setIsLoading(true);

        let ok = false;
        try {
          ok = sendToolMessage("websearch", content);
        } catch (err) {
          console.error("Error sending WebSearch message:", err);
        }
        console.log("sendToolMessage(websearch) ->", ok);
        if (!ok) {
          setIsLoading(false);
        }
        return;
      }

      // 5) fallback to general chat
      if (!chatInitiated) {
        setChatInitiated(true);
      }
      console.log(
        "Fallback to general chat, currentChatUniqueId:",
        currentChatUniqueId
      );

      const newUserMessage: Message = {
        id: generateUniqueId(), // unique id for UI
        content,
        isUser: true,
        tabType: activeTab,
        images: imagePayloads || [],
      };

      lastSentMessageTabRef.current = activeTab;
      setGeneralMessages((prev) => [...prev, newUserMessage]);
      setIsLoading(true);

      // feedback mode (special)
      if (
        isFeedbackMode &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        const payload = {
          type: "feedback",
          feedback: {
            is_feedback_text: true,
            query: content,
          },
          uniqueid: currentChatUniqueId,
        };

        try {
          socketRef.current.send(JSON.stringify(payload));
          console.log("Feedback response sent:", payload);
        } catch (err) {
          console.error("Failed sending feedback:", err);
          setIsLoading(false);
        } finally {
          setIsFeedbackMode(false);
        }
        return;
      }

      // regular chat send
      let messageSent = sendMessage(
        content,
        currentChatUniqueId,
        activeTab,
        imagePayloads
      );

      if (!messageSent) {
        connectSocket(currentChatUniqueId);
        setIsUserTyping(false);

        try {
          await new Promise<void>((resolve, reject) => {
            if (!socketRef.current) {
              reject(new Error("Socket not initialized"));
              return;
            }

            if (socketRef.current.readyState === WebSocket.OPEN) {
              resolve();
              return;
            }

            socketRef.current.onopen = () => {
              console.log(" WebSocket connected");
              resolve();
            };

            socketRef.current.onerror = (err) => {
              console.error("❌ WebSocket error:", err);
              reject(err);
            };
          });
          console.log(
            "Message sent through WebSocket:",
            content,
            currentChatUniqueId,
            imagePayloads
          );
          messageSent = sendMessage(
            content,
            currentChatUniqueId,
            activeTab,
            imagePayloads
          );
        } catch (err) {
          console.error("Socket connection failed:", err);
        }

        // Fallback if still not sent (or if socket failed)
        if (!messageSent) {
          // fallback simulated response
          setTimeout(() => {
            const aiResponse: Message = {
              id: generateUniqueId(),
              content: `WebSocket is disconnected. This is a simulated response to: "${content}"\nPlease check your connection and try again.`,
              isUser: false,
              tabType: activeTab,
            };
            setGeneralMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
            setCurrentReasoning("");

            setConversations((prev) =>
              prev?.map((conv) =>
                conv.id === activeConversationId
                  ? { ...conv, lastMessage: content }
                  : conv
              )
            );
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Unhandled error in handleSendMessage:", err);
      setIsLoading(false);
    }
  };
  const canRegenerate = (messageId: string) => {
    const allMessages = getAllMessages();
    const messageIndex = allMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return false;
    const userMessage = allMessages[messageIndex - 1];
    return !!(userMessage && userMessage.isUser);
  };
  const handleRegenerateResponse = (messageId: string) => {
    const allMessages = getAllMessages();
    const messageIndex = allMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = allMessages.slice(0, messageIndex);
    setGeneralMessages(updatedMessages);
    currentResponseIdRef.current = null;

    const userMessage = allMessages[messageIndex - 1];
    if (!userMessage || !userMessage.isUser) {
      setIsLoading(false);
      setCurrentReasoning("");
      reasoningRef.current = "";
      return;
    }

    setIsLoading(true);

    // ✅ 1) Content Agent
    if (
      contentAgentSocketRef.current &&
      contentAgentSocketRef.current.readyState === WebSocket.OPEN
    ) {
      sendContentAgentFeedback(userMessage.content);
      return;
    }

    // ✅ 2) Analytics Tool
    // if (
    //   analyticsSocketRef.current &&
    //   analyticsSocketRef.current.readyState === WebSocket.OPEN
    // ) {
    //   const messageSent = sendAnalyticsMessage(userMessage.content);
    //   if (!messageSent) {
    //     console.error("Failed to send analytics message for regeneration");
    //     setIsLoading(false);
    //   }
    //   return;
    // }

    // ✅ 3) Canvas Tool
    if (
      canvasSocketRef.current &&
      canvasSocketRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        const ok = sendToolMessage("canvas", userMessage.content);
        console.log("sendToolMessage(canvas) ->", ok);
        if (!ok) setIsLoading(false);
      } catch (err) {
        console.error("Error regenerating Canvas message:", err);
        setIsLoading(false);
      }
      return;
    }

    // ✅ 4) MCP Tool
    if (
      mcpSocketRef.current &&
      mcpSocketRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        const ok = sendToolMessage("mcp", userMessage.content);
        console.log("sendToolMessage(mcp) ->", ok);
        if (!ok) setIsLoading(false);
      } catch (err) {
        console.error("Error regenerating MCP message:", err);
        setIsLoading(false);
      }
      return;
    }

    // ✅ 5) WebSearch Tool
    if (
      websearchSocketRef.current &&
      websearchSocketRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        const ok = sendToolMessage("websearch", userMessage.content);
        console.log("sendToolMessage(websearch) ->", ok);
        if (!ok) setIsLoading(false);
      } catch (err) {
        console.error("Error regenerating WebSearch message:", err);
        setIsLoading(false);
      }
      return;
    }

    // ✅ 6) Fallback to general chat
    const messageSent = sendMessage(
      userMessage.content,
      currentChatUniqueId,
      activeTab,
      userMessage.images
    );

    if (!messageSent) {
      setTimeout(() => {
        const newAiResponse: Message = {
          id: Date.now().toString(),
          content: `**WebSocket Disconnected - Simulated Regenerated Response**
Unable to regenerate response for: "${userMessage.content}" because WebSocket is disconnected.
Please check your connection and try again.`,
          isUser: false,
          tabType: activeTab,
        };

        setGeneralMessages((prev) => [...prev, newAiResponse]);
        setIsLoading(false);
        setCurrentReasoning("");
      }, 1000);
    }
  };
  const handleSelectConversation = async (id: string) => {
    setIsUserTyping(false);
    accumulatedTurnRef.current = "";
    reasoningRef.current = "";
    setCurrentReasoning("");
    setCanvasStatusMessage("");
    setIsCanvasLoading(false);
    setIsLoading(false);
    setContentAgentConnected(false);
    setAnalyticsAgentConnected(false);
    setIsAnalyticsLoading(false);
    currentResponseIdRef.current = null; // ✅ Reset for new conversation
    closeDocument();
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
    if (
      contentAgentSocketRef.current &&
      contentAgentSocketRef.current.readyState === WebSocket.OPEN
    ) {
      console.log("Closing content agent socket");
      contentAgentSocketRef.current.close();
      contentAgentSocketRef.current = null;
    }
    setActiveConversationId(id);
    setConversations((prev) =>
      prev?.map((conv) => ({ ...conv, isActive: conv.object_id === id }))
    );

    const selectedConversation = conversations.find(
      (conv) => conv.object_id === id
    );

    if (!selectedConversation) return;
    setIsLoadingChat(true);
    setActiveTab("general");

    setGeneralMessages([]);
    setMeetingsMessages([]);

    setChatInitiated(true);

    try {
      const { messages: chatHistory, uniqueId } = await fetchChatHistory(
        selectedConversation.object_id,
        selectedConversation.object_id
      );

      const chatUniqueId = selectedConversation.object_id;
      setCurrentChatUniqueId(chatUniqueId);

      if (
        socketRef.current &&
        socketRef.current.readyState !== WebSocket.CLOSED
      ) {
        socketRef.current.close();
      }

      messageHandlerSetRef.current = false;

      console.log("canvas_content", chatHistory);

      connectSocket(chatUniqueId);
      setIsUserTyping(false);
      setGeneralMessages(chatHistory);

      // ✅ NEW: Handle canvas document from chat history
      const canvasMessage = chatHistory.find(
        (msg) => msg.canvas_content && msg.canvas_content.trim() !== ""
      );

      if (canvasMessage) {
        const titleMatch = canvasMessage.canvas_content.match(
          /- \*\*DOCUMENT TITLE:\*\*\s*(.+)/i
        );

        const canvasTitle = titleMatch?.[1]?.trim() || "Generated Content";
        // setCanvasTitle(canvasTitle);

        let documentId;
        if (!currentDocumentRef.current) {
          // First time - create document
          documentId = generateUniqueId();
          const createdDoc = createDocument(
            canvasTitle,
            "# " + canvasTitle + "\n\n" + canvasMessage.canvas_content
          );
          if (createdDoc) currentDocumentRef.current = createdDoc;

          setCanvasDocuments((prev) => ({
            ...prev,
            [createdDoc.id]: {
              id: createdDoc.id,
              title: canvasTitle,
              content:
                "# " + canvasTitle + "\n\n" + canvasMessage.canvas_content,
            },
          }));
          // showDocument();
        } else {
          // Update existing document
          documentId = currentDocumentRef.current.id;
          updateDocument(
            "# " + canvasTitle + "\n\n" + canvasMessage.canvas_content
          );

          setCanvasDocuments((prev) => ({
            ...prev,
            [documentId]: {
              id: documentId,
              title: canvasTitle,
              content:
                "# " + canvasTitle + "\n\n" + canvasMessage.canvas_content,
            },
          }));
          // if (!isDocumentVisible) showDocument();
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoadingChat(false);
      closeDocument();
    }
  };
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setCurrentChatUniqueId(null);
    accumulatedTurnRef.current = "";
    setCanvasStatusMessage("")
    setActiveTab("general");
    setIsCanvasLoading(false);
    setIsLoading(false);
    setContentAgentConnected(false);
    setmcpAgentConnected(false);
    setwebSearchAgentConnected(false);
    setAnalyticsAgentConnected(false);
    setIsAnalyticsLoading(false);
    setIsUserTyping(false);
    currentResponseIdRef.current = null;
    closeDocument();
    setCanvasTitle("");
    currentDocumentRef.current = null;

    if (
      contentAgentSocketRef.current &&
      contentAgentSocketRef.current.readyState === WebSocket.OPEN
    ) {
      console.log("Closing content agent socket");
      contentAgentSocketRef.current.close();
      contentAgentSocketRef.current = null;
    }

    setChatInitiated(false);

    // Generate temporary ID for the new chat
    const tempChatId = generateUniqueId();
    setCurrentChatUniqueId(null);
    setActiveConversationId(tempChatId);
    // Close existing socket
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close();
    }

    const newConv: Conversation = {
      id: tempChatId, // Use temp ID initially
      title: "New Chat",
      lastMessage: "Started new conversation",
      timestamp: "Just now",
      isActive: true,
    };

    setGeneralMessages([]);
    setMeetingsMessages([]);
    setConversations((prev) => [
      newConv,
      ...prev?.map((conv) => ({ ...conv, isActive: false })),
    ]);

    messageHandlerSetRef.current = false;

    // Connect socket - this will trigger connection_success with real session_id
    connectSocket();

    // Load other conversations
    loadChatConversations().then((response) => {
  // loadChatConversations now returns { conversations, hasMore }, not a plain array
  const loadedConversations = response?.conversations || [];

  setConversations((prevConvs) => {
    const newChat = prevConvs.find((c) => c.isActive);

    if (!newChat) {
      return [
        { ...newConv, isActive: true },
        ...loadedConversations.map((c) => ({ ...c, isActive: false })),
      ];
    }

    return [
      { ...newChat, isActive: true },
      ...loadedConversations
        .filter((c) => c.id !== newChat.id)
        .map((c) => ({ ...c, isActive: false })),
    ];
  });
});
  }; 
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const currentDocumentRef = useRef(currentDocument);
  useEffect(() => {
    currentDocumentRef.current = currentDocument;
  }, [currentDocument]);

  let formattedTitle = "";
  const [toolConnecting, setToolConnecting] = useState<Record<string, boolean>>(
    {
      canvas: false,
      analytics: false,
      websearch: false,
      mcp: false,
    }
  );
  const [toolConnected, setToolConnected] = useState<Record<string, boolean>>({
    canvas: false,
    analytics: false,
    websearch: false,
    mcp: false,
  });
  const firstMessageRef = useRef("");

  const handleCanvasClick = () => {
    firstMessageRef.current = "";
    console.log("Active id from canvas", activeConversationId);
    setIsUserTyping(false);
    setActiveTool("canvas");
    setIsCanvasLoading(true);

    // Reset canvas state
    setCanvasProgress(0);
    setCanvasContent("");
    setCanvasTitle("");
    setCanvasStatusMessage("");
    currentDocumentRef.current = null;
    canvasContentRef.current = "";
    canvasMessageRef.current = "";

    // Open the Canvas tool socket
    let socket;
    if (activeConversationId !== "1" && activeConversationId !== undefined) {
      console.log("canvas tool and SessionId");
      socket = connectToolSocket("canvas", activeConversationId);
    } else {
      socket = connectToolSocket("canvas");
      console.log("canvas tool only");
    }

    if (!socket) {
      console.error("Failed to create Canvas socket");
      setIsCanvasLoading(false);
      setActiveTool(null);
      return;
    }

    canvasSocketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("✅ Canvas Connected");
      setIsCanvasLoading(false);
      setContentAgentConnected(true);
      setIsCanvasMode(true);
    });

    socket.addEventListener("message", (event) => {
      try {
        const response = JSON.parse(event.data);
        setContentAgentConnected(true);

        console.log("Canvas message received:", response);

        // Handle session ID updates
        if (response?.session_id) {
          console.log("✅ session_id from server:", response.session_id);
          setCurrentChatUniqueId(response.session_id);
          setActiveConversationId(response.session_id);
        }

        if (response?.response_id) {
        currentResponseIdRef.current = response.response_id;
        } else if (response?.data?.response_id) {
          currentResponseIdRef.current = response.data.response_id;
        } else if (response?.data?.data?.response_id) {
          currentResponseIdRef.current = response.data.data.response_id;
        }

        // Retroactively update existing AI messages that don't have a responseId yet

         if (currentResponseIdRef.current) {
          setGeneralMessages((prev) => {
            let updated = false;
            const newMessages = prev.map((msg) => {
              if (!msg.isUser && !msg.responseId && !msg.isFeedbackResponse) {
                updated = true;
                return {
                  ...msg,
                  responseId: currentResponseIdRef.current || undefined,
                };
              }
              return msg;
            });
            return updated ? newMessages : prev;
          });
        }
        // Handle keepalive messages
        if (response.type === "keepalive") {
          return;
        }
        if (response.message_type === "model_initialization_status") {
          setIsUserTyping(response.session_initialized)
          return;
        }

        // ✅ Handle feedback responses from canvas socket
        if (response.type === "chat_message" && response.data?.feedback === true) {
          console.log("✅ Canvas feedback response:", response.data.result);
          setIsFeedbackLoading(false);
          setIsLoading(false);

          // Display the feedback acknowledgment message if meaningful
          if (
            response.data.result &&
            response.data.result.trim()
          ) {
            const feedbackMessage = {
              id: generateUniqueId(),
              content: response.data.result,
              isUser: false,
              isFeedbackResponse: true,
              responseId: currentResponseIdRef.current || undefined,
            };
            setGeneralMessages((prev) => [...prev, feedbackMessage]);
          }

          return;
        }
        // ✅ Handle STATUS messages (progress updates, loading states, etc.)
        // if (response.message_type === "status") {
        //   closeDocument();
        //   console.log("📊 Status message:", response);

        //   // Update progress if provided
        //   if (response.progress !== undefined) {
        //     setCanvasProgress(response.progress);
        //     console.log("Progress updated:", response.progress);
        //   }
        if (response.message_type === "status") {
          console.log("📊 Status message:", response);
          canvasContentRef.current = "";
          canvasMessageRef.current = "";
          currentDocumentRef.current = null;

          closeDocument();
          // Update progress if provided
          if (response.progress !== undefined) {
            setCanvasProgress(response.progress);
            console.log("Progress updated:", response.progress);
          }
          // Update status message if provided
          if (response.message) {
            setCanvasStatusMessage(response.message);
            console.log("Status message updated:", response.message);
          }

          // Handle status-specific turn_complete
          if (response.turn_complete) {
            console.log("Status turn complete");
            setTimeout(() => {
              setIsLoading(false);
            }, 10);
          }

          return; // Don't process further for status messages
        }
        // ✅ Handle CHAT messages (conversational responses from canvas tool)
        if (response.message_type === "chat") {
          console.log("💬 Chat message:", response.message);

          // Skip loading/status-like chat messages
          const loadingRegex =
            /^(Generating|Retrieving|Preparing|Processing|Creating|Building)/i;
          if (response.message && loadingRegex.test(response.message.trim())) {
            console.log("Skipping status-like chat message:", response.message);
            return;
          }

          if (response.message) {
            // ✅ Reset on first chunk of a new message
            if (
              firstMessageRef.current === null ||
              firstMessageRef.current === ""
            ) {
              canvasMessageRef.current = "";
              firstMessageRef.current = "";
            }

            canvasMessageRef.current += response.message;
            firstMessageRef.current += response.message;

            const messageToShow = {
              id: generateUniqueId(),
              content: canvasMessageRef.current,
              isUser: false,
              tabType: activeTab,
              isStreaming: !response.turn_complete,
            };

            setGeneralMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (
                lastMessage &&
                !lastMessage.isUser &&
                lastMessage.isStreaming
              ) {
                return [...prev.slice(0, prev.length - 1), messageToShow];
              } else {
                return [...prev, messageToShow];
              }
            });
          }

          // Handle chat turn_complete
          if (response.turn_complete) {
            console.log("🔄 Chat turn complete, resetting canvas message ref");
            canvasMessageRef.current = "";
            firstMessageRef.current = null; // ✅ Reset to null to detect new message
            setIsLoading(false);
          }

          return;
        }
        // ✅ Handle CHAT messages (conversational responses from canvas tool)
        // if (response.message_type === "chat") {
        //   console.log("💬 Chat message:", response.message);

        //   // Skip loading/status-like chat messages
        //   const loadingRegex =
        //     /^(Generating|Retrieving|Preparing|Processing|Creating|Building)/i;
        //   if (response.message && loadingRegex.test(response.message.trim())) {
        //     console.log("Skipping status-like chat message:", response.message);
        //     return;
        //   }

        //   if (response.message) {
        //     canvasMessageRef.current += response.message;
        //     if (firstMessageRef.current !== null) {
        //       firstMessageRef.current += response.message;
        //     } else {
        //       firstMessageRef.current = response.message;
        //     }
        //     const messageToShow = {
        //       id: generateUniqueId(),
        //       content: canvasMessageRef.current,
        //       isUser: false,
        //       tabType: activeTab,
        //       isStreaming: !response.turn_complete,
        //     };

        //     setGeneralMessages((prev) => {
        //       const lastMessage = prev[prev.length - 1];
        //       if (
        //         lastMessage &&
        //         !lastMessage.isUser &&
        //         lastMessage.isStreaming
        //       ) {
        //         return [...prev.slice(0, prev.length - 1), messageToShow];
        //       } else {
        //         return [...prev, messageToShow];
        //       }
        //     });
        //   }

        //   // Handle chat turn_complete
        //   if (response.turn_complete) {
        //     console.log("🔄 Chat turn complete, resetting canvas message ref");
        //     setTimeout(() => {
        //       canvasMessageRef.current = "";
        //       setIsLoading(false);
        //     }, 10);
        //   }

        //   return;
        // }

        // ✅ Handle FILE messages (file generation completion indicators)
        if (response.message_type === "file") {
          console.log("📁 File message:", response);

          if (response.message) {
            // Add file-related message to chat if needed
            const fileMessage = {
              id: generateUniqueId(),
              content: response.message,
              isUser: false,
              tabType: activeTab,
            };

            setGeneralMessages((prev) => [...prev, fileMessage]);
          }

          if (response.turn_complete) {
            console.log("📁 File turn complete");
            setTimeout(() => {
              setIsLoading(false);
            }, 10);
          }

          return;
        }

        // ✅ Handle CANVAS messages (actual document content generation)
        if (response.message_type === "canvas") {
          // Force turn_complete if step is completed and progress is 100
          const isComplete =
            response.turn_complete ||
            (response.step === "completed" && response.progress === 100);

          // Initialize canvas content only if starting fresh
          if (!canvasContentRef.current && response.content) {
            canvasContentRef.current = response.content;
          } else if (response.content) {
            canvasContentRef.current += response.content;
          }

          setCanvasContent(canvasContentRef.current);

          // ✅ Extract first markdown heading as title (fallback to "Generated Content")
          let canvasTitle = "Generated Content";
          const headingMatch = canvasContentRef.current.match(/^#\s+(.+)/m);
          if (headingMatch && headingMatch[1]) {
            canvasTitle = headingMatch[1].trim();
            console.log(
              "Extracted canvasTitle from first heading:",
              canvasTitle
            );
          } else {
            console.log("No top-level heading found, using default title");
          }

          const title = canvasTitle;
          let documentId;

          // Create document if it doesn't exist yet
          if (!currentDocumentRef.current) {
            documentId = generateUniqueId();

            const createdDoc = createDocument(title, canvasContentRef.current);
            if (createdDoc) currentDocumentRef.current = createdDoc;

            setCanvasDocuments((prev) => ({
              ...prev,
              [createdDoc.id]: {
                id: createdDoc.id,
                title,
                content: canvasContentRef.current,
              },
            }));
            showDocument();
          } else {
            // Update existing document
            documentId = currentDocumentRef.current.id;
            updateDocument(canvasContentRef.current);
            console.log("Creating new document with ID:", title);
            setCanvasDocuments((prev) => ({
              ...prev,
              [documentId]: {
                id: documentId,
                title,
                content: canvasContentRef.current,
              },
            }));
            if (!isDocumentVisible) showDocument();
          }

          // Update chat message - Only show canvas content card
          const messageToShow = {
            id: generateUniqueId(),
            content: `${canvasContentRef.current}\n\n__document_id:${documentId}__`,
            isUser: false,
            isStreaming: !isComplete,
          };

          setGeneralMessages((prev) => {
            const last = prev[prev.length - 1];
            if (
              last &&
              !last.isUser &&
              last.content.includes("__document_id:")
            ) {
              return [...prev.slice(0, -1), messageToShow];
            }
            return [...prev, messageToShow];
          });

          if (isComplete) {
            console.log("🎨 Canvas turn complete");

            // ✅ Update conversation title for new chats
            const conversation = conversations.find(
              (conv) =>
                conv.id === activeConversationId ||
                conv.id === currentChatUniqueId
            );

            if (conversation && conversation.title === "New Chat") {
              let titleToUse =
                firstMessageRef.current ||
                canvasTitle ||
                title ||
                "Generated Content";
              const shortTitle =
                titleToUse.substring(0, 50) +
                (titleToUse.length > 50 ? "..." : "");

              setConversations((prev) =>
                prev?.map((conv) => {
                  const isActiveConv =
                    conv.isActive ||
                    conv.id === activeConversationId ||
                    conv.id === currentChatUniqueId ||
                    (conv.title === "New Chat" && conv.isActive);

                  if (isActiveConv && conv.title === "New Chat") {
                    console.log(
                      "Updating canvas conversation title to:",
                      shortTitle
                    );

                    const updatedConv = {
                      ...conv,
                      title: shortTitle,
                      lastMessage: "",
                    };

                    // Update session ID if available
                    if (response?.session_id) {
                      updatedConv.id = response.session_id;
                      updatedConv.object_id = response.session_id;
                      updatedConv.unique_id = response.session_id;
                    }

                    return updatedConv;
                  }
                  return conv;
                })
              );
            }

            setTimeout(() => {
              setIsLoading(false);
              if (currentDocumentRef.current) {
                console.log(
                  `📄 Document generated: "${canvasTitle}" is ready.`
                );
              }
            }, 10);
          }
        }

        // ✅ Handle LEGACY string messages (fallback for older format)
        if (typeof response.message === "string" && !response.message_type) {
          console.log("📜 Legacy string message:", response.message);

          if (response.type === "connection_success") return;

          canvasMessageRef.current += response.message;
          const messageToShow = {
            id: generateUniqueId(),
            content: canvasMessageRef.current,
            isUser: false,
            tabType: activeTab,
            isStreaming: !response.turn_complete,
          };

          setGeneralMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && !lastMessage.isUser && lastMessage.isStreaming) {
              return [...prev.slice(0, prev.length - 1), messageToShow];
            } else {
              return [...prev, messageToShow];
            }
          });

          // Handle legacy turn_complete
          if (response.turn_complete) {
            setTimeout(() => {
              canvasMessageRef.current = "";
              setIsLoading(false);
            }, 10);
          }

          return;
        }

        // ✅ SINGLE Global turn_complete handler (removed duplicate)
        if (response.turn_complete && !response.message_type) {
          console.log("🎨 Canvas turn complete");

          // ✅ Update conversation title for new chats
          const conversation = conversations.find(
            (conv) =>
              conv.id === activeConversationId ||
              conv.id === currentChatUniqueId
          );

          if (conversation && conversation.title === "New Chat") {
            const titleToUse =
              firstMessageRef.current || canvasTitle || "Generated Content";
            const shortTitle =
              titleToUse.substring(0, 50) +
              (titleToUse.length > 50 ? "..." : "");

            setConversations((prev) =>
              prev?.map((conv) => {
                const isActiveConv =
                  conv.isActive ||
                  conv.id === activeConversationId ||
                  conv.id === currentChatUniqueId ||
                  (conv.title === "New Chat" && conv.isActive);

                if (isActiveConv && conv.title === "New Chat") {
                  console.log(
                    "Updating canvas conversation title to:",
                    shortTitle
                  );

                  const updatedConv = {
                    ...conv,
                    title: shortTitle,
                    lastMessage: "",
                  };

                  // Update session ID if available
                  if (response?.session_id) {
                    updatedConv.id = response.session_id;
                    updatedConv.object_id = response.session_id;
                    updatedConv.unique_id = response.session_id;
                  }

                  return updatedConv;
                }
                return conv;
              })
            );
          }

          setTimeout(() => {
            setIsLoading(false);
            if (currentDocumentRef.current) {
              console.log(`📄 Document generated: "${canvasTitle}" is ready.`);
            }
          }, 10);
        }
      } catch (error) {
        console.error("Error parsing Canvas message:", error, event.data);
        setIsLoading(false);
      }
    });
    const isCreatingNewChatRef = useRef(false);

    // ✅ STEP 2: Update canvas socket close handler
    socket.addEventListener("close", (event) => {
      console.log("❌ Canvas Disconnected", event);
      canvasSocketRef.current = null;
      setContentAgentConnected(false);
      setIsCanvasLoading(false);
      setCanvasStatusMessage("");
      setCanvasProgress(0);
      setIsCanvasMode(false);
      if (activeTool === "canvas") setActiveTool(null);

      // Reset refs
      canvasMessageRef.current = "";
      canvasContentRef.current = "";

      // ✅ CRITICAL FIX: Don't reconnect if we're creating a new chat
      if (isCreatingNewChatRef.current) {
        console.log("🚫 Skipping reconnection - new chat being created");
        return;
      }

      // ✅ Only reconnect if there's a valid session
      const validSessionId =
        currentChatUniqueId &&
        currentChatUniqueId !== "1" &&
        currentChatUniqueId.length > 10;

      if (validSessionId) {
        console.log(
          "🔄 Reconnecting main socket with session:",
          currentChatUniqueId
        );
        connectSocket(currentChatUniqueId);
      } else {
        console.log("🚫 No valid session to reconnect");
      }
    });

    // ✅ STEP 3: Update canvas socket error handler
    socket.addEventListener("error", (error) => {
      console.error("⚠️ Canvas Error:", error);
      setIsLoading(false);
      setContentAgentConnected(false);
      setIsCanvasMode(false);
      setCanvasStatusMessage("");
      setCanvasProgress(0);
      canvasSocketRef.current = null;
      if (activeTool === "canvas") setActiveTool(null);

      // Reset refs
      canvasMessageRef.current = "";
      canvasContentRef.current = "";

      // ✅ CRITICAL FIX: Don't reconnect if we're creating a new chat
      if (isCreatingNewChatRef.current) {
        console.log("🚫 Skipping reconnection - new chat being created");
        return;
      }

      // ✅ Only reconnect if there's a valid session
      const validSessionId =
        currentChatUniqueId &&
        currentChatUniqueId !== "1" &&
        currentChatUniqueId.length > 10;

      if (validSessionId) {
        console.log(
          "🔄 Reconnecting main socket with session:",
          currentChatUniqueId
        );
        connectSocket(currentChatUniqueId);
      } else {
        console.log("🚫 No valid session to reconnect");
      }
    });
  };
  const handleMcpClick = () => {
    console.log("Active id from mcp", activeConversationId);
    setIsUserTyping(false);
    setActiveTool("mcp");
    setIsMcpLoading(true);

    // Open the MCP tool socket. The hook should close other sockets first.
    let socket;
    if (activeConversationId !== "1" || activeConversationId !== undefined) {
      console.log("tool and Sessionid");
      socket = connectToolSocket("mcp", activeConversationId);
    } else {
      socket = connectToolSocket("mcp");
      console.log("tool only");
    }
    if (!socket) {
      console.error("Failed to create MCP socket");
      setIsMcpLoading(false);
      setActiveTool(null);
      return;
    }

    // store ref for cancel/cleanup
    mcpSocketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("✅ MCP Connected");
      setIsMcpLoading(false);
      setmcpAgentConnected(true);
    });

    socket.addEventListener("message", (event) => {
      try {
        // parse incoming message
        const response = JSON.parse(event.data);
        if (response?.session_id) {
          console.log("✅ session_id from server:", response.session_id);

          // ✅ Set state — will update on next render
          setCurrentChatUniqueId(response.session_id);
        }
        handleSocketMessage(response);
      } catch (err) {
        console.error("Error parsing MCP message:", err, event.data);
      }
    });
    const isCreatingNewChatRef = useRef(false);

    // ✅ STEP 2: Update mcp socket close handler
    socket.addEventListener("close", (event) => {
      console.log("❌ mcp Disconnected", event);
      mcpSocketRef.current = null;
      setmcpAgentConnected(false);
      setIsMcpLoading(false);
      if (activeTool === "mcp") setActiveTool(null);

      // ✅ CRITICAL FIX: Don't reconnect if we're creating a new chat
      if (isCreatingNewChatRef.current) {
        console.log("🚫 Skipping reconnection - new chat being created");
        return;
      }

      // ✅ Only reconnect if there's a valid session
      const validSessionId =
        currentChatUniqueId &&
        currentChatUniqueId !== "1" &&
        currentChatUniqueId.length > 10;

      if (validSessionId) {
        console.log(
          "🔄 Reconnecting main socket with session:",
          currentChatUniqueId
        );
        connectSocket(currentChatUniqueId);
      } else {
        console.log("🚫 No valid session to reconnect");
      }
    });

    socket.addEventListener("error", (err) => {
      console.error("⚠️ MCP Error:", err);
      setIsMcpLoading(false);
      setmcpAgentConnected(false);
      mcpSocketRef.current = null;
      if (activeTool === "mcp") setActiveTool(null);

      // Optionally reconnect general chat:
      connectSocket(currentChatUniqueId);
    });
  };

  const handleWebsearchClick = () => {
    setIsUserTyping(false);
    setActiveTool("websearch");
    setIsWebsearchLoading(true);

    // Open the Websearch tool socket. The hook should close other sockets first.
    let socket;
    if (activeConversationId !== "1" || activeConversationId !== undefined) {
      console.log("tool and Sessionid");
      socket = connectToolSocket("websearch", activeConversationId);
    } else {
      socket = connectToolSocket("websearch");
      console.log("tool only");
    }
    if (!socket) {
      console.error("Failed to create Websearch socket");
      setIsWebsearchLoading(false);
      setActiveTool(null);
      return;
    }

    websearchSocketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("✅ Websearch Connected");
      setIsWebsearchLoading(false);
      setwebSearchAgentConnected(true);
    });

    socket.addEventListener("message", (event) => {
      try {
        const response = JSON.parse(event.data);

        handleSocketMessage(response);
      } catch (err) {
        console.error("Error parsing Websearch message:", err, event.data);
      }
    });
    const isCreatingNewChatRef = useRef(false);

    // ✅ STEP 2: Update canvas socket close handler
    socket.addEventListener("close", (event) => {
      console.log("❌ websearch Disconnected", event);
      websearchSocketRef.current = null;
      setwebSearchAgentConnected(false);
      setIsWebsearchLoading(false);
      if (activeTool === "websearch") setActiveTool(null);

      // ✅ CRITICAL FIX: Don't reconnect if we're creating a new chat
      if (isCreatingNewChatRef.current) {
        console.log("🚫 Skipping reconnection - new chat being created");
        return;
      }

      // ✅ Only reconnect if there's a valid session
      const validSessionId =
        currentChatUniqueId &&
        currentChatUniqueId !== "1" &&
        currentChatUniqueId.length > 10;

      if (validSessionId) {
        console.log(
          "🔄 Reconnecting main socket with session:",
          currentChatUniqueId
        );
        connectSocket(currentChatUniqueId);
      } else {
        console.log("🚫 No valid session to reconnect");
      }
    });

    socket.addEventListener("error", (err) => {
      console.error("⚠️ Websearch Error:", err);
      setIsWebsearchLoading(false);
      setwebSearchAgentConnected(false);
      websearchSocketRef.current = null;
      if (activeTool === "websearch") setActiveTool(null);
      if (isCreatingNewChatRef.current) {
        console.log("🚫 Skipping reconnection - new chat being created");
        return;
      }

      // ✅ Only reconnect if there's a valid session
      const validSessionId =
        currentChatUniqueId &&
        currentChatUniqueId !== "1" &&
        currentChatUniqueId.length > 10;

      if (validSessionId) {
        console.log(
          "🔄 Reconnecting main socket with session:",
          currentChatUniqueId
        );
        connectSocket(currentChatUniqueId);
      } else {
        console.log("🚫 No valid session to reconnect");
      }
    });
  };

  // const handleAnalyticsClick = () => {
  //   // mark intent
  //   setActiveTool("analytics");
  //   setIsAnalyticsLoading(true);

  //   // open tool socket (your hook closes other sockets first)
  //   let socket: WebSocket;
  //   if (activeConversationId !== "1" || activeConversationId !== undefined) {
  //     console.log("tool and Sessionid");
  //     socket = connectToolSocket("analytics", activeConversationId);
  //   } else {
  //     socket = connectToolSocket("analytics");
  //     console.log("tool only");
  //   }
  //   if (!socket) {
  //     console.error("Failed to create analytics socket");
  //     setIsAnalyticsLoading(false);
  //     setActiveTool(null);
  //     return;
  //   }

  //   // store socket reference so cancel handler can close it
  //   // analyticsSocketRef.current = socket;

  //   socket.addEventListener("open", () => {
  //     console.log("✅ Analytics socket open");
  //     setIsAnalyticsLoading(false);
  //     setAnalyticsAgentConnected(true);
  //   });

  //   socket.addEventListener("message", (event) => {
  //     try {
  //       const response = JSON.parse(event.data);
  //       handleSocketMessage(response);
  //     } catch (err) {
  //       console.error("Error parsing analytics message:", err, event.data);
  //     }
  //   });

  //   socket.addEventListener("close", (ev) => {
  //     console.log("❌ Analytics socket closed", ev);
  //     setAnalyticsAgentConnected(false);
  //     setIsAnalyticsLoading(false);
  //     // analyticsSocketRef.current = null;
  //     if (activeTool === "analytics") setActiveTool(null);

  //     // optionally reconnect the general chat socket:
  //     connectSocket(currentChatUniqueId);
  //   });

  //   socket.addEventListener("error", (err) => {
  //     console.error("⚠️ Analytics socket error:", err);
  //     setAnalyticsAgentConnected(false);
  //     setIsAnalyticsLoading(false);
  //     analyticsSocketRef.current = null;
  //     if (activeTool === "analytics") setActiveTool(null);
  //     // optionally reconnect general chat:
  //     connectSocket(currentChatUniqueId);
  //   });
  // };

  const handleCloseWarningPopup = () => {
    // Check if the error message indicates a connection timeout
    const isConnectionTimeout =
      warningPopup.message &&
      (warningPopup.message.toLowerCase().includes("connection timeout") ||
        warningPopup.message
          .toLowerCase()
          .includes("timeout due to inactivity") ||
        warningPopup.message.toLowerCase().includes("inactivity timeout"));

    // Close the popup first
    setWarningPopup({
      isOpen: false,
      message: "",
    });

    // Only reconnect for connection timeout errors
    if (isConnectionTimeout) {
      console.log("Connection timeout detected, attempting to reconnect...");

      // Close existing socket
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Clear any existing reconnect timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reconnect with current chat unique ID
      try {
        connectSocket(currentChatUniqueId);
        console.log("Socket reconnection initiated for timeout");
      } catch (error) {
        console.error("Failed to reconnect socket:", error);
        // Show error if reconnection fails
        setWarningPopup({
          isOpen: true,
          message:
            "Failed to reconnect. Please refresh the page and try again.",
        });
      }
    }
  };

  const handleContentAgentFeedback = (feedback) => {
    // Send the feedback to the content agent
    setIsLoading(true);
    setIsFeedbackLoading(true);
    sendContentAgentFeedback(feedback);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleCancelLoading = () => {
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentReasoning("");
    // ✅ Send the "interrupt" payload to the appropriate WebSocket
    const interruptPayload = {
      type: "interrupt",
    };

    // Check Canvas socket first
    if (
      canvasSocketRef.current &&
      canvasSocketRef.current.readyState === WebSocket.OPEN
    ) {
      canvasSocketRef.current.send(JSON.stringify(interruptPayload));
      console.log("Interrupt payload sent to Canvas socket:", interruptPayload);
    }
    // Check MCP socket
    else if (
      mcpSocketRef.current &&
      mcpSocketRef.current.readyState === WebSocket.OPEN
    ) {
      mcpSocketRef.current.send(JSON.stringify(interruptPayload));
      console.log("Interrupt payload sent to MCP socket:", interruptPayload);
    }
    // Check WebSearch socket
    else if (
      websearchSocketRef.current &&
      websearchSocketRef.current.readyState === WebSocket.OPEN
    ) {
      websearchSocketRef.current.send(JSON.stringify(interruptPayload));
      console.log(
        "Interrupt payload sent to WebSearch socket:",
        interruptPayload
      );
    }
    // Check Analytics socket
    // else if (
    //   analyticsSocketRef.current &&
    //   analyticsSocketRef.current.readyState === WebSocket.OPEN
    // ) {
    //   analyticsSocketRef.current.send(JSON.stringify(interruptPayload));
    //   console.log(
    //     "Interrupt payload sent to Analytics socket:",
    //     interruptPayload
    //   );
    // }
    // Fallback to General socket
    else if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(JSON.stringify(interruptPayload));
      console.log(
        "Interrupt payload sent to General socket:",
        interruptPayload
      );
    }

    // Optionally, append a "Response cancelled" message to the last AI message
    setGeneralMessages((prev) => {
      const lastIndex = prev.length - 1;
      if (
        lastIndex >= 0 &&
        !prev[lastIndex].isUser &&
        prev[lastIndex].isStreaming
      ) {
        const updatedMessages = [...prev];
        updatedMessages[lastIndex] = {
          ...prev[lastIndex],
          content:
            (prev[lastIndex].content || "") +
            "\n\n*(Response cancelled by user)*",
          isStreaming: false, // Ensure it's no longer streaming
        };
        return updatedMessages;
      }
      return prev;
    });
  };

  const handleCancelCanvas = () => {
    setIsUserTyping(false);
    setIsCanvasLoading(false);
    setContentAgentConnected(false);

    if (
      contentAgentSocketRef.current &&
      contentAgentSocketRef.current.readyState === WebSocket.OPEN
    ) {
      contentAgentSocketRef.current.close();
      contentAgentSocketRef.current = null;
    }

    setCanvasStatusMessage("");
    if (currentChatUniqueId === null) {
      console.log("uniguqe id null", currentChatUniqueId);
    }
    connectSocket(currentChatUniqueId);
  };
  const handleCancelMcp = () => {
    setIsUserTyping(false);
    setmcpAgentConnected(false);
    setIsMcpLoading(false);
    if (
      mcpSocketRef.current &&
      mcpSocketRef.current.readyState === WebSocket.OPEN
    ) {
      mcpSocketRef.current.close();
      mcpSocketRef.current = null;
    }
    if (activeTool === "mcp") setActiveTool(null);
    connectSocket(currentChatUniqueId);
  };

  const handleCancelWebsearch = () => {
    setIsUserTyping(false);
    setwebSearchAgentConnected(false);
    setIsWebsearchLoading(false);
    if (
      websearchSocketRef.current &&
      websearchSocketRef.current.readyState === WebSocket.OPEN
    ) {
      websearchSocketRef.current.close();
      websearchSocketRef.current = null;
    }
    if (activeTool === "websearch") setActiveTool(null);
    connectSocket(currentChatUniqueId);
  };

  const handleCancelAnalytics = () => {
    setIsUserTyping(false);
    setAnalyticsAgentConnected(false);
    setIsAnalyticsLoading(false);
    setIsAnalyticsMode(false);

    // setContentAgentConnected(false);

    // if (
    //   analyticsSocketRef.current &&
    //   analyticsSocketRef.current.readyState === WebSocket.OPEN
    // ) {
    //   analyticsSocketRef.current.close();
    //   analyticsSocketRef.current = null;
    // }

    connectSocket(currentChatUniqueId);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // On mobile, don't automatically change sidebar state
        // Let the user control it with the toggle button
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  //  useEffect(() => {
  //   const scrollContainer = messagesEndRef.current?.closest("[data-scroll-container]");
  //   if (!scrollContainer || !messagesEndRef.current) return;

  //   // Run after layout settles
  //   requestAnimationFrame(() => {
  //     const targetPosition =
  //       messagesEndRef.current.offsetTop - scrollContainer.clientHeight / 2;
  //     const startPosition = scrollContainer.scrollTop;
  //     const distance = targetPosition - startPosition;
  //     const duration = 1000; // 1 second
  //     let startTime = null;

  //     const easeInOutCubic = (t) =>
  //       t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  //     const animate = (currentTime) => {
  //       if (startTime === null) startTime = currentTime;
  //       const elapsed = currentTime - startTime;
  //       const progress = Math.min(elapsed / duration, 1);
  //       scrollContainer.scrollTop =
  //         startPosition + distance * easeInOutCubic(progress);

  //       if (elapsed < duration) {
  //         requestAnimationFrame(animate);
  //       }
  //     };

  //     requestAnimationFrame(animate);
  //   });
  // }, [generalMessages.length, currentReasoning, isLoading, isFeedbackLoading, canvasStatusMessage]);
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.closest(
      "[data-scroll-container]"
    );
    if (!scrollContainer || !messagesEndRef.current) return;

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth", // ✅ smooth and stable
    });
  }, [generalMessages.length]);

  return (
    <div className="h-[90vh] flex bg-background">
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        // className="border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
        className={`
        border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        md:relative md:translate-x-0 md:opacity-100 md:w-80 bg-white
        ${sidebarVisible
            ? "absolute inset-y-0 left-0 z-50 w-80 translate-x-0 opacity-100"
            : "absolute inset-y-0 left-0 z-50 w-80 -translate-x-full opacity-0"
          }
      `}
        style={{
          transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
          width: sidebarVisible ? "20rem" : "0",
          opacity: sidebarVisible ? 1 : 0,
          maxWidth: sidebarVisible ? "20rem" : "0",
        }}
      >
        <ConversationHistory
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onUpdateConversations={handleUpdateConversations}
          onRefreshConversations={handleRefreshConversations}
          onToggleSidebar={toggleSidebar}
          sidebarVisible={sidebarVisible}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      </div>
      {/* Right Panel - Chat Area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 flex flex-col ${
          isDocumentVisible ? "flex-1" : "flex-1"
          }`}
      >
        {/* Chat Header */}
        {/* <div className="border-b border-border bg-card p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="md:hidden hover:bg-accent/10 h-8 w-8 p-0"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarVisible ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
              <img
                src={thunaiLogoIcon}
                alt="Thunai"
                className="h-4 w-4 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Ask Thunai
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-[2px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hidden md:flex  h-8 w-8 p-0"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                {showConversations ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
              <SettingsPanel />
            </div>
          </div>
        </div> */}

        {/* Full Screen Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0 ">
          <div
            data-scroll-container
            ref={scrollContainerRef}
            className="flex-1 h-screen  scroll-smooth scrollbar-hidden"
            style={{
              height: "100vh", // full viewport height
              overflowY: "auto", // enable vertical scroll
              scrollbarWidth: "thin", // Firefox: thin scrollbar
              scrollbarColor: "#c1c1c1 transparent", // Firefox: thumb | track
              msOverflowStyle: "none", // IE 10+
            }}
          >
            {getCurrentMessages().length === 0 ? (
              // Show welcome screen or loading skeleton
              <div className="h-full flex items-center justify-center">
                {isLoadingChat ? (
                  <ChatSkeleton />
                ) : (
                  <div className="text-center max-w-md">
                    <img
                      src={thunaiLogoFull}
                      alt="Thunai"
                      className="h-16 mx-auto mb-6 object-contain"
                    />
                    <h2 className="text-2xl font-semibold text-foreground mb-3">
                      Welcome to Thunai
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Start a conversation with your Thunai. Ask questions, or
                      explore any topic you're curious about.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                  {Object.entries(
                    getCurrentMessages().reduce((acc, message) => {
                      const date = new Date(message.timestamp);

                      if (isNaN(date.getTime())) {
                        const dateLabel = "Today";
                        if (!acc[dateLabel]) acc[dateLabel] = [];
                        acc[dateLabel].push(message);
                        return acc;
                      }

                      const now = new Date();
                      const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );
                      const yesterday = new Date(
                        today.getTime() - 24 * 60 * 60 * 1000
                      );

                      const messageDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                      );

                      let dateLabel;
                      if (messageDate.getTime() === today.getTime()) {
                        dateLabel = "Today";
                      } else if (
                        messageDate.getTime() === yesterday.getTime()
                      ) {
                        dateLabel = "Yesterday";
                      } else {
                        // Show actual date for all other days
                        dateLabel = format(date, "EEEE, d MMMM"); // e.g., "Tuesday, 2 September"
                      }

                      if (!acc[dateLabel]) acc[dateLabel] = [];
                      acc[dateLabel].push(message);
                      return acc;
                    },[])
                  )?.map(([dateLabel, msgs]) => (
                    <div key={dateLabel} className="space-y-4">
                      {/* Date header */}
                      <div className="text-center text-xs text-muted-foreground my-2">
                        {dateLabel}
                      </div>

                      {/* Render messages for this date */}
                      {msgs?.map((message, index) => (
                        <div
                          key={message.id}
                          // ref={
                          //   index === message.length - 1 && !message.isUser
                          //     ? latestMessageRef
                          //     : null
                          // }
                          ref={
                            index === msgs.length - 1 && !message.isUser
                              ? latestMessageRef
                              : null
                          }
                        >
                          <ChatBubble
                            files={message.file_data}
                            sources={message.sources}
                            toolType={message.toolType}
                            message={message.content}
                            reasoning={message.reasoning}
                            isUser={message.isUser}
                            in_response_to={message.in_response_to}
                            images={message.images}
                            timestamp={message.timestamp}
                            canvasContent={message.canvas_content} // ✅ new prop
                            onRegenerate={
                              !message.isUser && canRegenerate(message.id)
                                ? () => handleRegenerateResponse(message.id)
                                : undefined
                            }
                            driveEnabled={driveEnabled}
                            driveConnections={driveConnections}
                            isDriveLoading={isDriveLoading}
                            onOpenDocument={() => {
                              // 1. Check for existing document ID first (normal flow)
                              const match = message.content.match(
                                /__document_id:([^_]+)__/
                              );
                              const documentId = match ? match[1] : null;

                              if (documentId) {
                                const docFromState =
                                  canvasDocuments?.[documentId];
                                const existingDoc = allDocuments.find(
                                  (d) => d.id === documentId
                                );

                                if (existingDoc) {
                                  selectDocument(existingDoc);
                                  showDocument();
                                  return;
                                }

                                if (docFromState) {
                                  const newDoc = createDocument(
                                    docFromState.title,
                                    docFromState.content
                                  );
                                  if (newDoc) {
                                    selectDocument(newDoc);
                                    showDocument();
                                    return;
                                  }
                                }
                              }

                              // 2. ✅ Fallback to canvas_content (if available)
                              if (message.canvas_content) {
                                const lines =
                                  message.canvas_content.split("\n");
                                const firstLine = lines.find((l) =>
                                  l.trim().startsWith("#")
                                );
                                const title = firstLine
                                  ? firstLine.replace(/^#\s*/, "")
                                  : "Untitled Document";

                                const newDoc = createDocument(
                                  title,
                                  message.canvas_content
                                );
                                if (newDoc) {
                                  selectDocument(newDoc);
                                  showDocument();
                                }
                                return;
                              }

                              // 3. Fallback to content if no canvas_content exists
                              const lines = message.content.split("\n");
                              const firstLine = lines.find((l) =>
                                l.trim().startsWith("#")
                              );
                              const title = firstLine
                                ? firstLine.replace(/^#\s*/, "")
                                : "Untitled Document";

                              const content = message.content
                                .replace(/__document_id:[^_]+__/, "")
                                .trim();

                              if (content) {
                                const newDoc = createDocument(title, content);
                                if (newDoc) {
                                  selectDocument(newDoc);
                                  showDocument();
                                }
                              } else {
                                console.warn(
                                  "No document data found for this message"
                                );
                              }
                            }}
                            socketRef={socketRef}
                            uniqueid={currentChatUniqueId}
                            responseId={message.responseId}
                            onFeedbackStart={handleFeedbackStart}
                            contentAgentConnected={contentAgentConnected}
                            sendRawMessageToActiveSocket={sendRawMessageToActiveSocket}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {/* Loading state and reasoning */}
                  {(isLoading || isFeedbackLoading) && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm max-w-[85%]">
                        {/* {currentReasoning && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                Reasoning
                              </span>
                            </div>
                            <p className="text-sm text-blue-600">
                              {currentReasoning}
                            </p>
                          </div>
                        )} */}
                        {currentReasoning && (
                          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                Reasoning
                              </span>
                            </div>

                            {/* Reasoning blocks */}
                            <div className="flex flex-col gap-2">
                              {currentReasoning
                                .split("[SEP]")
                                .filter((block) => block.trim() !== "")
                                .map((reasoningBlock, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-3 p-3 bg-white rounded-md border border-blue-100 shadow-sm"
                                  >
                                    {/* Dot */}
                                    <div className="w-2 h-2 min-w-2 bg-blue-500 rounded-full mt-1.5 animate-pulse" />

                                    <div className="flex-1">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          h1: ({ children }) => (
                                            <h1 className="text-lg font-bold mb-2 mt-0">
                                              {children}
                                            </h1>
                                          ),
                                          h2: ({ children }) => (
                                            <h2 className="text-base font-bold mb-2 mt-0">
                                              {children}
                                            </h2>
                                          ),
                                          h3: ({ children }) => (
                                            <h3 className="text-base font-bold mb-1 mt-0">
                                              {children}
                                            </h3>
                                          ),
                                          p: ({ children }) => (
                                            <p className="text-sm leading-6 m-0">
                                              {children}
                                            </p>
                                          ),
                                          li: ({ children }) => (
                                            <li className="ml-4 text-sm list-disc">
                                              {children}
                                            </li>
                                          ),
                                        }}
                                      >
                                        {reasoningBlock}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {!canvasStatusMessage && (
                          <div className="flex items-center gap-2">
                            <img
                              src={thunaiLogoIcon}
                              alt="Thunai"
                              className="h-4 w-4 object-contain"
                            />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {canvasStatusMessage || ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {getCurrentMessages().length === 0 &&
            // !chatInitiated &&
            !isLoadingChat && (
              isUserTyping ?(
                <SuggestedQuestions
                  onSelectQuestion={handleSuggestedQuestion}
                  activeTab={activeTab}
                />
            ): (
                <div className="max-w-4xl mx-auto p-4">
                  <div className="flex flex-col items-center justify-center text-sm text-muted-foreground/50">
                    {/* <Loader2 className="text-blue-500 w-5 h-5 animate-spin mr-2" /> */}
                    <span>Connecting...</span>
                  </div>
                </div>
              ))}
          {/* Message Input - Fixed at bottom */}
          <div className="border-t border-border">
            <div className="max-w-4xl mx-auto p-4">
              <MessageInput
                isUserTyping={isUserTyping}
                contentAgentConnected={contentAgentConnected}
                analyticsAgentConnected={analyticsAgentConnected}
                webSearchAgentConnected={webSearchAgentConnected}
                mcpAgentConnected={mcpAgentConnected}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isConnected={!isConnected}
                placeholder={ !isUserTyping ? "Connecting..." :
                  contentAgentConnected
                    ? "Generate document with Thunai AI..."
                    : isConnected
                      ? activeTab === "general"
                        ? "Ask anything..."
                        : `Ask anything - Meetings`
                      : "Ask anything ..."
                }
                onToolSelect={(tool) => {
                  // Handle tool selection
                  switch (tool) {
                    case "deep-research":
                      handleSendMessage(
                        "Start a deep research session on a topic"
                      );
                      break;
                    case "create-image":
                      handleSendMessage("Create an image for me");
                      break;
                    case "web-search":
                      handleSendMessage("Search the web for information");
                      break;
                  }
                }}
                onCancelLoading={handleCancelLoading}
                onCanvasClick={handleCanvasClick}
                // onAnalyticsClick={handleAnalyticsClick}
                onMcpClick={handleMcpClick}
                onWebsearchClick={handleWebsearchClick}
                onCancelCanvas={handleCancelCanvas}
                onCancelMcp={handleCancelMcp}
                onCancelAnalytics={handleCancelAnalytics}
                onCancelWebsearch={handleCancelWebsearch}
                isCanvasLoading={isCanvasLoading}
                isMcpLoading={isMcpLoading}
                isWebsearchLoading={isWebsearchLoading}
                isAnalyticsLoading={isAnalyticsLoading}
                // contentAgentConnected={contentAgentConnected}
                // analyticsAgentConnected={analyticsAgentConnected}
                //  isCanvasMode={!!contentAgentSocketRef.current} // Or use a state variable to track this
                onContentAgentFeedback={handleContentAgentFeedback}
                activeTab={activeTab} // Pass the prop
                handleTabChange={handleTabChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Document Editor */}
      {isDocumentVisible && currentDocument && (
        <div className="md:w-1/2 fixed md:relative inset-0 md:inset-auto z-50 md:z-auto bg-background">
          <DocumentEditor
            document={currentDocument}
            onUpdateContent={updateDocument}
            onUpdateTitle={updateDocumentTitle}
            onClose={() => {
              if(!sidebarVisible){ toggleSidebar();
              }
              closeDocument();
            }}
          />
        </div>
      )}
      <WarningPopup
        isOpen={warningPopup.isOpen}
        message={warningPopup.message}
        onClose={handleCloseWarningPopup}
      />
      <style>
        {`
.scrollbar-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
}
`}
      </style>
    </div>
  );
};
