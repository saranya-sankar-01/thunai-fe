import { getTenantId, requestApi } from "../api_auth";
import { apiRequest } from "./api";

const tenant_id = getTenantId();

export const thumpsUp = async (payload: {
  in_response_to: string;
  is_response_satisfy: boolean;
  feedback_text?: string;       // Optional feedback message
}) => {
  const result = await apiRequest("feedback/", {
    method: "POST",
    devicetype: "chromeplugin",
    body: JSON.stringify(payload),
  });

  return result.data;
};

export const deleteConversationHistory = async (param: {
  unique_id: string;
     
}) => {
   const { unique_id } = param;
  // const result = await apiRequest(`chat/?uniqueid=${unique_id}`, {
  //   method: "DELETE",
  //   devicetype: "chromeplugin",
  // });
const response = await requestApi("DELETE",`${tenant_id}/chat/?uniqueid=${unique_id}`,null,"chatService")
const result = response
  return result.data;
};

