import { useState } from "react";
import {getLocalStorageItem,requestApi } from "@/services/authService";
import { FaArrowRightLong } from "react-icons/fa6";

import Group from "../assets/image/Group.png";
import OutWard from "../assets/svg/Arrow_outward.svg";
import UpArrow from "../assets/svg/Arrow_upward.svg";
import LightBulb from "../assets/svg/Lightbulb_circle.svg";
import Close from "../assets/svg/Close.svg";
import AutoAweSome from "../assets/svg/Auto_awesome.svg";


const ResearchMeeting = ({
  setSelectedResearchItem,
  handleReload,
}: {
  setSelectedResearchItem: (value: boolean) => void;
  handleReload: () => void;
}) => {
  const [receiveData, setReceiveData] = useState(false);
  const [filterResData, setFilterResData] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const [value, setValue] = useState("");
  
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  
  const GoToResult = () => {
    setReceiveData(false);
    setSelectedResearchItem(false);
    handleReload();
  };

  const FetchResearchData = async () => {
    if (!value.trim()) return;

    const payload = {
      prompt: value,
      areas_to_analyse: null,
      pitching_topic: null,
      where_to_analyse: null,
    };
    setIsLoad(true);

    try {
      const response = await requestApi(
        "post",
        `${tenant_id}/research/`,
        payload,
        "authService"
      );
      const data = response?.data;
      // console.log("Research response data:", data);

      if (data?.call_id) startFilterPolling(data?.call_id);
    } catch (error) {
      console.error("Error fetching research data:", error);
      setIsLoad(false);
    }
  };

  const startFilterPolling = (call_id: any) => {
    let count = 0;
    setIsLoad(true);

    const interval = setInterval(async () => {
      if (count >= 4) {
        clearInterval(interval);
        setIsLoad(false);
        setReceiveData(true);
        return;
      }

      await CallFilterApi(call_id);
      count++;
    }, 7000);
  };

  // === Filter API ===
  const CallFilterApi = async (call_id: any) => {
    const payload = {
      call_id,
      filter: [],
      page: { size: 10, page_number: 1 },
      sort: "asc",
      sortby: "created",
    };

    try {
      const Res =await requestApi(
        "POST",
        `${tenant_id}/research/filter/`,
        payload,
        "authService"
      );
      const data = Res?.data;
      // setFilterResData(data);
      console.log("Research Filter response data:", data);

      if (data?.results && data?.results.length > 0) {
        clearInterval;
        setIsLoad(false);
        setFilterResData(true);
      }

    } catch (error) {
      console.error("Error in CallFilterApi:", error);
    }
  };

  const handleSend = () => {
    setReceiveData(false);
    FetchResearchData();
  };

  return (
   <>
  <div className="fixed inset-0 z-40 bg-black/20"></div>

  {!receiveData && (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md sm:max-w-lg md:max-w-xl bg-white p-4 sm:p-6 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <img
            src={Group}
            alt="Group"
            className="h-10 w-10 sm:h-14 sm:w-14"
          />
          <div className="flex gap-1">
            <h4 className="font-medium text-xs sm:text-base bg-gradient-to-r from-[#2F45FF] to-[#12CBF5] bg-clip-text text-transparent">
              Research Assistant
            </h4>
            <p className="text-sm sm:text-sm font-medium text-[#2F45FF] flex items-center gap-1 cursor-pointer"
            onClick={() => window.open("https://docs.thunai.ai/article/82-conducting-research-with-meeting-agents-in-thunai", "_blank")}>
              <img
                src={OutWard}
                alt="Arrow"
                className="w-3 sm:w-4 h-3 sm:h-4 hover:size-5"
              />
            </p>
          </div>
        </div>

        <img
          src={Close}
          alt="Close"
          className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer"
          onClick={() => setSelectedResearchItem(false)}
        />
      </div>

      <div className="relative mb-4">
        <textarea
          placeholder="What do you want to search..."
          rows={3}
          className="resize-none w-full border border-[#D5D7DA] rounded-md p-2 pl-10 sm:pl-12 text-sm sm:text-base focus:outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <img
          src={AutoAweSome}
          alt="Magic"
          className="absolute top-2 left-2 sm:left-3 w-4 sm:w-5 h-4 sm:h-5"
        />
        <div
          className="absolute right-2 bottom-2 sm:bottom-3 h-8 w-8 sm:h-9 sm:w-9 bg-[#2F45FF] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1d32cc]"
          >
          {
            isLoad ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent border-b-transparent rounded-full animate-spin"></div>
            ):(
              <img
              src={UpArrow}
              alt="Send"
              className="h-3 sm:h-4 w-3 sm:w-4 text-white"
              onClick={handleSend}
          />
            )
          }
          
        </div>
      </div>

      <div className="flex justify-between gap-2 text-xs sm:text-sm text-gray-700">
        <p className="flex items-center gap-1 font-medium text-[#717680]">
          <img
            src={LightBulb}
            alt="Idea"
            className="w-4 sm:w-5 h-4 sm:h-5"
          />
          Research
        </p>

        <span>
        {isLoad && (
       <div className="text-[13px] text-gray-700 animate-pulse">
        <span className="font-semibold text-[#2F45FF]">Research in Progress...</span>
        <br />
         <span className="text-gray-600">Fetching details, please wait…</span>
        </div>
            ) }
        </span>
      </div>
    </div>
  )}

  {receiveData && (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md sm:max-w-lg md:max-w-xl bg-white p-4 sm:p-6 rounded-lg shadow-lg z-50">
      {filterResData ? (
    <div className="text-center">
    <h1 className="font-semibold text-base sm:text-lg mb-2">
      Research in Progress
    </h1>
    <p className="text-sm text-gray-600">
      Data not generated yet, it might take some time.
    </p>
    <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">{value}</p>
    <button
      className="py-1 px-4 sm:py-2 sm:px-5 bg-blue-500 text-white rounded mt-3 hover:bg-blue-600 text-sm sm:text-base flex items-center gap-2 mx-auto"
      onClick={GoToResult}
    >
      <FaArrowRightLong />
      OK
    </button>
  </div>
) : (
  <div>
    <h1 className="font-bold text-base sm:text-lg mb-2">Research Result</h1>
    <p className="flex items-center text-sm sm:text-base text-gray-700 gap-1">
      You can see the research result under
      <span className="font-bold text-blue-500 mx-1">My Feed</span>
      <FaArrowRightLong />
    </p>
    <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">{value}</p>
    <button
      className="py-1 px-4 sm:py-2 sm:px-5 bg-blue-500 text-white rounded mt-3 hover:bg-blue-600 text-sm sm:text-base"
      onClick={GoToResult}
    >
      OK
    </button>
  </div>
)}

    </div>
  )}
</>

  );
};

export default ResearchMeeting;
