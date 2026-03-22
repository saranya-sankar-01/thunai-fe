
import { Brain } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../components/Sidebar";
import { Badge } from "@/components/ui/badge";

import ProjectGrey from "../assets/images/project_grey.svg";
import ProjectsBlue from "../assets/images/projects_blue.svg";
import ConfigurationGrey from "../assets/images/configuration-grey.svg";
import ConfigurationBlue from "../assets/images/configuration-blue.svg";
import UserManagementGrey from "../assets/images/user-management-grey.svg";
import UserManagementBlue from "../assets/images/user-management-blue.svg";
import SubscriptionOverviewGrey from "../assets/images/subscription-overview-grey.svg";
import SubscriptionOverviewBlue from "../assets/images/subscription-overview-blue.svg";
import CustomAgentGrey from "../assets/images/custom-agent-grey.svg";
import CustomAgentBlue from "../assets/images/custom-agent-blue.svg";
import DirectoryGrey from "../assets/images/directory-grey.svg";
import DirectoryBlue from "../assets/images/directory-blue.svg";
import EmailTemplatesGrey from "../assets/images/attach_email-grey.svg";
import EmailTemplatesBlue from "../assets/images/attach_email-blue.svg";
import CustomSettingGrey from "../assets/images/custom-setting-gray.svg";
import CustomSettingBlue from "../assets/images/custom-setting-blue.svg";
import { usePermissions } from "../services/permissionService";


const navigationItems = [
    {
        title: "Projects",
        url: "/settings/projects",
        icon: ProjectGrey,
        iconActive: ProjectsBlue,

    },
    {
        title: "Configuration",
        url: "/settings/configuration",
        icon: ConfigurationGrey,
        iconActive: ConfigurationBlue,
        permissions: ['accounts_admin']
    },
    {
        title: "User Management",
        url: "/settings/user-management",
        icon: UserManagementGrey,
        iconActive: UserManagementBlue,
        permissions: ['accounts_admin']
    },
    {
        title: "Subscription Overview",
        url: "/settings/subscription-overview",
        icon: SubscriptionOverviewGrey,
        iconActive: SubscriptionOverviewBlue,
        permissions: ['payments_admin']
    },
    {
        title: "Custom Agent Page",
        url: "/settings/custom-agent",
        icon: CustomAgentGrey,
        iconActive: CustomAgentBlue,
        permissions: ['chat_agent', 'voice_agent']
    },
    {
        title: "Directory",
        url: "/settings/directory",
        icon: DirectoryGrey,
        iconActive: DirectoryBlue,
        permissions: ['accounts_admin']
    },
    {
        title: "Custom Settings",
        url: "/settings/connect-database",
        icon: CustomSettingGrey,
        iconActive: CustomSettingBlue,
        permissions: ['custom_database']
    },
    {
        title: "Email Templates",
        url: "/settings/email-templates",
        icon: EmailTemplatesGrey,
        iconActive: EmailTemplatesBlue,
        permissions: ['email_template']
    },
    {
        title: "SMTP Templates",
        url: "/settings/smtp-template",
        icon: EmailTemplatesGrey,
        iconActive: EmailTemplatesBlue,
        permissions: ['custom_settings']
    }
];

const AppSidebar: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const { filteredPermissions } = usePermissions();

    const isActive = (path: string) => currentPath === path;
    const getNavCls = (path: string) =>
        isActive(path)
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    const filteredPermission = filteredPermissions;

    const permissionKeys = Object.keys(filteredPermission);

    const hasAccess = (menuItem: Record<string, any>) => {
        if (!menuItem.permissions) return true;
        return menuItem.permissions.some((perm: string) => permissionKeys.includes(perm));
    };


    console.log(filteredPermission);

    return (
        <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
            <SidebarContent className="bg-white border-r border-gray-200">
                {/* Logo Section */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div>
                                {/* <h1 className="text-xl font-bold text-gray-900">thunai</h1>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                    V1.0
                                </Badge> */}
                            </div>
                        )}

                    </div>
                </div>

                {/* Navigation Groups */}
                {navigationItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* {hasAccess(group) &&  */}
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={group.url}
                                            className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${getNavCls(group.url)}`}
                                        >
                                            <img src={isActive(group.url) ? group.iconActive : group.icon} alt={group.title} className="w-4 h-4 flex-shrink-0" />

                                            {!collapsed && <span>{group.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {/* } */}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}

export default AppSidebar