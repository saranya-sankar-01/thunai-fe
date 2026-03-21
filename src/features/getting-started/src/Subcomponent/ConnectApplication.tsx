// import React,{useEffect} from 'react'
import FileDownloadIcon from "../assets/svg/Filedownload.svg";
import { Check } from "lucide-react";

import ApplicationData from "../Store/ApplicationData"

interface Application {
  id: string;
  name?: string;
  display_name?: string;
  logo?: string;
  description?: string;
  [key: string]: unknown;
}

const ConnectApplication = ({ CIndex, ApplicationList, isLoading }: 
  { CIndex: number, ApplicationList: Application[], isLoading: boolean }) => {
    
    const {toggleSelectedApp, SelectedApps} = ApplicationData();
    
  return (
    <>
     <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-md border-2 border-gray-200">
       <div className="h-full lg:h-[calc(70vh-170px)] scrollbar-thin overflow-y-scroll">
         <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium flex-shrink-0">
          {CIndex}
        </span>
        Connect Your Applications
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg mb-2">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
          <img src={FileDownloadIcon} alt="file download" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
        <p className="text-xs sm:text-[14px] text-gray-500">
          Which applications do you use? Select one or many to connect with Thunai for seamless integration and workflow automation.
        </p>
        </div>
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold">Select Applications to Connect</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
        {ApplicationList.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 col-span-full text-sm sm:text-base py-4">No applications found.</p>
        )}
        {isLoading && (
          <p className="text-center text-gray-500 col-span-full text-sm sm:text-base py-4">Loading applications...</p>
        )}
  {ApplicationList.map((app: Application) => {
    const isSelected = SelectedApps.some((a) => a.id === app.id);
    return (
      <div
        key={app.id}
        className={`flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border-2 min-w-0 ${
          isSelected
            ? "bg-blue-50 border-blue-400"
            : "bg-white border-gray-200"
        }`}
        onClick={() => toggleSelectedApp(app)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <img
            src={app.logo}
            alt={app.name}
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">{app.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 truncate">
              {app.description}
            </p>
          </div>
        </div>
        {isSelected && (
          <div className="ml-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="sm:w-4 sm:h-4 text-white" />
          </div>
        )}
      </div>
    );
  })}
</div>
</div>
        </div>
    </>
  )
}

export default ConnectApplication