import React, { useEffect, useState } from "react";
import { useProjectStore } from "../store/projectsStore";
import { TenantItem } from "../types/TenantItem";

import Logomark from "../assets/images/Logomark.svg";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "../store/subscriptionStore";




type ProjectRetainProps = {
    activeTab: string;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    selectedTenants: string[];
    setSelectedTenants: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProjectRetain: React.FC<ProjectRetainProps> = ({ activeTab, setOpenDialog, selectedTenants, setSelectedTenants }) => {
    const { submitSelectedTenants, loading } = useSubscriptionStore();

    const { tenants, loadTenants, loading: tenantLoading } = useProjectStore();

    useEffect(() => {
        loadTenants([], 100);
    }, [loadTenants]);

    const handleSelectedTenants = (tenant: TenantItem) => {
        if (selectedTenants.includes(tenant.tenant_id)) {
            setSelectedTenants(selectedTenants.filter((id) => id !== tenant.tenant_id))
        } else {
            setSelectedTenants([...selectedTenants, tenant.tenant_id])
        }
    }

    return (
        <div className="flex-1 bg-gray-50 px-8 py-4 rounded-r-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 font-semibold text-lg capitalize">
                    Retain {activeTab}
                </h3>
            </div>
            {tenantLoading ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                </div>
            ) : (
                <>
                    <div className="space-y-3 max-h-[80vh] overflow-y-auto">
                        {tenants.map(tenant => (
                            <label key={tenant.id} htmlFor={tenant.id}
                                className="flex items-center justify-between bg-white border border-[#EDEDED] rounded-md px-4 py-2 cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" id={tenant.id} checked={selectedTenants.includes(tenant.tenant_id)} onChange={() => handleSelectedTenants(tenant)} name="project-{{ i }}"
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <img src={Logomark} alt="Downgrade" className="w-15 h-15" />
                                    <span className="text-sm text-[#4B4B4B] font-bold">
                                        {tenant.name}
                                    </span>
                                </div>
                                <span className="text-[10px] text-[#4B4B4B]">
                                    {format(new Date(tenant.created), "MMM dd, yyyy")}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-4 mt-3">
                        <Button variant="outline" disabled={loading.submittingTenants} onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" disabled={loading.submittingTenants} onClick={() => submitSelectedTenants(selectedTenants)}>
                            {loading.submittingTenants ? 'Loading...' : 'Retain'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ProjectRetain;