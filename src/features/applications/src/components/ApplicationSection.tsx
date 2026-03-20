import { useEffect } from "react";
import ApplicationCard from "../components/ApplicationCard";
import { useApplicationStore } from "../store/applicationStore";
import { CategoryItem } from "../types/CategoryItem";
import { isAppConnected } from "../utils/helpers";

interface ApplicationSectionProps {
  viewMode: string;
  activeTab: CategoryItem[];
  query: string;
}
const ApplicationSection: React.FC<ApplicationSectionProps> = ({
  viewMode,
  activeTab,
  query,
}) => {
  const { applications, loading, loadFiles } = useApplicationStore();

  useEffect(() => {
    const categoryFilterActive =
      activeTab.length > 0 && !activeTab.some((item) => item.text === "All");
    const nameFilterActive = query.trim() !== "";
    const filters = [];

    if (categoryFilterActive) {
      filters.push({
        key_name: "categories",
        key_value: activeTab.map((t) => t.text),
        operator: "in",
      });
    }

    if (nameFilterActive) {
      filters.push({
        key_name: "name",
        key_value: query,
        operator: "like",
      });
    }

    loadFiles(filters);
  }, [loadFiles, activeTab, query]);

  const sortedApplications = applications.sort((a, b) => {
    const aConnected = Number(isAppConnected(a));
    const bConnected = Number(isAppConnected(b));
    return bConnected - aConnected;
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="overflow-y-auto overflow-x-hidden h-[calc(100vh-320px)] lg:h-[calc(100vh-180px)]">
        {loading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center mr-2">
              <div className="w-10 h-10 border-4 border-t-indigo-500 border-r-indigo-500 border-b-indigo-200 border-l-indigo-200 rounded-full animate-spin"></div>
            </div>
            Loading...
          </div>
        ) : (
          <div
            className={`mt-2 p-2 ${viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              : "flex flex-col space-y-4"
              }`}
          >
            {sortedApplications.map(
              (app) => (
                <ApplicationCard
                  key={app.id}
                  viewMode={viewMode}
                  application={app}
                  categories={app.categories}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationSection;
