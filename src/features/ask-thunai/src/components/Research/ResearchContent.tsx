import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef, act } from "react";
import React from "react";
import {
  Maximize2,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ResearchItem,
  ResearchVersion,
} from "../../components/Research/ResearchTypes";
import { GetChatHistory } from "../../api/research";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { use } from "marked";
import { set } from "date-fns";
import rehypeRaw from "rehype-raw";
import { get } from "http";
import { getAccessToken, getTenantId } from "@/services/authService";
import WarningPopup from "../chat/WarningPopup";
import { connect } from "http2";

interface ResearchContentProps {
  activeContent: string;
  versions: ResearchVersion[];
  sources: string[];
  status?: string;
  activeResearch: ResearchItem;
  onVersionChange: (content: string) => void;
  timestamp?: string;
  loading?: boolean;
}
const mockMessages = [
  {
    user: "hi",
    model:
      "Hello! How can I assist you today? Are you working on some research or do you need help with something specific?",
    tool_type: ["research"],
    canvas_content: null,
    image_sources: null,
    file_data: null,
    session_id: "698433e49cb8e0303507f95d",
    created: "2026-02-05T06:08:47.168000",
    id: "698433ef9cb8e0303507f95e",
  },
  {
    user: "hello",
    model:
      "Are you working on some research or do you need help with something specific?",
    tool_type: ["research"],
    canvas_content: null,
    image_sources: null,
    file_data: null,
    session_id: "698433e49cb8e0303507f95d",
    created: "2026-02-05T06:08:47.168000",
    id: "698433ef9cb8e0303507f95e",
  },
];
export const ResearchContent = ({
  activeContent,
  status,
  loading,
  sources,
  versions,
  activeResearch,
  timestamp = new Date().toLocaleDateString(),
}: ResearchContentProps) => {
  const [queryInput, setQueryInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: string; content: string; isStreaming?: boolean }>
  >([]);
  const [isQueryMode, setIsQueryMode] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const accumulatedMessageRef = React.useRef("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isCollapsedTitleExpanded, setIsCollapsedTitleExpanded] =
    useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const collapsedTitleRef = useRef<HTMLDivElement>(null);
  const [sessionid, setSessionid] = useState<string>(
    activeResearch?.chat_session_id || "",
  );
  const [isOpenPrompt, setIsOpenPrompt] = useState(false);
  const [warningPopup, setWarningPopup] = useState({
    isOpen: false,
    message: "",
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Focus input when query mode is activated
  useEffect(() => {
    if (isQueryMode && queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, [isQueryMode]);
  useEffect(() => {
    setSessionid(activeResearch?.chat_session_id || "");
  }, [activeResearch?.chat_session_id]);
//   useEffect(() => {
//     if (!sessionid) return;
//     const fetchPreviousMessages = async () => {
//       // alert("Fetching previous messages for session: " + sessionid);
//       const res= await GetChatHistory({ session_id: sessionid });
//       // console.log("Previous chat history:", res);
//       // const previousMessages = mockMessages;
//       const previousMessages = res.data || [];
//       const formattedMessages = previousMessages
//         .map((msg: any) => [
//           {
//             role: "user",
//             content: msg.user,
//             isStreaming: false,
//           },
//           {
//             role: "assistant",
//             content: msg.model,
//             isStreaming: false,
//           },
//         ])
//         .flat();
// setChatMessages(formattedMessages);
//       };
//     //   setChatMessages((prev) => [
//     //       ...prev,...formattedMessages]);
//     //   console.log("Formatted previous messages:", formattedMessages);
//     // };
//     fetchPreviousMessages();
//   }, [sessionid]);
useEffect(() => {
   setChatMessages([]);
  if (!activeResearch?.chat_session_id) return;
  
  // Clear existing messages when sessionid changes
 
  
  const fetchPreviousMessages = async () => {
    const res = await GetChatHistory({ session_id: activeResearch?.chat_session_id });
    const previousMessages = res.data.reverse() || [];
    const formattedMessages = previousMessages
      .map((msg: any) => [
        {
          role: "user",
          content: msg.user,
          isStreaming: false,
        },
        {
          role: "assistant",
          content: msg.model,
          isStreaming: false,
        },
      ])
      .flat();
    setChatMessages(formattedMessages);
  };
  
  fetchPreviousMessages();
}, [activeResearch?.chat_session_id]);
  const handleSocketMessage = (event: MessageEvent) => {
    try {
      const response = JSON.parse(event.data);
      console.log("📨 Received message:", response);

      if (response.type === "connection_success") {
        console.log("✅ Connection established:", response.session_id);
        // setSessionid(response.session_id);
        return;
      }

      // Handle reasoning messages
      if (response.message_type === "reasoning") {
        console.log("🧠 Reasoning:", response.message);
        return;
      }

      // Handle error messages
      if (response.type === "error") {
        console.error("❌ Error:", response.message);
        setWarningPopup({ isOpen: true, message: response?.message || response?.data?.message || "An error occurred." });
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              response.message ||
              response?.data?.message ||
              "An error occurred.",
            isStreaming: false,
          },
        ]);
        setIsStreaming(false);
        setIsLoading(false);
        return;
      }

      // Handle chat messages with turn_complete
      if (
        response.message_type === "chat" ||
        typeof response.turn_complete !== "undefined"
      ) {
        // Streaming in progress (turn_complete: false)
        if (response.turn_complete === false) {
          const partialText = response.message || "";

          if (partialText) {
            accumulatedMessageRef.current += partialText;
          }

          setIsStreaming(true);
          setIsLoading(false);
          // Only update messages if we have content
          if (accumulatedMessageRef.current.trim()) {
            setChatMessages((prev) => {
              const lastMessage = prev[prev.length - 1];

              // Update existing streaming message
              if (
                lastMessage &&
                lastMessage.role === "assistant" &&
                // !lastMessage.isUser &&
                lastMessage.isStreaming
              ) {
                const updated = [...prev];
                updated[prev.length - 1] = {
                  ...lastMessage,
                  content: accumulatedMessageRef.current,
                  isStreaming: true,
                };
                return updated;
              }

              // Create new streaming message
              return [
                ...prev,
                {
                  role: "assistant",
                  content: accumulatedMessageRef.current,
                  isStreaming: true,
                },
              ];
            });
          }

          return;
        }

        // Message complete (turn_complete: true)
        if (response.turn_complete === true) {
          const partialText = response.message || "";
          const fullMessage = (
            accumulatedMessageRef.current + partialText
          ).trim();

          console.log("✅ Message complete:", fullMessage);

          // Only add completed messages if there's actual content
          if (fullMessage) {
            setChatMessages((prev) => {
              const lastMessage = prev[prev.length - 1];

              // Update existing streaming message to complete
              if (
                lastMessage &&
                lastMessage.role === "assistant" &&
                // !lastMessage.isUser &&
                lastMessage.isStreaming
              ) {
                const updated = [...prev];
                updated[prev.length - 1] = {
                  ...lastMessage,
                  content: fullMessage,
                  isStreaming: false,
                };
                return updated;
              }

              // Create new complete message only if content exists
              if (fullMessage) {
                return [
                  ...prev,
                  {
                    role: "assistant",
                    content: fullMessage,
                    isStreaming: false,
                  },
                ];
              }

              return prev;
            });
          }

          // Reset accumulator
          accumulatedMessageRef.current = "";
          setIsStreaming(false);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: Handle simple message format
      if (response.message || response.content) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.message || response.content,
            isStreaming: false,
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  };

  const ConnectSocket = (id: string) => {
    const SOCKET_ENDPOINT = window["env"]["SOCKET_ENDPOINT"];
    const tenantId = getTenantId();
    const accessToken = getAccessToken();

    console.log("Attempting WebSocket connection...");
    console.log("Endpoint:", SOCKET_ENDPOINT);
    console.log("Tenant ID:", tenantId);
    console.log("Research ID:", id);
    if(socket) {
      socket.close();
      setSocket(null);
    }

    const socketUrl = `wss://${SOCKET_ENDPOINT}/chat-ws-service/chatai/ws/ask-thunai-chat/${tenantId}/${accessToken}/?tools=research&obj_id=${id}${activeResearch?.chat_session_id ? `&session_id=${activeResearch?.chat_session_id}` : ""}`;
    console.log(
      "WebSocket URL:",
      socketUrl.replace(accessToken || "", "***TOKEN***"),
    );

    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected successfully");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = handleSocketMessage;

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      console.error("Error details:", {
        readyState: ws.readyState,
        url: socketUrl.replace(accessToken || "", "***TOKEN***"),
      });
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected");
      console.log("Close details:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setIsConnected(false);
      setSocket(null);
    };
  };

  useEffect(() => {
    setIsQueryMode(false);
    // Disconnect existing
    //  socket before connecting new one
    if (socket) {
      console.log("🔌 Disconnecting existing socket...");
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }


    const objId = versions[0]?.periodic?.obj_id;

    // Only connect socket if obj_id exists
    if (objId) {
      ConnectSocket(objId);
    } else {
      console.log("⚠️ No obj_id provided, skipping socket connection");
    }

    // Cleanup function to disconnect socket when component unmounts or dependency changes
    return () => {
      if (socket) {
        console.log("🔌 Cleaning up socket connection...");
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [versions[0]?.periodic?.obj_id]);
  console.log("WebSocket versions:", versions, versions[0]?.periodic?.obj_id);
  const handleSendQuery = async () => {
    if (!queryInput.trim()) return;
    const userMessage = queryInput.trim();

    // If socket is not connected, try to connect
    if (!socket || !isConnected) {
      const objId = versions[0]?.periodic?.obj_id;
      if (objId) {
        ConnectSocket(objId);
        // Wait briefly for connection
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setIsLoading(true);
    try {
      const payload = JSON.stringify({
        query: userMessage,
      });
      if (socket && isConnected) {
        socket.send(payload);
        console.log("Message sent:", payload);
      } else {
        throw new Error("Socket not connected");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Failed to send message. Please try again.",
        },
      ]);
       setIsLoading(false);
    }

    setQueryInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const handleActivateQueryMode = (id: string) => {
    setIsQueryMode(true);
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };
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
      if (socket) {
        socket.close();
      }

      // Clear any existing reconnect timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reconnect with current chat unique ID
      try {
        ConnectSocket(versions[0]?.periodic?.obj_id || "");
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
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500">Loading research content...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Collapsed Summary Card - Shows when query mode is active */}
          {isQueryMode && (
            <Card className="mx-8 mt-8 mb-4 border-blue-200 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-gray-700">
                        Research Context
                      </p>
                    </div>
                    <div className="mb-2">
                      <div
                        ref={collapsedTitleRef}
                        className={cn(
                          "text-base font-medium text-gray-900",
                          !isCollapsedTitleExpanded &&
                            "overflow-hidden line-clamp-3",
                          isCollapsedTitleExpanded &&
                            "max-h-[200px] overflow-y-auto",
                          "[&::-webkit-scrollbar]:w-1.5",
                          "[&::-webkit-scrollbar-track]:bg-transparent",
                          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                          "[&::-webkit-scrollbar-thumb]:rounded-full",
                          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-400",
                        )}
                      >
                        {activeResearch?.ai_title ||
                          activeResearch?.prompt ||
                          "Research Analysis"}
                        {/* {researchTitle}
                         */}
                      </div>
                      {activeResearch?.prompt &&
                        activeResearch.prompt.length > 100 && (
                          <button
                            onClick={() => {
                              setIsCollapsedTitleExpanded(
                                !isCollapsedTitleExpanded,
                              );
                              if (
                                isCollapsedTitleExpanded &&
                                collapsedTitleRef.current
                              ) {
                                collapsedTitleRef.current.scrollTop = 0;
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                          >
                            {isCollapsedTitleExpanded
                              ? "Show less"
                              : "Show more"}
                          </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activeContent?.substring(0, 150)}...
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsQueryMode(false);
                      setQueryInput("");
                    }}
                    className="ml-4"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Maximize
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header Section - Only show when content is expanded */}
          {!isQueryMode && (
            <div className="px-8 pt-8 border-b bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between">
                <div className="mb-4  w-[80%]">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                    CONTEXT ANALYSIS
                  </p>
                  <div className="relative">
                    <div
                      ref={titleRef}
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        !isTitleExpanded &&
                          "text-lg font-semibold leading-tight line-clamp-3 text-gray-900",
                        isTitleExpanded &&
                          "text-lg font-semibold leading-relaxed max-h-[300px] overflow-y-auto text-gray-800",
                        "[&::-webkit-scrollbar]:w-0",
                        "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                        "[&::-webkit-scrollbar-thumb]:rounded-full",
                      )}
                    >
                      {activeResearch?.ai_title ||
                        activeResearch?.prompt ||
                        "Research Analysis"}
                    </div>

                    {!activeResearch?.ai_title &&
                      activeResearch?.prompt &&
                      activeResearch.prompt.length > 150 && (
                        <button
                          onClick={() => {
                            setIsTitleExpanded(!isTitleExpanded);
                            if (isTitleExpanded && titleRef.current) {
                              titleRef.current.scrollTop = 0;
                            }
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          {isTitleExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                  </div>
                </div>{" "}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-gray-400">
                    {new Date(timestamp + "Z").toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  {activeResearch?.ai_title && (
                    <Button
                      onClick={() => setIsOpenPrompt(true)}
                      className="justify-end mb-2 bg-blue-700 hover:bg-blue-800"
                    >
                      View Prompt
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 w-[100%] overflow-hidden flex flex-col">
            {/* Research Content or Chat Messages */}
            <ScrollArea className="flex-1 px-8 py-6">
              <div className="">
                {isQueryMode ? (
                  /* Chat Messages - When query mode is active and content is collapsed */
                  <div className="space-y-6">
                    {/* {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-4",
                          msg.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="relative group">
                          <div
                            className={cn(
                              "rounded-2xl px-5 py-3 shadow-sm max-w-[480px] whitespace-pre-wrap",
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-800",
                            )}
                          >
                            <p className="text-sm leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            className={cn(
                              "absolute bottom-2 right-0 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md",
                              msg.role === "user"
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                            )}
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                        {msg.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              <User className="h-5 w-5 text-black" />
                            </span>
                          </div>
                        )}
                      </div>
                    ))} */}
                    {chatMessages
  .filter(
    (msg) =>
      typeof msg.content === "string" &&
      msg.content.trim().length > 0
  )
  .map((msg, idx) => (
    <div
      key={idx}
      className={cn(
        "flex gap-4",
        msg.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      {msg.role === "assistant" && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="relative group">
        <div
          className={cn(
            "rounded-2xl px-5 py-3 shadow-sm max-w-[480px] whitespace-pre-wrap",
            msg.role === "user"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-800",
          )}
        >
          <p className="text-sm leading-relaxed">
            {msg.content}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCopyMessage(msg.content, idx)}
          className={cn(
            "absolute bottom-2 right-0 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md",
            msg.role === "user"
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700",
          )}
        >
          {copiedIndex === idx ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {msg.role === "user" && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-black" />
        </div>
      )}
    </div>
  ))}

                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl px-5 py-3 shadow-sm bg-white border border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                            {/* <span className="text-xs text-gray-500">Thinking...</span> */}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  /* Full Research Content - Default view or when expanded */
                  <>
                  { typeof status !== "undefined" && status !== "done" && status !== "completed" ? (
            <div className="flex flex-col items-center justify-center w-full h-64">
              {/* Loader spinner */}
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-300 mb-4" />
              <p className="text-gray-400 text-center text-sm">Research is in progress, please wait.</p>
            </div>):(<div className="prose prose-slate max-w-none">
                   
                        <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                       rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mb-4 mt-6 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold mb-3 mt-5 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm leading-6 mb-4">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-4 ml-5 list-disc space-y-2">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="mb-4 ml-5 list-decimal space-y-2">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li className="text-sm leading-6">{children}</li>
                        ),
                         table: ({ children }) => (
        <div className=" text-sm overflow-x-auto my-2">
            <table className="min-w-full border-collapse border border-border">
                {children}
            </table>
        </div>
    ),
    th: ({ children }) => (
        <th className="border border-border bg-muted px-3 py-2 text-sm text-left font-semibold">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border border-border px-2 py-1 text-sm whitespace-normal break-words sm:break-normal sm:whitespace-normal break-all">
            {children}
        </td>
    ),
                      }}
                    >
                      {activeContent || ""}
                    </ReactMarkdown>
                    
                    
                    
                    {sources.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-2">
                          References:
                        </h3>
                        <ul className="space-y-2 ml-6">
                          {sources.map((source, index) => (
                            <li
                              key={index}
                              className="list-disc text-sm prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:font-medium [&_p]:m-0 [&_p]:leading-relaxed"
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 hover:underline"
                                    >
                                      {children}
                                      <ExternalLink className="h-3 w-3 inline" />
                                    </a>
                                  ),
                                  p: ({ children }) => (
                                    <p className="m-0 text-gray-700">
                                      {children}
                                    </p>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold">
                                      {children}
                                    </strong>
                                  ),
                                  // em: ({ children }) => <em className="italic">{children}</em>,
                                }}
                              >
                                {source}
                              </ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>)}
              </>
                  
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Query Input at Bottom */}
          <div className="border-t bg-white px-8 py-6 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={queryInputRef}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Query specific details about this report..."
                      className="w-full h-12 pl-4 pr-12 text-sm bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      // disabled={!isQueryMode}
                      onClick={() =>
                        handleActivateQueryMode(
                          versions[0]?.periodic?.obj_id || "",
                        )
                      }
                    />
                    <Button
                      onClick={handleSendQuery}
                      disabled={!queryInput.trim() || !isQueryMode}
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Activate Query Mode Button or Context Info */}
                <div className="mt-3 flex justify-center items-center gap-2">
                  <span className="text-xs justify-center text-gray-400">
                    Ask about findings, methodology, or request deeper analysis
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isOpenPrompt && (
        <Dialog open={isOpenPrompt} onOpenChange={setIsOpenPrompt}>
          <DialogContent className="max-w-2xl ">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Research Prompt
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                View the original prompt that initiated this research
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-lg border bg-slate-50 p-4 h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
              <div className="prose prose-slate prose-sm max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{activeResearch.prompt}</ReactMarkdown>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <WarningPopup
        // isOpen={warningPopup.isOpen}
        isOpen={warningPopup.isOpen && isQueryMode} 
        message={warningPopup.message}
        onClose={handleCloseWarningPopup}
      />
    </div>
  );
};
