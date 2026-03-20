import { useState, useEffect, useRef, FC } from "react";

interface Step2FieldsProps {
  selectedFields: string[];
  setSelectedFields: (fields: string[]) => void;
  customFields: string[];
  setCustomFields: (fields: string[]) => void;
}

const Step2Fields: FC<Step2FieldsProps> = ({
  selectedFields,
  setSelectedFields,
  customFields,
  setCustomFields,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const fields = [
    "Name",
    "First Name",
    "Last Name",
    "EmailId",
    "Mobile Number",
  ];

  // Toggle field selection
  const handleFieldChange = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as unknown as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newItem = inputValue.trim();
      if (!customFields.includes(newItem)) {
        setCustomFields([...customFields, newItem]);
      }
      setInputValue("");
    }
  };

  const removeItem = (indexToRemove: number) => {
    setCustomFields(customFields.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 mt-4" ref={dropdownRef}>
        <label className="block text-sm font-medium text-black mb-2">
          Select Default Fields
        </label>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full border text-black p-3 rounded-md text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>
              {selectedFields.length === 0
                ? "Choose fields..."
                : `${selectedFields.length} field(s) selected`}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-500 rounded-md shadow-lg max-h-60 overflow-auto">
              {fields.map((field) => (
                <label
                  key={field}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldChange(field)}
                    className="h-4 w-4 text-black bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-black text-sm">{field}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400 mt-2">
          Select one or more fields to include in the flow.
        </div>

        {selectedFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedFields.map((field) => (
              <span
                key={field}
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {field}
                <button
                  onClick={() => handleFieldChange(field)}
                  className="hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-black mb-2">
          Add Custom Fields
        </label>

        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a custom field and press Enter..."
            className="w-full border border-gray-700 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {inputValue && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              Press Enter ↵
            </div>
          )}
        </div>

        {customFields.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {customFields.map((field, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {field}
                  <button
                    onClick={() => removeItem(index)}
                    className="hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-400">
          Type a custom field and press Enter to add it.
        </div>
      </div>
    </div>
  );
};

export default Step2Fields;
