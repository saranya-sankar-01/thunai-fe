import React from "react";
import { Info } from "lucide-react";
import AndroidIcon from "../assets/svg/AppStoreIcon.svg"; 
import PlayStoreIcon from "../assets/svg/PlayStoreIcon.svg";
import ChromeIcon from "../assets/svg/ChromeIcon.svg";

const IntegrationSection = React.memo(({ CIndex }: { CIndex: number }) => {

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-md border-2 border-gray-200">
      
      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium flex-shrink-0">
          {CIndex}
        </span>
        Integrations
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
          <Info size={16} />
        </div>
        <p className="text-xs sm:text-[14px] text-gray-500">
          Experience seamless access to powerful features on the go with our mobile app.
          Whether you're using Android or iOS, stay connected, manage tasks, and
          enhance productivity anytime, anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white border-2 border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <img src={PlayStoreIcon} alt="android" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-medium text-sm sm:text-base">Android App</h3>
              <p className="text-xs sm:text-sm text-gray-500">Get it on Google Play</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 cursor-pointer"
         onClick={() =>
  window.open(
    "https://play.google.com/store/apps/details?id=com.thunai.ai",
    "_blank"
  )
}
           >
            Downloads
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white border-2 border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <img src={AndroidIcon} alt="ios" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-medium text-sm sm:text-base">iOS App</h3>
              <p className="text-xs sm:text-sm text-gray-500">Download on App Store</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r cursor-pointer from-blue-500 to-cyan-400 text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90"
          onClick={() =>
  window.open(
    "https://apps.apple.com/us/app/thunai-ai/id6740311760",
    "_blank"
  )
}
>
            Download
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white border-2 border-gray-100 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <img src={ChromeIcon} alt="chrome" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base">Chrome Extension</h3>
            <p className="text-xs sm:text-sm text-gray-500">Add to your browser</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer text-xs sm:text-sm font-medium hover:bg-blue-600"
          onClick={() =>
        window.open(
        "https://chromewebstore.google.com/detail/thunai-ai/dobjjhfjgnijncinkbjkbgfndlgjlkab",
        "_blank"
        )
        }
        >
          Add
        </button>
      </div>
    </div>
  );
});

export default IntegrationSection;
