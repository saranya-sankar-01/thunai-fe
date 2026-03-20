import React from "react";
interface CustomSelectProps {
  label?: string;
  options?: Record<string, unknown>[] | string[];
  placeholder?: string;
  displayValue?: string; // key to display label
  returnValue?: string;  // key to return as value
  value?: string;
  onChange?: (value: any) => void;
}
const CustomSelect: React.FC<CustomSelectProps> = ({
  label = 'Select',
  options = [],
  placeholder = 'Please select an option',
  displayValue = '',
  returnValue = '',
  value = '',
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange?.(selectedValue);
  };
  console.log(options)
  return (
    <div className="flex flex-col">
      {label && <label className="font-medium text-md mb-1">{label}</label>}

      <select
        className="border text-sm p-2 rounded shadow-md focus:ring-2 focus:ring-blue-500"
        value={value ?? ''}
        onChange={handleChange}
      >
        {/* Default placeholder */}
        <option value="" disabled>
          {placeholder}
        </option>

        {/* Dynamic options */}
        {options.map((option, index) => {
          const optionValue =
            option?.[returnValue] || option?.widget_id || option?.gid || option;
          const optionLabel =
            option?.[displayValue] || option?.name || option;
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default CustomSelect;
