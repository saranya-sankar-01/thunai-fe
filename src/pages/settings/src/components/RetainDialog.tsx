import React, { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RetainCardButton from "../components/RetainCardButton";
import ProjectRetain from "../components/ProjectRetain";
import AgentRetain from "../components/AgentRetain";
import CalendarRetain from "../components/CalendarRetain";
import { useSubscriptionStore } from "../store/subscriptionStore";

import DowngradeIcon from "../assets/images/downgrade.svg";

type RetainDialogProps = {
    openDialog: boolean;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetainDialog: React.FC<RetainDialogProps> = ({ openDialog, setOpenDialog }) => {
    const [activeTab, setActiveTab] = useState<"projects" | "agents" | "calendar">("projects");
    const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

    const { retainSuccess } = useSubscriptionStore();

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-3xl p-0 block" aria-describedby="">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>
                <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row border border-blue-400 max-h-[95vh] overflow-y-auto">
                    <div className="flex-1 p-8 flex flex-col items-center text-center">
                        <div aria-hidden="true" className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
                            <img src={DowngradeIcon} alt="Downgrade" className="w-15 h-15" />
                        </div>
                        <h2 className="font-semibold text-lg mb-2">
                            Complete Your Downgrade
                        </h2>
                        <p className="text-sm text-gray-600 mb-2 max-w-xs">
                            This action will permanently Retain the selected Projects and Agents & calendar from your workspace.</p>
                        <p className="text-sm text-gray-600 mb-8 max-w-xs">Please review the items below before proceeding with the Retain.</p>
                        <RetainCardButton active={activeTab === "projects"} apiSuccess={retainSuccess.retainTenants} title="Retain Projects" content="Remove all unselected projects and their associated data from the system." handleClick={() => setActiveTab("projects")} />
                        <RetainCardButton active={activeTab === "agents"} disabled={!retainSuccess.retainTenants} apiSuccess={retainSuccess.retainAgents} title="Retain Agents" content="Remove all unselected marketing agents and their configurations from the workspace." handleClick={() => setActiveTab("agents")} />
                        <RetainCardButton active={activeTab === "calendar"} apiSuccess={retainSuccess.retainCalendar} title="Retain Calender" content="Delete your unselected calendar account from the system." handleClick={() => setActiveTab("calendar")} />
                    </div>
                    {activeTab === "projects" && <ProjectRetain activeTab={activeTab} setOpenDialog={setOpenDialog} selectedTenants={selectedTenants} setSelectedTenants={setSelectedTenants} />}
                    {activeTab === "agents" && <AgentRetain activeTab={activeTab} setOpenDialog={setOpenDialog} selectedTenants={selectedTenants} />}
                    {activeTab === "calendar" && <CalendarRetain activeTab={activeTab} setOpenDialog={setOpenDialog} />}
                </div>
            </DialogContent >
        </Dialog >
    )
}

export default RetainDialog;