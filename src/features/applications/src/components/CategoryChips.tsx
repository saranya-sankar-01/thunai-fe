import React from "react";

interface CategoryChipsProps {
  loading: boolean;
  categories: string[];
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  loading,
  categories,
}) => {
  return (
    <div className="border-t pt-6 border-gray-300">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <div className="space-y-2 w-full">
            <div
              className="w-24 h-6 bg-gray-300 rounded-full animate-pulse"
              aria-hidden="true"
            ></div>
            <div
              className="w-32 h-6 bg-gray-300 rounded-full animate-pulse"
              aria-hidden="true"
            ></div>
            <div
              className="w-28 h-6 bg-gray-300 rounded-full animate-pulse"
              aria-hidden="true"
            ></div>
          </div>
        ) : (
          categories?.map((category) => (
            <span
              className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-100"
              key={category}
            >
              {category}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryChips;
