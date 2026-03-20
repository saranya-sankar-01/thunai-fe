import React from "react";
import { Save, Check } from "lucide-react";

interface AutoSaveIndicatorProps {
  loadingAutoSave: boolean;
  showSaved: boolean;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  loadingAutoSave,
  showSaved,
}) => {
  return (
    (loadingAutoSave || showSaved) && (
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
        {loadingAutoSave ? (
          <>
            <div className="relative">
              <Save className="w-4 h-4 text-blue-600" />
              <div className="absolute inset-0 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Saving changes...
            </span>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Changes saved
            </span>
          </>
        )}
      </div>
    )
  );
};

export default AutoSaveIndicator;
