import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Upload, FileText } from 'lucide-react';

export const MarkdownPreview = () => {
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const sampleMarkdown = `# Sample Markdown
## Features Demo

**Bold text** and *italic text* and ~~strikethrough~~

### Lists
- Item 1
- Item 2
  - Nested item
- Item 3

1. Numbered list
2. Second item

### Code
Inline code: \`console.log("Hello")\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquote
> This is a blockquote
> with multiple lines

### Table
| Feature | Status | Notes |
|---------|--------|-------|
| Headers | ✅ | Working |
| Lists | ✅ | Working |
| Code | ✅ | Working |

### Links
[Visit Example](https://example.com)

---

### Horizontal Rule Above
`;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setRawMarkdown(content);
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    setRawMarkdown(sampleMarkdown);
    setPreviewVisible(true);
  };

  return (
    <Card className="bg-thunai-orange/10 border-thunai-orange/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Markdown Preview (Backend Testing)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload .txt or .md file</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="markdown-input">Raw Markdown Input</Label>
              <Textarea
                id="markdown-input"
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                placeholder="Paste your raw markdown here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setPreviewVisible(true)}
                disabled={!rawMarkdown.trim()}
                className="bg-accent hover:bg-accent/90"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                onClick={loadSample}
                className="hover:bg-thunai-lime/20"
              >
                Load Sample
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            {rawMarkdown.trim() ? (
              <div className="border rounded-lg p-4 bg-card min-h-[300px]">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-0">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      code: ({ className, children, ...props }: any) => {
                        const isInline = !className?.includes('language-');
                        return isInline ? (
                          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                            <code className="text-xs font-mono">{children}</code>
                          </pre>
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-accent pl-4 italic my-2">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                          <table className="min-w-full border-collapse border border-border">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-3 py-2">
                          {children}
                        </td>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          className="text-accent underline hover:text-accent/80"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="border-border my-4" />
                    }}
                  >
                    {rawMarkdown}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No markdown to preview</p>
                <p className="text-sm">Enter some markdown in the Input tab</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};