import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import DirectoryUsersStatusTable from "../components/DirectoryUsersStatusTable";
import { usePermissionUserStore } from "../store/permissionUserStore";
import { cn } from "@/lib/utils";

const DirectoryUserStatusTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
    const { loadPermissionUsers } = usePermissionUserStore();

    useEffect(() => {
        loadPermissionUsers([{ key_name: "status", key_value: activeTab, operator: "==" }])
    }, [loadPermissionUsers, activeTab]);

    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Admin Approval Panel</h2>
            <div className="flex gap-4 mb-4">
                <Button onClick={() => setActiveTab("pending")} variant={activeTab === "pending" ? "default" : "outline"}>Pending</Button>
                <Button onClick={() => setActiveTab("approved")} variant="outline" className={cn(activeTab === "approved" && "bg-green-600 text-white border-none hover:bg-green-600 hover:text-white")}>Approved</Button>
                <Button onClick={() => setActiveTab("rejected")} variant={activeTab === "rejected" ? "destructive" : "outline"}>Rejected</Button>
            </div>
            <DirectoryUsersStatusTable activeTab={activeTab} />
        </div>
    )
}

export default DirectoryUserStatusTab