import Close from "../assets/svg/Close.svg";

const ViewAnalysis = ({
  sentimental,
  onClose,
}: {
  sentimental: any;
  onClose: any;
}) => {
  const viewDetails = sentimental?.sentiment_reasoning || [];
  const sentimentOrder: any = {
  negative: 1,
  positive: 2,
  neutral: 3,
};

const sortedDetails = [...viewDetails].sort(
  (a, b) =>
    sentimentOrder[a.sentiment.toLowerCase()] -
    sentimentOrder[b.sentiment.toLowerCase()]
);


  const capitalize = (str: any) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getColorClasses = (sentiment: any) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-50 border-green-400 text-green-800";
      case "negative":
        return "bg-red-50 border-red-400 text-red-800";
      case "neutral":
        return "bg-yellow-50 border-yellow-400 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Sentiment Analysis Details
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Detailed breakdown of conversation sentiment
            </p>
          </div>

          <img
            src={Close}
            alt=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl ml-4 flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-pointer"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedDetails.map((detail: any, index: any) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm flex flex-col h-full"
              >
                <div
                  className={`flex justify-between items-center mb-3 p-2 sm:p-3 rounded border ${getColorClasses(
                    detail.sentiment
                  )}`}
                >
                  <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        detail.sentiment.toLowerCase() === "positive"
                          ? "bg-green-500"
                          : detail.sentiment.toLowerCase() === "negative"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    {capitalize(detail.sentiment)}
                  </h3>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {detail.percentage}%
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-700">
                    {detail.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 p-3 sm:p-4">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors w-full sm:w-auto cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAnalysis;
