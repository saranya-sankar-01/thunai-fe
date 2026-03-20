import { useState } from "react";

import Schedule from "../assets/svg/Schedule.svg";
import DownArrow from "../assets/svg/Keyboard_arrow_down1.svg";
import Person from "../assets/svg/Person.svg";

const Transcript = ({
  sentimental = {},
  onSelectTime,
}: {
  sentimental?: any;
  onSelectTime?: (start: any, end: any) => void;
}) => {
  const transcripts = sentimental?.transcription_with_timing || [];

  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  // const [activeRange, setActiveRange] = useState({
  //   start: null,
  //   end: null,
  // });

  const options = [
    { value: "all", label: "All", color: "bg-gray-400" },
    { value: "positive", label: "Positive", color: "bg-green-300" },
    { value: "neutral", label: "Neutral", color: "bg-yellow-300" },
    { value: "negative", label: "Negative", color: "bg-red-300" },
  ];

  const filteredData =filter === "all"
      ? transcripts
      : transcripts.filter((item: any) => item.sentiment === filter);
  return (
    <div className="px-3 h-full lg:h-[calc(90vh-192px)] pt-2">
      <div className="flex justify-between items-center bg-[#E8F1FF] py-2 px-7 mb-1">
        <h1 className="text-[#181D27] font-semibold text-sm md:text-base">
          Transcript
        </h1>

        <div className="relative w-30">
          <button
            onClick={() => setOpen(!open)}
            className="flex justify-between items-center w-[85px] px-1 py-1 rounded-lg bg-white text-[10px]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  options.find((o) => o.value === filter)?.color
                }`}
              ></span>
              {options.find((o) => o.value === filter)?.label}
            </div>
            <img src={DownArrow} className="size-5" />
          </button>

          {open && (
            <div className="absolute mt-1 left-3 w-[100px] shadow-md bg-white z-10">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-200 text-[10px]
                    ${filter === opt.value ? "bg-gray-100" : ""}`}
                >
                  <span className={`w-3 h-3 rounded-full ${opt.color}`}></span>
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-y-scroll h-[calc(81vh-200px)] scrollbar-thin scrollbar-thumb-gray-300">
        {filteredData.length > 0 ? (
          filteredData.map((item: any, index: number) => (
            <div key={index} className={`p-1 rounded-lg shadow-sm transition cursor-pointer`}
            onClick={() => {
                  onSelectTime?.(item.start, item.end);
                }}
                >
              {item.speaker && (
                <div className="flex items-center gap-1.5 pl-1.5 mb-1">
                  <img src={Person} alt="Speaker" className="w-4 h-4" />
                  <span className="text-xs font-semibold text-blue-600">
                    {item.speaker}
                  </span>
                </div>
              )}
              
              <div
                className={`text-sm text-gray-500  text-[11px] mt-1 flex items-center gap-2 p-1 
                  cursor-pointer 
                `}
                
              >
                <img src={Schedule} alt="" className="text-[12px]" />
                <span>
                  {item.start} - {item.end}
                </span>
                <span>|</span>

                {item.sentiment === "positive" ? (
                  <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-500 text-[10px] font-medium">
                    Positive
                  </span>
                ) : item.sentiment === "negative" ? (
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-500 text-[10px] font-medium">
                    Negative
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-500 text-[10px] font-medium">
                    Neutral
                  </span>
                )}
              </div>
              
              <p className="text-sm  text-gray-700 text-[14px] mb-2 pl-1.5">{item.text}</p>

            </div>
          ))
        ) : (
          <p className="text-gray-500 flex h-[300px] justify-center items-center">No transcripts found.</p>
        )}
      </div>
    </div>
  );
};

export default Transcript;
