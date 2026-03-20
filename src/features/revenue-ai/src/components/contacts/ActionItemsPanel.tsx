
import React, { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertCircle, Calendar, Trash2, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact } from "../../types/Contact";
import { ActionItem } from "../../types/ActionItem";

import { useToast } from '@/hooks/use-toast';
import { useActionItemStore } from '../../store/actionItemStore';
import { cn } from '@/lib/utils';
import { useUserManagementStore } from '../../store/userManagementStore';
import DeleteConfirmationDialog from '../ui/delete-confirmation-dialog';
import { Opportunity } from '../../types/Opportunity';

interface ActionItemsPanelProps {
  contact?: Contact;
  opportunity?: Opportunity;
}

export const ActionItemsPanel = ({ contact, opportunity }: ActionItemsPanelProps) => {
  const { loading, loadActionItems, actionItems, assignUserToActionItem, updateActionItemStatus, addCommentToActionItem, deleteActionItem } = useActionItemStore();
  const { users } = useUserManagementStore();
  const [filter, setFilter] = useState('all');
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [showCommentInput, setShowCommentInput] = useState<{ [key: string]: boolean }>({});
  const [deleteItem, setDeleteItem] = useState<ActionItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let email: string = "";
    if (contact?.email) email = contact?.email;
    else if (opportunity?.contact_mailid) email = opportunity?.contact_mailid;
    else email = "";
    loadActionItems([], email);
  }, [contact?.email, opportunity?.contact_mailid]);

  const handleDeleteItem = async (actionItem: ActionItem) => {
    const payload = {
      source_from: actionItem.source_from,
      reference_id: actionItem.reference_id,
      action_item: actionItem.action_item
    }

    await deleteActionItem(payload);
    await loadActionItems([], contact?.email);
  };

  const handleAssignUser = (actionItem: ActionItem, userId: string) => {
    assignUserToActionItem(actionItem, userId);
    loadActionItems([], contact?.email);
    toast({
      title: "Action item assigned",
      description: `Action item has been assigned to ${users.find(u => u.id === userId)?.name}`,
    });
  };

  const handleAddComment = async (index: number, item: ActionItem) => {
    const commentText = newComments[index]?.trim();
    if (!commentText) return;
    const payload = {
      source_from: item.source_from,
      reference_id: item.reference_id,
      action_item: item.action_item,
      comment: commentText
    }

    await addCommentToActionItem(payload);
    await loadActionItems([], contact?.email)

    setNewComments({});
    setShowCommentInput({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="text-green-600" size={16} />;
      case 'in-progress':
        return <Clock className="text-yellow-600" size={16} />;
      default:
        return <AlertCircle className="text-red-600" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ToDO':
      case 'To Do':
        return 'bg-orange-100 text-orange-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'meeting':
        return '🤝';
      case 'manual':
        return '✍️';
      default:
        return '📝';
    }
  };

  let filteredItems = actionItems.filter(item =>
    filter === 'all' || item.status === filter
  );

  const handleStatusChange = (item: ActionItem, value: string) => {
    updateActionItemStatus(item, value);
    loadActionItems([], contact?.email);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Action Items {actionItems.length ? `(${actionItems.length})` : null}</h3>
          {/* <Button size="sm">
            <Plus size={16} className="mr-2" />
            Add Action
          </Button> */}
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {['all', 'To Do', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${filter === status
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {status === 'all' ? 'All Items' : status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {loading.actionItemsLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading...
            </div>
          ) : (
            filteredItems.map((item, i) => {
              return (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => handleStatusChange(item, "Completed")}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(item.status)}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${item.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.action_item}
                        </h4>
                        <p className={`text-sm mt-1 ${item.status === 'Completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.context_dependencies}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <Select
                        value={item.deadline}
                        onValueChange={(value) => handlePriorityChange(item, value)}
                      >
                        <SelectTrigger className={cn("w-30 h-6 text-xs rounded-full", getPriorityColor(item.priority))}>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <span className="px-2 py-1 text-xs rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200"
                      >{item.Deadline || item.deadline}</span>
                      {/* <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span> */}
                      <Select
                        value={item.status}
                        onValueChange={(value) => handleStatusChange(item, value)}
                      >
                        <SelectTrigger className={cn("w-30 h-6 text-xs rounded-full", getStatusColor(item.status))}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ToDO">To Do</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span> */}
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="mb-3 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-purple-800">
                        <User size={14} />
                        <span className="font-medium">Assigned to:</span>
                        {item.responsible_user_id ? (
                          <span className="text-gray-500 italic">{users.find(user => user.id === item.responsible_user_id)?.name}</span>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                      <Select
                        value={item.responsible_user_id || ''}
                        onValueChange={(value) => handleAssignUser(item, value)}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.user_id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Source Information */}
                  <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <span>{getSourceIcon(item.source_from)}</span>
                      <span className="font-medium">Source:</span>
                      <span>{item.meeting_name}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {item.comments?.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <h5 className="text-xs font-medium text-gray-600">Comments:</h5>
                      {item.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded p-2 text-sm">
                          <p className="text-gray-800">{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(comment.created).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  {showCommentInput[i] && (
                    <div className="mb-3 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComments[i] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [i]: e.target.value }))}
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex space-x-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(i, item)}
                          disabled={!newComments[i]?.trim()}
                        >
                          {loading.addingComment ? "Adding..." : "Add Comment"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCommentInput(prev => ({ ...prev, [i]: false }))}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>Due: {item.deadline}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowCommentInput(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <MessageSquare size={12} />
                        <span>Comment</span>
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {(!loading.actionItemsLoading && filteredItems.length) === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No action items found for the selected source</p>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationDialog
        title='Delete Action Item'
        buttonText="Delete"
        description='Are you sure you want to delete this Action item?'
        keyword='DELETE'
        loading={loading.deletingActionItem}
        openDeleteDialog={!!deleteItem}
        handleCloseModal={() => setDeleteItem(null)}
        handleDelete={() => handleDeleteItem(deleteItem)}
      />
    </div>
  );
};
