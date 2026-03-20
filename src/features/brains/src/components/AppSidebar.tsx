import { useState } from "react";
import { Brain, FileText, Link2, Users, Settings, Database, Webhook, BarChart3, Zap, Plus, HelpCircle, Home } from "lucide-react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "OVERVIEW",
    items: [
      { title: "Getting Started", url: "/", icon: Home },
      { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    ]
  },
  {
    title: "COMPANION",
    items: [
      { title: "Meeting Assistants", url: "/meeting-assistants", icon: Users },
      { title: "Revenue AI", url: "/revenue-ai", icon: Zap },
    ]
  },
  {
    title: "AGENTS",
    items: [
      { title: "Common Agents", url: "/common-agents", icon: Brain },
      { title: "Chat Agents", url: "/chat-agents", icon: FileText },
      { title: "Voice Agents", url: "/voice-agents", icon: Users },
      { title: "Email Agents", url: "/email-agents", icon: Link2 },
      { title: "Application Agents", url: "/application-agents", icon: Settings },
    ]
  },
  {
    title: "KNOWLEDGE BASE",
    items: [
      { title: "Brain", url: "/knowledge", icon: Brain },
    ]
  },
  {
    title: "INTEGRATION",
    items: [
      { title: "Applications", url: "/applications", icon: Database },
      { title: "Webhooks", url: "/webhooks", icon: Webhook },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700 font-medium" 
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

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
                <h1 className="text-xl font-bold text-gray-900">thunai</h1>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  V1.0
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${getNavCls(item.url)}`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Version Info */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 by Thunai Technologies. All Rights Reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">V1.0</p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}