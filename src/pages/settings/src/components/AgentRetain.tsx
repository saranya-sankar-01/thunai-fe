import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCustomAgentStore } from "../store/customAgentStore";
import { CommonWidget } from "../types/CommonWidget";
import { useSubscriptionStore } from "../store/subscriptionStore";

type AgentRetainProps = {
    activeTab: string;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    selectedTenants: string[];
}

const AgentRetain: React.FC<AgentRetainProps> = ({ activeTab, setOpenDialog, selectedTenants }) => {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const { loadAgentsBySelectedTenant, agents, loading: agentLoading } = useSubscriptionStore();
    const { submitSelectedAgents, loading } = useSubscriptionStore();

    useEffect(() => {
        loadAgentsBySelectedTenant(selectedTenants);
    }, [loadAgentsBySelectedTenant, selectedTenants]);

    const handleSelectedAgents = (agent: CommonWidget) => {
        if (selectedAgents.includes(agent.id)) {
            setSelectedAgents(selectedAgents.filter((id) => id !== agent.id))
        } else {
            setSelectedAgents([...selectedAgents, agent.id])
        }
    }

    // console.log(agents, agentLoading);

    return (
        <div className="flex-1 bg-gray-50 p-8 rounded-r-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 font-semibold text-lg capitalize">
                    Retain {activeTab}
                </h3>
            </div>
            {agentLoading.loadingAgents ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                </div>) : (
                <ul className="divide-y divide-gray-200">
                    {agents.map((agent) => (
                        <li key={agent.id} className="flex justify-between items-center py-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={selectedAgents.includes(agent.id)} onChange={() => handleSelectedAgents(agent)} name={`agent-${agent.id}`} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-900">{agent.name}</p>
                                    {/* <!-- <p class="text-gray-500 text-xs">{{ agent.tenant_name }}</p> --> */}
                                    {/* <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{agent.tenant_name}</span> */}
                                </div>
                            </label>
                            <span className="text-xs text-gray-400">{agent.agent_type}</span>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" disabled={loading.submittingAgents} onClick={() => setOpenDialog(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" disabled={loading.submittingAgents} onClick={() => submitSelectedAgents(selectedAgents)}>
                    {loading.submittingAgents ? "Loading..." : "Retain"}
                </Button>
            </div>
        </div>
    )
}

export default AgentRetain;
