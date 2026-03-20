import { FetchParameter } from "../../features/CallAnalysiSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";

import { useEffect } from "react";

interface SettingsData {
  emailNotify: boolean;
  threshold: string;
  email: string;
  sentimentNotify: boolean;
  sentiment: string;
  sentimentEmail: string;
  categoryNotify: boolean;
  category: string;
  categoryEmail: string;
  // durationIgnore: boolean;
  duration: string;
  feedback: boolean;
  feedbackInstruction: string;
}

interface SettingsProps {
  settingsData: SettingsData;
  mode?: "view" | "edit"; 
  onUpdateSettings: (updates: Partial<SettingsData>) => void;
}

const Settings = ({ settingsData, onUpdateSettings,mode }: SettingsProps) => {
  const handleInputChange = (field: keyof SettingsData, value: any) => {
    onUpdateSettings({ [field]: value });
  };
   const dispatch = useAppDispatch();

   const { ParameterDetails } = useAppSelector((state: any) => state.Parameter);
   const CategoryList = ParameterDetails?.data?.categories || [];

  //  console.log("ParameterDetails", ParameterDetails);

  useEffect(()=>{
    dispatch(FetchParameter());
  },[])

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-320px)]">
      <div className="bg-white shadow-md rounded-2xl p-5 space-y-5">
        
        {/* Email Notification */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsData.emailNotify}
              onChange={(e) => handleInputChange('emailNotify', e.target.checked)}
              className="mt-1 accent-indigo-600 w-5 h-5"
              disabled={mode === "view"}
            />
            <span className="text-gray-800 font-medium">
              Send email notification when score is below threshold
            </span>
          </label>

          {settingsData.emailNotify && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-1 md:pl-8">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Threshold Value
                </label>
                <input
                  type="number"
                  placeholder="0"
                  disabled={mode === "view"}
                  value={settingsData.threshold}
                  onChange={(e) => handleInputChange('threshold', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email Addresses
                </label>
                <input
                  type="email"
                  placeholder="Enter email addresses"
                  value={settingsData.email}
                  disabled={mode === "view"}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sentiment Notification */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsData.sentimentNotify}
              disabled={mode === "view"}
              onChange={(e) => handleInputChange('sentimentNotify', e.target.checked)}
              className="mt-1 accent-indigo-600 w-5 h-5"
            />
            <span className="text-gray-800 font-medium">
              Send notification if sentiment is
            </span>
          </label>

          {settingsData.sentimentNotify && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-1 md:pl-8">
              <div>
                <select
                  value={settingsData.sentiment}
                  onChange={(e) => handleInputChange('sentiment', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Positive">Positive</option>
                </select>
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={settingsData.sentimentEmail}
                  disabled={mode === "view"}
                  onChange={(e) => handleInputChange('sentimentEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Notification */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsData.categoryNotify}
              disabled={mode === "view"}
              onChange={(e) => handleInputChange('categoryNotify', e.target.checked)}
              className="mt-1 accent-indigo-600 w-5 h-5"
            />
            <span className="text-gray-800 font-medium">
              Send notification if category is
            </span>
          </label>

          {settingsData.categoryNotify && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-1 md:pl-8">
              <div>
                { mode === "view" ? ( <span>
                  <span className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 block">
                 {
          CategoryList.find(
     (cat: { params: string }) =>cat.params === settingsData.category)?.params || "No category selected"}
                      </span>
                </span>):(

                  <select
                    value={settingsData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {CategoryList.length > 0 ? (
                      CategoryList.map((cat: any, index: number) => (
                        <option key={index} value={cat?.params}>
                          {cat?.params}
                        </option>
                      ))
                    ) : (
                      <option value="">No categories available</option>
                    )}
                  </select>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Enter email addresses"
                  disabled={mode === "view"}
                  value={settingsData.categoryEmail}
                  onChange={(e) => handleInputChange('categoryEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

        </div>
       

        {/* Feedback */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsData.feedback}
              disabled={mode === "view"}
              onChange={(e) => handleInputChange('feedback', e.target.checked)}
              className="mt-1 accent-indigo-600 w-5 h-5"
            />
            <span className="text-gray-800 font-medium">
              Send feedback request after meeting
            </span>
          </label>

          {settingsData.feedback && (
            <div className="mt-4 pl-1 md:pl-8">
              <input
                type="text"
                placeholder="Enter feedback instruction"
                value={settingsData.feedbackInstruction}
                onChange={(e) => handleInputChange('feedbackInstruction', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;