import type { CategoryItem } from "../types/CategoryItem";

interface CategoryTabsProps {
  categories: CategoryItem[];
  onActiveTab: (tab: CategoryItem) => void;
  activeTab: CategoryItem[];
}

const CategoriesTabs: React.FC<CategoryTabsProps> = ({
  categories,
  onActiveTab,
  activeTab,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {categories.map((category) => (
        <div
          key={category.text}
          onClick={() => onActiveTab(category)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${activeTab.map((c) => c.text).includes(category.text)
            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
            : "text-gray-700 hover:bg-gray-50"
            }`}
        >
          {category.text}
          {activeTab.map((c) => c.text).includes(category.text) &&
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
        </div>
      ))}
    </div>
  );
};

export default CategoriesTabs;
