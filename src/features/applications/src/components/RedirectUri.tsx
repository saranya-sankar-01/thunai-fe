import { Tooltip } from '@mui/material'
import React, { useState } from 'react'
interface RedirectUriProps {
    uriValue: string

}
const RedirectUri: React.FC<RedirectUriProps> = ({ uriValue }) => {
    const [copied, setCopied] = useState<boolean>(false);

    const copyToClipboard = (data: string) => {
        navigator.clipboard.writeText(data).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000)
        })
    }
    
    return (
        <div className="w-[15%] rounded-lg border-l border-gray-200">
            <div className="flex flex-col p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >Redirect URI</span
                    >
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                        <button
                            className="p-1 -mr-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                            aria-label="Copy to clipboard"
                            onClick={() => copyToClipboard(uriValue)}
                        >
                            <span className="material-icons text-[18px]">{copied ? 'check_circle' : 'content_copy'}</span>
                        </button>
                    </Tooltip>
                </div>

                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                    <span className="font-mono text-xs text-gray-800 truncate flex-1">
                        {uriValue}
                    </span>
                </div>

                {copied &&
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                        <span className="material-icons text-[14px] my-auto align-middle">check_circle</span>
                        <span className="align-middle">Copied to clipboard</span>
                    </div>
                }
            </div>
        </div>
    )
}

export default RedirectUri