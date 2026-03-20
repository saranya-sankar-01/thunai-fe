import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Filter, Plus, Search, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials, getPaginationNumbers } from '../../lib/utils';
import { useContactStore } from '../../store/contactStore';
import { useUserManagementStore } from '../../store/userManagementStore';
import { Contact } from '../../types/Contact';
import { Opportunity } from '../../types/Opportunity';
import { Input } from '../ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AddContactDialog } from './AddContactDialog';
import { BulkUploadDialog } from './BulkUploadDialog';
import OpportunitiesView from './OpportunitiesView';

interface ContactsListProps {
  onSelectContact: (contact: Contact) => void;
  selectedContact?: Contact;
  currentView: 'contacts' | 'opportunities';
  onSelectOpportunity?: (opportunity: Opportunity) => void;
  openContactDialog: "add" | "edit" | null;
  setOpenContactDialog: React.Dispatch<React.SetStateAction<"add" | "edit" | null>>;
}

export const ContactsList: React.FC<ContactsListProps> = ({ onSelectContact, selectedContact, currentView, onSelectOpportunity, openContactDialog, setOpenContactDialog }) => {
  const { contacts, engagement, loading, loadContacts, currentPage, totalPages, setCurrentPage, totalItems, resetPagination } = useContactStore();
  const { users } = useUserManagementStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [filters, setFilters] = useState({
    assignedTo: "",
    lastModifiedDate: "",
    addedDate: "",
  })
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = (filters.assignedTo !== '' ? 1 : 0) + (filters.addedDate !== '' ? 1 : 0) + (filters.lastModifiedDate !== '' ? 1 : 0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {

    const filter = [
      ...(filters.assignedTo
        ? [{
          key_name: "assigned_to",
          key_value: filters.assignedTo,
          operator: "=="
        }]
        : []),

      ...(filters.lastModifiedDate
        ? [{
          key_name: "last_modified_by",
          key_value: format(
            new Date(filters.lastModifiedDate),
            "dd-MM-yyyy"
          ),
          operator: "=="
        }]
        : []),

      ...(filters.addedDate
        ? [{
          key_name: "added",
          key_value: format(new Date(filters.addedDate), "dd-MM-yyyy"),
          operator: "=="
        }]
        : [])
    ];
    loadContacts(filter, debouncedSearchTerm);
  }, [debouncedSearchTerm, filters]);

  useEffect(() => {
    resetPagination();
  }, [debouncedSearchTerm, resetPagination])

  if (currentView === 'opportunities') {
    return (
      <OpportunitiesView onSelectOpportunity={onSelectOpportunity} />
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Contact
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setOpenContactDialog("add"); onSelectContact(null); }}>
                  <Plus size={14} className="mr-2" />
                  Add Single Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBulkUploadOpen(true)}>
                  <Upload size={14} className="mr-2" />
                  Bulk Upload (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter size={16} className="mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-900">Filters</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilters({
                          addedDate: "",
                          assignedTo: "",
                          lastModifiedDate: ""
                        })
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Assigned To</label>
                  <Select value={filters.assignedTo} onValueChange={(value) => setFilters({ ...filters, assignedTo: value === "all" ? "" : value })}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.user_id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Last Modified Date</label>
                  <Input type='date' value={filters.lastModifiedDate} onChange={(e) => setFilters({ ...filters, lastModifiedDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Added</label>
                  <Input type="date" value={filters.addedDate} onChange={(e) => setFilters({ ...filters, addedDate: e.target.value })} />
                  {/* <Select value={filters.addedDate} onValueChange={(value) => setFilters({ ...filters, addedDate: value })}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any time</SelectItem>
                      <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                      <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                      <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select> */}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats */}
      {loading.contactsLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-sm text-gray-500">Total Contacts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {engagement.high_engagement}
                </div>
                <div className="text-sm text-gray-500">High Engagement</div>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {contacts.map((contact) => {
                  const assigneeNames = Array.isArray(contact.assignee) ? contact.assignee.map(a => a?.assignee_name).filter(Boolean).join(", ") :
                    contact.assignee?.assignee_name
                  return <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(contact.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {contact.engagement}%
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className='bg-black text-white'>
                              <p>Engagement Score</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {(contact.role || contact.organisation) && (
                          <p className="text-sm text-gray-600 truncate">
                            {contact.role && contact.role}
                            {contact.role && contact.organisation && " at "}
                            {contact.organisation && contact.organisation}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>Assigned To:
                            {assigneeNames || "Unassigned"}
                          </span>
                          <span className="text-xs text-gray-400">
                            <Tooltip>
                              <TooltipTrigger>
                                Added: {new Date(contact.created).toLocaleDateString()}
                              </TooltipTrigger>
                              <TooltipContent className='bg-black text-white'>
                                <p>Added on {new Date(contact.created).toLocaleDateString()}</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {contact.updated && <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs text-gray-500">Last: {new Date(contact.updated).toLocaleDateString()}</span>
                            </TooltipTrigger>
                            <TooltipContent className='bg-black text-white'>
                              <p>Last Interaction on {new Date(contact.updated).toLocaleDateString()}</p>
                            </TooltipContent>
                          </Tooltip>
                          }

                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                )}
              </div>
              {totalPages > 1 &&
                <Pagination className='p-2 sticky bottom-0 bg-white'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || loading.contactsLoading} />
                    </PaginationItem>
                    {getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                      <PaginationItem key={index}>
                        {
                          page === "..." ? <PaginationEllipsis /> : (<PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                            {page}
                          </PaginationLink>)
                        }
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || loading.contactsLoading} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              }
            </ScrollArea>
          </div>
        </>
      )}

      <AddContactDialog open={openContactDialog === "add"} onOpenChange={setOpenContactDialog} editContact={selectedContact} />
      <BulkUploadDialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} />
    </div>
  );
};
