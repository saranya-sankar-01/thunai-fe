import { apiRequest, getTenantId, requestApi } from "@/services/authService";

const tenant_id = getTenantId();

export const addToDrive = async (message: string, connectionId?: string) => {
  const payload = {
    file_data: message,
    application_id: connectionId ,
  };

  // const result = await apiRequest("/save/to/google/drive/", {
  //   method: "POST",
  //   devicetype: "chromeplugin",
  //   body: JSON.stringify(payload),
  // });
  const response = await requestApi("POST",`${tenant_id}/save/to/google/drive/`,payload,"authService")
  const result = response

  return result.data;
};


export const checkGoogleDrivePermissions = async () => {
  try {
    // const response = await apiRequest(
    //   "/get/linked/apps/",
    //   {
    //     method: "GET",
    //     devicetype: "chromeplugin", 
    //   }
    // );
const response = await requestApi("GET",`${tenant_id}/get/linked/apps/`,null,"authService")
const result = response
    const googleApp = result.data?.find(app => app.name === "google");

    if (!googleApp) {
      return { enabled: false, connections: [] };
    }

    const driveWriteEnabled =
      googleApp.action_fields?.enable_drive_write === true;

    return {
      enabled: driveWriteEnabled,
      connections: driveWriteEnabled ? googleApp.connection : []
    };
  } catch (error) {
    console.error("Error checking Google Drive permissions:", error);
    return { enabled: false, connections: [] };
  }
};
