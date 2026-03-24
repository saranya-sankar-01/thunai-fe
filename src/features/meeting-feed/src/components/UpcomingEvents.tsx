import { useState, useEffect } from "react";
import {getLocalStorageItem, requestApi } from "@/services/authService";
import { groupMeetingsByDate } from "../Service/MeetGrouping";

import CalendarSyncStore from "../Zustand/CalendarSyncStore";

import { fetchEventMeet } from "../features/EventMeetSlice";
import { useAppSelector, useAppDispatch } from "../redux/hooks";

import Reload from "../assets/svg/Reload.svg";
import Skeleton from "./Skeleton";

import TeamMeet from "../assets/image/teams.png";
import GoogleMeet from "../assets/image/meet.png";
import ZoomMeet from "../assets/image/zoom-icone-svg-150px.png";
import Superviser from "../assets/image/supervisor_account.png";

import Research from "../assets/svg/Research.svg";
import Helper from "../assets/image/help.png";
import Webex from "../assets/svg/Webex.svg";

import SyncIcon from "../assets/svg/Danger.svg";

import Recurring from "../assets/svg/Recurring.svg";
import Close from "../assets/svg/Close.svg";
import Check from "../assets/svg/Check.svg";

import close from "../assets/svg/Close.svg";
import CalenderSync from "../assets/svg/Calender_Sync.svg";
import SettingIcon from "../assets/svg/Settings.svg";
import googleAgenta from "../assets/svg/Google_agenta.svg";

import OutLook from "../assets/svg/Outlook.svg";
import Google from "../assets/svg/Google_agenta.svg";
import { AiOutlineThunderbolt } from "react-icons/ai";

import UpcomingValue from "../SubComponent/UpcomingValue";
import { ToastContainer, toast } from "react-toastify";
// import ISTTime from "@/components/shared-components/ISTTime";

interface CalendarItem {
  email: string;
  type: string;
  id: string;
}

const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

const UpcomingEvents = () => {
  const [calendar, setCalendar] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);
  const [connectAccount, setConnectAccount] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);

  const [eventData, setEventData] = useState<any[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [activeId, setActiveId] = useState<string | null | number>(null);
  const [showSync, setShowSync] = useState<string | null | number>(null);

  const dispatch = useAppDispatch();
  const { eventMeetData, Eventloading, error } = useAppSelector(
    (state) => state.eventMeet,
  );

  const { SyncData, fetchCalendarSync, SyncLoading, SyncAllMeet } =
    CalendarSyncStore();

  const isEnabled = SyncData?.enable_all_meetings ?? false;

  const API_ENDPOINT =
    import.meta.env.VITE_API_ENDPOINT || (window as any)["env"]["API_ENDPOINT"];

  // useEffect(() => {
  //   // If redux hasn't loaded data yet, set local state empty and exit early
  //   if (!eventMeetData) {
  //     setEventData([]);
  //     return;
  //   }

  //   // 1) If API returned object with .events
  //   if (Array.isArray((eventMeetData as any).events)) {
  //     const eventsArray = (eventMeetData as any).events as any[];
  //     const updatedEvents = eventsArray.map((ev: any) => ({
  //       ...ev,
  //       isRecurring: ev.event_type === "recurring",
  //     }));
  //     setEventData(updatedEvents);
  //     return;
  //   }

  //   // 2) If API returned array directly
  //   if (Array.isArray(eventMeetData)) {
  //     const updatedEvents = (eventMeetData as any).map((ev: any) => ({
  //       ...ev,
  //       isRecurring: ev.event_type === "recurring",
  //     }));
  //     setEventData(updatedEvents);
  //     return;
  //   }

  //   // Fallback - unexpected format
  //   console.warn("Unexpected format:", eventMeetData);
  //   setEventData([]);
  // }, [eventMeetData]);

  useEffect(() => {
    if (!eventMeetData) {
      setEventData([]);
      return;
    }

    let eventsArray: any[] = [];

    if (Array.isArray((eventMeetData as any).events)) {
      eventsArray = (eventMeetData as any).events;
    } else if (Array.isArray(eventMeetData)) {
      eventsArray = eventMeetData;
    }

    //  ADD DEDUPLICATION HERE
    const uniqueMap = new Map();

    for (const ev of eventsArray) {
      // Key that uniquely identifies ONE meeting occurrence
      const key = `${ev.recurring_eventid || ev.event_id}_${ev.start}`;

      // Prefer instance event over master recurring template
      if (!uniqueMap.has(key) || ev.event_id.includes("_")) {
        uniqueMap.set(key, {
          ...ev,
          isRecurring: ev.event_type === "recurring",
        });
      }
    }

    setEventData(Array.from(uniqueMap.values()));
  }, [eventMeetData]);

  useEffect(() => {
    const CloseEventMenu = () => setActiveId(null);
    document.addEventListener("click", CloseEventMenu);
    return () => document.removeEventListener("click", CloseEventMenu);
  }, []);

  useEffect(() => {
    const closeAddDropdown = () => setShowSync(null);
    document.addEventListener("click", closeAddDropdown);
    return () => document.removeEventListener("click", closeAddDropdown);
  }, []);

  const handleUpcoming = (item: any) => {
    if (item.scheduled) {
      setSelectedEvent(item);
    } else {
      setSelectedEvent(null);
      toast.error(
        "Please add the agent before proceeding to view the meeting details.",
      );
    }
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
  };

  useEffect(() => {
    dispatch(fetchEventMeet());
  }, []);

  const groupedMeetings = groupMeetingsByDate(eventData);

  const handleToggle = async (item: any) => {
    const hasNoDetails =
      !item.scheduled_details ||
      Object.keys(item.scheduled_details).length === 0;

    setLoadingToggleId(item.event_id);

    try {
      if (item.event_type === "onetime") {
        if (!item.scheduled) {
          await handleOnetime(item);
        } else {
          await handleDeleteOnetime(item);
        }
        return;
      }

      if (hasNoDetails && item.scheduled) {
        await handleDeleteOnetime(item);
        return;
      }
      setActiveId(activeId === item.event_id ? null : item.event_id);

      // setActiveId((prev) => (prev === item.event_id ? null : item.event_id));
    } catch (error) {
      console.error("Error in handleToggle:", error);
    } finally {
      setLoadingToggleId(null);
    }
  };

  const handleOnetime = async (item: any) => {
    setLoadingDeleteId(item.event_id);
    setLoadingToggleId(item.event_id);
    setActiveId(null);

    const payload = {
      bot_events: item.bot_events || [],
      email: item.email,
      end: item.end,
      event_id: item.event_id,
      event_type: "onetime",
      full_recurring_eventid: item.full_recurring_eventid,
      meeting_id: item.meeting_id,
      meeting_link: item.meeting_link,
      meeting_status: item.meeting_status,
      participants: item.participants || [],
      passcode: item.passcode,
      platform: item.platform,
      recurring_eventid: item.recurring_eventid,
      response_status: item.response_status,
      scheduled: false,
      scheduled_details: item.scheduled_details,
      start: item.start,
      summary: item.summary,
      synced: false,
      type: item.type,
    };
    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const response = await requestApi(
        "post",
        `${tenant_id}/call/agent/schedules/`,
        cleanPayload,
        "authService",
      );
      toast.success(response?.message || "OneTime Meet Enabled Successfully ");

      await dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Error adding meeting:", error);
      throw error;
    } finally {
      setLoadingDeleteId(null);
      setLoadingToggleId(null);
    }
  };

  const handleDeleteOnetime = async (item: any) => {
    setLoadingDeleteId(item.recurring_eventid);
    setLoadingToggleId(item.recurring_eventid);
    setActiveId(null);

    const payload = {
      email: item.email,
      event_id: item.event_id,
      option: "onetime",
      recurring_eventid: item.recurring_eventid,
      start: item.start,
    };

    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const response = await requestApi(
        "delete",
        `${tenant_id}/call/agent/schedules/`,
        cleanPayload,
        "authService",
      );
      toast.success(
        response.message || "Recurring Meet disabled Successfully ",
      );

      setEventData((prev) =>
        prev.filter(
          (event: any) => event.recurring_eventid !== item.recurring_eventid,
        ),
      );
      await dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Error deleting meeting:", error);
      throw error;
    } finally {
      setLoadingDeleteId(null);
      setLoadingToggleId(null);
    }
  };

  const handletoubleMeeting = async (item: any) => {
    setLoadingDeleteId(item.event_id);
    setLoadingToggleId(item.event_id);
    setActiveId(null);

    const payload = {
      bot_events: item.bot_events || [],
      email: item.email,
      end: item.end,
      event_id: item.event_id,
      event_type: "recurring",
      full_recurring_eventid: item.full_recurring_eventid,
      meeting_id: item.meeting_id,
      meeting_link: item.meeting_link,
      meeting_status: item.meeting_status,
      participants: item.participants || [],
      passcode: item.passcode,
      platform: item.platform,
      recurring_eventid: item.recurring_eventid,
      response_status: item.response_status,
      scheduled: false,
      scheduled_details: item.scheduled_details,
      scheduled_id: item.scheduled_id,
      start: item.start,
      summary: item.summary,
      synced: true,
      type: item.type,
    };

    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const response = await requestApi(
        "POST",
        `${tenant_id}/call/agent/schedules/`,
        cleanPayload,
        "authService",
      );
      toast.success(response.message || "Recurring Meet Enabled Successfully");

      setEventData((prev) =>
        prev.map((i) =>
          i.event_id === item.event_id ? { ...i, scheduled: !i.scheduled } : i,
        ),
      );

      await dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Error adding meeting:", error);
    } finally {
      setLoadingDeleteId(null);
      setLoadingToggleId(null);
    }
  };

  const handeltoDelete = async (item: any) => {
    setLoadingDeleteId(item.recurring_eventid);
    setLoadingToggleId(item.recurring_eventid);
    setActiveId(null);
    const payload = {
      email: item.email,
      event_id: item.event_id,
      option: "onetime",
      recurring_eventid: item.recurring_eventid,
      start: item.start,
    };
    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const response = await requestApi(
        "delete",
        `${tenant_id}/call/agent/schedules/`,
        cleanPayload,
        "authService",
      );
      toast.success(response.message || "OneTime Meet disabled Successfully ");
      await dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setLoadingDeleteId(null);
      setLoadingToggleId(null);
    }
  };

  const handelDoubleDelete = async (item: any) => {
    setLoadingDeleteId(item.recurring_eventid);
    setLoadingToggleId(item.recurring_eventid);
    setActiveId(null);

    const payload = {
      email: item.email,
      event_id: item.event_id,
      option: "recurring",
      recurring_eventid: item.recurring_eventid,
      start: item.start,
    };

    try {
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const response = await requestApi(
        "delete",
        `${tenant_id}/call/agent/schedules/`,
        cleanPayload,
        "authService",
      );
      toast.success(
        response.message || "Recurring Meet disabled Successfully ",
      );

      await dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setLoadingDeleteId(null);
      setLoadingToggleId(null);
    }
  };

  const getPlatformImage = (platform: string) => {
    const key = platform?.toLowerCase();
    if (key === "gmeet" || key === "meet-record") return GoogleMeet;
    if (key === "teams" || key === "teams-record") return TeamMeet;
    if (key === "zoom" || key === "zoom-record") return ZoomMeet;

    if (key === "research") return Research;
    if (key === "user") return Superviser;
    if (key === "webex-record") return Webex;
    if (key === "No Data") return Helper;
    return null;
  };

  const CallCalendarSync = async () => {
    setCalendar(true);
    try {
      const response = await requestApi(
        "GET",
        `${tenant_id}/calendars/connected/`,
        {},
        "authService",
      );

      setCalendarData(response?.data?.calenders || []);
    } catch (error) {
      console.error("Calendar fetch API error:", error);
      setCalendarData([]);
    }
  };
  const cancelCalendar = () => {
    setCalendar(false);
  };

  const getCalenderPlatformImage = (type: string) => {
    const key = type?.toLowerCase();
    if (key === "google") return Google;
    if (key === "microsoft") return OutLook;
    return null;
  };

  const DisconnectCalendar = async (calendarId: string, type: string) => {
    setLoadingId(calendarId);
    try {
      const response = await requestApi(
        "GET",
        `${type}/${tenant_id}/delink/account?id=${calendarId}`,
        {},
        "CalendarService",
      );

      await CallCalendarSync();
      toast.success(response?.message || "Calendar disconnected successfully");
      setConnectAccount(false);
      setCalendar(false);
      dispatch(fetchEventMeet());
    } catch (error) {
      console.error("Disconnect API error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleViewConnectedAccounts = () => {
    setConnectAccount(true);
  };

  const handleCloseConnectedAccounts = () => {
    setConnectAccount(false);
  };
  const connectGoogle = () => {
    // Google OAuth URL
    if (window.top) {
      window.top.location.href = `${API_ENDPOINT}/calendar-service/calendar/v1/google/auth/login`;
    }
  };

  const connectMicrosoft = () => {
    if (window.top) {
      window.top.location.href = `${API_ENDPOINT}/calendar-service/calendar/v1/microsoft/auth/login`;
    }
  };

  if (error)
    return (
      <div className="text-red-500 text-center py-4 h-[90vh] flex justify-center items-center">
        Error: {error}
      </div>
    );
  const [syncLoadingId, setSyncLoadingId] = useState<string | null>(null);

  const SyncDataToMeeting = async (item: any) => {
    try {
      //  DELETE API
      const deletePayload = {
        email: item.email,
        event_id: item.event_id,
        option: item.event_type,
        recurring_eventid: item.recurring_eventid,
        start: item.scheduled_details?.start || item.start,
      };

      await requestApi(
        "DELETE",
        `${tenant_id}/call/agent/schedules/`,
        deletePayload,
        "authService",
      );

      setSyncLoadingId(item.event_id);

      //  POST API (after delete success)
      const postPayload = {
        bot_events: [],
        email: item.email,
        end: item.end,
        event_id: item.event_id,
        event_type: item.event_type,
        full_recurring_eventid: item.full_recurring_eventid,
        meeting_id: item.meeting_id,
        meeting_link: item.meeting_link,
        meeting_status: item.meeting_status,
        participants: item.participants || [],
        passcode: item.passcode,
        platform: item.platform,
        recurring_eventid: item.recurring_eventid,
        response_status: item.response_status,
        scheduled: true,
        scheduled_details: item.scheduled_details,
        scheduled_id: item.scheduled_id,
        start: item.start,
        summary: item.summary,
        synced: false,
        type: item.type,
      };

      const PostResponse = await requestApi(
        "POST",
        `${tenant_id}/call/agent/schedules/`,
        postPayload,
        "authService",
      );

      toast.success(PostResponse?.message || "Meeting synced successfully ");
      await dispatch(fetchEventMeet());
    } catch (err) {
      console.error("Error syncing data to meeting:", err);
      toast.error("Sync failed please try again.");
    } finally {
      setSyncLoadingId(null);
    }
  };
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatTimeOnly = (isoString?: string) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className=" bg-[#FFFFFF] shadow-sm border border-gray-200 h-[calc(100vh-12px)] overflow-x-hidden md:py-2 md:px-3 overflow-y-hidden">
      <div className="flex justify-between items-center px-3">
        <div className="flex items-start lg:items-center justify-between gap-3 sm:gap-5 lg:gap-4 w-full py-7 md:py-2">
          <h1 className="font-semibold text-xl mb-2 text-gray-800 flex items-center">
            Upcoming Events
          </h1>

          <div className=" flex gap-3">
            <div
              className="h-[37px] w-[37px] rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => !Eventloading && dispatch(fetchEventMeet())}
            >
              {Eventloading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src={Reload}
                  className="text-[#151617] size-4"
                  alt="Reload"
                />
              )}
            </div>

            <div className="relative group ">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchCalendarSync();
                  setShowSync(showSync === 0 ? null : 0);
                }}
                className="flex items-center justify-center border border-[#D5D7DA] h-[37px] w-[37px] rounded-[10px] hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                <img
                  src={SettingIcon}
                  alt="Calendar Sync"
                  className="w-6 h-6"
                />
              </button>

              <span className="absolute -top-6  left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ">
                Calendar Sync Settings
              </span>
              {showSync === 0 && (
                <div
                  className="
    absolute 
    -left-48 sm:-right-5 
    top-12 
    sm:w-[300px]
    bg-gray-100 
    shadow-lg 
    rounded-lg 
    z-50 
    text-sm 
    border 
    border-gray-200 
    p-3
  "
                >
                  <h5 className="pb-2 mb-2 border-b border-gray-300 font-medium">
                    Calendar Sync
                  </h5>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-800">
                        Sync all meetings
                      </span>
                      <span className="text-xs text-gray-600 leading-snug">
                        Enable sync for all upcoming meetings
                      </span>
                    </div>

                    <div className="flex items-center shrink-0">
                      {SyncLoading ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <button
                          onClick={SyncAllMeet}
                          disabled={SyncLoading}
                          className={`relative w-[36px] h-[20px] flex items-center rounded-full transition-colors duration-300
                ${SyncLoading ? "opacity-50 cursor-not-allowed" : ""}
                ${isEnabled ? "bg-[#4056F4]" : "bg-gray-300"}
              `}
                        >
                          <span
                            className={`absolute left-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${
                              isEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group ">
              <button
                onClick={CallCalendarSync}
                className="flex items-center justify-center border border-[#D5D7DA] h-[37px] w-[37px] rounded-[10px] hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                <img
                  src={CalenderSync}
                  alt="Calendar Sync"
                  className="w-6 h-6"
                />
              </button>

              <span className="absolute -top-6  left-1/4 z-50 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ">
                Calendar Sync
              </span>
            </div>
          </div>
        </div>
      </div>

      {Eventloading ? (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <div className=" relative h-[calc(94vh-50px)] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 py-5 px-1">
          {eventData.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10 flex justify-center items-center h-80">
              Event not available
            </div>
          )}

          {Object.keys(groupedMeetings).map((groupTitle) => (
            <div key={groupTitle} className="">
              <h2 className="text-md font-semibold h-[35px] text-[#181D27] z-10">
                {groupTitle}
              </h2>

              {groupedMeetings[groupTitle]?.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">
                  Event not available
                </p>
              ) : (
                groupedMeetings[groupTitle].map((item, index) => (
                  <div
                    key={index}
                    className="border border-[#E1E4EA] rounded-xl p-5 shadow-sm hover:shadow-md transition mb-3 relative cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex  w-[80%] gap-2 items-center">
                        {getPlatformImage(item.platform) && (
                          <img
                            src={getPlatformImage(item.platform)!}
                            alt={item.title ?? ""}
                            width={30}
                            height={30}
                          />
                        )}
                        <h2
                          className="line-clamp-2 font-semibold text-[15px] text-gray-700 cursor-pointer"
                          onClick={() => handleUpcoming(item)}
                        >
                          {item.summary || "Meeting Title"}
                        </h2>

                        {item.isRecurring && (
                          <img
                            src={Recurring}
                            className="animate-spin-slow text-[#086CD0] cursor-none"
                          />
                        )}

                        {!item.synced && item.scheduled && (
                          <>
                            <style>
                              {`
                       @keyframes blink {
                         0%, 100% { opacity: 1; }
                         50% { opacity: 0.5; }
                       }
                     `}
                            </style>
                            <button
                              onClick={() => SyncDataToMeeting(item)}
                              className={`
    flex items-center gap-0.5 px-2 py-1 text-[11px] rounded-xl ml-2
    transition-all duration-300
    ${
      syncLoadingId === item.event_id
        ? "border border-[#D97706] bg-[#FFF7ED]"
        : "bg-[#f4e6d6] text-[#D97706]"
    }
  `}
                            >
                              <img
                                src={SyncIcon}
                                alt="Sync icon"
                                className="w-3 h-3"
                              />
                              <span
                                style={
                                  syncLoadingId === item.event_id
                                    ? {}
                                    : { animation: "blink 2s infinite" }
                                }
                              >
                                Sync
                              </span>
                            </button>
                          </>
                        )}
                      </div>

                      <div
                        className="flex justify-end w-[18%] items-center gap-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {loadingToggleId === item.event_id ? (
                          <div className="w-[35px] h-[20px] flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(item);
                            }}
                            className={`relative w-[35px] h-[20px] md:h-[20px] flex items-center rounded-full transition-colors duration-300 cursor-pointer ${
                              item.scheduled ? "bg-[#4056F4]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute left-1 w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                item.scheduled
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            ></span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 relative w-full flex items-center gap-2">
                      <button className="flex items-center gap-1 px-2 py-1 text-[11px] bg-[#DFEFFF] text-[#086CD0] rounded-xl ml-auto absolute left-0 top-0.5 ">
                        {item.scheduled ? (
                          <img
                            src={Check}
                            alt=""
                            className="w-[14px] h-[14px]"
                          />
                        ) : (
                          <img
                            src={Close}
                            alt=""
                            className="w-[14px] h-[14px]"
                          />
                        )}
                        {item.scheduled ? "Will Attend" : "Not Attending"}
                      </button>
                      <span
                        className="absolute right-0 
                       break-all sm:text-right text-left text-xs text-[#525866] top-1"
                      >
                        {item.email}
                      </span>
                    </div>

                    <div
                      className="
    flex flex-col sm:flex-row
    justify-between sm:items-center
    text-[#525866] text-xs sm:text-[12px]
    border-t border-[#E1E4EA] mt-9
    gap-2 sm:gap-0
  "
                    >
                      {/* <ISTTime utcString={item?.start ?? ""} /> */}

                      {/* <ISTTime
                        utcString={item?.end ?? ""}
                        showDate={false}
                      /> */}
                      <div className="flex justify-start items-center sm:flex-col gap-1">
                        <div className="flex gap-2 flex-wrap mt-3">
                          <span className="text-[12px] whitespace-nowrap">
                            {formatDateTime(item?.start)}
                          </span>

                          <span className="text-[12px] whitespace-nowrap">
                            {"|"}
                          </span>

                          <span className="text-[12px] whitespace-nowrap">
                            {formatTimeOnly(item?.end)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeId === item.event_id && (
                      <div className="flex flex-col absolute top-14 right-5 space-y-2 p-4  w-[70%] ld:w-[50%] bg-[#f7f4f4] rounded-lg border border-[#d1d7e3] shadow-md z-20">
                        {!item.scheduled ? (
                          <>
                            <div
                              className="flex items-center gap-2 text-sm hover:bg-[#d2e0ee] hover:text-[#086CD0] cursor-pointer p-2 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOnetime(item);
                              }}
                            >
                              {loadingDeleteId === item.event_id ? (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <img
                                  src={Check}
                                  alt=""
                                  className="w-[15px] h-[15px]"
                                />
                              )}
                              <p>Attend This Meeting</p>
                            </div>

                            <div
                              className="flex items-center gap-2 text-sm hover:bg-[#d2e0ee] hover:text-[#086CD0] cursor-pointer p-2 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handletoubleMeeting(item);
                              }}
                            >
                              {loadingDeleteId === item.recurring_eventid ? (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <img
                                  src={Check}
                                  alt=""
                                  className="w-[15px] h-[15px]"
                                />
                              )}
                              <p>Attend This and Following Meetings</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className="flex items-center gap-2 text-sm hover:bg-[#d2e0ee] hover:text-[#086CD0] cursor-pointer p-2 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handeltoDelete(item);
                              }}
                            >
                              {loadingDeleteId === item.event_id ? (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <img
                                  src={Close}
                                  alt=""
                                  className="w-[15px] h-[15px]"
                                />
                              )}
                              <p>Do not Attend This Meeting</p>
                            </div>

                            {item?.scheduled_details?.event_type ===
                              "recurring" && (
                              <div
                                className="flex items-center gap-2 text-sm hover:bg-[#d2e0ee] hover:text-[#086CD0] cursor-pointer p-2 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handelDoubleDelete(item);
                                }}
                              >
                                {loadingDeleteId === item.recurring_eventid ? (
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <img
                                    src={Close}
                                    alt=""
                                    className="w-[15px] h-[15px]"
                                  />
                                )}
                                <p>Do not Attend This and Following Meetings</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <UpcomingValue
            selectedEvent={selectedEvent}
            handleClosePopup={handleClosePopup}
          />
        </div>
      )}

      {calendar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-130 max-w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h5 className="text-lg font-semibold">Calendar Sync</h5>
              <img
                src={close}
                alt="close button"
                className="w-6 h-6 cursor-pointer"
                onClick={cancelCalendar}
              />
            </div>

            <div className="p-4">
              <p className="mb-4 text-sm text-gray-600">
                AI-based call assist that Listens, Learns, and Delivers
                analytical inputs.
              </p>

              <div className="flex flex-col gap-3 h-[200px] overflow-y-scroll scrollbar-thin">
                <div className="flex justify-between items-center border border-gray-300 rounded-[5px] p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={googleAgenta}
                      alt="Google Meet"
                      width={30}
                      height={30}
                    />
                    <h6 className="font-medium capitalize">
                      Google Meet Calendar
                    </h6>
                  </div>
                  <button
                    className="bg-[hsl(221,94%,49%)] text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    onClick={connectGoogle}
                  >
                    Connect
                  </button>
                </div>

                <div className="flex justify-between items-center border border-gray-300 rounded-[5px] p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={OutLook}
                      alt="Microsoft Outlook"
                      width={30}
                      height={30}
                    />
                    <h6 className="font-medium capitalize">
                      Microsoft Outlook Calendar
                    </h6>
                  </div>
                  <button
                    className="bg-[hsl(221,94%,49%)] text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    onClick={connectMicrosoft}
                  >
                    Connect
                  </button>
                </div>
              </div>

              <button
                className=" flex w-full justify-center mt-4 font-medium py-2 rounded text-white bg-gradient-to-r from-pink-400 to-blue-600"
                onClick={handleViewConnectedAccounts}
              >
                <AiOutlineThunderbolt className=" mr-2 mt-1.5 hover:rotate-180 transition-transform" />
                View Connected Accounts
              </button>
            </div>
          </div>
        </div>
      )}

      {connectAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-w-full mx-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Connected Accounts</h4>
              <img
                src={close}
                alt="close icon"
                className="cursor-pointer w-5 h-5"
                onClick={handleCloseConnectedAccounts}
              />
            </div>

            {calendarData.length > 0 ? (
              calendarData.map((calendar, index) => (
                <div
                  key={calendar.id || index}
                  className="flex justify-between items-center border border-gray-300 rounded-md p-3 mb-2"
                >
                  <div className="flex items-center gap-3">
                    {getCalenderPlatformImage(calendar.type) && (
                      <img
                        src={getCalenderPlatformImage(calendar.type)!}
                        alt={calendar.type}
                        width={30}
                        height={30}
                      />
                    )}
                    <div>
                      <h6 className="font-medium capitalize">
                        {calendar.type} Calendar
                      </h6>
                      {calendar.email && (
                        <p className="text-xs text-gray-500">
                          {calendar.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center justify-center hover:bg-red-600 min-w-[90px]"
                    onClick={() =>
                      DisconnectCalendar(calendar.id, calendar.type)
                    }
                    disabled={loadingId === calendar.id}
                  >
                    {loadingId === calendar.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Disconnect"
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No connected accounts
              </p>
            )}
          </div>
        </div>
      )}

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
        className="mr-20"
      />
    </div>
  );
};

export default UpcomingEvents;
