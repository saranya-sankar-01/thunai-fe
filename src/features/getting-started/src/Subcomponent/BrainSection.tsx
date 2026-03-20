import {useState,useRef} from 'react';
import { ToastContainer, toast } from "react-toastify";
import SchoolIcon from "../assets/svg/School.svg";
import {getLocalStorageItem , requestApiFromData } from "@/services/authService";

const BrainSection = ({ CIndex }: { CIndex: number }) => {

   const fileInputRef = useRef<HTMLInputElement | null>(null);
    const userInfo = getLocalStorageItem("user_info") || {};
   const tenantId =  userInfo?.default_tenant_id || localStorage.getItem("tenant_id") || "";
   const [showWeblinkInput, setShowWeblinkInput] = useState(false);
   const [crawlWebsite, setCrawlWebsite] = useState(false);
   const [webLinkInput, setWebLinkInput] = useState("");
   const [crawlDepth, setCrawlDepth] = useState(1);

    
   const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
// /knowledge-base/
    try {
      const response = await requestApiFromData(
        "POST",
        `${tenantId}/knowledge-base/`,
        formData,
        "brainService"
      );
      toast.success(response?.data?.message || "File Uploaded successfully");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update"
      );
    }
  };

  const SendWebLink = async () => {
     if(webLinkInput.trim() === "") return;
    try {
      const response = await requestApiFromData(
        "POST",
        `${tenantId}/knowledge-base/`,
        {
          links: webLinkInput,
          crawl: crawlWebsite,
          crawl_level: crawlDepth,
        },
        "brainService"
      );
      toast.success(response?.data?.message || "Successfully Add web link");
      setWebLinkInput("");
      setCrawlWebsite(false);
      setCrawlDepth(1);
      setShowWeblinkInput(false);
    } catch (err: unknown) {
      console.error("Error adding web link:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to adding web link"
      );
    }
  };
  return (
    <>
     <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-md border-2 border-gray-200">
      
      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium flex-shrink-0">
          {CIndex}
        </span>
        Brain
      </h2>


      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
          <img src={SchoolIcon} alt="school" className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
            <p className="font-medium text-gray-700 text-sm sm:text-base">Brain is where you add all your information</p>
        <p className="text-xs sm:text-[14px] text-gray-500">
          Upload files or add web links to get started. Connect your knowledge sources to make Thunai even smarter.
        </p>
        </div>
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold">Add Your First Content to Brain</h3>
      </div>
      <div className="flex gap-3 sm:gap-4 flex-col md:flex-row items-stretch justify-between rounded-lg">
        <div className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 md:p-10 w-full md:w-[48%]">
            <span className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center"> <img src={SchoolIcon} alt="school" className="h-10 w-10 sm:h-12 sm:w-12" /></span>
            <h6 className="text-gray-700 font-medium text-sm sm:text-base mt-2">Upload Documents</h6>
            <p className="text-xs sm:text-sm text-gray-500 text-center">PDFs, Docs, Sheets & more. 100MB max</p>
            <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
            <button className="px-4 py-2 w-full mt-4 text-sm sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer" onClick={handleButtonClick}>Selected File</button>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 md:p-10 w-full md:w-[48%]">
            <span className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center"> <img src={SchoolIcon} alt="school" className="h-10 w-10 sm:h-12 sm:w-12" /></span>
            <h6 className="text-gray-700 font-medium text-sm sm:text-base mt-2">Add Web Link</h6>
            <p className="text-xs sm:text-sm text-gray-500 text-center">Articles, blogs, documentation and more</p>
           {!showWeblinkInput && (
               <button className="px-4 py-2 w-full mt-4 text-sm sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" onClick={()=>{setShowWeblinkInput(!showWeblinkInput)}}>Add Link</button>
           )
           } 
            {showWeblinkInput && (
                <div  className="w-full">
                <input type="text" value={webLinkInput} onChange={(e) => setWebLinkInput(e.target.value)} placeholder="https://example.com" className="mt-4 p-2 text-sm sm:text-base border-2 border-gray-300 rounded-md w-full outline-none" />
                <div  className="mt-4 flex flex-wrap justify-between items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                    <img src="" alt="" />
                    <span className="text-sm">Crawl Website</span>
                    </div>
                    <button
              onClick={() => setCrawlWebsite(!crawlWebsite)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-300 cursor-pointer flex-shrink-0
                ${crawlWebsite ? "bg-blue-600" : "bg-gray-300"}`}
                >
              <span
                className={`absolute top-1 left-1 w-3.5 h-3.5 bg-white rounded-full
                  shadow-md transform transition-transform duration-300
                  ${crawlWebsite ? "translate-x-4" : ""}`}
                  ></span>
            </button>
                </div>
                {crawlWebsite && (
                    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm font-medium">Depth:</p>
                        <div className="flex items-center justify-between sm:justify-start gap-3 text-black">
                            <button
                              onClick={() => setCrawlDepth(1)}
                              className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-colors ${
                                crawlDepth === 1
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-gray-200 border-gray-300"
                              }`}
                            >
                              1
                            </button>
                            <button
                              onClick={() => setCrawlDepth(2)}
                              className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-colors ${
                                crawlDepth === 2
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-gray-200 border-gray-300"
                              }`}
                            >
                              2
                            </button>
                            <button
                              onClick={() => setCrawlDepth(3)}
                              className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-colors ${
                                crawlDepth === 3
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-gray-200 border-gray-300"
                              }`}
                            >
                              3
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-4 w-full cursor-pointer">
                    <button className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors" onClick={() => setShowWeblinkInput(false)}>Cancel</button>
                    <button className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer" 
                    onClick={SendWebLink}
                    >Add Link</button>
                </div>
            </div>
            )}
        </div>
       
      </div>
      
      </div>
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
    </>
  )
}

export default BrainSection