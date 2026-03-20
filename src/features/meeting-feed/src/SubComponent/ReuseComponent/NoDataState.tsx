
import NoData from "../../assets/svg/NoData.svg";

const NoDataState = () => {
  return (
    <>
    <div className="w-full flex flex-col h-[50vh] items-center justify-center py-16 px-4">
      <img
        src={NoData}
        alt="No data"
        className="w-20 max-w-full mb-8 opacity-90"
      />

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
        No data available
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 text-center max-w-md leading-relaxed">
        It seems like there's nothing to display right now. Please check back
        later or add some data.
      </p>
    </div>
    </>
  )
}

export default NoDataState