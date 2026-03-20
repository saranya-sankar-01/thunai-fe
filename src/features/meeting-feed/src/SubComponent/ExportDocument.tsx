import { useState, useRef } from "react";
import CallScoreExport from "./CallScoreExport";

interface ExportDocumentProps {
  CancelExportData: () => void;
  selectedItem: any;
  sentimental?: any;
  getCalls?: any;
  // scoreAnalysis?: any;
}

const ExportDocument: React.FC<ExportDocumentProps> = ({
  CancelExportData,
  selectedItem,
  sentimental,
  getCalls,
  // scoreAnalysis,
}) => {
  const callScoreRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const SendTemplate = async () => {
  setLoading(true);
  setExportStatus("idle");
  setErrorMsg("");

  try {
    const exportFn = callScoreRef.current?.SendCallScoreData;

    if (typeof exportFn !== "function") {
      throw new Error("Export service is unavailable at the moment.");
    }

    const result = await exportFn();

    if (result?.success) {
      setExportStatus("success");

      setTimeout(() => {
        CancelExportData();
      }, 3000);

      return;
    }

    throw new Error(
      result?.message || "Unable to generate the report. Please try again."
    );

  } catch (error: any) {
    console.error("Call score report export failed:", {
      error,
      timestamp: new Date().toISOString(),
    });

    setExportStatus("error");
    setErrorMsg(
      error?.message || "Something went wrong while exporting the report."
    );
  } finally {
    setLoading(false);
  }
};


  const getStatusMessage = () => {
    if (errorMsg) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 font-medium">{errorMsg}</p>
        </div>
      );
    }

    switch (exportStatus) {
      case "success":
        return (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-700 font-medium">
              Report generated successfully! Download should start automatically.
            </p>
          </div>
        );
      case "error":
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 font-medium">
              Failed to generate report. Please try again.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[650px] h-[90vh] flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-600 rounded-full w-10 h-10 animate-spin"></div>
              <p className="mt-3 text-blue-600 font-medium">Generating PDF...</p>
              <p className="text-sm text-gray-600 mt-1">This may take a few seconds</p>
            </div>
          </div>
        )}

        <div className="p-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col">
            <h3 className=" text-[20px] font-semibold text-xl mb-2 text-gray-800 flex items-center">Export Document</h3>
            <p className="text-sm text-gray-600">
              Preview Call Score Analysis before exporting
            </p>
          </div>

          {getStatusMessage()}

          <div className="mt-4">
            <h6 className="font-medium text-sm mb-1 text-[10px] text-gray-800">TEMPLATE</h6>
            <select
              className="px-3 py-2 outline-none border border-blue-200 rounded-md w-full text-sm text-gray-600"
              disabled={true}
            >
              <option value="CallScore" className="text-sm text-gray-600">
                Call Scoring Analysis
              </option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin p-5">
            <CallScoreExport
              ref={callScoreRef}
              // scoreAnalysis={scoreAnalysis}
              selectedItem={selectedItem}
              sentimental={sentimental}
              getCalls={getCalls}
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={CancelExportData}
              disabled={loading}
              className="px-6 py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={SendTemplate}
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Exporting...
                </span>
              ) : (
                "Export"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDocument;