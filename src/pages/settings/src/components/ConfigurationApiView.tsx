import React, { useState } from 'react';

import Copy from "../assets/images/content_copy.svg";
import EyeClose from "../assets/images/eye-close.svg";
import EyeOpen from "../assets/images/eye-icon.svg";
import Check from "../assets/images/check-blue.svg";

type ConfigurationApiViewProps = {
    apiValue: string
    viewKey?: boolean
    field: string
    setViewKey?: React.Dispatch<React.SetStateAction<{
        accessKey: boolean;
        accessSecret: boolean;
    }>>
}
const ConfigurationApiView: React.FC<ConfigurationApiViewProps> = ({ apiValue, viewKey, field, setViewKey }) => {
    const [copied, setCopied] = useState(false)
    const toggle = () => {
        setViewKey(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const copyToClipboard = (data: string) => {
        navigator.clipboard.writeText(data).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000)
        })
    }

    return (
        <div className="flex items-center justify-between border text-sm rounded-lg px-4 py-2 bg-gray-100 w-full">
            {field !== "tenantId" &&
                <>
                    <span className="block sm:hidden text-gray-800 truncate">
                        {viewKey ? `${apiValue?.slice(0, 5)}
                ${apiValue?.length > 5 ? "..." : ""}` : "*******"}
                    </span>
                    <span className="hidden sm:block text-gray-800 truncate">
                        {!viewKey ? `${apiValue?.slice(0, 50)}
                ${apiValue?.length > 50 ? "..." : ""}` : "*******"}
                    </span>
                </>
            }
            {field === "tenantId" &&
                <span className="hidden sm:block text-gray-800 truncate">
                    {apiValue}
                </span>
            }
            <div className="flex gap-2">
                <img src={copied ? Check : Copy} alt="copy" role='button' className="w-6 h-6 cursor-pointer transition-transform duration-200" onClick={() => copyToClipboard(apiValue)} />
                {field === "tenantId" ? <div className='w-6 h-6' /> :
                    <img src={!viewKey ? EyeClose : EyeOpen} alt={viewKey ? "Show Key" : "Hide Key"} role="button" className="w-6 h-6 cursor-pointer transition-transform duration-200" onClick={toggle} />}
            </div>
        </div>
    )
}

export default ConfigurationApiView