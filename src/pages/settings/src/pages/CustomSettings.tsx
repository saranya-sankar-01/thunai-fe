import React from 'react';
import {
    Cloud,
    Copy,
    Server,
    Compass,
    Laptop
} from "lucide-react";

import UserTabButton from "../components/UserTabButton";
import PageTitle from "../components/PageTitle";
import DatabaseConfiguration from "../components/DatabaseConfiguration";
import CloudStorage from "../components/CloudStorage";
import { useCustomSettingsStore } from "../store/customSettingsStore";
import { useToast } from "../hooks/useToast";

const CustomSettings: React.FC = () => {
    const { toast } = useToast();

    const {
        activeTab,
        setActiveTab,
    } = useCustomSettingsStore();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: "Copied to clipboard" });
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="w-full mx-auto flex flex-col lg:flex-row gap-3">
                <div className="w-full lg:w-3/4 mx-auto">
                    {/* Header */}
                    <PageTitle title="Connect Database" content="Configure your data sources and storage for AI-driven analysis" />

                    {/* Tabs */}
                    <div className="flex items-center gap-3 mb-4">
                        <UserTabButton title="Database Configuration" selected={activeTab} onClick={setActiveTab} />
                        <UserTabButton title="Cloud Storage" selected={activeTab} onClick={setActiveTab} />
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        {activeTab === 'Database Configuration' && <DatabaseConfiguration />}
                        {activeTab === 'Cloud Storage' && <CloudStorage />}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:border-l lg:pl-2 border-gray-200 w-full lg:w-1/3 space-y-6">
                    <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8 sticky top-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <Compass className="h-5 w-5 bg-blue-600 rounded-xl text-white" />
                            <h2 className="text-xl">Cloud Discovery</h2>
                        </div>

                        <div className="space-y-8">
                            {[
                                {
                                    label: 'Google Cloud Project ID',
                                    value: 'ai-framework-436007',
                                    icon: Cloud,
                                    desc: 'Find this in the Dashboard page in the Google Cloud Platform.'
                                },
                                {
                                    label: 'VPC Name',
                                    value: 'entransaivpc',
                                    icon: Server,
                                    desc: 'Find this on the VPC Networks page in the Google Cloud Platform.'
                                },
                                {
                                    label: 'Subnet Name',
                                    value: 'aisubnet1',
                                    icon: Laptop,
                                    desc: 'Find this on the VPC Networks page in Google Cloud Platform. This subnet will need to have at least 50 unassigned IP addresses.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-700 flex items-center gap-2">
                                            <item.icon className="text-gray-400" />
                                            {item.label}
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(item.value)}
                                            className="text-gray-500 hover:text-blue-500 material-icons"
                                        >
                                            <Copy />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                                    <div className="px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-700 flex justify-between items-center">
                                        <span>{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSettings;