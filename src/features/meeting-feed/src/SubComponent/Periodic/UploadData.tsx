import React, { useState, useRef, useEffect } from "react";
import { getLocalStorageItem ,requestApiFromData } from "../../Service/MeetingService";

import PeriodicApiStore from "../../Zustand/PeriodicApiStore";
import { useToast } from "@/hooks/use-toast";

import ConfigData from "./ConfigData";
// import PaymentPage from "./PaymentPage";
import PlatformDetails from "./PlatformDetails";

import Close from "../../assets/svg/Close.svg";
import GroupFile from "../../assets/svg/GroupFile.svg";
import UrlFrame from "../../assets/svg/UrlFram.svg";
import PeriodicIcon from "../../assets/svg/Periodic.svg";
import { useAppDispatch } from "../../redux/hooks";
import { fetchMeetingAgent } from "../../features/MeetSlice";

interface TabItem {
  type: "file" | "url" | "periodic";
  Icon: string;
}

interface UploadDataProps {
  setUploadData: (value: boolean) => void;
}

const url = new URL(window.location.href);
// const tenant_id =url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

const UploadData: React.FC<UploadDataProps> = ({ setUploadData }) => {
  const [activeTab, setActiveTab] = useState<"file" | "url" | "periodic">(
    "file"
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlList, setUrlList] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showConfigureData, setShowConfigureData] = useState<boolean>(false);
   const { toast } = useToast();

  const {
    Periodic,
    PeriodicPlateForm,
    PeriodicLoading,
    fetchPeriodicData,
    FetchPlatForm,
  } = PeriodicApiStore();
  const dispatch = useAppDispatch();

  // console.log("fetchPeriodicData",Periodic)
  // console.log("PeriodicPlateForm",PeriodicPlateForm)

  useEffect(() => {
    fetchPeriodicData?.();
    FetchPlatForm?.();
  }, []);
  // console.log("Periodic",Periodic)

  const allowedFormats = [
    // Audio
    "mp3",
    "wav",
    "ogg",
    "flac",
    "aac",
    "m4a",
    "aiff",
    "aif",
    "wma",

    // Video
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "flv",
    "wmv",
    "m4v",
  ];

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  // Process files (common function for both drag drop and file input)
  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension && allowedFormats.includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (invalidFiles.length > 0) {
      setShowPopup({
        message: `Invalid file format(s): ${invalidFiles.join(
          ", "
        )}. Please upload audio files only.`,
        type: "error",
      });
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAllFiles = () => {
    setSelectedFiles([]);
  };

  // URL List Functions
  const handleAddUrl = () => {
    if (!urlInput.trim()) {
        toast({
          title: "Error",
          description: "Kindly enter a URL before adding...!",
          variant: "error",
        });
   
      return;
    }

    // Validate URL pattern
    const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
    if (!urlPattern.test(urlInput)) {
        toast({
          title: "Error",
          description: "Invalid URL format. Must start with http or https..!",
          variant: "error",
        });
      return;
    }

    // Validate audio extension
    const ext = urlInput.split(".").pop()?.toLowerCase();
    if (!ext || !allowedFormats.includes(ext)) {
        toast({
          title: "Error",
          description: `Invalid file format. Allowed: ${allowedFormats.join(", ")}`,
          variant: "error",
        });
      return;
    }

    // Check for duplicate URLs
    if (urlList.includes(urlInput)) {
        toast({
          title: "Error",
          description: "This URL has already been added..!",
          variant: "error",
        });

      return;
    }

    // Add URL to list and clear input
    setUrlList((prev) => [...prev, urlInput]);
    setUrlInput("");
          toast({
          title: "Success",
          description:"URL added successfully!",
          variant: "success",
        });
        };

  const handleRemoveUrl = (index: number) => {
    setUrlList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllUrls = () => {
    setUrlList([]);
          toast({
          title: "Success",
          description:"All URLs cleared.",
          variant: "success",
        });
  };

  // Handle Enter key press for URL input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddUrl();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activeTab === "file") {
        if (selectedFiles.length === 0) {

          toast({
          title: "Error",
          description:"Please select at least one valid file before submitting.",
          variant: "error",
        });
          setLoading(false);
          return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const response = await requestApiFromData(
          "POST",
          `${tenant_id}/salesenablement/`,
          formData,
          "authService"
        );
        dispatch(fetchMeetingAgent(1))
        // Check response status and show appropriate toast
        const message = response?.message || response?.data?.message;
        const status = response?.status || response?.data?.status;


        if (status === "warning") {
          toast({
          title: "Error",
          description:message || "Upload completed with warnings",
          variant: "error",
        });
        } else if (status === "error") {
        toast({
          title: "Error",
          description: message || "Upload failed..!",
          variant: "error",
        });
        } else {
          toast({
          title: "Success",
          description:message || "Files uploaded successfully!",
          variant: "success",
        });
        }

        // Close popup after 2 seconds for all cases (success/warning)
        setTimeout(() => {
          setUploadData(false);
        }, 2000);
      } else if (activeTab === "url") {
 const isValidUrl = (url:any) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Format URL function
  const formatUrl = (url:any) => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    
    // Add protocol if missing
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return 'https://' + trimmed;
    }
    return trimmed;
  };

  const formattedUrl = formatUrl(urlInput);
  
  if (!formattedUrl || !isValidUrl(formattedUrl)) {
    toast({
      title: "Error",
      description: "Please enter a valid URL (e.g., example.com or https://example.com)",
      variant: "error",
    });
    setLoading(false);
    return;
  }

  let finalUrlList = [...urlList];

  // Avoid duplicates
  if (!finalUrlList.includes(formattedUrl)) {
    finalUrlList.push(formattedUrl);
  }

  if (finalUrlList.length === 0) {
    toast({
      title: "Error",
      description: "Please enter at least one URL before submitting.",
      variant: "error",
    });
    setLoading(false);
    return;
  }

  // Try different formats based on API requirements
  const formData = new FormData();
  
  // Option 1: As JSON string (current)
  formData.append("links", JSON.stringify(finalUrlList));
  formData.append("social_media_uris", JSON.stringify([]));
  
  const response = await requestApiFromData(
    "POST",
    `${tenant_id}/salesenablement/`,
    formData,
    "authService"
  );

  const message = response?.message || response?.data?.message;
  const status = response?.status || response?.data?.status;
  dispatch(fetchMeetingAgent(1))

  if (status === "warning") {
        toast({
          title: "Error",
          description: message || "URL upload completed with warnings",
          variant: "error",
        });
  } else if (status === "error") {
        toast({
          title: "Error",
          description:message || "URL upload failed",
          variant: "error",
        });
  } else {
   toast({
          title: "Success",
          description:`${finalUrlList.length} URL(s) uploaded successfully!`,
          variant: "success",
        });
  }

  setTimeout(() => {
    setUploadData(false);
  }, 2000);
}


      setSelectedFiles([]);
      setUrlInput("");
      setUrlList([]);
      // setPeriodicTime("");
    } catch (err: any) {
      console.error("Upload error:", err);

      const errorMessage =
        err?.message ||
        err?.response?.message ||
        err?.data?.message ||
        "Upload failed! Please try again.";

        toast({
          title: "Error",
          description:errorMessage,
          variant: "error",
        });
    } finally {
      setLoading(false);
    }
  };

  const IconsArray: TabItem[] = [
    { type: "file", Icon: GroupFile },
    { type: "url", Icon: UrlFrame },
    { type: "periodic", Icon: PeriodicIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 ">
      <div
        className="bg-gray-50 h-[100vh] w-full max-w-xl rounded-l-xl shadow-lg p-6 sm:p-8 
                sticky overflow-y-auto  animate-fadeSlide transition-all duration-300 ease-in-out"
      >
        <img
          src={Close}
          onClick={() => setUploadData(false)}
          className="absolute top-4 right-4 sixe-10 text-gray-500 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
          alt="Close"
        />

        <div className=" flex border-b border-gray-200 mb-4">
          {IconsArray.map((tab) => (
            <button
              key={tab.type}
              onClick={() =>
                setActiveTab(tab.type as "file" | "url" | "periodic")
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-center capitalize font-medium transition-all duration-200
        ${
          activeTab === tab.type
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
            >
              <img
                src={tab.Icon}
                alt={`${tab.type} icon`}
                className="w-5 h-5"
              />
              <span>{tab.type}</span>
            </button>
          ))}
        </div>

        <div className="min-h-[200px] flex flex-col">
          {activeTab === "file" && (
            <div className="flex-1 flex flex-col">
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-gray-600">
                    <span className="text-blue-600 font-semibold">
                      {selectedFiles.length === 0
                        ? "Upload Files"
                        : "Add More Files"}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={allowedFormats.map((f) => `.${f}`).join(",")}
                    onChange={handleFileInputChange}
                    multiple
                  />
                  <p className="text-sm text-gray-500">
                    Audio: mp3, wav, ogg, flac, aac, m4a, aiff, aif, wma
                    <br />
                    Video: mp4, mov, avi, mkv, webm, flv, wmv, m4v
                  </p>
                  <p className="text-xs text-gray-400">
                    Click to browse or drag and drop files
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum file size: <span className="text-md text-gray-800"> 100MB </span> 
                  </p>
                  {dragActive && (
                    <p className="text-xs text-blue-500 font-semibold mt-2">
                      Drop your files here...
                    </p>
                  )}
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex-1 mb-4 overflow-y-auto mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    {selectedFiles.length > 1 && (
                      <button
                        onClick={handleDeleteAllFiles}
                        className="text-red-500 text-sm font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                      >
                        <span className="text-gray-700 truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          onClick={() => handleDeleteFile(index)}
                          className="text-red-500 font-semibold hover:underline ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter audio URL (http:// or https://)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  Add
                </button>
              </div>

              {urlList.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Added URLs ({urlList.length})
                    </h3>
                    <button
                      onClick={handleClearAllUrls}
                      className="text-red-500 text-sm font-semibold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {urlList.map((url, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm text-gray-700 truncate"
                            title={url}
                          >
                            {url}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Format: .{url.split(".").pop()?.toLowerCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveUrl(index)}
                          className="ml-3 text-red-500 hover:text-red-700 font-semibold text-sm transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Instructions:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Enter audio URLs one by one</li>
                  <li>• Click "Add" or press Enter to add to list</li>
                  <li>• Supported formats: {allowedFormats.join(", ")}</li>
                  <li>• URLs must start with http:// or https://</li>
                </ul>
              </div>
            </div>
          )}

         {activeTab === "periodic" && (
  <div className="flex-1 flex flex-col justify-start">
    <div className="flex justify-between">
      <h3 className="text-[16px] text-gray-600">Configuration</h3>

      <button
        className="px-3 py-1 bg-black rounded-[5px] text-white"
        onClick={() => setShowConfigureData(prev => !prev)}
      >
        {showConfigureData ? "Back" : "My Configuration"}
      </button>
    </div>

    {!showConfigureData ? (
      <PlatformDetails
        PeriodicPlateForm={PeriodicPlateForm}
        setUploadData={setUploadData}
      />
    ) : (
      <ConfigData
        Periodic={Periodic}
        PeriodicPlateForm={PeriodicPlateForm}
        PeriodicLoading={PeriodicLoading}
        fetchPeriodicData={fetchPeriodicData}
      />
    )}
  </div>
)}

        </div>

        {activeTab === "periodic" ? null : (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setSelectedFiles([]);
                setUrlInput("");
                setUrlList([]);
                // setPeriodicTime("");
                setUploadData(false);
              }}
              className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        {showPopup && (
          <div
            className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white transition-all z-60 ${
              showPopup.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div className="flex items-center">
              <span className="text-sm">{showPopup.message}</span>
              <button
                onClick={() => setShowPopup(null)}
                className="ml-3 hover:bg-white/20 rounded p-1 transition-colors"
              >
                <img src={Close} alt="Close" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadData;
