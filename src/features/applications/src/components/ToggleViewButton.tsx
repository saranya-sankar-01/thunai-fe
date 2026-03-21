import React from "react";
import { HiViewGrid, HiViewList } from "react-icons/hi";

interface ToggleViewButtonProps {
  viewMode: string;
  onViewMode: (string: "list" | "grid") => void;
}

const ToggleViewButton: React.FC<ToggleViewButtonProps> = ({
  viewMode,
  onViewMode,
}) => {
  return (
    <div className="flex items-center space-x-2 rounded-sm bg-gray-100 mx-1">
      <button
        onClick={() => onViewMode("grid")}
        className={`p-2 hover:text-blue-700 transition-colors ${
          viewMode === "grid" ? "text-blue-600" : "text-gray-400"
        }`}
      >
        <HiViewGrid />
      </button>
      <button
        onClick={() => onViewMode("list")}
        className={`p-2 hover:text-blue-700 transition-colors ${
          viewMode === "list" ? "text-blue-600" : "text-gray-400"
        }`}
      >
        <HiViewList />
      </button>
    </div>
  );
};

export default ToggleViewButton;
