import { useEffect, useState } from "react";
import PeriodicApiStore from "../Zustand/PeriodicApiStore";
import DeleteImg from "../assets/svg/DeleteBlack.svg";
import CloseIcon from "../assets/svg/Close.svg";
import VerifiedIcon from "../assets/svg/Verified.svg";
// import type { Dispatch, SetStateAction } from "react";
import { getLocalStorageItem,requestApi } from "@/services/authService";
import  DeleteConfirmationModal  from "../SubComponent/ReuseComponent/DeleteConfirmationModal";
import { FaFileAlt } from "react-icons/fa";
import { LuBrainCircuit } from "react-icons/lu";

import { useToast } from "@/hooks/use-toast";


import ISTTime from "@/components/shared-components/ISTTime";


interface FilesReportsProps {
  setShowProcessingFile: React.Dispatch<React.SetStateAction<boolean>>;
}



// interface FileItem {
//   id: string;
//   title: string;
//   status: "done" | "started";
//   created: string;
//   percentage: number;
// }

const FilesReports: React.FC<FilesReportsProps> = ({
  setShowProcessingFile
}) => {
  const {
    MeetingFileProcesser,
    FetchFileProcesser,
    MeetLoading,
    deleteLoading,
    DeleteFileProcesser,
  } = PeriodicApiStore();

  const { toast } = useToast();
  const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
     const [confirmDelete, setConfirmDelete] = useState(false);
     const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    FetchFileProcesser();
  }, [FetchFileProcesser]);

  // const handleDeleteFile = async (id: string) => {
  //   try {
  //     const result = await DeleteFileProcesser(id);
  //     if (result.success) {
  //       // toast.success(result?.message);
  //       toast({
  //         title: "Success",
  //         description: result?.message || "cleared Successfully",
  //         variant: "success",
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: "Failed to delete file. Please try again.",
  //         variant: "error",
  //       });
  //     }
  //   }catch (error: unknown){
  //       const message =
  //         error instanceof Error ? error.message : "Delete error!";
  //       toast({
  //         title: "Error",
  //         description: message,
  //         variant: "error",
  //       });
  //     }
  // };
  
  const handleRemove = async (id: string) => {
    try {
      const result = await DeleteFileProcesser(id);
      toast({
          title: "Success",
          description: result?.message || "Data removed successfully",
          variant: "success",
        });
        FetchFileProcesser();

    } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Remove Error!";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
      }
  };

  const fileData = MeetingFileProcesser;
  
  // Calculate processing files count
  const processingFilesCount = fileData.filter(item => item.status !== "done").length;
  // useEffect(() => {
  //   setProcessingFilesCount(processingFilesCount);
  // }, [processingFilesCount]);

  const handleRemoveAll = async () => {
    
    try{
      const result = await requestApi(
        "POST",
        `${tenant_id}/salesenablement/clear/`,
        {option:"*"},
        "authService"
      )
      toast({
          title: "Success",
          description: result?.message || "All data cleared successfully",
          variant: "success",
      })
      FetchFileProcesser();
    }catch(err){
      console.error("Clear All Error:", err);
      const message =
          err instanceof Error ? err.message : "Clear All Error!";
        toast({
          title: "Error",
          description: message,
          variant: "error",
        });
    }
    }

   const confirmDeleteAction = async () => {
  try {
    setDeleting(true);
    await handleRemoveAll();
  } finally {
    setDeleting(false);
    setConfirmDelete(false);
  }
};

const cancelDelete = () => {
  setConfirmDelete(false);
};



  return (
   <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
  <div
    className="
      bg-gray-50
      w-full sm:max-w-xl
      h-full
      rounded-none sm:rounded-l-xl
      shadow-lg
      p-4 sm:p-6
      relative
      overflow-y-auto
    "
  >

    <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 z-10 p-2 px-5">
      <h2 className="text-base sm:text-lg font-semibold">
        {deleteLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></span>
            Deleting...
          </span>
        ) : (
          `Processing ${processingFilesCount} files`
        )}
      </h2>
      <div className="flex items-center gap-5">
        <button className="text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-sm p-2" onClick={() => setConfirmDelete(true)}>ClearAll</button>
      <button
        onClick={() => setShowProcessingFile(false)}
        disabled={deleteLoading}
        className={`${deleteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >

        <img src={CloseIcon} alt="close" className="w-4 h-4" />
      </button>
        </div>
    </div>

    {/* Body */}
    {MeetLoading ? (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    ) : fileData.length === 0 ? (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">No files to display</p>
      </div>
    ) : (
      <div className="space-y-3">
        {fileData.map((item) => (
          <div
            key={item.id}
            className={`
              flex flex-col sm:flex-row
              sm:justify-between sm:items-center
              gap-3
              bg-white
              rounded-md
              shadow
              px-4 py-3
              ${deleteLoading ? "opacity-70" : ""}
            `}
          >
            {/* <div className="flex gap-4 p-4 border rounded-xl shadow-sm bg-white"> */}

  <div className="flex items-start justify-center">
    <span className="h-10 w-10 flex items-center justify-center bg-purple-100 rounded-lg text-purple-600">
      {item.percentage === 100 ? <LuBrainCircuit /> : <FaFileAlt />}
    </span>
  </div>

  <div className="flex-1">
    <div className="flex justify-end items-center mb-2">
      {/* <h3 className="text-sm font-semibold text-gray-800">
        Brain Classification
      </h3> */}
      <div className="flex gap-1">

      <span
        className={`flex items-center gap-2 text-[11px] font-medium px-2 py-1 rounded-md
        ${
          item.status === "done"
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-blue-100 text-blue-700 border border-blue-400"
        }`}
      >
        {item.percentage === 100 ? <img src={VerifiedIcon} alt="done" className=" w-4 h-4" /> :
          <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
        }

        {item.status === "done" ? "COMPLETED" : "PROCESSING"}
      </span>
       <div>
      <button
                    onClick={() => handleRemove(item?.id)}
                    disabled={deleteLoading}
                    className={`p-1 ${
                      deleteLoading
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-100 rounded"
                    }`}
                  >
                    <img src={DeleteImg} alt="delete" className="w-4 h-4" />
                  </button>
    </div>
      </div>
    </div>

    <div className="grid grid-cols-[90px_1fr] gap-y-1 text-sm">

      <span className="text-[12px] text-[#535862]">Event:</span>
      <span className="font-medium truncate text-xs line-clamp-2">{item?.title}</span>

      <span className="text-[12px] text-[#535862]">Uploaded By:</span>
      <span className="font-medium truncate text-xs mt-0.5">{item?.uploaded_by}</span>

      {/* <span className="text-gray-500">Doc ID:</span>
      <span className="font-medium truncate text-xs text-gray-500">{item?.id}</span> */}

      <span className="text-[12px] text-[#535862]">Created:</span>
      <span className="font-medium truncate text-xs text-gray-500"><ISTTime utcString={item?.created ?? ""} /></span>


      <span className="text-[12px] text-[#535862]">Percentage:</span>
      <span className="font-medium truncate"><div className="flex items-center gap-2">
                      <div className="w-28 sm:w-32 h-2 bg-gray-200 rounded">
                        <div
                          className={`h-2 ${item.percentage === 100 ? "bg-green-500" : "bg-blue-500"} rounded transition-all duration-300`}
                          style={{ width: `${item?.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item?.percentage}%</span>
                    </div>
                    </span>

      <span className="text-[12px] text-[#535862]">Status:</span>
      <span className="font-medium truncate text-xs text-gray-500">{item?.status}</span>
    </div>
  </div>

{/* </div> */}
    
            {/* <div className="flex gap-3 items-start">
              {item.status === "done" ? (
                <img src={VerifiedIcon} alt="done" className="mt-1 w-4 h-4" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-gray-400 mt-1" />
              )}

              <div className="flex flex-col max-w-[220px] sm:max-w-[260px]">
                <span className="text-sm font-medium truncate">
                  {item.title}
                </span>
                <span className="text-xs text-gray-500">
                  <ISTTime utcString={item?.created ?? ""} />
                </span>
              </div>
            </div>

            <div className="flex justify-between sm:justify-end items-center gap-3">
              {item.status === "done" ? (
                <>
                  <span className="px-3 py-1 text-xs rounded bg-green-600 text-white">
                    Done
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={deleteLoading}
                    className={`p-1 ${
                      deleteLoading
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-100 rounded"
                    }`}
                  >
                    <img src={CloseIcon} alt="remove" className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-end sm:items-center gap-2">
             
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{item.percentage}%</span>
                      <div className="w-28 sm:w-32 h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-gray-500 rounded transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>

                    <button className="px-3 py-1 text-xs rounded text-gray-600 border border-gray-400 self-end">
                      {item.status}
                    </button>
                  </div>

             
                  <button
                    onClick={() => handleDeleteFile(item.id)}
                    disabled={deleteLoading}
                    className={`p-1 ${
                      deleteLoading
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-100 rounded"
                    }`}
                  >
                    <img src={DeleteImg} alt="delete" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div> */}
            
          </div>
        ))}
      </div>
    )}
  </div>
  <DeleteConfirmationModal
          isOpen={confirmDelete}
          onConfirm={confirmDeleteAction}
          onCancel={cancelDelete}
          loading={deleting}
          message="Are you sure you want to clear all processed files?"
          />

</div>

  );
};

export default FilesReports;