// components/ProcessingFilesSlider.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Hourglass, Trash2, Loader2 } from "lucide-react";
import { getTenantId, requestApi, requestStreamApi } from "@/services/authService";
import ISTTimeWithMin from "./shared-components/ISTTimeWithMin";

const Loader = () => <Loader2 className="w-4 h-4 animate-spin" />;

const getStatusColor = (status) => {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "extracted":
      return "bg-green-100 text-green-800 border-green-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "processing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "pending":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ProcessingFilesSlider = ({ onRefresh ,show, onClose, processingFilesData, totalProcessingFiles, isLoading }) => {
  const tenantID = getTenantId()
  // const [processingFilesData, setProcessingFilesData] = useState([]);
  // const [totalProcessingFiles, setTotalProcessingFiles] = useState(0);
  const [isClearingAll, setIsClearingAll] = useState(false); // State for "Clear all" loader
  const [clearingFileId, setClearingFileId] = useState(null); // State for individual file loader
  // const [isLoading, setIsLoading] = useState(false)
const [isFirstLoad, setIsFirstLoad] = useState(true);

  //   try {
  //     const payload = {
  //       filter: [],
  //       page: {
  //         size: 10,
  //         page_number: 1,
  //       },
  //       sort: "desc",
  //       sortby: "updated",
  //     };
  //     // https://api.thunai.ai/brain-service/brain/knowledge-base-alerts/stream/thunai1756131581990/
  //     const res = await requestApi(
  //       "POST",
  //       `brain/knowledge-base-alerts/stream/${tenantID}/`,
  //       payload,
  //       "brainService"
  //     );
  //     const result = res.data;

  //     setProcessingFilesData(result.data.data || []);
  //     setTotalProcessingFiles(result.data.is_processing || 0);
  //   } catch (error) {
  //     console.error("Error fetching processing status:", error);
  //   }
  // };
// const fetchProcessingStatus = async () => {
//   if (isFirstLoad) {
//     setIsLoading(true);
//   }
//   try {
//     const payload = {
//       filter: [],
//       page: {
//         size: 1000,
//         page_number: 1,
//       },
//       sort: "desc",
//       sortby: "updated",
//     };

//     await requestStreamApi(
//       "POST",
//       `brain/knowledge-base-alerts/stream/${tenantID}/`,
//       payload,
//       "brainService",
//       (data) => {
//         setProcessingFilesData(data.data || []);
//         setTotalProcessingFiles(data.is_processing || 0);
//          if (isFirstLoad) {
//           setIsLoading(false);
//           setIsFirstLoad(false);
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching processing status:", error);
//   }finally{
//     setIsLoading(false)
//   }
// };

//   useEffect(() => {
//     let intervalId;
//     if (show) {
//       fetchProcessingStatus();
//       // intervalId = setInterval(fetchProcessingStatus, 10000);
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [show, tenantID]);

  const handleClear = async (optionType, fileId = null) => {
    try {
      let payload;
      if (optionType === "unique" && fileId) {
        setClearingFileId(fileId); // Show loader for this specific file
        payload = {
          option: "unique",
          id: fileId,
        };
      } else if (optionType === "all") {
        setIsClearingAll(true); // Show loader for "Clear all"
        payload = {
          option: "*",
        };
      } else {
        console.error("Invalid clear option or missing file ID.");
        return;
      }

      await requestApi(
        "POST",
        `${tenantID}/knowledgebase/clear/`,
        payload,
        "authService"
      );
      console.log(
        `Successfully cleared: ${
          optionType === "unique" ? `file ID ${fileId}` : "all files"
        }`
      );
     if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error clearing files:", error);
    } finally {
      setIsClearingAll(false); // Hide "Clear all" loader
      setClearingFileId(null); // Hide individual file loader
    }
  };

  return (
    <>
      <div
        className={`
        fixed inset-y-0 right-0 z-50
        w-full sm:w-[450px]
        bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${show ? "translate-x-0" : "translate-x-full"}
        px-3 
      `}
      >
        <div className="flex items-center justify-between  border-b py-2">
          <h3 className="text-base font-semibold text-gray-900">
            Processing {totalProcessingFiles} files
          </h3>
          <div className="flex items-center space-x-2">
            {/* {processingFilesData.length > 0 && (
              <Button
                variant="link"
                onClick={() => handleClear("all")}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                disabled={isClearingAll} // Disable button while clearing
              >
                {isClearingAll ? <Loader /> : "Clear all"}
              </Button>
            )} */}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="pt-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto">
          {isLoading ? (  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>):(
          processingFilesData.length > 0 ? (
            processingFilesData.map((file) => (
              <Card key={file.id} className="shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.status === "done" ? (
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                    ) : (
                      <div className="relative flex items-center h-5 w-5">
                        <div className="h-4 w-4 rounded-full border border-gray-300 bg-white"></div>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 w-[150px] sm:w-[180px] truncate">
                        {file.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        <ISTTimeWithMin utcString={file?.updated} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end space-x-2">
                    {" "}
                    {/* This div holds the percentage/status block and trash icon */}
                    <div className="flex flex-col items-end space-y-1">
                      {" "}
                      {/* This div stacks percentage/progress and status badge */}
                      {file.status !== "done" &&
                        file.percentage !== undefined && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-700">
                              {file.percentage}%
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${file.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      <Badge
                        className={`${getStatusColor(
                          file.status
                        )} text-xs px-2 py-1 rounded-md border`}
                      >
                        {file.status}
                      </Badge>
                    </div>
                    {/* Trash Icon */}
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleClear("unique", file.id)}
                      disabled={clearingFileId === file.id}
                    >
                      {clearingFileId === file.id ? (
                        <Loader />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No files currently processing.
            </p>
          ))}
        </div>
      </div>
      {/* Backdrop for Processing Files Slider */}
      {show && <div className="fixed inset-0 z-40" onClick={onClose} />}
    </>
  );
};

export default ProcessingFilesSlider;
