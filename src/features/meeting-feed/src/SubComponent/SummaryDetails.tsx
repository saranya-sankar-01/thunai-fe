import React, { useState } from "react";
import Skeleton from "../components/Skeleton";
import "../index.css";

import Timer from "../assets/svg/Timer.svg";
import DownArrow from "../assets/svg/Keyboard_arrow_down1.svg";
import AutoAwesome from "../assets/svg/AutoAwesomeBlue.svg";

interface Chapter {
  topic: string;
  points?: string[];
}

interface ActionItem {
  ["Action Item"]: string;
  Responsible: string;
  Deadline: string;
  ["Context/Dependencies"]: string;
}

export interface GetCalls {
  summary?: string;
  title?: string;
  category?: string;
  chapters_and_topics?: Chapter[];
  action_items?: ActionItem[];
  next_steps?: string[];
  cloud_storage_file_path?: string;
  transcription?: string;
  [key: string]: any;
}

interface SummaryDetailsProps {
  getCalls?: GetCalls;
  loading?: boolean;
}

const SummaryDetails: React.FC<SummaryDetailsProps> = ({
  // selectedItem,
  getCalls,
  loading,
}) => {
  const [showChapters, setShowChapters] = useState<boolean>(true);
  const [showActionItems, setShowActionItems] = useState<boolean>(true);
  const [shownextSteps, setShownextSteps] = useState<boolean>(true);

  const [expandedSummary, setExpandedSummary] = useState<boolean>(false);

  if (loading) {
    return (
      <>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    );
  }

  const chapters = getCalls?.chapters_and_topics || [];
  const actionItems = getCalls?.action_items || [];
  const nextSteps = getCalls?.next_steps || [];

  const noSummary =
    ((!getCalls?.action_items || getCalls.action_items.length === 0) &&
      (!getCalls?.chapters_and_topics ||
        getCalls.chapters_and_topics.length === 0) &&
      (!getCalls?.next_steps || getCalls.next_steps.length === 0) &&
      !getCalls?.category &&
      !getCalls?.title) ||
    !getCalls?.summary;

  // console.log("noSummary",noSummary);
  // console.log("getCalls?.summary",getCalls?.summary);
// 100vh-265px
  return (
    <div className=" h-full lg:h-[calc(100vh-250px)] overflow-y-scroll pl-2 scrollbar-hide scrollbar-thin pt-2">
      {noSummary ? (
        <div
          className="flex justify-center p-3 text-gray-400 text-sm text-center items-center h-80
        "
        >
          No Summary Found
        </div>
      ) : (
        <div>
          {getCalls?.summary && (
            <div className="py-7 px-5 rounded-lg bg-[#F3F3FF] shadow-md mb-2">
              <h2 className="text-[#181D27] h-[20px] text-lg flex gap-1 mb-2">
                <img src={AutoAwesome} alt="" className="size-5 mt-1" />
                Summary
              </h2>
              <div className="relative">
                <p
                  className={`text-sm text-gray-600 capitalize whitespace-pre-line transition-all duration-300 ${
                    expandedSummary
                      ? "max-h-40 overflow-y-auto pr-2"
                      : "line-clamp-4"
                  }`}
                >
                  {getCalls.summary}
                </p>

                {/* View More / Less */}
                {getCalls?.summary.split(" ").length > 25 && (
                  <button
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="text-blue-600 text-xs font-medium mt-1 hover:underline"
                  >
                    {expandedSummary ? "View Less" : "View More"}
                  </button>
                )}
              </div>
            </div>
          )}

          {(chapters.length > 0 ||
            actionItems.length > 0 ||
            nextSteps.length > 0) && (
            <div className="border-t  border-[#E9EAEB]">
              {chapters.length > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between bg-[#E8F1FF] px-5 py-3 rounded-[5px] items-center">
                    <h3 className="font-medium cursor-pointer text-[#004EEB]">
                      Topics
                    </h3>
                    <img
                      src={DownArrow}
                      alt=""
                      className={`size-6 cursor-pointer transform transition-transform duration-300 ${
                        showChapters ? "rotate-180" : "rotate-0"
                      }`}
                      onClick={() => setShowChapters((prev) => !prev)}
                    />
                  </div>

                  {showChapters && (
                    <>
                      {chapters.map((topic: any, idx: any) => (
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
              <div className=" flex justify-between items-center px-5 py-2 bg-[#E8F1FF] rounded-[5px]">
                <h3 className="flex justify-start gap-2 items-center font-medium cursor-pointer p-0.5 text-[#004EEB]">
                  Action Items
                  <button className="h-7 w-7 mt-0.5 bg-gray-100 rounded-2xl text-[#004EEB]">
                    {actionItems.length}
                  </button>
                </h3>
                <img
                  src={DownArrow}
                  alt=""
                  className={`size-6 cursor-pointer transform transition-transform duration-300  ${
                    showActionItems ? "rotate-180" : "rotate-0"
                  }`}
                  onClick={() => setShowActionItems((prev) => !prev)}
                />{" "}
              </div>

              {showActionItems && (
                <ul className="list-disc list-inside pl-8 pt-2 pb-4 space-y-3">
                  {actionItems.map((step: any, idx: any) => (
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
            <div className="mt- mb-2">
              <div className="flex justify-between px-5 py-1.5 items-center bg-[#E8F1FF] rounded-[5px]">
                <h3 className="flex justify-start gap-2 items-center font-medium cursor-pointer mb-2 text-[#004EEB]">
                  Next Steps
                  <button className="h-7 w-7 bg-gray-100 rounded-2xl mt-1 text-[#004EEB]">
                    {nextSteps.length}
                  </button>
                </h3>
                <img
                  src={DownArrow}
                  alt=""
                  className={`size-6 cursor-pointer transform transition-transform duration-300 ${
                    shownextSteps ? "rotate-180" : "rotate-0"
                  }`}
                  onClick={() => setShownextSteps((prev) => !prev)}
                />
              </div>

              {shownextSteps && (
                <ul className="list-disc list-inside pl-8 pt-2 pb-4">
                  {nextSteps.map((step: any, idx: any) => (
                    <li key={idx} className="text-sm text-gray-800 mb-2">
                      {step}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryDetails;
