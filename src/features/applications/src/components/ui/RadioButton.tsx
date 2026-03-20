import React, { useEffect, useState } from 'react'
interface RadioButtonProps {
    label?: string;
    value?: string | null;
    options?: string[];
    onChange?: (newValue: boolean | string | null) => void;
}
const RadioButton: React.FC<RadioButtonProps> = ({ label, value, options, onChange }) => {
    console.log(options)
    const [selectedValue, setSelectedValue] = useState<string | null>(value);

    // Sync internal state with parent value when it changes
    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleChange = (newValue: string) => {
        setSelectedValue(newValue);

        // Match Angular behavior: emit boolean for Yes/No, string otherwise
        if (newValue === "Yes") {
            onChange?.(true);
        } else if (newValue === "No") {
            onChange?.(false);
        }

        onChange?.(newValue);
    };
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <span className="text-sm font-medium text-gray-800">{label}</span>
            )}

            <div className="flex items-center gap-4">
                {options?.map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value={option}
                            checked={selectedValue === option}
                            onChange={() => handleChange(option)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

export default RadioButton