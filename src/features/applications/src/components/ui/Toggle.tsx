import React, { useEffect, useState } from 'react'
interface ToggleProps {
    label?: string;
    value?: boolean;
    onChange?: (newValue: boolean) => void;
}
const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => {
    const [isOn, setIsOn] = useState<boolean>(value);

    // Sync internal state with parent value when it changes
    useEffect(() => {
        setIsOn(value);
    }, [value]);

    const toggle = () => {
        const newValue = !isOn;
        setIsOn(newValue);
        onChange?.(newValue);
    };
    return (
        <div className="flex items-center p-2 rounded-md space-x-4">
            <label className="inline-flex items-center cursor-pointer">
                <div
                    onClick={toggle}
                    className={`w-10 h-5 rounded-full relative transition-all ${isOn ? "bg-blue-500" : "bg-gray-200"
                        }`}
                >
                    <div
                        className={`w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-0.5 left-0.5 transition-all ${isOn ? "translate-x-full" : ""
                            }`}
                    ></div>
                </div>
            </label>
            <span className="ml-3 text-sm text-gray-600 font-medium">{label}</span>
        </div>
    )
}

export default Toggle