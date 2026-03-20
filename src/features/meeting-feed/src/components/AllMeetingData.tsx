import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { fetchMeetingAgent } from "../features/MeetSlice";
import { useAppDispatch } from "../redux/hooks";
import { useNavigate } from "react-router-dom";
import {getLocalStorageItem, requestApi } from "../Service/MeetingService";
import { groupMeetingsByDate } from "../Service/MeetGrouping";

import { useSearchParams } from "react-router-dom";
// import SaikitLiveModalData from "./SaikitLiveModalData";

import TeamMeet from "../assets/svg/Team.svg";
import GoogleMeet from "../assets/image/meet.png";
import ZoomMeet from "../assets/image/zoom-icone-svg-150px.png";
import Record from "../assets/svg/Frame1.svg";
import Superviser from "../assets/svg/Supervisor_account.svg";
import Research from "../assets/svg/Research.svg";
import NoData from "../assets/svg/NoData.svg";
import PeriodicImg from "../assets/svg/Periodic.svg";
import Frame from "../assets/svg/Frame1.svg";
import MoreVert from "../assets/svg/More_vert.svg";
import Webex from "../assets/svg/Webex.svg";
import Anotomy from "../assets/svg/Anotomy.svg";
import DeleteImg from "../assets/svg/Delete.svg";
import DeleteWhite from "../assets/svg/DeleteWhite.svg";
import ISTTime from "@/components/shared-components/ISTTime";
import AiBot from "../assets/svg/Ai-bot.svg"

import { useToast } from "@/hooks/use-toast";

import Skeleton from "./Skeleton";

import { Pagination } from "../SubComponent/Pagination";
import NoDataState from "../SubComponent/ReuseComponent/NoDataState";

interface AllMeetingDataProps {
  selectedData: {
    selectedItems: string[];
    isSearchActive: boolean;
    selectAll: boolean;
    handleIndividualSelect: (id: string) => void;
    handleSelectAll: () => void;
    activeTab: string;
  };
  showNormalfilter: boolean;
  showCancel: boolean;
  meetingData: any[];
  searchQuery: string;
  filterResponse?: any[];
  AdvanceFilterData?: any[];
  agents?: { total: number; credits: number; sales_data: any[] };
  loading?: boolean;
  error?: string | null;
  searchCredential?: { total: number; credits?: number; page_number?: number };
  filterCredential?: { total: number; credits?: number; page_number?: number };
}

const AllMeetingData = forwardRef<any, AllMeetingDataProps>(
  (
    {
      selectedData,
      searchQuery = "",
      filterResponse = [],
      AdvanceFilterData = [],
      showNormalfilter,
      showCancel,
      meetingData = [],
      agents,
      loading,
      error,
      searchCredential,
      filterCredential,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { toast } = useToast();

    const [deleting, setDeleting] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const userInfo = getLocalStorageItem("user_info") || {};

    // Read page from URL;

    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const currentPage = pageFromUrl;

    const tabFromUrl = searchParams.get("tab") || "All Meetings";

    const handlePageChange = (page: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(page));
        params.set("tab", tabFromUrl);
        return params;
      });
    };

    const [activeDeleteId, setActiveDeleteId] = useState<
      string | number | null
    >(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(
      null,
    );
    // const [showLiveScriptModal, setShowLiveScriptModal] = useState(false);
    //  const [selectedSaikitId, setSelectedSaikitId] = useState<string | number | null>(null);

    const safeSelectedData = selectedData || {
      selectedItems: [] as string[],
      selectAll: false,
      handleIndividualSelect: () => {},
      handleSelectAll: () => {},
    };

    const { selectedItems, handleIndividualSelect, handleSelectAll } =
      safeSelectedData;

    const isSearchActive = searchQuery.trim().length > 0;

    // Calculate totalPages based on which data source is active
    let totalPages = 1;

    if (showCancel) {
      // Use filterCredential.total for advanced filters (takes priority)
      totalPages = Math.ceil(
        (filterCredential?.total || AdvanceFilterData?.length || 0) / 10,
      );
    } else if (isSearchActive) {
      // Use searchCredential.total if available, otherwise fallback to filterResponse length
      totalPages = Math.ceil(
        (searchCredential?.total || filterResponse?.length || 0) / 10,
      );
    } else {
      totalPages = Math.ceil((agents?.total || 0) / 10);
    }

const filteredData = (() => {
  if (showCancel) {
    return AdvanceFilterData;
  }

  if (isSearchActive && showNormalfilter) {
    return []; 
  }

  if (isSearchActive) {
    return filterResponse;
  }

  return meetingData;
})();


const groupedMeetings = groupMeetingsByDate(filteredData);
const hasMeetings = Object.keys(groupedMeetings).length > 0;

    const handlerouter = (agent: any) => {
      if (agent.added_type === "research") {
        navigate(`/meeting-feed/ResearchData/${agent.id}`);
      } else {
        const payload = {
          id: agent.id,
          feed_type: "meeting_feed",
          agent,
        };
        navigate(`/meeting-feed/MeetingAssistants/CallDetails/${agent.id}`, {
          state: payload,
        });
      }
    };

    const handleCheckboxChange = (id: string) => {
      handleIndividualSelect(id);
    };

    const isItemSelected = (id: string) => selectedItems.includes(id);

    const handleBulkDelete = async () => {
      const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
      if (!tenant_id || selectedItems.length === 0) return;
      try {
        setDeleting(true);

        const Response = await requestApi(
          "POST",
          `${tenant_id}/delete/salesenablement/`,
          { ids: selectedItems },
          "authService",
        );
        handleSelectAll();
        dispatch(fetchMeetingAgent(1));
        toast({
          title: "Success",
          description: Response?.message || "Data deleted successfully",
          variant: "success",
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Data not deleted!";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleBulkDelete,
    }));

    const handleDelete = async (id: string) => {
      try {
        setDeleting(true);
          const tenant_id = userInfo?.default_tenant_id ||  localStorage.getItem("tenant_id");
        const response = await requestApi(
          "delete",
          `${tenant_id}/salesenablement/?id=${id}`,
          {},
          "authService",
        );
        toast({
          title: "Success",
          description: response?.data?.message || "Data delete successfully",
          variant: "success",
        });
        dispatch(fetchMeetingAgent(currentPage));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Something went wrong!";

        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

    const openConfirmDelete = (id: string) => {
      setSelectedDeleteId(id);
      setConfirmDelete(true);
    };

    const confirmDeleteAction = async () => {
      if (!selectedDeleteId) return;
      await handleDelete(selectedDeleteId);
      setActiveDeleteId(null);
      setConfirmDelete(false);

      setSelectedDeleteId(null);
    };

    const cancelDelete = () => {
      setConfirmDelete(false);
      setSelectedDeleteId(null);
    };

    useEffect(() => {
      const handleClickOutside = () => setActiveDeleteId(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const getPlatformImage = (platform: string) => {
      const key = platform?.toLowerCase();

      if (key === "gmeet" || key === "meet-record") return GoogleMeet;
      if (key === "teams" || key === "teams-record") return TeamMeet;
      if (key === "zoom" || key === "zoom-record") return ZoomMeet;
      if (key === "recording") return Record;
      if (key === "research") return Research;
      if (key === "user") return Superviser;
      if (key === "webex-record") return Webex;
      if (key === "periodic_sync") return PeriodicImg;
      if (key === "no data") return NoData;

      return null;
    };

    const GetLiveProcess = (status?: any) => status === "recording";
    const ShowAgent = (added_type?: string) => added_type === "ai-bot";

    const isDone = (status?: string) => status === "done";
     const isInProgress = (status?: string) => status === "inprogress";

const showStatus = (status?: string) =>
  !isDone(status) && !isInProgress(status);

const showMeetingStatus = (status?: string) =>
  isInProgress(status);

    const MeetExtension = (added_type?: any) =>
      added_type === "meet-record" ||
      added_type === "teams-record" ||
      added_type === "webex-record" ||
      added_type === "zoom-record";

    // if(added_type === "meet-record" | "teams-record")
//      const FetchSaikitData = (id: string | number) => {
//   setSelectedSaikitId(id);
//   setShowLiveScriptModal(true);
// };
// const LiveTranscripts = (meeting_status?: string) => {
//       return (
//         meeting_status === "In Progress" ||
//         meeting_status === "Assistant admitted to the meeting"
//       );
//     };
    if (error)
      return (
        <div className="text-red-500 text-center py-4 h-[calc(70vh)] md:h-[calc(97vh-247px)] flex justify-center items-center">
          Error: {error}
        </div>
      );

    return (
      <>
        <div className="flex flex-col sm:h-full lg:h-[calc(97vh-244px)]">
          {loading || showNormalfilter ? (
            <div className="space-y-4">
              <Skeleton />
              <Skeleton />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 relative">
                {!hasMeetings ? (
                  <NoDataState />
                ) : (
                  Object.entries(groupedMeetings)
                    .filter(([_, groupItems]) => groupItems.length > 0)
                    .map(([groupTitle, groupItems]) => (
                      <div key={groupTitle} className="">
                        <h2 className="text-sm md:text-md font-semibold text-gray-800 mb-3 pb-2">
                          {groupTitle}
                        </h2>

                        {groupItems.map((agent, index) => (
                          <div
                            key={agent.id || index}
                            className="relative w-full rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 transition bg-white mb-3 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <input
                                  type="checkbox"
                                  className="rounded-2xl border-2 p-2 border-blue-600 cursor-pointer"
                                  checked={isItemSelected(agent.id)}
                                  onChange={() =>
                                    handleCheckboxChange(agent.id)
                                  }
                                />

                                <div className="h-10 w-10 ml-2 relative flex-shrink-0 mt-2">
                                  {agent.schedule &&
                                    getPlatformImage(
                                      agent.schedule.platform,
                                    ) && (
                                      <img
                                        src={
                                          getPlatformImage(
                                            agent.schedule.platform,
                                          ) ?? undefined
                                        }
                                        alt={agent.title ?? undefined}
                                        width={30}
                                        height={30}
                                        className="rounded"
                                      />
                                    )}
                                  {GetLiveProcess(agent.status) && (
                                    <img
                                      src={Frame}
                                      alt=""
                                      className="absolute -bottom-1 -right-1 text-red-500"
                                    />
                                  )}
                                </div>

                                <div className="flex flex-col justify-center">
                                  <p
                                    className="line-clamp-2 font-semibold text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => handlerouter(agent)}
                                  >
                                    {agent?.ai_title ||
                                      agent?.title ||
                                      agent?.file_name ||
                                      agent?.schedule?.name ||
                                      "Unnamed Agent"}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm text-[#535862]">
                                      {agent.uploaded_by || ""}
                                    </p>
                                    {showStatus(agent.status) && (
                                      <span className="bg-[#FEF6EE] text-[#F79009] text-xs px-3 py-0.5 rounded-full h-[20px]">
                                        {agent?.status === "call_score_pending"
                                          ? "Call Score Analysis Started"
                                          : agent?.status?.replace(/_/g, " ")}
                                      </span>
                                    )}

                                    <span className="text-[12px] text-[#535862] pt-1">
                                      {" "}
                                      |{" "}
                                      <ISTTime
                                        utcString={agent?.created ?? ""}
                                      />
                                    </span>
                                    
                                    {showMeetingStatus(agent?.status) && (
                                       <span
                                         className={`text-xs px-3 mt-1 border border-gray-100 py-0.5 rounded-full h-[20px] ${
                                           agent?.meeting_status === "started"
                                             ? "bg-yellow-50 text-yellow-700"
                                             : agent?.meeting_status === "extracted"
                                             ? "bg-blue-50 text-blue-700"
                                             : agent?.meeting_status === "done"
                                             ? "bg-green-50 text-green-700"
                                             : "bg-gray-50 text-gray-700"
                                         }`}
                                       >
                                          {agent?.meeting_status}
                                       </span>
                                      )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-7 items-end mt-3 sm:mt-0 w-full sm:w-auto">
                                <div>
                                  {ShowAgent(agent.added_type) && (
                                  <div className="relative group">
                                    <img
                                      src={AiBot}
                                      alt="Anotomy icon"
                                      className="size-6 "
                                    />

                                    <span
                                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800
                                 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                                    >
                                      Ai-bot
                                    </span>
                                  </div>
                                )}
                                {MeetExtension(agent.added_type) && (
                                  <div className="relative group">
                                    <img
                                      src={Anotomy}
                                      alt="Anotomy icon"
                                      className="size-6 "
                                      />

                                    <span
                                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800
                                      text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                                      >
                                      Chrome Extension
                                    </span>
                                  </div>
                                )}
                                </div>
{/* 
                                {LiveTranscripts(agent.meeting_status) && (
                                  <>
                                  <style>
                                    {`
                           @keyframes blink {
                             0%, 100% { opacity: 1; }
                             50% { opacity: 0; }
                            }
                            .blink {
                              animation: blink 1s infinite;
                            }
                          `}
                                    </style>

                                    <button
                                      className="
                                      flex items-center gap-0.5 px-2 py-1 text-[11px] rounded-[8px] ml-2
                                      bg-gray-50 text-gray-700
                                    "
                                    onClick={() => FetchSaikitData(agent.id)}
                                    >
                                    <span className="h-2 w-2 transition-all duration-300 bg-red-600 rounded-full mr-1 blink"></span>
                                    Live Transcripts
                                    </button>
                                  </>
                                )} */}
                                <img
                                  src={MoreVert}
                                  alt=""
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDeleteId(
                                      activeDeleteId === agent.id
                                        ? null
                                        : agent.id,
                                    );
                                  }}
                                  className="ml-3 cursor-pointer rounded-sm p-1 hover:bg-gray-200"
                                />

                                {activeDeleteId === agent.id && (
                                  <button
                                    onClick={() => openConfirmDelete(agent.id)}
                                    disabled={deleting}
                                    className={` flex items-center gap-2 px-3 py-2 cursor-pointer text-sm text-red-600 hover:bg-gray-100  rounded-md transition-color
         absolute top-12 right-0 bg-white border-2 border-gray-200  z-50  ${
           deleting ? "opacity-50 cursor-not-allowed" : ""
         }`}
                                  >
                                    <img
                                      src={DeleteImg}
                                      alt=""
                                      className="size-5"
                                    />{" "}
                                    {deleting ? "Deleting..." : "Delete"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                )}
                {hasMeetings && totalPages > 1 && (
                  <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {confirmDelete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white p-6 rounded-2xl shadow-lg  text-start">
                <h2 className="text-lg font-semibold mb-1">Delete </h2>
                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want to delete this item?
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={confirmDeleteAction}
                    disabled={deleting}
                    className="inline-flex items-center gap-2
      bg-red-500 text-white 
      px-4 py-2 rounded-[10px] 
      hover:bg-red-600
      text-sm font-medium
      transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none "
                  >
                    <img src={DeleteWhite} alt="" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>

                  <button
                    onClick={cancelDelete}
                    className="inline-flex items-center gap-2
      bg-gray-100 text-gray-800 
      px-4 py-2 rounded-[10px] 
      hover:bg-gray-200
      text-sm font-medium
      transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* {showLiveScriptModal && (
          <SaikitLiveModalData
            setShowLiveScriptModal={setShowLiveScriptModal}
             saikitId={selectedSaikitId}
          />
        )} */}
      </>
    );
  },
);

export default AllMeetingData;
