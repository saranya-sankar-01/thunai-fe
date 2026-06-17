// services/chat.ts
import { apiRequest, getTenantId, requestApi } from "@/services/authService";
import { Message } from "../components/chat/ChatLayout";

const tenant_id = getTenantId();
import { isSameDay } from "date-fns";

// export const loadChatConversations = async (pageNumber = 1, pageSize = 20) => {
//   const payload = {
//     page: {
//       size: pageSize,
//       page_number: pageNumber,
//     },
//     sort: "desc",
//     sortby: "created",
//     filter: [],
//   };
  
//   try {
//     const response = await requestApi(
//       "POST",
//       `${localStorage.getItem("tenant_id")}/chat-history/filter/`,
//       payload,
//       "authService"
//     );
//     const result = response;
//     console.log("isNew", result.data.data.is_new);

//     // ✅ Filter out items where is_new === false
//     const filteredData = result.data.data.filter(
//       (item: any) => item.is_new === false
//     );
//     console.log(filteredData);
//     const apiConversations = filteredData.map((item: any, index: number) => ({
//       id: item.session_id,
//       title: item.title || `Untitled Chat`,
//       isActive: index === 0,
//       unique_id: item.uniqueid,
//       chatBotType: item.chatbot_type,
//       object_id: item.id,
//       is_new: item?.is_new,
//     }));

//     return apiConversations;
//   } catch (error) {
//     console.error("Error loading conversations:", error);
//     return [];
//   }
// };
export const loadChatConversations = async (pageNumber = 1, pageSize = 20) => {
  const payload = {
    page: { size: pageSize, page_number: pageNumber },
    sort: "desc",
    sortby: "created",
    filter: [],
  };

  try {
    const response = await requestApi("POST", `${tenant_id}/chat-history/filter/`, payload, "authService");
    
    const rawData = response?.data?.data || [];

    // ✅ FIX 1: Lenient filter (allows undefined/null)
    const filteredData = rawData.filter(
      (item: any) => item.is_new === false || item.is_new === undefined || item.is_new === null
    );

    const apiConversations = filteredData.map((item: any) => ({
      id: item.session_id,
      title: item.title || `Untitled Chat`,
      isActive: false,
      unique_id: item.uniqueid,
      chatBotType: item.chatbot_type,
      object_id: item.id || item.session_id, // Fallback if id is missing
      is_new: item?.is_new,
    }));

    // ✅ FIX 2: Return an OBJECT, not an array
    return {
      conversations: apiConversations,
      hasMore: rawData.length === pageSize 
    };
  } catch (error) {
    console.error("Error loading conversations:", error);
    return { conversations: [], hasMore: false };
  }
};

export const fetchChatHistory = async (
  sessionId: string,
  object_id: string
): Promise<{ messages: Message[]; uniqueId: string | null }> => {
  const path = `${tenant_id}/get/chat-history/${sessionId}/`;
  const payload = {
    sort: "desc",
    sortby: "created",
    page: { size: 10, page_number: 1 },
    filter: [],
  };
  const response = await requestApi("POST", path, payload, "authService");
  const data = response;
  let messages: Message[] = [];
  let uniqueId: string | null = null;

  if (data.status === "success" && data.data) {
    uniqueId = data.data.uniqueid || null;
    
    // Helper function to convert timestamp to IST
    const convertToIST = (timestamp) => {
      const date = new Date(timestamp);
      // IST is UTC+5:30 (330 minutes ahead of UTC)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      return new Date(date.getTime() + istOffset);
    };
    
    console.log(data.data);

    if (data.data) {
      // ✅ Filter out incomplete records that only have session_id and id
      const validChats = data.data.filter((chat) => {
        // Check if chat has essential fields beyond just session_id and id
        return chat.user || chat.model || chat.created;
      });

      console.log("Valid chats after filtering:", validChats);

      const rawMessages = validChats
        .reverse()
        .map((chat) => {
          const istTimestamp = convertToIST(chat.created);
          const userFiles = chat.file_data?.map((f: any) => f.data) || [];
          console.log("User file_data for this message:", userFiles);

          const userMessage = {
            id: `${sessionId}-user-${chat.created}`,
            content: chat.user,
            isUser: true,
            timestamp: istTimestamp, // Use IST timestamp
            tabType: "general",
            file_data: userFiles,
            images: userFiles,
          };

          const aiMessage = {
            id: `${sessionId}-ai-${chat.created}`,
            content: chat.model,
            isUser: false,
            reasoning: chat.reasoning,
            tabType: "general",
            timestamp: istTimestamp,
            in_response_to: userMessage.id,
            sources: Array.isArray(chat.reffered_sources)
              ? chat.reffered_sources
              : [],
            images: Array.isArray(chat.image_sources) ? chat.image_sources : [],
            canvas_content: chat.canvas_content || undefined,
            toolType: Array.isArray(chat.tool_type) ? chat.tool_type : [],
          };

          return [userMessage, aiMessage];
        })
        .flat();

      // 🔑 Add date grouping with IST timestamps
      let lastDate = null;
      messages = rawMessages.map((msg) => {
        const currentDate = new Date(msg.timestamp); // This is already in IST
        const showDateSeparator =
          !lastDate || !isSameDay(currentDate, lastDate);
        lastDate = currentDate;

        return { ...msg, showDateSeparator };
      });
    }
  }

  return { messages, uniqueId };
};