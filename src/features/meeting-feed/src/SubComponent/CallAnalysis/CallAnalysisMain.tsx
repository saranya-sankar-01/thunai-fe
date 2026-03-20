import { useState, useEffect } from "react";
import {
  fetchScoreData,
  fetchCategory,
  FetchAllScore,
  FetchMappingApi
} from "../../features/CallAnalysiSlice";
import { RoutewithMeticDashboard } from "../ReuseComponent/Added-type";
import { AiFillCaretDown,AiFillCaretUp  } from "react-icons/ai";

import LoadingComp from "../ReuseComponent/LoadingComp";

import { fetchUsers } from "../../features/userSlice";

import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";

import CallScoreStore from "../../Zustand/CallScoreStore";

import { useToast } from "@/hooks/use-toast";

// import CallScoreStore from "../../Zustand/CallScoreStore";

import MoreVert from "../../assets/svg/More_vert.svg";
import View from "../../assets/svg/Remove_red_ice.svg";
import DeleteImg from "../../assets/svg/Delete.svg";
import Edit from "../../assets/svg/Edit.svg";
import OutWard from "../../assets/svg/Arrow_outward.svg";

import {getLocalStorageItem, requestApi } from "../../Service/MeetingService";


const url = new URL(window.location.href);
// const tenant_id =url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

type GroupEnabledState = {
  [key: string]: boolean;
};

interface Group {
  id: string;
  params_enable: boolean;
  alert_category: string;
  alert_category_destination: string;
  alert_destination: string;
  alert_sentiment: string;
  alert_sentiment_destination: string;
  alert_threshold: number;
  categories: any[];
  category_alert: boolean;
  category_alert_platform: string;
  created: string;
  created_new: boolean;
  enable_metrics_dashboard: boolean;
  enabled: boolean;
  feedback_enable: boolean;
  feedback_instruction: string;
  field_download: any[];
  ignore_duration: boolean;
  metrics: any[];
  min_audio_duration: string;
  params_group_instruction: string;
  params_group_name: string;
  sentiment_alert: boolean;
  sentiment_alert_platform: string;
  tags: any[];
  tenant_id: string;
  threshold_alert: boolean;
  threshold_alert_platform: string;
  total_score: number;
  updated: string;
}
interface CallScoreConfig {
  alert_category: string;
  alert_category_destination: string;
  alert_destination: string;
  alert_sentiment: string;
  alert_sentiment_destination: string;
  alert_threshold: number;
  category_alert: boolean;
  enable_metrics_dashboard: boolean;
  enabled: boolean;
  ignore_duration: boolean;
  metrics: any[];
  min_audio_duration: string;
  sentiment_alert: boolean;
  threshold_alert: boolean;
  total_score: number;
}
interface SettingsData {
  enable_metrics_dashboard: boolean;
  ignore_duration: boolean;
  min_audio_duration: string;
}

interface MetricSettingState {
  MetricEnabled: boolean;
  SettingData: SettingsData | null;
  IgnoreDuration: boolean;
  DurationInput: string;
  DurationLoad:boolean;
}


const CallAnalysisMain: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { toast } = useToast();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isSending, setIsSending] = useState(false);

  const { FetchMeetingShare,SharedMeetData }=CallScoreStore();
  
  
  
  
  useEffect(() => {
    const handleClickOutside = () => setActiveIndex(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  
  
  const scoreState = useAppSelector((state: any) => state.score);
  const categoryState = useAppSelector((state: any) => state.category);
  const allScoreState = useAppSelector((state: any) => state.allScore);
  const mappingState = useAppSelector((state: any) => state.mapping);
  
  useEffect(() => {
    if (tenant_id) {
      FetchMeetingShare();
    }
  }, [tenant_id]);

  
  const { scoreDetails } = scoreState;
  const {categoryList} = categoryState;
  const {AllScoreDetails} = allScoreState;
  const {MappingDetails, loading, error } = mappingState;
  const { usersData } = useAppSelector((state: any) => state.allUser);
  const UserList = usersData || [];
  
  const [ShareEnable, setShareEnable] = useState(false);
const [shareAll, setShareAll] = useState(false);
const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

// console.log("allScoreState",allScoreState)
// console.log("scoreDetails",scoreDetails)

  
 useEffect(() => {
  if (!SharedMeetData) return;

  // toggle
  setShareEnable(Boolean(SharedMeetData.share_enabled));

  // Share All
  if (SharedMeetData.share_to === "*") {
    setShareAll(true);
    setSelectedUsers([]);
    return;
  }

  // Wait until users are loaded
  if (
    Array.isArray(SharedMeetData.share_to) &&
    UserList.length > 0
  ) {
    setShareAll(false);

    const users = UserList.filter((u: any) =>
      SharedMeetData.share_to.includes(u.user_id) 
    );

    setSelectedUsers(users);
  }
}, [SharedMeetData, UserList]);




   const ToHandleShareMeet = async () => {
  const newValue = !ShareEnable;
  setShareEnable(newValue);

  const shareToPayload = shareAll
    ? UserList.map((u: any) => u.user_id)
    : selectedUsers.map((u: any) => u.user_id);

  try {
   const response = await requestApi(
      "POST",
      `${tenant_id}/meeting/share/`,
      {
        share_enabled: newValue,
        share_to: shareAll ? "*": shareToPayload ,
      },
      "authService"
    );
    toast({
          title: "Success",
          description:response?.message || "Meeting Share Settings Created/Updated Successfully..!",
          variant: "success",
        });
  } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Share Error!";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      }
};

const SendShareCall = async () => {
  if (isSending) return;
  const shareToPayload = shareAll
    ? "*"
    : selectedUsers.map((u) => u.user_id);
    try{

      setIsSending(true);
      const response = await requestApi(
        "POST",
        `${tenant_id}/meeting/share/`,
        {
          share_enabled: ShareEnable,
          share_to: shareToPayload,
        },
        "authService"
      );
      toast({
          title: "Success",
          description: response?.message || "Meeting Share Settings Created/Updated Successfully..!",
          variant: "success",
        });
    }catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      }finally{
        setIsSending(false);
      }
};


const handleSelectUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const userId = e.target.value;
  if (!userId) return;

  const user = UserList.find((u: any) => u.user_id === userId);

  if (user && !selectedUsers.some((u) => u.user_id === userId)) {
    setSelectedUsers((prev) => [...prev, user]);
  }
};

const handleShareAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  const checked = e.target.checked;
  setShareAll(checked);

  if (checked) {
    setSelectedUsers([]); // clear local list
  }
};
const handleRemoveUser = (id: string) => {
  setSelectedUsers((prev) => prev.filter((u) => u.user_id !== id));
};



// console.log("UserList",UserList);

useEffect(() => {
    dispatch(fetchScoreData());
    dispatch(fetchCategory());
    dispatch(FetchAllScore());
    dispatch(FetchMappingApi());
    dispatch(fetchUsers());
  }, [dispatch]);
  
  
  const handleBack = () =>{
    navigate("/meeting-feed/MeetingAssistants");
  }
  
  const handleRouteToCallscore =()=>{
    navigate('/meeting-feed/CallAnalysis/CallScore');
  }
  const handleRouteToCategoryList =()=>{
    navigate('/meeting-feed/CallAnalysis/CategoryList');
  }
const [stateSetting, setStateSetting] = useState<MetricSettingState>({
  MetricEnabled: false,
  SettingData: null,
  IgnoreDuration: false,
  DurationInput: "",
  DurationLoad:false
});
  const [enable, setEnable] = useState(false);
  const [callScoreEnabled, setCallScoreEnabled] = useState<boolean>(false);
  const [showContent,setShowContent]=useState<boolean>(false);
  
  const {
    FetchDiarization,
    EnableDiarization,
    diarizationEnabled,
    DiariLoading,
  } = CallScoreStore();
  
  
  
  const [groupEnabled, setGroupEnabled] = useState<{[key: string]: boolean}>({});
  const [dynamicDatas, setDynamicDatas] = useState<CallScoreConfig | null>(
    null,
  );
  
  useEffect(()=>{
    FetchDiarization();
    getMetricDashboard();
  },[])
  
  useEffect(() => {
    if (scoreDetails?.data) {
      // setMetricEnabled(scoreDetails.data.enable_metrics_dashboard);
      // setCallScoreEnabled(scoreDetails.data.enabled);
      setDynamicDatas(scoreDetails.data);
    }
    if (MappingDetails?.data) {
      setEnable(MappingDetails.data.enable);
    }
    if (SharedMeetData) {
      setShareEnable(SharedMeetData.share_enabled);
    }
    //Zustand Function
    
  }, [scoreDetails?.data, MappingDetails?.data]);
  
  // console.log("enables--->",callScoreEnabled)
    // console.log("SharedMeetData---->",SharedMeetData);
    // console.log("ShareEnable---->",ShareEnable);


const handleToggleCallScore = async () => {
  try {
    const newValue = !diarizationEnabled;
    const res = await EnableDiarization(newValue);

    toast({
      title: "Success",
      description: res?.data?.message || "User Preference Updated",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update diarization setting",
      variant: "error",
    });
  }
};

// console.log("inside diarizationEnabled",diarizationEnabled)

const getMetricDashboard = async () => {
  try {
    const response = await requestApi(
      "GET",
      `${tenant_id}/call/metrics/settings/`,
      null,
      "authService"
    );

    setStateSetting(prev => ({
      ...prev,
      MetricEnabled: response?.data?.settings?.enable_metrics_dashboard || false,
      IgnoreDuration: response?.data?.settings?.ignore_duration ?? false,
      SettingData: response?.data?.settings?.min_audio_duration ?? ""
    }));

    setCallScoreEnabled(response?.data?.settings?.enable_call_score);

    dispatch(fetchScoreData());
  } catch (error) {
    console.error(error);
  }
};
const handleToggleMetric = async () => {
  try {
    const newEnable = !stateSetting.MetricEnabled;

    const payload = {
      enable_metrics_dashboard: newEnable,
      ignore_duration: dynamicDatas?.ignore_duration ?? false,
      min_audio_duration: dynamicDatas?.min_audio_duration ?? ""
    };

    const response = await requestApi(
      "POST",
      `${tenant_id}/call/metrics/settings/`,
      payload,
      "authService"
    );
    setStateSetting(prev => ({
      ...prev,
      MetricEnabled: newEnable
    }));

    toast({
      title: "Success",
      description:
        response?.message || "Metric Dashboard setting updated successfully!",
      variant: "success",
    });
    dispatch(fetchScoreData());
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    toast({
      title: "Error",
      description: message,
      variant: "error",
    });
  }
};

const handleToggleEnabledCallScore = async () => {
  try {
    const newEnable = !callScoreEnabled;
    const payload={
      // enable_metrics_dashboard: dynamicDatas?.enable_metrics_dashboard ?? false,
      enable_call_score: newEnable,
    }

   const response= await requestApi(
      "POST",
      `${tenant_id}/call/metrics/settings/`,
      payload,
      "authService"
    );
    let EnabledValue= response?.data?.settings?.enable_call_score
    console.log("response",response);
    toast({
      title: "Success",
      description: response?.message || "Call Scoring setting updated successfully!",
      variant: "success",
    });
    setCallScoreEnabled(EnabledValue);
    dispatch(fetchScoreData());
  } catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  toast({
    title: "Error",
    description: message,
    variant: "error",
  });
}
};

const handleToggleSpecific = async () => {
    const newEnable = !enable;
    setEnable(newEnable); 

    const payload = {
      enable: newEnable,
    };
    try {
    const response = await requestApi("POST", `${tenant_id}/field/mappings/`, payload, "authService");
      dispatch(FetchMappingApi()); 
      toast({
      title: "Success",
      description: response?.message || "Specific Fields setting updated successfully!",
      variant: "success",
    });
    }catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong";

  toast({
    title: "Error",
    description: message,
    variant: "error",
  });
}
  };


  const MoveToCreateGroup = (item?:any[], mode?: "view" | "edit") => {
  navigate("/meeting-feed/CallAnalysis/CreateParameterGroup", {
    state: { item, mode },
  });
};



const DeleteParames = async (id: any) => {
  const payload = { id };
  try {
   const response = await requestApi(
      "DELETE",
      `${tenant_id}/call/scoring/?id=${id}`,
      payload,
      "authService"
    );

    toast({
      title: "Success",
      description: response?.message || "Group Deleted successfully !",
      variant: "success",
    });
    dispatch(FetchAllScore());
  } catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Params not deleted";

  toast({
    title: "Error",
    description: message,
    variant: "error",
  });
}
};

const handelGroupName = async (group: Group) => {
  const id = group.id;
  console.log("group==>",group);
  

  const previousValue = groupEnabled[id];

  const newValue = !previousValue;

  setGroupEnabled((prev) => ({
    ...prev,
    [id]: newValue,
  }));

  const payload = {
    alert_category: group?.alert_category || "",
    alert_category_destination: group?.alert_category_destination || "",
    alert_destination: group?.alert_destination || "",
    alert_sentiment: group?.alert_sentiment || "negative",
    alert_sentiment_destination: group?.alert_sentiment_destination || "",
    alert_threshold: group?.alert_threshold || 0,
    categories: group?.categories || [],
    category_alert: group?.category_alert || false,
    category_alert_platform: group?.category_alert_platform || "email",
    created: group?.created,
    // created_new: group.created_new || false,
    created_new: false,
    // enable_metrics_dashboard: group.enable_metrics_dashboard || false,
    enabled: newValue,
    feedback_enable: group?.feedback_enable || false,
    feedback_instruction: group?.feedback_instruction || "",
    field_download: group?.field_download || [],
    id: id,
    // ignore_duration: group?.ignore_duration || false,
    metrics: group?.metrics || [],
    // min_audio_duration: group?.min_audio_duration || "",
    params_enable: group?.params_enable,
    params_group_instruction: group?.params_group_instruction || "",
    params_group_name: group?.params_group_name || "",
    sentiment_alert: group?.sentiment_alert || false,
    sentiment_alert_platform: group?.sentiment_alert_platform || "email",
    tags: group.tags || [],
    tenant_id: tenant_id,
    threshold_alert: group?.threshold_alert || false,
    threshold_alert_platform: group?.threshold_alert_platform || "email",
    total_score: group?.total_score || 0,
    updated: new Date().toISOString(),
  };

  try {
    const response = await requestApi(
      "POST",
      `${tenant_id}/call/scoring/`,
      payload,
      "authService"
    );
 
    toast({
      title: "Success",
      description: response?.message || "Meeting Agent Scoring Settings Updated!",
      variant: "success",
    });
     dispatch(FetchAllScore());
  }catch (error: any) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Failed to update settings!";

  toast({
    title: "Error",
    description: message,
    variant: "error",
  });
}finally{
  setGroupEnabled((prev) => ({
    ...prev,
    [id]: previousValue,
  }));}
};


useEffect(() => {
  if (AllScoreDetails?.data) {
    const initialState: GroupEnabledState = {};
    AllScoreDetails.data.forEach((group: Group) => {
      initialState[group.id] = group.enabled;
    });
    setGroupEnabled(initialState);
  }
}, [AllScoreDetails]);


const [diarizeInstruction, setDiarizeInstruction] = useState("");
const [sending, setSending] = useState(false);

const SendDiarization = async () => {
  if (!diarizeInstruction.trim()) {
    toast({
      title: "Error",
      description: "Please enter diarization instruction",
      variant: "error",
    });
    return;
  }

  const payload = {
    diarize: diarizationEnabled,
    diarize_instruction: diarizeInstruction,
  };

  try {
    setSending(true);

    const res = await requestApi(
      "POST",
      `${tenant_id}/settings/preference/`,
      payload,
      "accountService"
    );

    toast({
      title: "Success",
      description: res?.message || "User Preference Updated successfully",
      variant: "success",
    });
    setDiarizeInstruction("")
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update diarization setting",
      variant: "error",
    });
  } finally {
    setSending(false);
  }
};

const handleSettingUpdate = async (type: 'toggle' | 'duration') => {

  if (type === 'duration' && (!stateSetting.DurationInput || stateSetting.DurationInput.trim() === "")) {
    toast({
      title: "Error",
      description: "Please enter the duration.",
      variant: "error",
    });
    return;
  }

  if (type === 'duration') {
    setStateSetting(prev => ({ ...prev, DurationLoad: true }));
  }

  try {

    const payload = type === 'toggle' 
      ? {
          ignore_duration: !stateSetting.IgnoreDuration,
          min_audio_duration: stateSetting?.SettingData ?? "",
          enable_metrics_dashboard: stateSetting?.MetricEnabled ?? false
        }
      : {
          ignore_duration: stateSetting.IgnoreDuration,
          min_audio_duration: stateSetting.DurationInput,
          enable_metrics_dashboard: stateSetting.MetricEnabled
        };

    const response = await requestApi(
      "POST",
      `${tenant_id}/call/metrics/settings/`,
      payload,
      "authService"
    );

    // Update state based on action type
    if (type === 'toggle') {
      setStateSetting(prev => ({
        ...prev,
        IgnoreDuration: !prev.IgnoreDuration
      }));
      
      toast({
        title: "Success",
        description: response?.message || "Ignore duration updated successfully!",
        variant: "success",
      });
    } else {
      setStateSetting(prev => ({
        ...prev,
        DurationInput: "",
        DurationLoad: false
      }));
      
      toast({
        title: "Success",
        description: response?.message || "Duration updated successfully!",
        variant: "success",
      });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    
    // Clear loading state only for duration updates
    if (type === 'duration') {
      setStateSetting(prev => ({ ...prev, DurationLoad: false }));
    }
    
    toast({
      title: "Error",
      description: message,
      variant: "error",
    });
  }
};

  return (
    <div className="p-2 lg:px-[20px] bg-white h-[100vh]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Call Analysis</h3>
        <button
          className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100"
          onClick={handleBack}
        >
         Back to Feed
        </button>
      </div>

      <div className=" rounded-[5px]">
        <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-5 cursor-pointer">

        <div className="flex flex-col md:flex-row gap-2 justify-start md:justify-between items-center">
          <div className="flex flex-col gap-1">
            <h5 className="font-medium">Enable Call Scoring</h5>
            <p className="text-sm text-gray-600">
              Turn on call scoring to evaluate calls based on custom parameters.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <button className="border border-blue-500 text-blue-600  hover:bg-blue-50 cursor-pointer text-primary mr-6 hover:opacity-50 px-4 py-1 rounded-md"
            onClick={()=>MoveToCreateGroup()}>
              Create Group
            </button>

            <button
              onClick={handleToggleEnabledCallScore}
              className={`relative  w-[35px] h-[20px]
                rounded-full transition-colors duration-300 cursor-pointer
                ${callScoreEnabled ? "bg-blue-600" : "bg-gray-300"}`}
                >
              <span
                className={`absolute top-1 left-1  w-[13px] h-[13px] bg-white rounded-full
                  shadow-md transform transition-transform duration-300
                  ${callScoreEnabled ? "translate-x-[15px]" : ""}`}
                  ></span>
            </button>
          </div>
        </div>
        {
          callScoreEnabled && <div>
            <p className="font-medium mb-2 mt-4">Parameter Group List ({AllScoreDetails?.data?.length || 0})</p>
    
           {loading ? (
              <LoadingComp height="170px" />
    ) : error ? (
      <div className="text-red-500 text-sm">{error}</div>
    ) : (
      <div className={`border border-gray-200 rounded-md p-3 flex flex-col gap-1 overflow-y-scroll scrollbar-thin ${
  showContent ? "h-[210px]" : "h-[170px]"
}`}>
        {AllScoreDetails?.data?.map((group: any, i: number) => (
          <div
            key={i}
            className="relative flex items-center justify-between border border-gray-200 bg-white shadow-sm rounded-lg px-3 py-4 mb-1"
          >
      
            <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
      <span className="text-sm font-medium text-gray-700 break-all cursor-pointer"
       onClick={() => MoveToCreateGroup(group, "view")}>
        {group?.params_group_name || "Unnamed Group"}
      </span>
    </div>
    
    <div className="flex items-center gap-4">
    <button
      onClick={() => handelGroupName(group)}
      className={`relative w-[35px] h-[20px] rounded-full transition-all duration-300 
        ${groupEnabled[group.id] ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[13px] h-[13px] bg-white rounded-full transform transition-transform 
          ${groupEnabled[group.id] ? "translate-x-[14px]" : ""}`}
      ></span>
    </button>
    
              <div className="relative">
                <img
                  src={MoreVert}
                  onClick={(e) => {
                    e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                  });
                    setActiveIndex(activeIndex === i ? null : i);
                  }}
                  alt="options"
                  className="w-5 h-5 cursor-pointer hover:opacity-70"
                />
                {activeIndex === i && (
      <div className="fixed bg-white border border-gray-200 shadow-lg rounded-md w-28 z-[9999]"
      style={{
      top: menuPosition.top,
      left: menuPosition.left,
    }}>
    
    <button
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
      onClick={() => MoveToCreateGroup(group, "edit")}
    >
      <img src={Edit} alt="edit" className="w-4 h-4" />
      Edit
    </button>
        <button
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
      onClick={() => MoveToCreateGroup(group, "view")}
    >
      <img src={View} alt="view" className="w-4 h-4" />
      View
    </button>
    
    
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-200 w-full text-left"
          onClick={() => DeleteParames(group.id)}
        >
          <img src={DeleteImg} alt="delete" className="w-4 h-4" />
          Delete
        </button>
      </div>
    )}
              </div>
            </div>
          </div>
        ))}
    
    
      </div>
    )}
          </div>
        }
        <div className="flex justify-center items-center">
          {showContent? 
          <AiFillCaretUp   className="h-4 w-4 hover:text-gray-400" onClick={()=>setShowContent(prev=>!prev)}/>:
          <AiFillCaretDown  className="h-4 w-4 hover:text-gray-400" onClick={()=>setShowContent(prev=>!prev)}/>
          }
        </div>

                  </div>

<div className=" h-full lg:h-[calc(100vh-300px)] overflow-y-scroll scrollbar-thin">

    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-5 cursor-pointer hover:bg-gray-100"
      >

      <div className="flex flex-col gap-1"
      onClick={ handleRouteToCallscore}
      >
        <h5 className="text-base font-semibold text-gray-800">
          Specific Fields Details ({MappingDetails?.data?.field_download?.length || 0})
        </h5>
        <p className="text-sm text-gray-600 hover:underline">
          Manage the specific fields details efficiently.
        </p>
      </div>


      <div className="flex items-center justify-end w-full sm:w-auto">
        <button
          onClick={handleToggleSpecific}
          className={`relative w-[35px] h-[20px] rounded-full transition-all duration-300 ease-in-out cursor-pointer 
            ${enable ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-[4px] left-[4px] w-[13px] h-[13px] bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
              ${enable ? "translate-x-[14px]" : ""}`}
          ></span>
        </button>
      </div>
    </div>
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-3 cursor-pointer hover:bg-gray-100"
     
    >

      <div className="flex flex-col gap-1"
       onClick={ handleRouteToCategoryList}>
        <h5 className="text-base font-semibold text-gray-800">
          Categories ({categoryList?.data?.length || 0})
        </h5>
        <p className="text-sm text-gray-600 hover:underline-offset-1">
          Manage Call Scoreing categories.
        </p>
      </div>

    </div>


 <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm mt-3 w-full">

  {/* Header */}
  <div className="flex justify-between items-center">
    <h1 className="font-semibold text-sm">Share Call</h1>

    <button
      onClick={ToHandleShareMeet}
      className={`relative w-9 h-5 rounded-full transition
        ${ShareEnable ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform
          ${ShareEnable ? "translate-x-4" : ""}`}
      />
    </button>
  </div>

  <p className="text-xs text-gray-500 mt-1">
    Enable or disable call sharing
  </p>

{ShareEnable && (
  <div>
  {/* Share All */}
  <div className="flex items-center gap-2 mt-4">
    <input
  type="checkbox"
  checked={shareAll}
  disabled={!ShareEnable}
  onChange={handleShareAll}
/>

    <span className="text-sm">Share with all users</span>
  </div>

  {/* Select Users */}
  {!shareAll && ShareEnable && (
    <div className="mt-4">
      <label className="text-xs font-medium text-gray-600">
        Select Users
      </label>

      <select
        onChange={handleSelectUser}
        className="w-full border rounded-md p-2 mt-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Select a user</option>
        {UserList.map((user: any) => (
          <option key={user.user_id} value={user.user_id}>
            {user.emailid} ({user.username})
          </option>
        ))}
      </select>
    </div>
  )}

  {/* Selected Users */}
  <div className="mt-4">
    {shareAll ? (
      <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
        The call will be shared with <b>all users</b>.
      </p>
    ) : selectedUsers.length > 0 ? (
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
    <h4 className="text-sm font-medium px-4 py-2 bg-gray-50">
      Users with Access
    </h4>

<ul
  className={`divide-y divide-gray-200 max-h-[200px] ${
    selectedUsers.length > 3 ? "overflow-y-scroll scrollbar-thin" : "overflow-hidden"
  }`}
>
      {selectedUsers.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          {/* LEFT: Avatar + Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700
                            flex items-center justify-center text-sm font-semibold">
              {user.username?.charAt(0)?.toUpperCase() ||
               user.emailid?.charAt(0)?.toUpperCase()}
            </div>

            {/* Name & Email */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {user.username || "User"}
              </span>
              <span className="text-xs text-gray-500">
                {user.emailid}
              </span>
            </div>
          </div>

          {/* RIGHT: Delete */}
         
            <img src={DeleteImg}
            onClick={() => handleRemoveUser(user.user_id)}
            className="text-gray-400 hover:text-red-500 size-4 cursor-pointer"
             alt="deleteIcon" />
        </li>
      ))}
    </ul>
  </div>
    ) : (
      <p className="text-xs text-gray-400">
        No users selected
      </p>
    )}
  </div>

  {/* Footer Buttons */}
  <div className="flex justify-end gap-2 mt-6">
    <button
      className="px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50"
      // onClick={() => {
      //   setShareAll(false);
      //   setSelectedUsers([]);
      // }}
    >
      Cancel
    </button>

    {/* <button
      onClick={SendShareCall}
      disabled={!ShareEnable}
      className={`px-3 py-1.5 text-xs rounded-md text-white
        ${ShareEnable
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-400 cursor-not-allowed"}`}
    >
      Send
    </button> */}
    <button
  onClick={SendShareCall}
  disabled={!ShareEnable}
  className={`px-3 py-1.5 text-xs rounded-md text-white transition
    ${
      isSending
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
>
  {isSending ? "Sending..." : "Send"}
</button>
  </div>

  </div>
)}
</div>



<div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-3">

  {/* HEADER */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

    {/* LEFT CONTENT */}
    <div className="flex flex-col gap-1 max-w-lg">
      <h5 className="text-base font-semibold text-gray-800">
        Call Settings
      </h5>

      <p className="text-sm text-gray-600">
        Enable or disable call diarization
      </p>

      <a
        className="hover:underline text-sm font-medium text-[#2F45FF] flex items-center gap-1 w-fit"
        href="https://docs.thunai.ai/article/86-call-diarization-in-meeting-assistants"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit Setup Guide
        <img
          src={OutWard}
          alt="Arrow"
          className="w-3 sm:w-4 h-3 sm:h-4"
        />
      </a>
    </div>

    {/* TOGGLE */}
    <div className="flex items-center justify-end w-full sm:w-auto">
      <button
        onClick={handleToggleCallScore}
        disabled={DiariLoading}
        aria-pressed={diarizationEnabled}
        aria-label="Toggle Call Diarization"
        className={`relative w-[36px] h-[20px] rounded-full transition-all duration-300 ease-in-out
          ${diarizationEnabled ? "bg-blue-600" : "bg-gray-300"}
          ${DiariLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white rounded-full shadow-md
            transform transition-transform duration-300 ease-in-out
            ${diarizationEnabled ? "translate-x-[16px]" : ""}
          `}
        />
      </button>
    </div>

  </div>

  {/* DIARIZATION INSTRUCTIONS */}
  {diarizationEnabled && (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 w-full max-w-xl">

      <h5 className="text-base font-semibold text-gray-800 mb-2">
        Diarization Instructions
      </h5>

      <textarea
        value={diarizeInstruction}
        onChange={(e) => setDiarizeInstruction(e.target.value)}
        placeholder="Separate speakers clearly and label them as Agent and Customer..."
        className="w-full min-h-[110px] resize-none border border-gray-300 rounded-md p-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={sending}
      />

      <p className="text-xs text-gray-600 mt-2">
        These instructions help improve speaker separation and labeling accuracy.
      </p>

      <div className="flex justify-end gap-3 mt-4 flex-wrap">
        <button
          onClick={() => setDiarizeInstruction("")}
          disabled={sending}
          className="px-4 py-1.5 text-sm rounded-md border border-gray-300
            hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={SendDiarization}
          disabled={sending}
          className={`px-4 py-1.5 text-sm rounded-md text-white transition
            ${sending
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

    </div>
  )}

</div>







    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-3"
    >

      <div className="flex flex-col gap-1">
        <h5 className="text-base font-semibold text-gray-800">
          Enable Metric Dashboard 
        </h5>
        <p className="text-sm text-gray-600">
          Enable or disabled the metric dashboard for detailed insights.
        </p>
        <span className="cursor-pointer text-blue-600 hover:underline m-0 text-[13px]"  onClick={RoutewithMeticDashboard}>Visit Site</span>
        <span className=" hover:underline m-0 text-sm sm:text-sm font-medium text-[#2F45FF] flex items-center gap-1 cursor-pointer"  onClick={()=>window.open(`https://docs.thunai.ai/article/85-metric-dashboard-support-guide`,"_blank")}>View SetUp Guide <img
                src={OutWard}
                alt="Arrow"
                className="w-3 sm:w-4 h-3 sm:h-4"
              /></span>
      </div>

      <div className="flex items-center justify-end w-full sm:w-auto ">
        <button
          onClick={handleToggleMetric}
          className={`relative  w-[35px] h-[20px] rounded-full transition-all duration-300 ease-in-out cursor-pointer
            ${stateSetting.MetricEnabled ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-[4px] left-[4px]  w-[13px] h-[13px] bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
              ${stateSetting.MetricEnabled ? "translate-x-[14px]" : ""}`}
          ></span>
        </button>
      </div>

    </div>

    <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition mt-3">

  <div className="flex items-center justify-between">
    <div>
      <h5 className="text-base font-semibold text-gray-800">
        Ignore calls below duration threshold
      </h5>
      <p className="text-sm text-gray-500">
        Calls shorter than the specified duration will be ignored.
      </p>
    </div>

    {/* Toggle */}
    <button
      onClick={() => handleSettingUpdate('toggle')}
      className={`relative  w-[35px] h-[20px] rounded-full transition-all duration-300 ease-in-out cursor-pointer
      ${stateSetting.IgnoreDuration ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-[4px] left-[4px]  w-[13px] h-[13px] bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
        ${stateSetting.IgnoreDuration ? "translate-x-[14px]" : ""}`}
      />
    </button>
  </div>

  {/* Duration Input Section */}
  {stateSetting.IgnoreDuration && (
    <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">

      <input
        type="number"
        placeholder="Enter duration in seconds"
        value={stateSetting.DurationInput}
        onChange={(e) =>
          setStateSetting(prev => ({
            ...prev,
            DurationInput: e.target.value
          }))
        }
        className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <div className="flex gap-2">
        <button
          onClick={() =>
            setStateSetting(prev => ({
              ...prev,
              DurationInput: ""
            }))
          }
          className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={() => handleSettingUpdate('duration')}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
        {stateSetting.DurationLoad ? "Loading...": "Save"}
        </button>
      </div>

    </div>
  )}

</div>

      </div>
      </div>
    </div>
  );
};

export default CallAnalysisMain;
