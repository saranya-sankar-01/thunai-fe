import { useState, forwardRef, useImperativeHandle } from "react";
import { getLocalStorageItem } from "../Service/MeetingService";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import { requestApi } from "../Service/MeetingService";

import axios from "axios";

// const url = new URL(window.location.href);

import Schedule from "../assets/svg/Schedule.svg";
import ThunaiLogo from "../assets/svg/Thunai_LogoLight.svg";
import DownArrow from "../assets/svg/Keyboard_arrow_down1.svg";
import Timer from "../assets/svg/Timer.svg";

interface CallScoreExportProps {
  selectedItem: any;
  sentimental: any;
  getCalls?: any;
  CancelExportData?: () => void;
}

const CallScoreExport = forwardRef<any, CallScoreExportProps>(
  ({ selectedItem, sentimental, getCalls }, ref) => {
    const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
    const [showSummary, setShowSummary] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(true);

    const [showChapters, setShowChapters] = useState<boolean>(true);
    const [showActionItems, setShowActionItems] = useState<boolean>(true);
    const [shownextSteps, setShownextSteps] = useState<boolean>(true);

    const [transcript, setTranscript] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [downloadUrl] = useState<string | null>(null);

    // const id = selectedItem?.id;
    const chapters = getCalls?.chapters_and_topics || [];
    const actionItems = getCalls?.action_items || [];
    const nextSteps = getCalls?.next_steps || [];
    const transcripts = sentimental?.transcription_with_timing || [];

    // API Call - FIXED VERSION
   const SendCallScoreData = async () => {
      setLoading(true);
      try {
        if (!tenant_id) {
          throw new Error("Tenant ID not found");
        }

        const payload = {
          id: selectedItem?.id,
          show_transcript: transcript,
          template: "call_scoring",
          template_data: {
            summary: selectedItem?.summary,
            chapters_and_topics: chapters,
            action_items: actionItems,
            next_steps: nextSteps,
            transcription: transcripts,
          },
        };
            const response = await axios.post(
  `https://api.thunai.ai/auth-service/ai/api/v1/${tenant_id}/generate-meeting-report/`,
  payload,
  {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${userInfo?.access_token || ""}`,
      "x-csrftoken": userInfo?.csrf_token || localStorage.getItem("csrf_token") ||"",
    },
  }
);

if (response.data.size === 0) {
  throw new Error("Empty PDF received");
}

const url = window.URL.createObjectURL(response.data);
const a = document.createElement("a");
a.href = url;
a.download = `call-score-report-${selectedItem?.id || "report"}.pdf`;
document.body.appendChild(a);
a.click();
a.remove();
window.URL.revokeObjectURL(url);

return {
  success: true,
  message: "Report downloaded successfully",
};
      } catch (error: any) {
        console.error("PDF generation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      SendCallScoreData,
      loading,
    }));

    return (
      <div className="pb-10">
        <p className="font-medium">
          Call Score Analysis{" "}
          <span className="text-gray-500 text-sm">(ORIGINAL DATA)</span>
        </p>

        <div className="border border-blue-200 rounded-md p-3 py-4 px-5">
          <h2 className="font-semibold text-md mb-2 text-gray-800 flex items-center">{getCalls?.title}</h2>
        </div>

        <div className="flex justify-end p-4">
          <img src={ThunaiLogo} className="h-[40px] pr-4" alt="logo" />
        </div>

        <div className="h-auto bg-blue-50 border border-blue-300 rounded-[12px] px-5 py-7 mt-4">
          <div className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-blue-800">Summary</span>
            <img
              src={DownArrow}
              alt="toggle"
              className={`size-6 transform transition-transform duration-300 ${
                showSummary ? "rotate-180" : "rotate-0"
              }`}
              onClick={() => setShowSummary((prev) => !prev)}
            />
          </div>
          {showSummary && (
            <div className="mt-2 text-gray-700 text-sm">
              {getCalls?.summary}
            </div>
          )}
        </div>

        {/* Score Section */}
        <div className="flex justify-between items-center mt-6 border-b border-gray-200 pb-3 px-5">
          <h3 className="font-semibold">Detailed Call Analysis</h3>
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px]">
              <CircularProgressbar
                value={selectedItem?.call_scores || 0}
                text={`${selectedItem?.call_scores || 0}%`}
                styles={buildStyles({
                  textColor: "black",
                  pathColor: "green",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>
            <div className="text-gray-700 font-medium text-sm flex flex-col justify-start pr-4">
              <span className="text-[10px]">Overall Score</span>
              <span>Performance</span>
            </div>
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="px-5 py-3 mt-4 border border-gray-200 rounded-md shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="font-semibold text-gray-800 text-md flex gap-2 items-center">
              Complete call opening script with greeting & self introduction
              <img
                src={DownArrow}
                alt="toggle"
                onClick={() => setShowSuggestion((prev) => !prev)}
                className={`size-6 cursor-pointer transform transition-transform duration-300 ${
                  showSuggestion ? "rotate-180" : "rotate-0"
                }`}
              />
            </h1>
          </div>

          {showSuggestion && (
            <div className="mt-4 space-y-4">
              {(chapters.length > 0 ||
                actionItems.length > 0 ||
                nextSteps.length > 0) && (
                <div className="border-t border-[#E9EAEB]">
                  {chapters.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-start gap-2 items-center">
                        <img
                          src={DownArrow}
                          alt=""
                          className={`size-6 cursor-pointer transform transition-transform duration-300 ${
                            showChapters ? "rotate-180" : "rotate-0"
                          }`}
                          onClick={() => setShowChapters((prev) => !prev)}
                        />
                        <h3 className="font-medium cursor-pointer mb-2 text-[#004EEB]">
                          Topics
                        </h3>
                      </div>

                      {showChapters && (
                        <>
                          {chapters.map((topic: any, idx: number) => (
                            <div key={idx} className="mt-4">
                              <span className="text-sm font-bold text-gray-800 mb-2 ml-7">
                                {topic.topic}
                              </span>
                              <ol className="list-disc list-inside pl-8 pt-2 pb-4 text-sm mb-2 text-[#414651]">
                                {topic.points?.map((pt: any, i: any) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {actionItems.length > 0 && (
                <div className="mt-1">
                  <div className="mt-2 flex justify-start gap-2 items-center">
                    <h3 className="flex justify-start gap-2 items-center mt-3 font-medium cursor-pointer mb-2 text-[#004EEB]">
                      <img
                        src={DownArrow}
                        alt=""
                        className={`size-6 cursor-pointer transform transition-transform duration-300  ${
                          showActionItems ? "rotate-180" : "rotate-0"
                        }`}
                        onClick={() => setShowActionItems((prev) => !prev)}
                      />{" "}
                      Action Items
                    </h3>
                    <button className="h-7 w-7 bg-gray-300 rounded-2xl text-[#004EEB] mt-1.5 pr-0.5">
                      {actionItems.length}
                    </button>
                  </div>

                  {showActionItems && (
                    <ul className="list-disc list-inside pl-8 pt-2 pb-4 space-y-3">
                      {actionItems.map((step: any, idx: number) => (
                        <li key={idx} className="flex flex-col text-[#181D27]">
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            {step["Action Item"]}
                          </p>
                          <p className="text-sm text-[#414651]">
                            {step["Context/Dependencies"]}
                          </p>
                          <div className="flex items-center gap-2 text-sm mb-2 text-[#414651]">
                            <span>{step.Responsible}</span>
                            <img src={Timer} alt="timer" className="w-4 h-4" />
                            <span>{step.Deadline}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {nextSteps.length > 0 && (
                <div className="mt-1">
                  <div className="flex justify-start gap-2 items-center">
                    <h3 className="flex justify-start gap-2 items-center mt-3 font-medium cursor-pointer mb-2 text-[#004EEB]">
                      <img
                        src={DownArrow}
                        alt=""
                        className={`size-6 cursor-pointer transform transition-transform duration-300 ${
                          shownextSteps ? "rotate-180" : "rotate-0"
                        }`}
                        onClick={() => setShownextSteps((prev) => !prev)}
                      />
                      Next Steps
                    </h3>
                    <button className="h-7 w-7 bg-gray-200 rounded-2xl text-[#004EEB] mt-1">
                      {nextSteps.length}
                    </button>
                  </div>

                  {shownextSteps && (
                    <ul className="list-disc list-inside pl-8 pt-2 pb-4">
                      {nextSteps.map((step: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-800 mb-2">
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {chapters.length === 0 &&
                actionItems.length === 0 &&
                nextSteps.length === 0 && (
                  <p className="text-gray-500 italic">
                    No suggestions available.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Optional Manual Download Button */}
        {downloadUrl && (
          <div className="flex justify-center mt-5">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md"
            >
              Download Report PDF
            </a>
          </div>
        )}

        {/* Transcript */}
        <div className="px-5 pb-2 mt-5">

          <div className="relative group">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      onChange={() => setTranscript((prev) => !prev)}
      checked={transcript}
      className="cursor-pointer"
    />
    <span>Transcript</span>

    {/* Tooltip */}
    <span className="
      absolute -top-7 left-0 
      text-xs bg-gray-800 text-white 
      px-2 py-1 rounded-md 
      opacity-0 group-hover:opacity-100 
      transition-opacity duration-200 
      whitespace-nowrap z-10
    ">
      {transcript
        ? "Uncheck the box to export the report without transcript."
        : "Check the box to export the report with transcript."
      }
    </span>
  </label>
</div>

       


          {transcript ? (
            <div>
              {transcripts.length > 0 ? (
                transcripts.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition px-5 ${
                      item.sentiment === "positive"
                        ? "border-green-400"
                        : item.sentiment === "negative"
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  >
                    <p className="text-gray-800">{item.text}</p>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <img
                        src={Schedule}
                        alt="Schedule Icon"
                        className="w-4 h-4"
                      />
                      <span>
                        {item.start} - {item.end}
                      </span>
                      <span>|</span>
                      {item.sentiment === "positive" ? (
                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                          Positive
                        </span>
                      ) : item.sentiment === "negative" ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                          Negative
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                          Neutral
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No transcripts found.</p>
              )}
            </div>

            
          ) : (
            <p className="text-center font-medium">
              
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default CallScoreExport;
