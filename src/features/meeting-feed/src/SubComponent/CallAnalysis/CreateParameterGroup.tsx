import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchScoreData,
  fetchCategory,
  FetchAllScore,
} from "../../features/CallAnalysiSlice";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import type { Parameter, SubParameter } from "../../types/scoring";


import { useToast } from "@/hooks/use-toast";

import {getLocalStorageItem , requestApi } from "../../Service/MeetingService";

import BackArrow from "../../assets/svg/Arrow_back.svg";

import Tags from "./Tags";
import SetupScore from "./SetupScore";
import Settings from "./Settings";
import ParametersList from "./ParametersList";

const url = new URL(window.location.href);
// const tenant_id =url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");
 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");
interface Tag {
  tag: string;
  description: string;
}

interface GroupData {
  GroupName: string;
  instruction: string;
}
export interface GroupErrors {
  GroupName?: string;
  // instruction?: string;
}

interface SettingsData {
  // Email Notification
  emailNotify: boolean;
  threshold: string;
  email: string;
  id?: string | number;
  // Sentiment Notification
  sentimentNotify: boolean;
  sentiment: string;
  sentimentEmail: string;

  // Category Notification
  categoryNotify: boolean;
  category: string;
  categoryEmail: string;

  // Duration Ignore
  durationIgnore: boolean;
  duration: string;

  // Feedback
  feedback: boolean;
  feedbackInstruction: string;
}
// interface CallScoreConfig {
//   alert_category: string;
//   alert_category_destination: string;
//   alert_destination: string;
//   alert_sentiment: string;
//   alert_sentiment_destination: string;
//   alert_threshold: number;
//   category_alert: boolean;
//   enable_metrics_dashboard: boolean;
//   enabled: boolean;
//   ignore_duration: boolean;
//   metrics: any[];
//   min_audio_duration: string;
//   sentiment_alert: boolean;
//   threshold_alert: boolean;
//   total_score: number;
// }

const CreateParameterGroup = () => {
  const { toast } = useToast();

  const location = useLocation();
  const { item, mode } = location.state || {};

  // console.log("item--->", item);

  const [activeTab, setActiveTab] = useState("SetupScore");
  const [selectedParameters, setSelectedParameters] = useState<Parameter[]>([]);
  const [isEditingScores, setIsEditingScores] = useState(false);

  const [metricEnabled, setMetricEnabled] = useState<boolean>(false);
  const [callScoreEnabled, setCallScoreEnabled] = useState<boolean>(false);
  // const [dynamicDatas, setDynamicDatas] = useState<CallScoreConfig | null>(
  //   null,
  // );
  const [state, setState]=useState({
    isSend:false,
  })

  // Settings state
  const [settingsData, setSettingsData] = useState<SettingsData>({
    emailNotify: false,
    threshold: "",
    email: "",
    id: "",
    sentimentNotify: false,
    sentiment: "Negative",
    sentimentEmail: "",
    categoryNotify: false,
    category: "",
    categoryEmail: "",
    durationIgnore: false,
    duration: "",
    feedback: false,
    feedbackInstruction: "",
  });

  // Tags state
  const [tags, setTags] = useState<Tag[]>([]);

  // const [groupsDetail, setGroupDetail]=useState<GroupDetails>([]);
  const [groupData, setGroupData] = useState<GroupData>({
    GroupName: "",
    instruction: "",
  });
  const [groupErrors, setGroupErrors] = useState<GroupErrors>({
    GroupName: "",
    // instruction: "",
  });

  useEffect(() => {
    if (item) {
      setGroupData({
        GroupName: item.params_group_name || "",
        instruction: item.params_group_instruction || "",
      });

      setSelectedParameters(
  (item.metrics || []).map((m: any) => ({
    id: m.id,
    params: m.metric,
    instruction: m.instruction || "",
    custom: m.custom || false,
    score: m.score,
    selectedType: m.tools?.[0] || "",
    sub_parameters: (m.sub_metrics || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      instruction: s.instruction,
      score: s.score,
      selectedType: s.tools?.[0] || "",
    })),
  })),
);


      // Settings from API
      setSettingsData({
        emailNotify: item.threshold_alert,
        threshold: item.alert_threshold?.toString() || "",
        email: item.alert_destination || "",
        id: item.id,
        sentimentNotify: item.sentiment_alert,
        sentiment: item.alert_sentiment || "negative",
        sentimentEmail: item.alert_sentiment_destination || "",

        categoryNotify: item.category_alert,
        category: item.alert_category || "",
        categoryEmail: item.alert_category_destination || "",

        durationIgnore: item.ignore_duration,
        duration: item.min_audio_duration || "",

        feedback: item.feedback_enable,
        feedbackInstruction: item.feedback_instruction || "",
      });

      setMetricEnabled(item.enable_metrics_dashboard);
      setCallScoreEnabled(item.enabled);
    }
  }, [item]);

  // console.log("callScoreEnabled--->",callScoreEnabled);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const scoreState = useAppSelector((state: any) => state.score);
  const { scoreDetails } = scoreState;

  useEffect(() => {
    dispatch(fetchScoreData());
    dispatch(fetchCategory());
    dispatch(FetchAllScore());
  }, [dispatch]);

  const handleGroupDataChange = (field: keyof GroupData, value: string) => {
    setGroupData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setGroupErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const SendConfiguration = async () => {
    const errors = {
      GroupName: "",
      // instruction: "",
    };

    if (!groupData.GroupName.trim()) {
      errors.GroupName = "Group name is required";
    }

    // if (!groupData.instruction.trim()) {
    //   errors.instruction = "Group instruction is required";
    // }

    setGroupErrors(errors);

    if (errors.GroupName) {
      toast({
        title: "Error",
        description: "Please fill Group Name.",
        variant: "error",
      });

      return;
    }

    if (totalScore !== 100) {
      toast({
        title: "Error",
        description: "Total score must be exactly 100",
        variant: "error",
      });
      return;
    }
    // Calculate total score
    const currentTotalScore = selectedParameters.reduce(
      (sum, param) => sum + (param.score || 0),
      0,
    );  

    const metrics = selectedParameters.map((param) => {
  const metricObj: any = {
    id: param.id || undefined, 
    metric: param.params,
    instruction:param.instruction,
    custom: param.custom || false,
    score: param.score || 0,
  };


  if (param.selectedType) {
    metricObj.tools = [param.selectedType];
  }
  

  if (param.sub_parameters && param.sub_parameters.length > 0) {
    const validSubs = param?.sub_parameters?.filter(
      (sp:any) => sp.name?.trim() && sp.instruction?.trim()
    );
    
    if (validSubs.length > 0) {
  metricObj.sub_metrics = validSubs.map((sp:any) => ({
    name: sp.name,
    instruction: sp.instruction,
    score: sp.score || 0,
    ...(sp.selectedType ? { tools: [sp.selectedType] } : {}),
  }));
}
  }

  return metricObj;
});



    // Map tags to the required format - FIXED
    const tagsPayload = tags.map((tag) => ({
      tag: tag.tag,
      description: tag.description,
    }));

    const payload = {
      threshold_alert: settingsData.emailNotify,
      alert_threshold: settingsData.threshold
        ? parseInt(settingsData.threshold)
        : 0,
      alert_destination: settingsData.email || "",

      sentiment_alert: settingsData.sentimentNotify,
      alert_sentiment: settingsData.sentiment.toLowerCase(),
      alert_sentiment_destination: settingsData.sentimentEmail || "",
      id: settingsData.id,
      category_alert: settingsData.categoryNotify,
      alert_category: settingsData.category || "",
      alert_category_destination: settingsData.categoryEmail || "",

      // Other settings
      // ignore_duration: settingsData.durationIgnore,
      // min_audio_duration: settingsData.duration || "",

      feedback_enable: settingsData.feedback,
      feedback_instruction: settingsData.feedbackInstruction || "",

      tags: tagsPayload,

      categories: [],
      created_new: mode !== "edit",
      enable_metrics_dashboard: metricEnabled,
      enabled: callScoreEnabled,
      metrics: metrics,
      params_enable: selectedParameters.length > 0,
      params_group_name: groupData.GroupName,
      params_group_instruction: groupData.instruction,
      total_score: currentTotalScore,
    };
      setState(prev=>({
      ...prev,isSend:true
    }))

    try {
      const response = await requestApi(
        "POST",
        `${tenant_id}/call/scoring/`,
        payload,
        "authService",
      );
      toast({
        title: "Success",
        description:
          response?.message || "Parameter Configuration successfully",
        variant: "success",
      });

      if (mode !== "edit") {
        setGroupData({ GroupName: "", instruction: "" });
      }

      // setTimeout(() => {
      //   navigate("/CallAnalysis");
      // }, 1000);
      setState(prev=>({
      ...prev,isSend:false
    }))
    } catch (error: any) {
      console.error("SendConfiguration Api", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save configuration",
        variant: "error",
      });
    }finally{
      setState(prev=>({
      ...prev,isSend:false
    }))
    }
  };

  // Update settings data
  const updateSettingsData = (updates: Partial<SettingsData>) => {
    setSettingsData((prev) => ({ ...prev, ...updates }));
  };

  // Add tag
  const handleAddTag = (tag: string, description: string) => {
    if (tag.trim() === "") return;
    const newTag: Tag = {
      tag: tag,
      description: description,
    };
    setTags((prev) => [...prev, newTag]);
  };
  // Remove tag
  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => navigate(-1);

  const handleAddConfiguration = (parameters: Parameter[]) => {
    const baseScore = Math.floor(100 / parameters.length);
    const remainder = 100 % parameters.length;

    const parametersWithScores = parameters.map((param, index) => ({
      ...param,
      score: index < remainder ? baseScore + 1 : baseScore,
    }));

    setSelectedParameters(parametersWithScores);
    setActiveTab("SetupScore");
    setIsEditingScores(true);
    // toast.success(`${parameters.length} parameter(s) added successfully!`);
    // toast({
    //   title: "Success",
    //   description:`${parameters.length} parameter(s) added successfully!`,
    //   variant: "success",
    // });
  };

  // Handle cancel/clear all selected parameters
  const handleCancelConfiguration = () => {
    setSelectedParameters([]);
    setIsEditingScores(false);
  };

  // Update parameter score
  // const handleUpdateScore = (paramName: string, newScore: number) => {
  //   setSelectedParameters((prev) =>
  //     prev.map((param) =>
  //       param.params === paramName ? { ...param, score: newScore } : param,
  //     ),
  //   );
  // };
  const handleUpdateScore = (paramId: string | number, newScore: number) => {
  setSelectedParameters(prev =>
    prev.map(param =>
      param.id === paramId ? { ...param, score: newScore } : param
    )
  );
};


  // Calculate total score
  const totalScore = selectedParameters.reduce(
    (sum, param) => sum + (param.score || 0),
    0,
  );

  useEffect(() => {
    if (scoreDetails?.data) {
      setMetricEnabled(scoreDetails.data.enable_metrics_dashboard);
      setCallScoreEnabled(scoreDetails.data.enabled);
    }
    // if (scoreDetails?.data) {
    //   setDynamicDatas(scoreDetails.data);
    // }
  }, [scoreDetails?.data]);

  // console.log("setDynamicDatas--->22",dynamicDatas)
  // const handleToggleEnabledCallScore = async () => {
  //   if (!dynamicDatas) return;
  //   try {
  //     const newEnable = !callScoreEnabled;
  //     setCallScoreEnabled(newEnable);
  //     const payload = {
  //       alert_category: dynamicDatas.alert_category,
  //       alert_category_destination: dynamicDatas.alert_category_destination,
  //       alert_destination: dynamicDatas.alert_destination,
  //       alert_sentiment: dynamicDatas.alert_sentiment,
  //       alert_sentiment_destination: dynamicDatas.alert_sentiment_destination,
  //       alert_threshold: dynamicDatas.alert_threshold,
  //       category_alert: dynamicDatas.category_alert,
  //       enable_metrics_dashboard: dynamicDatas.enable_metrics_dashboard,
  //       enabled: newEnable,
  //       ignore_duration: dynamicDatas.ignore_duration,
  //       metrics: dynamicDatas.metrics,
  //       min_audio_duration: dynamicDatas.min_audio_duration,
  //       sentiment_alert: dynamicDatas.sentiment_alert,
  //       threshold_alert: dynamicDatas.threshold_alert,
  //       total_score: dynamicDatas.total_score,
  //     };

  //     const response = await requestApi(
  //       "POST",
  //       `${tenant_id}/call/scoring/`,
  //       payload,
  //       "authService",
  //     );

  //     toast({
  //       title: "Success",
  //       description:
  //         response?.message || "Call Scoring setting updated successfully!",
  //       variant: "success",
  //     });
  //     dispatch(fetchScoreData());
  //   } catch (error) {
  //     console.error("Error updating toggle:", error);
  //   }
  // };

  // const handleToggleMetric = async () => {
  //   if (!dynamicDatas) return;
  //   try {
  //     const newEnable = !metricEnabled;
  //     setMetricEnabled(newEnable);
  //     const payload = {
  //       alert_category: dynamicDatas.alert_category,
  //       alert_category_destination: dynamicDatas.alert_category_destination,
  //       alert_destination: dynamicDatas.alert_destination,
  //       alert_sentiment: dynamicDatas.alert_sentiment,
  //       alert_sentiment_destination: dynamicDatas.alert_sentiment_destination,
  //       alert_threshold: dynamicDatas.alert_threshold,
  //       category_alert: dynamicDatas.category_alert,
  //       enable_metrics_dashboard: newEnable,
  //       enabled: dynamicDatas.enabled,
  //       ignore_duration: dynamicDatas.ignore_duration,
  //       metrics: dynamicDatas.metrics,
  //       min_audio_duration: dynamicDatas.min_audio_duration,
  //       sentiment_alert: dynamicDatas.sentiment_alert,
  //       threshold_alert: dynamicDatas.threshold_alert,
  //       total_score: dynamicDatas.total_score,
  //     };

  //     const response = await requestApi(
  //       "POST",
  //       `${tenant_id}/call/scoring/`,
  //       payload,
  //       "authService",
  //     );

  //     toast({
  //       title: "Success",
  //       description:
  //         response?.message || "Metric Dashboard setting updated successfully!",
  //       variant: "success",
  //     });
  //     dispatch(fetchScoreData());
  //   } catch (error) {
  //     console.error("Error updating toggle:", error);
  //     toast({
  //       title: "Error",
  //       description: "Error updating toggle:",
  //       variant: "error",
  //     });
  //   }
  // };

  // const handleTypeChange = (paramName: string, value: string) => {
  //   setSelectedParameters((prev) =>
  //     prev.map((param) =>
  //       param.params === paramName ? { ...param, selectedType: value } : param,
  //     ),
  //   );
  // };
  const handleTypeChange = (paramId: string | number, value: string) => {
  setSelectedParameters(prev =>
    prev.map(param =>
      param.id === paramId ? { ...param, selectedType: value } : param
    )
  );
};


  // const handleAddParameter = (newParam: Parameter) => {
  //   setSelectedParameters((prev) => [
  //     ...prev,
  //     {
  //       ...newParam,
  //       // id:newParam.id,
  //       score: 0,
  //       selectedType: "",
  //       custom: true,
  //     },
  //   ]);

  //   setIsEditingScores(true);
  // };

  const handleAddParameter = (newParam: Parameter) => {
  setSelectedParameters(prev => {
    const exists = prev.some(p => p.id === newParam.id);

    if (exists) {
      return prev.map(p =>
        p.id === newParam.id
          ? { ...p, ...newParam }
          : p
      );
    }
    return [
      ...prev,
      { ...newParam, score: newParam.score ?? 0, selectedType: "", custom: true },
    ];
  });

  setIsEditingScores(true);
};


  // console.log("FINAL selectedParameters =>", selectedParameters);


  // const handleRemoveParameter = (paramName: string) => {
  //   setSelectedParameters((prev) =>
  //     prev.filter((param) => param.params !== paramName),
  //   );
  // };
  const handleRemoveParameter = (paramId: string | number) => {
  setSelectedParameters(prev =>
    prev.filter(param => param.id !== paramId)
  );
};

//   const handleSubParameterUpdate = (
//   paramName: string,
//   subIndex: number,
//   updates: Partial<SubParameter>
// ) => {
//   setSelectedParameters(prev =>
//     prev.map(param => {
//       // if (param.params !== paramName) return param;
//       if (param.id !== paramId) return param;


//       const updatedSubs = [...(param.sub_parameters || [])];
//       updatedSubs[subIndex] = {
//         ...updatedSubs[subIndex],
//         ...updates,
//       };

//       return {
//         ...param,
//         sub_parameters: updatedSubs,
//       };
//     })
//   );
// };
const handleSubParameterUpdate = (
  paramId: string | number | undefined,
  subIndex: number,
  updates: Partial<SubParameter>
) => {
  setSelectedParameters(prev =>
    prev.map(param => {
      if (param.id !== paramId) return param;

      const subs = param.sub_parameters ? [...param.sub_parameters] : [];

      const existingSub = subs[subIndex] || {
        id: "",
        name: "",
        instruction: "",
        score: 0,
        selectedType: "",
      };

      subs[subIndex] = {
        ...existingSub,
        ...updates,
      };

      return { ...param, sub_parameters: subs };
    })
  );
};



  return (
    <>
      <div className="p-6 max-h-[calc(100vh-100px)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Call Analysis</h2>

          <div className="flex flex-wrap gap-4 items-center">
            {/* <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm">Metric Dashboard Enabled</p>

              <div className="flex items-center justify-end w-full sm:w-auto ">
                <button
                  onClick={handleToggleMetric}
                  className={`relative  w-[35px] h-[20px] rounded-full transition-all duration-300 ease-in-out cursor-pointer
            ${metricEnabled ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-[4px] left-[4px]  w-[13px] h-[13px] bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
              ${metricEnabled ? "translate-x-[14px]" : ""}`}
                  ></span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm">Scoring Enabled</p>
              <div className="flex items-center justify-end w-full sm:w-auto">
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
            </div> */}

            <button
              onClick={handleBack}
              className="flex items-center text-sm gap-1 text-gray-700 border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100"
            >
              <img src={BackArrow} alt="Back" />
              Back
            </button>

            {/* button here */}
            {mode !== "view" && (
              <button
                className={`px-2 py-1 text-sm rounded-md hover:shadow-lg ${
                  totalScore === 100
                    ? "bg-black text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={totalScore !== 100}
                onClick={SendConfiguration}
              >
              {state.isSend ? "Loading...":"Save Configuration"}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-start">
          <div
            className="
      bg-blue-100 
      rounded-lg 
      p-2 
      flex 
      flex-wrap sm:flex-nowrap 
      gap-2 sm:gap-4 
      items-center 
      text-xs sm:text-sm 
      font-medium 
      text-gray-700
      w-full sm:w-auto
    "
          >
            {["SetupScore", "ParametersList", "Settings", "Tags"].map((tab) => (
              <button
                key={tab}
                className={`px-3 sm:px-4 py-1.5 rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-black shadow-sm"
                    : "hover:bg-white hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "SetupScore" && (
            <SetupScore
              groupData={groupData}
              // EditData={item}
              onSubParameterUpdate={handleSubParameterUpdate}
              mode={mode}
              onGroupDataChange={handleGroupDataChange}
              selectedParameters={selectedParameters}
              totalScore={totalScore}
              onCancelConfiguration={handleCancelConfiguration}
              onUpdateScore={handleUpdateScore}
              onAddParameter={handleAddParameter}
              onRemoveParameter={handleRemoveParameter}
              isEditingScores={isEditingScores}
              // onToggleEditScores={setIsEditingScores}
              onTypeChange={handleTypeChange}
              groupErrors={groupErrors}
            />
          )}
          {activeTab === "ParametersList" && (
            <ParametersList
              mode={mode}
              selectedParameters={selectedParameters}
              onAddConfiguration={handleAddConfiguration}
            />
          )}
          {activeTab === "Settings" && (
            <Settings
              mode={mode}
              settingsData={settingsData}
              onUpdateSettings={updateSettingsData}
            />
          )}
          {activeTab === "Tags" && (
            <Tags
              tags={tags}
              mode={mode}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CreateParameterGroup;
