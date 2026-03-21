import React, { useEffect, useState } from "react";

interface CustomCheckboxProps<T = string> {
  label?: string;
  value?: T[];
  options?: T[];
  onChange?: (newValues: T[]) => void;
}

const CustomCheckbox = <T,>({
  label = "",
  value = [],
  options = [],
  onChange,
}: CustomCheckboxProps<T>) => {
  const [selectedValues, setSelectedValues] = useState<T[]>(value);

  useEffect(() => {
    setSelectedValues(Array.isArray(value) ? value : []);
  }, [value]);

  const handleChange = (checked: boolean, option: T) => {
    const updatedValues = checked
      ? [...selectedValues, option]
      : selectedValues.filter((v) => v !== option);

    setSelectedValues(updatedValues);
    onChange?.(updatedValues);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-gray-800">{label}</span>}

      <div className="flex items-center gap-4 flex-wrap">
        {options.map((option) => (
          <label key={String(option)} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              value={String(option)}
              checked={selectedValues.includes(option)}
              onChange={(e) => handleChange(e.target.checked, option)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{String(option)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CustomCheckbox;
