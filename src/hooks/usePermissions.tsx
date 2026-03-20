import { getLocalStorageItem } from "@/services/authService";
import { useEffect, useMemo, useState } from "react";

function readPermissions() {
  try {
    const userInfo = getLocalStorageItem("user_info");
    const permissions = userInfo?.profile?.permissions ||  JSON.parse(localStorage.getItem("permissions"))
    return permissions;
  } catch {
    return [];
  }
}

export default function usePermissions() {
  const [permissions, setPermissions] = useState(readPermissions()); // useEffect(() => {
  //   const handleStorageChange = () => {
  //     setPermissions(readPermissions());
  //   };
  //   window.addEventListener("storage", handleStorageChange);
  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);
  const isSuperAdmin = permissionSet.has("*");

  const hasPermission = (key: string, type: string) => {
    if (isSuperAdmin) return true;
    return permissionSet.has(`${key}:${type}`);
  };

  const canViewModule = (key: string) => {
    return hasPermission(key, "ALL") || hasPermission(key, "READ");
  };

  const canModifyModule = (key: string) => {
    return hasPermission(key, "ALL");
  };

  return {
    permissions,
    canViewModule,
    canModifyModule,
    hasPermission,
  };
}
