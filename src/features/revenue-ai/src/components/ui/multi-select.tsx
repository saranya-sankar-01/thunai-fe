import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const MultiSelect = ({
    options,
    selectedValues,
    onSelectionChange,
    placeholder = "Select options..."
}: {
    options: any[];
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (optionValue: string) => {
        const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter(val => val !== optionValue)
            : [...selectedValues, optionValue];

        onSelectionChange(newValues);
    };

    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            const option = options.find(opt => (opt.value || opt) === selectedValues[0]);
            return option?.label || selectedValues[0];
        }
        return `${selectedValues.length} selected`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            // Check if the click is outside the dropdown
            if (!target.closest('[data-multiselect-dropdown]')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" data-multiselect-dropdown>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300 rounded-md px-3 py-2 text-left flex items-center justify-between hover:border-indigo-200 transition-colors"
            >
                <span className="text-sm text-gray-700 truncate">
                    {getDisplayText()}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option, idx) => {
                        const optionValue = option.value || option;
                        const optionLabel = option.label || option;
                        const isSelected = selectedValues.includes(optionValue);

                        return (
                            <div
                                key={idx}
                                onClick={() => toggleOption(optionValue)}
                                className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                    }`}
                            >
                                <span className="text-sm">{optionLabel}</span>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-indigo-600" />
                                )}
                            </div>
                        );
                    })}

                    {options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No options available
                        </div>
                    )}
                </div>
            )}

            {/* Selected count indicator */}
            {selectedValues.length > 0 && (
                <div className="text-xs text-indigo-600 mt-1">
                    {selectedValues.length} option{selectedValues.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
};

export default MultiSelect;