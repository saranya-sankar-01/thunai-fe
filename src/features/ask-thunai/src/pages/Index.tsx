import { ChatLayout } from "../components/chat/ChatLayout";
import { DrivePermissionsProvider } from "../components/chat/DrivePermissionsProvider";
import { ResearchLayout } from "../components/Research/ResearchLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SettingsPanel } from "../components/chat/SettingsPanel";
import { PanelLeftClose, PanelLeft, Menu, Sparkles } from "lucide-react";
import thunaiLogoIcon from "@/assets/thunai-logo-icon.png";
import { useState, createContext, useContext } from "react";
import { getLocalStorageItem } from "@/services/authService";

// Create context for sidebar toggle
interface SidebarContextType {
  sidebarVisible: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarVisible: true,
  toggleSidebar: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

const Index = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
const userInfo = getLocalStorageItem("user_info") || {};
console.log("User Info in Index.tsx:", userInfo);
  return (
    <DrivePermissionsProvider>
      <SidebarContext.Provider value={{ sidebarVisible, toggleSidebar }}>
        <div className="h-screen flex flex-col bg-background p-2">
          {/* Centralized Header */}
        

          {/* Tabs and Content */}
          {/* Tabs and Content */}
<div className="flex-1 overflow-hidden">

  <Tabs 
    value={activeTab} 
    onValueChange={(value) => {setActiveTab(value)
      if(!sidebarVisible){
        toggleSidebar();
      }
    }}
    className="h-full flex flex-col"
  >

    {/* Tab Selector */}
    {/* <div className="border-b bg-card p-2 w-full  justify-between grid grid-cols-2">

      <TabsList className="flex w-[300px] rounded-xl bg-gray-100 shadow-inner">

        <TabsTrigger
          value="chat"
          className="
            flex-1 rounded-lg px-4 py-2 text-sm font-medium
            data-[state=active]:bg-white
            data-[state=active]:shadow
            data-[state=active]:text-black
            text-gray-500
            transition-all
          "
        >
          Chat
        </TabsTrigger>

        <TabsTrigger
          value="research"
          className="
            flex-1 rounded-lg px-4 py-2 text-sm font-medium
            data-[state=active]:bg-white
            data-[state=active]:shadow
            data-[state=active]:text-black
            text-gray-500
            transition-all
          "
        >
          Research
        </TabsTrigger>

      </TabsList>
      <div className="border-b border-border bg-card p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden hover:bg-accent/10 h-8 w-8 p-0"
                  title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                >
                  {sidebarVisible ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
                <img
                  src={thunaiLogoIcon}
                  alt="Thunai"
                  className="h-4 w-4 object-contain"
                />
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {activeTab === "chat" ? "Ask Thunai" : "Thunai Intelligence"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 mr-[2px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="hidden md:flex h-8 w-8 p-0"
                  title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                >
                  {sidebarVisible ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                </Button>
                <SettingsPanel />
              </div>
            </div>
          </div>
    </div> */}
<div className="border-b bg-card px-4 py-2 w-full flex items-center justify-between">

  {/* LEFT SIDE → Tabs + Logo + Title */}
  <div className="flex items-center gap-6">

    {/* Tabs */}
    {/* <TabsList className="flex w-[280px] rounded-xl bg-gray-100 shadow-inner p-1">

      <TabsTrigger
        value="chat"
        className="
          flex-1 rounded-lg px-4 py-2 text-sm font-medium
          data-[state=active]:bg-white
          data-[state=active]:shadow
          data-[state=active]:text-black
          text-gray-500
          transition-all
        "
      >
        Chat
      </TabsTrigger>

      <TabsTrigger
        value="research"
        className="
          flex-1 rounded-lg px-4 py-2 text-sm font-medium
          data-[state=active]:bg-white
          data-[state=active]:shadow
          data-[state=active]:text-black
          text-gray-500
          transition-all
        "
      >
        Research
      </TabsTrigger>

    </TabsList> */}

    {/* Logo + Title */}
    <div className="flex items-center gap-3">
{activeTab === "chat" ? (<img
        src={thunaiLogoIcon}
        alt="Thunai"
        className="h-4 w-4 object-contain"
      />) : <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="h-3 w-3 text-white" />
              </div>}
      

      <h1 className="text-lg font-semibold text-foreground">
        {/* Ask Thunai */}
        {activeTab === "chat" ? "Ask Thunai" : "Thunai Intelligence"}
      </h1>

    </div>
  </div>

  {/* RIGHT SIDE → Buttons */}
  <div className="flex items-center gap-2">

    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="md:hidden hover:bg-accent/10 h-8 w-8 p-0"
      title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
    >
      {sidebarVisible ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <Menu className="h-4 w-4" />
      )}
    </Button>

    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="hidden md:flex h-8 w-8 p-0"
      title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
    >
      {sidebarVisible ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
    </Button>

    <SettingsPanel />

  </div>
</div>

    {/* Tab Contents */}
    <div className="flex-1 h-[60vh] overflow-auto">

      <TabsContent value="chat" className="h-full m-0">
        <ChatLayout />
      </TabsContent>

      <TabsContent value="research" className="h-full m-0">
        <ResearchLayout />
      </TabsContent>

    </div>

  </Tabs>
  
</div>

        </div>
      </SidebarContext.Provider>
    </DrivePermissionsProvider>
  );
};

export default Index;
