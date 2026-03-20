import { useState,useEffect } from "react";
import { getLocalStorageItem ,requestApi } from "../../Service/MeetingService";
import { ToastContainer, toast } from "react-toastify";
import LoadingComp from "../ReuseComponent/LoadingComp";
// import ReactMarkdown from "react-markdown";

// import type { GroupErrors } from "./CreateParameterGroup";
import { FetchParameter } from "../../features/CallAnalysiSlice";
import { useAppDispatch } from "../../redux/hooks";
import { store } from "../../redux/store";
import type { Parameter, SubParameter } from "../../types/scoring.ts";
import FetchTenant from "../../Zustand/FetchTenant";


import "react-toastify/dist/ReactToastify.css";
import Close from "../../assets/svg/Close.svg";
import AddIcon from "../../assets/svg/Add2.svg";
import DeleteIcon from "../../assets/svg/Delete.svg";


interface GroupData {
  GroupName: string;
  instruction: string;
}
interface GroupErrors {
  GroupName?: string;
  // instruction?: string;
}

interface SetupScoreProps {
  selectedParameters: Parameter[];
  totalScore: number;
  groupData: GroupData;
  // EditData: any;
  mode?: "view" | "edit";
  onGroupDataChange: (field: keyof GroupData, value: string) => void;
  onCancelConfiguration: () => void;
  onUpdateScore: (paramId: string | number, newScore: number) => void;
  onRemoveParameter: (paramId: string | number) => void;
  onSubParameterUpdate: (paramId: string | number, subIndex: number, updates: Partial<SubParameter>) => void;
  onTypeChange: (paramId: string | number, value: string) => void;


  onAddParameter: (param: Parameter) => void;
  isEditingScores: boolean;
  // onToggleEditScores: React.Dispatch<React.SetStateAction<boolean>>;
  groupErrors: GroupErrors;
}

interface ErrorType {
  paramsName?: string;
  instruction?: string;
  subParameters?: { name?: string; instruction?: string }[];
}


const SetupScore = ({
  selectedParameters,
  totalScore,
  groupData,
  // EditData,
  mode,
  groupErrors,
  onGroupDataChange,
  onAddParameter,
  onCancelConfiguration,
  onSubParameterUpdate,
  onUpdateScore,
  onRemoveParameter,
  isEditingScores,
  // onToggleEditScores,
  onTypeChange,
}: SetupScoreProps) => {
  const [paramsAdd, setParamsAdd] = useState<boolean>(false);
  const [state, setState]=useState({
    GetIdParamData: false,
    isSubparamsLoad:false,
  })
  const [errors, setErrors] = useState<ErrorType>({});
  
  const [paramsData, setParamsData] = useState({
    paramsName: "",
    instruction: "",
    sub_parameters: [] as SubParameter[],
  });
  // const [idData,setIdData]=useState<any>([]);
  // const [paramEdit, setParamEdit]=useState<boolean>(false);

 const [editingParamId, setEditingParamId] = useState<string | number | null>(null);
 const {  TenantData , FetchTenantData}= FetchTenant();

  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id ||localStorage.getItem("tenant_id");
  useEffect(()=>{
    FetchTenantData()
  },[])

  const TenantIdData = [
  "thunai1747647748",
  "thunai1758173711707",
  "thunai1758197037814",
  "thunai1758534198976",
  "thunai1763998725793",
  "thunai1769066319361",
  "thunai1769715049164",
  "thunai1764663066582",
];

const ShowBrainTool = TenantData?.some(
  (item) => TenantIdData.includes(item.tenant_id)
);
// const ShowBrainTool = !hasMatchingTenant;

  
  const dispatch = useAppDispatch();
  // const ParameterData = useAppSelector((state: any) => state.Parameter);

  // useEffect(() => {
  //   if (ParameterData?.ParameterDetails?.data?.parameters?.parameters) {
  //     const allParams =
  //       ParameterData.ParameterDetails.data.parameters.parameters;

  //     const matchedParam = allParams.find(
  //       (param: any) => param.params === paramsData.paramsName,
  //     );

  //     // if (matchedParam) {
  //     //   console.log("Found after redux update:", matchedParam.id);
  //     // }
  //   }
  // }, [ParameterData]);


  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    onGroupDataChange(name as keyof GroupData, value);
  };

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  setParamsData({ ...paramsData, [e.target.name]: e.target.value });
};

  const handleAddSubParameter = () => {
    setParamsData((prev) => ({
      ...prev,
      sub_parameters: [
        ...(prev.sub_parameters || []),
        { name: "", instruction: "", selectedType: "" },
      ],
    }));
  };

  const handleSubParamChange = (
    index: number,
    field: "name" | "instruction",
    value: string,
  ) => {
    const updated = [...paramsData.sub_parameters];
    updated[index][field] = value;

    setParamsData((prev) => ({
      ...prev,
      sub_parameters: updated,
    }));
  };
  const handleRemoveSubParam = (index: number) => {
    const updated = paramsData.sub_parameters.filter((_, i) => i !== index);

    setParamsData((prev) => ({
      ...prev,
      sub_parameters: updated,
    }));
  };

 const validate = () => {
    const tempErrors: ErrorType = {};
    const subErrors: { name?: string; instruction?: string }[] = [];

    if (!paramsData.paramsName.trim()) {
      tempErrors.paramsName = "Parameter name is required";
    }

    if (!paramsData.instruction.trim()) {
      tempErrors.instruction = "Instruction is required";
    }

    // Validate sub parameters
    paramsData.sub_parameters.forEach((sub, index) => {
      const subError: { name?: string; instruction?: string } = {};

      if (!sub.name.trim()) {
        subError.name = "SubParameter name is required";
      }

      if (!sub.instruction.trim()) {
        subError.instruction = "SubParameter instruction is required";
      }

      subErrors[index] = subError;
    });

    if (subErrors.some((err) => err.name || err.instruction)) {
      tempErrors.subParameters = subErrors;
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const cleanedSubParams = paramsData.sub_parameters.filter(
    (sub) => sub.name.trim() !== "" && sub.instruction.trim() !== "",
  );

 const handleAddParams = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  // Set loading state
  setState(prev => ({
    ...prev,
    isSubparamsLoad: true
  }));

  const isEdit = !!editingParamId;

  const payload1 = {
    ...(isEdit && { id: editingParamId }),
    parameters: paramsData.paramsName,
    instruction: paramsData.instruction,
    sub_parameters: cleanedSubParams,
  };

  const payload2 = [{
    parameters: paramsData.paramsName,
    instruction: paramsData.instruction,
    sub_parameters: cleanedSubParams,
  }];

  const payload = isEdit ? payload1 : payload2;

  try {
    const response = await requestApi(
      isEdit ? "PATCH" : "POST",
      `${tenant_id}/customise/call/scoring/`,
      payload,
      "authService",
    );

    toast.success(response?.message || "Params submitted successfully!");
    
    // Reset edit mode
    setEditingParamId(null);

    // Fetch updated parameters
    await dispatch(FetchParameter());
    
    // Get updated state
    const state: any = store.getState();
    const updatedParams = state.Parameter?.ParameterDetails?.data?.parameters
      ?.parameters || [];
    
    // Find the matching parameter
    let matchedParam;
    if (isEdit) {
      matchedParam = updatedParams.find(
        (p: any) => p.id === editingParamId
      );
    } else {
      matchedParam = updatedParams.find(
        (p: any) =>
          p.params?.trim().toLowerCase() ===
          paramsData.paramsName?.trim().toLowerCase()
      );
    }

    if (!matchedParam) {
      console.warn("Parameter not found after refresh");
      // Still close the popup even if parameter not found
      setParamsAdd(false);
      return;
    }

    const parameterId = matchedParam.id;
    
    // Try multiple possible keys for sub parameters
    const backendSubMetrics = matchedParam.sub_parameters || matchedParam.sub_metrics || [];
    
    // Find existing parameter
    const existingParam = selectedParameters.find(
      (p) => p.id === parameterId
    );

    // Merge sub parameters
    const mergedSubParams = paramsData.sub_parameters.map((localSub: any) => {
      const foundBackend = backendSubMetrics.find(
        (b: any) =>
          b.name?.trim().toLowerCase() ===
          localSub.name?.trim().toLowerCase()
      );

      const foundExisting = existingParam?.sub_parameters?.find(
        (s: any) =>
          s.name?.trim().toLowerCase() ===
          localSub.name?.trim().toLowerCase()
      );
      
      return {
        ...localSub,
        id: foundBackend?.id,
        score: foundExisting?.score || 0,
        selectedType: foundExisting?.selectedType || "",
      };
    });

    // Add the parameter
    onAddParameter({
      id: parameterId,
      params: paramsData.paramsName,
      instruction: paramsData.instruction,
      custom: true,
      sub_parameters: mergedSubParams,
    });

    // Reset form data
    setParamsData({
      paramsName: "",
      instruction: "",
      sub_parameters: [],
    });

    // Close the popup
    setParamsAdd(false);

  } catch (error) {
    console.error(error);
    toast.error("Failed to submit parameters");
  } finally {
    // Always clear loading state, regardless of success or failure
    setState(prev => ({
      ...prev,
      isSubparamsLoad: false
    }));
  }
};
  const handleCancel = () => {
    setParamsAdd(false);
    setParamsData({
      paramsName: "",
      instruction: "",
      sub_parameters: [],
    });
    // onGroupDataChange("GroupName", "");
    // onGroupDataChange("instruction", "");
    setErrors({});
  };

  const handleScoreChange = (paramId: string | number, value: number) => {
    onUpdateScore(paramId, value);
  };

  const handleScoreInputChange = (paramId: string | number, value: string) => {
    const score = parseInt(value) || 0;
    onUpdateScore(paramId, score);
  };


  const handleRemoveClick = (paramId: string | number) => {
    onRemoveParameter(paramId);
  };
  const individualMaxScore = 100;



  //   const handleSubTypeChange = (
  //   paramName: string,
  //   subIndex: number,
  //   value: string
  // ) => {
  //   setSubToolTypes(prev => ({
  //     ...prev,
  //     [paramName]: {
  //       ...prev[paramName],
  //       [subIndex]: value,
  //     },
  //   }));
  // };
  const handleSubScoreChange = (
    paramId: string | number,
    subIndex: number,
    newValue: number,
    parentMax: number,
  ) => {
    const param = selectedParameters.find((p) => p.id === paramId);
    if (!param?.sub_parameters) return;

    const otherTotal = param.sub_parameters.reduce((sum, s, i) => {
      if (i === subIndex) return sum;
      return sum + (s.score || 0);
    }, 0);

    const allowed = Math.min(newValue, parentMax - otherTotal);

    onSubParameterUpdate(paramId, subIndex, { score: allowed });
  };


  // const getSubScore = (paramName: string, index: number) => subScores[paramName]?.[index] || 0;

  // const getTotalSubScore = (paramName: string) =>Object.values(subScores[paramName] || {}).reduce((a:any, b:any) => a + b, 0);

  const handleEditClick = async (param: any) => {
    setParamsAdd(true);
    setEditingParamId(param?.id);
    setState(prev => ({
  ...prev,
  GetIdParamData: true
}));
    try {
      const res = await requestApi(
        "GET",
        `${tenant_id}/customise/call/scoring/`,
        {},
        "authService"
      )
      // const paramData = res?.data?.parameters?.find((p: any) => p.id === id);
      const paramData = res?.data?.parameters?.find(
  (p: any) => p?.params?.trim() === param?.params?.trim()
     );
      if (!paramData) {
        console.warn("Parameter not found");
        return;
      }
      setParamsAdd(true);


      setParamsData({
        paramsName: paramData?.params || "",
        instruction: paramData?.instruction || "",
        sub_parameters: paramData?.sub_parameters || [],
      });
     setState(prev => ({
  ...prev,
  GetIdParamData: false
}));
} catch (err) {
  console.error("Error fetching parameter details:", err);
  setState(prev => ({
  ...prev,
  GetIdParamData: false
}));
}
  }
  // console.log("selectedParameters",selectedParameters)

  return (
    <div className="mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 border border-gray-100 max-h-[calc(100vh-170px)] overflow-y-scroll scrollbar-thin">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Call Scoring Configuration
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            name="GroupName"
            value={groupData.GroupName}
            onChange={handleGroupChange}
            disabled={mode === "view"}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-400 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
          />
          {groupErrors?.GroupName && (
            <p className="text-red-500 text-xs mt-1">{groupErrors.GroupName}</p>
          )}
        </div>

        {/* <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Group Instructions (optional)
          </label> */}
        {/* <textarea
            name="instruction"
            value={groupData.instruction}
            onChange={handleGroupChange}
            disabled={mode === "view"}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-400 ${
              mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
                {groupErrors?.instruction && (
                    <p className="text-red-500 text-xs mt-1">
                     {groupErrors.instruction}
                       </p>
                  )} */}
        {/* </div> */}
      </div>

      <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 mb-6">
        <div>
          <h4 className="font-medium text-gray-800">Maximum Score</h4>
          <p className="text-sm text-gray-500">
            Set the maximum possible score for this call evaluation
          </p>
        </div>
        <button className=" px-4 py-2 border rounded-md font-medium border-gray-300 text-gray-700 hover:bg-blue-50">
          100
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h6 className="text-base font-semibold text-gray-700">Add Parameter</h6>
        <div className="text-right">
          <span
            className={`block text-sm font-semibold ${totalScore === 100 ? "text-green-600" : "text-red-500"
              }`}
          >
            {totalScore}/100
          </span>
          <p className={`text-xs  ${totalScore === 100 ? "text-green-500" : "text-red-500"}`}>
            Total score must equal 100
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Add Parameter Name"
          name="paramsName"
          value={paramsData.paramsName}
          // disabled={totalScore === 100}
          onChange={handleChange}
          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-400"
        />

        <button
          className={`px-5 py-2 rounded-lg transition
              ${mode === "view"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
            }
            `}
          onClick={() => mode !== "view" && setParamsAdd(true)}
        // disabled={mode === "view" || totalScore === 100}
        >
          Add
        </button>
      </div>
      <div></div>

      {selectedParameters.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
          <h4 className="font-medium h-[35px]">Scoring Parameters</h4>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-800">
                Selected Parameters ({selectedParameters.length})
              </h4>
              {/* {mode !== "view" && (
                <button
                  onClick={() => onToggleEditScores(!isEditingScores)}
                  className="text-blue-600 text-sm"
                >
                  {isEditingScores ? "Save Scores" : "Edit Scores"}
                </button>
              )} */}

              {mode !== "view" && (
                <button
                  onClick={onCancelConfiguration}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Cancel All
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {selectedParameters.map((param) => {
              const currentScore = param.score || 0;
              const parentScore = param.score || 0;
              const childTotal =
                param.sub_parameters?.reduce(
                  (sum, sp) => sum + (sp.score || 0),
                  0,
                ) || 0;
              const isScoreValid =
                (param.sub_parameters?.length ?? 0) > 0
                  ? childTotal === parentScore
                  : true;

              return (
                <div
                  key={param.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 relative"
                >
                 

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h6 className="flex gap-2 flex-col lg:flex-row items-start lg:items-center font-medium text-sm text-gray-800 mb-1">
                        {param.params}{" "}
                        {ShowBrainTool && (

                        <div className="m-2">
                          {mode === "view" ? (
                            <span className="p-2">
                              {param.selectedType === "brain_tool" ? (
                                "Brain Tool"
                              ) : (
                                <button className="p-1 text-red-400 border border-red-500 rounded cursor-text">
                                  Tool Not Selected
                                </button>
                              )}
                            </span>
                          ) : (
                            <select
                              className="p-2 outline-none border-2 border-blue-400"
                              value={param.selectedType || ""}
                              onChange={(e) => {
                                if (param.id != null) onTypeChange(param.id, e.target.value);
                              }}  >

                              <option value="">Select Type</option>
                              <option value="brain_tool">Brain Tool</option>
                              {/* <option value="ai_tool">AI Tool</option> */}
                            </select>
                          )}
                        </div>

                        )}

                      </h6>

                      <div className="text-xs text-gray-600 leading-relaxed">
                        {param.instruction && <p>{param?.instruction}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {isEditingScores ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={individualMaxScore}
                            value={currentScore}
                            onChange={(e) => {
                              if (param.id != null) handleScoreInputChange(param.id, e.target.value);
                            }}


                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-blue-600">
                          {currentScore} points
                        </span>
                      )}
                    </div>
                  </div>

                  {/* {isEditingScores && ( */}
                  <div className="mt-3">
                    <div className="flex justify-end items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        {currentScore} pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={individualMaxScore}
                      value={currentScore}
                      onChange={
                        mode !== "view"
                          ? (e) => {
                            if (param.id != null) {
                              handleScoreChange(param.id, parseInt(e.target.value));
                            }
                          }
                          : undefined
                      }
                      // onChange={(e) => {
                      //       if (param.id != null)
                      //        handleScoreChange(param.id, parseInt(e.target.value));
                      //     }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${individualMaxScore > 0
                            ? (currentScore / individualMaxScore) * 100
                            : 0
                          }%, #e5e7eb ${individualMaxScore > 0
                            ? (currentScore / individualMaxScore) * 100
                            : 0
                          }%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex justify-between items-center" >
                      <div>

                    {mode !== "view" && (
                      <button type="button" onClick={() => handleEditClick(param)}
                      className="mt-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                    )}
                    </div>
                    <div className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center">

                     {mode !== "view" && (
                       <img
                       src={DeleteIcon}
                       alt=""
                       onClick={() => param.id != null && handleRemoveClick(param.id)}
                       className=" text-white rounded-full size-5  cursor-pointer flex items-center justify-center text-xs transition-colors"
                       title={`Remove ${param.params}`}
                       />
                      )}
                      </div>

                    </div>
                  </div>
                  {/* )} */}
                  <div className={`${(param.sub_parameters?.length ?? 0) > 0 ? "mt-4 border-2 border-blue-400 p-2 rounded-lg bg-blue-50" : ""}`}
                  >
                    {(param.sub_parameters?.length ?? 0) > 0 && (
                      <div className="text-sm font-medium mt-1">
                        <span
                          className={
                            isScoreValid ? "text-green-600" : "text-red-600"
                          }
                        >
                          {childTotal} / {parentScore}
                        </span>
                        {!isScoreValid && (
                          <div className="text-red-500 text-xs">
                            Total score must equal {parentScore}
                          </div>
                        )}
                      </div>
                    )}
                    {param.sub_parameters?.map((sub, index) => {
                      const currentScore = sub.score || 0;
                      // const parentScore = param.score || 0;

                      return (
                        <div
                          key={index}
                          className="mb-4 p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {sub.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {sub.instruction}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {
                                ShowBrainTool && (
                              <div className="mt-2">
                                {mode === "view" ? (
                                  sub.selectedType === "brain_tool" ? (
                                    <span className="text-xs text-green-600 font-medium">
                                      Brain Tool
                                    </span>
                                  ) : (
                                    <span className="text-xs text-red-500">
                                      Tool Not Selected
                                    </span>
                                  )
                                ) : (
                                  <select
                                    value={sub.selectedType || ""}
                                    onChange={(e) => {
                                      if (param.id != null)
                                        onSubParameterUpdate(param.id, index, {
                                          selectedType: e.target.value,
                                        });
                                    }}

                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="">Select Tool</option>
                                    <option value="brain_tool">
                                      Brain Tool
                                    </option>
                                  </select>
                                )}
                              </div>

                                )
                              }
                            </div>
                          </div>


                          {/* {isEditingScores && ( */}
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">0</span>
                              <span className="text-sm font-medium text-blue-600">
                                {currentScore} pts
                              </span>
                            </div>
                              <input
                              type="range"
                              min="0"
                              max={parentScore}
                              value={currentScore}

                              onChange={
                                mode !== "view"
                                  ? (e) => {
                                    if (param.id != null) {
                                      handleSubScoreChange(
                                        param.id,
                                        index,
                                        parseInt(e.target.value),
                                        parentScore
                                      );
                                    }
                                  }
                                  : undefined
                              }

                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${parentScore > 0 ? (currentScore / parentScore) * 100 : 0
                                  }%, #e5e7eb ${parentScore > 0 ? (currentScore / parentScore) * 100 : 0
                                  }%, #e5e7eb 100%)`,
                              }}
                            />
                          </div>
                          {/* )} */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paramsAdd && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 bg-black/10 bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 w-[calc(100vw-250px)] max-h-[calc(100vh-100px)] mx-4 shadow-xl overflow-y-auto">


            <div className="flex justify-between items-center mb-6">
              <div>
                <h6 className="font-semibold text-gray-800 text-lg">
                  Parameter and instructions
                </h6>
                <p className="text-sm text-gray-600 mt-1">
                  Create Parameters and Instructions for scoring.
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <img src={Close} alt="close" className="w-5 h-5" />
              </button>
            </div>
            {state.GetIdParamData ? <LoadingComp height="50vh" /> : 
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameter Name
                </label>
                <input
                  type="text"
                  placeholder="Enter parameter name"
                  name="paramsName"
                  value={paramsData.paramsName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none"
                />
                {errors.paramsName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paramsName}
                  </p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruction
                </label>
                <textarea
                  name="instruction"
                  value={paramsData.instruction}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter instructions"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none resize-none"
                ></textarea>
                {errors.instruction && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.instruction}
                  </p>
                )}
              </div>
              <div className="h-[200px] overflow-y-auto">
                {paramsData?.sub_parameters?.map((sub, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 mb-3 bg-gray-50 relative"
                  >

                    <img
                      onClick={() => handleRemoveSubParam(index)}
                      className="absolute top-2 right-2 text-red-500 text-xs size-4"
                      src={DeleteIcon} alt="DeleteIcon" />
                    <div>
                      <label
                        htmlFor=""
                        className="text-sm font-medium text-gray-700"
                      >
                        Metric Name
                      </label>
                      <input
                        type="text"
                        placeholder="Subparameter name"
                        value={sub.name}
                        onChange={(e) =>
                          handleSubParamChange(index, "name", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none resize-none"
                      />
                      {errors.subParameters?.[index]?.name && (
                        <p className="text-red-500 text-xs mb-2">
                          {errors.subParameters[index].name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor=""
                        className="text-sm font-medium text-gray-700"
                      >
                        Instrution
                      </label>
                      <textarea
                        placeholder="Sub-parameter instruction"
                        value={sub.instruction}
                        onChange={(e) =>
                          handleSubParamChange(
                            index,
                            "instruction",
                            e.target.value,
                          )
                        }
                        className="w-full border rounded px-2 py-1 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none resize-none"
                      />
                      {errors.subParameters?.[index]?.instruction && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.subParameters[index].instruction}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="flex gap-1 text-sm p-2 text-white bg-blue-600 rounded-lg cursor-pointer"
                  onClick={handleAddSubParameter}
                >
                  <img src={AddIcon} alt="AddIcon" /> Add SubParamenter
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddParams}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                 {state.isSubparamsLoad ? "Loading..." : "Save instructions"}
                </button>
              </div>
            </form>
            }
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

export default SetupScore;
