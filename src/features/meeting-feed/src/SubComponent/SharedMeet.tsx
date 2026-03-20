import { FetchSharedMeet, FetchMyMeet } from "../features/MeetSlice";
import { useAppDispatch } from "../redux/hooks";
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  type RefObject,
} from "react";
import {getLocalStorageItem, requestApi } from "../Service/MeetingService";
import MoreVert from "../assets/svg/More_vert.svg";
import Anotomy from "../assets/svg/Anotomy.svg";
import DeleteImg from "../assets/svg/Delete.svg";

import NoDataState from "../SubComponent/ReuseComponent/NoDataState";

import AiBotIcon from "../assets/svg/Ai-bot.svg";
import DeleteConfirmationModal from "../SubComponent/ReuseComponent/DeleteConfirmationModal";

import ISTTime from "@/components/shared-components/ISTTime";

import Skeleton from "../components/Skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "./Pagination";
import { useToast } from "@/hooks/use-toast";

import { groupMeetingsByDate } from "../Service/MeetGrouping";
import { getPlatformImage } from "./ReuseComponent/Added-type";


interface MyMeetingDataProps {
  selectedData: {
    selectedItems: string[];
    selectAll: boolean;
    handleIndividualSelect: (id: string) => void;
    handleSelectAll: () => void;
  };
  showNormalfilter: boolean;
  searchQuery: string;
  ref: RefObject<any>;
  filterResponse: any[];
  myMeetingData: any[];
  sharedMeetingData: any[];
  AdvanceFilterData:any[];
  showCancel?: boolean;
  agents?: { total: number; credits: number; sales_data: any[] };
  loading?: boolean;
  error?: string | null;
  searchCredential?: { total: number; credits?: number; page_number?: number };
  filterCredential?: { total: number; credits?: number; page_number?: number };
}

export const MyMeeting = forwardRef<any, MyMeetingDataProps>(
  ({ selectedData, searchQuery = "", AdvanceFilterData = [], filterResponse = [], showCancel, myMeetingData = [],
     agents, loading, error,
     showNormalfilter,
      searchCredential, filterCredential }, ref) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Add safety check for selectedData
    const safeSelectedData = selectedData || {
      selectedItems: [],
      selectAll: false,
      handleIndividualSelect: () =>
        console.warn("handleIndividualSelect not provided"),
      handleSelectAll: () => console.warn("handleSelectAll not provided"),
    };

    // Destructure selectedData
    const {
      selectedItems,
      handleIndividualSelect,
      selectAll,
      handleSelectAll,
    } = safeSelectedData;

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;
    const tabFromUrl = searchParams.get("tab") || "My Meetings";

    const [activeDeleteId, setActiveDeleteId] = useState<
      string | number | null
    >(null);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(
      null,
    );

  
    const isSearchActive = searchQuery.trim().length > 0;

    // Calculate totalPages based on which data source is active
    let totalPages = 1;
    
    if (showCancel) {
      // Use filterCredential.total for advanced filters (takes priority)
      totalPages = Math.ceil((filterCredential?.total || AdvanceFilterData?.length || 0) / 10);
    } else if (isSearchActive) {
      // Use searchCredential.total if available, otherwise fallback to filterResponse length
      totalPages = Math.ceil((searchCredential?.total || filterResponse?.length || 0) / 10);
    } else {
      totalPages = Math.ceil((agents?.total || 0) / 10);
    }


    const filteredData = (() => {
  // Priority 1: Advanced filter applied (even if empty)
  if (showCancel) {
    return AdvanceFilterData;
  }

  // Priority 2: Search applied (even if empty)
  if (isSearchActive) {
    return filterResponse;
  }

  // Priority 3: Default data
  return myMeetingData;
})();

    const groupedMeetings = groupMeetingsByDate(filteredData);
     const hasMeetings = filteredData.length > 0;

    // CRITICAL FIX: Sync selection when selectAll changes
    useEffect(() => {
      if (selectAll && selectedItems.length === 0) {
        // Get all IDs from current data
        const allIds = filteredData
          .filter((item) => item && item.id)
          .map((item) => item.id);

        // Select all items
        if (allIds.length > 0) {
          allIds.forEach((id) => {
            if (!selectedItems.includes(id)) {
              handleIndividualSelect(id);
            }
          });
        }
      }
    }, [selectAll, filteredData, selectedItems.length, handleIndividualSelect]);
     const userInfo = getLocalStorageItem("user_info") || {};


    // Image Mapping

    // const meetStatus = (status?: string): boolean => status !== "done";
    //  const MeetingStatus = (added_type?: string) => added_type == "ai-bot";
    const isDone = (status?: string) => status === "done";
    const isInProgress = (status?: string) => status === "inprogress";

    const showStatus = (status?: string) =>
    !isDone(status) && !isInProgress(status);

     const showMeetingStatus = (status?: string) =>
      isInProgress(status);

    const meetExtension = (added_type?: string): boolean =>
      ["meet-record", "teams-record", "webex-record", "zoom-record"].includes(
        added_type || "",
      );

    const CheckAi_bot = (added_type?: string) => added_type === "ai-bot";


    useEffect(() => {
      const handleClickOutside = () => setActiveDeleteId(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handlePageChange = (page: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(page));
        params.set("tab", tabFromUrl);
        return params;
      });
    };

    const openConfirmDelete = (id: string) => {
      setSelectedDeleteId(id);
      setConfirmDelete(true);
      setActiveDeleteId(null);
    };

    const confirmDeleteAction = async () => {
      if (!selectedDeleteId) return;

      await handleDelete(selectedDeleteId);
      setConfirmDelete(false);
      setSelectedDeleteId(null);
    };

    const cancelDelete = () => {
      setConfirmDelete(false);
      setSelectedDeleteId(null);
    };

    const handleDelete = async (id: string) => {
      try {
        setDeleting(true);
        const tenant_id = userInfo?.default_tenant_id|| localStorage.getItem("tenant_id");

        const response = await requestApi(
          "delete",
          `${tenant_id}/salesenablement/?id=${id}`,
          {},
          "authService",
        );

        dispatch(FetchMyMeet(currentPage));
        toast({
          title: "Success",
          description: response?.message || "Meeting deleted successfully",
          variant: "success",
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete meeting!";

        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

    // console.log("my meet Starting bulk delete for IDs:", selectedItems);
    // BULK DELETE FUNCTIONALITY
    const handleBulkDelete = async () => {
      const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
      if (!tenant_id || selectedItems.length === 0) {
        toast({
          title: "Error",
          description: "No meetings selected for deletion",
          variant: "error",
        });
        return;
      }
      try {
        setDeleting(true);
        // Delete all selected items
        const response = await requestApi(
          "POST",
          `${tenant_id}/delete/salesenablement/`,
          { ids: selectedItems },
          "authService",
        );

        toast({
          title: "Success",
          description: response?.message || "meetings deleted successfully",
          variant: "success",
        });
        // Clear selection after deletion
        handleSelectAll();
        dispatch(FetchMyMeet(currentPage));
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

    // Expose bulk delete to parent via ref
    useImperativeHandle(ref, () => ({
      handleBulkDelete,
    }));

    const handleRouter = (agent: any) => {
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

    const handleMoreClick = (e: React.MouseEvent, agentId: string | number) => {
      e.stopPropagation();
      setActiveDeleteId(activeDeleteId === agentId ? null : agentId);
    };

    const handleCheckboxChange = (id: string) => {
      handleIndividualSelect(id);
    };

    const isItemSelected = (id: string) => {
      const isSelected = selectedItems.includes(id);
      return isSelected;
    };

    // Render loading state
    if (loading || showNormalfilter) {
      return (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500 text-center py-4">{error}</p>;
    }

    return (
      <>
        <div className="flex flex-col h-[calc(70vh)] md:h-[calc(98vh-248px)]">
          <div className="relative h-[80vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300">
            { !hasMeetings ? (
              <NoDataState />
            ) : (
              <div className="p-0">
                {Object.entries(groupedMeetings)
                  .filter(([_, groupItems]) => groupItems.length > 0)
                  .map(([groupTitle, groupItems]) => (
                    <div key={groupTitle} className="">
                      <h2 className="text-md font-semibold text-gray-800 mb-1 pb-2">
                        {groupTitle}
                      </h2>

                      {groupItems.map((agent, index) => (
                        <div
                          key={agent.id || index}
                          className="relative mb-3 w-full rounded-lg border border-gray-300 px-5 py-3 shadow-sm hover:bg-gray-100 transition bg-white"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <input
                                type="checkbox"
                                className="rounded-2xl border-2 border-blue-600 cursor-pointer"
                                checked={isItemSelected(agent.id)}
                                onChange={() => handleCheckboxChange(agent.id)}
                              />
                              <div className="h-10 w-10 ml-2 relative flex-shrink-0  mt-2">
                                {agent.schedule &&
                                  getPlatformImage(agent.added_type) && (
                                    <img
                                      src={getPlatformImage(
                                        agent?.schedule?.platform,
                                      )}
                                      alt="Platform"
                                      width={30}
                                      height={30}
                                      className="rounded "
                                    />
                                  )}
                              </div>

                              <div
                                className="flex flex-col justify-center cursor-pointer"
                                onClick={() => handleRouter(agent)}
                              >
                                <p className="font-semibold text-blue-600 hover:underline">
                                  {agent?.ai_title || agent?.title  || agent?.file_name || agent?.schedule?.name || "Unnamed Agent"}
                                </p>
                                <div className="flex gap-1 items-center">
                                  <span className="text-sm text-[#535862]">
                                    {agent.uploaded_by || "Unknown user"}
                                  </span>
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
                                    <ISTTime utcString={agent?.created ?? ""} />
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

                            <div className="flex gap-10 items-center mt-3 sm:mt-0">
                              <div>
                                {CheckAi_bot(agent.added_type) && (
                                  <div className="relative group">
                                    <img
                                      src={AiBotIcon}
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

                                {meetExtension(agent.added_type) && (
                                  <div className="relative group">
                                    <img
                                      src={Anotomy}
                                      alt="Chrome Extension"
                                      className="size-6"
                                    />
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                      Chrome Extension
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center text-[12px] text-[#535862]">
                                {/* {new Date(agent.created).toLocaleDateString("en-GB")} */}
                                <img
                                  src={MoreVert}
                                  alt="More options"
                                  onClick={(e) => handleMoreClick(e, agent.id)}
                                  className="ml-3 cursor-pointer size-7 rounded-sm p-1 hover:bg-gray-200"
                                />
                              </div>

                              {activeDeleteId === agent.id && (
                                <button
                                  onClick={() => openConfirmDelete(agent.id)}
                                  disabled={deleting}
                                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors absolute top-12 right-0 bg-white border-2 border-gray-200 z-50 ${
                                    deleting
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <img
                                    src={DeleteImg}
                                    alt="Delete"
                                    className="size-5"
                                  />
                                  {deleting ? "Deleting..." : "Delete"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>

         {hasMeetings && totalPages > 1 && (
            <div className="sticky bottom-[2px] border-t border-gray-200 bg-white px-5 ">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        <DeleteConfirmationModal
          isOpen={confirmDelete}
          onConfirm={confirmDeleteAction}
          onCancel={cancelDelete}
          loading={deleting}
          message="Are you sure want to Delete This Feed?"
        />
      </>
    );
  },
);

MyMeeting.displayName = "MyMeeting";

export const SharedMeet = forwardRef<any, MyMeetingDataProps>(
  ({ selectedData, searchQuery = "", AdvanceFilterData = [],
    showNormalfilter,
     filterResponse = [], showCancel, sharedMeetingData = [], agents, loading, error, searchCredential, filterCredential }, ref) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Add safety check for selectedData
    const safeSelectedData = selectedData || {
      selectedItems: [],
      selectAll: false,
      handleIndividualSelect: () =>
        console.warn("handleIndividualSelect not provided"),
      handleSelectAll: () => console.warn("handleSelectAll not provided"),
    };

    const {
      selectedItems,
      handleIndividualSelect,
      selectAll,
      handleSelectAll,
    } = safeSelectedData;

    const [activeDeleteId, setActiveDeleteId] = useState<
      string | number | null
    >(null);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(
      null,
    );
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;
    const tabFromUrl = searchParams.get("tab") || "Shared With Me";


    const isSearchActive = searchQuery.trim().length > 0;
    
    
    const filteredData = (() => {
  // Priority 1: Advanced filter applied (even if empty)
  if (showCancel) {
    return AdvanceFilterData;
  }
  
  // Priority 2: Search applied (even if empty)
  if (isSearchActive) {
    return filterResponse;
  }

  // Priority 3: Default data
  return sharedMeetingData;
})();

const groupedMeetings = groupMeetingsByDate(filteredData);
const hasMeetings = filteredData.length > 0;

// Calculate totalPages based on which data source is active
let totalPages = 1;

if (showCancel) {
  // Use filterCredential.total for advanced filters (takes priority)
  totalPages = Math.ceil((filterCredential?.total || AdvanceFilterData?.length || 0) / 10);
} else if (isSearchActive) {
  // Use searchCredential.total if available, otherwise fallback to filterResponse length
  totalPages = Math.ceil((searchCredential?.total || filterResponse?.length || 0) / 10);
} else {
  totalPages = Math.ceil((agents?.total || 0) / 10);
}

    // CRITICAL FIX: Sync selection when selectAll changes
    useEffect(() => {
      if (selectAll && selectedItems.length === 0) {
        // Get all IDs from current data
        const allIds = filteredData
          .filter((item:any) => item && item.id)
          .map((item:any) => item.id);

        if (allIds.length > 0) {
          allIds.forEach((id:any) => {
            if (!selectedItems.includes(id)) {
              handleIndividualSelect(id);
            }
          });
        }
      }
    }, [selectAll, filteredData, selectedItems.length, handleIndividualSelect]);

     const isDone = (status?: string) => status === "done";
     const isInProgress = (status?: string) => status === "inprogress";

     const showStatus = (status?: string) => !isDone(status) && !isInProgress(status);
     const showMeetingStatus = (status?: string) =>isInProgress(status);

    // Read page from URL;

    const isExtensionMeeting = (added_type?: string): boolean =>
      ["meet-record", "teams-record", "webex-record", "zoom-record"].includes(
        added_type || "",
      );

    const CheckAi_bot = (added_type?: string) => added_type === "ai-bot";

    useEffect(() => {
      const handleClickOutside = () => setActiveDeleteId(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handlePageChange = (page: number) => {
      //  setSearchParams({ page: page.toString() });
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(page));
        params.set("tab", tabFromUrl);
        return params;
      });
    };

    const openConfirmDelete = (id: string) => {
      setSelectedDeleteId(id);
      setConfirmDelete(true);
      setActiveDeleteId(null);
    };

    const confirmDeleteAction = async () => {
      if (!selectedDeleteId) return;
      await handleDelete(selectedDeleteId);
      setConfirmDelete(false);
      setSelectedDeleteId(null);
      setActiveDeleteId(null);
    };

    const cancelDelete = () => {
      setConfirmDelete(false);
      setSelectedDeleteId(null);
    };

    const handleCheckboxChange = (id: string) => {
      handleIndividualSelect(id);
    };

    const isItemSelected = (id: string) => {
      const isSelected = selectedItems.includes(id);
      return isSelected;
    };

    const handleDelete = async (id: string) => {
      try {
        setDeleting(true);
        // const tenant_id = localStorage.getItem("tenant_id");
        const tenant_id =  userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

        if (!tenant_id) {
          // toast.error("Tenant ID not found");
          toast({
            title: "Error",
            description: "Tenant ID not found",
            variant: "error",
          });
          return;
        }

        const response = await requestApi(
          "delete",
          `${tenant_id}/salesenablement/?id=${id}`,
          {},
          "authService",
        );

        dispatch(FetchSharedMeet(currentPage));
        toast({
          title: "Success",
          description:
            response?.data?.message || "Meeting deleted successfully",
          variant: "success",
        });
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

    const handleRouter = (agent: any) => {
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

    const handleMoreClick = (e: React.MouseEvent, agentId: string | number) => {
      e.stopPropagation();
      setActiveDeleteId(activeDeleteId === agentId ? null : agentId);
    };
    const userInfo = getLocalStorageItem("user_info") || {};

    // Bulk delete functionality
    const handleBulkDelete = async () => {
      const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  
      if (!tenant_id || selectedItems.length === 0) return;

      // console.log("Starting bulk delete for IDs:", selectedItems);

      try {
        setDeleting(true);

        const Response = await requestApi(
          "POST",
          `${tenant_id}/delete/salesenablement/`,
          { ids: selectedItems },
          "authService",
        );
        handleSelectAll();
        dispatch(FetchSharedMeet(currentPage));
        // toast.success(Response?.message || "Meetings deleted successfully");
        toast({
          title: "Success",
          description: Response?.message || "Meetings deleted successfully",
          variant: "success",
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete meetings!";
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

    // Render loading state
    if (loading || showNormalfilter) {
      return (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
        </div>
      );
    }

    // Render error state
    if (error) {
      return <p className="text-red-500 text-center py-4">{error}</p>;
    }

    return (
      <>
        <div className="flex flex-col h-[calc(70vh)] md:h-[calc(97vh-247px)]">
          <div className="flex-1 h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            { !hasMeetings ? (
              <NoDataState />
            ) : (
              <div className="p-4">
                {Object.entries(groupedMeetings)
                  .filter(([_, groupItems]) => groupItems.length > 0)
                  .map(([groupTitle, groupItems]) => (
                    <div key={groupTitle} className="">
                      <h2 className="text-md font-semibold text-gray-800 mb-3 pb-2">
                        {groupTitle}
                      </h2>

                      {groupItems.map((agent, index) => {
                        const platformImage = agent.schedule
                          ? getPlatformImage(agent.added_type)
                          : null;
                        return (
                          <div
                            key={agent.id || index}
                            className="relative w-full rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 transition bg-white mb-3 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <input
                                  type="checkbox"
                                  className="rounded-2xl border-2 border-blue-600 cursor-pointer"
                                  checked={isItemSelected(agent.id)}
                                  onChange={() =>
                                    handleCheckboxChange(agent.id)
                                  }
                                />
                                <div className="h-10 w-10 ml-2 relative flex-shrink-0 mt-2">
                                  {platformImage && (
                                    <img
                                      src={platformImage}
                                      alt={agent.title || "Meeting platform"}
                                      width={30}
                                      height={30}
                                      className="rounded"
                                    />
                                  )}
                                </div>

                                <div
                                  className="flex flex-col justify-center cursor-pointer"
                                  onClick={() => handleRouter(agent)}
                                >
                                  <p className="font-semibold text-blue-600 hover:underline">
                                    {agent?.ai_title || agent?.title  || agent?.file_name || agent?.schedule?.name || "Unnamed Agent"}
                                  </p>
                                  <div className="flex gap-1 items-center">
                                    <span className="text-sm text-[#535862]">
                                      {agent.uploaded_by || "Unknown user"}
                                    </span>
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

                              <div className="flex gap-7 items-center mt-3 sm:mt-0">
                                <div>
                                  {CheckAi_bot(agent?.added_type) && (
                                    <div className="relative group">
                                      <img
                                        src={AiBotIcon}
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

                                  {isExtensionMeeting(
                                    agent?.schedule?.platform,
                                  ) && (
                                    <div className="relative group">
                                      <img
                                        src={Anotomy}
                                        alt="Chrome Extension"
                                        className="size-6"
                                      />
                                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                        Chrome Extension
                                      </span>
                                    </div>
                                  )}
                                  
                                </div>
                                <div className="flex items-center text-[12px] text-[#535862]">
                                  {/* {new Date(agent.created ?? "").toLocaleDateString("en-GB")} */}
                                  <img
                                    src={MoreVert}
                                    alt="More options"
                                    onClick={(e) =>
                                      handleMoreClick(e, agent.id)
                                    }
                                    className="ml-3 cursor-pointer size-7 rounded-sm p-1 hover:bg-gray-200"
                                  />
                                </div>

                                {activeDeleteId === agent.id && (
                                  <button
                                    onClick={() => openConfirmDelete(agent.id)}
                                    disabled={deleting}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors absolute top-12 right-0 bg-white border-2 border-gray-200 z-50 ${
                                      deleting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={DeleteImg}
                                      alt="Delete"
                                      className="size-5"
                                    />
                                    {deleting ? "Deleting..." : "Delete"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </div>
            )}
          </div>

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

        <DeleteConfirmationModal
          isOpen={confirmDelete}
          onConfirm={confirmDeleteAction}
          onCancel={cancelDelete}
          loading={deleting}
          message="Are you sure want to Delete This Feed?"
        />
      </>
    );
  },
);

SharedMeet.displayName = "SharedMeet";
