import { useMemo } from "react";

type PermissionLevel = "ALL" | "READ";

const DEFAULT_PERMISSIONS: Record<string, PermissionLevel> = {
  oauth_application_admin: "ALL",
  knowledgebase: "ALL",
  salesenablement: "ALL",
  oauth_application: "ALL",
  smart_query: "ALL",
  chat_agent: "ALL",
  voice_agent: "ALL",
  accounts: "ALL",
  accounts_admin: "ALL",
  note_taker: "ALL",
  email_track: "ALL",
  developer: "ALL",
  email_agent: "ALL",
  application_agent: "ALL",
  payments_admin: "ALL",
  chat: "ALL",
  feedback_training: "ALL",
  crm: "ALL",
  common_agent: "ALL",
  reflect_ai: "ALL",
}

const PERMISSION_TO_FOLDER_MAP: Record<string, string[]> = {
  knowledgebase: ["Brain"],
  salesenablement: ["Meeting Assistants"],
  chat_agent: ["Chat Agents"],
  voice_agent: ["Voice Agents"],
  smart_query: ["Smart Suggestions"],
  note_taker: ["Notes"],
  oauth_application: ["Applications"],
  email_agent: ["Email Agents"],
  crm: ["Revenue AI"],
  common_agent: ["Common Agents"],
  reflect_ai: ["Reflect AI"],
};

export function usePermissions() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  /* Get filtered permissions from user info */
  const filteredPermissions = useMemo(() => {
    if (!userInfo?.profile?.permissions) return {};

    const userPermissions = userInfo.profile.permissions;

    // Wildcard case
    if (userPermissions === "*" || userPermissions.includes("*")) {
      return Object.keys(DEFAULT_PERMISSIONS).reduce((acc, key) => {
        acc[key] = "ALL";
        return acc;
      }, {} as Record<string, PermissionLevel>);
    }

    // Parse specific permissions
    return userPermissions.reduce((acc: Record<string, PermissionLevel>, permission: string) => {
      const [key, value] = permission.split(":");
      if (key && (value === "ALL" || value === "READ")) {
        acc[key] = value as PermissionLevel;
      }
      return acc;
    }, {});
  }, [userInfo]);

  /* Check if user has a permission level */
  const hasPermission = (permissionKey: string, requiredLevel: PermissionLevel): boolean => {
    if (!filteredPermissions || !(permissionKey in filteredPermissions)) return false;

    const userLevel = filteredPermissions[permissionKey];
    const accessHierarchy: Record<PermissionLevel, number> = {
      ALL: 2,
      READ: 1,
    };

    return accessHierarchy[userLevel] >= accessHierarchy[requiredLevel];
  };

  /* Filter folders based on permissions */
  const getFilteredFolders = (
    filteredKeys: string[],
    folderStructure: {
      name: string;
      subfolders: { name: string; icon: string; link: string }[];
      isOpen: boolean;
    }[]
  ) => {
    return folderStructure
      .map((folder) => {
        if (folder.name === "OVERVIEW") return folder;

        if (folder.name === "CUSTOM AGENT PAGE") {
          return filteredKeys.some((p) =>
            ["voice_agent", "chat_agent"].includes(p)
          )
            ? folder
            : null;
        }

        const filteredSubfolders = folder.subfolders.filter((subfolder) =>
          filteredKeys.some((permission) =>
            PERMISSION_TO_FOLDER_MAP[permission]?.includes(subfolder.name)
          )
        );

        return filteredSubfolders.length > 0
          ? { ...folder, subfolders: filteredSubfolders }
          : null;
      })
      .filter(Boolean) as typeof folderStructure;
  };

  return {
    userInfo,
    filteredPermissions,
    hasPermission,
    getFilteredFolders,
  };
}