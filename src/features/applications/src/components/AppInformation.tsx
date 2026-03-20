interface AppInformationProps {
  loading: boolean;
  description: string;
}

const AppInformation: React.FC<AppInformationProps> = ({
  loading,
  description,
}) => {
  return (
    <div className="w-full">
      {loading ? (
        <div
          className="w-3/4 h-8 bg-gray-300 rounded animate-pulse mb-2"
          aria-hidden="true"
        ></div> //Skeleton
      ) : (
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Details</h1>
      )}
      {loading ? (
        <div className="space-y-2">
          <div
            className="w-full h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"
            aria-hidden="true"
          ></div>
        </div> // Skeleton
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed">
          {description ?? ""}
        </p>
      )}
    </div>
  );
};

export default AppInformation;
