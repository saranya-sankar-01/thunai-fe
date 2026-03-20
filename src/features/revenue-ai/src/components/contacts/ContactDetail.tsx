import React, { useState } from "react";
import {
  Activity,
  Brain,
  CheckSquare,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactStore } from "../../store/contactStore";
import { useUserManagementStore } from "../../store/userManagementStore";
import { Contact } from "../../types/Contact";
import { Opportunity } from "../../types/Opportunity";
import DeleteConfirmationDialog from "../ui/delete-confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ActionItemsPanel } from "./ActionItemsPanel";
import { AddContactDialog } from "./AddContactDialog";
import { AIAssistant } from "./AIAssistant";
import { ConversationTimeline } from "./ConversationTimeline";
import { OpportunitiesPanel } from "./OpportunitiesPanel";
import { UpdateTimeline } from "./UpdateTimeline";
import { getInitials } from "../../lib/utils";
import { ContactDetailTabs } from "./ContactDetailTabs";
import { OpportunityFunnel } from "../../types/OpportunityFunnelView";

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onSelectOpportunity?: (opportunity: Opportunity | OpportunityFunnel) => void;
  openContactDialog: "add" | "edit" | null;
  setOpenContactDialog: React.Dispatch<
    React.SetStateAction<"add" | "edit" | null>
  >;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  onClose,
  onSelectOpportunity,
  openContactDialog,
  setOpenContactDialog,
}) => {
  const { users } = useUserManagementStore();
  const { deleteContact, updateContact, loading } = useContactStore();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleAssigneeChange = async (value: string) => {
    const payload = { ...contact, assignee_user_id: value };
    await updateContact(payload);
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {getInitials(contact.name)}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {contact.name}
                </h1>
                <div className="flex items-center space-x-1 group relative">
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                    {contact.engagement}%
                  </span>
                  <HelpCircle size={14} className="text-gray-400 cursor-help" />
                  <div className="absolute top-full left-0 mb-2 w-64 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Engagement Score: AI-calculated metric based on interaction
                    frequency, response time, meeting attendance, and
                    conversation sentiment.
                  </div>
                </div>
              </div>
              {(contact.role || contact.organisation) && (
                <p className="text-sm text-gray-600 truncate">
                  {contact.role && contact.role}
                  {contact.role && contact.organisation && ", "}
                  {contact.organisation && contact.organisation}
                </p>
              )}
              <p className="text-sm text-gray-500">{contact.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenContactDialog("edit")}
            >
              Edit Contact
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Contact
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{contact.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-600">Phone:</span>
              <span className="text-gray-900">{contact.phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Domain:</span>
              <span className="text-blue-600">{contact.domain}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Organisation:</span>
              <span className="text-gray-900 capitalize">{contact.organisation}</span>
            </div>
          </div>
          <div className="spact-y-2">
            <Select value={contact.assignee?.assignee_user_id ?? "Unassigned"} onValueChange={(value) => handleAssigneeChange(value)} defaultValue={contact.assignee?.assignee_user_id ?? "Unassigned"}>
              <SelectTrigger>
                <SelectValue placeholder="Select Assignee" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {users.map(user => (
                  <SelectItem key={user.id} value={user.user_id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ContactDetailTabs contact={contact} onSelectOpportunity={onSelectOpportunity} />

      <AddContactDialog
        open={openContactDialog === "edit"}
        onOpenChange={setOpenContactDialog}
        editContact={contact}
      />
      <DeleteConfirmationDialog
        title="Delete Contact"
        description="Are you sure you want to delete this contact?"
        keyword="DELETE"
        buttonText="Delete"
        loading={loading.contactDeleting}
        openDeleteDialog={openDeleteDialog}
        handleCloseModal={() => setOpenDeleteDialog(false)}
        handleDelete={() => {
          deleteContact(contact.id);
          onClose();
        }}
      />
    </div>
  );
};
