import {getLocalStorageItem, requestApi } from "@/services/authService";
import { useState, useEffect, useRef } from "react";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
} from "react-router-dom";
import ViewAnalysis from "../SubComponent/ViewAnalysis";
import ShareExport from "../SubComponent/ShareExport";
import ExportDocument from "../SubComponent/ExportDocument";
import Reload from "../assets/svg/Reload.svg";

import ISTTime from "@/components/shared-components/ISTTime";

import SummaryDetails from "../SubComponent/SummaryDetails";

import AddBrain from "../SubComponent/AddBrain";
import TranScript from "../SubComponent/TranScript";
import EditSection from "../SubComponent/EditSection";
import KeyData from "../SubComponent/KeyData";

import KeyArrowBack from "../assets/svg/Arrow_back.svg";
import CalenderToday from "../assets/svg/Calender_today.svg";
import FileExport from "../assets/svg/FileExport.svg";
import KeyArrow2 from "../assets/svg/Keyboard_arrow.svg";
import StarBorder from "../assets/svg/Star_border.svg";
import DeleteImg from "../assets/svg/DeleteBlack.svg";
import Delete from "../assets/svg/Delete.svg";
import DeleteWhite from "../assets/svg/DeleteWhite.svg";
import SendButton from "../assets/svg/SendButton.svg";
import AddBlue from "../assets/svg/AddBlue.svg";
import AddBtn from "../assets/svg/Add2.svg";
import GlobalImg from "../assets/svg/PublishedChanges.svg";
import EditImg from "../assets/svg/ModernEdit.svg";
import ImportExport from "../assets/svg/ImportExport.svg";
import AddIcon from "../assets/svg/Add2.svg";
import ExPantIcon from "../assets/svg/Expantion.svg";
import CopyIcon from "../assets/svg/CopyBlue.svg";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../SubComponent/ReuseComponent/ErrorFallback";
import LoadingComp from "../SubComponent/ReuseComponent/LoadingComp";

import { useToast } from "@/hooks/use-toast";

export interface FieldMappingData {
  enable: boolean;
  id: string;
}

export interface CallScores {
  total_scores: number;
  call_scores: Record<string, any>;
}

export interface ScoreAnalysis {
  id?: string | number;
  call_scores?: CallScores;
  callscore_flag?: boolean;
  field_mapping_data?: FieldMappingData;
  field_download_response?: any[];
}

const userInfo = getLocalStorageItem("user_info") || {};
const token: string = userInfo?.access_token;

import AudioPlayer from "./AudioPlayer";

interface CallDetailsResponse {
  summary?: string;
  title?: string;
  category?: string;
  chapters_and_topics?: {
    topic: string;
    points?: string[];
  }[];
  action_items?: any[];
  next_steps?: string[];
  [key: string]: any;
}

interface SubParameter {
  name: string;
  instruction: string;
  score?: number;
  selectedType?: string;
}

interface ScoreDetail {
  max_score?: number;
  score?: number;
  comment?: string;
  SubParams?: SubParameter[];
}

interface InvitedParticipant {
  email: string;
  name?: string;
}
interface CallScoreCategory {
  score?: number;
  comment?: string;
  suggestions_for_improvement?: string;
}

interface SentimentType {
  sentiment_reasoning?: any[];
  sentiment_percentage?: any;
  sentiment_transcription_with_timing?: any[];
}

const CallDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  // const CellUser = url.searchParams.get("id") || searchParams.get("id");

  const id = searchParams.get("id") || location.state?.id || useParams().id;

  const { feed_type, agent } = location.state || {};
  const selectedItem = agent;
  // console.log("selectedItem",selectedItem);

  const IS_SHOW_AI_CREDITS =
    import.meta.env.VITE_IS_SHOW_AI_CREDITS ||
    ((window as any)?.env?.IS_SHOW_AI_CREDITS ?? true);

  const [getCalls, setGetCall] = useState<CallDetailsResponse>(
    {} as CallDetailsResponse,
  );
  // console.log("getCalls", getCalls);

  const [loading, setLoading] = useState<boolean>(false);
  const [showDataShare, setShowDataShare] = useState<number | null>(null);
  const [viewUser, setViewUser] = useState<boolean>(false);

  const [sentimental, setSentimental] = useState<SentimentType | null>(null);

  // console.log("CellUserId",CellUser)

  const [negative, setNegative] = useState(0);
  const [positive, setPositive] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [skills, setSkills] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("0");

  const [viewAnalysis, setViewAnalysis] = useState<boolean>(false);
  const [scoreAnalysis, setScoreAnalysis] = useState<ScoreAnalysis | null>(
    null,
  );

  const [viewExport, setViewExport] = useState<boolean>(false);

  const [range, setRange] = useState<{ start: any | null; end: any | null }>({
    start: null,
    end: null,
  });

  const handleTranscriptClick = (start: string, end: string) => {
    const convert = (timeStr: string) => {
      const parts = timeStr.split(":").map(Number);
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    };

    const startSec = convert(start);
    const endSec = convert(end);
    setRange({ start: startSec, end: endSec });
  };

  const [activeSummary, setActivesummary] = useState<string>("Summary");

  const [activeParticipant, setActiveParticipant] = useState<string>(
    "Invited_Participant",
  );
  const [refresh, setRefresh] = useState<boolean>(false);

  // const [showEditData, setShowEditData]=useState<number | null >(null);

  // useEffect(()=>{
  //   const CloseEditToggle= ()=> setShowEditData(null);
  //   document.addEventListener("click",CloseEditToggle);
  //   return ()=> document.removeEventListener("click",CloseEditToggle);
  // },[])
  // meeting feed api
  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    setLoading(true);
    if (!id || !feed_type) return;

    const payload = {
      id,
      feed_type,
    };
    try {
      const response = await requestApi(
        "put",
        `${tenant_id}/salesenablement/`,
        payload,
        "authService",
      );
      const apiData = response.data;
      // console.log("apiData", apiData);

      setGetCall(apiData || ({} as CallDetailsResponse));
    } catch (error) {
      console.error("Error fetching data:", error);
      setGetCall({} as CallDetailsResponse);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchSentiment = async () => {
      try {
        const payload = {
          id,
          feed_type: "sentiment_analysis",
        };
        const res = await requestApi(
          "put",
          `${tenant_id}/salesenablement/`,
          payload,
          "authService",
        );

        const data = res.data;
        setSentimental(data);

        if (data?.sentiment_percentage) {
          setNegative(data.sentiment_percentage.negative || 0);
          setPositive(data.sentiment_percentage.positive || 0);
          setNeutral(data.sentiment_percentage.neutral || 0);
        }
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      }
    };

    fetchSentiment();
  }, [id]);

  // console.log("sentimental",sentimental);

  useEffect(() => {
    if (!id) return;
    const fetchCallScore = async () => {
      try {
        setLoading(true);
        const payload = { id, feed_type: "call_score" };

        const response = await requestApi(
          "put",
          `${tenant_id}/salesenablement/`,
          payload,
          "authService",
        );

        const skillScore = response?.data;
        setScoreAnalysis(skillScore);
        // setAllData()

        setSkills(skillScore?.call_scores);
      } catch (error) {
        console.error("Error fetching CallScore data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCallScore();
  }, [id]);

  //  console.log("scoreAnalysis",scoreAnalysis)
  //  console.log("scoreAnalysis?.callscore_flag",scoreAnalysis?.callscore_flag)

  const handleBack = () => navigate(-1);

  const [joinedParticipants, setJoinedParticipants] = useState<string[]>([]);
  const [invitedParticipants, setInvitedParticipants] = useState<
    InvitedParticipant[]
  >([]);

  useEffect(() => {
    if (getCalls) {
      setJoinedParticipants(
        Array.isArray(getCalls?.joined_participants)
          ? getCalls?.joined_participants
          : [],
      );
      setInvitedParticipants(
        Array.isArray(getCalls?.invited_participants)
          ? getCalls?.invited_participants
          : [],
      );
    }
  }, [getCalls]);

  const onClose = () => {
    setViewAnalysis(false);
  };
  // console.log("getCalls.joined_participants==>",getCalls.joined_participants);
  // console.log("getCalls==>",getCalls);
  // console.log("getCalls.invited_participants==>",getCalls.invited_participants);

  const GoToCallScore = (id: any) => {
    navigate(`/meeting-feed/MeetingAssistants/CallScoreAnalysis/${id}`, {
      state: {
        skills,
        scoreAnalysis,
        displayScore,
        selectedIndex,
      },
    });
  };

  const CancelShareData = () => {
    setViewUser(false);
  };

  const CancelExportData = () => {
    setViewExport(false);
  };

  useEffect(() => {
    const closeAddDropdown = () => setShowDataShare(null);
    document.addEventListener("click", closeAddDropdown);
    return () => document.removeEventListener("click", closeAddDropdown);
  }, []);

  const selectedIndex = parseInt(selectedGroup);
  const selectedSkill = skills?.[selectedIndex];
  const dynamicTotalScore = selectedSkill?.total_scores ?? 0;
  const displayScore = Math.min(Math.max(dynamicTotalScore, 0), 100);

  // console.log("selectedSkill", selectedSkill);
  console.log("selectedIndex", selectedIndex);

  // const deleteJoined = (name: string) => {
  //   setJoinedParticipants((prev) => prev.filter((e) => e !== name));
  // };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openConfirmDelete = (email: string) => {
    setSelectedDeleteId(email);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!selectedDeleteId) return;
    await deleteInvited(selectedDeleteId);
    setConfirmDelete(false);
    setSelectedDeleteId(null);
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setSelectedDeleteId(null);
  };

  const deleteInvited = async (email: string) => {
    // Remove from UI
    const updatedList = invitedParticipants.filter((p) => p.email !== email);
    setInvitedParticipants(updatedList);

    const payload = {
      id: id,
      invited_participants: updatedList,
    };
    setDeleting(true);
    try {
      const response = await requestApi(
        "PATCH",
        `${tenant_id}/salesenablement/`,
        payload,
        "authService",
      );
      toast({
        title: "Success",
        description: response?.message || "Deleted successfully",
        variant: "success",
      });
    } catch (error: any) {
      setDeleting(false);
      console.error(error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || error?.message || "Error deleting",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const [showAddParticipant, setShowAddParticipant] = useState<boolean>(false);
  // const [removeEmail , setRemoveEmail] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [invitedLoading, setInvitedLoading] = useState<boolean>(false);

  const [participants, setParticipants] = useState<InvitedParticipant[]>([]);

  const formValid = name.trim() !== "" && email.trim() !== "";

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

    const newItem = { name, email };
    setParticipants((prev) => [...prev, newItem]);

    // reset fields
    setName("");
    setEmail("");
  };

  const deleteParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParticipant = (
    index: number,
    field: "name" | "email",
    value: string,
  ) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add Invite Participant Function
  const handleSubmitApi = async () => {
    let finalParticipants = [...participants]; // Create a copy of existing participants

    // Check if there are name/email in the input fields that haven't been added to participants yet
    if (name.trim() !== "" && email.trim() !== "") {
      // Add the current form data to finalParticipants
      finalParticipants.push({ name, email });
    }

    // If no participants at all (empty array and empty form), show error
    if (finalParticipants.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one participant",
        variant: "error",
      });
      return;
    }

    const payload = {
      id: id,
      invited_participants: [...invitedParticipants, ...finalParticipants],
    };

    setInvitedLoading(true);
    try {
      const Response = await requestApi(
        "PATCH",
        `${tenant_id}/salesenablement/`,
        payload,
        "authService",
      );

      toast({
        title: "Success",
        description: Response?.message || "Participants successfully Add..!",
        variant: "success",
      });
      setShowAddParticipant(false);
      setParticipants([]);
      setName("");
      setEmail("");
      setRefresh((prev: boolean) => !prev);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.message || "Failed to submit participants",
        variant: "error",
      });
      setInvitedLoading(false);
    }
  };

  const CancelInviteUi = () => {
    setName("");
    setEmail("");
    setShowAddParticipant(false);
  };

  const callScoresArray = Object.values(scoreAnalysis?.call_scores || {});
  const SentimentArray = Array.isArray(sentimental?.sentiment_reasoning)
    ? sentimental.sentiment_reasoning
    : [];

  const findFirstNonEmptyGroup = () => {
    if (!skills) return 0;

    for (let i = 0; i < skills.length; i++) {
      const callScores = skills[i]?.call_scores?.call_scores || {};
      if (Object.keys(callScores).length > 0) {
        return i; // return first index that has data
      }
    }

    return 0;
  };

  useEffect(() => {
    if (skills && skills.length > 0) {
      const index = findFirstNonEmptyGroup();
      setSelectedGroup(index.toString());
    }
  }, [skills]);

  const [showEditSection, setShowEditSection] = useState(false);

  const [showEditData, setShowEditData] = useState<number | null>(null);
  const [showGlobalData, setShowGlobalData] = useState<boolean>(false);
  const [showGlobalLoading, setGlobalLoading] = useState<boolean>(false);

  // Global replace fields
  const [globalState, setGlobalState] = useState({
    Wrong: "",
    Correct: "",
  });

  // Saved replaced items
  const [saveValue, setSaveValue] = useState<any[]>([]);

  const dropdownRef = useRef<any>(null);
  const modalRef = useRef<any>(null);

  const DataValid =
    globalState.Wrong.trim() !== "" && globalState.Correct.trim() !== "";

  // Add current Wrong + Correct to list
  const handleAddContent = (e: any) => {
    e.preventDefault();
    if (!DataValid) return;

    const newItem = {
      Wrong: globalState.Wrong,
      Correct: globalState.Correct,
    };

    setSaveValue((prev) => [...prev, newItem]);

    setGlobalState({ Wrong: "", Correct: "" });
  };

  // Delete item
  const deleteCurrentData = (index: number) => {
    setSaveValue((prev) => prev.filter((_, i) => i !== index));
  };

  // Edit item live update
  const UpdateCurrentData = (
    index: number,
    field: "Wrong" | "Correct",
    value: string,
  ) => {
    setSaveValue((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Submit API - FIXED: Now sends all data
  const SendCorrection = async () => {
    // Collect all valid pairs from saveValue
    const allValidPairs = saveValue.filter(
      (item) => item.Wrong.trim() !== "" && item.Correct.trim() !== "",
    );

    // Also include the current globalState if it's valid and not already in saveValue
    if (globalState.Wrong.trim() !== "" && globalState.Correct.trim() !== "") {
      const globalPair = {
        Wrong: globalState.Wrong,
        Correct: globalState.Correct,
      };

      // Check if this pair already exists in saveValue
      const alreadyExists = saveValue.some(
        (item) =>
          item.Wrong === globalState.Wrong &&
          item.Correct === globalState.Correct,
      );

      if (!alreadyExists) {
        allValidPairs.push(globalPair);
      }
    }

    if (allValidPairs.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one word pair to replace",
        variant: "error",
      });
      return;
    }

    const payload = {
      id: id,
      rewrite: allValidPairs.map((pair) => ({
        wrong_name: pair.Wrong,
        original_name: pair.Correct,
      })),
    };

    try {
      setGlobalLoading(true);
      const Response = await requestApi(
        "PATCH",
        `${tenant_id}/salesenablement/`,
        payload,
        "authService",
      );
      // console.log("resp",Response)
      toast({
        title: "Success",
        description: Response?.message || "Words replaced successfully..!",
        variant: "success",
      });

      setShowGlobalData(false);
      setGlobalState({
        Wrong: "",
        Correct: "",
      });
      setRefresh((prev: boolean) => !prev);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.message || "Failed to update words..!",
        variant: "error",
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  //  Close when clicking outside dropdown  modal
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        showEditData === 0
      ) {
        setShowEditData(null);
      }

      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        showGlobalData
      ) {
        setShowGlobalData(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEditData, showGlobalData]);

  // const [showEditSection ,setShowEditSection]=useState<boolean>(false);

  const ContitionOne = Boolean(scoreAnalysis?.field_mapping_data?.enable);
  const ContitionTwo = Boolean(scoreAnalysis?.callscore_flag);
  const ConditionThree = Boolean(
    Array.isArray(scoreAnalysis?.field_download_response) &&
    scoreAnalysis.field_download_response.length > 0,
  );

  const hasCallScore = callScoresArray?.some((item) => {
    const scores = item?.call_scores?.call_scores as
      | Record<string, CallScoreCategory>
      | undefined;

    if (!scores || Object.keys(scores).length === 0) return false;

    return Object.values(scores).some((category) =>
      Boolean(
        category &&
        (category.score !== undefined ||
          category.comment ||
          category.suggestions_for_improvement),
      ),
    );
  });

  // const formatDateTime = (isoString?: string) => {
  //   if (!isoString) return "";

  //   const date = new Date(isoString);

  //   return date.toLocaleString("en-IN", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value?: string, field?: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopiedField(field || null);

    setTimeout(() => setCopiedField(null), 1500);
  };
  return (
    <>
      <div
        className="w-full max-h-none h-full lg:h-[100vh] 
     flex flex-col lg:flex-row px-2 gap-2"
      >
        <div className="relative w-full lg:w-[70%]">
          <div className="flex justify-between items-center py-4 px-2 flex-wrap gap-3 relative">
            <div
              className="flex gap-1 cursor-pointer text-black font-semibold"
              onClick={handleBack}
            >
              <img src={KeyArrowBack} alt="Back" className="" />
              <span className="text-md text-[#0c51db]">Back</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {userInfo?.user_id === getCalls?.user_id && (
                <button
                  className="flex items-center bg-[rgb(45_47_146)] rounded-lg h-9 px-3 transition cursor-pointer text-white relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditData(showEditData === 0 ? null : 0);
                  }}
                >
                  Edit
                  {/* ARROW ROTATION */}
                  <span className="pl-2 ml-3 border-l-2 border-white flex items-center h-full">
                    <img
                      src={KeyArrow2}
                      alt="Dropdown"
                      className={`
              ml-1 h-[20px] w-[20px]
              transform transition-all duration-300
              ${showEditData === 0 ? "rotate-180" : "rotate-0"}
            `}
                    />
                  </span>
                  {showEditData === 0 && (
                    <div
                      ref={dropdownRef}
                      className="shadow-md rounded-md border border-gray-300 w-[180px] absolute top-10 md:-right-20 bg-white z-20"
                    >
                      <p
                        className="flex gap-1 justify-start font-sans text-black hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-md"
                        onClick={() => {
                          setShowEditSection(true);
                        }}
                      >
                        <img src={EditImg} alt="" className="mr-5" />
                        Edit Section
                      </p>

                      <p
                        className="flex gap-2 justify-start font-sans text-black hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-md"
                        onClick={() => {
                          setShowGlobalData(true);
                          setShowEditData(null);
                        }}
                      >
                        <img src={GlobalImg} alt="" />
                        Global Word Replace
                      </p>
                    </div>
                  )}
                  {/* GLOBAL REPLACE MODAL */}
                  {showGlobalData && (
                    <div
                      ref={modalRef}
                      className="absolute top-10 sm:-right-1 md:-right-[300px] bg-white border border-gray-300 shadow-lg w-[400px] max-w-[90vw] rounded-lg z-50 p-5"
                    >
                      <h5 className="font-bold text-lg text-start text-black m-0">
                        Global Word Replace
                      </h5>

                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-100 mt-3 p-4 rounded-lg">
                        <div className="w-full sm:w-[150px]">
                          <input
                            type="text"
                            placeholder="Wrong Word"
                            value={globalState.Wrong}
                            onChange={(e) =>
                              setGlobalState((prev) => ({
                                ...prev,
                                Wrong: e.target.value,
                              }))
                            }
                            className="border w-full outline-none border-indigo-300 rounded p-2 text-black"
                          />
                        </div>

                        <div className="transform sm:transform-none sm:rotate-90">
                          <img
                            src={ImportExport}
                            className="size-5 rotate-90"
                            alt=""
                          />
                        </div>

                        <div className="w-full sm:w-[150px]">
                          <input
                            type="text"
                            placeholder="Correct Word"
                            value={globalState.Correct}
                            onChange={(e) =>
                              setGlobalState((prev) => ({
                                ...prev,
                                Correct: e.target.value,
                              }))
                            }
                            className="border w-full outline-none border-indigo-300 rounded p-2 text-black"
                          />
                        </div>
                      </div>

                      {/* LIST OF ADDED ITEMS */}
                      <div className="max-h-[150px] overflow-y-auto mt-3">
                        {saveValue.map((p, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded mb-2 flex flex-col sm:flex-row gap-2 border"
                          >
                            <input
                              value={p.Wrong}
                              onChange={(e) =>
                                UpdateCurrentData(
                                  index,
                                  "Wrong",
                                  e.target.value,
                                )
                              }
                              className="border p-2 rounded w-full text-black"
                            />

                            <input
                              value={p.Correct}
                              onChange={(e) =>
                                UpdateCurrentData(
                                  index,
                                  "Correct",
                                  e.target.value,
                                )
                              }
                              className="border p-2 rounded w-full text-black"
                            />

                            <div className="flex justify-end sm:justify-start">
                              <img
                                onClick={() => deleteCurrentData(index)}
                                src={Delete}
                                alt="Delete"
                                className="cursor-pointer size-10"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ADD BTN */}
                      <div className="flex justify-end mt-2">
                        <button
                          disabled={!DataValid}
                          onClick={handleAddContent}
                          className={`flex gap-1 px-3 py-2 rounded text-white ${
                            DataValid
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-blue-300 cursor-not-allowed"
                          }`}
                        >
                          <img src={AddIcon} alt="Add" /> Add
                        </button>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
                        <button
                          onClick={() => setShowGlobalData(false)}
                          className="px-6 py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium border border-gray-300"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={SendCorrection}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          {showGlobalLoading ? "Changing..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </button>
              )}

              {userInfo?.user_id === getCalls?.user_id && (
                <AddBrain getCalls={getCalls} />
              )}

              <button
                className="flex items-center bg-[rgb(45_47_146)] rounded-lg h-9 px-3 transition cursor-pointer relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDataShare(showDataShare === 0 ? null : 0);
                }}
              >
                <span className="text-[#FFFFFF] text-md font-medium">
                  Share
                </span>

                <span className="pl-2 ml-3 border-l-2 border-white flex items-center h-full">
                  <img
                    src={KeyArrow2}
                    alt="Dropdown"
                    className={`
                      ml-1 h-[20px] w-[20px]
                      transform transition-all duration-300
                      ${showDataShare === 0 ? "rotate-180" : "rotate-0"}
                      `}
                  />
                </span>

                {showDataShare === 0 && (
                  <div
                    className="flex flex-col gap-1 bg-white shadow-md rounded-md p-1 w-[90px] items-start absolute top-10 right-0 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p
                      className="w-full text-sm hover:bg-gray-100 px-2 py-2 cursor-pointer rounded flex gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewExport((prev) => !prev);
                      }}
                    >
                      <img src={FileExport} alt="" className="size-5" /> Export
                    </p>

                    <p
                      className="w-full text-sm hover:bg-gray-100 px-2 py-2 cursor-pointer rounded flex gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewUser((prev) => !prev);
                      }}
                    >
                      <img
                        src={SendButton}
                        alt=""
                        className="transform rotate-310 size-5"
                      />{" "}
                      Share
                    </p>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-start items-start gap-1 px-7">
              <h1 className="text-lg font-medium text-gray-900 capitalize w-full pr-3 break-words">
                {getCalls?.ai_title ||
                  getCalls?.title ||
                  getCalls?.file_name ||
                  getCalls?.schedule?.name ||
                  "Unnamed Agent"}
              </h1>

              <div className="flex flex-wrap items-center gap-1 text-gray-700 text-[14px] max-w-full ">
                <img src={CalenderToday} alt="calendar" className="w-4 h-4" />

                <span className="text-[12px] mr-2 ">
                  <ISTTime
                    utcString={
                      selectedItem.schedule?.start ?? selectedItem.created ?? ""
                    }
                  />
                  {/* {formatDateTime(
                    selectedItem.schedule?.start ?? selectedItem.created ?? "",
                  )} */}
                </span>

                <button className="mr-2 text-xs line-clamp-1 rounded-full bg-blue-50 text-blue-700 py-0.5 px-2 border border-blue-100">
                  {selectedItem?.category || "NA"}
                </button>

                {IS_SHOW_AI_CREDITS && (
                  <span className="text-gray-600">
                    {selectedItem?.credits || 0}: AI Credits |
                    <span className="text-blue-600 cursor-pointer relative group ml-1">
                      Why?
                      <span
                        className="absolute top-8 left-1/2 -translate-x-1/2
                        bg-black text-white text-xs px-2 py-1 rounded-md
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-300
                        max-w-[220px] lg:min-w-[300px] text-center z-[999]"
                      >
                        AI credits are used when you consume your thunai LLM
                        Token, Meeting Summarization, voice calling, etc
                      </span>
                    </span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 h-6">
                {getCalls?.metadata?.agent && (
                <div className="flex items-center gap-2 text-xs rounded-full bg-blue-50 text-blue-700 py-1 px-3 border border-blue-100 relative">
                  <span className="font-medium text-blue-900">AgentID:</span>

                  <span className="text-blue-700 font-semibold">
                    {getCalls?.metadata?.agent ?? "NA"}
                  </span>

                  <button
                    onClick={() =>
                      handleCopy(getCalls?.metadata?.agent, "agent")
                    }
                    className="ml-1 hover:scale-110 transition-transform"
                  >
                    <img
                      src={CopyIcon}
                      alt="Copy"
                      className={`size-3 ${copiedField === "agent" ? "scale-125" : ""}`}
                    />
                  </button>

                  {copiedField === "agent" && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                      Copied!
                    </div>
                  )}
                </div>

                )}

                  {getCalls?.metadata?.phone && (
                <div className="flex items-center gap-2 text-xs rounded-full bg-blue-50 text-blue-700 py-1 px-3 border border-blue-100 relative">
                  <span className="font-medium text-blue-900">Phone:</span>

                  <span className="text-blue-700 font-semibold">
                    {getCalls?.metadata?.phone ?? "NA"}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(getCalls?.metadata?.phone, "phone")
                    }
                    className="ml-1 hover:scale-110 transition-transform"
                  >
                    <img
                      src={CopyIcon}
                      alt="Copy"
                      className={`size-3 ${copiedField === "phone" ? "scale-125" : ""}`}
                    />
                  </button>

                  {copiedField === "phone" && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                      Copied!
                    </div>
                  )}
                </div>
                  )}
              </div>
            </div>
            <div className="flex w-14 pt-5">
              {loading ? (
                <div className="ml-2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span
                  className=" border-2 border-gray-300 rounded-md p-2"
                  onClick={fetchData}
                >
                  <img
                    src={Reload}
                    className="text-[#030303] size-3 cursor-pointer "
                    alt="Reload"
                  />
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-1 px-4 text-sm md:text-md font-semibold border-b border-[#f5f6f7] pb-2">
            {["Summary", "Transcript"].map((value, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setActivesummary(value)}
                  className={`flex-1 sm:flex-none min-w-[90px] px-2 py-2 text-md text-[#181D27] flex items-center justify-center text-center capitalize font-medium transition-all duration-200 rounded-md cursor-pointer
         outline-none ${
           activeSummary === value
             ? " text-blue-600"
             : "text-gray-600 hover:text-gray-600"
         }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          {activeSummary == "Summary" && (
            <SummaryDetails
              // selectedItem={selectedItem}
              getCalls={getCalls}
              loading={loading}
            />
          )}
          {activeSummary == "Transcript" && (
            <TranScript
              sentimental={sentimental}
              onSelectTime={handleTranscriptClick}
            />
          )}

          <div className="">
            <div className="sticky  bottom-0 w-full lg:w-[100%] flex justify-center bg-white shadow-md z-50">
              {getCalls?.cloud_storage_file_path && (
                <AudioPlayer
                  filePath={getCalls.cloud_storage_file_path}
                  token={token}
                  startTime={range.start}
                  endTime={range.end}
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[30%] overflow-y-auto pt-3">
          <div className="bg-white border border-gray-200 px-2 h-[190px] mb-2 shadow-xl rounded-xl">
            <div className="flex justify-between items-center h-[45px] px-3 py-0.5 rounded-t-lg">
              <h1 className="text-[#181D27] font-semibold text-sm md:text-base">
                Sentiment Analysis
              </h1>
              <div className="flex gap-2 items-center text-blue-600 cursor-pointer text-sm border boreder-blue-300 rounded-sm p-1  ">
                {Array.isArray(SentimentArray) && SentimentArray.length > 0 && (
                  // <span
                  //   className="flex items-center text-sm md:text-md font-semibold text-[#2F45FF] h-[18px]"
                  //   onClick={() => setViewAnalysis((prev) => !prev)}
                  // >
                  //   View Analysis
                  // </span>

                  <img
                    src={ExPantIcon}
                    className="flex items-center text-sm md:text-md font-semibold text-[#2F45FF] h-[18px]"
                    onClick={() => setViewAnalysis((prev) => !prev)}
                    alt=""
                  />
                )}
              </div>
            </div>

            <div className="flex justify-around flex-wrap gap-2 py-5 mb-3">
              {[
                { value: negative, label: "Negative", color: "#ff0000" },
                { value: positive, label: "Positive", color: "#008000" },
                { value: neutral, label: "Neutral", color: "#ffa500" },
              ].map((item, i) => (
                <div key={i} className="w-[65px] h-[65px] text-center">
                  <CircularProgressbar
                    value={item.value}
                    text={`${item.value}%`}
                    styles={buildStyles({
                      textColor: item.color,
                      pathColor: item.color,
                      trailColor: "#e5e7eb",
                    })}
                  />
                  <h1 className="text-sm h-[18px] mt-2 font-medium text-[#181D27]">
                    {item.label}
                  </h1>
                </div>
              ))}
            </div>
          </div>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {loading ? (
              <LoadingComp height="320px" />
            ) : (
              <div>
                {scoreAnalysis?.callscore_flag ? (
                  <div className="flex flex-col gap-2 p-3 bg-white border border-gray-200 mb-2 shadow-2xl rounded-xl ">
                    <div className=" h-[45px] rounded-sm px-2 py-1 flex justify-between items-center ">
                      <h1 className="text-[#181D27] font-semibold text-sm md:text-base">
                        Call Score Analysis
                      </h1>

                      <div className="flex items-center gap-2">
                        <div className="w-[35px] h-[35px] text-center">
                          <CircularProgressbar
                            value={displayScore}
                            text={`${displayScore}%`}
                            styles={buildStyles({
                              textColor: "#2563eb",
                              pathColor: "#7A5AF9",
                              trailColor: "#e5e7eb",
                            })}
                          />
                        </div>
                        {hasCallScore && (
                          // <span
                          //   className="flex items-center text-sm md:text-md font-semibold text-[#2F45FF] h-[18px] cursor-pointer"
                          //   onClick={() => GoToCallScore(scoreAnalysis?.id)}
                          // >
                          //   View Analysis
                          // </span>
                          <div className="flex gap-2 items-center text-blue-600 cursor-pointer text-sm border boreder-blue-300 rounded-sm p-1  ">
                            <img
                              src={ExPantIcon}
                              className="flex items-center text-sm md:text-md font-semibold text-[#2F45FF] h-[18px]"
                              onClick={() => GoToCallScore(scoreAnalysis?.id)}
                              alt="ExPantIcon"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-2 m-0 sticky top-0 bg-white z-10">
                      <p className="text-xs font-medium text-gray-700 px-3 mb-2">
                        Select the parameter group
                      </p>
                      <select
                        className="ml-2 w-[100%] p-1  border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#7A5AF8] focus:border-transparent"
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        value={selectedGroup}
                      >
                        <option value="">Select Group</option>
                        {skills.map((skill, index) => (
                          <option key={index} value={index}>
                            {skill.params_group_name ||
                              `Unnamed Group ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {loading ? (
                      <div className="flex items-center justify-center h-[250px] bg-gray-50">
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7A5AF8] rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div>
                        {!skills || skills.length === 0 ? (
                          <div className="p-4 text-gray-400 text-sm text-center">
                            No score details available
                          </div>
                        ) : (
                          (() => {
                            const selectedIndex = parseInt(selectedGroup);
                            const selectedSkill = skills[selectedIndex];
                            const callScores: Record<string, ScoreDetail> =
                              selectedSkill?.call_scores?.call_scores || {};
                            if (Object.keys(callScores).length === 0) {
                              return (
                                <div className="p-4 flex items-center justify-center h-[50px] text-gray-400 text-sm text-center">
                                  No scores available for this parameter set
                                </div>
                              );
                            }

                            return (
                              <>
                                {/* Header & Group Selector */}
                                <div className="h-[200px] relative overflow-y-scroll scrollbar-thin">
                                  {/* Score Details */}
                                  <div className="space-y-1 sm:p-3 p-1">
                                    {Object.entries(callScores).map(
                                      ([key, value], index) => {
                                        const skill = value as {
                                          max_score?: number;
                                          score?: number;
                                          comment?: string;
                                          sub_metrics?: {
                                            name?: string;
                                            max_score?: number;
                                            score?: number;
                                            comment?: string;
                                          }[];
                                        };

                                        return (
                                          <div
                                            key={index}
                                            className="flex flex-col gap-2 p-2"
                                          >
                                            {/* MAIN METRIC */}
                                            <h5 className="text-xs font-semibold text-gray-800">
                                              {key}
                                            </h5>

                                            <div className="flex items-center gap-2 sm:gap-3">
                                              <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                                                <div
                                                  className="bg-[#7A5AF8] h-full rounded-full transition-all duration-500"
                                                  style={{
                                                    width: `${
                                                      ((skill.score ?? 0) /
                                                        (skill.max_score ||
                                                          1)) *
                                                      100
                                                    }%`,
                                                  }}
                                                />
                                              </div>
                                              <div>
                                                <span className="text-[#7A5AF8] font-semibold text-xs sm:text-sm min-w-[20px]">
                                                  {skill.score ?? 0} /
                                                </span>
                                                <span className="font-semibold text-xs sm:text-sm min-w-[20px] text-right text-[#7A5AF8]">
                                                  {skill.max_score ?? 0}
                                                </span>
                                              </div>
                                            </div>

                                            {/* MAIN COMMENT */}
                                            {skill.comment &&
                                              skill.comment !== "0" && (
                                                <div className="flex items-start gap-1 text-xs text-gray-500 italic">
                                                  <img
                                                    src={StarBorder}
                                                    alt="Comment"
                                                    className="size-4 mt-0.5"
                                                  />
                                                  <span className="break-words">
                                                    {skill.comment}
                                                  </span>
                                                </div>
                                              )}

                                            {/* SUB METRICS */}
                                            {skill.sub_metrics &&
                                              skill.sub_metrics.length > 0 && (
                                                <div className="ml-4 mt-1 border-l-2 border-[#E0E7FF] pl-3 space-y-2">
                                                  {skill.sub_metrics.map(
                                                    (sub, subIndex) => (
                                                      <div
                                                        key={subIndex}
                                                        className="flex flex-col gap-1"
                                                      >
                                                        <h6 className="text-xs font-medium text-gray-700">
                                                          {sub.name ||
                                                            `Sub Metric ${subIndex + 1}`}
                                                        </h6>

                                                        <div className="flex items-center gap-2">
                                                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                              className="bg-[#7A5AF8] h-full rounded-full transition-all duration-500"
                                                              style={{
                                                                width: `${
                                                                  ((sub.score ??
                                                                    0) /
                                                                    (sub.max_score ||
                                                                      1)) *
                                                                  100
                                                                }%`,
                                                              }}
                                                            />
                                                          </div>

                                                          <div>
                                                            <span className="text-[#7A5AF8] text-xs font-semibold min-w-[20px]">
                                                              {sub.score ?? 0} /
                                                            </span>

                                                            <span className="text-xs font-semibold min-w-[20px] text-right text-[#7A5AF8]">
                                                              {sub.max_score ??
                                                                0}
                                                            </span>
                                                          </div>
                                                        </div>

                                                        {/* Instruction */}
                                                        {sub.comment &&
                                                          sub.comment !==
                                                            "0" && (
                                                            <div className="flex items-start gap-1 text-xs text-gray-500 italic">
                                                              <img
                                                                src={StarBorder}
                                                                alt="Instruction"
                                                                className="size-4 mt-0.5"
                                                              />
                                                              <span className="break-words">
                                                                {sub.comment}
                                                              </span>
                                                            </div>
                                                          )}
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </ErrorBoundary>

          {ContitionOne && ContitionTwo && ConditionThree && (
            <div>
              {loading ? (
                <LoadingComp height="150px" />
              ) : (
                <div>
                  <KeyData scoreAnalysis={scoreAnalysis} />
                </div>
              )}
            </div>
          )}

          {loading ? (
            <LoadingComp height="400px" />
          ) : (
            <div className=" relative bg-white border border-gray-300 px-2 mb-3 shadow-xl rounded-lg ">
              <div>
                <div className="bg-white rounded-md shadow">
                  <div className="flex justify-between items-center my-2 h-[45px] px-3 py-1 rounded-sm sticky top-0 z-10 bg-white">
                    <h4 className="cursor-pointer text-[#181D27] font-semibold text-sm md:text-base">
                      Participants
                    </h4>

                    <div className="relative group">
                      {activeParticipant !== "Joined_Participants" && (
                        <img
                          src={AddBlue}
                          alt="Add Participant"
                          className="size-6 cursor-pointer"
                          onClick={() => setShowAddParticipant(true)}
                        />
                      )}

                      <span className="absolute -top-10 left-1/1.5 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Add Invited <br /> Participants
                      </span>
                    </div>
                  </div>
                  {
                    <>
                      <div className="flex gap-2 px-2">
                        {[
                          {
                            key: "Invited_Participant",
                            label: "Invited Participants",
                            count: invitedParticipants.length,
                          },
                          {
                            key: "Joined_Participants",
                            label: "Joined Participants",
                            count: joinedParticipants.length,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveParticipant(tab.key)}
                            className={`
            flex-1 flex items-center justify-between
            px-3 py-2 rounded-md text-sm font-medium transition-all
            ${
              activeParticipant === tab.key
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
                          >
                            <span className="cursor-pointer">{tab.label}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({tab.count})
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Joined Participants List */}
                      {activeParticipant === "Joined_Participants" && (
                        <div className="flex flex-col gap-1 border border-gray-100 rounded-lg p-2 bg-gray-50 overflow-y-auto mt-2">
                          {joinedParticipants.length === 0 ? (
                            <div className="p-3 text-gray-400 text-sm text-center">
                              No participants
                            </div>
                          ) : (
                            joinedParticipants?.map((name: any, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center px-3 py-2 rounded-md bg-white hover:bg-gray-200"
                              >
                                <span className="text-[13px] text-gray-700">
                                  {name?.fullName || name?.displayName || name}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeParticipant === "Invited_Participant" && (
                        <div className="flex flex-col gap-1 border border-gray-100 rounded-lg p-2 bg-gray-50 overflow-y-auto mt-2 ">
                          {invitedParticipants.length === 0 ? (
                            <div className="p-3 text-gray-400 text-sm text-center">
                              No participants
                            </div>
                          ) : (
                            invitedParticipants.map((p, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center px-3 py-2 rounded-md bg-white hover:bg-gray-200"
                              >
                                <span className="text-[13px] text-gray-700">
                                  {p?.email}
                                </span>
                                <button className="text-red-500 hover:text-red-700">
                                  <img
                                    src={DeleteImg}
                                    onClick={() => openConfirmDelete(p.email)}
                                    alt=""
                                    className="size-4"
                                  />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  }
                </div>

                {showAddParticipant && (
                  <div
                    className="absolute top-0 left-0 w-full p-4
      bg-white border border-gray-300 shadow-lg rounded-lg z-50"
                  >
                    <h4 className="text-base sm:text-lg font-semibold sm:mb-1 text-[#181D27]">
                      Add Participant
                    </h4>

                    <form onSubmit={handleAddParticipant}>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 p-1 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="w-full">
                          <label className="text-sm sm:text-base font-medium text-gray-700 mb-1 block">
                            Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-indigo-300 rounded-md p-2 sm:p-1.5 w-full text-sm sm:text-base focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="Enter name"
                          />
                        </div>

                        <div className="w-full">
                          <label className="text-sm sm:text-base font-medium text-gray-700 mb-1 block">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-indigo-300 rounded-md p-2 sm:p-1.5 w-full text-sm sm:text-base focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="Enter email"
                          />
                        </div>
                      </div>

                    
                      <div
                        className={`max-h-[150px] sm:max-h-[150px] overflow-y-auto mt-3 ${participants.length >= 2 ? "scrollbar-thin scrollbar-thumb-gray-400" : ""}`}
                      >
                        {participants.map((p, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-center p-2 bg-gray-50 border border-gray-300 rounded-lg">
                              <div className="w-full">
                                <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={p.name}
                                  onChange={(e) =>
                                    updateParticipant(
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="border border-indigo-300 rounded-md p-2 sm:p-1.5 w-full text-sm sm:text-base bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                  placeholder="Name"
                                />
                              </div>

                              <div className="w-full">
                                <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={p.email}
                                  onChange={(e) =>
                                    updateParticipant(
                                      index,
                                      "email",
                                      e.target.value,
                                    )
                                  }
                                  className="border border-indigo-300 rounded-md p-2 sm:p-1.5 w-full text-sm sm:text-base bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                  placeholder="Email"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => deleteParticipant(index)}
                                className="p-1.5 sm:p-1 self-end sm:self-center hover:bg-red-50 rounded-md transition-colors"
                                aria-label="Delete participant"
                              >
                                <img
                                  src={DeleteImg}
                                  alt="delete"
                                  className="size-10 pt-5 cursor-pointer"
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

    
                      <div className="flex justify-end p-1">
                        <button
                          disabled={!formValid}
                          type="submit"
                          className={`p-2 rounded-md text-white text-sm sm:text-[15px] flex items-center justify-center gap-1 sm:gap-2 min-w-[120px]
            ${formValid ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed"}`}
                        >
                          <img
                            src={AddBtn}
                            alt="add"
                            className="w-4 h-4 sm:w-4 sm:h-4"
                          />
                          <span>Add New</span>
                        </button>
                      </div>
                    </form>

      
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 border-t pt-4">
                      <button
                        onClick={CancelInviteUi}
                        className="bg-gray-200 hover:bg-gray-300 p-2.5 sm:p-2.5 rounded-md text-sm sm:text-[15px] text-gray-700 font-medium transition-colors order-2 sm:order-1"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSubmitApi}
                        disabled={
                          participants.length === 0 &&
                          (name.trim() === "" || email.trim() === "")
                        }
                        className={`bg-blue-600 hover:bg-blue-700 p-2.5 sm:p-2.5 rounded-md text-sm sm:text-[15px] text-white font-medium transition-colors order-1 sm:order-2
                   ${participants.length === 0 && (name.trim() === "" || email.trim() === "") ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {invitedLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {viewAnalysis && (
        <ViewAnalysis sentimental={sentimental} onClose={onClose} />
      )}

      {viewUser && (
        <ShareExport
          selectedItem={selectedItem}
          CancelShareData={CancelShareData}
        />
      )}

      {viewExport && (
        <ExportDocument
          CancelExportData={CancelExportData}
          sentimental={sentimental}
          selectedItem={selectedItem}
          getCalls={getCalls}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[calc(100vw-850px)] h-[calc(100vh-400px)] text-start">
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

      {showEditSection && (
        <EditSection
          getCalls={getCalls}
          setShowEditSection={setShowEditSection}
          setRefresh={setRefresh}
        />
      )}
    </>
  );
};

export default CallDetails;
