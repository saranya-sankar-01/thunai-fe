import React, { FC } from "react";
import Select, { SingleValue, MultiValue } from "react-select"; 

interface DropdownProps {
  heading: string;
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];  
  isMulti?: boolean;  
  value: SingleValue<{ value: string; label: string }> | MultiValue<{ value: string; label: string }> | null; 
  onChange: (selectedOption: SingleValue<{ value: string; label: string }> | MultiValue<{ value: string; label: string }> | null) => void; 
}

const Dropdown: FC<DropdownProps> = ({
  heading,
  label,
  placeholder,
  options,
  isMulti = false, 
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2 p-1">
      <h3 className="font-semibold text-gray-900">{heading}</h3>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        options={options}
        isMulti={isMulti}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `${label}...`}
        className="w-full text-black mb-4"
        classNamePrefix="react-select"
          menuPlacement="auto" 
            isClearable={true}   
      />
    </div>
  );
};

export default Dropdown;
