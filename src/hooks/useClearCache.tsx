import { getAccessToken, getTenantId, requestApi } from '@/services/authService';
import * as React from "react";

export function useCacheClear() {
  const tenantId = getTenantId();
  const token = getAccessToken();

  React.useEffect(() => {
    const clearSessionCache = async () => {
      if (!token || !tenantId) {
        console.log("Skipping cache clear - not authenticated");
        return;
      }
      try {
        await requestApi(
          "POST",
          `brain/cache/clear-session/${tenantId}/`,
          null,
          "brainService"
        );
      } catch (error) {
        console.error("Cache clear error:", error);
      }
    };

    clearSessionCache();
  }, [token, tenantId]);
}
