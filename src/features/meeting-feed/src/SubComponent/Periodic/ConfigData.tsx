// ConfigData.tsx
import React, { useEffect, useRef, useState } from "react";
// import PeriodicApiStore from "../Zustand/PeriodicApiStore";
import UserIcon from "../../assets/svg/UserIcon.svg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {getLocalStorageItem ,requestApi } from "../../Service/MeetingService";
import Skeleton from "../../components/Skeleton";

import EditIcon from "../../assets/svg/Edit.svg";
import DeleteIcon from "../../assets/svg/Delete.svg";
import SyncIcon from "../../assets/svg/Sync.svg";
import TimeIcon from "../../assets/svg/Time.svg";
import MoreVert from "../../assets/svg/More_vert.svg";


import NoData from "../../assets/svg/NoData.svg";
import ISTTime from "@/components/shared-components/ISTTime";

import type { PlatformDetailsType } from "./PlatformDetails"

//
// ---------- Types
//
interface Creds {
  folder_id: string[];
  folder_name: string[];
  path?: string[];
  application_id: string;
  application_email: string;
}

interface Scheduler {
  cron_expression: string | null;
  type: "scheduler" | "onetime";
  time: string | null;
  timezone: string | null;
  supported_extensions: string;
  updated: string | null;
}

interface PeriodicItem {
  tenant_id: string;
  user_id: string;
  sync_type: string;
  creds: Creds;
  shared_user_ids: string[];
  tested: boolean;
  time: string | null;
  timezone: string | null;
  supported_extensions: string;
  created: string | null;
  updated: string | null;
  scheduler: Scheduler;
  id: string;
  uploaded_by: string;
}

type TimezoneOption = {
  value: string;
  label: string;
  offsetMinutes: number;
};

interface ConfigDataProps {
  Periodic: any;
  PeriodicLoading: boolean;
  fetchPeriodicData: () => void;
  PeriodicPlateForm:PlatformDetailsType[];
}


//
// ---------- Timezone list (expanded);

const ALL_TIMEZONES = Intl.supportedValuesOf("timeZone");


const TIMEZONE_OPTIONS: TimezoneOption[] = ALL_TIMEZONES.map((tz) => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    timeZoneName: "shortOffset",
  });

  const parts = formatter.formatToParts(now);
  const offsetPart =
    parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";

  // Convert "GMT+05:30" → "+05:30"
  const offset = offsetPart.replace("GMT", "");

  // Calculate offset minutes for sorting
  const match = offset.match(/([+-]?)(\d{2}):?(\d{2})?/);
  const offsetMinutes = match
    ? (match[1] === "-" ? -1 : 1) *
      (Number(match[2]) * 60 + Number(match[3] ?? 0))
    : 0;

  const city = tz.split("/").slice(1).join(", ").replace(/_/g, " ");

  return {
    value: tz,
    label: `(UTC${offset || "+00:00"}) ${city || "Coordinated Universal Time"}`,
    offsetMinutes,
  };
})
.sort((a, b) => a.offsetMinutes - b.offsetMinutes);


// ---------- Platform image mapping
//
// const getPlatformImage = (sync_type?: string | null) => {
//   const key = (sync_type || "").toLowerCase();
//   if (
//     key.includes("gmeet") ||
//     key.includes("meet") ||
//     key.includes("googledrive")
//   )
//     return GoogleMeet;
//   if (key.includes("teams")) return TeamMeet;
//   if (key.includes("zoom") || key.includes("office365")) return ZoomMeet;
//   if (key.includes("recording")) return Record;
//   if (key.includes("research")) return Research;
//   if (key.includes("user") || key.includes("supervisor")) return Superviser;
//   if (key.includes("webex")) return Webex;
//   if (key.includes("periodic")) return PeriodicImg;
//   if (key.includes("no") || key.includes("nodata")) return NoData;
//   return GoogleMeet;
// };

//
// ---------- Utility: safe date/time rendering
//
// const safeFormatDate = (dateStr?: string | null) => {
//   if (!dateStr) return "--";
//   const d = new Date(dateStr);
//   if (Number.isNaN(d.getTime())) return "--";
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
// };

// const safeFormatTime = (dateStr?: string | null) => {
//   if (!dateStr) return "--";
//   const d = new Date(dateStr);
//   if (Number.isNaN(d.getTime())) return "--";
//   return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
// };

// Parse cron expression to get frequency
const parseCronFrequency = (cronExpression: string | null) => {
  if (!cronExpression) return "onetime";

  const parts = cronExpression.split(" ");
  if (parts.length < 5) return "onetime";

  // Check if it's hourly (0 * * * *)
  if (
    parts[0] === "0" &&
    parts[1] === "*" &&
    parts[2] === "*" &&
    parts[3] === "*" &&
    parts[4] === "*"
  ) {
    return "hourly";
  }

  // Check if it's daily (has specific hour)
  if (parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
    return "daily";
  }

  return "onetime";
};

//
// ---------- Edit Form Component (Inline)
//
interface EditFormProps {
  data: PeriodicItem;
  onSave: (updatedData: Partial<PeriodicItem>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const EditForm: React.FC<EditFormProps> = ({
  data,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [syncType, setSyncType] = useState<"onetime" | "periodic">(
    data.scheduler?.type === "onetime" ? "onetime" : "periodic"
  );
  const [frequency, setFrequency] = useState<"hourly" | "daily">(
    parseCronFrequency(data.scheduler?.cron_expression) === "hourly"
      ? "hourly"
      : "daily"
  );

  const [startTime, setStartTime] = useState<string>(
  data.scheduler?.time ?? "09:00"
);

const [timezone, setTimezone] = useState<string>(
  data.scheduler?.timezone ?? "UTC"
);


  // Initialize form based on cron expression
  useEffect(() => {
    const cron = data.scheduler?.cron_expression;
    if (cron) {
      const freq = parseCronFrequency(cron);
      if (freq === "hourly") {
        setSyncType("periodic");
        setFrequency("hourly");
      } else if (freq === "daily") {
        setSyncType("periodic");
        setFrequency("daily");
        // Parse time from cron
        const parts = cron.split(" ");
        if (parts.length >= 2) {
          const hour = parts[1].padStart(2, "0");
          const minute = parts[0].padStart(2, "0");
          setStartTime(`${hour}:${minute}`);
        }
      }
      setTimezone(data.scheduler.timezone || "UTC");
    } else {
      setSyncType("onetime");
    }
  }, [data]);

  const handleSave = () => {
    let cron_expression: string | null = null;
    let type: "scheduler" | "onetime" = "onetime";
    let time: string | null = null;
    let tz: string | null = null;

    if (syncType === "periodic") {
      type = "scheduler";

      if (frequency === "hourly") {
        cron_expression = "0 * * * *";
      }

      if (frequency === "daily") {
        const [hours, minutes] = startTime.split(":");
        cron_expression = `${minutes} ${hours} * * *`;
        time = startTime;
        tz = timezone;
      }
    }

    const updatedScheduler: Scheduler = {
      cron_expression,
      type,
      time,
      timezone: tz,
      supported_extensions: data.scheduler?.supported_extensions ?? "",
      updated: new Date().toISOString(),
    };

    onSave({ scheduler: updatedScheduler });
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-700 mb-3">Edit Schedule</h4>

      <div className="space-y-4">
        {/* Sync Type Selection */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id={`onetime-${data.id}`}
              name={`sync-type-${data.id}`}
              checked={syncType === "onetime"}
              onChange={() => setSyncType("onetime")}
              className="w-4 h-4 text-blue-600"
            />
            <label
              htmlFor={`onetime-${data.id}`}
              className="text-sm text-gray-700"
            >
              One-time
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id={`periodic-${data.id}`}
              name={`sync-type-${data.id}`}
              checked={syncType === "periodic"}
              onChange={() => setSyncType("periodic")}
              className="w-4 h-4 text-blue-600"
            />
            <label
              htmlFor={`periodic-${data.id}`}
              className="text-sm text-gray-700"
            >
              Periodic
            </label>
          </div>
        </div>

        {/* Periodic Options */}
        {syncType === "periodic" && (
          <div className="space-y-4">
            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`hourly-${data.id}`}
                    name={`frequency-${data.id}`}
                    checked={frequency === "hourly"}
                    onChange={() => setFrequency("hourly")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label
                    htmlFor={`hourly-${data.id}`}
                    className="text-sm text-gray-700"
                  >
                    Every Hour
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`daily-${data.id}`}
                    name={`frequency-${data.id}`}
                    checked={frequency === "daily"}
                    onChange={() => setFrequency("daily")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label
                    htmlFor={`daily-${data.id}`}
                    className="text-sm text-gray-700"
                  >
                    Every Day
                  </label>
                </div>
              </div>
            </div>

            {/* Start Time and Timezone (only for daily) */}
            {frequency === "daily" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                     value={timezone}
                     onChange={(e) => setTimezone(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                     {TIMEZONE_OPTIONS.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                       </option>
                      ))}
                    </select>

                  
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSave}
              disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>


    </div>
  );
};

//
// ---------- Main ConfigData Component
//
const ConfigData: React.FC<ConfigDataProps> = ({
  Periodic,
  PeriodicLoading,
  fetchPeriodicData,
  PeriodicPlateForm,
}) => {
  const [showEdit, setShowEdit] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<number | null>(null);


  const getPlatformLogo = (syncType: string) => {
  const name =
    syncType.toLowerCase() === "googledrive" ||
    syncType.toLowerCase() === "google drive"
      ? "google workspace"
      : syncType.toLowerCase();

  return PeriodicPlateForm.find(
    (p: any) => p.display_name.toLowerCase() === name
  )?.logo;
};


  const menuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  // const tenant_id = url?.searchParams.get("tenant_id") ?? localStorage.getItem("tenant_id") ?? "";
   const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id ?? url?.searchParams.get("tenant_id") ?? localStorage.getItem("tenant_id") ?? "";


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openIndex = showEdit;
      if (openIndex === null) return;

      const target = event.target as Node;
      const menuNode = menuRefs.current[openIndex];
      if (menuNode && !menuNode.contains(target)) {
        setShowEdit(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEdit]);

  const periodicList: PeriodicItem[] = (Periodic?.data ?? []) as PeriodicItem[];

  const handleEditClick = (index: number) => {
    setEditingItem(index);
    setShowEdit(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSaveEdit = async (
    index: number,
    updatedData: Partial<PeriodicItem>
  ) => {
    setIsSaving(index);

    try {
      const item = periodicList[index];
      const schedulerUpdate: Partial<Scheduler> = updatedData.scheduler ?? {};

      // Build payload according to your API
      const payload = {
        id: item.id,
        timezone: schedulerUpdate.timezone ?? null,
        type: schedulerUpdate.type ?? "scheduler",
        cron_expression: schedulerUpdate.cron_expression ?? null,
        time: schedulerUpdate.time ?? null,
      };

      // Call your API - uncomment and provide real requestApi
      const res = await requestApi(
        "POST",
        `${tenant_id}/salesenablement/periodic/schedule/`,
        payload,
        "authService"
      );
      toast.success(res?.message);


      // Refresh data
      fetchPeriodicData?.();
      setEditingItem(null);
    } catch (err: any) {
  console.error(err);

  const errorMessage = err?.res?.message ||
    err?.message ||
    "Something went wrong";

  toast.error(errorMessage);
}finally {
      setIsSaving(null);
    }
  };

  const handleDelete = async (data: PeriodicItem) => {
    try {
      // call your API - uncomment and provide real requestApi
      const res = await requestApi(
        "DELETE",
        `${tenant_id}/salesenablement/periodic/sync/`,
        { id: data.id },
        "authService"
      );
      toast.success(res?.message);

      fetchPeriodicData?.();
    } catch(err: any) {
  console.error(err);

  const errorMessage = err?.res?.message ||
    err?.message ||
    "Something went wrong";

  toast.error(errorMessage);
} finally {
      setShowEdit(null);
    }
  };

  if (PeriodicLoading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 p-2 h-[calc(97vh-150px)] overflow-y-auto">
        {periodicList.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <img
              src={NoData}
              alt="No data"
              className="mx-auto w-28 h-28 mb-4"
            />
            <div className="text-gray-600">No periodic sync data available</div>
          </div>
        )}

        {periodicList.map((data, index) => (
          <div
            key={data.id}
            className="bg-white rounded-lg shadow p-3 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              {/* LEFT SIDE */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {/* <img
                    src={getPlatformImage(data.sync_type)}
                    alt={data.sync_type}
                    className="w-10 h-10 rounded"
                  /> */}
                  <div className="flex-shrink-0">
                 {getPlatformLogo(data.sync_type) && (
                <img
                  src={getPlatformLogo(data.sync_type)}
                      alt={data.sync_type}
                     className="w-10 h-10 rounded"
                    />
                 )}
                </div>

                </div>

                <div className="flex-1 min-w-0">
                  {/* User */}
                  <div className="flex items-center space-x-1">
                    <img src={UserIcon} alt="User" className="w-3 h-3" />
                    <span className="font-medium truncate text-gray-700 text-[15px]">
                      {data.uploaded_by}
                    </span>
                  </div>

                  {/* Folder Name */}
                  <div className="text-sm text-gray-600 truncate">
                    <strong>Folder Name:</strong>{" "}
                    {data?.creds?.path && data.creds.path.length > 0
                      ? data.creds.path.join(", ")
                      : data?.creds?.folder_name &&
                        data.creds.folder_name.length > 0
                      ? data.creds.folder_name.join(", ")
                      : "--"}
                  </div>

                  {/* Email */}
                  {data?.creds?.application_email && (
                    <div className="text-[12px] text-gray-600 truncate">
                      <strong>Email:</strong> {data.creds.application_email}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center space-x-6 ml-4">
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-1">
                    {data.scheduler?.type === "onetime" ? (
                      <>
                        <img
                          src={TimeIcon}
                          alt="One Time"
                          className="w-4 h-4"
                        />
                        <span className="text-[12px] font-medium text-blue-700">
                          Onetime
                        </span>
                      </>
                    ) : (
                      <>
                        <img
                          src={SyncIcon}
                          alt="Scheduled"
                          className="w-4 h-4"
                        />
                        <span className="text-[12px] font-medium text-blue-700">
                          Scheduler
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-[12px] text-gray-600">
                    <ISTTime utcString={data?.updated ?? ""} />
                  </div>
                </div>

                {/* Menu */}
                <div
                  className="relative"
                  ref={(el) => (menuRefs.current[index] = el)}
                >
                  <button
                    onClick={() =>
                      setShowEdit(showEdit === index ? null : index)
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={editingItem === index}
                  >
                    <img src={MoreVert} alt="More" className="w-5 h-5" />
                  </button>

                  {showEdit === index && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20">
                      <button
                        onClick={() => handleEditClick(index)}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                      >
                        <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(data)}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 rounded-b-lg"
                      >
                        <img
                          src={DeleteIcon}
                          alt="Delete"
                          className="w-4 h-4"
                        />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Edit */}
            {editingItem === index && (
              <EditForm
                data={data}
                onSave={(updatedData) => handleSaveEdit(index, updatedData)}
                onCancel={handleCancelEdit}
                isSaving={isSaving === index}
              />
            )}
          </div>
        ))}
      </div>

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
    </>
  );
};

export default ConfigData;
