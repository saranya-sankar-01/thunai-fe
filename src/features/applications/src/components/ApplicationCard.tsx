import { ApplicationItem } from "../types/ApplicationItem";
import { isAppConnected } from "../utils/helpers";
import { Link } from "react-router-dom";

interface ApplicationCardProps {
  viewMode: string;
  categories: string[];
  application: ApplicationItem;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  viewMode,
  categories,
  application
}) => {
  const { name, logo, display_name, details } = application;
  return (
    <Link
      to={`/applications/integration/app-integration/app-overview?name=${name}`}
      className="block"
    >
      <div
        className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer overflow-hidden relative ${viewMode === "grid" ? "flex flex-col" : "flex flex-row items-center p-4"
          }`}
      >
        <div
          className={`hover: cursor-pointer ${viewMode === "grid" ? "w-full flex flex-col" : "flex-1"
            }`}
        >
          <div className="px-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="ml-0">
                <img
                  loading="lazy"
                  src={logo}
                  alt={display_name}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="flex-1 flex flex-row">
                <div>
                  <h2 className="text-base font-medium text-gray-800 hover:text-blue-600 transition-colors font-inter leading-4">
                    {display_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 relative">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] bg-[#F2F5F8] text-[#2B303B]">
                      {categories.length > 0 && categories[0]}
                    </span>
                    <div className="relative group">
                      {categories.length > 1 && (
                        <button className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] bg-[#F2F5F8] text-[#2B303B] cursor-pointer whitespace-nowrap">
                          {categories.length - 1} More
                        </button>
                      )}

                      <div className="absolute top-full left-0 mt-1 flex flex-wrap gap-2 p-2 rounded-lg bg-white border border-gray-200 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-10 max-w-xs">
                        {categories.slice(1).map((cat) => (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs bg-[#F2F5F8] text-[#2B303B] border border-gray-100 cursor-default whitespace-nowrap"
                            key={cat}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p
              className={`text-[12px] text-[#525866] font-inter font-normal leading-[18px] ${viewMode === "grid"
                ? "mt-3 line-clamp-3 flex-grow"
                : "mt-1 line-clamp-2"
                }`}
            >
              {details?.description}
            </p>
          </div>
        </div>
        {(isAppConnected(application)) && (
          <div className="absolute -top-px right-1 z-10">
            <span className="text-[9px] font-medium text-blue-600 bg-blue-100 rounded-tr-xl rounded-bl-lg px-2 py-0.5 inline-block">
              <span>Connected</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ApplicationCard;
