import { useState } from "react";

import Close from "../assets/svg/Close.svg";
import Recurring from "../assets/svg/Recurring.svg";

const UpcomingValue = ({ selectedEvent, handleClosePopup }: { selectedEvent: any; handleClosePopup: any }) => {
  const [showAll, setShowAll] = useState(false);

  const participants = selectedEvent?.participants || [];
  const visibleParticipants = showAll ? participants : participants.slice(0, 4);

  return (
<div className="fixed inset-0 flex items-center justify-center z-20 p-3">
  <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg relative border-2 border-gray-200">

    <img
      src={Close}
      alt="close.svg"
      onClick={handleClosePopup}
      className="absolute top-4 right-4 w-5 h-5 cursor-pointer hover:opacity-80"
    />

    <h2 className="text-lg font-bold text-[#2B303B] mb-0.5 break-words">
      {selectedEvent.summary || "Meeting Title"}
    </h2>
    <p className="text-gray-500 mb-1 break-words">{selectedEvent.email}</p>

    <div className="text-sm text-[#646668] mb-4 font-semibold">
      <p className="flex flex-wrap items-center gap-2 mb-4">
        <span>
          {new Date(selectedEvent.start)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()}
        </span>
        <span className="font-medium text-[#646668]">
          {new Date(selectedEvent.start).toLocaleString("en-IN", {
            timeStyle: "short",
          })}
          {" — "}
          {new Date(selectedEvent.end).toLocaleString("en-IN", {
            timeStyle: "short",
          })}
        </span>

        {selectedEvent.scheduled && (
          <span className="mt-1 px-2 py-0.5 bg-blue-50 rounded-2xl flex items-center border border-gray-300">
            <span className="text-[#646668] text-xs font-medium hover:text-blue-500 cursor-pointer flex gap-0.5">
              Recurring
              <img src={Recurring} alt="" />
            </span>
          </span>
        )}
      </p>
    </div>

    {/* Participants */}
    <div className="mb-4 border-b border-gray-200 pb-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <h3 className="font-semibold text-gray-700 text-lg">Participants</h3>

        <div className="flex flex-wrap gap-2 max-w-full">
          {visibleParticipants.map((sub: any, i: any) => (
            <div key={i} className="relative group">
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold cursor-pointer">
                {sub.email?.[0]?.toUpperCase() || "?"}
              </span>

              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                {sub.email}
              </div>
            </div>
          ))}

          {participants.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="h-8 px-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:underline"
            >
              {showAll ? "Show Less" : `+${participants.length - 4}`}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex justify-end gap-3 mt-4 flex-wrap">
      <button
        onClick={handleClosePopup}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
        >
        Cancel
      </button>
      <button className="px-4 py-2 bg-[#086CD0] text-white rounded-lg hover:bg-[#065bb5]"
        onClick={handleClosePopup}
      >
        Done
      </button>
    </div>
  </div>
</div>

  );
};

export default UpcomingValue;
