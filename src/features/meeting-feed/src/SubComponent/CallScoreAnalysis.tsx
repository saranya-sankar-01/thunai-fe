import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdStars } from "react-icons/md";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import TeamMeet from "../assets/image/teams.png";
import GoogleMeet from "../assets/image/meet.png";
import ZoomMeet from "../assets/image/zoom-icone-svg-150px.png";
import Superviser from "../assets/image/supervisor_account.png";

import KeyArrow2 from "../assets/svg/Keyboard_arrow.svg";

import Insight from "../assets/svg/Insights.svg";
import Close from "../assets/svg/Close.svg";
import BackArrow from "../assets/svg/Arrow_back.svg";
import CalenderToday from "../assets/svg/Calender_today.svg";

const CallScoreAnalysis = () => {
  const location = useLocation();
  const { skills, scoreAnalysis, displayScore, selectedIndex } = location.state;
  const [value, setValue] = useState<any>({});
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [Suggestion, setSuggestion] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [motivationText, setMotivationText] = useState<any>();

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubMetric, setSelectedSubMetric] = useState<any>(null);

  const navigate = useNavigate();

  const [selectedGroup, setSelectedGroup] = useState("0");

  useEffect(() => {
    if (skills && skills.length > 0) {
      if (selectedIndex !== undefined && selectedIndex !== null) {
        setSelectedGroup(selectedIndex.toString());
      } else {
        const index = findFirstNonEmptyGroup();
        setSelectedGroup(index.toString());
      }
    }
  }, [skills, selectedIndex]);

  const findFirstNonEmptyGroup = () => {
    if (!skills) return 0;

    for (let i = 0; i < skills.length; i++) {
      const callScores = skills[i]?.call_scores?.call_scores || {};
      if (Object.keys(callScores).length > 0) {
        return i;
      }
    }
    return 0;
  };

  useEffect(() => {
    if (scoreAnalysis) setValue(scoreAnalysis);
  }, [scoreAnalysis]);

  const handleBack = () => navigate(-1);

  const getPlatformImage = (platform: string) => {
    const key = platform?.toLowerCase();
    if (key === "gmeet") return GoogleMeet;
    if (key === "teams") return TeamMeet;
    if (key === "zoom") return ZoomMeet;
    if (key === "no data") return Superviser;
    return null;
  };

  const currentGroup = (skills && skills[selectedGroup]) || {};
  const currentCallScores = currentGroup?.call_scores?.call_scores || {};
  // console.log("currentGroup==>",currentGroup)
  // console.log("currentCallScores==>", currentCallScores);

  const score = selectedCategory?.data?.score ?? 0;
  const maxScore = selectedCategory?.data?.max_score ?? 0;
  const showMotivation = score === maxScore && score !== 0;

  const RouteToSuggestion = (
    categoryTitle: string,
    categoryData: any,
    subMetricData?: any,
  ) => {
    if (subMetricData) {
      setSelectedSubMetric({
        title: subMetricData.name || categoryTitle,
        data: subMetricData,
        parentTitle: categoryTitle,
        suggestions: subMetricData?.suggestions_for_improvement || [],
      });
    } else {
      setSelectedCategory({
        title: categoryTitle,
        data: categoryData,
        suggestions: categoryData?.suggestions_for_improvement || [],
      });
      setSelectedSubMetric(null);
    }

    setCurrentIndex(0);
    setShowRightPanel(true);

    const motivationalMessages = [
      "Excellent work! You scored {score}/{total}. Keep going!",
      "Amazing! Perfect score {score}/{total}. You're unstoppable!",
      "Fantastic job! You hit {score}/{total}. Great performance!",
      "Superb! You achieved {score}/{total}. Keep shining!",
      "Outstanding! {score}/{total} — you're doing great!",
    ];

    const currentScore = subMetricData?.score || categoryData?.score || 0;
    const currentMaxScore =
      subMetricData?.max_score || categoryData?.max_score || 0;

    if (currentScore === currentMaxScore && currentScore !== 0) {
      const randomMsg = motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ]
        .replace("{score}", currentScore.toString())
        .replace("{total}", currentMaxScore.toString());

      setMotivationText(randomMsg);
    } else {
      setMotivationText("");
    }
  };

  const renderSubMetrics = (subMetrics: any[], parentMaxScore: any) => {
    if (!subMetrics || subMetrics.length === 0) return null;

    return (
      <div className="ml-6 mt-3 space-y-4">
        <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <span>Sub-metrics</span>
          <span className="text-xs font-normal text-gray-500">
            ({subMetrics.length})
          </span>
        </h4>
        {subMetrics.map((subMetric: any, index: number) => (
          <div
            key={index}
            className="border-l-2 border-blue-200 pl-4 py-2 hover:bg-blue-50/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {subMetric.name}
                  </span>
                  {subMetric?.suggestions_for_improvement?.length > 0 && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        RouteToSuggestion(subMetric.name, null, subMetric);
                      }}
                    >
                      <img src={Insight} alt="Insight" className="h-3 w-3" />
                      <span>View Insight</span>
                    </button>
                  )}
                </div>
                {subMetric?.comment && (
                  <p className="text-xs text-gray-500 mt-1">
                    {subMetric.comment}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end ml-4">
                <span className="text-xs font-semibold">
                  <span
                    className={
                      subMetric.score === parentMaxScore && subMetric.score > 0
                        ? "text-green-600"
                        : "text-blue-600"
                    }
                  >
                    {subMetric?.score || 0}
                  </span>
                  <span className="text-gray-400">
                    /{subMetric?.max_score || 0}
                  </span>
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-[4px] rounded-full mt-2">
              <div
                className={`h-[4px] rounded-full transition-all duration-500 ${
                  subMetric.score === parentMaxScore && subMetric.score > 0
                    ? "bg-green-500"
                    : "bg-blue-400"
                }`}
                style={{
                  width:
                    parentMaxScore === 0
                      ? 0
                      : `${((subMetric?.score || 0) / (subMetric?.max_score || 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const activeItem = selectedSubMetric || selectedCategory;

  return (
    <div
      className={`flex flex-col lg:flex-row h-full md:h-[100vh] overflow-hidden transition-all duration-500 px-4 md:px-10`}
    >
      <div
        className={`transition-all duration-500 ${
          showRightPanel ? "lg:w-[70%]" : "w-full"
        } overflow-y-auto px-5 sm:px-8 py-5`}
      >
        <div
          className="flex gap-0.5 cursor-pointer text-black font-semibold pb-6"
          onClick={handleBack}
        >
          <img src={BackArrow} className="size-4 mt-1" alt="Back" />
          <span className="text-md text-[#0c51db]">Back</span>
        </div>

        <div className="flex flex-col border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold">
            {value?.title || "No Title"}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
            <p className="flex items-center gap-1">
              <img src={CalenderToday} alt="Calendar" />
              {value?.meeting_date
                ? new Date(value.meeting_date)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase()
                : "No Date"}
            </p>
            {getPlatformImage(value?.schedule?.platform) && (
              <img
                src={getPlatformImage(value?.schedule?.platform)!}
                alt={value.title ?? ""}
                width={20}
                height={20}
              />
            )}
            <span className="text-gray-600">
              {value?.credits || 0} AI Credits |
              <span className="text-blue-600 cursor-pointer relative group">
                Why?
                <span
                  className="absolute -top-8 left-1/2 -translate-x-1/10 bg-black text-white text-xs px-2 py-1 rounded-md 
                     opacity-0 group-hover:opacity-100 pointer-events-none 
                     transition-opacity duration-300 whitespace-nowrap"
                >
                  AI credits are used when you consume your <br /> thunai LLM
                  Token, Meeting Summarization, <br /> voice calling, etc
                </span>
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:justify-between lg:items-center mt-4 border-b border-gray-200 pb-1">
          <div className="flex flex-col md:flex-row gap-3 mt-1 px-4 text-sm md:text-md font-semibold w-[100%] md:w-[60%]">
            <button
              className={`flex-1 sm:flex-none w-[150px] h-[50px] px-2 text-md text-[#181D27] flex items-center
                     justify-center text-center capitalize font-medium transition-all duration-200 border-2
                      border-gray-300 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-text`}
            >
              Detailed Call Analysis
            </button>
            <div className="px-2 m-0 sticky top-0 bg-white z-10 w-full">
              <div className="flex">
                <span className="text-xs font-medium text-gray-700 px-3">
                  Select Parameter Group
                </span>
              </div>
              <select
                className="ml-2 w-[100%] p-2 border-2 rounded-sm border-gray-300 text-xs text-gray-500 mt-1 
                focus:outline-none focus:ring-1 focus:ring-[#7A5AF8] focus:border-transparent cursor-pointer"
                onChange={(e) => setSelectedGroup(e.target.value)}
                value={selectedGroup}
              >
                <option value="">Select Group</option>
                {skills?.map((skill: any, index: number) => (
                  <option key={skill.id || index} value={index}>
                    {skill.params_group_name || `Unnamed Group ${index + 1}`}
                    {skill.total_scores !== undefined &&
                      ` (${skill.total_scores}%)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[66px] h-[66px] mt-5 md:mt-0">
              <CircularProgressbar
                value={currentGroup?.total_scores || displayScore || 0}
                text={`${currentGroup?.total_scores || displayScore || 0}%`}
                styles={buildStyles({
                  textColor: "black",
                  pathColor: "green",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>
            <p className="text-gray-700 font-medium">
              {currentGroup?.params_group_name || "Overall"} Performance Score
            </p>
          </div>
        </div>

        <div className="px-10 py-3 mt-6 border border-gray-200 rounded-[8px] shadow-sm overflow-y-scroll overflow-x-hidden h-full lg:h-[calc(100vh-265px)] scrollbar-thin">
          {Object.keys(currentCallScores).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Analysis Data Available
              </h3>
              <p className="text-gray-500">
                This parameter group has no analysis data.
              </p>
            </div>
          ) : (
            Object.entries(currentCallScores).map(
              ([skillName, skillData]: [string, any], idx) => (
                <div key={idx} className="pb-5 mt-5 border-b-2 border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h1 className="font-semibold text-gray-800 text-md">
                        {skillName}
                      </h1>
                      {skillData?.comment && (
                        <p className="text-xs text-gray-500 mt-1">
                          {skillData.comment}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {skillData?.suggestions_for_improvement?.length > 0 && (
                        <div
                          className="border border-gray-400 text-sm rounded-xl py-2 px-5 font-medium flex items-center gap-2 hover:bg-gray-100 transition cursor-pointer"
                          onClick={() =>
                            RouteToSuggestion(skillName, skillData)
                          }
                        >
                          <div className="flex items-center gap-1">
                            <img
                              src={Insight}
                              alt="Insight"
                              className="h-5 w-5"
                            />
                            <span className="text-[#181D27] truncate text-sm sm:text-base pr-2">
                              Insight
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-3">
                    <div className="flex flex-col gap-2 w-full sm:w-[80%]">
                      <button className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-2xl px-2 py-1 w-[120px] flex items-center gap-1 cursor-text">
                        <MdStars className="size-5" /> AI Analysis
                      </button>

                      <p className="text-gray-600 text-sm">
                        {skillData?.comment || "No comment available"}
                      </p>

                      {skillData?.sub_metrics &&
                        renderSubMetrics(
                          skillData.sub_metrics,
                          skillData?.max_score,
                        )}
                    </div>

                    <div className="flex flex-col gap-2 items-start sm:items-end sm:w-[20%]">
                      <p className="text-sm text-gray-700">
                        Score:{" "}
                        <span
                          className={`font-semibold ${
                            skillData?.score === skillData?.max_score &&
                            skillData?.score > 0
                              ? "text-green-600"
                              : "text-blue-500"
                          }`}
                        >
                          {skillData?.score || 0}/{skillData?.max_score || 0}
                        </span>
                      </p>

                      <div className="w-full bg-gray-200 h-[8px] rounded-full">
                        <div
                          className={`h-[8px] rounded-full transition-all duration-500 ${
                            skillData?.score === skillData?.max_score &&
                            skillData?.score > 0
                              ? "bg-green-500"
                              : "bg-[#7A5AF8]"
                          }`}
                          style={{
                            width: `${
                              skillData?.max_score === 0
                                ? 0
                                : Math.min(
                                    ((skillData?.score || 0) /
                                      (skillData?.max_score || 1)) *
                                      100,
                                    100,
                                  )
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    {skillData?.brain_compliance &&
                      Object.keys(skillData.brain_compliance).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span>Brain Compliance Analysis</span>
                          </h4>

                          {skillData?.brain_compliance && (
                            <div className="mt-4 p-3 border rounded bg-gray-50">
                              {skillData.brain_compliance.not_followed?.length >
                                0 && (
                                <>
                                  <p className="text-sm font-semibold text-red-600 mt-2">
                                    Not Followed
                                  </p>
                                  {skillData.brain_compliance.not_followed.map(
                                    (text: string, i: number) => (
                                      <p
                                        key={i}
                                        className="text-sm text-gray-700"
                                      >
                                        • {text}
                                      </p>
                                    ),
                                  )}
                                </>
                              )}

                              {skillData.brain_compliance.followed?.length >
                                0 && (
                                <>
                                  <p className="text-sm font-semibold text-green-600 mt-2">
                                    Followed
                                  </p>
                                  {skillData.brain_compliance.followed.map(
                                    (text: string, i: number) => (
                                      <p
                                        key={i}
                                        className="text-sm text-gray-700"
                                      >
                                        • {text}
                                      </p>
                                    ),
                                  )}
                                </>
                              )}

                              {skillData.brain_compliance.sources?.length >
                                0 && (
                                <>
                                  <p className="text-sm font-semibold text-blue-600 mt-3">
                                    Source
                                  </p>
                                  {skillData.brain_compliance.sources.map(
                                    (text: string, i: number) => (
                                      <p
                                        key={i}
                                        className="text-sm text-gray-700 italic"
                                      >
                                        • {text}
                                      </p>
                                    ),
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>

      {showRightPanel && activeItem && (
        <div className="w-full lg:w-[40%] border-l border-gray-200 bg-white flex flex-col transition-all duration-500">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h1 className="font-bold">Call Analysis</h1>
            <img
              src={Close}
              alt="Close"
              className="size-6 p-1 rounded-2xl hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setShowRightPanel(false);
                setSelectedSubMetric(null);
                setSelectedCategory(null);
              }}
            />
          </div>

          <div className="p-3 h-[90vh] overflow-y-scroll">
            <div className="flex justify-between items-center border-b border-gray-300 py-2">
              <div>
                {selectedSubMetric?.parentTitle && (
                  <span className="text-xs text-gray-500 block">
                    {selectedSubMetric.parentTitle} /
                  </span>
                )}
                <h4 className="text-blue-500 font-semibold">
                  {activeItem.title}
                </h4>
              </div>
              <p>
                <span
                  className={`font-semibold ${
                    activeItem.data?.score === activeItem.data?.max_score &&
                    activeItem.data?.score > 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {activeItem.data?.score || 0}
                </span>
                <span className="text-gray-600">
                  /{activeItem.data?.max_score || 0}
                </span>
              </p>
            </div>

            {activeItem.data?.comment && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-700 mb-1">Analysis</h4>
                <p className="text-sm text-gray-600">
                  {activeItem.data.comment}
                </p>
              </div>
            )}

            {selectedCategory?.data?.sub_metrics &&
              selectedCategory.data.sub_metrics.length > 0 &&
              !selectedSubMetric && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center justify-between">
                    <span>Sub-metrics</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {selectedCategory.data.sub_metrics.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {selectedCategory.data.sub_metrics.map(
                      (subMetric: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 border border-gray-200 rounded-md hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={() =>
                            RouteToSuggestion(subMetric.name, null, subMetric)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {subMetric.name}
                            </span>
                            <span className="text-xs">
                              <span
                                className={
                                  subMetric.score ===
                                    selectedCategory.data.max_score &&
                                  subMetric.score > 0
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }
                              >
                              {subMetric?.score || 0}
                              </span>
                              / {subMetric?.max_score || 0}
                            </span>
                          </div>
                          {subMetric.comment && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {subMetric.comment}
                            </p>
                          )}
                          {subMetric?.suggestions_for_improvement?.length >
                            0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                              <img
                                src={Insight}
                                alt="Insight"
                                className="h-3 w-3"
                              />
                              <span>Click to view suggestions</span>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            <div
              className={`flex justify-start items-center gap-2 h-[50px] p-3 mt-3 
                bg-[#E8F1FF] rounded-md 
                ${showMotivation ? "cursor-default" : "cursor-pointer"}`}
              onClick={() => {
                if (!showMotivation && activeItem?.suggestions?.length > 0) {
                  setSuggestion((prev) => !prev);
                }
              }}
            >
              <h4 className="font-semibold">Improvement Suggestions</h4>

              {!showMotivation && activeItem?.suggestions?.length > 0 && (
                <img
                  src={KeyArrow2}
                  alt=""
                  className={`h-[20px] w-[20px] rounded-2xl bg-blue-600 transition-transform duration-300 ${
                    Suggestion ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {(Suggestion || showMotivation) && (
              <div className="p-3 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 scrollbar-thin max-h-[400px] overflow-y-auto">
                {showMotivation ? (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded shadow">
                    <h4 className="text-green-700 font-semibold mb-2">
                      Great Work!
                    </h4>
                    <p className="text-green-800 text-sm">{motivationText}</p>
                  </div>
                ) : (
                  <>
                    {score === 0 && maxScore === 0 && (
                      <p className="text-blue-700 font-medium">
                        No performance recorded — here are some suggestions to
                        get started!
                      </p>
                    )}

                    {!activeItem?.suggestions?.length ? (
                      <p className="text-gray-500">No suggestions available</p>
                    ) : (
                      <>
                        <div className="bg-red-50 border-l-4 border-red-300 p-3 rounded">
                          <h5 className="font-semibold text-red-600 mb-1">
                            Original
                          </h5>
                          <p className="text-sm text-red-800 italic">
                            {
                              activeItem.suggestions[currentIndex]
                                ?.original_transcript_quote
                            }
                          </p>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-300 p-3 rounded">
                          <h5 className="font-semibold text-green-600 mb-1">
                            Improved
                          </h5>
                          <p className="text-sm text-green-800 italic">
                            {
                              activeItem.suggestions[currentIndex]
                                ?.improved_version
                            }
                          </p>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded">
                          <h5 className="font-semibold text-blue-600 mb-1">
                            How to Improve
                          </h5>
                          <p className="text-sm text-blue-800 italic">
                            {
                              activeItem.suggestions[currentIndex]
                                ?.how_to_improve
                            }
                          </p>
                        </div>

                        {activeItem.suggestions.length > 1 && (
                          <div className="flex justify-between items-center mt-4">
                            <button
                              className="px-3 py-1 bg-gray-200 rounded-md text-sm disabled:opacity-50"
                              onClick={() =>
                                setCurrentIndex((prev) => Math.max(0, prev - 1))
                              }
                              disabled={currentIndex === 0}
                            >
                              Previous
                            </button>
                            <span className="text-xs text-gray-600">
                              {currentIndex + 1} of{" "}
                              {activeItem.suggestions.length}
                            </span>
                            <button
                              className="px-3 py-1 bg-gray-200 rounded-md text-sm disabled:opacity-50"
                              onClick={() =>
                                setCurrentIndex((prev) =>
                                  Math.min(
                                    activeItem.suggestions.length - 1,
                                    prev + 1,
                                  ),
                                )
                              }
                              disabled={
                                currentIndex ===
                                activeItem.suggestions.length - 1
                              }
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallScoreAnalysis;
