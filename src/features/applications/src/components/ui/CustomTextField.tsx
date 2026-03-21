import React from "react";
interface CustomTextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: any[]; // kept for compatibility, even if not used
  display?: boolean;
}
const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label = "Enter value",
  placeholder = "Please enter a value",
  value = "",
  onChange,
  options = [],
  display = true,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  if (!display) return null;
  return (
    <div className="flex flex-col">
      {label && <label className="font-medium text-md mb-1">{label}</label>}
      <input
        type="text"
        className="border text-sm p-2 rounded shadow-md focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default CustomTextField;
