
const LoadingComp = ({ Color = "#7A5AF8", height = "320px" }) => {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center mb-3 bg-white border border-gray-200 shadow-2xl rounded-xl"
    >
      <div
        style={{ borderTopColor: Color }}
        className="w-10 h-10 border-4 border-gray-300 rounded-full animate-spin"
      ></div>
    </div>
  );
};

export default LoadingComp;
