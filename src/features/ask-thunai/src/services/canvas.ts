import { apiRequest } from "./content-agent-service";


export const createCanvasFromConversation = async (object_id: string) => {
  const response = await apiRequest(`/canvas/create/`, {
    method: "POST",
    devicetype: "chromeplugin",
    body: JSON.stringify({ session_id: object_id }),
  });

  if (response?.canvas_session_id) {
    return response.canvas_session_id;
  }

  throw new Error("Canvas session ID not found in response");
};