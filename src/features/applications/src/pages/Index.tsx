import { useCallback, useEffect, useState } from "react";
import Searchbar from "../components/Searchbar";
// import CategoryDropdown from "@/components/CategoryDropdown";
import CategoriesTabs from "../components/CategoriesTabs";
import ApplicationSection from "../components/ApplicationSection";
import ToggleViewButton from "../components/ToggleViewButton";
import { useCategoryStore } from "../store/categoryStore";
import { CategoryItem } from "../types/CategoryItem";
import { useDebounce } from "@/hooks/useDebounce";
import { useApplicationStore } from "../store/applicationStore";
import CategoryDropdown from "../components/CategoryDropdown";
import { getLocalStorageItem } from "../services/authService";
import { UserInfo } from "../types/UserInfo";
// import { getUserInfo } from "@/utils/helpers";
// import { UserInfo } from "@/types/UserInfo";

const Index: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [activeTab, setActiveTab] = useState<Array<CategoryItem>>([]);
  const [query, setQuery] = useState<string>("");

  const debouncedQuery = useDebounce(query, 500);
  const { categories, loadFiles, loading } = useCategoryStore();
  const { applications = [] } = useApplicationStore();

  const handleViewMode = (view: "list" | "grid") => {
    setViewMode(view);
  };

  const userInfo: UserInfo = getLocalStorageItem("user_info");

  const redirectToMCP = (): void => {
    const url = `https://mcp.thunai.ai/?token=${userInfo.access_token}` +
      `&tenantId=${userInfo.default_tenant_id}` +
      `&urlIdentifier=${userInfo.urlidentifier}` +
      `&userId=${userInfo.profile?.user_id}` +
      `&csrfToken=${userInfo.csrfToken}`;
    window.open(url, '_blank');
  }

  const handleActiveTab = useCallback(
    (tab: CategoryItem) => {
      setActiveTab((prev) => {
        const allCategory = categories.find(
          (cat) => cat.text.toLowerCase() === "all"
        );

        const isAllSelected = prev.some(
          (item) => item.text.toLowerCase() === "all"
        );
        const isTabAll = tab.text.toLowerCase() === "all";

        if (isTabAll) {
          // If user clicks 'all', reset activeTab to only 'all'
          return [allCategory];
        }

        // If 'all' is selected and user clicks other category,
        // remove 'all' and add the clicked category
        let updated: CategoryItem[];
        if (isAllSelected) {
          updated = [tab];
        } else {
          const exists = prev.some((item) => item.text === tab.text);
          if (exists) {
            updated = prev.filter((item) => item.text !== tab.text);
          } else {
            updated = [...prev, tab];
          }
        }

        // If nothing selected, fallback to 'all'
        if (updated.length === 0) {
          updated = [allCategory];
        }

        return updated;
      });
    },
    [categories]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (categories.length > 0 && activeTab.length === 0) {
      handleActiveTab(categories[0]);
    }
  }, [categories, handleActiveTab, activeTab.length]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white mb-4 md:mb-6">
        <h1 className="text-sm md:text-xl font-semibold mr-2">
          Application Directory
          {applications.length ? `(${applications.length})` : ""}
        </h1>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 ml-auto hover:to-indigo-700 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1" onClick={redirectToMCP}>
          MCP Tool
        </button>
        {/* Add View Toggle */}
        <ToggleViewButton viewMode={viewMode} onViewMode={handleViewMode} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="lg:hidden">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <Searchbar
              type="text"
              value={query}
              placeholder="Search Apps"
              onChange={(e) => setQuery(e.target.value)}
            />
            <CategoryDropdown
              categories={categories}
              activeTab={activeTab}
              onActiveTab={handleActiveTab}
            />
          </div>
          {/* Dropdown Filter */}
        </div>
        <div className="hidden lg:block w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
            <Searchbar
              type="text"
              value={query}
              placeholder="Search Apps"
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? <div className="w-full h-10 bg-gray-300 rounded animate-pulse mb-2"
              aria-hidden="true"></div> :
              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto mt-4" >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Categories</h3>
                <CategoriesTabs
                  categories={categories}
                  onActiveTab={handleActiveTab}
                  activeTab={activeTab}
                />
              </div>
            }
          </div>
        </div>
        <ApplicationSection
          viewMode={viewMode}
          activeTab={activeTab}
          query={debouncedQuery}
        />
      </div>

    </div>
  );
};

export default Index;
