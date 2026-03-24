import { getAccessToken, getTenantId } from "@/services/authService";
import { useRef, useEffect, useState } from "react";
const url = new URL(window.location.href); // or use your URL string
const token = getAccessToken();
const tenant_id = getTenantId();
const csrf_token = url.searchParams.get("csrf_token");
const SOCKET_ENDPOINT = window['env']['SOCKET_ENDPOINT'];

const useSocketConnection = (tenantID) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null); 
  const reconnectTimeoutRef = useRef(null);
  const messageHandlerSetRef = useRef(false);
  const contentAgentSocketRef = useRef(null);
  const analyticsSocketRef = useRef(null);

  // NEW tool-specific socket refs
  const toolSocketsRef = useRef({
    websearch: null,
    mcp: null,
  });

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const closeGeneralSocket = () => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {
        console.warn("Error closing general socket:", e);
      }
      socketRef.current = null;
    }
    messageHandlerSetRef.current = false;
    setIsConnected(false);
  };

  const closeContentAgentSocket = () => {
    if (contentAgentSocketRef.current) {
      try {
        contentAgentSocketRef.current.close();
      } catch (e) {
        console.warn("Error closing content agent socket:", e);
      }
      contentAgentSocketRef.current = null;
    }
    setIsConnected(false);
  };


  const closeToolSockets = () => {
    Object.keys(toolSocketsRef.current).forEach((tool) => {
      const s = toolSocketsRef.current[tool];
      if (s) {
        try {
          s.close();
        } catch (e) {
          console.warn(`Error closing ${tool} socket:`, e);
        }
        toolSocketsRef.current[tool] = null;
      }
    });
    setIsConnected(false);
  };

const closeAllSockets = () => {
  if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
    try {
      socketRef.current.close();
      console.log("Closed general chat socket");
    } catch (e) {
      console.warn("Error closing general socket:", e);
    }
    socketRef.current = null;
    messageHandlerSetRef.current = false;
    setIsConnected(false);
  }

  if (contentAgentSocketRef.current && contentAgentSocketRef.current.readyState !== WebSocket.CLOSED) {
    try {
      contentAgentSocketRef.current.close();
      console.log("Closed content agent socket");
    } catch (e) {
      console.warn("Error closing content agent socket:", e);
    }
    contentAgentSocketRef.current = null;
    setIsConnected(false);
  }

  // Close analytics socket if open
  if (analyticsSocketRef.current && analyticsSocketRef.current.readyState !== WebSocket.CLOSED) {
    try {
      analyticsSocketRef.current.close();
      console.log("Closed analytics socket");
    } catch (e) {
      console.warn("Error closing analytics socket:", e);
    }
    analyticsSocketRef.current = null;
    setIsConnected(false);
  }

  // Close tool sockets if open
  Object.keys(toolSocketsRef.current).forEach((tool) => {
    const s = toolSocketsRef.current[tool];
    if (s && s.readyState !== WebSocket.CLOSED) {
      try {
        s.close();
        console.log(`Closed ${tool} socket`);
      } catch (e) {
        console.warn(`Error closing ${tool} socket:`, e);
      }
      toolSocketsRef.current[tool] = null;
    }
  });
};

const connectSocket = (uniqueId?: string) => {
  closeAllSockets();
  console.log("connectSocket called with:", uniqueId);

  // let socketUrl = `wss://api.thunai.ai/chat-service/chatai/ws/ask-thunai-chat/${tenant_id}/${token}/`;
     let socketUrl = `wss://${SOCKET_ENDPOINT}/chat-ws-service/chatai/ws/ask-thunai-chat/${tenant_id}/${token}/`;

  if (uniqueId && uniqueId !== "1") {
    console.log(uniqueId, "✅ Using unique id in socket");
    socketUrl += `?session_id=${uniqueId}`;
  } else {
    console.log("🚫 Skipping session_id param (new conversation)");
  }

  if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
    socketRef.current.close();
  }

  messageHandlerSetRef.current = false;

  const socket = new WebSocket(socketUrl);
  socketRef.current = socket;

  socket.addEventListener("open", () => {
    console.log("WebSocket connection established (general chat)");
    setIsConnected(true);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed (general chat)");
    setIsConnected(false);
    messageHandlerSetRef.current = false;
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error (general chat):", error);
  });

  return socket;
};

  

  // ---------------------------
  // Generic tool socket connection
  // ---------------------------
  const connectToolSocket = (toolName:string,session_id?:string) => {
    console.log("session Id from mcp socket",session_id)
    if (!["websearch", "mcp", "analytics","canvas"].includes(toolName)) {
      console.error(`Invalid tool name: ${toolName}`);
      return null;
    }

    // ensure exclusivity: close all existing sockets before opening the tool socket
    closeAllSockets();

    // tool-specific URL — for analytics we still use analyticsSocketRef above (keep both paths consistent)
    // const toolSocketUrl = `wss://api.thunai.ai/chat-service/chatai/ws/ask-thunai-chat/${tenant_id}/${token}/?tools=${toolName}`;
let toolSocketUrl = `wss://${SOCKET_ENDPOINT}/chat-ws-service/chatai/ws/ask-thunai-chat/${tenant_id}/${token}/?tools=${toolName}`;
  if (session_id) {
    toolSocketUrl += `&session_id=${session_id}`;
  }
    // Close old socket if needed
    if (toolSocketsRef.current[toolName] && toolSocketsRef.current[toolName].readyState !== WebSocket.CLOSED) {
      toolSocketsRef.current[toolName].close();
    }

    const socket = new WebSocket(toolSocketUrl);
    // store socket for this tool so we can close it later
    toolSocketsRef.current[toolName] = socket;

    socket.addEventListener("open", () => {
      console.log(`${toolName} WebSocket connection established`);
      setIsConnected(true);
    });

    socket.addEventListener("close", () => {
      console.log(`${toolName} WebSocket connection closed`);
      setIsConnected(false);
      toolSocketsRef.current[toolName] = null;
    });

    socket.addEventListener("error", (error) => {
      console.error(`${toolName} WebSocket error:`, error);
      setIsConnected(false);
      toolSocketsRef.current[toolName] = null;
    });

    return socket;
  };

  const sendToolMessage = (toolName, message) => {
    const socket = toolSocketsRef.current[toolName];
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error(`${toolName} WebSocket is not connected`);
      return false;
    }

    const payload = { query: message };
    socket.send(JSON.stringify(payload));
    console.log(`Message sent through ${toolName} WebSocket:`, payload);
    return true;
  };

  const sendContentAgentFeedback = (feedback) => {
    if (!contentAgentSocketRef.current || contentAgentSocketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Content Agent WebSocket is not connected");
      return false;
    }

    const payload = { query: feedback };
    contentAgentSocketRef.current.send(JSON.stringify(payload));
    console.log("Feedback sent to Content Agent:", payload);
    return true;
  };

  const sendMessage = (message, uniqueId, chatType, imagePayloads = null) => {
  if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected (general chat)");
    return false;
  }

  const payload:any = {
    query: message,
    // type: "chat_bot",
    // uniqueid: uniqueId || generateUniqueId(),
    // subtype: chatType === "general" ? "kb_chat" : "call_chat",
  };

  if (imagePayloads && imagePayloads.length > 0) {
    payload.file_data = imagePayloads; // ✅ Already clean base64 (no prefix)
  }

  socketRef.current.send(JSON.stringify(payload));
  console.log("📤 Message sent through WebSocket (general chat):", payload);
  return true;
};

useEffect(() => {
    return () => {
      // cleanup everything on unmount
      closeAllSockets();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // tenantID intentionally in deps to ensure cleanup if tenant changes
  }, [tenantID]);

  const setupMessageHandler = (messageHandler) => {
    if (!socketRef.current) return;
    if (!messageHandlerSetRef.current) {
      const handleMessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("Raw WebSocket response:", response);
          messageHandler(response);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      // ensure no duplicate listeners
      socketRef.current.removeEventListener("message", handleMessage);
      socketRef.current.addEventListener("message", handleMessage);
      messageHandlerSetRef.current = true;
      console.log("WebSocket message handler set up (general chat)");
    }
  };

  const sendRawMessageToActiveSocket = (payload: any) => {
  const message = JSON.stringify(payload);

  // Check general socket
  if (socketRef.current?.readyState === WebSocket.OPEN) {
    socketRef.current.send(message);
    console.log("Sent via general socket");
    return true;
  }

  //  Check content agent socket
  if (contentAgentSocketRef.current?.readyState === WebSocket.OPEN) {
    contentAgentSocketRef.current.send(message);
    console.log("Sent via content agent socket");
    return true;
  }

  //  Check analytics socket
  if (analyticsSocketRef.current?.readyState === WebSocket.OPEN) {
    analyticsSocketRef.current.send(message);
    console.log("Sent via analytics socket");
    return true;
  }

  //  Check all tool sockets
  for (const tool of Object.keys(toolSocketsRef.current)) {
    const toolSocket = toolSocketsRef.current[tool];
    if (toolSocket?.readyState === WebSocket.OPEN) {
      toolSocket.send(message);
      console.log(`Sent via ${tool} socket`);
      return true;
    }
  }

  console.error("No active WebSocket connection found");
  return false;
};

  return {
    isConnected,
    socketRef,
    sendMessage,
    generateUniqueId,
    setupMessageHandler,
    connectSocket,
    messageHandlerSetRef,
    contentAgentSocketRef,
    sendContentAgentFeedback,
    sendRawMessageToActiveSocket,
    // NEW tool sockets
    connectToolSocket,
    sendToolMessage,
    toolSocketsRef,

    // helpers (optional to expose)
    closeAllSockets,
    closeGeneralSocket,
    closeContentAgentSocket,
    closeToolSockets,
  };
};

export { useSocketConnection };
