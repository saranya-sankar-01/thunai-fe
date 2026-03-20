import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Video, Link2, Globe, Rss, Webhook, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UploadInterfaceProps {
  onUpload?: (files: File[]) => void;
  onSourceAdd?: (source: { type: string; url: string; title?: string }) => void;
}

export const UploadInterface = ({ onUpload, onSourceAdd }: UploadInterfaceProps) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            toast("Files uploaded successfully! Thunai is processing your content.", {
              icon: "🚀"
            });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    onUpload?.(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: true,
  });

  const handleSourceSubmit = (type: string) => {
    if (!sourceUrl.trim()) return;
    
    onSourceAdd?.({
      type,
      url: sourceUrl,
      title: sourceTitle || undefined
    });
    
    setSourceUrl('');
    setSourceTitle('');
    toast(`${type.charAt(0).toUpperCase() + type.slice(1)} source added successfully!`, {
      icon: "✨"
    });
  };

  return (
    <Card className="knowledge-card animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Add Content to Thunai</span>
        </CardTitle>
        <CardDescription>
          Upload documents or add sources to create AI-powered knowledge cards with unique shareable URLs.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="web">Web Sources</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="feeds">Feeds</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer smooth-transition ${
                isDragActive 
                  ? 'border-primary bg-gradient-glow' 
                  : 'border-card-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              
              {uploadProgress !== null ? (
                <div className="space-y-2">
                  <p className="text-primary font-medium">Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full smooth-transition"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Supports PDF, DOCX, PPTX, TXT, Confluence, SharePoint
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="secondary">DOCX</Badge>
                    <Badge variant="secondary">PPTX</Badge>
                    <Badge variant="secondary">TXT</Badge>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="web" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Add Web Source</h3>
              </div>
              
              <Input
                placeholder="Enter URL (e.g., https://example.com/page)"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="thunai-input"
              />
              
              <Input
                placeholder="Optional: Source title or description"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                className="thunai-input"
              />
              
              <Button 
                onClick={() => handleSourceSubmit('web')}
                className="thunai-button w-full"
                disabled={!sourceUrl.trim()}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Add Web Source
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Video className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Add Video Source</h3>
              </div>
              
              <Input
                placeholder="YouTube, Vimeo, or direct video URL"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="thunai-input"
              />
              
              <Input
                placeholder="Optional: Video title or description"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                className="thunai-input"
              />
              
              <Button 
                onClick={() => handleSourceSubmit('video')}
                className="thunai-button w-full"
                disabled={!sourceUrl.trim()}
              >
                <Video className="w-4 h-4 mr-2" />
                Add Video Source
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="feeds" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Rss className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Add Live Feed</h3>
              </div>
              
              <Textarea
                placeholder="Webhook URL, RSS feed, or streaming endpoint"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="thunai-input min-h-[80px]"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleSourceSubmit('webhook')}
                  variant="outline"
                  disabled={!sourceUrl.trim()}
                >
                  <Webhook className="w-4 h-4 mr-2" />
                  Webhook
                </Button>
                <Button 
                  onClick={() => handleSourceSubmit('feed')}
                  variant="outline"
                  disabled={!sourceUrl.trim()}
                >
                  <Rss className="w-4 h-4 mr-2" />
                  RSS Feed
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};