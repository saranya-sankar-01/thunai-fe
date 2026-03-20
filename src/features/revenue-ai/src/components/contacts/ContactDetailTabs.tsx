import { Activity, Brain, CheckSquare, MessageSquare, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ConversationTimeline } from "./ConversationTimeline"
import { UpdateTimeline } from "./UpdateTimeline"
import { OpportunitiesPanel } from "./OpportunitiesPanel"
import { ActionItemsPanel } from "./ActionItemsPanel"
import { AIAssistant } from "./AIAssistant"
import { useState } from "react"
import { Contact } from "../../types/Contact"
import { Opportunity } from "../../types/Opportunity"
import { OpportunityFunnel } from "../../types/OpportunityFunnelView"

interface ContactDetailProps {
    contact: Contact;
    onSelectOpportunity?: (opportunity: Opportunity | OpportunityFunnel) => void;
}

export const ContactDetailTabs: React.FC<ContactDetailProps> = ({ contact, onSelectOpportunity }) => {
    const [activeTab, setActiveTab] = useState("activity");

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
        >
            <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0 flex-shrink-0">
                <TabsTrigger
                    value="activity"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                >
                    <MessageSquare size={16} className="mr-2" />
                    Activity
                </TabsTrigger>
                <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                >
                    <Activity size={16} className="mr-2" />
                    Timeline
                </TabsTrigger>
                <TabsTrigger
                    value="opportunities"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                >
                    <TrendingUp size={16} className="mr-2" />
                    Opportunities
                </TabsTrigger>
                {/* <TabsTrigger value="meetings" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
            <Calendar size={16} className="mr-2" />
            Meetings
          </TabsTrigger> */}
                <TabsTrigger
                    value="actions"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                >
                    <CheckSquare size={16} className="mr-2" />
                    Action Items
                </TabsTrigger>
                {/* <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
            <FileText size={16} className="mr-2" />
            Notes
          </TabsTrigger> */}
                <TabsTrigger
                    value="ai"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                >
                    <Brain size={16} className="mr-2" />
                    AI Assistant
                </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent value="activity" className="h-full m-0 overflow-hidden">
                    <ConversationTimeline contact={contact} />
                </TabsContent>

                <TabsContent value="timeline" className="h-full m-0 overflow-hidden">
                    <UpdateTimeline contact={contact} />
                </TabsContent>

                <TabsContent
                    value="opportunities"
                    className="h-full m-0 overflow-hidden"
                >
                    <OpportunitiesPanel
                        contact={contact}
                        onSelectOpportunity={onSelectOpportunity}
                    />
                </TabsContent>

                {/* <TabsContent value="meetings" className="h-full m-0 p-6 overflow-y-auto">
            <div className="text-center text-gray-500 mt-8">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No meetings scheduled yet</p>
              <Button className="mt-4">Schedule Meeting</Button>
            </div>
          </TabsContent> */}

                <TabsContent value="actions" className="h-full m-0 overflow-hidden">
                    <ActionItemsPanel contact={contact} />
                </TabsContent>

                {/* <TabsContent value="notes" className="h-full m-0 p-6 overflow-y-auto">
            <div className="text-center text-gray-500 mt-8">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No notes added yet</p>
              <Button className="mt-4">Add Note</Button>
            </div>
          </TabsContent> */}

                <TabsContent value="ai" className="h-full m-0 overflow-hidden">
                    <AIAssistant contact={contact} />
                </TabsContent>
            </div>
        </Tabs>
    )
}