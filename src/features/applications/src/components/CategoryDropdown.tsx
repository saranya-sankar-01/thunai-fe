import { useState } from "react";
import type { CategoryItem } from "../types/CategoryItem";

interface CategoryDropdownProps {
  categories: CategoryItem[];
  activeTab: CategoryItem[];
  onActiveTab: (tab: CategoryItem) => void;
}
const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  activeTab,
  onActiveTab,
}) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);

  const handleViewMenu = () => {
    setViewMenu((prev) => !prev);
  };
  return (
    <div className="relative w-full mt-4">
      <button
        onClick={handleViewMenu}
        className="w-full flex justify-between items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="truncate max-w-[150px]">
          {activeTab.map((tab) => tab.text).join(", ")}
        </span>
        <svg
          className="-mr-1 ml-2 h-5 w-5 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {/* Dropdown Menu */}
      {viewMenu && (
        <div className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <label
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer select-none"
                key={category.text}
              >
                <input
                  checked={activeTab.includes(category)}
                  type="checkbox"
                  onChange={() => onActiveTab(category)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {category.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
