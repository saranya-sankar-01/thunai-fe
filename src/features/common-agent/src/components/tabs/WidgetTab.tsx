import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"
import { Copy, Eye, Palette, Code, MessageCircle, Smartphone, Monitor, Maximize2, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { AgentData } from "../../types/agent";
import { useToast } from "@/hooks/use-toast";
import { WidgetPreview } from "../WidgetPreview";
import { Upload } from "lucide-react"; // Added Upload icon
import { useRef } from "react"; 
import { uploadFile } from "../../services/documentService";
import { getTenantId, requestApiFromData } from "@/services/authService";
interface WidgetTabProps {
  config: AgentData;
  onChange?: (updates: any) => void;
}

export function WidgetTab({ config, onChange }: WidgetTabProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isUploading, setIsUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const [isUploadingLogo, setIsUploadingLogo] = useState(false);
const logoFileInputRef = useRef<HTMLInputElement>(null);
const baseUrl = import.meta.env.VITE_AGENT_SCRIPT_URL || window['env']['AGENT_SCRIPT_URL'];
    const { toast } = useToast();
    const tenant_id = getTenantId();
  
 const iconList = [
    { name: 'Message', key: 'chat', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732824336/677f92c7d97b4d130b3e2311/mark_unread_chat_alt.svg', bgColor: 'bg-blue-500' },
    { name: 'Support', key: 'support', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732824336/677f92c7d97b4d130b3e2311/support_agent.svg', bgColor: 'bg-green-400' },
    { name: 'Phone', key: 'phone', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732825572/677f92c7d97b4d130b3e2311/phn.svg', bgColor: 'bg-red-400' }, 
    { name: 'Help', key: 'help', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732825572/677f92c7d97b4d130b3e2311/help.svg', bgColor: 'bg-purple-400' },
    { name: 'Assistant', key: 'assistant', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732825572/677f92c7d97b4d130b3e2311/assistant.svg', bgColor: 'bg-violet-400' },
    { name: 'Sparks', key: 'sparks', url: 'https://storage.googleapis.com/thunai-media/media/files/thunai1732825572/677f92c7d97b4d130b3e2311/Group%2015407.svg', bgColor: 'bg-indigo-400' }
  ];
  const updateConfig = (updates: Partial<AgentData['widget']>) => {
    onChange?.({ 
      ...config, 
      widget: { 
        ...config.widget, 
        ...updates 
      } 
    });
  };
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast({ description: "Please upload an image file", variant: "destructive" });
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast({ description: "File size should be less than 2MB", variant: "destructive" });
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    // const result = await uploadFile(formData);
    const response = await requestApiFromData('POST',`${tenant_id}/file/upload/`,formData,"documentService")
const result= response
    const uploadedUrl = result.data?.url;

    if (!uploadedUrl) throw new Error("No URL returned from upload");

    updateConfig({ selectedIconUrl: uploadedUrl });
    toast({ description: "Icon uploaded successfully!" });
  } catch (error) {
    console.error("Upload error:", error);
    toast({ description: "Failed to upload icon. Please try again.", variant: "destructive" });
  } finally {
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};
const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast({ description: "Please upload an image file", variant: "destructive" });
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast({ description: "File size should be less than 2MB", variant: "destructive" });
    return;
  }

  setIsUploadingLogo(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    // const result = await uploadFile(formData);
       const response = await requestApiFromData('POST',`${tenant_id}/file/upload/`,formData,"documentService")
const result= response
    const uploadedUrl =  result.data?.url;

    if (!uploadedUrl) throw new Error("No URL returned from upload");

    updateConfig({ logo: uploadedUrl });
    toast({ description: "Logo uploaded successfully!" });
  } catch (error) {
    console.error("Upload error:", error);
    toast({ description: "Failed to upload logo. Please try again.", variant: "destructive" });
  } finally {
    setIsUploadingLogo(false);
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  }
};
   const generateEmbedCode = () => {
    const embedCode = `<thunai-agent widgetid="${config.widget_id}" sessiontoken=""></thunai-agent>
      <script src="${baseUrl}/vendor.js" type="module"></script>
      <script src="${baseUrl}/main.js" type="module"></script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      description: `Copied!`,
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-thunai-text-primary">Widget Configuration</h2>
        <p className="text-thunai-text-secondary">
          Customize your chat widget appearance and copy the embed code for your website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={config.widget?.theme || 'light'} 
                     onValueChange={(value: any) => {
      // Apply theme-based background color only
      const themeColors = value === 'dark' ? {
        theme: value,
        widget_bg_color: '#000000', // Black background
      } : {
        theme: value,
        widget_bg_color: '#FFFFFF', // White background
      };
      
      updateConfig(themeColors);
    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={config.widget?.border_radius || '8'} 
                    onValueChange={(value: any) => updateConfig({ border_radius: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="4">Small</SelectItem>
                      <SelectItem value="8">Medium</SelectItem>
                      <SelectItem value="10">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>

              <div className="grid grid-cols-2 gap-4">
               
              </div>
{/* Color Scheme Section */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label className="text-base font-medium">Color Scheme</Label>
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => updateConfig({ 
        primary_color: '#3B82F6',
        tertiary_color: '#1E293B', 
        secondary_color: '#DEDEDE',
        widget_bg_color: (config.widget?.theme || 'light') === 'dark' ? '#000000' : '#FFFFFF',
        bot_text: '#000000',
        user_text: '#FFFFFF'
      })}
      className="text-xs text-gray-500 hover:text-gray-700"
    >
    <RefreshCcw/>Reset
    </Button>
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.primary_color || '#3B82F6'}
        onChange={(e) => updateConfig({ primary_color: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">Header Color</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.widget_bg_color || '#FFFFFF'}
        onChange={(e) => updateConfig({ widget_bg_color: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">Widget Background</div>
      </div>
    </div>
      <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.secondary_color || '#DEDEDE'}
        onChange={(e) => updateConfig({ secondary_color: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">Bot Message Background</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.tertiary_color || '#1E293B'}
        onChange={(e) => updateConfig({ tertiary_color: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">User Message Background</div>
      </div>
    </div>  
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.bot_text || '#000000'}
        onChange={(e) => updateConfig({ bot_text: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">Bot Text Color</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Input 
        type="color" 
        value={config.widget?.user_text || '#FFFFFF'}
        onChange={(e) => updateConfig({ user_text: e.target.value })}
        className="w-8 h-8 p-0 border-0 rounded"
      />
      <div>
        <div className="text-sm font-medium">User Text Color</div>
      </div>
    </div>
  </div>
</div>
{/* Widget Icon Selection */}
<div className={`space-y-3 ${!config.widget?.show_beacon ? 'opacity-50 pointer-events-none' : ''}`}>
  <Label className="text-base font-medium">Widget Icon</Label>
  <p className="text-sm text-gray-600">Select an icon for your chat widget</p>
  
  <div className="grid grid-cols-3 gap-3">
    {iconList.map((icon) => (
      <div
        key={icon.key}
        className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
          config.widget?.selectedIconUrl === icon.url 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => updateConfig({selectedIconUrl: icon.url })}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${icon.bgColor} mb-2`}>
          <img 
            src={icon.url} 
            alt={icon.name}
            className="w-6 h-6 filter brightness-0 invert"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <span className="text-xs font-medium text-center">{icon.name}</span>
      </div>
    ))}
  </div>
      {/* Custom Upload Option */}
<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileUpload}
    className="hidden"
  />
  <Button
    variant="outline"
    onClick={() => fileInputRef.current?.click()}
    disabled={isUploading}
    className="w-full"
  >
    <Upload className="h-4 w-4 mr-2" />
    {isUploading ? 'Uploading...' : 'Upload Custom Icon'}
  </Button>
  <p className="text-xs text-gray-500 mt-2">
    PNG, JPG, SVG up to 5KB </p>
</div>
  {/* Show custom uploaded icon */}
                {config.widget?.selectedIconUrl && 
                 !iconList.some(icon => icon.url === config.widget?.selectedIconUrl) && (
                  <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={config.widget.selectedIconUrl} 
                          alt="Custom Icon"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Custom Icon</span>
                        <p className="text-xs text-gray-500">Currently selected</p>
                      </div>
                    </div>
                  </div>
                )}
</div>
{/* Widget Logo Selection - Add this after the Widget Icon Selection section */}
<div className="space-y-3">
  <Label className="text-base font-medium">Widget Logo</Label>
  <p className="text-sm text-gray-600">Upload a custom logo for your chat widget header</p>
  
  {/* Custom Logo Upload */}
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
    <input
      ref={logoFileInputRef}
      type="file"
      accept="image/*"
      onChange={handleLogoUpload}
      className="hidden"
    />
    <Button
      variant="outline"
      onClick={() => logoFileInputRef.current?.click()}
      disabled={isUploadingLogo}
      className="w-full"
    >
      <Upload className="h-4 w-4 mr-2" />
      {isUploadingLogo ? 'Uploading...' : 'Upload Custom Logo'}
    </Button>
    <p className="text-xs text-gray-500 mt-2">
      PNG, JPG, SVG up to 2MB
    </p>
  </div>

  {/* Show uploaded logo preview */}
  {config.widget?.logo && (
    <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-white flex items-center justify-center overflow-hidden">
          <img 
            src={config.widget.logo} 
            alt="Custom Logo"
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium">Custom Logo</span>
          <p className="text-xs text-gray-500">Currently selected</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateConfig({ logo: undefined })}
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
    </div>
  )}
</div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Select 
                  value={config.widget?.widget_position || 'right'} 
                  onValueChange={(value: any) => updateConfig({ widget_position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-2">
                <Label>Template</Label>
                <Select 
                  value={config.widget?.name || 'classic'} 
                  onValueChange={(value: any) => updateConfig({ name: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Morden</SelectItem>

                  </SelectContent>
                </Select>
              </div> */}
 {/* <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea 
                  value={config.widget?.intial_message || ''}
                  onChange={(e) => updateConfig({ intial_message: e.target.value })}
                  rows={3}
                />
                
              </div> */}
              {/* Widget Display Type */}
              <div className="space-y-2">
                <Label>Widget Display Type</Label>
                <Select 
                  value={config.widget?.display_type || "all"} 
                  onValueChange={(value) => updateConfig({ display_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select display type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All</SelectItem>
                    <SelectItem value="icon">Icon Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Add this new Widget Display Text field */}
{config.widget?.display_type !== "icon" && (
  <div className="space-y-2">
    <Label>Widget Display Text</Label>
    <Input 
      value={config.widget?.widget_text || ''}
      onChange={(e) => updateConfig({ widget_text: e.target.value })}
      placeholder="Enter widget display text..."
    />
  </div>
)}
              {/* Enable Reasoning Toggle */}
{/* <div className="flex items-center space-x-2">
  <Switch
    checked={config.widget?.is_reasoning || false}
    onCheckedChange={(checked) => updateConfig({ is_reasoning: checked })}
  />
  <Label>Enable reasoning</Label>
</div> */}
<div className="flex items-center space-x-2">
  <Switch
    checked={config.widget?.show_beacon || false}
    onCheckedChange={(checked) => updateConfig({ show_beacon: checked })}
  />
  <Label>Show widget with Beacon</Label>
</div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
  <WidgetPreview config={config} previewMode={previewMode} />
</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="script" className="space-y-4">
               
                
                <TabsContent value="script" className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-thunai-text-secondary">
                      Add this code before the closing &lt;/body&gt; tag on your website.
                    </p>
                    <Button onClick={generateEmbedCode} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Snippet
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
