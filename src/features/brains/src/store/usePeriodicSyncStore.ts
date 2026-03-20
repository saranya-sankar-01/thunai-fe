import { create } from 'zustand';
import { getTenantId, requestApi } from '@/services/authService';
import { toast } from 'sonner';
import { Globe } from "lucide-react";
import weblink from "@/assets/weblink.jpg";
import { DateTime } from 'luxon';;
import { timeZone as timeZoneData } from '@/components/shared-components/timeZone';




// Define the interfaces for clarity
interface App {
  name: string;
  display_name: string;
  logo: string; 
  is_connected: boolean;
  action_application_id: string | null;
  oauth_application_id?: any;
}

interface Account {
  id: string;
  username: string;
    email?: string; 
}

interface Site {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
}
interface Drive {
  drive_id: string;
  drive_name: string;
  folders: string[];
}
interface NotionPage {
  id: string;
  name: string;
  has_children: boolean;
  children?: NotionPage[]; // For nested pages
}

interface ConfluenceSpace {
  key: string;
  name: string;
}
// New interface for Document360 Project
interface Document360Project {
  project_id: string;
  project_name: string;
  categories: { category_id: string; category_name: string; }[];
}

interface PeriodicSyncData {
  id: string;
  tenant_id: string;
  user_id: string;
  sync_type: string;
  creds: any; // This will vary by sync_type
  tested: boolean;
  time: string | null;
  timezone: string | null;
  supported_extensions: string;
  category: string;
  data_description: string | null;
  shared_tenant_ids: string[];
  created: string;
  updated: string;
  scheduler: {
    cron_expression: string | null;
    type: "onetime" | "scheduler";
    time: string | null;
    timezone: string | null;
    supported_extensions: string;
    updated: string;
  } | null;
  uploaded_by: string;
}
interface PeriodicSyncState {
  // Global state
  availablePlatforms: App[];
  isLoadingPlatforms: boolean;
  error: string | null;
  selectedPlatform: string | null;
  step: 1 | 2; // 1: Platform selection, 2: Schedule configuration
  tenantID: string | null;
createdSyncId:string | null;

  // WebLink specific state
  urls: string[];
  newUrl: string;
  enableCrawl: boolean;
  selectedCrawlLevel: number;

  // Cloud specific state
  connectedAccounts: Account[];
  isLoadingAccounts: boolean;
  selectedAccount: string | null;
 
  selectedFolders: string[]; // For Google Drive: array of selected folder IDs
  selectedFolderNames: string[]; // For Google Drive: array of selected folder names
  connectedFolders: Folder[];
  isLoadingFolders: boolean;

   connectedSites: Site[];
  isLoadingSites: boolean;
selectedSite: string | null; 


  office365Drives: Drive[]; // Store drives with their folders
  isLoadingOffice365Folders: boolean;
  selectedOffice365Folders: string[]; // Selected folder names
  selectedOffice365DriveId: string | null; // Selected drive ID
  selectedOffice365ServiceType: 'sharepoint' | 'onedrive' | ""; // New state for SharePoint/OneDrive selection
 office365OneDriveReadEnabled: boolean;
  office365SharePointReadEnabled: boolean;
  isLoadingOffice365ReadStatus: boolean;
    // Notion specific state
  notionPages: NotionPage[];
  isLoadingNotionPages: boolean;
  selectedNotionPages: string[]; // Selected page IDs
  selectedNotionPageNames: string[]; // Selected page names
  expandedNotionPages: Set<string>; // Track which pages are expanded
  notionObjectType: 'page' | 'database'; // Track if it's a page or database
   loadingNotionPageIds: Set<string>;

    // Confluence
  confluenceSpaces: ConfluenceSpace[];
  isLoadingConfluenceSpaces: boolean;
  selectedConfluenceSpaceKey: string | null;
  selectedConfluenceSpaceName: string | null;

// AWS S3 and Azure Blob Storage
  cloudStoragePath: string;

  // Document360 specific state
  document360Projects: Document360Project[];
  isLoadingDocument360Projects: boolean;
  selectedDocument360ProjectId: string | null;
  selectedDocument360ProjectName: string | null;
  selectedDocument360CategoryIds: string[];
  selectedDocument360CategoryNames: string[];

//servicenow
serviceNowQuery: string;

  //My Configuration
    myConfigurations: PeriodicSyncData[];
  isLoadingMyConfigurations: boolean;
  editingConfiguration: PeriodicSyncData | null;
  viewingConfigurations: boolean; // Controls if MyConfigurationsList is shown
 deletingConfigId: string | null; 
  // Schedule specific state
  syncType: "one-time" | "periodic";
  syncTime: "hour" | "everyday";
  startTime: string;
  timeZone: string;

    isNextLoading: boolean;
      isSaveLoading: boolean;
}

interface PeriodicSyncActions {
  // Global actions
  fetchPlatforms: () => Promise<void>;
  setSelectedPlatform: (platformName: string) => void;
  setStep: (step: 1 | 2) => void;
  resetState: () => void;

  // WebLink actions
  setUrls: (urls: string[]) => void;
  setNewUrl: (url: string) => void;
  setEnableCrawl: (enable: boolean) => void;
  setSelectedCrawlLevel: (level: number) => void;
  addUrl: () => void;
  removeUrl: (index: number) => void;

  // Cloud actions
  fetchConnectedAccounts: () => Promise<void>;
  setSelectedAccount: (accountId: string | null) => void;
  fetchConnectedSites: () => Promise<void>;
  setSelectedFolders: (folderIds: string[]) => void;
  toggleFolderSelection: (folder: Folder) => void; // New action for toggling individual folders
  fetchConnectedFolders: () => Promise<void>;
setSelectedSite: (siteId: string | null) => void;


//office 365
 fetchOffice365Folders: () => Promise<void>; // This is now for SharePoint site folders
  fetchOneDriveFolders: () => Promise<void>; // New action for OneDrive folders
  setSelectedOffice365DriveId: (driveId: string | null) => void;
  toggleOffice365FolderSelection: (folderName: string) => void;
  setSelectedOffice365Folders: (folderNames: string[]) => void;
  setSelectedOffice365ServiceType: (type: 'sharepoint' | 'onedrive' | null) => void; // New action
  fetchOffice365ReadStatus: (applicationId: string) => Promise<void>;
    // Notion actions
  fetchNotionPages: (parentId?: string) => Promise<void>;
  toggleNotionPageSelection: (page: NotionPage) => void;
  setSelectedNotionPages: (pageIds: string[]) => void;
  toggleNotionPageExpansion: (pageId: string) => void;
  fetchNotionChildPages: (parentId: string) => Promise<void>;
  
    // Confluence actions
  fetchConfluenceSpaces: () => Promise<void>;
  setSelectedConfluenceSpace: (spaceKey: string, spaceName: string) => void;
  
  //AWS s3 and azure 
  setCloudStoragePath: (path: string) => void;

  // Document360 actions
  fetchDocument360Projects: () => Promise<void>;
  setSelectedDocument360Project: (projectId: string, projectName: string) => void;
  toggleDocument360CategorySelection: (categoryId: string, categoryName: string) => void;
  setSelectedDocument360Categories: (categoryIds: string[]) => void;

//servicenow
setServiceNowQuery: (query: string) => void;

    // My Configurations
  fetchMyConfigurations: () => Promise<void>;
  startEditingConfiguration: (config: PeriodicSyncData) => void;
  stopEditingConfiguration: () => void;
  setViewingConfigurations: (view: boolean) => void;
  deleteConfiguration: (configId: string) => Promise<void>

  // Schedule actions
  setSyncType: (type: "one-time" | "periodic") => void;
  setSyncTime: (time: "hour" | "everyday") => void;
  setStartTime: (time: string) => void;
  setTimeZone: (zone: string) => void;

  // Combined action
  handleNextStep: () => Promise<void>;
  handleSaveSchedule: () => Promise<void>;

  
}

const defaultWebLinkPlatform: App = {
  name: 'web_link',
  display_name: 'Web Link',
  logo: weblink,
  is_connected: true,
  action_application_id: null,
};

const initialState: PeriodicSyncState = {
  createdSyncId:null,
  availablePlatforms: [defaultWebLinkPlatform],
  isLoadingPlatforms: true,
  error: null,
  selectedPlatform: defaultWebLinkPlatform.name,
  step: 1,
  tenantID: getTenantId(),

  urls: [],
  newUrl: "",
  enableCrawl: false,
  selectedCrawlLevel: 1,

  connectedAccounts: [],
  isLoadingAccounts: false,
  selectedAccount: null,
  connectedSites: [],
  isLoadingSites: false,
  selectedFolders: [], // Initialize as an empty array
  selectedFolderNames: [], // Initialize as an empty array
  connectedFolders: [],
  isLoadingFolders: false,
selectedSite: null,

 office365Drives: [],
  isLoadingOffice365Folders: false,
  selectedOffice365Folders: [],
  selectedOffice365DriveId: null,
  selectedOffice365ServiceType: null, // Initial state for new service type selection
  office365OneDriveReadEnabled: false,
  office365SharePointReadEnabled: false,
  isLoadingOffice365ReadStatus: false,

   notionPages: [],
  isLoadingNotionPages: false,
  selectedNotionPages: [],
  selectedNotionPageNames: [],
  expandedNotionPages: new Set(),
  notionObjectType: 'page',
    loadingNotionPageIds: new Set(),

      confluenceSpaces: [],
  isLoadingConfluenceSpaces: false,
  selectedConfluenceSpaceKey: null,
  selectedConfluenceSpaceName: null,

    cloudStoragePath: "",
  
    // Document360 initial states
  document360Projects: [],
  isLoadingDocument360Projects: false,
  selectedDocument360ProjectId: null,
  selectedDocument360ProjectName: null,
  selectedDocument360CategoryIds: [],
  selectedDocument360CategoryNames: [],

//servicenow
serviceNowQuery: "",

     // My Configurations state
  myConfigurations: [],
  isLoadingMyConfigurations: false,
  editingConfiguration: null,
  viewingConfigurations: false,
    deletingConfigId: null, 

  syncType: "periodic",
  syncTime: "everyday",
  startTime: "",
  timeZone: "",

   isNextLoading: false, 
     isSaveLoading: false,
};

export const usePeriodicSyncStore = create<PeriodicSyncState & PeriodicSyncActions>((set, get) => ({
  ...initialState,

  resetState: () =>
  set((state) => ({
    ...initialState,
    availablePlatforms: state.availablePlatforms, // preserve platforms
  })),

 fetchMyConfigurations: async () => {
    set({ isLoadingMyConfigurations: true, error: null });
    const { tenantID } = get();
    if (!tenantID) {
      toast.error("Tenant ID not found.");
      set({ isLoadingMyConfigurations: false });
      return;
    }

    try {
      const payload = {
        page: {
          size: 50,
          page_number: 1
        },
        sort: "asc",
        sortby: "created",
        filter: []
      };

      const response = await requestApi(
        "POST",
        `${tenantID}/knowledgebase/periodic/filter/`,
        payload,
        "authService"
      );

      // if (response?.data?.status === "success" && response?.data?.data?.data) {
        set({ myConfigurations: response.data.data });
      // } else {
      //   throw new Error("Invalid response format or failed to fetch configurations.");
      // }
    } catch (err) {
      console.error("Failed to fetch My Configurations:", err);
      toast.error("Failed to load configurations. Please try again.");
      set({ myConfigurations: [] });
    } finally {
      set({ isLoadingMyConfigurations: false });
    }
  },

  startEditingConfiguration: (config: PeriodicSyncData) => {
    set({
      editingConfiguration: config,
      viewingConfigurations: false, // Exit configurations list view
      step: 2, // Go to schedule step

      // Pre-populate schedule state based on the config
      createdSyncId: config.id, // Set the ID for update
      syncType: config.scheduler?.type === "onetime" ? "one-time" : "periodic",
      syncTime: config.scheduler?.cron_expression === "0 * * * *" ? "hour" : "everyday", // Infer from cron
      startTime: config.scheduler?.time || "",
      timeZone: config.scheduler?.timezone || "",
    });
  },

  stopEditingConfiguration: () => {
    set((state) => ({
      editingConfiguration: null,
      viewingConfigurations: true, // Go back to configurations list
      step: 1, // Reset step
      id: null, // Clear the ID
      // Reset schedule-related state to defaults
      syncType: "periodic",
      syncTime: "everyday",
      startTime: "",
      timeZone: "",
    }));
  },

  setViewingConfigurations: (view: boolean) => {
    set({ viewingConfigurations: view });
    if (view) {
      get().fetchMyConfigurations(); // Fetch when entering this view
    }
    //  else {
    //   set({ myConfigurations: [], editingConfiguration: null }); // Clear when exiting
    // }
  },
deleteConfiguration: async (configId: string) => {
  const { tenantID, fetchMyConfigurations } = get();
  if (!tenantID) {
    toast.error("Tenant ID not found.");
    return;
  }
 set({ deletingConfigId: configId });
  const deleteToastId = toast.loading("Deleting configuration...");

  try {
    const payload = { id: configId };

    const response = await requestApi(
      "DELETE",
      `${tenantID}/knowledgebase/periodic/sync/`,
      payload,
      "authService"
    );

    // if (response?.data?.status === "success") {
      toast.success( response?.message || "Deleted successfully!", { id: deleteToastId });
      await fetchMyConfigurations();
    // } else {
    //   throw new Error(response?.data?.message || "Failed to delete configuration.");
    // }
  } catch (error: any) {
    console.error("Error deleting configuration:", error);
    toast.error(
      error?.response?.data?.message ||
      error?.message || error?.response?.message ||
      "Something went wrong while deleting the configuration.",
      { id: deleteToastId }
    );
  }
   finally {
    set({ deletingConfigId: null }); // Clear the deleting ID regardless of success or failure
  }

},


  fetchPlatforms: async () => {
    set({ isLoadingPlatforms: true, error: null });
    const { tenantID } = get();
    try {
      const payload = {
        page: { size: 50, page_number: 1 },
        sort: "asc",
        sortby: "created",
        filter: []
      };

      const response = await requestApi(
        "POST",
        `${tenantID}/oauth2/app/connected/filter/`,
        payload,
        "authService"
      );

      const allowedApps = ['document360','google', 'aws_s3', 'azure_blob_storage', 'minio_storage', 'office365', 'confluence','notion','servicenow'];

      const responseDataArray = (response?.data?.data && Array.isArray(response.data.data))
        ? response.data.data
        : [];

      const filteredPlatforms = responseDataArray.filter((app: App) =>
        (app.is_connected || app.action_application_id) && allowedApps.includes(app.name)
      );

      set({ availablePlatforms: [defaultWebLinkPlatform, ...filteredPlatforms] });
    } catch (err) {
      console.error("Failed to fetch periodic sync platforms:", err);
      set({ error: "Failed to load platforms. Please try again.", availablePlatforms: [defaultWebLinkPlatform] });
    } finally {
      set({ isLoadingPlatforms: false });
    }
  },

  setSelectedPlatform: (platformName: string) => {
    set({ selectedPlatform: platformName });
  },
  setStep: (step: 1 | 2) => set({ step }),

  setUrls: (urls: string[]) => set({ urls }),
  setNewUrl: (newUrl: string) => set({ newUrl }),
  setEnableCrawl: (enableCrawl: boolean) => set({ enableCrawl: enableCrawl }),
  setSelectedCrawlLevel: (level: number) => set({ selectedCrawlLevel: level }),

  addUrl: () => {
    const { newUrl, urls } = get();
    const trimmedUrl = newUrl?.trim();
    if (!trimmedUrl) return;
    try {
      new URL(trimmedUrl);
      set({ urls: [...urls, trimmedUrl], newUrl: "" });
    } catch {
      toast.error("Please enter a valid URL");
    }
  },

  removeUrl: (index: number) => {
    set((state) => ({
      urls: state.urls.filter((_, i) => i !== index)
    }));
  },

  fetchConnectedAccounts: async () => {
    set({ isLoadingAccounts: true, connectedAccounts: [], selectedAccount: null });
    const { tenantID, selectedPlatform } = get();
    if (!tenantID || !(selectedPlatform === "google" || selectedPlatform === "office365")) {
      set({ isLoadingAccounts: false });
      return;
    }

    try {
      const payload = {
        page: { size: 10, page_number: 1 },
        sort: "asc",
        sortby: "created",
        filter: [
          {
            key_name: "name",
            key_value: selectedPlatform,
            operator: "==",
          },
        ],
      };

      const response = await requestApi(
        "POST",
        `${tenantID}/oauth2/app/connected/filter/`,
        payload,
        "authService"
      );

      const accounts =
        response?.data?.data?.map((app: any) => ({
          id: app.application_id,
          username: app?.application_identities || "Unnamed Account",
          email: app?.application_email || app?.application_identities, // Assuming application_email might be present or use identities
        })) || [];

      set({ connectedAccounts: accounts.filter((a: Account) => a.id !== null), selectedAccount: null });
    } catch (error) {
      console.error(`Failed to fetch ${selectedPlatform} accounts:`, error);
      toast.error(`Failed to load ${selectedPlatform} accounts.`);
      set({ connectedAccounts: [] });
    } finally {
      set({ isLoadingAccounts: false });
    }
  },

 setSelectedAccount: (accountId: string | null) => {
   set((state) => {
      const newState = {
      selectedAccount: accountId,
      
      // --- Reset Google Drive related states ---
      selectedFolders: [],         // Clear selected Google Drive folder IDs
      selectedFolderNames: [],     // Clear selected Google Drive folder names
      connectedFolders: [],        // Clear the list of fetched Google Drive folders

      // --- Reset Office 365 related states ---
      selectedSite: null,          // Clear selected Office 365 site ID
      connectedSites: [],          // Clear the list of fetched Office 365 sites
      office365Drives: [],         // Clear the list of fetched Office 365 drives
      selectedOffice365Folders: [],// Clear selected Office 365 folder names
      selectedOffice365DriveId: null, // Clear selected Office 365 drive ID
      selectedOffice365ServiceType: null, // Reset service type when account changes
      office365OneDriveReadEnabled: false, // Reset read status for new account selection
      office365SharePointReadEnabled: false, // Reset read status for new account selection
    };

    // If it's an Office 365 platform and an account is selected, fetch read status
     if (state.selectedPlatform === "office365" && accountId) {
      // Find the platform's 'id' from the availablePlatforms array
      const platformApp = state.availablePlatforms.find(
        (platform) => platform.name === state.selectedPlatform
      );

      if (platformApp && platformApp.action_application_id) {
        // Pass the platform's 'id' (e.g., "68ee1908d3b12cc86b2d5b5c") to fetch read status
        get().fetchOffice365ReadStatus(platformApp.action_application_id); 
      } else {
        console.warn("Could not find platform ID for selected Office 365 platform.");
        toast.error("Failed to retrieve platform information for Office 365.");
      }
    }

    return newState;
    });
  },

  
 toggleFolderSelection: (folder: Folder) => {
    set((state) => {
      const isSelected = state.selectedFolders.includes(folder.id);
      let newSelectedFolders: string[];
      let newSelectedFolderNames: string[];

      if (isSelected) {
        newSelectedFolders = state.selectedFolders.filter((id) => id !== folder.id);
        newSelectedFolderNames = state.selectedFolderNames.filter((name) => name !== folder.name);
      } else {
        newSelectedFolders = [...state.selectedFolders, folder.id];
        newSelectedFolderNames = [...state.selectedFolderNames, folder.name];
      }
      return { selectedFolders: newSelectedFolders, selectedFolderNames: newSelectedFolderNames };
    });
  },

  // New setter for selectedFolders (if you need to set the whole array at once)
  setSelectedFolders: (folderIds: string[]) => {
    set((state) => {
      const newSelectedFolderNames = state.connectedFolders
        .filter(f => folderIds.includes(f.id))
        .map(f => f.name);
      return { selectedFolders: folderIds, selectedFolderNames: newSelectedFolderNames };
    });
  },

fetchConnectedSites: async () => {
  set({ isLoadingSites: true, connectedSites: [], selectedSite: null });
  const { selectedPlatform, selectedAccount, tenantID, selectedOffice365ServiceType,availablePlatforms} = get();
  
  if (!(selectedPlatform === "office365" && selectedAccount && tenantID && selectedOffice365ServiceType === 'sharepoint')) {
    set({ isLoadingSites: false });
    return;
  }

  try {
        const platformApp = availablePlatforms.find(p => p.name === 'office365');
    const oauthApplicationId = platformApp?.oauth_application_id;
    

    const apiUrl = `${tenantID}/sharepoint/sites/?application_id=${oauthApplicationId}`;
    const response = await requestApi("GET", apiUrl, null, "authService");

    if (response?.status === "success" && Array.isArray(response.data)) {
      const sites = response.data.map((site: any) => ({
        id: site.id,
        name: site.name,
      }));

      set({ connectedSites: sites, selectedSite: null });
      
      if (sites.length === 0) {
        toast.info("No SharePoint sites found for this account.");
      }
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Failed to fetch Office 365 sites:", error);
    toast.error("Failed to load Office 365 sites.");
    set({ connectedSites: [] });
  } finally {
    set({ isLoadingSites: false });
  }
},


  fetchConnectedFolders: async () => {
    set({ isLoadingFolders: true, connectedFolders: [], selectedFolders: [], selectedFolderNames: [] }); // Reset selection
    const { selectedPlatform, selectedAccount, tenantID } = get();
    if (!(selectedPlatform === "google" && selectedAccount && tenantID)) {
      set({ isLoadingFolders: false });
      return;
    }

    try {
      const apiUrl = `${tenantID}/googledrive/folders/?application_id=${selectedAccount}`;
      const response = await requestApi("GET", apiUrl, null, "authService");

      const folders =
        response?.data?.map((f: any) => ({
          id: f.id,
          name: f.name,
        })) || [];

      set({ connectedFolders: folders, selectedFolders: [], selectedFolderNames: [] }); // Reset selection again after fetch
    } catch (error) {
      console.error("Failed to fetch Google Drive folders:", error);
      toast.error("Failed to load Google Drive folders.");
      set({ connectedFolders: [] });
    } finally {
      set({ isLoadingFolders: false });
    }
  },
 setSelectedSite: (siteId: string | null) => {
    set({
      selectedSite: siteId,
      office365Drives: [],
      selectedOffice365Folders: [],
      selectedOffice365DriveId: null,
    });
  },

  setSelectedOffice365DriveId: (driveId: string | null) => {
    set({ selectedOffice365DriveId: driveId, selectedOffice365Folders: [] });
  },

  toggleOffice365FolderSelection: (folderName: string) => {
    set((state) => {
      const isSelected = state.selectedOffice365Folders.includes(folderName);
      let newSelectedFolders: string[];

      if (isSelected) {
        newSelectedFolders = state.selectedOffice365Folders.filter((name) => name !== folderName);
      } else {
        newSelectedFolders = [...state.selectedOffice365Folders, folderName];
      }
      return { selectedOffice365Folders: newSelectedFolders };
    });
  },

  setSelectedOffice365Folders: (folderNames: string[]) => {
    set({ selectedOffice365Folders: folderNames });
  },
  fetchOffice365ReadStatus: async (applicationId: string) => {
    set({ isLoadingOffice365ReadStatus: true });
    const { tenantID } = get();

    if (!tenantID || !applicationId) {
      set({ isLoadingOffice365ReadStatus: false });
      return;
    }

    try {
      const apiUrl = `${tenantID}/oauth2/app/configure/?id=${applicationId}`;
      const response = await requestApi("GET", apiUrl, null, "authService");

      if (response?.status === "success" && response?.data) {
        const onedriveReadEnabled = response.data.action_fields.enable_onedrive_read ?? false;
        const sharepointReadEnabled = response.data.action_fields.enable_sharepoint_read ?? false;

        set({
          office365OneDriveReadEnabled: onedriveReadEnabled,
          office365SharePointReadEnabled: sharepointReadEnabled,
        });
      } else {
        throw new Error("Invalid response format or failed to fetch read status.");
      }
    } catch (error) {
      console.error(`Failed to fetch Office 365 read status for ${applicationId}:`, error);
      toast.error(error?.response?.data?.message || "Failed to verify Office 365 read permissions.");
      set({
        office365OneDriveReadEnabled: false,
        office365SharePointReadEnabled: false,
      });
    } finally {
      set({ isLoadingOffice365ReadStatus: false });
    }
  },

  setSelectedOffice365ServiceType: (type: 'sharepoint' | 'onedrive' | null) => {
    set({
      selectedOffice365ServiceType: type,
      // Reset site/drive/folder selections when service type changes
      selectedSite: null,
      connectedSites: [],
      office365Drives: [],
      selectedOffice365Folders: [],
      selectedOffice365DriveId: null,
    });
  },

  fetchOffice365Folders: async () => { // This is now specific to SharePoint site folders
    set({ isLoadingOffice365Folders: true, office365Drives: [], selectedOffice365Folders: [], selectedOffice365DriveId: null });
    const { selectedPlatform, selectedAccount, selectedSite, tenantID, connectedAccounts, selectedOffice365ServiceType } = get();
    
    if (!(selectedPlatform === "office365" && selectedAccount && selectedSite && tenantID && selectedOffice365ServiceType === 'sharepoint')) {
      set({ isLoadingOffice365Folders: false });
      return;
    }

    try {
      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      const applicationEmail = account?.email || account?.username || null;

      const payload = {
        site_id: selectedSite,
        application_id: selectedAccount,
        application_email: applicationEmail,
      };

      const response = await requestApi(
        "POST",
        `${tenantID}/sharepoint/folders/`,
        payload,
        "authService"
      );

      if (response?.status === "success" && Array.isArray(response.data)) {
        const drives = response.data.map((drive: any) => ({
          drive_id: drive.drive_id,
          drive_name: drive.drive_name,
          folders: drive.folders || [],
        }));

        set({ office365Drives: drives });
        
        if (drives.length > 0) {
          set({ selectedOffice365DriveId: drives[0].drive_id });
        }

        if (drives.length === 0) {
          toast.info("No drives found for this site.");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch Office 365 folders:", error);
      toast.error("Failed to load Office 365 folders.");
      set({ office365Drives: [] });
    } finally {
      set({ isLoadingOffice365Folders: false });
    }
  },

  fetchOneDriveFolders: async () => { // New action for OneDrive folders
    set({ isLoadingOffice365Folders: true, office365Drives: [], selectedOffice365Folders: [], selectedOffice365DriveId: null });
    const { selectedPlatform, selectedAccount, tenantID, connectedAccounts, selectedOffice365ServiceType } = get();

    if (!(selectedPlatform === "office365" && selectedAccount && tenantID && selectedOffice365ServiceType === 'onedrive')) {
      set({ isLoadingOffice365Folders: false });
      return;
    }

    try {
      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      const applicationEmail = account?.email || account?.username || null;

      const payload = {
        application_id: selectedAccount,
        // application_email: applicationEmail,
      };

      const response = await requestApi(
        "POST",
        `${tenantID}/onedrive/folders/`, // Use the new OneDrive endpoint
        payload,
        "authService"
      );

    if (response?.status === "success") {
  let drives = [];

  if (Array.isArray(response.data)) {
    drives = response.data.map((drive: any) => ({
      drive_id: drive.drive_id,
      drive_name: drive.drive_name,
      folders: drive.folders || [],
    }));
  } else if (response.data && typeof response.data === "object") {
    drives = [{
      drive_id: response.data.drive_id,
      drive_name: response.data.drive_name,
      folders: response.data.folders || [],
    }];
  }

  set({ office365Drives: drives });

  if (drives.length > 0) {
    set({ selectedOffice365DriveId: drives[0].drive_id });
  }

  if (drives.length === 0) {
    toast.info("No OneDrive drives found for this account.");
  }
}

      else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch OneDrive folders:", error);
      toast.error("Failed to load OneDrive folders.");
      set({ office365Drives: [] });
    } finally {
      set({ isLoadingOffice365Folders: false });
    }
  },


  fetchNotionChildPages: async (parentId: string) => {
    const { fetchNotionPages } = get();
    await fetchNotionPages(parentId);
  },

toggleNotionPageExpansion: async (pageId: string) => {
  console.log('toggleNotionPageExpansion called for:', pageId);
  
  const { expandedNotionPages, notionPages } = get();
  
  console.log('Current expanded pages:', Array.from(expandedNotionPages));
  
  // Find the page first
  const findPage = (pages: NotionPage[]): NotionPage | null => {
    for (const page of pages) {
      if (page.id === pageId) return page;
      if (page.children) {
        const found = findPage(page.children);
        if (found) return found;
      }
    }
    return null;
  };

  const page = findPage(notionPages);
  console.log('Found page:', page);
  
  const isCurrentlyExpanded = expandedNotionPages.has(pageId);
  console.log('Is currently expanded:', isCurrentlyExpanded);
  
  // Toggle the expanded state
  set((state) => {
    const newExpanded = new Set(state.expandedNotionPages);
    if (isCurrentlyExpanded) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    console.log('New expanded pages:', Array.from(newExpanded));
    return { expandedNotionPages: newExpanded };
  });

  // If expanding and page has children that haven't been loaded, fetch them
  if (!isCurrentlyExpanded && page && page.has_children) {
    const hasChildren = page.children && page.children.length > 0;
    console.log('Page has children loaded:', hasChildren);
    
    if (!hasChildren) {
      console.log('Fetching children for page:', pageId);
      await get().fetchNotionChildPages(pageId);
    }
  }
},



fetchNotionPages: async (parentId?: string) => {
  const { tenantID, selectedPlatform } = get();
  
  if (selectedPlatform !== "notion" || !tenantID) {
    return;
  }

  // Set loading for specific page (not global)
  if (parentId) {
    set((state) => ({
      loadingNotionPageIds: new Set([...state.loadingNotionPageIds, parentId])
    }));
  } else {
    set({ isLoadingNotionPages: true }); // Only for initial load
  }

  try {
    const queryParams = parentId 
      ? `type=sites&page_id=${parentId}`
      : `type=sites&query=`;
    
    const apiUrl = `${tenantID}/notion/list/?${queryParams}`;
    const response = await requestApi("GET", apiUrl, null, "authService");

    if (response?.status === "success" && Array.isArray(response.data)) {
      const pages = response.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        has_children: page.has_children,
        children: [],
      }));

      if (parentId) {
        set((state) => {
          const updateChildren = (pageList: NotionPage[]): NotionPage[] => {
            return pageList.map(p => {
              if (p.id === parentId) {
                return { ...p, children: pages };
              } else if (p.children && p.children.length > 0) {
                return { ...p, children: updateChildren(p.children) };
              }
              return p;
            });
          };
          return { notionPages: updateChildren(state.notionPages) };
        });
      } else {
        set({ notionPages: pages });
      }
    }
  } catch (error) {
    console.error("Failed to fetch Notion pages:", error);
    toast.error("Failed to load Notion pages.");
  } finally {
    if (parentId) {
      set((state) => {
        const newLoading = new Set(state.loadingNotionPageIds);
        newLoading.delete(parentId);
        return { loadingNotionPageIds: newLoading };
      });
    } else {
      set({ isLoadingNotionPages: false });
    }
  }
},

toggleNotionPageSelection: (page: NotionPage) => {
  set((state) => {
    const isSelected = state.selectedNotionPages.includes(page.id);
    let newSelectedPages: string[] = [...state.selectedNotionPages];
    let newSelectedPageNames: string[] = [...state.selectedNotionPageNames];

    // Helper function to get all LOADED descendant page IDs and names (non-recursive for unloaded)
    const getLoadedDescendants = (parentPage: NotionPage): { ids: string[], names: string[] } => {
      let ids: string[] = [];
      let names: string[] = [];
      
      // Only process children if they are already loaded
      if (parentPage.children && parentPage.children.length > 0) {
        for (const child of parentPage.children) {
          ids.push(child.id);
          names.push(child.name);
          
          // Recursively get descendants only if they're already loaded
          if (child.children && child.children.length > 0) {
            const descendants = getLoadedDescendants(child);
            ids = [...ids, ...descendants.ids];
            names = [...names, ...descendants.names];
          }
        }
      }
      
      return { ids, names };
    };

    if (isSelected) {
      // Deselect: Remove this page and all its LOADED descendants
      const descendants = getLoadedDescendants(page);
      const idsToRemove = [page.id, ...descendants.ids];
      const namesToRemove = [page.name, ...descendants.names];
      
      newSelectedPages = newSelectedPages.filter(id => !idsToRemove.includes(id));
      newSelectedPageNames = newSelectedPageNames.filter(name => !namesToRemove.includes(name));
    } else {
      // Select: Add this page and all its LOADED descendants
      const descendants = getLoadedDescendants(page);
      
      // Add parent
      if (!newSelectedPages.includes(page.id)) {
        newSelectedPages.push(page.id);
        newSelectedPageNames.push(page.name);
      }
      
      // Add all loaded descendants
      descendants.ids.forEach((id, index) => {
        if (!newSelectedPages.includes(id)) {
          newSelectedPages.push(id);
          newSelectedPageNames.push(descendants.names[index]);
        }
      });
    }

    return { 
      selectedNotionPages: newSelectedPages, 
      selectedNotionPageNames: newSelectedPageNames 
    };
  });
},

  setSelectedNotionPages: (pageIds: string[]) => {
    set((state) => {
      const findPageNames = (ids: string[], pages: NotionPage[]): string[] => {
        const names: string[] = [];
        const search = (pageList: NotionPage[]) => {
          for (const page of pageList) {
            if (ids.includes(page.id)) {
              names.push(page.name);
            }
            if (page.children) {
              search(page.children);
            }
          }
        };
        search(pages);
        return names;
      };
      
      const newSelectedPageNames = findPageNames(pageIds, state.notionPages);
      return { selectedNotionPages: pageIds, selectedNotionPageNames: newSelectedPageNames };
    });
  },
//confluence
 fetchConfluenceSpaces: async () => {
    set({ isLoadingConfluenceSpaces: true, confluenceSpaces: [], selectedConfluenceSpaceKey: null, selectedConfluenceSpaceName: null });
    const { tenantID, selectedPlatform } = get();
    
    if (selectedPlatform !== "confluence" || !tenantID) {
      set({ isLoadingConfluenceSpaces: false });
      return;
    }

    try {
      const apiUrl = `${tenantID}/confluence/spaces/?limit=100`;
      const response = await requestApi("GET", apiUrl, null, "authService");

      if (response?.status === "success" && response?.data?.spaces) {
        const spaces = response?.data?.spaces.map((space: any) => ({
          key: space.key,
          name: space.name,
        }));

        set({ confluenceSpaces: spaces });
        
        if (spaces.length === 0) {
          toast.info("No Confluence spaces found.");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch Confluence spaces:", error);
      toast.error("Failed to load Confluence spaces.");
      set({ confluenceSpaces: [] });
    } finally {
      set({ isLoadingConfluenceSpaces: false });
    }
  },

  setSelectedConfluenceSpace: (spaceKey: string, spaceName: string) => {
    set({ selectedConfluenceSpaceKey: spaceKey, selectedConfluenceSpaceName: spaceName });
  },

  setCloudStoragePath: (path: string) => {
    set({ cloudStoragePath: path });
  },

  // Document360 Actions
  fetchDocument360Projects: async () => {
    set({ isLoadingDocument360Projects: true, document360Projects: [], selectedDocument360ProjectId: null, selectedDocument360ProjectName: null, selectedDocument360CategoryIds: [], selectedDocument360CategoryNames: [] });
    const { tenantID } = get();
    try {
      // Using the exact URL provided by the user, assuming tenant ID is embedded or not needed dynamically here
      const apiUrl = `${tenantID}/document360/project/list/`;
      const response = await requestApi("POST", apiUrl, null, "authService");

      if (response?.status === "success" && Array.isArray(response.data)) {
        set({ document360Projects: response.data });
        if (response.data.length === 0) {
          toast.info("No Document360 projects found.");
        }
      } else {
        throw new Error("Invalid response format or failed to fetch Document360 projects.");
      }
    } catch (error) {
      console.error("Failed to fetch Document360 projects:", error);
      toast.error("Failed to load Document360 projects.");
      set({ document360Projects: [] });
    } finally {
      set({ isLoadingDocument360Projects: false });
    }
  },

  setSelectedDocument360Project: (projectId: string, projectName: string) => {
    set({
      selectedDocument360ProjectId: projectId,
      selectedDocument360ProjectName: projectName,
      selectedDocument360CategoryIds: [], // Clear categories when project changes
      selectedDocument360CategoryNames: [],
    });
  },

  toggleDocument360CategorySelection: (categoryId: string, categoryName: string) => {
    set((state) => {
      const isSelected = state.selectedDocument360CategoryIds.includes(categoryId);
      let newSelectedCategoryIds: string[];
      let newSelectedCategoryNames: string[];

      if (isSelected) {
        newSelectedCategoryIds = state.selectedDocument360CategoryIds.filter((id) => id !== categoryId);
        newSelectedCategoryNames = state.selectedDocument360CategoryNames.filter((name) => name !== categoryName);
      } else {
        newSelectedCategoryIds = [...state.selectedDocument360CategoryIds, categoryId];
        newSelectedCategoryNames = [...state.selectedDocument360CategoryNames, categoryName];
      }
      return {
        selectedDocument360CategoryIds: newSelectedCategoryIds,
        selectedDocument360CategoryNames: newSelectedCategoryNames,
      };
    });
  },

  setSelectedDocument360Categories: (categoryIds: string[]) => {
    set((state) => {
      const selectedProject = state.document360Projects.find(p => p.project_id === state.selectedDocument360ProjectId);
      const newSelectedCategoryNames: string[] = [];
      if (selectedProject) {
        selectedProject.categories.forEach(cat => {
          if (categoryIds.includes(cat.category_id)) {
            newSelectedCategoryNames.push(cat.category_name);
          }
        });
      }
      return {
        selectedDocument360CategoryIds: categoryIds,
        selectedDocument360CategoryNames: newSelectedCategoryNames,
      };
    });
  },

  setSyncType: (type: "one-time" | "periodic") => set({ syncType: type }),
  setSyncTime: (time: "hour" | "everyday") => set({ syncTime: time }),
  setStartTime: (time: string) => set({ startTime: time }),
  setTimeZone: (zone: string) => set({ timeZone: zone }),

//servicenow
setServiceNowQuery: (query: string) => set({ serviceNowQuery: query }),

handleNextStep: async () => {
    set({ isNextLoading: true });
  const {
    selectedPlatform,
    tenantID,
    urls,
    enableCrawl,
    selectedCrawlLevel,
    selectedAccount,
    selectedSite,
    selectedFolders,
    selectedFolderNames,
    selectedOffice365Folders, // Office 365 folder names
    selectedOffice365DriveId, // Office 365 drive ID
    connectedAccounts,
     selectedNotionPages, // Notion page IDs
    selectedNotionPageNames, // Notion page names
    notionObjectType,
   selectedConfluenceSpaceKey,
    cloudStoragePath,
    setStep,
    selectedOffice365ServiceType, // New state
    selectedDocument360ProjectId, // Document360 project ID
    selectedDocument360CategoryIds, // Document360 category IDs
  } = get();

  if (!tenantID) {
    toast.error("Tenant ID not found.");
        set({ isNextLoading: false }); 
    return;
  }

  try {
    let payload: any;
    let syncSuccess = false;

    if (selectedPlatform === 'web_link') {
      if (urls.length === 0) {
        toast.error("Please add at least one web link.");
          set({ isNextLoading: false });
        return;
      }
      payload = {
        sync_type: "weblink",
        web_links: urls,
        crawl: enableCrawl ?? false,
        crawl_level: enableCrawl ? selectedCrawlLevel ?? 0 : 0,
      };
    } else if (selectedPlatform === 'google') {
      if (!selectedAccount) {
        toast.error("Please select a Google Drive account.");
        return;
      }
      if (selectedFolders.length === 0) {
        toast.error("Please select at least one Google Drive folder.");
        return;
      }

      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      const applicationEmail = account?.email || null;

      payload = {
        sync_type: "googledrive",
        application_id: selectedAccount,
        folder_id: selectedFolders,
        folder_name: selectedFolderNames,
        application_email: applicationEmail,
      };
    } else if (selectedPlatform === 'office365') {
      if (!selectedAccount) {
        toast.error("Please select an Office 365 account.");
        set({ isNextLoading: false });
        return;
      }
      if (!selectedOffice365ServiceType) {
        toast.error("Please select either SharePoint or OneDrive.");
        set({ isNextLoading: false });
        return;
      }

      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      const applicationEmail = account?.email || account?.username || null;

      if (selectedOffice365ServiceType === 'sharepoint') {
        if (!selectedSite) {
          toast.error("Please select an Office 365 site.");
          set({ isNextLoading: false });
          return;
        }
        if (!selectedOffice365DriveId) {
          toast.error("Please select a drive.");
          set({ isNextLoading: false });
          return;
        }
        if (selectedOffice365Folders.length === 0) {
          toast.error("Please select at least one folder.");
          set({ isNextLoading: false });
          return;
        }

        payload = {
          sync_type: "office365",
          application_id: selectedAccount,
          folder_path: selectedOffice365Folders, // Array of folder names
          application_email: applicationEmail,
          site_id: selectedSite,
          drive_id: selectedOffice365DriveId,
                 };
      } else if (selectedOffice365ServiceType === 'onedrive') {
        if (!selectedOffice365DriveId) {
          toast.error("Please select a drive (OneDrive).");
          set({ isNextLoading: false });
          return;
        }
        if (selectedOffice365Folders.length === 0) {
          toast.error("Please select at least one folder.");
          set({ isNextLoading: false });
          return;
        }

        payload = {
          sync_type: "office365",
          application_id: selectedAccount,
          folder_path: selectedOffice365Folders, // Array of folder names
          application_email: applicationEmail,
          drive_id: selectedOffice365DriveId,
          app_type: "onedrive" // Explicitly add app_type for OneDrive as requested
        };
      }
    } else if (selectedPlatform === 'notion') {
      if (selectedNotionPages.length === 0) {
        toast.error("Please select at least one Notion page.");
        return;
      }

      payload = {
        sync_type: "notion",
        page_or_database_id: selectedNotionPages,
        page_or_database_name: selectedNotionPageNames,
        object_type: "page", // 'page' or 'database'
      };
    }else if (selectedPlatform === 'confluence') {
      if (!selectedConfluenceSpaceKey) {
        toast.error("Please select a Confluence space.");
        return;
      }
      payload = {
        sync_type: "confluence",
        space_key: selectedConfluenceSpaceKey,
      };
    }else if (selectedPlatform === 'aws_s3') {
    
      payload = {
        sync_type: "aws_s3",
        path: cloudStoragePath.trim() || "",
      };
    } else if (selectedPlatform === 'azure_blob_storage') {
      payload = {
        sync_type: "azure_blob_storage",
        path: cloudStoragePath.trim() || "",
      };
    } else if (selectedPlatform === 'minio_storage') { 
   
       payload = {
         sync_type: "minio_storage",
         path: cloudStoragePath.trim() || ""
        }
      } else if (selectedPlatform === 'document360') {
      if (!selectedDocument360ProjectId) {
        toast.error("Please select a Document360 project.");
        set({ isNextLoading: false });
        return;
      }
      if (selectedDocument360CategoryIds.length === 0) {
        toast.error("Please select at least one Document360 category.");
        set({ isNextLoading: false });
        return;
      }

      payload = {
        sync_type: "document360",
        project_id: selectedDocument360ProjectId,
        category_ids: selectedDocument360CategoryIds,
      };
    }
else if (selectedPlatform === 'servicenow') {
  const { serviceNowQuery } = get();
  if (!serviceNowQuery.trim()) {
    toast.error("Please enter a query.");
    set({ isNextLoading: false });
    return;
  }
  payload = {
    sync_type: "servicenow",
    search_query: serviceNowQuery.trim(),
  };
}
    else {
      toast.error("Please select a valid platform.");
      return;
    }

    const response = await requestApi(
      "POST",
      `${tenantID}/knowledgebase/periodic/sync/`,
      payload,
      "authService"
    );

    if (response?.data?.id) {
      const syncId = response.data.id;
      set({ createdSyncId: syncId }); // Store the sync ID
      toast.success(`${selectedPlatform} sync created successfully!`);
      syncSuccess = true;
    } else {
      toast.error(`Failed to start ${selectedPlatform} sync. Please try again.`);
    }

    if (syncSuccess) {
      setStep(2); // Move to scheduling screen
    }
  } catch (error) {
    console.error(`Error during ${selectedPlatform} sync:`, error);
    toast.error(  error?.response?.data?.message  || error?.response?.message || `Something went wrong while syncing ${selectedPlatform}.`);
  }
  finally {
    set({ isNextLoading: false }); // Always clear loading state
  }
},

handleSaveSchedule: async () => {
   set({ isSaveLoading: true });
  const {
    tenantID,
    syncType,
    syncTime,
    startTime,
    timeZone,
    createdSyncId, // Get the stored sync ID
  } = get();

  if (!tenantID) {
    toast.error("Tenant ID not found.");
    return;
  }

  if (!createdSyncId) {
    toast.error("Sync ID not found. Please go back and create the sync first.");
    return;
  }

  // Validation based on syncType and syncTime
  if (syncType === "periodic" && syncTime === "everyday") {
    if (!startTime || !timeZone) {
      toast.error("Please select a start time and time zone.");
      return;
    }
  }

  try {
    let schedulePayload: any = {
      id: createdSyncId, // Use the ID from the sync creation
    };

    if (syncType === "one-time") {
      schedulePayload.type = "onetime";
    } else if (syncType === "periodic") {
      schedulePayload.type = "scheduler";
      
      if (syncTime === "hour") {
        // Every hour: cron expression only
        schedulePayload.cron_expression = "0 * * * *";}
//       }else if (syncTime === "everyday") {
//   // Assuming startTime is in "HH:mm" format
//   const [hour, minute] = startTime.split(":").map(Number);

//   // Cron expression: minute hour * * *
//   schedulePayload.cron_expression = `${minute} ${hour} * * *`;
//   schedulePayload.time = startTime;
//   schedulePayload.timezone = timeZone;
// }
    else if (syncTime === "everyday") {
 const [hour, minute] = startTime.split(":").map(Number);

  const tzInfo = timeZoneData.find((tz) => tz.value === timeZone);
  const offset = tzInfo?.offset ?? 0; // offset in hours, can be fractional

  // Separate integer hours and minutes from offset
  const offsetHours = Math.trunc(offset); // e.g., 5
  const offsetMinutes = Math.round((offset - offsetHours) * 60); // e.g., 0.5*60 = 30

  // Convert local time to UTC
  let utcHour = hour - offsetHours;
  let utcMinute = minute - offsetMinutes;

  // Handle minute rollover
  if (utcMinute < 0) {
    utcMinute += 60;
    utcHour -= 1;
  } else if (utcMinute >= 60) {
    utcMinute -= 60;
    utcHour += 1;
  }

  // Handle hour rollover
  if (utcHour < 0) utcHour += 24;
  if (utcHour >= 24) utcHour -= 24;

  schedulePayload.cron_expression = `${utcMinute} ${utcHour} * * *`;
  schedulePayload.time = startTime;
  schedulePayload.timezone = timeZone;
}

    }

    const response = await requestApi(
      "POST",
      `${tenantID}/knowledgebase/periodic/schedule/`, // Adjust endpoint if needed
      schedulePayload,
      "authService"
    );

    if (response) {
      toast.success(  response?.message || "Sync schedule saved successfully!")
      get().resetState();
    } else {
      // toast.error("Failed to save sync schedule. Please try again.");
    }
  } catch (error) {
    console.error("Error saving sync schedule:", error);
    toast.error(   error?.response?.data?.message  || error?.response?.message || "Something went wrong while saving the sync schedule.");
  }
   finally {
    set({ isSaveLoading: false }); 
  }
},





}));
