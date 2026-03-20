import React from 'react'

interface ConfigurationButtonProps {
    source: string,
    action: string,
    onClick: () => void
}

const ConfigurationButton: React.FC<ConfigurationButtonProps> = ({ source, action, onClick }) => {
    return (
        <button className="flex items-center cursor-pointer text-blue-500 hover:text-blue-600 transition-colors duration-200" onClick={onClick}>
            <img src={source} alt="Edit" />
            <span className="ml-1 text-sm">{action}</span>
        </button>
    )
}

export default ConfigurationButton