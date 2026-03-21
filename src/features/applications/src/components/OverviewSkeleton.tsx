import React from "react";

const OverviewSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col space-y-2">
          <div
            className="w-48 h-6 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
          <div className="flex space-x-4">
            <div
              className="w-24 h-4 bg-gray-300 rounded animate-pulse"
              aria-hidden="true"
            ></div>
            <div
              className="w-24 h-4 bg-gray-300 rounded animate-pulse"
              aria-hidden="true"
            ></div>
          </div>
        </div>
        <div
          className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"
          aria-hidden="true"
        ></div>
      </div>

      {/* Skeleton for Category Tag */}
      <div
        className="w-32 h-6 bg-gray-300 rounded-full animate-pulse mb-2"
        aria-hidden="true"
      ></div>

      {/* Skeleton for Summary Section */}
      <div className="p-6 rounded-lg bg-[#F3F3FF] shadow-md">
        <div className="flex items-center mb-3">
          <div
            className="w-6 h-6 bg-gray-300 rounded animate-pulse mr-3"
            aria-hidden="true"
          ></div>
          <div
            className="w-32 h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
        </div>
        <div className="space-y-2">
          <div
            className="w-full h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            className="w-full h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
        </div>
      </div>

      {/* Skeleton for Key Items Section (Topics, Action Items, Next Steps) */}
      <div className="mt-8">
        <div className="bg-white rounded-xl p-6 shadow-xl">
          {/* Example skeleton for a key item header */}
          <div
            className="w-24 h-4 bg-gray-300 rounded animate-pulse mb-6"
            aria-hidden="true"
          ></div>
          {/*  Example skeleton for list items */}
          <div className="space-y-4">
            <div
              className="w-full h-4 bg-gray-300 rounded animate-pulse"
              aria-hidden="true"
            ></div>
            <div
              className="w-full h-4 bg-gray-300 rounded animate-pulse"
              aria-hidden="true"
            ></div>
            <div
              className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSkeleton;
