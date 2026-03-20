import { useState } from 'react';
import { FileText, Video, Link2, Globe, ExternalLink, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    type: 'document' | 'link' | 'video' | 'stream';
    url: string;
    content?: string;
  };
  onTextSelect: () => void;
  selectedText: string;
}

export const DocumentPreview = ({ document, onTextSelect }: DocumentPreviewProps) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const renderPreview = () => {
    switch (document.type) {
      case 'document':
        return (
          <div className="space-y-4">
            {/* PDF/Document Viewer Simulation */}
            <div 
              className="bg-white rounded-lg p-8 shadow-inner border-2 border-dashed border-muted min-h-[600px]"
              onMouseUp={onTextSelect}
              style={{ fontSize: `${zoom}%` }}
            >
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Q4 2024 Business Strategy Overview</h1>
                
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Executive Summary</h2>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    The Q4 2024 strategy focuses on aggressive market expansion in the EMEA region, 
                    targeting a 25% growth in revenue compared to Q3. This comprehensive plan outlines 
                    key initiatives including product line extension, strategic partnerships, and 
                    operational efficiency improvements.
                  </p>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    Our analysis indicates significant opportunities in the enterprise segment, 
                    with reduced competition and higher profit margins. The strategy emphasizes 
                    sustainable growth while maintaining our commitment to innovation and customer satisfaction.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Market Analysis</h2>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    Current market conditions present a unique opportunity for expansion. Our research 
                    identifies a $12M addressable market in the enterprise segment with 40% less 
                    competition than the consumer market.
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Enterprise market growth rate: 15% YoY</li>
                    <li>Average deal size: $50K (up from $35K)</li>
                    <li>Customer acquisition cost reduced by 20%</li>
                    <li>Customer lifetime value increased by 35%</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Strategic Initiatives</h2>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2 text-blue-800">Phase 1: Foundation (Q4 2024)</h3>
                    <ul className="list-disc pl-4 text-blue-700">
                      <li>Establish EMEA regional office</li>
                      <li>Hire 5 additional enterprise sales representatives</li>
                      <li>Launch partner enablement program</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2 text-green-800">Phase 2: Expansion (Q1 2025)</h3>
                    <ul className="list-disc pl-4 text-green-700">
                      <li>Product line extension rollout</li>
                      <li>Strategic partnership activations</li>
                      <li>Marketing campaign launch</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Risk Assessment</h2>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                    <p className="text-amber-800">
                      <strong>Economic Uncertainty:</strong> Current market volatility may impact 
                      enterprise spending patterns. We recommend maintaining a 15% contingency 
                      budget allocation to mitigate potential delays in customer decision-making.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Video Player</p>
                <p className="text-sm opacity-75">CEO Keynote: Future of Technology</p>
                <Button className="mt-4 bg-white text-black hover:bg-gray-100">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in YouTube
                </Button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-medium mb-2">Video Transcript (AI Generated)</h3>
              <div className="text-sm text-muted-foreground space-y-2 max-h-60 overflow-y-auto">
                <p>"Good morning everyone. Today I want to talk about the future of technology..."</p>
                <p>"We're seeing unprecedented innovation in AI and machine learning..."</p>
                <p>"Our company's vision for the next decade focuses on three key areas..."</p>
              </div>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <Card className="knowledge-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Link2 className="w-5 h-5" />
                    <span>Web Source Preview</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Original
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold mb-2">Industry Report: AI Trends 2024</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive analysis of AI industry trends, adoption rates, and future predictions...
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Industry Report</Badge>
                    <Badge variant="secondary">AI Trends</Badge>
                    <Badge variant="secondary">2024</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle>Extracted Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm">
                  <h4 className="font-medium mb-2">Key Findings</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• AI adoption increased by 67% in enterprise markets</li>
                    <li>• Machine learning investments reached $15.7B globally</li>
                    <li>• 82% of companies plan AI integration by end of 2024</li>
                    <li>• Natural language processing leads adoption categories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="bg-muted rounded-lg p-8 text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Stream Source</p>
            <p className="text-muted-foreground">Live data stream preview</p>
          </div>
        );
    }
  };

  return (
    <Card className="knowledge-card h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {document.type === 'document' && <FileText className="w-5 h-5" />}
            {document.type === 'video' && <Video className="w-5 h-5" />}
            {document.type === 'link' && <Link2 className="w-5 h-5" />}
            {document.type === 'stream' && <Globe className="w-5 h-5" />}
            <span>Original Content</span>
          </CardTitle>
          
          {document.type === 'document' && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderPreview()}
      </CardContent>
    </Card>
  );
};