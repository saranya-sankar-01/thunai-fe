import React, { useEffect } from 'react'
import { useSalesforceService } from '../store/salesforceStore'
import { usePermissions } from '../services/permissionService';

const SalesForceFields: React.FC = () => {
    const { selectedWidgetId, licenseKey, licenseValue, copied, commonAgentsList, getSalesforceConfig, getCommonWidgets, toggleLicense, widgetOnChange, copyLicenseKey } = useSalesforceService();
    const { hasPermission } = usePermissions()
    useEffect(() => {
        getSalesforceConfig()
        getCommonWidgets([])
    }, [getSalesforceConfig, getCommonWidgets]);
    return (
        <div className="space-y-6 mt-4">
            {/* Common Agent Section */}
            <div className="border border-gray-200 shadow-lg rounded-lg">
                <div className="flex bg-gray-100 p-4 justify-between items-center mb-4 rounded-t-lg">
                    <div>
                        <div className="font-semibold text-md text-gray-800">Common Agent</div>
                        <div className="text-sm text-gray-600">Common Agent</div>
                    </div>
                </div>

                <div className="flex flex-col p-4 rounded-b-lg">
                    <label className="font-medium text-md mb-1">Common Agent</label>
                    <select
                        className="border text-sm p-2 rounded shadow-md"
                        value={selectedWidgetId || ""}
                        onChange={(e) => widgetOnChange(e.target.value)}
                    >
                        <option value="" disabled>
                            Select Common Agent
                        </option>
                        {commonAgentsList.map((agent) => (
                            <option key={agent.widget_id} value={agent.widget_id}>
                                {agent.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* License Section */}
            {/* {hasPermission("oauth_application_admin", "READ") && ( */}
                <div className="border border-gray-200 shadow-lg rounded-lg">
                    <div className="flex bg-gray-100 p-4 justify-between items-center mb-4 rounded-t-lg">
                        <div>
                            <div className="font-semibold text-md text-gray-800">License</div>
                            <div className="text-sm text-gray-600">License</div>
                        </div>
                    </div>

                    <div className="flex items-center px-6 pt-2 pb-6 rounded-md space-x-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <div
                                onClick={() => {
                                    // if (hasPermission("oauth_application_admin", "ALL")) {
                                        toggleLicense();
                                    // }
                                }}
                                className={`w-10 h-5 rounded-full relative transition-all ${licenseValue ? "bg-blue-500" : "bg-gray-200"
                                    } ${hasPermission("oauth_application_admin", "READ") &&
                                        !hasPermission("oauth_application_admin", "ALL")
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-0.5 left-0.5 transition-all ${licenseValue ? "translate-x-full" : ""
                                        }`}
                                ></div>
                            </div>
                        </label>
                        <span className="ml-3 text-sm text-gray-600 font-medium">License</span>
                    </div>

                    {licenseValue && licenseKey && (
                        <div className="px-6 pb-6">
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-2">
                                <span className="font-mono text-sm text-gray-800 truncate">
                                    {licenseKey || "XXXX-XXXX-XXXX-XXXX"}
                                </span>

                                <button
                                    className={`ml-3 flex items-center text-sm font-medium transition-colors ${copied
                                        ? "text-green-600 hover:text-green-700"
                                        : "text-blue-600 hover:text-blue-800"
                                        }`}
                                    onClick={copyLicenseKey}
                                >
                                    {!copied ? (
                                        <>
                                            {/* Copy Icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8 16h8M8 12h8m-6 8h8a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h2"
                                                />
                                            </svg>
                                            Copy
                                        </>
                                    ) : (
                                        <>
                                            {/* Copied Icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            {/* )}   */}


        </div>
    )

}

export default SalesForceFields