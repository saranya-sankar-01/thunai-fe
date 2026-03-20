
import React, { useEffect, useState } from 'react';
import { Mail, Calendar, MessageSquare, Phone, FileText, Clock, Filter, Globe, Lock, Plus, Trash2 } from 'lucide-react';
// import { Contact } from '@/pages/Contacts';

import { Button } from '@/components/ui/button';
import { AddActivityDialog } from './AddActivityDialog';
import { Contact } from '../../types/Contact';
import { format } from 'date-fns';
import { Opportunity } from '../../types/Opportunity';
import DeleteConfirmationDialog from '../ui/delete-confirmation-dialog';
import { useActivityStore } from '../../store/activityStore';



interface ConversationTimelineProps {
  contact?: Contact;
  opportunity?: Opportunity;
}

const getActivityIcon = (type: string) => {
  const icons = {
    email: Mail,
    meeting: Calendar,
    chat: MessageSquare,
    call: Phone,
    note: FileText
  };
  return icons[type] || MessageSquare;
};

const getActivityColor = (type: string) => {
  const colors = {
    email: 'bg-blue-100 text-blue-600',
    meeting: 'bg-green-100 text-green-600',
    chat: 'bg-purple-100 text-purple-600',
    call: 'bg-yellow-100 text-yellow-600',
    note: 'bg-gray-100 text-gray-600'
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

export const ConversationTimeline: React.FC<ConversationTimelineProps> = ({ contact, opportunity }) => {
  const [sourceFilter, setSourceFilter] = useState('all');
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

  const { loading, activities, loadActivities, deleteActivity } = useActivityStore();

  useEffect(() => {
    let email: string = "";
    if (contact?.email) email = contact?.email;
    else if (opportunity?.contact_mailid) email = opportunity?.contact_mailid;
    else email = "";
    loadActivities([], email);
  }, [contact?.email, opportunity?.contact_mailid]);

  const sources = ['all', 'email', 'meeting', 'chat', 'call', 'note'];

  const filteredActivities = activities.filter(activity =>
    sourceFilter === 'all' || activity.type === sourceFilter
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => setAddActivityOpen(true)}>
              <Plus size={14} className="mr-1" />
              Add Activity
            </Button>
            <Filter size={16} className="text-gray-500" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {sources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {loading.activitiesLoading ? (<div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>) : (
            filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.source?.source_from);

              return (
                <div key={activity.id} className="relative">
                  {index !== filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                  )}

                  <div className="flex space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.source?.source_from)}`}>
                      <IconComponent size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{activity.subject || activity.meeting_name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {format(new Date(activity.created), "MMMM dd, yyyy")}
                            <Button className='ml-auto text-destructive' variant='ghost' onClick={() => setDeleteActivityId(activity.id)}>
                              <Trash2 />
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3">{activity.summary}</p>

                        {activity.action_items && activity.action_items.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Action Items:</h5>
                            <ul className="space-y-1">
                              {activity.action_items.map((item, idx) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                  {item["Action Item"]}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Participants: {activity?.invited_participants?.map((participant: any) => participant.name).join(', ')}</span>
                          <span className="capitalize">{activity.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {(!loading.activitiesLoading && filteredActivities.length) === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No activities found for the selected source</p>
            </div>
          )}
        </div>
      </div>

      <AddActivityDialog open={addActivityOpen} onOpenChange={setAddActivityOpen} contact_email={contact?.email} />
      <DeleteConfirmationDialog
        title="Delete Activity"
        description="Are you sure you want to delete this activity?"
        keyword="DELETE"
        buttonText="Delete"
        loading={loading.deletingActivity}
        openDeleteDialog={!!deleteActivityId}
        handleCloseModal={() => setDeleteActivityId(null)}
        handleDelete={() =>
          deleteActivity(deleteActivityId)
        }
      />
    </div>
  );
};
