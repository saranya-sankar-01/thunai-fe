import React from 'react'
import { format } from 'date-fns';

type ConfigurationDateProps = {
    title: string;
    date: string
}
const ConfigurationDate: React.FC<ConfigurationDateProps> = ({ title, date }) => {
    return (
        <div className="text-xs md:text-sm text-gray-500 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center space-x-2">
                <span className="whitespace-nowrap">{title}:</span>
                <span className="text-gray-700 md:font-medium">{`${date === "Indefinite" ? "Indefinite" : format(date, "MMM dd, yyyy, hh:mm a")}`}</span>
            </div>
        </div>
    )
}

export default ConfigurationDate