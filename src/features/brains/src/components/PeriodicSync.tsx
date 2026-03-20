
import React, { useState, useEffect, useCallback,useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Globe, ArrowRight, Trash, Info, Folder, FolderArchive, ChevronRight, FileText, User2, MoreVertical, Edit, Trash2, Clock, Calendar, Mail, Check, ChevronsUpDown, Link, ChevronDown, Tag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WebCrawl } from './shared-components/WebCrawl';
import { usePeriodicSyncStore } from '@/store/usePeriodicSyncStore'; // Import the Zustand store
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import ISTTime from './shared-components/ISTTime';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { timeZone as timeZoneData } from './shared-components/timeZone';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import weblink from "@/assets/weblink.jpg";
import ServiceNow from './periodic-sync/serviceNow';


const CloudPeriodicSyncConfig: React.FC = () => {
  const {
    selectedPlatform,
    tenantID,
    connectedAccounts,
    isLoadingAccounts,
    selectedAccount,
    setSelectedAccount,
    connectedSites,
    isLoadingSites,
    selectedSite,
    setSelectedSite,
    connectedFolders,
    isLoadingFolders,
    selectedFolders,
    office365Drives,
    isLoadingOffice365Folders,
    selectedOffice365Folders,
    selectedOffice365DriveId,
    setSelectedOffice365DriveId,
    selectedOffice365ServiceType, // New state
    setSelectedOffice365ServiceType, // New action
    office365OneDriveReadEnabled, // New
    office365SharePointReadEnabled, // New
    isLoadingOffice365ReadStatus,
    fetchConnectedAccounts,
    fetchConnectedSites,
    fetchConnectedFolders,
    fetchOffice365Folders, // Now for SharePoint site folders
    fetchOneDriveFolders, // New action for OneDrive folders
    toggleFolderSelection,
    toggleOffice365FolderSelection,
  } = usePeriodicSyncStore();

  const [isFolderSelectOpen, setIsFolderSelectOpen] = useState(false);
  const [isOffice365FolderSelectOpen, setIsOffice365FolderSelectOpen] = useState(false);

  // Fetch connected accounts
  useEffect(() => {
    fetchConnectedAccounts();
  }, [selectedPlatform, tenantID, fetchConnectedAccounts]);

  // Fetch Office 365 sites (only for SharePoint)
  useEffect(() => {
    if (selectedPlatform === "office365" && selectedAccount && selectedOffice365ServiceType === 'sharepoint') {
      fetchConnectedSites();
    }
  }, [selectedPlatform, selectedAccount, selectedOffice365ServiceType, fetchConnectedSites]);

  // Fetch Google Drive folders
  useEffect(() => {
    fetchConnectedFolders();
  }, [selectedPlatform, selectedAccount, tenantID, fetchConnectedFolders]);

  // Fetch SharePoint site folders when site is selected
  useEffect(() => {
    if (selectedPlatform === "office365" && selectedOffice365ServiceType === 'sharepoint' && selectedSite) {
      fetchOffice365Folders();
    }
  }, [selectedPlatform, selectedOffice365ServiceType, selectedSite, fetchOffice365Folders]);

  // Fetch OneDrive folders when account is selected and service type is OneDrive
  useEffect(() => {
    if (selectedPlatform === "office365" && selectedAccount && selectedOffice365ServiceType === 'onedrive') {
      fetchOneDriveFolders();
    }
  }, [selectedPlatform, selectedAccount, selectedOffice365ServiceType, fetchOneDriveFolders]);


  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(e.target.value);
  };

  const handleSiteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSite(e.target.value);
  };

  const showAccountSelection =
    selectedPlatform === "google" || selectedPlatform === "office365";
  
  const showOffice365ServiceTypeSelection =
    selectedPlatform === "office365" && selectedAccount && (office365OneDriveReadEnabled || office365SharePointReadEnabled);

  const showSiteSelection =
    selectedPlatform === "office365" && selectedAccount && selectedOffice365ServiceType === 'sharepoint';

  const showGoogleFolderSelectionTrigger =
    selectedPlatform === "google" && selectedAccount;

  const showOffice365FolderSelectionTrigger =
    (selectedPlatform === "office365" && selectedOffice365ServiceType === 'sharepoint' && selectedSite) ||
    (selectedPlatform === "office365" && selectedOffice365ServiceType === 'onedrive' && selectedAccount);


  // Get folders for the selected drive
  const selectedDrive = office365Drives.find(d => d.drive_id === selectedOffice365DriveId);
  const availableFolders = selectedDrive?.folders || [];

  return (
    <div className="mt-6">
      {/* Select Account */}
      {showAccountSelection && (
        <div className="mb-4">
          <Label htmlFor="selectedAccount" className="block text-sm font-medium text-gray-700 mb-1">
            Select Account
          </Label>
          <select
            id="selectedAccount"
            value={selectedAccount || ""}
            onChange={handleAccountSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingAccounts}
          >
            <option value="" disabled>
              Select an account
            </option>
            {isLoadingAccounts ? (
              <option>Loading accounts...</option>
            ) : (
              connectedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.username}
                </option>
              ))
            )}
          </select>
        
        </div>
      )}

      {/* Select Service Type (for Office 365) */}
{showOffice365ServiceTypeSelection && (
  <div className="mb-4">
    <Label className="block text-sm font-medium text-gray-700 mb-2">
      Select Service
    </Label>

    <select
      value={selectedOffice365ServiceType || ""}
      onChange={(e) =>
        setSelectedOffice365ServiceType(
          e.target.value as "sharepoint" | "onedrive"
        )
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={isLoadingOffice365ReadStatus} // Disable while checking read status
    >
      <option value="" disabled>
        {isLoadingOffice365ReadStatus ? "Checking permissions..." : "Select a service"}
      </option>
      {office365SharePointReadEnabled && <option value="sharepoint">SharePoint</option>}
      {office365OneDriveReadEnabled && <option value="onedrive">OneDrive</option>}
    </select>
  </div>
)}



      {/* Select Site (for Office 365 SharePoint) */}
      {showSiteSelection && (
        <div className="mb-4">
          <Label htmlFor="selectedSite" className="block text-sm font-medium text-gray-700 mb-1">
            Select Site
          </Label>
          <select
            id="selectedSite"
            value={selectedSite || ""}
            onChange={handleSiteSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingSites}
          >
           <option value="" disabled>
        {isLoadingSites ? "Loading sites..." : "Select a site"}
      </option>
            {isLoadingSites ? (
              <option>Loading sites...</option>
            ) : (
              connectedSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))
            )}
          </select>
         
        </div>
      )}

      {/* Select Folders (for Office 365 - SharePoint or OneDrive) */}
      {showOffice365FolderSelectionTrigger && (
        <div className="mb-1">
         
          
          {/* Drive Selection */}
          {office365Drives.length > 1 && (
            <>
             <Label className="block text-sm font-medium text-gray-700 mb-1">
           Drive name
          </Label>
              <select
              value={selectedOffice365DriveId || ""}
              onChange={(e) => setSelectedOffice365DriveId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {office365Drives.map((drive) => (
                <option key={drive.drive_id} value={drive.drive_id}>
                  {drive.drive_name}
                </option>
              ))}
            </select>
            </>
          
          )}
    <Label className="block text-sm font-medium text-gray-700 mb-1">
           Select Folders
          </Label>
          {/* Folder Selection Dialog */}
          <Dialog open={isOffice365FolderSelectOpen} onOpenChange={setIsOffice365FolderSelectOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoadingOffice365Folders || !selectedOffice365DriveId || !selectedOffice365ServiceType}
              >
                {isLoadingOffice365Folders ? "Loading folders..." :
                 selectedOffice365Folders.length > 0 ? `${selectedOffice365Folders.length} folder(s) selected` : "Select folders"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select Folders from {selectedDrive?.drive_name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
                {isLoadingOffice365Folders ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                    <span>Loading folders...</span>
                  </div>
                ) : availableFolders.length === 0 ? (
                  <p className="text-gray-600 text-center">No folders found in this drive.</p>
                ) : (
                  availableFolders.map((folderName) => (
                    <Button
                      key={folderName}
                      variant="outline"
                      className={`flex items-center justify-start gap-2 h-auto py-2 ${
                        selectedOffice365Folders.includes(folderName) ? 'border-2 border-blue-600 shadow-md' : ''
                      }`}
                      onClick={() => toggleOffice365FolderSelection(folderName)}
                    >
                        <Folder className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                      <span className="truncate">{folderName}</span>
                    </Button>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOffice365FolderSelectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsOffice365FolderSelectOpen(false)}
                  disabled={selectedOffice365Folders.length === 0}
                >
                  Select ({selectedOffice365Folders.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Select Folders (for Google Drive) */}
      {showGoogleFolderSelectionTrigger && (
        <div className="mb-4">
          <Label htmlFor="selectedFolder" className="block text-sm font-medium text-gray-700 mb-1">
            Select Folders
          </Label>
          <Dialog open={isFolderSelectOpen} onOpenChange={setIsFolderSelectOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoadingFolders || !selectedAccount}
              >
                {isLoadingFolders ? "Loading folders..." :
                 selectedFolders.length > 0 ? `${selectedFolders.length} folder(s) selected` : "Select folders"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select a Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
                {isLoadingFolders ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                    <span>Loading folders...</span>
                  </div>
                ) : connectedFolders.length === 0 ? (
                  <p className="text-gray-600 text-center">No folders found.</p>
                ) : (
                  connectedFolders.map((folder) => (
                    <Button
                      key={folder.id}
                      variant="outline"
                      className={`flex items-center justify-start gap-2 h-auto py-2 ${
                        selectedFolders.includes(folder.id) ? 'border-2 border-blue-600 shadow-md' : ''
                      }`}
                      onClick={() => toggleFolderSelection(folder)}
                    >
                       <Folder className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                      <span className="truncate">{folder.name}</span>
                    </Button>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsFolderSelectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsFolderSelectOpen(false)}
                  disabled={selectedFolders.length === 0}
                >
                  Select ({selectedFolders.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

const WebLinkPeriodicSyncConfig: React.FC = () => {
  const {
    enableCrawl,
    setEnableCrawl,
    selectedCrawlLevel,
    setSelectedCrawlLevel,
    urls,
    setUrls,
    newUrl,
    setNewUrl,
    addUrl,
    removeUrl,
  } = usePeriodicSyncStore();

  return (
    <div className="space-y-6">
      <WebCrawl
        enableCrawl={enableCrawl}
        setEnableCrawl={setEnableCrawl}
        setSelectedCrawlLevel={setSelectedCrawlLevel}
        selectedCrawlLevel={selectedCrawlLevel}
      />

      <div className="space-y-4">
        <Label htmlFor="url-input">Website URL *</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="url-input"
            placeholder="Enter URL"
            value={newUrl || ""}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addUrl}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {urls && urls.length > 0 && (
          <div className="space-y-2">
            <Label className="font-medium">Added URLs:</Label>
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between border rounded-md px-3 bg-gray-50"
              >
                <span className="text-sm truncate">{url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(index)}
                >
                  <Trash className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



interface ScheduleConfigProps {
  onBack: () => void;
}

const ScheduleConfig: React.FC<ScheduleConfigProps> = ({ onBack }) => {
  const {
    syncType,
    setSyncType,
    syncTime,
    setSyncTime,
    startTime,
    setStartTime,
    timeZone,
    setTimeZone,
    handleSaveSchedule,
    editingConfiguration,
    isSaveLoading
  } = usePeriodicSyncStore();


  const showSelectTime = syncType === "periodic";
  const showTimeInputs = syncType === "periodic" && syncTime === "everyday";
const [open, setOpen] = useState(false)
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [maxContentHeight, setMaxContentHeight] = useState<number | undefined>(undefined);

  // Effect to capture the maximum height of the content wrapper
  useEffect(() => {
    if (contentWrapperRef.current && syncType === "periodic" && syncTime === "everyday" && maxContentHeight === undefined) {
      setMaxContentHeight(contentWrapperRef.current.scrollHeight);
    }
  }, [syncType, syncTime, maxContentHeight]);


  // Pre-populate form when editingConfiguration changes
  useEffect(() => {
    if (editingConfiguration) {
     const type = editingConfiguration.scheduler?.type;
setSyncType(type === "onetime" ? "one-time" : type === "scheduler" ? "periodic" : "one-time");

      setSyncTime(editingConfiguration.scheduler?.cron_expression === "0 * * * *" ? "hour" : "everyday");
      setStartTime(editingConfiguration.scheduler?.time || "");
      setTimeZone(editingConfiguration.scheduler?.timezone || "");
    }
  }, [editingConfiguration, setSyncType, setSyncTime, setStartTime, setTimeZone]);


  return (
    <div className="flex flex-col h-[calc(100vh-260px)]"> {/* Outer container for ScheduleConfig, ensuring it takes full available height */}
      
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Sync Schedule Configuration
      </h3>

      {/* Main scrollable content area */}
      <div 
        className="flex-1 overflow-y-auto"
      >
        <div
          ref={contentWrapperRef}
          className="space-y-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          style={{ minHeight: maxContentHeight ? `calc(${maxContentHeight}px)` : 'auto' }} // minHeight for content stability
        >
          {/* Select Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Select Type
            </Label>
            <RadioGroup
              value={syncType}
              onValueChange={setSyncType}
              className="flex items-center gap-6"
            >
              <label
                htmlFor="one-time"
                className="flex items-center gap-2 cursor-pointer group"
              >
                <RadioGroupItem
                  value="one-time"
                  id="one-time"
                  className="border-gray-400 group-hover:border-blue-500"
                />
                <span
                  className={`text-sm ${
                    syncType === "one-time" ? "font-medium" : "text-gray-700"
                  }`}
                >
                  One-time
                </span>
              </label>

              <label
                htmlFor="periodic"
                className="flex items-center gap-2 cursor-pointer group"
              >
                <RadioGroupItem
                  value="periodic"
                  id="periodic"
                  className="border-gray-400  group-hover:border-blue-500"
                />
                <span
                  className={`text-sm ${
                    syncType === "periodic" ? " font-medium" : "text-gray-700"
                  }`}
                >
                  Periodic
                </span>
              </label>
            </RadioGroup>
          </div>

          {/* Select Time (only if periodic) */}
          {showSelectTime && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Select Time
              </Label>
              <RadioGroup
                value={syncTime}
                onValueChange={setSyncTime}
                className="flex items-center gap-6"
              >
                <label
                  htmlFor="hour"
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <RadioGroupItem
                    value="hour"
                    id="hour"
                    className="border-gray-400  group-hover:border-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      syncTime === "hour" ? "text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    Every Hour
                  </span>
                </label>

                <label
                  htmlFor="everyday"
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <RadioGroupItem
                    value="everyday"
                    id="everyday"
                    className="border-gray-400 group-hover:border-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      syncTime === "everyday" ? "font-medium" : "text-gray-700"
                    }`}
                  >
                    Every Day
                  </span>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Start Time + Time Zone (only if periodic + everyday) */}
          {showTimeInputs && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
<div>
  <Label className="text-sm font-medium text-gray-700 mb-2 block">
    Time Zone
  </Label>
  <Popover open={open} onOpenChange={setOpen} >
    <PopoverTrigger asChild >
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between text-gray-700"
      >
      <span className="flex-1 text-left truncate pr-2">
    {timeZone
      ? timeZoneData.find((tz) => tz.value === timeZone)?.text
      : "Select time zone"}
  </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-0 bg-white">
      <Command>
        <CommandInput placeholder="Search timezone..." className="h-9" />
        <CommandEmpty>No timezone found.</CommandEmpty>
        {/* Add scrollable container */}
        <div className="max-h-[200px] overflow-y-auto bg-white">
          <CommandGroup>
            {timeZoneData.map((tz) => (
              <CommandItem
                key={tz.value}
                value={tz.text}
                onSelect={() => {
                  setTimeZone(tz.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    timeZone === tz.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {tz.text}
              </CommandItem>
            ))}
          </CommandGroup>
        </div>
      </Command>
    </PopoverContent>
  </Popover>
</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - now simply at the bottom of the flex container */}
      <div className="w-full bg-white border-t flex justify-end gap-3 py-3 px-4 shadow-top mt-auto"> {/* mt-auto pushes it to the bottom */}
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          onClick={handleSaveSchedule}
          disabled={isSaveLoading}
        >
         {isSaveLoading ? ( // Conditionally render loader or text
         <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving
         </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
};




const NotionPageItem: React.FC<{
  page: any;
  level: number;
  onToggleExpand: (pageId: string) => void;
  onToggleSelect: (page: any) => void;
  isExpanded: boolean;
  isSelected: boolean;
  isLoading?: boolean;
}> = ({
  page,
  level,
  onToggleExpand,
  onToggleSelect,
  isExpanded,
  isSelected,
  isLoading,
}) => {
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) onToggleExpand(page.id);
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all border-2
          ${
            isSelected
              ? "bg-blue-50 border-blue-500 shadow-sm"
              : isLoading
              ? "border-blue-300 bg-blue-50"
              : "border-transparent hover:bg-gray-50"
          }`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onToggleSelect(page)}
      >
        {page.has_children ? (
          <button
            onClick={handleChevronClick}
            className="p-1 hover:bg-gray-200 rounded flex-shrink-0 -ml-1"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            )}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}

        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <span
          className={`truncate flex-1 text-left text-sm font-medium ${
            isSelected ? "text-blue-700" : "text-gray-700"
          }`}
        >
          {page.name}
        </span>
      </div>

      {isExpanded && page.children && page.children.length > 0 && (
        <div className="mt-1">
          {page.children.map((child: any) => (
            <NotionPageItemContainer
              key={child.id}
              page={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};





const NotionPageItemContainer: React.FC<{ page: any; level: number }> = ({ page, level }) => {
  const {
    expandedNotionPages,
    selectedNotionPages,
    loadingNotionPageIds, // Get loading state
    toggleNotionPageExpansion,
    toggleNotionPageSelection,
  } = usePeriodicSyncStore();

  return (
    <NotionPageItem
      page={page}
      level={level}
      onToggleExpand={toggleNotionPageExpansion}
      onToggleSelect={toggleNotionPageSelection}
      isExpanded={expandedNotionPages.has(page.id)}
      isSelected={selectedNotionPages.includes(page.id)}
      isLoading={loadingNotionPageIds.has(page.id)} // Pass loading state
    />
  );
};


const NotionPeriodicSyncConfig: React.FC = () => {
  const {
    notionPages,
    isLoadingNotionPages, // This is only for initial load now
    selectedNotionPages,
    fetchNotionPages,
  } = usePeriodicSyncStore();

  const [isNotionPageSelectOpen, setIsNotionPageSelectOpen] = useState(false);

  useEffect(() => {
    fetchNotionPages(); // Initial load
  }, [fetchNotionPages]);

  return (
    <div className="mt-6">
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Select Notion Pages
        </Label>
        
        <Dialog open={isNotionPageSelectOpen} onOpenChange={setIsNotionPageSelectOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={isLoadingNotionPages} // Only disabled during initial load
            >
              {isLoadingNotionPages ? "Loading pages..." :
               selectedNotionPages.length > 0 ? `${selectedNotionPages.length} page(s) selected` : "Select pages"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Select a Page</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
              {isLoadingNotionPages ? ( // Only show full loader during initial load
                <div className="flex justify-center items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                  <span>Loading pages...</span>
                </div>
              ) : notionPages.length === 0 ? (
                <p className="text-gray-600 text-center">No Notion pages found.</p>
              ) : (
                notionPages.map((page) => (
                  <NotionPageItemContainer key={page.id} page={page} level={0} />
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotionPageSelectOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsNotionPageSelectOpen(false)}
                disabled={selectedNotionPages.length === 0}
              >
                Select ({selectedNotionPages.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};


export const ConfluencePeriodicSyncConfig: React.FC = () => {
  const {
    confluenceSpaces,
    isLoadingConfluenceSpaces,
    selectedConfluenceSpaceKey,
    fetchConfluenceSpaces,
    setSelectedConfluenceSpace,
  } = usePeriodicSyncStore();

  useEffect(() => {
    fetchConfluenceSpaces();
  }, [fetchConfluenceSpaces]);

  return (
    <div className="mt-6">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        Select Workspace
      </Label>

      <Select
        value={selectedConfluenceSpaceKey || ""}
        onValueChange={(value) => {
          const selected = confluenceSpaces.find((s) => s.key === value);
          if (selected) setSelectedConfluenceSpace(selected.key, selected.name);
        }}
        disabled={isLoadingConfluenceSpaces}
      >
        <SelectTrigger className="w-full">
          {isLoadingConfluenceSpaces ? (
            <div className="flex items-center text-gray-600">  
              Loading keys...
            </div>
          ) : (
            <SelectValue placeholder="Select a space" />
          )}
        </SelectTrigger>

        {!isLoadingConfluenceSpaces && (
          <SelectContent className='bg-white'>
            {confluenceSpaces.length === 0 ? (
              <div className="text-gray-500 text-sm p-2 text-center">
                No keys found
              </div>
            ) : (
              confluenceSpaces.map((space) => (
                <SelectItem key={space.key} value={space.key}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{space.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        )}
      </Select>
    </div>
  );
};
//aws or azure 
const CloudStoragePeriodicSyncConfig: React.FC = () => {
  const {
    selectedPlatform,
    cloudStoragePath,
    setCloudStoragePath,
  } = usePeriodicSyncStore();

  return (
    <div className="mt-6 space-y-6">
      <div>
        <Label htmlFor="cloud-storage-path" className="block text-sm font-medium text-gray-700 mb-1">
          Path
        </Label>
        <Input
          id="cloud-storage-path"
          type="text"
          placeholder={`Enter the path (e.g., /my-folder/)`}
          value={cloudStoragePath}
          onChange={(e) => setCloudStoragePath(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};
// New Document360PeriodicSyncConfig component
const Document360PeriodicSyncConfig: React.FC = () => {
  const {
    document360Projects,
    isLoadingDocument360Projects,
    selectedDocument360ProjectId,
    selectedDocument360ProjectName,
    selectedDocument360CategoryIds,
    selectedDocument360CategoryNames,
    fetchDocument360Projects,
    setSelectedDocument360Project,
    toggleDocument360CategorySelection,
  } = usePeriodicSyncStore();

  useEffect(() => {
    fetchDocument360Projects();
  }, [fetchDocument360Projects]);

  const selectedProject = document360Projects.find(p => p.project_id === selectedDocument360ProjectId);
  const availableCategories = selectedProject?.categories || [];

  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [isCategorySelectOpen, setIsCategorySelectOpen] = React.useState(false);

  return (
    <div className="mt-6 space-y-6">
      {/* Select Project */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Select Project
        </Label>
        <Popover open={isProjectSelectOpen} onOpenChange={setIsProjectSelectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isProjectSelectOpen}
              className="w-full justify-between text-gray-700"
              disabled={isLoadingDocument360Projects}
            >
              <span className="flex-1 text-left truncate pr-2">
                {selectedDocument360ProjectName
                  ? selectedDocument360ProjectName
                  : isLoadingDocument360Projects
                  ? "Loading projects..."
                  : "Select a project"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search project..." className="h-9" />
              <CommandEmpty>No project found.</CommandEmpty>
              <div className="max-h-[200px] overflow-y-auto bg-white">
                <CommandGroup>
                  {document360Projects.map((project) => (
                    <CommandItem
                      key={project.project_id}
                      value={project.project_name}
                      onSelect={() => {
                        setSelectedDocument360Project(project.project_id, project.project_name);
                        setIsProjectSelectOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedDocument360ProjectId === project.project_id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {project.project_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Select Categories (Multiselect) */}
   {selectedDocument360ProjectId && (
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-1">
      Select Categories
    </Label>

    {availableCategories.length === 0 ? (
      // 👇 No categories state
      <div className="w-full rounded-md border border-gray-300 p-3 text-sm">
        No categories available 
      </div>
    ) : (
      // 👇 Categories available
      <Popover
        open={isCategorySelectOpen}
        onOpenChange={setIsCategorySelectOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isCategorySelectOpen}
            className="w-full justify-between text-gray-700"
          >
            <span className="flex-1 text-left truncate pr-2">
              {selectedDocument360CategoryNames.length > 0
                ? `${selectedDocument360CategoryNames.length} category(s) selected`
                : "Select categories"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              className="h-9"
            />
            <CommandEmpty>No categories found.</CommandEmpty>

            <div className="max-h-[200px] overflow-y-auto bg-white">
              <CommandGroup>
                {availableCategories.map((category) => (
                  <CommandItem
                    key={category.category_id}
                    value={category.category_name}
                    onSelect={() =>
                      toggleDocument360CategorySelection(
                        category.category_id,
                        category.category_name
                      )
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedDocument360CategoryIds.includes(
                          category.category_id
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.category_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    )}
  </div>
)}

    </div>
  );
};


//my configuration
const MyConfigurationsList: React.FC<ScheduleConfigProps> = ({ onBack }) => { 
  const { 
    myConfigurations, 
    isLoadingMyConfigurations, 
    fetchMyConfigurations,
    startEditingConfiguration,
    setViewingConfigurations,
    stopEditingConfiguration,
    deleteConfiguration,
     deletingConfigId, 
    availablePlatforms
  } = usePeriodicSyncStore();

  const handleBackToPlatformSelection = () => {
    setViewingConfigurations(false); // Hide this list
    stopEditingConfiguration(); // Clear any editing state and reset step
  };

 const getPlatformLogo = (syncType: string) => {
  // Normalize common variations
  let normalizedType = syncType.toLowerCase().trim();

  if (normalizedType.includes("googledrive")) {
    normalizedType = "google";
  }

  const platform = availablePlatforms.find(
    (p) => p.name.toLowerCase() === normalizedType
  );

  if (platform) {
    if (typeof platform.logo === "string") {
      // If logo is a string (e.g., image URL), render an img tag
      return (
        <img
          src={platform.logo}
          alt={platform.name}
          className="h-8 w-8 object-contain"
        />
      );
    } else {
      // If logo is a ReactNode (e.g., Lucide icon), render it directly
      return <img src={weblink} alt="Web Link" className="h-8 w-8 object-contain bg-white" />;

    }
  }

  // Default or fallback icon if no matching platform or logo found
 return <img src={weblink} alt="Web Link" className="h-8 w-8 object-contain bg-white" />;

};

 if (isLoadingMyConfigurations && myConfigurations.length === 0) { // Show loader only if actually fetching AND list is empty
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-700">Loading configurations...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Configurations</h3>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
      
      {myConfigurations.length === 0 ? (
     <div className="flex items-center justify-center h-full">
  <p className="text-gray-600 text-center">
    No periodic sync configurations found.
  </p>
</div>

      ) : (
        <div className="grid gap-4">
         {myConfigurations.map((config) => {
 const isDeleting = deletingConfigId === config.id; 
  return (
    <Card
      key={config.id}
      className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow overflow-x-auto"
    >
      {/* Left: Configuration info */}
     
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getPlatformLogo(config.sync_type)}
                  </div>
                  <div>


<div className="text-sm text-gray-500 truncate">
  {/* Show "Folder Name:" only for non-Notion platforms when data exists */}
   {config.sync_type === "weblink" && Array.isArray(config.creds?.web_links) && config.creds.web_links.length > 0 && (
 <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
  <Link className='h-4 w-4 text-blue-400'/>
  {/* <strong>Web Links:</strong> */}
{config.creds.web_links.map((link: string, index: number) => (
  <React.Fragment key={index}>
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline truncate max-w-[180px] font-normal"
      title={link}
    >
      {link.length > 40 ? `${link.slice(0, 40)}...` : link}
    </a>
    {index < config.creds.web_links.length - 1 && <span>,</span>}
  </React.Fragment>
))}

</div>

  )}
  {(config.sync_type !== "notion") &&
  ((config.sync_type === "googledrive" &&
    Array.isArray(config.creds?.folder_name) &&
    config.creds.folder_name.length > 0) ||
    (config.sync_type === "office365" && config.creds?.path) ||
    (config.creds?.folder_id)) ? (
      <Folder className='h-4 w-4 text-yellow-500 fill-yellow-400 mr-1 inline-block'/>
    // <strong>Folder Name:&nbsp;</strong>
  ) : null}

  {/* Google Drive → folder_name */}
  {Array.isArray(config.creds?.folder_name) && config.creds.folder_name.length > 0 ? (
    <span className="truncate inline-block max-w-full align-middle" title={config.creds.folder_name.join(", ")}>
      {config.creds.folder_name
        .map((name: string) =>
          name.length > 30 ? `${name.slice(0, 20)}...` : name
        )
        .join(", ")}
    </span>
  ) : config.creds?.path ? (
    // Office 365 → path
   <span
    className="truncate inline-block align-middle w-[300px] lg:w-[400px]"
    title={
      Array.isArray(config.creds.path)
        ? config.creds.path.join(", ")
        : config.creds.path
    }
  >
    {Array.isArray(config.creds.path)
      ? config.creds.path
          .map((p: string) =>
            p.length > 30 ? `${p.slice(0, 20)}...` : p
          )
          .join(", ")
      : config.creds.path.length > 30
        ? `${config.creds.path.slice(0, 20)}...`
        : config.creds.path}
  </span>
  ) : config.sync_type === "notion" && config.creds?.page_or_database_name ? (
    // Notion → page_or_database_name (no "Folder Name:" label)
    Array.isArray(config.creds.page_or_database_name) ? (
      <>
      <Folder className='h-4 w-4 text-yellow-500 fill-yellow-400 mr-1 inline-block'/>
      <span className="truncate inline-block max-w-full align-middle" title={config.creds.page_or_database_name.join(", ")}>
        {config.creds.page_or_database_name
          .map((page: string) =>
            page.length > 30 ? `${page.slice(0, 20)}...` : page
          )
          .join(", ")}
      </span>
      </>
    ) : (
      <span className="truncate inline-block max-w-full align-middle" title={config.creds.page_or_database_name}>
        {config.creds.page_or_database_name.length > 30
          ? `${config.creds.page_or_database_name.slice(0, 20)}...`
          : config.creds.page_or_database_name}
      </span>
    )
  ) : config.creds?.folder_id ? (
    // Fallback → folder_id
    Array.isArray(config.creds.folder_id) ? (
      <span className="truncate inline-block max-w-full align-middle" title={config.creds.folder_id.join(", ")}>
        {config.creds.folder_id
          .map((id: string) =>
            id.length > 30 ? `${id.slice(0, 20)}...` : id
          )
          .join(", ")}
      </span>
    ) : (
      <span className="truncate inline-block max-w-full align-middle" title={config.creds.folder_id}>
        {config.creds.folder_id.length > 30
          ? `${config.creds.folder_id.slice(0, 20)}...`
          : config.creds.folder_id}
      </span>
    )
  ) : null}
</div>



{config.sync_type === "document360" &&
  (config.creds?.project_name ||
    (Array.isArray(config.creds?.category_name) &&
      config.creds.category_name.length > 0)) && (
    <div className="flex flex-col gap-1 max-w-full">
      {/* Project Name */}
      {config.creds?.project_name && (
        <span
          className="truncate inline-block max-w-full text-sm font-medium"
          title={config.creds.project_name}
        >
          {config.creds.project_name.length > 30
            ? `${config.creds.project_name.slice(0, 20)}...`
            : config.creds.project_name}
        </span>
      )}

{/* Category Names */}
{Array.isArray(config.creds?.category_names) &&
  config.creds.category_names.length > 0 && (
    <span
      className="flex items-center gap-1 truncate max-w-full text-xs text-gray-500"
      title={config.creds.category_names.join(", ")}
    >
      <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />

      <span className="truncate">
        {config.creds.category_names
          .map((name: string) =>
            name.length > 30 ? `${name.slice(0, 20)}...` : name
          )
          .join(", ")}
      </span>
    </span>
  )}

    </div>
  )}


    {/* Application Emails */}
    {Array.isArray(config.creds?.application_email) &&
      config.creds.application_email.length > 0 && (
        <div className="text-sm text-gray-500 flex flex-col gap-1 mt-1">
          {config.creds.application_email.map((email: string, index: number) => (
            <p
              key={index}
              className="flex items-center gap-1 text-gray-500 truncate"
              title={email}
            >
              <Mail className="h-4 w-4 text-blue-400" />
              {email}
            </p>
          ))}
        </div>
      )}


                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User2 className="h-4 w-4 text-gray-500" />
                      {config.uploaded_by}
                    </p>
                  </div>
                </div>


      {/* Right: Scheduler type + menu */}
      <div className="flex items-center gap-3">
        {/* Stack of scheduler info */}
        <div className="flex flex-col items-end text-right">
  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
    {config.scheduler?.type?.toLowerCase() === "scheduler" ? (
      <>
        <Calendar className="h-4 w-4 text-blue-600" />
        <span>Scheduler</span>
      </>
    ) : (
      <>
        <Clock className="h-4 w-4 text-blue-600" />
        <span>Onetime</span>
      </>
    )}
  </div>
  <p className="text-xs text-gray-500">
    <ISTTime utcString={config.updated} />
  </p>
</div>


        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
               {isDeleting ? ( // Conditionally render Loader2 or MoreVertical
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-36 bg-white rounded-xl shadow-lg border border-gray-100 p-1"
          >
            <DropdownMenuItem
              onClick={() => startEditingConfiguration(config)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <Edit className="h-4 w-4 text-gray-600" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
            onClick={() =>   deleteConfiguration(config.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
})}
        </div>
      )}
    </div>
  );
};

interface PeriodicSyncProps {
  onCancel?: () => void;
}

export const PeriodicSync: React.FC<PeriodicSyncProps> = ({ onCancel }) => {
  const {
    availablePlatforms,
    isLoadingPlatforms,
    error,
    selectedPlatform,
    setSelectedPlatform,
    step,
    setStep,
    fetchPlatforms,
    handleNextStep,
     viewingConfigurations, // Get from store
    setViewingConfigurations, // Get from store
    editingConfiguration, // Get from store
    stopEditingConfiguration,
    fetchMyConfigurations,
     isNextLoading,
  } = usePeriodicSyncStore();

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);
  useEffect(() => {
    fetchMyConfigurations(); // Fetch when this component mounts
  }, [fetchMyConfigurations]);
  if (isLoadingPlatforms && availablePlatforms.length ===0) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-700">Loading platforms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  const handleScheduleBack = () => {
    if (editingConfiguration) {
      stopEditingConfiguration(); 
    } else {
      setStep(1); 
    }
  };
  if (step === 2) {
    return <ScheduleConfig onBack={handleScheduleBack} />;
  }
  if (viewingConfigurations) { // Simplified condition: if viewingConfigurations is true, show the list
  const handleBackFromConfigurationsList = () => setViewingConfigurations(false); // Go back to platform selection
    return <MyConfigurationsList onBack={handleBackFromConfigurationsList} />;
   }


  
return (
    <div className="flex flex-col h-[80vh]"> {/* full height container */}
   
      <div className="flex-1 overflow-y-auto space-y-6 ">
          <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 hidden sm:inline">Configuration</h3>
        <Button 
          variant="secondary" 
          onClick={() => setViewingConfigurations(true)}
        >
          My Configurations
        </Button>
      </div>
        <h3 className="text-lg font-semibold text-gray-900">Select Platform</h3>

        {availablePlatforms.length === 0 ? (
          <p className="text-gray-600">
            No connected platforms available for periodic sync.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {availablePlatforms.map((platform) => (
              <Card
                key={platform.name}
                className={`flex-shrink-0 w-32 cursor-pointer  ${
                  selectedPlatform === platform.name
                    ? "border-2 border-blue-600 shadow-md"
                    : "border border-gray-200 hover:border-blue-400 hover:shadow-lg"
                }`}
                onClick={() => setSelectedPlatform(platform.name)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 h-28">
                  {typeof platform.logo === "string" ? (
                    <img
                      src={platform.logo}
                      alt={platform.display_name}
                      className="h-12 w-12 object-contain mb-2"
                    />
                  ) : (
                   <img
    src={platform.logo}
    alt={platform.display_name}
    className="h-12 w-12 object-contain rounded-md"
  />
                  )}
                  <p className="text-sm font-medium text-gray-700 text-center">
                    {platform.display_name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedPlatform === "web_link" && <WebLinkPeriodicSyncConfig />}

        {(selectedPlatform === "google" ||
          selectedPlatform === "office365") && <CloudPeriodicSyncConfig />}

        {selectedPlatform === "notion" && <NotionPeriodicSyncConfig />}
         {selectedPlatform === 'confluence' && (
        <ConfluencePeriodicSyncConfig />
      )}
       {(selectedPlatform === 'aws_s3' || selectedPlatform === 'azure_blob_storage' || selectedPlatform === 'minio_storage') && (
        <CloudStoragePeriodicSyncConfig />
      )}
      {selectedPlatform === 'document360' && <Document360PeriodicSyncConfig />}
      {selectedPlatform === 'servicenow' && <ServiceNow />}
      </div>

      {/* Fixed footer buttons */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t flex justify-end gap-3 py-3 px-4">
       
         <Button
          type="button"
          onClick={handleNextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isNextLoading} // Disable button while loading
        >
        <Button
  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
  disabled={isNextLoading}
>
  {isNextLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Syncing
    </>
  ) : (
    "Next"
  )}
</Button>
        </Button>
      </div>
    </div>
  );
};


