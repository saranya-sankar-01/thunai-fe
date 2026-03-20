import React,{ useState } from "react";

// import * as XLSX from "xlsx/xlsx.mjs";
import * as XLSX from "xlsx";

import VisibleIcon from "../assets/svg/Visibility.svg";
import CancelIcon from "../assets/svg/Close.svg";

import type {
  ScoreAnalysis,
} from "../components/CallDetails";




interface KeyDataProps {
  scoreAnalysis: ScoreAnalysis | null;
}



const KeyData: React.FC<KeyDataProps> = ({ scoreAnalysis }) => {

  const [showPreview, setShowPreview] = useState(false);

  const exportToExcel = () => {
    if (!scoreAnalysis?.field_download_response?.length) return;

    const excelData = scoreAnalysis.field_download_response.map(item => ({
      Field: item.field || "-",
      Instruction: item.instruction || "-",
      extracted_value: item.extracted_value || "-"


    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "KeyData");
    XLSX.writeFile(workbook, "KeyData.xlsx");
  };

  return (
    <>
      <div className="flex items-center gap-3  justify-between bg-white border border-gray-300 px-5 py-3 mb-3 shadow-xl rounded-lg">
        <h1 className="text-[#181D27] font-semibold text-sm md:text-base">KeyData</h1>

        <button
          className="bg-blue-100 border border-blue-700 rounded-lg flex items-center gap-2 px-3 py-1"
          onClick={() => setShowPreview(true)}
        >
          <img src={VisibleIcon} alt="preview" className="size-5" />
          <span className="items-center text-sm md:text-md font-semibold text-[#2F45FF] h-[18px] cursor-pointer">Preview</span>
        </button>
      </div>

  
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg flex flex-col">

            <div className="flex items-start justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Preview Export Fields</h2>
                <p className="text-sm text-gray-500">
                  Review your data before exporting to Excel
                </p>
              </div>

              <img
                src={CancelIcon}
                alt="Close"
                className="cursor-pointer w-5 h-5"
                onClick={() => setShowPreview(false)}
              />
            </div>

            <div className="p-4 overflow-x-scroll scrollbar-thin">
         <table className="min-w-max border border-gray-200 text-sm">
  
    <thead className="bg-gray-50">
      <tr>
        {scoreAnalysis?.field_download_response?.map((item, index: number) => (

          <th
            key={index}
            className="border px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap"
          >
            {item.field || "-"}
          </th>
        ))}
      </tr>
    </thead>

  
    <tbody>
      <tr>
        {scoreAnalysis?.field_download_response?.map((item, index: number) => (
          <td
            key={index}
            className="border px-4 py-3 text-gray-600 whitespace-nowrap"
          >
            {item.extracted_value || "Not mentioned"}
          </td>
        ))}
      </tr>
    </tbody>
  </table>
</div>



            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                className="bg-green-700 text-white px-4 py-2 rounded-md"
                onClick={exportToExcel}
              >
                Export Excel
              </button>

              <button
                className="bg-gray-100 px-4 py-2 rounded-md"
                onClick={() => setShowPreview(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default KeyData;
