
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Bell, 
  Timer, 
  Settings,
  LogOut,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Video,
  FileText,
  Search,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';
import { getLocalStorageItem, setLocalStorageItem } from '../../services/auth';
import { requestApi } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useSidebarState } from '@/hooks/useSidebarState';
import Askthunai from '@/features/ask-thunai/app';
// import logo from '../../assets/images/branding/thunai-logo-light.png';
import { menu } from '@/constants/menu-folder';
const logo ="https://images.hdsupplysolutions.com/image/upload/v1619948796/MarketingAssets/onsite/promotions/Logo/cmyk/png/HDS_4CB_CMYK.png"

// Folder structure (move this to a separate file later)
const folderStructure = menu;

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isCollapsed, toggleSidebar: toggleSidebarState, setCollapsed } = useSidebarState();
  const askThunaiPreviousSidebarState = useRef<boolean | null>(null);
  
  // Check if we're on settings page
  const isSettingsPage = location.pathname.startsWith('/settings');
  
  // State management
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [folders, setFolders] = useState(folderStructure);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantsLoader, setTenantsLoader] = useState(true);
  const [notificationCount] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [version] = useState('1.0.0');

  // Refs
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const tenantMenuRef = useRef<HTMLDivElement>(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load user info
  useEffect(() => {
    const user = getLocalStorageItem('user_info');
    setUserInfo(user);
    
    if (user?.subscription) {
      calculateTrialDetails(user);
    }
  }, []);

  // Highlight active menu based on route
  useEffect(() => {
    highlightActiveMenu();
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target as Node)) {
        setShowTenantMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateTrialDetails = (user: any) => {
    if (!user?.subscription || !user.expires_in) return;
    
    const expirationDate = new Date(user.expires_in);
    const currentDate = new Date();
    const days = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(days);
  };

  const getTenants = async (filter: any = []) => {
    if (tenantSearch) {
      setTenantsLoader(false);
    } else {
      setTenantsLoader(true);
    }

    const payload = {
      filter: filter,
      page: {
        size: 100,
        page_number: 1,
      },
      sort: 'asc',
    };

    try {
      const response = await requestApi(
        'POST',
        'tenant/filter/',
        payload,
        'accountService'
      );
      
      setTenantsLoader(false);
      setTenants(response?.data || []);
      console.log('Tenants data:', response?.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenantsLoader(false);
    }
  };

  const highlightActiveMenu = () => {
    const currentPath = location.pathname;
    folders.forEach(folder => {
      folder.subfolders.forEach(subfolder => {
        if (currentPath.includes(subfolder.link)) {
          setSelectedFolder(subfolder.name);
        }
      });
    });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      toggleSidebarState();
    }
  };

  const handleAskThunaiOpenChange = (isOpen: boolean) => {
    if (isMobile) return;

    if (isOpen) {
      askThunaiPreviousSidebarState.current = isCollapsed;
      setCollapsed(true);
      return;
    }

    if (askThunaiPreviousSidebarState.current !== null) {
      setCollapsed(askThunaiPreviousSidebarState.current);
      askThunaiPreviousSidebarState.current = null;
    }
  };

  const toggleFolder = (folderIndex: number) => {
    const newFolders = [...folders];
    newFolders[folderIndex].isOpen = !newFolders[folderIndex].isOpen;
    setFolders(newFolders);
  };

  const selectItem = (item: any) => {
    setSelectedFolder(item.name);
    
    // Special handling for Reflect AI
    if (item.name === 'Reflect AI') {
      const encryptedParams = `data=${encodeURIComponent(localStorage.getItem('user_info') || '')}`;
      const reflectUrl = (window as any).env?.REFLECT_URL || 'https://reflect.thunai.ai';
      const url = `${reflectUrl}?${encryptedParams}`;
      console.log("reflect url", url);
      window.open(url, '_blank');
    } 
    // Special handling for Omni
    else if (item.name === 'Omni') {
      const encryptedParams = `data=${encodeURIComponent(localStorage.getItem('user_info') || '')}`;
      const omniUrl = (window as any).env?.OMNI_URL || 'https://omni.thunai.ai';
      const url = `${omniUrl}?${encryptedParams}`;
      console.log("omni url", url);
      window.open(url, '_blank');
    } 
    // Normal navigation for other items
    else {
      navigate(item.link);
    }
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const getInitials = (username: string) => {
    if (!username) return '';
    const names = username.split(' ');
    const initials = names.map(name => name[0]).join('');
    return initials.toUpperCase().slice(0, 2);
  };

  const getSelectedTenant = () => {
    if (!tenants.length || !userInfo?.default_tenant_id) return 'Tenants';
    const selected = tenants.find(t => t.tenant_id === userInfo.default_tenant_id);
    return selected?.name || 'Tenants';
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/accounts/login');
  };

  const handleTenantChange = async (tenant: any) => {
    const payload = {
      tenant_id: tenant.tenant_id,
    };

    try {
      const response = await requestApi(
        'PUT',
        'switch/tenant/',
        payload,
        'accountService'
      );

      // Update user info with new tenant
      const updatedUserInfo = {
        ...userInfo,
        default_tenant_id: tenant.tenant_id
      };
      
      setUserInfo(updatedUserInfo);
      setLocalStorageItem('user_info', updatedUserInfo);
      setShowTenantMenu(false);
      setTenantSearch('');
      
      // Show success toast
      toast({
        title: "Success",
        description: response?.message || "Tenant switched successfully",
      });

      // Navigate and reload
      navigate('/meeting-feed/MeetingAssistants');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error: any) {
      console.error('Error switching tenant:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to switch tenant",
        variant: "destructive",
      });
    }
  };

  const filteredTenants = tenants?.filter(tenant =>
    tenant.name?.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  useEffect(() => {
    getTenants();
  }, []);

  // Search tenants with debounce
  useEffect(() => {
    if (tenantSearch) {
      const timer = setTimeout(() => {
        getTenants([
          {
            key_name: "name",
            key_value: tenantSearch,
            operator: "like"
          }
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tenantSearch]);

  // Reset search and fetch all tenants when menu opens
  useEffect(() => {
    if (showTenantMenu) {
      setTenantSearch('');
      getTenants();
    }
  }, [showTenantMenu]);

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header/Navbar */}
      <div className="flex justify-between h-[60px] w-full bg-white z-50 shadow-sm sticky top-0">
        {/* Left side - Logo and Toggle */}
        <div className="flex justify-center min-w-0 space-x-3">
          <div
            className={`flex justify-between items-center px-4 py-2 min-h-[60px] border-r border-[#E9EAEB] transition-all duration-300 ${
              isCollapsed ? 'w-[80px] bg-white' : 'w-64 bg-[#FAFAFA]'
            }`}
          >
            {/* Logo */}
            <div className="flex items-center min-w-0 flex-1">
              {!isCollapsed && (
                <img
                  src={logo}
                  alt="HDS Logo"
                  className="h-10 w-auto max-w-[150px] object-contain ml-2 transition-all duration-300 ease-in-out max-[1050px]:h-6 max-[480px]:ml-1 max-[480px]:max-w-[70px] select-none"
                />
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#E9EAEB] rounded-lg transition-all"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Show logo when collapsed or on settings page */}
          {(isCollapsed) && (
            <img
              src={logo}
              alt="HDS Logo"
              className="h-8 w-auto mt-4 max-w-[150px] object-contain ml-2 transition-all duration-300 ease-in-out max-[1050px]:block max-[768px]:h-6 max-[480px]:max-w-[80px] select-none"
            />
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex justify-center p-2 items-center gap-2">
          {/* Request Demo - Desktop only */}
          {/* {!isMobile && userInfo?.subscription?.name !== 'enterprise' && (
            <a
              href="https://www.thunai.ai/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs lg:text-sm bg-white text-black font-semibold p-2 rounded-lg shadow border border-gray-300 hover:border-blue-500"
            >
              <PlayCircle className="w-4 h-4" />
              Request Demo
            </a>
          )} */}

          {/* Trial Banner - Desktop only */}
          {/* {!isMobile && userInfo?.subscription?.name !== 'enterprise' && daysLeft > 0 && daysLeft <= 10 && (
            <div className="inline-flex items-center bg-lime-200 text-black text-xs lg:text-sm px-3 py-2 rounded-full">
              <Timer className="w-5 h-5 mr-1" />
              Free trial ends in <span className="font-bold ml-1">{daysLeft} days</span>
            </div>
          )} */}

          {/* Upgrade Button */}
          {/* {!isMobile && daysLeft === 0 && userInfo?.subscription?.name !== 'premium' && userInfo?.subscription?.name !== 'enterprise' && (
            <button
              onClick={() => navigate('/settings/subscription-overview')}
              className="flex items-center gap-2 text-xs lg:text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
            >
              Upgrade
            </button>
          )} */}

          {/* Tenant Display */}
          <div className="relative" ref={tenantMenuRef}>
            <button
              onClick={() => setShowTenantMenu(!showTenantMenu)}
              className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full shadow-sm hover:from-blue-100 hover:to-blue-200 transition-all"
            >
              {tenantsLoader && tenants.length === 0 ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-600 font-medium ml-1">Loading...</span>
                </>
              ) : (
                <>
                  <span className="text-sm text-blue-600 font-medium">{getSelectedTenant()}</span>
                  <ChevronRight className={`w-4 h-4 ml-1 text-blue-600 transition-transform ${showTenantMenu ? 'rotate-90' : ''}`} />
                </>
              )}
            </button>

            {/* Tenant Dropdown Menu */}
            {showTenantMenu && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-xl border w-80 z-50">
                <div className="p-2 max-h-[500px] overflow-auto">
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Project"
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tenant List */}
                  {tenantsLoader ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredTenants.length > 0 ? (
                    <div className="space-y-1">
                      {filteredTenants.map((tenant) => (
                        <button
                          key={tenant.tenant_id}
                          onClick={() => handleTenantChange(tenant)}
                          className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-left transition-colors ${
                            tenant.tenant_id === userInfo?.default_tenant_id
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {tenant.tenant_id === userInfo?.default_tenant_id ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm">{tenant.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No projects available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-xl border w-80 max-h-96 overflow-y-auto z-50">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center text-white font-semibold text-sm shadow-md transition-all"
            >
              {getInitials(userInfo?.profile?.username || '')}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-xl border w-64 z-50">
                {/* User Info */}
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {getInitials(userInfo?.profile?.username || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {userInfo?.profile?.username}
                      </div>
                      {userInfo?.profile?.emailid && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {userInfo.profile.emailid}
                        </div>
                      )}
                      {userInfo?.profile?.role && (
                        <div className="text-xs text-gray-600 mt-0.5 capitalize">
                          {userInfo.profile.role}
                        </div>
                      )}
                      {userInfo?.subscription?.name && userInfo?.subscription?.name !== 'enterprise' && (
                        <span className="inline-block text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full mt-1 font-medium border border-blue-200">
                          {userInfo.subscription.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => navigate('/settings/projects')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>

                {/* Mobile-only items */}
                {/* {isMobile && (
                  <div className="p-2 border-t">
                    <a
                      href="https://www.thunai.ai/demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs bg-white text-black font-bold p-2 rounded-lg shadow border mb-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Request Demo
                    </a>

                    {daysLeft > 0 && daysLeft <= 10 && (
                      <div className="flex items-center bg-lime-200 text-black text-xs p-2 rounded-full mb-2">
                        <Timer className="w-3 h-3 mr-1" />
                        Free trial ends in {daysLeft} days
                      </div>
                    )}
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && isSettingsPage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar - Hide on settings page */}
        {!isSettingsPage && (
        <div
          className={`bg-[#FAFAFA] fixed left-0 z-50 h-[calc(100vh-60px)] flex flex-col border-r border-[#E9EAEB] transition-all duration-300 ${
            isCollapsed ? 'w-[80px]' : 'w-64'
          } ${
            isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {folders.map((folder, index) => (
                <div key={index} className="mb-4">
                  {/* Folder Header */}
                  <div
                    className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center mb-2`}
                    onClick={() => !isCollapsed && toggleFolder(index)}
                  >
                    {!isCollapsed && (
                      <span className="text-xs text-gray-600 cursor-pointer">
                        {folder.name}
                      </span>
                    )}
                  </div>

                  {/* Subfolders */}
                  {folder.isOpen && (
                    <div className="space-y-1">
                      {folder.subfolders.map((subfolder, subIndex) => {
                        return (
                          <div
                            key={subIndex}
                            onClick={() => selectItem(subfolder)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                              selectedFolder === subfolder.name
                                ? 'bg-[#E8F1FF] text-blue-600'
                                : 'text-gray-700 hover:bg-[#E9EAEB]'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                          >
                            <img
                              src={subfolder.icon}
                              alt={subfolder.name}
                              className={`w-5 h-5 ${
                                selectedFolder === subfolder.name 
                                  ? 'brightness-0 saturate-100 invert-[0.3] sepia-[1] hue-rotate-[180deg]' 
                                  : ''
                              }`}
                              style={
                                selectedFolder === subfolder.name
                                  ? { filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(200deg) brightness(99%) contrast(101%)' }
                                  : {}
                              }
                            />
                            {!isCollapsed && (
                              <span className="text-sm">{subfolder.name}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {index < folders.length - 1 && (
                    <hr className="my-3 border-gray-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            {!isCollapsed && (
              <div className="p-4 border-t text-center text-xs text-gray-600">
                <div>V{version}</div>
                <div className="mt-2">&copy; 2026 by HD Supply®. All Rights Reserved.</div>
                <div className="flex justify-center gap-2 mt-2">
                  <a
                    href="https://hdsupplysolutions.com/s/terms_of_use"
                    target="_blank"
                    className="hover:underline text-primary"
                  >
                    Terms of Service
                  </a>
                  <span>|</span>
                  <a
                    href="https://hdsupplysolutions.com/ns/privacy-policy"
                    target="_blank"
                    className="hover:underline text-primary"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 min-w-0 min-h-0 overflow-auto overflow-x-hidden transition-all duration-300 ${
            isSettingsPage ? 'pl-0' : (isMobile ? 'pl-0' : isCollapsed ? 'pl-[80px]' : 'pl-64')
          }`}
        >
          <div className="min-w-0 min-h-full">
            <Outlet />
          </div>
        </div>
      </div>

      <Askthunai
        isSidebarCollapsed={isCollapsed}
        isSettingsPage={isSettingsPage}
        onOpenChange={handleAskThunaiOpenChange}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Logout Confirmation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};