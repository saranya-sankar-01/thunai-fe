import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Plus, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Bot 
} from "lucide-react";

const navigationItems = [
  { 
    title: "Create Agents", 
    url: "/", 
    icon: Plus,
    isActive: true 
  },
  { 
    title: "My Agents", 
    url: "/agents", 
    icon: Bot 
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3 
  },
  { 
    title: "Conversations", 
    url: "/conversations", 
    icon: MessageSquare 
  },
  { 
    title: "Team", 
    url: "/team", 
    icon: Users 
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-thunai-primary border-r-0`}
      collapsible="icon"
    >
      <SidebarContent className="bg-thunai-primary">
        {/* Logo/Brand Section */}
        {!collapsed && (
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Thunai</h2>
            <p className="text-sm text-white/70">AI Agent Platform</p>
          </div>
        )}

        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="text-white/70 px-6 pb-2">
            {collapsed ? "" : "Platform"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="w-full justify-start hover:bg-thunai-accent-2/20 data-[active=true]:bg-thunai-accent-2 data-[active=true]:text-white"
                  >
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                          isActive 
                            ? "bg-thunai-accent-2 text-white font-medium" 
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`
                      }
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-0"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}