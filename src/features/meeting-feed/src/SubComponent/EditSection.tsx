import { useState } from "react";
import {getLocalStorageItem , requestApi } from "../Service/MeetingService";

import DownArrow from "../assets/svg/Keyboard_arrow_down1.svg";

import { useSearchParams,useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";



interface ActionItem {
  "Action Item": string;
  Responsible: string;
  Deadline: string;
  "Context/Dependencies": string;
}

interface Chapter {
  topic: string;
  points?: string[];
}

export interface GetCalls {
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


interface EditSectionProps {
  getCalls: GetCalls;
  setShowEditSection: (value: boolean) => void;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}





const EditSection: React.FC<EditSectionProps> = ({
  getCalls,
  setShowEditSection,
  setRefresh,
}) => {
  
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const CellUser = searchParams.get("id")||  useParams().id ;
  const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id ||  localStorage.getItem("tenant_id");
  const [title, setTitle] = useState(getCalls?.title || "");
  const [summary, setSummary] = useState(getCalls?.summary || "");

  const [showChapters, setShowChapters] = useState<boolean>(true);
  const [showActionItems, setShowActionItems] = useState<boolean>(true);
  const [shownextSteps, setShownextSteps] = useState<boolean>(true);
  const [loading, setLoading]=useState<boolean>(false);

  const [actionItems, setActionItems] = useState<ActionItem[]>(
    getCalls?.action_items || []
  );
  // console.log("CellUser",CellUser);
  const [nextSteps, setNextSteps] = useState<string[]>(
    getCalls?.next_steps || []
  );

  const [chapters, setChapters] = useState<Chapter[]>(
    getCalls?.chapters_and_topics || []
  );



  const updateActionItem = (
    index: number,
    key: keyof ActionItem,
    value: string
  ) => {
    const update = [...actionItems];
    update[index][key] = value;
    setActionItems(update);
  };

  const updateNextStep = (index: number, value: string) => {
    const update = [...nextSteps];
    update[index] = value;
    setNextSteps(update);
  };

  const updateChapterTopic = (index: number, value: string) => {
    const update = [...chapters];
    update[index].topic = value;
    setChapters(update);
  };

  const updateChapterPoint = (
    chapterIdx: number,
    pointIdx: number,
    value: string
  ) => {
    const update = [...chapters];
    if (update[chapterIdx]?.points) {
      update[chapterIdx].points![pointIdx] = value;
      setChapters(update);
    }
  };


  const sendEditData = async () => {
    const payload = {
      id: CellUser,
      call_transcript: "text",
      file_name: getCalls.file_name,
      title,
      summary,
      participants: [],
      action_items: actionItems,
      next_steps: nextSteps,
      chapters_and_topics: chapters,
    };

    try {
      setLoading(true)
      const res = await requestApi(
        "PATCH",
        `${tenant_id}/salesenablement/`,
        payload,
        "authService"
      );

      toast({
      title: "Success",
      description: res?.message || "Meeting Feed updated successfully...!",
      variant: "success",
    });
      setShowEditSection(false);
      setRefresh((prev) => !prev);
    } catch (err:any) {
      console.error(err);
  toast({
    title: "Error",
    description: err?.res?.message || "Failed to Updated..!",
    variant: "error",
  });
      setLoading(false)
    }
  };


  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
        <div className="bg-white w-full max-w-xl h-screen rounded-l-xl shadow-lg p-6 sm:p-7 
                        overflow-y-auto transition-all duration-300 ease-in-out">


          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Edit Call Summary</h2>
            <button
              className="text-red-500 font-medium hover:text-red-600 transition-colors duration-200"
              onClick={() => setShowEditSection(false)}
            >
              Close
            </button>
          </div>


          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Enter call title..."
            />
          </div>


          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <label className="block text-sm font-medium text-gray-700">
                Summary
              </label>
            </div>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Enter call summary..."
            />
          </div>

  
          <div className="mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-700">Action Items</h3>
              </div>
              <img
                src={DownArrow}
                onClick={() => setShowActionItems((prev) => !prev)}
                alt="DownArrow"
                className="size-6 cursor-pointer transition-transform duration-200 hover:opacity-80"
                style={{ transform: showActionItems ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>

            {showActionItems && actionItems.length > 0 && (
              <div className="space-y-4">
                {actionItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Action Item</label>
                        <input
                          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter action item"
                          value={item["Action Item"]}
                          onChange={(e) =>
                            updateActionItem(index, "Action Item", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Responsible</label>
                        <input
                          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter responsible person"
                          value={item.Responsible}
                          onChange={(e) =>
                            updateActionItem(index, "Responsible", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Deadline</label>
                        <input
                          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter deadline"
                          value={item.Deadline}
                          onChange={(e) =>
                            updateActionItem(index, "Deadline", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Context / Dependencies</label>
                      <textarea
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        rows={2}
                        placeholder="Enter context or dependencies"
                        value={item["Context/Dependencies"]}
                        onChange={(e) =>
                          updateActionItem(index, "Context/Dependencies", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-700">Next Steps</h3>
              </div>
              <img
                src={DownArrow}
                onClick={() => setShownextSteps((prev) => !prev)}
                alt="DownArrow"
                className="size-6 cursor-pointer transition-transform duration-200 hover:opacity-80"
                style={{ transform: shownextSteps ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>

            {shownextSteps && nextSteps.length > 0 && (
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <input
                      className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={step}
                      onChange={(e) => updateNextStep(index, e.target.value)}
                      placeholder="Enter next step..."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-700">Chapters & Topics</h3>
              </div>
              <img
                src={DownArrow}
                onClick={() => setShowChapters((prev) => !prev)}
                alt="DownArrow"
                className="size-6 cursor-pointer transition-transform duration-200 hover:opacity-80"
                style={{ transform: showChapters ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>

            {showChapters && chapters.length > 0 && (
              <div className="space-y-4">
                {chapters.map((chapter, cIndex) => (
                  <div key={cIndex} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Chapter Title</label>
                      <input
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
                        value={chapter.topic}
                        onChange={(e) => updateChapterTopic(cIndex, e.target.value)}
                        placeholder="Enter chapter title..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500">Points</label>
                      {(chapter.points || []).map((pt, pIndex) => (
                        <div key={pIndex} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                          <input
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            value={pt}
                            onChange={(e) =>
                              updateChapterPoint(cIndex, pIndex, e.target.value)
                            }
                            placeholder="Enter point..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white pt-4 px-6 border-gray-200">
            <button
              onClick={sendEditData}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm  shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
             {loading? "Changing...":"Save Changes"} 
            </button>
          </div>
        </div>
      </div>

   
    </>
  );
};

export default EditSection;
