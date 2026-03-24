import { useState, useEffect, useRef } from "react";
import AllMeetingData from "./AllMeetingData";
import UpcomingEvents from "./UpcomingEvents";
import FilesReports from "./FilesReports";
import { AdvancedFilter } from "./AdvancedFilter";
import { Activity } from 'lucide-react'

import { useSearchParams } from "react-router-dom";

import { FetchParameter } from "../features/CallAnalysiSlice";

type FilterItem =| { key_name: string; key_value: string[]; operator: "in" | "notin" | "==" | "!=" }
  | { key_name: string; key_value: string; operator: "in" | "!=" | "notin" | "eq" | "=="};

  interface CredentialType {
  total: number;
  credits: number;
}

import {getLocalStorageItem, requestApi } from "@/services/authService";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
// import ResearchMeeting from "../SubComponent/ResearchMeeting";
import MeetingShare from "../SubComponent/MeetingShare";
import { useNavigate } from "react-router-dom";
import { MyMeeting, SharedMeet } from "../SubComponent/SharedMeet";
import CreateEventModal from "../SubComponent/CreateEventModal";
import UploadData from "../SubComponent/Periodic/UploadData";
import DeleteWhite from "../assets/svg/DeleteWhite.svg";
import DeleteImg from "../assets/svg/Delete.svg";
import CloseImg from "../assets/svg/CloseWhite.svg";
import SendButton from "../assets/svg/SendbtnWhite.svg";

import {
  fetchMeetingAgent,
  FetchMyMeet,
  FetchSharedMeet,
} from "../features/MeetSlice";

import { fetchUsers } from "../features/userSlice";

import Search from "../assets/svg/Search.svg";
import FilterList from "../assets/svg/FilterList.svg";
import Reload from "../assets/svg/Reload.svg";
import MoreVector from "../assets/svg/Vector.svg";
import Insight from "../assets/svg/Insights.svg";
import PeriodicApiStore from "../Zustand/PeriodicApiStore";

import { useToast } from "@/hooks/use-toast";

import MatricIcon from "../assets/svg/Matric.svg";
import { Settings } from "lucide-react";
import { RoutewithMeticDashboard } from "../SubComponent/ReuseComponent/Added-type";
import CallScoreStore from "../Zustand/CallScoreStore";

const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

const MeetingAssistants = () => {
  const childRef = useRef<any>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { MeetingFileProcesser, FetchFileProcesser } = PeriodicApiStore();
  const {FetchMetricDashboard , SettingData }= CallScoreStore();

  const processingFilesCount = MeetingFileProcesser.filter(
    (item) => item.status !== "done",
  ).length; 

  // const [selectedResearchItem, setSelectedResearchItem] = useState(false);
  // const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [EventData, setEventData] = useState(false);
  const [uploadData, setUploadData] = useState(false);

  const [filterResponse, setFilterResponse] = useState<any[]>([]);
  const [myMeetfilterResponse, setMyMeetFilterResponse] = useState<any[]>([]);
  const [sharedfilterResponse, setSharedFilterResponse] = useState<any[]>([]);

  // const [selectedFullMeetings, setSelectedFullMeetings] = useState<any[]>([]);

  // const [activeTab, setActiveTab] = useState<string>("All Meetings");
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab") || "All Meetings";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  // console.log("filterResponse meet",filterResponse);

  useEffect(() => {
    setActiveTab(tabFromUrl);
    FetchMetricDashboard();
  }, [tabFromUrl]);

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  useEffect(() => {
    switch (activeTab) {
      case "All Meetings":
        dispatch(fetchMeetingAgent(currentPage));
        break;

      case "My Meetings":
        dispatch(FetchMyMeet(currentPage));
        break;

      case "Shared With Me":
        dispatch(FetchSharedMeet(currentPage));
        break;
    }
  }, [activeTab, currentPage]);

  const [shareMeet, setShareMeeting] = useState<boolean>(false);
  const [showNormalfilter, setShownormalFilter] = useState<boolean>(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [advanceFilterData, setAdvanceFilterData] = useState([]);

  const [filterCredential, setFilterCredential] = useState<CredentialType | null>(null);
  const [searchCredential, setSearchCredential] = useState<CredentialType | null>(null);

  const UPCOMING_EVENTS =  import.meta.env.VITE_UPCOMING_EVENTS || ((window as any)?.env?.UPCOMING_EVENTS ?? true)
  const IS_SHOW_AI_CREDITS = import.meta.env.VITE_IS_SHOW_AI_CREDITS || ((window as any)?.env?.IS_SHOW_AI_CREDITS ?? true)

  const [allUsers, setAllUsers] = useState<any[]>([]);

  const meetingState = useAppSelector((state) => state.users);
  const MyMeetingState = useAppSelector((state) => state.myMeet);
  const SharedMeetingState = useAppSelector((state) => state.sharedMeeting);

  const AllUsers = useAppSelector((state: any) => state.allUser);

  const [showProcessingFile, setShowProcessingFile] = useState<boolean>(false);
  const { toast } = useToast();


  // Properly extract data from Redux states
  const allMeetingState = useAppSelector((state) => state.users);
  const myMeetingState = useAppSelector((state) => state.myMeet);
  const sharedMeetingState = useAppSelector((state) => state.sharedMeeting);

  // Extract meeting data arrays
  const meetingData = Array.isArray(allMeetingState?.agents?.sales_data)
    ? allMeetingState.agents.sales_data
    : [];
  const myMeetingData = Array.isArray(myMeetingState?.agents?.sales_data)
    ? myMeetingState.agents.sales_data
    : [];
  const sharedMeetingData = Array.isArray(sharedMeetingState?.agents?.sales_data)
    ? sharedMeetingState.agents.sales_data
    : [];

  // Get loading and error states
  // const loading = allMeetingState?.loading || myMeetingState?.loading || sharedMeetingState?.loading;
  // const error = allMeetingState?.error || myMeetingState?.error || sharedMeetingState?.error;

  useEffect(() => {
    dispatch(fetchUsers());
    // dispatch(fetchScoreData());
    FetchFileProcesser();
  }, [FetchFileProcesser]);

  useEffect(() => {
    if (AllUsers?.usersData) {
      setAllUsers(AllUsers?.usersData);
    }
  }, [AllUsers]);
  

  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterPayload, setFilterPayload] = useState<any>(null);
  const [callFilter, setCallFilter] = useState(false);
  const [filterActiveTab, setFilterActiveTab] = useState<string | null>(null);

  const handleApiResponse = (responseData: any, payload?: any, isFilterActive?: boolean) => {
    if (responseData && responseData.data) {
      setAdvanceFilterData(responseData.data.sales_data);
      setFilterCredential(responseData.data);
      if (payload) {
        setFilterPayload(payload);
        // Save filter to URL so it persists on refresh
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.set("advancedFilter", JSON.stringify(payload));
          params.set("page", "1");
          return params;
        });
        localStorage.setItem("advancedFilter", JSON.stringify(payload));
      }
      // Set callFilter to true when filter API is called
      if (isFilterActive) {
        setCallFilter(true);
        setFilterActiveTab(activeTab);
      }
    }
  };
  
  // Load filters from URL on component mount
  useEffect(() => {
   const urlFilter = searchParams.get("advancedFilter");
  const localFilter = localStorage.getItem("advancedFilter");
  const storedFilter = urlFilter || localFilter;


    if (storedFilter) {
      try {
        const parsedFilter = JSON.parse(storedFilter);

        setCallFilter(true);
        setFilterPayload(parsedFilter);
        setFilterActiveTab(activeTab);

        const reapplyFilter = async () => {
          const res = await requestApi(
            "POST",
            `${tenant_id}/callagent/filter/`,
            parsedFilter,
            "authService",
          );

          if (res?.data) {
            setAdvanceFilterData(res.data.sales_data);
            setFilterCredential(res.data);
          }
        };

        reapplyFilter();
      } catch (err) {
        console.error("Invalid stored filter");
      }
    }
  }, []);
  

  // Re-apply filters when pagination changes while filters are active
  useEffect(() => {
    // If user switched tabs, don't reset filters - let them persist in URL
    // Only update the active tab
    if (callFilter && filterActiveTab && filterActiveTab !== activeTab) {
      setFilterActiveTab(activeTab);
      return;
    }

    // Re-apply filter with updated page number
    if (callFilter && filterPayload && currentPage >= 1 && filterActiveTab === activeTab) {
      const reapplyFilter = async () => {
        try {
          const updatedPayload = {
            ...filterPayload,
            page: { size: 10, page_number: currentPage },
          };
          const res = await requestApi(
            "POST",
            `${tenant_id}/callagent/filter/`,
            updatedPayload,
            "authService",
          );
          if (res && res.data) {
            setAdvanceFilterData(res.data.sales_data);
            setFilterCredential(res.data);
          }
        } catch (error) {
          console.error("Filter pagination error:", error);
        }
      };
      reapplyFilter();
    }
  }, [currentPage, callFilter, filterPayload, activeTab, filterActiveTab]);

 

  let total = 0;
  let credits = 0;

  if (isSearchActive) {
    switch (activeTab) {
      case "All Meetings":
        total = filterCredential?.total || 0;
        credits = filterCredential?.credits || 0;
        break;

      case "My Meetings":
        total = myMeetfilterResponse?.length || 0;
        break;

      case "Shared With Me":
        total = sharedfilterResponse?.length || 0;
        break;
    }
  } else if (callFilter) {
    // When advanced filters are applied
    switch (activeTab) {
      case "All Meetings":
        total = filterCredential?.total || 0;
        credits = filterCredential?.credits || 0;
        break;

      case "My Meetings":
        total = filterCredential?.total || 0;
        credits = filterCredential?.credits || 0;
        break;

      case "Shared With Me":
        total = filterCredential?.total || 0;
        credits = filterCredential?.credits || 0;
        break;
    }
  } else {
    switch (activeTab) {
      case "All Meetings":
        total = allMeetingState?.agents?.total || 0;
        credits = allMeetingState?.agents?.credits || 0;
        break;

      case "My Meetings":
        total = myMeetingState?.agents?.total || 0;
        credits = myMeetingState?.agents?.credits || 0;
        break;

      case "Shared With Me":
        total = sharedMeetingState?.agents?.total || 0;
        credits = sharedMeetingState?.agents?.credits || 0;
        break;
    }
  }

  // Filter API functions
  const AllMeetFilterApi = async (
    query = "",
    pageNumber = 1,
    pageSize = 10,
  ) => {
      setShownormalFilter(true)
    // debugger
    const trimmedQuery = query.trim();

    // Valid formats
    const isPhoneQuery = /^\d{10,12}$/.test(trimmedQuery);
    const isUserIdQuery = /^[a-zA-Z0-9]{6,30}$/.test(trimmedQuery);

    // Detect INVALID phone attempt (only digits but wrong length)
    const isOnlyDigits = /^\d+$/.test(trimmedQuery);
    const isInvalidPhone = isOnlyDigits && !isPhoneQuery;

    // Show error only if user entered only digits but invalid length
    if (!isOnlyDigits && isInvalidPhone) {
      toast({
        title: "Error",
        description: "Enter valid Phone (10–12 digits) ",
        variant: "error",
      });
    }

    // Detect INVALID userId attempt (alphanumeric but too short/long)
    const isAlphaNumeric = /^[a-zA-Z0-9]+$/.test(trimmedQuery);
    const isInvalidUserId = isAlphaNumeric && !isUserIdQuery && !isPhoneQuery;

    // Show error only if user entered alphanumeric but invalid length
    if (!isAlphaNumeric && isInvalidUserId) {
      toast({
        title: "Error",
        description: "Enter valid User ID (6–30 letters or numbers)",
        variant: "error",
      });
    }
// || isUserIdQuery
    const payload: {
      page: { size: number; page_number: number };
      sort: string;
      sortby: string;
      q: string;
      filter: FilterItem[];
    } = {
      page: { size: pageSize, page_number: pageNumber },
      sort: "desc",
      sortby: "created",
      q: isPhoneQuery  ? "" : trimmedQuery,
      filter: [
        {
          key_name: "added_type",
          key_value: [
            "user",
            "periodic_sync",
            "recording",
            "ai-bot",
            "research",
            "meet-record",
            "teams-record",
            "zoom-record",
          ],
          operator: "in",
        },
        isPhoneQuery || isUserIdQuery
          ? {
              key_name: "status",
              key_value: "queued",
              operator: "!=",
            }
          : {
              key_name: "status",
              key_value: ["queued"],
              // operator: "notin",
               operator: activeTab === "All Meetings" ? "notin" : activeTab === "My Meetings" ? "==" : "!=",
            },
      ],
    };
    // Handle Phone query first - send the query value as string
    if (isPhoneQuery) {
      payload.filter.push({
        key_name: "metadata.phone",
        key_value: trimmedQuery,
        operator: "eq",
      });
    } 
    // else if (isUserIdQuery) {
    //   payload.filter.push({
    //     key_name: "user_id",
    //     key_value: trimmedQuery,
    //     operator: "eq",
    //   });
    // }

    try {
      const res = await requestApi(
        "POST",
        `${tenant_id}/callagent/filter/`,
        payload,
        "authService",
      );
      // console.log("res=>",res);

      setFilterResponse(res?.data?.sales_data);
      setFilterCredential(res?.data);
      // Also set searchCredential for pagination calculations
      setSearchCredential(res?.data);
      setShownormalFilter(false);
    } catch (error) {
      console.error(" All Meetings Filter API error:", error);
      setFilterResponse([]);
      setShownormalFilter(false)
    }
  };


  // Search effect - only trigger when actually searching
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      setIsSearchActive(true);
      setShownormalFilter(true);

      const delay = setTimeout(() => {
        switch (activeTab) {
          case "All Meetings":
            AllMeetFilterApi(searchQuery);
            break;
          case "My Meetings":
            AllMeetFilterApi(searchQuery);
            break;
          case "Shared With Me":
            AllMeetFilterApi(searchQuery);
            break;
        }
      }, 500);

      return () => clearTimeout(delay);
    } else {
      setIsSearchActive(false);
       setShownormalFilter(false);
    }
  }, [searchQuery, activeTab]);

  const handleReload = () => {
    // setReloadKey((prev) => prev + 1);
    // Check if there's an active filter - if so, don't clear it on reload
    const hasActiveFilter = searchParams.get("advancedFilter") !== null;
    
    if (!hasActiveFilter) {
      setAdvanceFilterData([]);
      setSavedFilters([]);
      setFilterResponse([]);
      setMyMeetFilterResponse([]);
      setSharedFilterResponse([]);
      setCallFilter(false);
      setFilterPayload(null);
      setFilterActiveTab(null);
      setSearchCredential(null);
    }
    // If filter exists, it will be reapplied by the useEffect

    switch (activeTab) {
      case "All Meetings":
        dispatch(fetchMeetingAgent(currentPage));
        break;
      case "My Meetings":
        dispatch(FetchMyMeet(currentPage));
        break;
      case "Shared With Me":
        dispatch(FetchSharedMeet(currentPage));
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    // Check if there's an active filter
    const hasActiveFilter = searchParams.get("advancedFilter") !== null;
    
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", tab);
      params.set("page", "1");
      // Don't remove advancedFilter - let it persist until user manually closes it
      return params;
    });

    setSearchQuery("");
    setIsSearchActive(false);
    setSelectAll(false);
    setSelectedItems([]);
    
    // Only clear filter state if there's no active filter
    if (!hasActiveFilter) {
      setAdvanceFilterData([]);
      setSavedFilters([]);
      setCallFilter(false);
      setFilterPayload(null);
      setFilterActiveTab(null);
      setSearchCredential(null);
    }
    // If there is an active filter, let the useEffect handle reapplying it
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      let currentData: any[] = [];

      if (isSearchActive) {
        switch (activeTab) {
          case "All Meetings":
            currentData = filterResponse;
            total = meetingState.agents?.total || 0;
            break;
          case "My Meetings":
            currentData = filterResponse;
            total = MyMeetingState.agents?.total || 0;
            break;
          case "Shared With Me":
            currentData = filterResponse;
            total = SharedMeetingState.agents?.total || 0;
            break;
        }
      } else {
        // Create a type-safe way to access the data
        const meetingData = {
          "All Meetings": meetingState.agents?.sales_data,
          "My Meetings": (meetingState as any).myMeet?.sales_data,
          "Shared With Me": (meetingState as any).sharedMeet?.sales_data,
        };

        currentData = meetingData[activeTab as keyof typeof meetingData] || [];
      }

      const allIds = currentData.map((item: any) => item.id) || [];
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleIndividualSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedData = {
    selectedItems,
    selectAll,
    handleIndividualSelect,
    handleSelectAll,
    isSearchActive,
    activeTab,
  };

  const handleParentDelete = async () => {
    if (childRef.current) {
      setDeleting(true);
      await childRef.current.handleBulkDelete();
      setDeleting(false);
      setConfirmDelete(false);
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setSelectAll(false);
    setSelectedItems([]);
  };

  const routeToCallAnalysis = () => {
    navigate("/meeting-feed/CallAnalysis");
  };

  const showEventValue = () => {
    setEventData(true);
  };

  const showUpload = () => {
    setUploadData(true);
  };

  useEffect(() => {
    const closeAddDropdown = () => setActiveIndex(null);
    document.addEventListener("click", closeAddDropdown);
    return () => document.removeEventListener("click", closeAddDropdown);
  }, []);

  const [paramesField, setParamesField] = useState<any[]>([]);

  useEffect(() => {
    dispatch(FetchParameter()).then((res) => {
      setParamesField(res?.payload?.data?.user_categories);
    });
  }, []);

  const filterList = [
    { key_name: "title", label: "Title", inputtype: "textbox" as const },
    {
      key_name: "category",
      label: "Category",
      inputtype: "multiselect" as const,
      rowData:
        paramesField?.map((item: any) => ({
          value: item.params,
          label: item.params,
        })) ?? [],
    },

    {
      key_name: "sentiment",
      label: "Sentiment",
      inputtype: "multiselect" as const,
      rowData: [
        { value: "neutral", label: "Neutral" },
        { value: "negative", label: "Negative" },
        { value: "positive", label: "Positive" },
      ],
    },

    {
      key_name: "status",
      label: "Status",
      inputtype: "multiselect" as const,
      rowData: [
        { value: "done", label: "Done" },
        { value: "processing", label: "Processing" },
        { value: "pending", label: "Pending" },
        { value: "started", label: "started" },
        { value: "extracted", label: "extracted" },
      ],
    },
    { key_name: "credits", label: "Credits", inputtype: "number" as const },
    {
      key_name: "call_scores",
      label: "Call Score",
      inputtype: "number" as const,
    },
    {
      key_name: "duration",
      label: "Call Duration",
      inputtype: "number" as const,
    },
    { key_name: "created", label: "Created On", inputtype: "date" as const },
    {
      key_name: "shared_doc",
      label: "Shared Feeds",
      inputtype: "multiselect" as const,
      rowData: [
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ],
    },

    {
      key_name: "user_id",
      label: "Shared By",
      inputtype: "multiselect" as const,
      rowData:
        allUsers?.map((item: any) => ({
          value: item.user_id,
          label: item.emailid,
        })) ?? [],
    },
  ];
  


  return (
    <>
      <div className="h-full lg:h-[calc(100vh)] bg-[#FAFAFA] transition-all duration-300">
        <div className="flex flex-col lg:flex-row">
          <div  className={`rounded-2xl p-2 sm:p-6 w-full`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex flex-wrap items-center">
                <h2 className="font-semibold text-xl mb-1.5 text-gray-800 flex items-center">
                  My Feed
                  <span className="text-[#535862] font-sans ml-1 text-[15px]">
                    ({total})
                  </span>
                </h2>

                {IS_SHOW_AI_CREDITS && (
                  <button className="flex gap-1 items-center h-[23px] bg-[#E8F1FF] text-[#181D27] cursor-text rounded-xl px-2 py-1 text-sm font-medium mb-1 ml-2 outline-none">
                    Credits: {credits}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-2">
                {/* {MeetingFileProcesser?.length > 0 && (
                  <button
                    onClick={() => setShowProcessingFile((prev) => !prev)}
                    className="border border-[#D5D7DA] text-sm rounded-xl h-[36px] sm:px-2 font-medium flex gap-1 items-center hover:bg-gray-100 transition cursor-pointer px-2"
                  >
                    {processingFilesCount > 0 && (
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {processingFilesCount > 0 && (
                      <span>{processingFilesCount}</span>
                    )}
                  </button>
                )} */}
                {MeetingFileProcesser?.length > 0 && (
                  <span
                    onClick={() => setShowProcessingFile((prev) => !prev)}
                    className="text-sm text-blue-500 sm:px-2 font-medium flex gap-1 items-centertransition cursor-pointer px-2"
                  >
                    <Activity className="text-blue-600" size={20} />
                    <span className="font-semibold text-gray-900">Live Activity</span>
                    {processingFilesCount > 0 && (
                      <span className="min-h-5 min-w-5 rounded-full bg-blue-100 text-blue-700 text-[9px] pl-1">{processingFilesCount}</span>
                    )}
                  </span>
                )}

                {SettingData?.enable_metrics_dashboard === true && (
                  <>
                    <button
                      className="border border-[#D5D7DA] text-sm rounded-xl h-[36px] px-2 font-medium flex gap-1 items-center hover:bg-gray-100 transition cursor-pointer"
                      onClick={RoutewithMeticDashboard}
                    >
                      <img src={MatricIcon} alt="MatricIcon" />
                      <span className="text-sm text-[#181D27]">Metrics</span>
                    </button>
                  </>
                )}

                <button
                  className="border border-[#D5D7DA] text-sm rounded-xl h-[36px] w-[140px] sm:px-2 font-medium flex gap-1 items-center hover:bg-gray-100 transition cursor-pointer"
                  onClick={routeToCallAnalysis}
                >
                  <img src={Insight} className="ml-3" alt="Insights" />
                  <span className="text-sm text-[#181D27]">Call Analysis</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center border border-[#D5D7DA] rounded-xl px-3 sm:px-5 py-3 gap-3 sm:gap-4 w-full bg-white shadow-sm">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm md:text-base w-full sm:w-auto lg:flex-1">
                {["All Meetings", "My Meetings", "Shared With Me"].map(
                  (value, index) => (
                    <button
                      key={index}
                      onClick={() => handleTabChange(value)}
                      className={`flex-1 sm:flex-none min-w-[90px] sm:min-w-[110px] px-2 py-2 flex items-center justify-center text-center capitalize font-medium transition-all duration-200 rounded-md cursor-pointer
                      ${
                        activeTab === value
                          ? " text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>

              <div className="flex flex-wrap justify-around md:justify-start  items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate("/meeting-feed/agent")}
                  className="flex items-center justify-center gap-2 bg-[rgb(45_47_146)] text-xs sm:text-sm font-medium transition-all duration-200 sm:w-auto
               hover:bg-[hsl(239,35%,40%)] text-white rounded-md px-3 py-[10px]  cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <div className="relative">

                <div
                  className="flex items-center justify-center gap-2 bg-[rgb(45_47_146)]
                 hover:bg-[hsl(239,35%,40%)] text-white rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200  sm:w-auto cursor-pointer"
                  onClick={() => setShowFilter((prev) => !prev)}
                >
                  <img src={FilterList} alt="Filter" className="w-4 h-4" />
                  <span>Filter</span>
                </div>

                {callFilter && (
                  <img
                    src={CloseImg}
                    alt="Close Filter"
                    className="w-5 h-5 absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 cursor-pointer shadow hover:scale-105 transition-transform duration-200"
                    onClick={() => {
                      // Only close button should clear the filters
                      setCallFilter(false);
                      setSavedFilters([]);
                      setAdvanceFilterData([]);
                      setFilterResponse([]);
                      setFilterPayload(null);
                      setFilterActiveTab(null);
                      setSearchCredential(null);
                      setShowFilter(false);
                      setSearchParams((prev) => {
                        const params = new URLSearchParams(prev);
                        params.delete("advancedFilter");
                        params.set("page", "1");
                        return params;
                      });
                      localStorage.removeItem("advancedFilter");
                    }}
                    />
                )}
                    </div>
                {/* <button
                  className="flex items-center justify-center gap-2 bg-[rgb(45_47_146)] hover:bg-[hsl(239,35%,40%)] text-white rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 w-full sm:w-auto cursor-pointer"
                  onClick={() => setSelectedResearchItem((prev) => !prev)}
                >
                  <img src={SaveSearch} alt="Research" className="w-4 h-4" />
                  <span>Research</span>
                </button> */}

                <div
                  className="relative 
                // sm:w-auto
                "
                >
                  <button
                    className="flex items-center justify-center gap-2 bg-[#2F45FF] hover:bg-blue-600 text-white rounded-md h-[40px] sm:w-auto px-3 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(activeIndex === 0 ? null : 0);
                    }}
                  >
                    <img src={MoreVector} alt="Add" className="w-4 h-4" />
                    <span>Add</span>
                  </button>

                  {activeIndex === 0 && (
                    <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg overflow-hidden w-[150px] z-20 text-sm border border-gray-100">
                      <p
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={showEventValue}
                      >
                        Create Event
                      </p>
                      <p
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={showUpload}
                      >
                        Upload File
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div
              className={`flex flex-col sm:flex-row ${selectedItems.length > 0 ? "justify-between" : "justify-end"} items-start sm:items-center mt-3 mb-5 gap-3 border-b border-[#D5D7DA] pb-3`}
            >
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-1">
                  <span
                    className="flex items-center rounded-[10px] gap-1 bg-blue-100 text-blue-600 text-sm font-medium px-3 py-2 cursor-pointer  text-center"
                    onClick={() => setShareMeeting(!shareMeet)}
                  >
                    <img
                      src={SendButton}
                      alt=""
                      className="size-5 mb-0.5"
                      style={{ transform: "rotate(310deg)" }}
                    />{" "}
                    Share
                  </span>
                  <span
                    className="inline-flex items-center gap-2
                                    px-3 py-2 rounded-[10px] bg-red-100 text-red-600 text-sm font-medium cursor-pointer"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <img src={DeleteImg} alt="" className="size-4" />
                    Delete
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-1.5
                   rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-text"
                >
                  <span className="text-xs text-blue-600 font-medium">
                    Total Items:
                  </span>
                  <span className="text-blue-600 font-semibold ml-1">
                    {total}
                  </span>
                </button>
                <div className="flex gap-5 items-center">
                  <div
                    className="rounded-2xl hover:bg-gray-100 h-10 w-10 pl-3 pt-3 cursor-pointer"
                    onClick={handleReload}
                  >
                    <img
                      src={Reload}
                      className="animate-spin-slow text-[#151617] size-4"
                      alt=""
                    />
                  </div>

                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 border-2 border-gray-200 hover:bg-blue-50 rounded-[5px] cursor-pointer"
                  >
                    {selectAll ? "Unselect All" : "Select All"}
                  </button>
                </div>

                <div className="flex items-center gap-2 relative">
                  <input
                    type="text"
                    className="rounded-md p-2 pl-10 border border-[#D5D7DA] max-w-[250px] h-[40px] outline-none"
                    placeholder="Search Feed..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                  />
                  <div className="absolute left-3 top-2">
                    <img
                      src={Search}
                      alt="Search"
                      className="w-[22px] h-[22px]"
                    />
                  </div>

                  {/* {selectedItems.length > 0 && (
                    <>
                      <img
                        src={MoreVert}
                        alt="options"
                        className="ml-3 size-6 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMultiSelect(showMultiSelect === 0 ? null : 0);
                        }}
                      />
                      {showMultiSelect === 0 && (
                        <div className="absolute top-10 -right-8 bg-gray-100 rounded-[10px] shadow-lg flex flex-col z-20 w-[100px] border-2 border-gray-200 hover:border-gray-300">
                          <span
                            className="flex items-center gap-1 hover:bg-gray-200 text-sm font-medium px-5 py-2 cursor-pointer hover:rounded-[10px] text-center"
                            onClick={()=>setShareMeeting(!shareMeet)}
                          >
                          <img src={SendButton} alt="" className="size-5 mb-0.5"
                          style={{ transform: "rotate(310deg)" }} />  Share
                          </span>
                          <span
                            className="inline-flex items-center gap-2
                                    px-4 py-2 rounded-[10px] hover:bg-gray-200 text-sm font-medium hover:rounded-[10px] cursor-pointer text-red-600"
                            onClick={() => setConfirmDelete(true)}
                          >
                            <img src={DeleteImg} alt="" className="size-4" />
                            Delete
                          </span>
                        </div>
                      )}
                    </>
                  )} */}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "All Meetings" && (
              <AllMeetingData
                selectedData={selectedData}
                searchQuery={searchQuery}
                showCancel={callFilter}
                meetingData={meetingData}
                showNormalfilter={showNormalfilter}
                ref={childRef}
                filterResponse={filterResponse}
                AdvanceFilterData={advanceFilterData}
                agents={allMeetingState?.agents as any}
                loading={allMeetingState?.loading}
                error={allMeetingState?.error}
                searchCredential={searchCredential || undefined}
                filterCredential={filterCredential || undefined}
                />
              )}
            {activeTab === "My Meetings" && (
              <MyMeeting
              selectedData={selectedData}
              showCancel={callFilter}
              AdvanceFilterData={advanceFilterData}
              showNormalfilter={showNormalfilter}
              myMeetingData={myMeetingData}
              sharedMeetingData={sharedMeetingData}
              searchQuery={searchQuery}
              ref={childRef}
              filterResponse={filterResponse}
              agents={myMeetingState?.agents as any}
              loading={myMeetingState?.loading}
              error={myMeetingState?.error}
              searchCredential={searchCredential || undefined}
              filterCredential={filterCredential || undefined}
              />
            )}
            {activeTab === "Shared With Me" && (
              <SharedMeet
              showCancel={callFilter}
              selectedData={selectedData}
              AdvanceFilterData={advanceFilterData}
              myMeetingData={myMeetingData}
              showNormalfilter={showNormalfilter}
                sharedMeetingData={sharedMeetingData}
                searchQuery={searchQuery}
                ref={childRef}
                filterResponse={filterResponse}
                agents={sharedMeetingState?.agents as any}
                loading={sharedMeetingState?.loading}
                error={sharedMeetingState?.error}
                searchCredential={searchCredential || undefined}
                filterCredential={filterCredential || undefined}
              />
            )}
          </div>

          {/* {UPCOMING_EVENTS && (
          <div className="w-full lg:w-[30%] h-[calc(100vh-10px)] bg-white px-4 py-2">
            <UpcomingEvents />
          </div>
        )} */}
        </div>
      </div>

      {/* Modals */}
      {/* {selectedResearchItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <ResearchMeeting
            setSelectedResearchItem={setSelectedResearchItem}
            handleReload={handleReload}
          />
        </div>
      )} */}

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-xl h-46 text-start">
            <h2 className="text-lg font-semibold mb-3">Delete Confirmation</h2>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete selected items?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleParentDelete}
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
                <img src={DeleteWhite} alt="" className="size-5" />
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

      {shareMeet && (
        <MeetingShare
          setShareMeeting={setShareMeeting}
          setSelectedItems={setSelectedItems}
          selectedItems={selectedItems}
        />
      )}

      {showProcessingFile && (
        <FilesReports setShowProcessingFile={setShowProcessingFile} />
      )}

      {EventData && (
        <CreateEventModal
          setEventData={setEventData}
          // handleReload={handleReload}
        />
      )}
      {uploadData && <UploadData setUploadData={setUploadData} />}

      {showFilter && (
        <AdvancedFilter
          filterList={filterList}
          onClose={() => setShowFilter(false)}
          existingFilters={savedFilters}
          updateFilters={setSavedFilters}
          onApiResponse={handleApiResponse}
        />
      )}
    </>
  );
};

export default MeetingAssistants;
