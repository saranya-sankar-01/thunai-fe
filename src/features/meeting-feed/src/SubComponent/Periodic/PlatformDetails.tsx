import { useState } from "react";
import {getLocalStorageItem, requestApi } from "../../Service/MeetingService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { timeZone } from "../ReuseComponent/TimeZone";


// import { EditForm } from "./ConfigData";

/* ---------------- HELPERS ---------------- */

const url = new URL(window.location.href);
// const getTenantId = () =>url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

const userInfo = getLocalStorageItem("user_info") || {};
// const tenant_id = userInfo?.default_tenant_id;
const getTenantId = () =>userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

/* ---------------- TYPES ---------------- */

interface ConfigDataType {
  enable_sharepoint_read?: boolean;
  enable_onedrive_read?: boolean;
}

interface SyncResponseType {
  id: number;
  [key: string]: any;
}


// type TimezoneOption = {
//   value: string;
//   label: string;
//   offsetMinutes: number;
// };


export interface PlatformDetailsType {
  id: string;
  display_name: string;
  logo: string;
  name: string; 
  multiple_account: boolean;
  platform_name: string;
  is_connected : boolean;
  application_identities: string[];
  application_id: string;
  oauth_application_id: string;
  application_ids: string;
  action_application_id?: number | null;
  sync_type: string;
  drive_id?: string;
}

interface DriveFolderData {
  drive_id: string;
  drive_name: string;
  folders: string[];
}

interface FolderType {
  id: string;
  name: string;
  path: string;
  drive_id: string;
  drive_name: string;
  fullPath?: string;
}
interface DriveFolder {
  id: string;
  name: string;
}

interface Props {
  PeriodicPlateForm: PlatformDetailsType[];
  setUploadData: (value: boolean) => void;
  
}

/* ---------------- COMPONENT ---------------- */

const PlatformDetails: React.FC<Props> = ({
  PeriodicPlateForm,
  setUploadData,
}) => {
  // console.log("PeriodicPlateForm",PeriodicPlateForm);
  
  const platforms: PlatformDetailsType[] = PeriodicPlateForm ?? [];

  // console.log("platform",platforms);
  





  /* ---------------- STATE ---------------- */

  const [selectedPlatform, setSelectedPlatform] =useState<PlatformDetailsType | null>(null);

  const [syncResponse, setSyncResponse] = useState<SyncResponseType | null>(null);



  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  const [service, setService] = useState<
    "sharepoint" | "onedrive" | "googledrive" | ""
  >("");

  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [configeData, setConfigeData] = useState<ConfigDataType | null>(null);

console.log("sites====>",sites);

  const [folders, setFolders] = useState<FolderType[]>([]);
  const [driveData, setDriveData] = useState<DriveFolderData | null>(null);
  const [selectedFolders, setSelectedFolders] = useState<FolderType[]>([]);


  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPeriodic, setShowPeriodic] = useState(false);

const [syncType, setSyncType] = useState<"onetime" | "periodic">("onetime");
const [frequency, setFrequency] = useState<"hourly" | "daily">("daily");
const [startTime, setStartTime] = useState<string>("");

const [timezone, setTimezone] = useState<string>(timeZone[0].value);




  // configu Api  

  const CallConfigueApi =async(id:number)=>{

    const tenant_id = getTenantId();
    try{
       const Response= await requestApi(
        "GET",
        `${tenant_id}/oauth2/app/configure/?id=${id}`,
         {},
         "authService")

        //  console.log("Response data--> ",Response)
         setConfigeData(Response?.data?.action_fields);
    }catch(error){
      console.error(error)
    }
  }

  /* ---------------- PLATFORM CLICK ---------------- */

  const handlePlatformClick = async (item: PlatformDetailsType) => {
    console.log("app_ID",item);

    if (item.action_application_id != null) {
  CallConfigueApi(item.action_application_id);
}
    setSelectedPlatform(item);
    setAccounts(item.application_identities || []);
    setService("");
    setSites([]);
    setFolders([]);
    setSelectedSite("");
    setSelectedFolders([]);
    setSelectedAccount("");
    setDriveData(null);

    const tenant_id = getTenantId();

    try {
      // Connected app check
      await requestApi(
        "POST",
        `${tenant_id}/oauth2/app/connected/filter/`,
        {
          filter: [
            {
              key_name: "name",
              key_value: item.display_name,
              operator: "==",
            },
          ],
        },
        "authService"
      );

      // For SharePoint/OneDrive platforms, fetch sites
      if (item.display_name !== "Google Workspace") {
        const siteRes = await requestApi(
          "GET",
          `${tenant_id}/sharepoint/sites/?application_id=${item.application_ids}`,
          {},
          "authService"
        );
        setSites(siteRes?.data || []);
      }
    }catch (err: any) {
  console.error(err);
  const errorMessage = err?.siteRes?.message || "Failed to fetch folders...!";

  toast.error(errorMessage);
}
  };

  /* ---------------- FETCH FOLDERS ---------------- */
  // console.log("selectedSite",selectedSite);

  const fetchFolders = async ( currentService?: "sharepoint" | "onedrive" | "googledrive" | "",siteId?: string) => {
    if (!selectedPlatform) return;

    const usedService = currentService ?? service;

    setIsLoading(true);
    const tenant_id = getTenantId();

    try {
      if (selectedPlatform.display_name === "Google Workspace") {
        // Google Drive folders - fetch immediately without service selection
        const res = await requestApi(
          "GET",
          `${tenant_id}/googledrive/folders/?application_id=${ selectedPlatform?.oauth_application_id || selectedPlatform?.application_id}`,
          {
            application_id: selectedPlatform?.oauth_application_id || selectedPlatform?.application_id,
          },
          "authService"
        );

        // Handle the response structure
        if (res?.data && Array.isArray(res.data)) {
          // Google response is array of folder objects with id, name, owners, shared
          const folderList = res.data.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            path: folder.id,
          }));

          setFolders(folderList);
          setDriveData({
            drive_id: "google_drive",
            drive_name: "Google Drive",
            folders: folderList.map((f: DriveFolder) => f.name), // Extract just folder names
          });
        } else {
          setFolders([]);
          setDriveData(null);
        }
      } else if (usedService === "sharepoint") {
        // SharePoint folders
        const res = await requestApi(
          "POST",
          `${tenant_id}/sharepoint/folders/`,
          {
            application_id: selectedPlatform.application_id,
            application_email: selectedAccount,
            site_id: siteId ?? selectedSite,
          },
          "authService"
        );

        // Handle SharePoint response
        if (res?.data && res.data.length > 0) {
          const driveFolderData = res.data[0];
          setDriveData(driveFolderData);

          const folderList = driveFolderData.folders.map(
            (folderName: string) => ({
              name: folderName,
              path: folderName,
              drive_id: driveFolderData.drive_id || "",
              drive_name: driveFolderData.drive_name || "SharePoint",
              fullPath: `${
                driveFolderData.drive_name || "SharePoint"
              }/${folderName}`,
            })
          );

          setFolders(folderList);
        } else if (res?.data && res.data.folders) {
          // Alternative response format
          setDriveData(res.data);

          const folderList = res.data.folders.map(
            (folderName: string) => ({
              name: folderName,
              path: folderName,
              drive_id: res.data.drive_id || "",
              drive_name: res.data.drive_name || "SharePoint",
              fullPath: `${
                res.data.drive_name || "SharePoint"
              }/${folderName}`,
            })
          );

          setFolders(folderList);
        } else {
          setFolders([]);
          setDriveData(null);
        }
      } else if (usedService === "onedrive") {
        // OneDrive folders
        const res = await requestApi(
          "POST",
          `${tenant_id}/onedrive/folders/`,
          {
            application_id: selectedPlatform.oauth_application_id ||  selectedPlatform.application_id,
          },
          "authService"
        );

        // Handle OneDrive response
        if (res?.data && res.data.length > 0) {
          const driveFolderData = res.data[0];
          setDriveData(driveFolderData);

          const folderList = driveFolderData.folders.map(
            (folderName: string) => ({
              name: folderName,
              path: folderName,
              drive_id: driveFolderData.drive_id || "",
              drive_name: driveFolderData.drive_name || "OneDrive",
              fullPath: `${
                driveFolderData.drive_name || "OneDrive"
              }/${folderName}`,
            })
          );

          setFolders(folderList);
        } else if (res?.data && res.data.folders) {
          // Alternative response format
          setDriveData(res.data);

          const folderList = res.data.folders.map(
            (folderName: string) => ({
              name: folderName,
              path: folderName,
              drive_id: res.data.drive_id || "",
              drive_name: res.data.drive_name || "OneDrive",
              fullPath: `${
                res.data.drive_name || "OneDrive"
              }/${folderName}`,
            })
          );

          setFolders(folderList);
        } else {
          setFolders([]);
          setDriveData(null);
        }
      }
    } catch (err) {
      console.error("Error fetching folders:", err);
      setFolders([]);
      setDriveData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- FOLDER SELECTION HANDLERS ---------------- */

  const handleFolderSelect = (folder: FolderType) => {
    setSelectedFolders((prev) => {
      const isAlreadySelected = prev.some((f) => f.path === folder.path);
      if (isAlreadySelected) {
        // Remove if already selected
        return prev.filter((f:any) => f.path !== folder.path);
      } else {
        // Add to selection
        return [...prev, folder];
      }
    });
  };

  const handleSelectAllFolders = () => {
    if (selectedFolders.length === folders.length) {
      // If all are selected, deselect all
      setSelectedFolders([]);
    } else {
      // Select all folders
      setSelectedFolders([...folders]);
    }
  };

  const handleRemoveFolder = (folderPath: string) => {
    setSelectedFolders((prev) => prev.filter((f) => f.path !== folderPath));
  };

  const clearAllSelections = () => {
    setSelectedFolders([]);
  };

  /* ---------------- HANDLERS ---------------- */

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAccount(value);
    setService("");
    setFolders([]);
    setSelectedFolders([]);
    setSelectedSite("");
    setDriveData(null);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as
      | "sharepoint"
      | "onedrive"
      | "googledrive"
      | "";
    setService(value);
    setFolders([]);
    setSelectedFolders([]);
    setSelectedSite("");
    setDriveData(null);

    // For non-Google platforms, fetch folders after service selection
    if (selectedPlatform?.display_name !== "Google Workspace" && value) {
      if (value === "sharepoint" && selectedSite) {
        fetchFolders("sharepoint");
      } else if (value === "onedrive") {
        fetchFolders("onedrive");
      }
    }
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSite(value);
    if (value && service === "sharepoint") {
      fetchFolders("sharepoint", value);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const SubmitPeriodicData = async () => {
    // if (selectedFolders.length === 0 || !selectedPlatform) {
    //   toast.error("Please select at least one folder");
    //   return;
    // }

    const tenant_id = getTenantId();
    let payload;

    if (isGoogle) {
      // Google Workspace payload structure
      payload = {
        sync_type: "googledrive",
        application_email: selectedAccount,
        application_id:selectedPlatform.oauth_application_id || selectedPlatform.application_id,
        folder_id: selectedFolders.map((folder) => folder.id),
        folder_name: selectedFolders.map((folder) => folder.name),
      };
    } else {
      // Other platforms payload structure
      payload = {
        sync_type: selectedPlatform?.name,
        app_type: service,
        application_email: selectedAccount,
        application_id: selectedPlatform?.oauth_application_id || selectedPlatform?.application_id,
        folder_path: selectedFolders.map((folder) => folder.path),
        site_id: service === "sharepoint" ? selectedSite : null,
        drive_id: driveData?.drive_id ?? null,
      };
    }


    try {
      const res = await requestApi(
        "POST",
        `${tenant_id}/salesenablement/periodic/sync/`,
        payload,
        "authService"
      );
      setSyncResponse(res?.data || null);

      toast.success(res?.message);

        setShowPeriodic(true)

    } catch (err: any) {
  console.error(err);

  const errorMessage = err?.res?.message ||
    err?.message ||
    "Something went wrong";

  toast.error(errorMessage);
}
  };

  // console.log("syncResponse",syncResponse)

  const isGoogle = selectedPlatform?.display_name === "Google Workspace";

  
const allowedApps = [
  'google',
  'aws_s3',
  'azure_blob_storage',
  'minio_storage',
  'office365',
];

// const filteredPlatforms = (platforms ?? []).filter(
//   (p: PlatformDetailsType) =>
//     allowedApps.includes(p.name.toLowerCase()) &&
//     (p.is_action_connected || p.action_application_id != null)
// );

const filteredPlatforms = (platforms ?? []).filter(
  (p: PlatformDetailsType) =>
    allowedApps.includes(
      (p.name ?? "").toLowerCase()
    ) &&
    (p.is_connected || p.action_application_id != null)
);






const SendPeriodicData = async () => {
  if (!selectedPlatform?.id) {
    toast.error("Platform not selected");
    return;
  }

  const tenant_id = getTenantId();
const selectedTZ = timeZone.find(tz => tz.value === timezone);

  let payload: any = {
    id: syncResponse?.id
  };

  // One-time
  if (syncType === "onetime") {
    payload.type = "onetime";
  }

  // Periodic
  if (syncType === "periodic") {
    payload.type = "scheduler";

    if (frequency === "hourly") {
      payload.cron_expression = "0 * * * *";
      payload.time = null;
      // payload.timeZone = timezone;
      payload.timeZone = selectedTZ?.value;
    }

    if (frequency === "daily") {
      const [hours, minutes] = startTime.split(":");
      payload.cron_expression = `${minutes} ${hours} * * *`;
      payload.time = startTime;
      payload.timeZone = selectedTZ?.value;
    }
  }

  try {
    const res = await requestApi(
      "POST",
      `${tenant_id}/salesenablement/periodic/schedule/`,
      payload,
      "authService"
    );

     toast.success(res?.message);

    setTimeout(() => {
      setUploadData(false);
    }, 2000);
  } catch (err: any) {
  console.error(err);

  const errorMessage = err?.res?.message ||
    err?.message ||
    "Something went wrong";

  toast.error(errorMessage);
}
};


// console.log("filteredPlatforms",filteredPlatforms)
  return (
    <div className="space-y-6 mt-4 overflow-y-auto h-[calc(90vh-100px)] p-2">
{
  showPeriodic ? <div className="h-[70vh] w-full">

     <div className="bg-white p-6 rounded-lg shadow space-y-6">

  {/* ================= Sync Type ================= */}
  <div>
    <h3 className="text-sm font-semibold text-gray-700 mb-2">
      Sync Type
    </h3>

    <div className="flex gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={syncType === "onetime"}
          onChange={() => setSyncType("onetime")}
        />
        <span className="text-sm">One-time</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={syncType === "periodic"}
          onChange={() => setSyncType("periodic")}
        />
        <span className="text-sm">Periodic</span>
      </label>
    </div>
  </div>

  {/* ================= Periodic Options ================= */}
  {syncType === "periodic" && (
    <div className="border rounded-md p-4 space-y-4 bg-gray-50">

      {/* Frequency */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Frequency
        </h4>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={frequency === "hourly"}
              onChange={() => setFrequency("hourly")}
            />
            <span className="text-sm">Every Hour</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={frequency === "daily"}
              onChange={() => setFrequency("daily")}
            />
            <span className="text-sm">Every Day</span>
          </label>
        </div>
      </div>

      {/* Daily Options */}
      {frequency === "daily" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
               value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
                 >
                {timeZone.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.text}
                  </option>
                ))}
              </select>

          </div>
        </div>
      )}
    </div>
  )}

  {/* ================= Buttons ================= */}
  <div className="flex justify-end gap-3 pt-4 border-t">
    <button
      onClick={() => {
                setSelectedFolders([]);
                setUploadData(false);
                // setShowPeriodic(false);
              }}
      className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
    >
      Cancel
    </button>

   <button
  onClick={SendPeriodicData}
  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Save
</button>


  </div>
</div>



       {/* <div className="fixed bottom-0 flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setSelectedFolders([]);
                // setUploadData(false);
                setShowPeriodic(false);
              }}
              className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              // onClick={handleSubmit}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          </div> */}




           </div> : <div>

     {/* PLATFORMS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
         {filteredPlatforms.length === 0 ? (
                <p className=" flex items-center justify-center col-span-full text-sm text-gray-500 text-center h-[50vh]">
                  No platform here, kindly enable the platform brain as soon as possible.
                </p>
              ) : (
               filteredPlatforms.map((item: PlatformDetailsType) => (
      <div
        key={item.id}
        onClick={() => handlePlatformClick(item)}
        className={`border cursor-pointer flex flex-col items-center rounded-lg p-4 bg-white shadow ${
          selectedPlatform?.id === item.id ? "ring-2 ring-blue" : ""
        }`}
      >
        <img
          src={item.logo}
          className="h-10 mb-2"
          alt={item.display_name}
        />
        <p className="font-medium">{item.display_name}</p>
      </div>
    ))
  )}
</div>

 {/* ACCOUNT - Show for all platforms including Google */}
      {selectedPlatform && accounts.length > 0 && (
        <div className="mt-2">
          <p className="font-medium mb-2">Select Account</p>
          <select
            className="border p-2 w-full rounded"
            value={selectedAccount}
            onChange={handleAccountChange}
          >
            <option value="">Select Account</option>
            {accounts.map((acc, i) => (
              <option key={i} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* SERVICE - Hide for Google Workspace */}
      {selectedPlatform && !isGoogle && selectedAccount && (
        <div>
          <p className="font-medium mb-2">Select Service</p>
          <select
            className="border p-2 w-full rounded"
            value={service}
            onChange={handleServiceChange}
          >
            <option value="">Select Service</option>

              {configeData?.enable_sharepoint_read && (
          <option value="sharepoint">SharePoint</option>
             )}

          {configeData?.enable_onedrive_read && (
         <option value="onedrive">OneDrive</option>
           )}
 
            
          </select>
        </div>
      )}

      {/* SITE - Only show for SharePoint (not Google) */}
      {selectedPlatform && !isGoogle && service === "sharepoint" && (
        <div>
          <p className="font-medium mb-2">Select Site</p>
          <select
            className="border p-2 w-full rounded"
            value={selectedSite}
            onChange={handleSiteChange}
          >
            <option value="">Select Site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* AUTO FETCH FOR GOOGLE - Fetch folders after account selection */}
      {isGoogle && selectedAccount && !folders.length && !isLoading && (
        <div className="flex justify-center">
          <button
            onClick={()=>fetchFolders()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Load Google Drive Folders
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading folders...</span>
        </div>
      )}

      {/* SELECTED FOLDERS DISPLAY */}
      {selectedFolders.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <p className="font-medium">
              Selected Folders ({selectedFolders.length})
            </p>
            <button
              onClick={clearAllSelections}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFolders.map((folder, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded border"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">{folder.name}</span>
                  <span className="text-xs text-gray-500 truncate">
                    Drive: {folder.drive_name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFolder(folder.path)}
                  className="text-red-500 hover:text-red-700 text-sm px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOLDER SELECTION BUTTON */}
      {folders.length > 0 && !isLoading && (
        <div>
          <div className="flex justify-between items-center mb-4 mt-4">
            <div>
              <p className="font-medium">Available Folders</p>
              <p className="text-sm text-gray-600">
                Found {folders.length} folders in{" "}
                {driveData?.drive_name || "drive"}
              </p>
            </div>
            <button
              onClick={() => setShowFolderModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {selectedFolders.length > 0
                ? `Manage Selection (${selectedFolders.length})`
                : "Select Folders"}
            </button>
          </div>
        </div>
      )}

      {/* NO FOLDERS MESSAGE */}
      {(service || isGoogle) &&
        !isLoading &&
        folders.length === 0 &&
        !showFolderModal &&
        selectedAccount && (
          <div className="text-center p-4 border rounded bg-gray-50">
            <p className="text-gray-500">
              No folders found. Please check your selection.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {!isGoogle &&
                "Make sure you have selected account, service" +
                  (service === "sharepoint" ? " and site" : "")}
              {isGoogle && "Click 'Load Google Drive Folders' to fetch folders"}
            </p>
          </div>
        )}

      {/* FOLDER MODAL */}
      {showFolderModal && folders.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-lg font-medium">Select Folders</p>
                <p className="text-sm text-gray-600">
                  Drive:{" "}
                  <span className="font-medium">
                    {driveData?.drive_name || "Unknown Drive"}
                  </span>
                  {selectedFolders.length > 0 &&
                    ` | ${selectedFolders.length} folder(s) selected`}
                </p>
              </div>
              <button
                onClick={handleSelectAllFolders}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                {selectedFolders.length === folders.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden flex-grow">
              <div className="bg-gray-100 p-3 border-b">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={
                        selectedFolders.length === folders.length &&
                        folders.length > 0
                      }
                      onChange={handleSelectAllFolders}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="col-span-11 font-medium">Folder Name</div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[40vh]">
                {folders.map((folder, index) => {
                  const isSelected = selectedFolders.some(
                    (f) => f.path === folder.path
                  );
                  return (
                    <div
                      key={index}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleFolderSelect(folder)}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFolderSelect(folder)}
                            className="h-4 w-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="col-span-11 flex items-center">
                          <span className="mr-2 text-blue-500">📁</span>
                          <div className="flex flex-col">
                            <span className="font-medium truncate">
                              {folder.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              Path: {folder.fullPath || folder.path}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div>
                <span className="text-sm text-gray-600">
                  Total folders: {folders.length} | Selected:{" "}
                  {selectedFolders.length}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setShowFolderModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-gray-800"
                  onClick={() => {
                    if (selectedFolders.length > 0) {
                      SubmitPeriodicData();
                      setShowFolderModal(false);
                      
                    }
                      //  else {
                      //   toast.error("Please select at least one folder");
                      // }
                  }}
                >
                  Confirm Selection
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
  </div>
}

     

      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ marginRight: "10px" }}
      />
    </div>
  );
};

export default PlatformDetails;
